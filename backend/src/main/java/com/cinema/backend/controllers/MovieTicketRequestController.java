package com.cinema.backend.controllers;

import com.cinema.backend.models.MovieTicketRequest;
import com.cinema.backend.repositories.MovieTicketRequestRepository;
import com.cinema.backend.services.CorrespondenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/v1/movie-ticket-request")
public class MovieTicketRequestController {

    @Autowired
    private MovieTicketRequestRepository requestRepository;

    @Autowired
    private CorrespondenceService correspondenceService;

    /**
     * US-001: Submit Movie Ticket Request
     * Validates Movie Name, Show Date, Show Time, and Number of Tickets before
     * submission.
     */
    @PostMapping
    public ResponseEntity<?> submitMovieTicketRequest(@RequestBody MovieTicketRequest request) {
        // Input Validation Rule to ensure accuracy and completeness
        if (request.getMovieName() == null || request.getMovieName().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error",
                            "Validation Failed: Movie Name is required for Movie Ticket Request submission."));
        }
        if (request.getShowDate() == null || request.getShowDate().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error",
                            "Validation Failed: Show Date is required for Movie Ticket Request submission."));
        }
        if (request.getShowTime() == null || request.getShowTime().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error",
                            "Validation Failed: Show Time is required for Movie Ticket Request submission."));
        }
        if (request.getNumberOfTickets() <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Validation Failed: Number of Tickets must be at least 1."));
        }

        // US-002: Availability Stage Verification Logic (Booking Agent Persona)
        // Capture available seats count and seat availability status
        int totalHallCapacity = 64;
        int selectedCount = request.getSelectedSeats() != null ? request.getSelectedSeats().size()
                : request.getNumberOfTickets();
        int remainingAvailableSeats = totalHallCapacity - selectedCount;

        if (remainingAvailableSeats < 0) {
            request.setStage("Availability");
            request.setSeatAvailabilityStatus("UNAVAILABLE");
            request.setAvailableSeatsCount(0);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "error",
                    "Validation Failed: Requested seats exceed remaining show capacity. Booking cannot proceed.",
                    "stage", "Availability",
                    "seatAvailabilityStatus", "UNAVAILABLE",
                    "availableSeatsCount", 0));
        }

        // Advance Case Lifecycle to Availability stage and set properties
        request.setCaseType("Movie Ticket Request");
        request.setStage("Availability");
        request.setSeatAvailabilityStatus("VERIFIED_AVAILABLE");
        request.setAvailableSeatsCount(remainingAvailableSeats);

        // US-003 Business Rule Step: Derive Total Cost from Ticket Price & Ticket Count
        request.calculateTotalCost();

        // US-004: Customer Approval
        request.setBookingStatus("CONFIRMED");

        // Booking Execution Stage: Allocate seats, generate Ticket ID, & update Booking Confirmation Status
        executeBookingStage(request);

        // Save Case Type Instance to Database
        MovieTicketRequest savedCase = requestRepository.save(request);

        // Trigger Correspondence Notification Rule to Customer Persona upon case resolution
        correspondenceService.generateAndSendConfirmationNotification(savedCase);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedCase);
    }

    /**
     * Booking Execution Stage Endpoint:
     * Handles final booking activities including seat allocation, updating booking status,
     * maintaining Booking Confirmation Status, Seat Numbers, and Ticket ID within the case entity.
     */
    @PutMapping("/{id}/execute-booking")
    public ResponseEntity<?> executeBookingStageForCase(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> payload) {
        Optional<MovieTicketRequest> requestOptional = requestRepository.findById(id);
        if (requestOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Movie Ticket Request case not found for ID " + id));
        }

        MovieTicketRequest caseInstance = requestOptional.get();
        executeBookingStage(caseInstance);
        MovieTicketRequest updatedCase = requestRepository.save(caseInstance);

        correspondenceService.generateAndSendConfirmationNotification(updatedCase);

        return ResponseEntity.ok(Map.of(
                "message", "Booking Execution Stage completed successfully.",
                "caseId", updatedCase.getCaseId(),
                "stage", updatedCase.getStage(),
                "ticketId", updatedCase.getTicketId(),
                "bookingConfirmationStatus", updatedCase.getBookingConfirmationStatus(),
                "seatNumbers", updatedCase.getSeatNumbers(),
                "bookingStatus", updatedCase.getBookingStatus(),
                "status", updatedCase.getStatus()
        ));
    }

    private void executeBookingStage(MovieTicketRequest request) {
        request.setStage("Booking Execution");
        request.setBookingStatus("CONFIRMED");
        request.routeWorkQueue();

        // Format seat numbers for final allocation
        String formattedSeats;
        if (request.getSelectedSeats() != null && !request.getSelectedSeats().isEmpty()) {
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < request.getSelectedSeats().size(); i++) {
                sb.append("Seat ").append(request.getSelectedSeats().get(i) + 1);
                if (i < request.getSelectedSeats().size() - 1) {
                    sb.append(", ");
                }
            }
            formattedSeats = sb.toString();
        } else if (request.getSeatNumbers() != null && !request.getSeatNumbers().trim().isEmpty()) {
            formattedSeats = request.getSeatNumbers();
        } else {
            formattedSeats = "Allocated Seats";
        }
        request.setSeatNumbers(formattedSeats);

        // Generate unique Ticket ID
        if (request.getTicketId() == null || request.getTicketId().trim().isEmpty()) {
            String ticketId = "TCK-" + (100000 + (int)(Math.random() * 900000));
            request.setTicketId(ticketId);
        }

        // Set Booking Confirmation Status & final Case Status
        request.setBookingConfirmationStatus("CONFIRMED_AND_ALLOCATED");
        request.setStatus("BOOKED_AND_COMPLETED");
    }

    /**
     * US-004: Approval Stage - Customer Persona Decision Step
     * Confirmed bookings proceed to ticket processing; cancelled requests are
     * resolved without further action.
     */
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> processCustomerApproval(@PathVariable Long id,
            @RequestBody Map<String, String> decisionPayload) {
        Optional<MovieTicketRequest> requestOptional = requestRepository.findById(id);
        if (requestOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Movie Ticket Request case not found for ID " + id));
        }

        MovieTicketRequest caseInstance = requestOptional.get();
        String customerDecision = decisionPayload.getOrDefault("bookingStatus", "CONFIRMED").toUpperCase();

        caseInstance.setStage("Approval");
        caseInstance.setBookingStatus(customerDecision);

        if ("CONFIRMED".equals(customerDecision)) {
            caseInstance.setStatus("CONFIRMED");
            // Proceed to Booking Execution stage
            executeBookingStage(caseInstance);
            MovieTicketRequest updatedCase = requestRepository.save(caseInstance);
            correspondenceService.generateAndSendConfirmationNotification(updatedCase);

            return ResponseEntity.ok(Map.of(
                    "message", "Customer approved booking request. Booking Execution stage completed.",
                    "caseId", updatedCase.getCaseId(),
                    "stage", updatedCase.getStage(),
                    "ticketId", updatedCase.getTicketId(),
                    "bookingConfirmationStatus", updatedCase.getBookingConfirmationStatus(),
                    "seatNumbers", updatedCase.getSeatNumbers(),
                    "bookingStatus", updatedCase.getBookingStatus(),
                    "status", updatedCase.getStatus()));
        } else {
            caseInstance.setStatus("RESOLVED_CANCELLED");
            caseInstance.setBookingConfirmationStatus("CANCELLED");
            // Resolved appropriately without further action
            MovieTicketRequest updatedCase = requestRepository.save(caseInstance);
            return ResponseEntity.ok(Map.of(
                    "message",
                    "Customer cancelled request. Case resolved appropriately with no further action required.",
                    "caseId", updatedCase.getCaseId(),
                    "stage", updatedCase.getStage(),
                    "bookingStatus", updatedCase.getBookingStatus(),
                    "status", updatedCase.getStatus()));
        }
    }

    /**
     * US-009: Fetch Booking SLA details for a Movie Ticket Request case
     * Goal: 1 day, Deadline: 2 days. Evaluates goal missed (approaching deadline)
     * and deadline missed (automatic priority increase).
     */
    @GetMapping("/{id}/sla")
    public ResponseEntity<?> getCaseSlaDetails(@PathVariable Long id) {
        Optional<MovieTicketRequest> requestOptional = requestRepository.findById(id);
        if (requestOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "Movie Ticket Request case not found for ID " + id));
        }

        MovieTicketRequest caseInstance = requestOptional.get();
        caseInstance.evaluateSLA();
        requestRepository.save(caseInstance);

        Map<String, Object> response = new HashMap<>();
        response.put("caseId", caseInstance.getCaseId());
        response.put("caseType", caseInstance.getCaseType() != null ? caseInstance.getCaseType() : "Movie Ticket Request");
        response.put("goalDurationDays", caseInstance.getGoalDurationDays());
        response.put("deadlineDurationDays", caseInstance.getDeadlineDurationDays());
        response.put("slaGoalDate", caseInstance.getSlaGoalDate() != null ? caseInstance.getSlaGoalDate() : new Date());
        response.put("slaDeadlineDate", caseInstance.getSlaDeadlineDate() != null ? caseInstance.getSlaDeadlineDate() : new Date());
        response.put("slaStatus", caseInstance.getSlaStatus() != null ? caseInstance.getSlaStatus() : "WITHIN_SLA");
        response.put("slaFlag", caseInstance.getSlaFlag() != null ? caseInstance.getSlaFlag() : "ON_TRACK");
        response.put("priority", caseInstance.getPriority());
        response.put("createdAt", caseInstance.getCreatedAt() != null ? caseInstance.getCreatedAt() : new Date());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMovieTicketRequestById(@PathVariable Long id) {
        Optional<MovieTicketRequest> requestOptional = requestRepository.findById(id);
        if (requestOptional.isPresent()) {
            MovieTicketRequest caseInstance = requestOptional.get();
            caseInstance.evaluateSLA();
            return ResponseEntity.ok(caseInstance);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Movie Ticket Request case not found for ID " + id));
    }

    @GetMapping
    public ResponseEntity<List<MovieTicketRequest>> getAllMovieTicketRequests() {
        List<MovieTicketRequest> list = requestRepository.findAll();
        for (MovieTicketRequest caseInstance : list) {
            caseInstance.evaluateSLA();
        }
        return ResponseEntity.ok(list);
    }
}

package com.cinema.backend.controllers;

import com.cinema.backend.models.MovieTicketRequest;
import com.cinema.backend.repositories.MovieTicketRequestRepository;
import com.cinema.backend.services.CorrespondenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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

        // Booking Execution Stage: Allocate seats, generate Ticket ID, & update Booking
        // Confirmation Status
        String generatedTicketId = "TCK-" + (100000 + (int) (Math.random() * 900000));
        String formattedSeats = request.getSelectedSeats() != null
                ? request.getSelectedSeats().toString().replaceAll("[\\[\\]]", "")
                : "Allocated Seats";

        request.setStage("Booking Execution");
        request.setTicketId(generatedTicketId);
        request.setSeatNumbers(formattedSeats);
        request.setBookingConfirmationStatus("ALLOCATED_AND_CONFIRMED");
        request.setStatus("BOOKED_AND_COMPLETED");

        // Save Case Type Instance to Database
        MovieTicketRequest savedCase = requestRepository.save(request);

        // Trigger Correspondence Notification Rule to Customer Persona upon case
        // resolution
        correspondenceService.generateAndSendConfirmationNotification(savedCase);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedCase);
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
            // Proceed to ticket processing stage
            MovieTicketRequest updatedCase = requestRepository.save(caseInstance);
            return ResponseEntity.ok(Map.of(
                    "message", "Customer approved booking request. Proceeding to ticket processing.",
                    "caseId", updatedCase.getCaseId(),
                    "stage", updatedCase.getStage(),
                    "bookingStatus", updatedCase.getBookingStatus(),
                    "status", updatedCase.getStatus()));
        } else {
            caseInstance.setStatus("RESOLVED_CANCELLED");
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

    @GetMapping("/{id}")
    public ResponseEntity<?> getMovieTicketRequestById(@PathVariable Long id) {
        Optional<MovieTicketRequest> requestOptional = requestRepository.findById(id);
        if (requestOptional.isPresent()) {
            return ResponseEntity.ok(requestOptional.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Movie Ticket Request case not found for ID " + id));
    }

    @GetMapping
    public ResponseEntity<List<MovieTicketRequest>> getAllMovieTicketRequests() {
        return ResponseEntity.ok(requestRepository.findAll());
    }
}

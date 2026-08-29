package com.cinema.backend.models;

import jakarta.persistence.*;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "movie_ticket_requests")
public class MovieTicketRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long caseId;

    @Column(nullable = false)
    private String caseType = "Movie Ticket Request";

    @Column(nullable = false)
    private String stage = "Booking Request Details";

    // Association with reusable Movie and Show data objects
    private Long movieId;
    private Long showId;

    @Column(nullable = false)
    private String movieName;

    @Column(nullable = false)
    private String showDate;

    @Column(nullable = false)
    private String showTime;

    @Column(nullable = false)
    private int numberOfTickets;

    private double ticketPrice = 200.0;

    private double totalCost;

    private String seatAvailabilityStatus = "PENDING_VERIFICATION";

    private int availableSeatsCount = 64;

    @ElementCollection
    private List<Integer> selectedSeats;

    private String customerName;
    private String customerEmail;

    // Work Queue Routing based on Show Type
    private String showType = "Standard 2D";
    private String workQueue = "STANDARD_BOOKING_WORK_QUEUE";
    private String ticketId;
    private String bookingConfirmationStatus = "PENDING_EXECUTION";
    private String seatNumbers;

    private String bookingStatus = "PENDING_APPROVAL";

    private String status = "SUBMITTED";

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_at", nullable = false, updatable = false)
    private Date createdAt;

    // US-009: Booking SLA Properties (Goal: 1 Day, Deadline: 2 Days)
    private int goalDurationDays = 1;
    private int deadlineDurationDays = 2;

    @Temporal(TemporalType.TIMESTAMP)
    private Date slaGoalDate;

    @Temporal(TemporalType.TIMESTAMP)
    private Date slaDeadlineDate;

    private String slaStatus = "WITHIN_SLA";
    private String slaFlag = "ON_TRACK";
    private int priority = 10; // Initial priority/urgency setting (Standard = 10)

    public MovieTicketRequest() {
    }

    public MovieTicketRequest(String movieName, String showDate, String showTime, int numberOfTickets, double totalCost, List<Integer> selectedSeats, String customerName, String customerEmail) {
        this.movieName = movieName;
        this.showDate = showDate;
        this.showTime = showTime;
        this.numberOfTickets = numberOfTickets;
        this.totalCost = totalCost;
        this.selectedSeats = selectedSeats;
        this.customerName = customerName;
        this.customerEmail = customerEmail;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = new Date();
        long nowMs = this.createdAt.getTime();
        this.slaGoalDate = new Date(nowMs + (1L * 24 * 60 * 60 * 1000));
        this.slaDeadlineDate = new Date(nowMs + (2L * 24 * 60 * 60 * 1000));
        this.evaluateSLA();
    }

    /**
     * Automatically routes booking requests to the correct work queue based on the show type,
     * so that the right team processes each booking.
     */
    public String routeWorkQueue() {
        if (this.showType == null || this.showType.trim().isEmpty()) {
            if (this.movieName != null && (this.movieName.contains("IMAX") || this.movieName.contains("3D") || this.movieName.contains("Kalki"))) {
                this.showType = "IMAX 3D";
            } else if (this.ticketPrice >= 300) {
                this.showType = "VIP Luxury";
            } else {
                this.showType = "Standard 2D";
            }
        }

        String typeUpper = this.showType.toUpperCase();
        if (typeUpper.contains("IMAX") || typeUpper.contains("3D")) {
            this.workQueue = "IMAX_PREMIUM_WORK_QUEUE";
        } else if (typeUpper.contains("VIP") || typeUpper.contains("LUXURY")) {
            this.workQueue = "VIP_CONCIERGE_WORK_QUEUE";
        } else if (this.showTime != null && (this.showTime.contains("10:30 AM") || this.showTime.contains("11:00 AM"))) {
            this.workQueue = "MATINEE_OPERATIONS_WORK_QUEUE";
        } else {
            this.workQueue = "STANDARD_BOOKING_WORK_QUEUE";
        }
        return this.workQueue;
    }

    /**
     * US-009: Evaluates Booking SLA Goal & Deadline against current time.
     * - Goal (1 Day): When goal missed, case is flagged as "APPROACHING_DEADLINE".
     * - Deadline (2 Days): When deadline missed, case priority is automatically increased (+20 urgency boost).
     */
    public void evaluateSLA() {
        this.routeWorkQueue();

        if (this.createdAt == null) {
            this.createdAt = new Date();
        }
        if (this.slaGoalDate == null) {
            this.slaGoalDate = new Date(this.createdAt.getTime() + (1L * 24 * 60 * 60 * 1000));
        }
        if (this.slaDeadlineDate == null) {
            this.slaDeadlineDate = new Date(this.createdAt.getTime() + (2L * 24 * 60 * 60 * 1000));
        }

        if ("BOOKED_AND_COMPLETED".equals(this.status) || "RESOLVED_CANCELLED".equals(this.status)) {
            this.slaFlag = "COMPLETED_WITHIN_RULES";
            return;
        }

        Date now = new Date();

        if (now.after(this.slaDeadlineDate)) {
            this.slaStatus = "DEADLINE_MISSED";
            this.slaFlag = "DEADLINE_MISSED";
            this.priority = 30; // Automatically increased priority (Increased urgency from 10 to 30)
        } else if (now.after(this.slaGoalDate)) {
            this.slaStatus = "GOAL_MISSED";
            this.slaFlag = "APPROACHING_DEADLINE";
            this.priority = 20; // Moderately increased urgency
        } else {
            this.slaStatus = "WITHIN_SLA";
            this.slaFlag = "ON_TRACK";
            this.priority = 10; // Standard initial urgency
        }
    }

    public Long getCaseId() {
        return caseId;
    }

    public void setCaseId(Long caseId) {
        this.caseId = caseId;
    }

    public Long getMovieId() {
        return movieId;
    }

    public void setMovieId(Long movieId) {
        this.movieId = movieId;
    }

    public Long getShowId() {
        return showId;
    }

    public void setShowId(Long showId) {
        this.showId = showId;
    }

    public String getCaseType() {
        return caseType;
    }

    public void setCaseType(String caseType) {
        this.caseType = caseType;
    }

    public String getStage() {
        return stage;
    }

    public void setStage(String stage) {
        this.stage = stage;
    }

    public String getMovieName() {
        return movieName;
    }

    public void setMovieName(String movieName) {
        this.movieName = movieName;
    }

    public String getShowDate() {
        return showDate;
    }

    public void setShowDate(String showDate) {
        this.showDate = showDate;
    }

    public String getShowTime() {
        return showTime;
    }

    public void setShowTime(String showTime) {
        this.showTime = showTime;
    }

    public int getNumberOfTickets() {
        return numberOfTickets;
    }

    public void setNumberOfTickets(int numberOfTickets) {
        this.numberOfTickets = numberOfTickets;
    }

    public double getTicketPrice() {
        return ticketPrice;
    }

    public void setTicketPrice(double ticketPrice) {
        this.ticketPrice = ticketPrice;
    }

    public double getTotalCost() {
        return totalCost;
    }

    public void setTotalCost(double totalCost) {
        this.totalCost = totalCost;
    }

    /**
     * US-003 Business Rule: Derives Total Cost from Ticket Price * Number of Tickets
     */
    public double calculateTotalCost() {
        if (this.ticketPrice <= 0) {
            this.ticketPrice = 200.0;
        }
        this.totalCost = this.ticketPrice * this.numberOfTickets;
        return this.totalCost;
    }

    public String getSeatAvailabilityStatus() {
        return seatAvailabilityStatus;
    }

    public void setSeatAvailabilityStatus(String seatAvailabilityStatus) {
        this.seatAvailabilityStatus = seatAvailabilityStatus;
    }

    public String getTicketId() {
        return ticketId;
    }

    public void setTicketId(String ticketId) {
        this.ticketId = ticketId;
    }

    public String getBookingConfirmationStatus() {
        return bookingConfirmationStatus;
    }

    public void setBookingConfirmationStatus(String bookingConfirmationStatus) {
        this.bookingConfirmationStatus = bookingConfirmationStatus;
    }

    public String getSeatNumbers() {
        return seatNumbers;
    }

    public void setSeatNumbers(String seatNumbers) {
        this.seatNumbers = seatNumbers;
    }

    public String getBookingStatus() {
        return bookingStatus;
    }

    public void setBookingStatus(String bookingStatus) {
        this.bookingStatus = bookingStatus;
    }

    public int getAvailableSeatsCount() {
        return availableSeatsCount;
    }

    public void setAvailableSeatsCount(int availableSeatsCount) {
        this.availableSeatsCount = availableSeatsCount;
    }

    public List<Integer> getSelectedSeats() {
        return selectedSeats;
    }

    public void setSelectedSeats(List<Integer> selectedSeats) {
        this.selectedSeats = selectedSeats;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public int getGoalDurationDays() {
        return goalDurationDays;
    }

    public void setGoalDurationDays(int goalDurationDays) {
        this.goalDurationDays = goalDurationDays;
    }

    public int getDeadlineDurationDays() {
        return deadlineDurationDays;
    }

    public void setDeadlineDurationDays(int deadlineDurationDays) {
        this.deadlineDurationDays = deadlineDurationDays;
    }

    public Date getSlaGoalDate() {
        return slaGoalDate;
    }

    public void setSlaGoalDate(Date slaGoalDate) {
        this.slaGoalDate = slaGoalDate;
    }

    public Date getSlaDeadlineDate() {
        return slaDeadlineDate;
    }

    public void setSlaDeadlineDate(Date slaDeadlineDate) {
        this.slaDeadlineDate = slaDeadlineDate;
    }

    public String getSlaStatus() {
        return slaStatus;
    }

    public void setSlaStatus(String slaStatus) {
        this.slaStatus = slaStatus;
    }

    public String getSlaFlag() {
        return slaFlag;
    }

    public void setSlaFlag(String slaFlag) {
        this.slaFlag = slaFlag;
    }

    public int getPriority() {
        return priority;
    }

    public void setPriority(int priority) {
        this.priority = priority;
    }

    public String getShowType() {
        return showType;
    }

    public void setShowType(String showType) {
        this.showType = showType;
        this.routeWorkQueue();
    }

    public String getWorkQueue() {
        return workQueue;
    }

    public void setWorkQueue(String workQueue) {
        this.workQueue = workQueue;
    }
}

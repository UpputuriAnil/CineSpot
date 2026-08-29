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

    // Booking Execution Stage Properties
    private String ticketId;
    private String bookingConfirmationStatus = "PENDING_EXECUTION";
    private String seatNumbers;

    private String bookingStatus = "PENDING_APPROVAL";

    private String status = "SUBMITTED";

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_at", nullable = false, updatable = false)
    private Date createdAt;

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
}

package com.cinema.backend.services;

import com.cinema.backend.models.MovieTicketRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class CorrespondenceService {

    // Store generated correspondence notifications for customer tracking
    private final Map<Long, String> correspondenceLogs = new ConcurrentHashMap<>();

    /**
     * Correspondence Rule: Generates and dispatches confirmation notification
     * to Customer Persona upon successful booking completion & case resolution.
     */
    public String generateAndSendConfirmationNotification(MovieTicketRequest caseInstance) {
        String customerName = caseInstance.getCustomerName() != null ? caseInstance.getCustomerName() : "Valued Customer";
        String ticketId = caseInstance.getTicketId() != null ? caseInstance.getTicketId() : "TCK-" + caseInstance.getCaseId();
        String seatNumbers = caseInstance.getSeatNumbers() != null ? caseInstance.getSeatNumbers() : caseInstance.getSelectedSeats().toString();

        String notificationMessage = String.format("""
                📩 CORRESPONDENCE NOTIFICATION: BOOKING CONFIRMED
                -------------------------------------------------
                Dear %s,
                
                Your movie ticket booking request (Case ID: #%d) has been successfully confirmed and resolved!
                
                📋 BOOKING CONFIRMATION DETAILS:
                • Case ID: #%d
                • Ticket Tracking ID: %s
                • Movie Name: %s
                • Show Date & Time: %s at %s
                • Allocated Seat Numbers: %s
                • Total Booking Cost: ₹%.2f
                
                Thank you for booking with CineSpot! Your next show awaits.
                -------------------------------------------------
                """,
                customerName,
                caseInstance.getCaseId(),
                caseInstance.getCaseId(),
                ticketId,
                caseInstance.getMovieName(),
                caseInstance.getShowDate(),
                caseInstance.getShowTime(),
                seatNumbers,
                caseInstance.getTotalCost()
        );

        // Store notification for customer review and audit tracking
        if (caseInstance.getCaseId() != null) {
            correspondenceLogs.put(caseInstance.getCaseId(), notificationMessage);
        }

        System.out.println(notificationMessage);
        return notificationMessage;
    }

    public String getNotificationByCaseId(Long caseId) {
        return correspondenceLogs.get(caseId);
    }

    public Map<Long, String> getAllNotifications() {
        return correspondenceLogs;
    }
}

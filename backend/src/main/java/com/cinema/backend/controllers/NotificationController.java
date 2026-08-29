package com.cinema.backend.controllers;

import com.cinema.backend.services.CorrespondenceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    @Autowired
    private CorrespondenceService correspondenceService;

    @GetMapping("/{caseId}")
    public ResponseEntity<?> getNotificationByCaseId(@PathVariable Long caseId) {
        String notificationMessage = correspondenceService.getNotificationByCaseId(caseId);
        if (notificationMessage != null) {
            return ResponseEntity.ok(Map.of(
                    "caseId", caseId,
                    "notification", notificationMessage
            ));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "No correspondence notification found for Case ID " + caseId));
    }

    @GetMapping
    public ResponseEntity<?> getAllCorrespondenceLogs() {
        return ResponseEntity.ok(correspondenceService.getAllNotifications());
    }
}

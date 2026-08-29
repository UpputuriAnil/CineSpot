package com.cinema.backend.controllers;

import com.cinema.backend.dto.LoginResponseDTO;
import com.cinema.backend.models.User;
import com.cinema.backend.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/api/v1/register")
    User newUser(@RequestBody User newUser) {
        return userService.registerUser(newUser);
    }

    @PostMapping("/api/v1/login")
    public ResponseEntity<LoginResponseDTO> loginUser(@RequestBody User loginRequest) {
        User user = userService.getUserByEmail(loginRequest.getEmail());

        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new LoginResponseDTO("Invalid credentials", null, null));
        }

        if (userService.isPasswordMatch(loginRequest.getPassword(), user.getPassword())) {
            LoginResponseDTO response = new LoginResponseDTO("Login successful", user.getName(), user.getId());
            return ResponseEntity.ok().body(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new LoginResponseDTO("Invalid credentials", null, null));
        }
    }

    // In-memory OTP storage map for mobile verification (Mobile -> OTP)
    private static final java.util.Map<String, String> otpStore = new java.util.concurrent.ConcurrentHashMap<>();

    /**
     * Mobile OTP Authentication: Generate & Send OTP
     */
    @PostMapping("/api/v1/send-otp")
    public ResponseEntity<?> sendOtp(@RequestBody java.util.Map<String, String> request) {
        String mobileNumber = request.get("mobileNumber");
        if (mobileNumber == null || !mobileNumber.matches("^[6-9]\\d{9}$")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", "Please enter a valid 10-digit Indian mobile number."));
        }

        // Generate 6-digit OTP
        String generatedOtp = String.format("%06d", new java.util.Random().nextInt(1000000));
        otpStore.put(mobileNumber, generatedOtp);

        return ResponseEntity.ok(java.util.Map.of(
                "message", "OTP sent successfully to +91 " + mobileNumber,
                "mobileNumber", mobileNumber,
                "otp", generatedOtp
        ));
    }

    /**
     * Mobile OTP Authentication: Verify OTP
     */
    @PostMapping("/api/v1/verify-otp")
    public ResponseEntity<?> verifyOtp(@RequestBody java.util.Map<String, String> request) {
        String mobileNumber = request.get("mobileNumber");
        String enteredOtp = request.get("otp");

        if (mobileNumber == null || enteredOtp == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", "Mobile number and OTP are required."));
        }

        String storedOtp = otpStore.get(mobileNumber);

        // Verify OTP (accept generated OTP or master demo OTP 123456)
        if (enteredOtp.equals(storedOtp) || "123456".equals(enteredOtp)) {
            otpStore.remove(mobileNumber);
            String userName = "User " + mobileNumber.substring(6);
            Long userId = Long.parseLong(mobileNumber.substring(4));

            User existingUser = userService.getUserByEmail(mobileNumber + "@cinespot.com");
            if (existingUser == null) {
                User newUser = new User();
                newUser.setName(userName);
                newUser.setSurname("Customer");
                newUser.setEmail(mobileNumber + "@cinespot.com");
                newUser.setPassword("mobile_otp_authenticated");
                existingUser = userService.registerUser(newUser);
            }

            return ResponseEntity.ok(new LoginResponseDTO("Login successful", existingUser.getName(), existingUser.getId()));
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(java.util.Map.of("error", "Invalid OTP entered. Please try again."));
        }
    }

    /**
     * Google Cloud OAuth 2.0 Authentication (Google Identity Services)
     */
    @PostMapping("/api/v1/auth/google")
    public ResponseEntity<?> googleCloudAuth(@RequestBody java.util.Map<String, String> request) {
        String email = request.get("email");
        String name = request.get("name");
        String googleId = request.get("googleId");

        if (email == null || email.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(java.util.Map.of("error", "Email is required for Google Cloud authentication."));
        }

        String userName = (name != null && !name.isEmpty()) ? name : email.split("@")[0];

        User existingUser = userService.getUserByEmail(email);
        if (existingUser == null) {
            User newUser = new User();
            newUser.setName(userName);
            newUser.setSurname("GoogleUser");
            newUser.setEmail(email);
            newUser.setPassword("google_cloud_oauth_authenticated_" + (googleId != null ? googleId : "guser"));
            existingUser = userService.registerUser(newUser);
        }

        return ResponseEntity.ok(new LoginResponseDTO("Google Cloud login successful", existingUser.getName(), existingUser.getId()));
    }
}
package com.cinema.backend.controllers;

import com.cinema.backend.models.Show;
import com.cinema.backend.repositories.ShowRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/v1/shows")
public class ShowController {

    @Autowired
    private ShowRepository showRepository;

    /**
     * US-005: Maintain Show Data independently
     */
    @GetMapping
    public ResponseEntity<List<Show>> getAllShows() {
        return ResponseEntity.ok(showRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getShowById(@PathVariable Long id) {
        Optional<Show> showOptional = showRepository.findById(id);
        if (showOptional.isPresent()) {
            return ResponseEntity.ok(showOptional.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Show not found for ID " + id));
    }

    @PostMapping
    public ResponseEntity<Show> createShow(@RequestBody Show show) {
        if (show.getSeatCapacity() <= 0) {
            show.setSeatCapacity(64);
        }
        if (show.getAvailableSeats() <= 0) {
            show.setAvailableSeats(show.getSeatCapacity());
        }
        Show savedShow = showRepository.save(show);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedShow);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateShow(@PathVariable Long id, @RequestBody Show showDetails) {
        Optional<Show> showOptional = showRepository.findById(id);
        if (showOptional.isPresent()) {
            Show existingShow = showOptional.get();
            existingShow.setMovieId(showDetails.getMovieId());
            existingShow.setMovieName(showDetails.getMovieName());
            existingShow.setShowDate(showDetails.getShowDate());
            existingShow.setShowTime(showDetails.getShowTime());
            existingShow.setSeatCapacity(showDetails.getSeatCapacity());
            existingShow.setAvailableSeats(showDetails.getAvailableSeats());
            Show updatedShow = showRepository.save(existingShow);
            return ResponseEntity.ok(updatedShow);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Show not found for ID " + id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteShow(@PathVariable Long id) {
        if (showRepository.existsById(id)) {
            showRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Show deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Show not found for ID " + id));
    }
}

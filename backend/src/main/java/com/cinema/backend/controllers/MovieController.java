package com.cinema.backend.controllers;

import com.cinema.backend.models.Movie;
import com.cinema.backend.repositories.MovieRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/v1/movies")
public class MovieController {

    @Autowired
    private MovieRepository movieRepository;

    /**
     * US-005: Maintain Movie Data independently
     */
    @GetMapping
    public ResponseEntity<List<Movie>> getAllMovies() {
        return ResponseEntity.ok(movieRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getMovieById(@PathVariable Long id) {
        Optional<Movie> movieOptional = movieRepository.findById(id);
        if (movieOptional.isPresent()) {
            return ResponseEntity.ok(movieOptional.get());
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Movie not found for ID " + id));
    }

    @PostMapping
    public ResponseEntity<Movie> createMovie(@RequestBody Movie movie) {
        Movie savedMovie = movieRepository.save(movie);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedMovie);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateMovie(@PathVariable Long id, @RequestBody Movie movieDetails) {
        Optional<Movie> movieOptional = movieRepository.findById(id);
        if (movieOptional.isPresent()) {
            Movie existingMovie = movieOptional.get();
            existingMovie.setTitle(movieDetails.getTitle());
            existingMovie.setGenre(movieDetails.getGenre());
            existingMovie.setDurationMinutes(movieDetails.getDurationMinutes());
            existingMovie.setLanguage(movieDetails.getLanguage());
            Movie updatedMovie = movieRepository.save(existingMovie);
            return ResponseEntity.ok(updatedMovie);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Movie not found for ID " + id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMovie(@PathVariable Long id) {
        if (movieRepository.existsById(id)) {
            movieRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Movie deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Movie not found for ID " + id));
    }
}

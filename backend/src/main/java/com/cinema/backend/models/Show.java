package com.cinema.backend.models;

import jakarta.persistence.*;

@Entity
@Table(name = "shows")
public class Show {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long movieId;
    private String movieName;
    private String showDate;
    private String showTime;
    private int seatCapacity = 64;
    private int availableSeats = 64;

    public Show() {
    }

    public Show(Long movieId, String movieName, String showDate, String showTime, int seatCapacity, int availableSeats) {
        this.movieId = movieId;
        this.movieName = movieName;
        this.showDate = showDate;
        this.showTime = showTime;
        this.seatCapacity = seatCapacity;
        this.availableSeats = availableSeats;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getMovieId() {
        return movieId;
    }

    public void setMovieId(Long movieId) {
        this.movieId = movieId;
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

    public int getSeatCapacity() {
        return seatCapacity;
    }

    public void setSeatCapacity(int seatCapacity) {
        this.seatCapacity = seatCapacity;
    }

    public int getAvailableSeats() {
        return availableSeats;
    }

    public void setAvailableSeats(int availableSeats) {
        this.availableSeats = availableSeats;
    }
}

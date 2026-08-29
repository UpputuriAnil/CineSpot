package com.cinema.backend.repositories;

import com.cinema.backend.models.MovieTicketRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MovieTicketRequestRepository extends JpaRepository<MovieTicketRequest, Long> {
}

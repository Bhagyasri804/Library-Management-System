package com.library.management.repository;

import com.library.management.model.Reservation;
import com.library.management.model.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    List<Reservation> findByStudentIdAndStatus(Long studentId, ReservationStatus status);

    boolean existsByBookIdAndStudentIdAndStatus(Long bookId, Long studentId, ReservationStatus status);

    long countByStudentIdAndStatus(Long studentId, ReservationStatus status);
}

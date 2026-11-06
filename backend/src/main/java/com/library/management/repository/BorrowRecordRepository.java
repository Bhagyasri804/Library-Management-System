package com.library.management.repository;

import com.library.management.model.BorrowRecord;
import com.library.management.model.BorrowStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, Long> {

    List<BorrowRecord> findByStatusOrderByIssueDateDesc(BorrowStatus status);

    long countByStatus(BorrowStatus status);

    @Query("SELECT r FROM BorrowRecord r WHERE r.status = :status AND (" +
           "LOWER(r.book.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(r.book.isbn) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(r.student.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "LOWER(r.student.email) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<BorrowRecord> searchByStatusAndKeyword(@Param("status") BorrowStatus status, @Param("keyword") String keyword);

    List<BorrowRecord> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    List<BorrowRecord> findByStudentIdAndStatus(Long studentId, BorrowStatus status);
}

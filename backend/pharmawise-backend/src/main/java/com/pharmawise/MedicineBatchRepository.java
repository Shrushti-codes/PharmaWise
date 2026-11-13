
package com.pharmawise;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MedicineBatchRepository
        extends JpaRepository<MedicineBatch, Long> {

    // Fetch batches belonging to a particular user
    List<MedicineBatch> findAllByOwner_Email(String email);

    // Find a batch only if it belongs to the logged-in user
    Optional<MedicineBatch> findByIdAndOwner_Email(Long id, String email);

    // FEFO: fetch eligible batches belonging to the logged-in user
    List<MedicineBatch>
    findByMedicine_IdAndOwner_EmailAndQuantityGreaterThanAndExpiryDateGreaterThanEqualOrderByExpiryDateAsc(
            Long medicineId,
            String email,
            int quantity,
            LocalDate today
    );

    // Total quantity for a medicine belonging to a particular user
    @Query("SELECT COALESCE(SUM(b.quantity), 0) FROM MedicineBatch b " +
           "WHERE b.medicine.id = :medicineId AND b.owner.email = :email")
    int getTotalQuantityByMedicineIdAndOwner(
            @Param("medicineId") Long medicineId,
            @Param("email") String email
    );

    // Low-stock medicines for a particular user
    @Query("SELECT b.medicine.id, b.medicine.name, SUM(b.quantity) " +
           "FROM MedicineBatch b " +
           "WHERE b.owner.email = :email " +
           "GROUP BY b.medicine.id, b.medicine.name " +
           "HAVING SUM(b.quantity) < :threshold")
    List<Object[]> findLowStockMedicinesForUser(
            @Param("threshold") int threshold,
            @Param("email") String email
    );

    // Near-expiry batches for a particular user
    List<MedicineBatch>
    findByOwner_EmailAndExpiryDateBetweenAndQuantityGreaterThanOrderByExpiryDateAsc(
            String email,
            LocalDate startDate,
            LocalDate endDate,
            int quantity
    );

    // Expired batches for a particular user
    List<MedicineBatch>
    findByOwner_EmailAndExpiryDateBeforeAndQuantityGreaterThanOrderByExpiryDateAsc(
            String email,
            LocalDate today,
            int quantity
    );

    // Total stock for a particular user
    @Query("SELECT COALESCE(SUM(b.quantity), 0) FROM MedicineBatch b " +
           "WHERE b.owner.email = :email")
    int getTotalStockForUser(@Param("email") String email);

    // Delete batches only for a particular user's medicine
    void deleteByMedicine_IdAndOwner_Email(Long medicineId, String email);


    // Existing methods retained temporarily for compatibility.
    // We will update their callers to use the secure methods.

    List<MedicineBatch>
    findByMedicine_IdAndQuantityGreaterThanAndExpiryDateGreaterThanEqualOrderByExpiryDateAsc(
            Long medicineId,
            int quantity,
            LocalDate today
    );

    @Query("SELECT COALESCE(SUM(b.quantity), 0) FROM MedicineBatch b " +
           "WHERE b.medicine.id = :medicineId")
    int getTotalQuantityByMedicineId(@Param("medicineId") Long medicineId);

    @Query("SELECT b.medicine.id, b.medicine.name, SUM(b.quantity) " +
           "FROM MedicineBatch b " +
           "GROUP BY b.medicine.id, b.medicine.name " +
           "HAVING SUM(b.quantity) < :threshold")
    List<Object[]> findLowStockMedicines(
            @Param("threshold") int threshold
    );

    List<MedicineBatch>
    findByExpiryDateBetweenAndQuantityGreaterThanOrderByExpiryDateAsc(
            LocalDate startDate,
            LocalDate endDate,
            int quantity
    );

    List<MedicineBatch>
    findByExpiryDateBeforeAndQuantityGreaterThanOrderByExpiryDateAsc(
            LocalDate today,
            int quantity
    );

    @Query("SELECT COALESCE(SUM(b.quantity), 0) FROM MedicineBatch b")
    int getTotalStock();

    void deleteByMedicine_Id(Long medicineId);
}

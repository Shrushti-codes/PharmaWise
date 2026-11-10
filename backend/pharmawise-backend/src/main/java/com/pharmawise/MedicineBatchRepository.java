package com.pharmawise;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface MedicineBatchRepository
        extends JpaRepository<MedicineBatch, Long> {

    List<MedicineBatch>
    findByMedicine_IdAndQuantityGreaterThanAndExpiryDateGreaterThanEqualOrderByExpiryDateAsc(
            Long medicineId,
            int quantity,
            LocalDate today

    );
    @Query("SELECT COALESCE(SUM(b.quantity), 0) FROM MedicineBatch b WHERE b.medicine.id = :medicineId")
    int getTotalQuantityByMedicineId(@Param("medicineId") Long medicineId);
    @Query("SELECT b.medicine.id, b.medicine.name, SUM(b.quantity) " +
       "FROM MedicineBatch b " +
       "GROUP BY b.medicine.id, b.medicine.name " +
       "HAVING SUM(b.quantity) < :threshold")
    List<Object[]> findLowStockMedicines(
        @Param("threshold") int threshold);
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

}

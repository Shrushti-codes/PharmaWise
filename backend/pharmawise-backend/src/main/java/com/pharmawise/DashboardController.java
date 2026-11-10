package com.pharmawise;

import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final MedicineRepository medicineRepository;
    private final MedicineBatchRepository batchRepository;

    public DashboardController(
            MedicineRepository medicineRepository,
            MedicineBatchRepository batchRepository) {

        this.medicineRepository = medicineRepository;
        this.batchRepository = batchRepository;
    }

    @GetMapping("/summary")
    public Map<String, Object> getDashboardSummary() {

        long totalMedicines = medicineRepository.count();

        int totalStock = batchRepository.getTotalStock();

        int lowStockCount =
                batchRepository.findLowStockMedicines(20).size();

        LocalDate today = LocalDate.now();
        LocalDate next30Days = today.plusDays(30);

        int nearExpiryCount =
                batchRepository
                        .findByExpiryDateBetweenAndQuantityGreaterThanOrderByExpiryDateAsc(
                                today, next30Days, 0)
                        .size();

        int expiredBatchCount =
                batchRepository
                        .findByExpiryDateBeforeAndQuantityGreaterThanOrderByExpiryDateAsc(
                                today, 0)
                        .size();

        return Map.of(
                "totalMedicines", totalMedicines,
                "totalStock", totalStock,
                "lowStockCount", lowStockCount,
                "nearExpiryCount", nearExpiryCount,
                "expiredBatchCount", expiredBatchCount
        );
    }
}

package com.pharmawise;

import org.springframework.security.core.Authentication;
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
    public Map<String, Object> getDashboardSummary(
            Authentication authentication) {

        String email = authentication.getName();

        long totalMedicines =
                medicineRepository.findAllByOwner_Email(email).size();

        int totalStock =
                batchRepository.getTotalStockForUser(email);

        int lowStockCount =
                batchRepository.findLowStockMedicinesForUser(20, email).size();

        LocalDate today = LocalDate.now();
        LocalDate next30Days = today.plusDays(30);

        int nearExpiryCount =
                batchRepository
                        .findByOwner_EmailAndExpiryDateBetweenAndQuantityGreaterThanOrderByExpiryDateAsc(
                                email, today, next30Days, 0)
                        .size();

        int expiredBatchCount =
                batchRepository
                        .findByOwner_EmailAndExpiryDateBeforeAndQuantityGreaterThanOrderByExpiryDateAsc(
                                email, today, 0)
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

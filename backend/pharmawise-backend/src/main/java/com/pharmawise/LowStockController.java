
package com.pharmawise;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class LowStockController {

    private final MedicineBatchRepository batchRepository;

    public LowStockController(
            MedicineBatchRepository batchRepository) {
        this.batchRepository = batchRepository;
    }

    @GetMapping("/low-stock")
    public List<Object[]> getLowStockMedicines(
            Authentication authentication) {

        String email = authentication.getName();

        return batchRepository.findLowStockMedicinesForUser(20, email);
    }
}

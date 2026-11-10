package com.pharmawise;

import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class ExpiredBatchController {

    private final MedicineBatchRepository batchRepository;

    public ExpiredBatchController(
            MedicineBatchRepository batchRepository) {
        this.batchRepository = batchRepository;
    }

    @GetMapping("/expired")
    public List<MedicineBatch> getExpiredBatches() {

        return batchRepository
                .findByExpiryDateBeforeAndQuantityGreaterThanOrderByExpiryDateAsc(
                        LocalDate.now(),
                        0
                );
    }
}
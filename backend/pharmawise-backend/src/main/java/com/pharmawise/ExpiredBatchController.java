
package com.pharmawise;

import org.springframework.security.core.Authentication;
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
    public List<MedicineBatch> getExpiredBatches(
            Authentication authentication) {

        String email = authentication.getName();

        return batchRepository
                .findByOwner_EmailAndExpiryDateBeforeAndQuantityGreaterThanOrderByExpiryDateAsc(
                        email,
                        LocalDate.now(),
                        0
                );
    }
}

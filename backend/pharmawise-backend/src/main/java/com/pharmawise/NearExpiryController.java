
package com.pharmawise;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/alerts")
public class NearExpiryController {

    private final MedicineBatchRepository batchRepository;

    public NearExpiryController(
            MedicineBatchRepository batchRepository) {
        this.batchRepository = batchRepository;
    }

    @GetMapping("/near-expiry")
    public List<MedicineBatch> getNearExpiryBatches(
            Authentication authentication) {

        String email = authentication.getName();

        LocalDate today = LocalDate.now();
        LocalDate next30Days = today.plusDays(30);

        return batchRepository
                .findByOwner_EmailAndExpiryDateBetweenAndQuantityGreaterThanOrderByExpiryDateAsc(
                        email,
                        today,
                        next30Days,
                        0
                );
    }
}

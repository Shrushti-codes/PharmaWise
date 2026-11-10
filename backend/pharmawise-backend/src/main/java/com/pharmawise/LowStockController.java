package com.pharmawise;

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
    public List<Object[]> getLowStockMedicines() {

        return batchRepository.findLowStockMedicines(20);
    }
}

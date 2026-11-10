package com.pharmawise;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/batches")
public class MedicineBatchController {

    private final MedicineBatchRepository batchRepository;
    private final MedicineRepository medicineRepository;

    public MedicineBatchController(
            MedicineBatchRepository batchRepository,
            MedicineRepository medicineRepository) {

        this.batchRepository = batchRepository;
        this.medicineRepository = medicineRepository;
    }

    @GetMapping
    public List<MedicineBatch> getAllBatches() {
        return batchRepository.findAll();
    }

    @PostMapping("/medicine/{medicineId}")
public MedicineBatch addBatch(
        @PathVariable Long medicineId,
        @RequestBody MedicineBatch batch) {

    Medicine medicine = medicineRepository.findById(medicineId)
            .orElseThrow(() ->
                    new RuntimeException("Medicine not found"));

    batch.setMedicine(medicine);

    MedicineBatch savedBatch = batchRepository.save(batch);

    int totalQuantity =
            batchRepository.getTotalQuantityByMedicineId(medicineId);

    medicine.setQuantity(totalQuantity);
    medicineRepository.save(medicine);

    return savedBatch;
}
}

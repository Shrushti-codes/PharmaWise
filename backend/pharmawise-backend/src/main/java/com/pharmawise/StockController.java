
package com.pharmawise;

import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/api/stock")
public class StockController {

    private final MedicineBatchRepository batchRepository;
    private final MedicineRepository medicineRepository;

    public StockController(
            MedicineBatchRepository batchRepository,
            MedicineRepository medicineRepository) {

        this.batchRepository = batchRepository;
        this.medicineRepository = medicineRepository;
    }
    
    @Transactional
    @PostMapping("/deduct/{medicineId}")
    public String deductStock(
            @PathVariable Long medicineId,
            @RequestBody StockDeductionRequest request) {

        int requestedQuantity = request.getQuantity();

        if (requestedQuantity <= 0) {
            throw new RuntimeException(
                    "Requested quantity must be greater than zero");
        }

        List<MedicineBatch> batches =
                batchRepository
                        .findByMedicine_IdAndQuantityGreaterThanAndExpiryDateGreaterThanEqualOrderByExpiryDateAsc(
                                medicineId,
                                0,
                                LocalDate.now()
                        );

        int availableStock = 0;

        for (MedicineBatch batch : batches) {
            availableStock += batch.getQuantity();
        }

        if (availableStock < requestedQuantity) {
            throw new RuntimeException(
                    "Insufficient stock. Available quantity: "
                            + availableStock);
        }

        int remainingQuantity = requestedQuantity;

        for (MedicineBatch batch : batches) {

            if (remainingQuantity == 0) {
                break;
            }

            int batchQuantity = batch.getQuantity();

            if (batchQuantity >= remainingQuantity) {
                batch.setQuantity(batchQuantity - remainingQuantity);
                remainingQuantity = 0;
            } else {
                remainingQuantity -= batchQuantity;
                batch.setQuantity(0);
            }

            batchRepository.save(batch);
        }

        // Recalculate total stock from all batches
        int totalQuantity =
                batchRepository.getTotalQuantityByMedicineId(medicineId);

        // Update medicine-level quantity
        Medicine medicine = medicineRepository.findById(medicineId)
                .orElseThrow(() ->
                        new RuntimeException("Medicine not found"));

        medicine.setQuantity(totalQuantity);
        medicineRepository.save(medicine);

        return "Stock deducted successfully using FEFO!";
    }
}



package com.pharmawise;

import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;
import java.security.Principal;
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
            @RequestBody StockDeductionRequest request,
            Principal principal) {

        String email = principal.getName();

        int requestedQuantity = request.getQuantity();

        if (requestedQuantity <= 0) {
            throw new RuntimeException(
                    "Requested quantity must be greater than zero");
        }

        // Verify that this medicine belongs to the logged-in user
        Medicine medicine = medicineRepository
                .findByIdAndOwner_Email(medicineId, email)
                .orElseThrow(() ->
                        new RuntimeException("Medicine not found"));

        // Fetch only this user's eligible batches in FEFO order
        List<MedicineBatch> batches =
                batchRepository
                        .findByMedicine_IdAndOwner_EmailAndQuantityGreaterThanAndExpiryDateGreaterThanEqualOrderByExpiryDateAsc(
                                medicineId,
                                email,
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

        // Deduct stock from earliest-expiring batches first
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

        // Recalculate only this user's medicine stock
        int totalQuantity =
                batchRepository.getTotalQuantityByMedicineIdAndOwner(
                        medicineId, email);

        medicine.setQuantity(totalQuantity);
        medicineRepository.save(medicine);

        return "Stock deducted successfully using FEFO!";
    }
}


package com.pharmawise;

import org.springframework.web.bind.annotation.*;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/batches")
public class MedicineBatchController {

    private final MedicineBatchRepository batchRepository;
    private final MedicineRepository medicineRepository;
    private final UserRepository userRepository;

    public MedicineBatchController(
            MedicineBatchRepository batchRepository,
            MedicineRepository medicineRepository,
            UserRepository userRepository) {

        this.batchRepository = batchRepository;
        this.medicineRepository = medicineRepository;
        this.userRepository = userRepository;
    }

    // Get only the logged-in user's batches
    @GetMapping
    public List<MedicineBatch> getAllBatches(Principal principal) {
        return batchRepository.findAllByOwner_Email(principal.getName());
    }

    // Add a batch only to the logged-in user's medicine
    @PostMapping("/medicine/{medicineId}")
    public MedicineBatch addBatch(
            @PathVariable Long medicineId,
            @RequestBody MedicineBatch batch,
            Principal principal) {

        String email = principal.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Medicine medicine = medicineRepository
                .findByIdAndOwner_Email(medicineId, email)
                .orElseThrow(() ->
                        new RuntimeException("Medicine not found"));

        batch.setMedicine(medicine);
        batch.setOwner(user);

        MedicineBatch savedBatch = batchRepository.save(batch);

        // Synchronize medicine quantity with its batch total
        int totalQuantity =
                batchRepository.getTotalQuantityByMedicineIdAndOwner(
                        medicineId, email);

        medicine.setQuantity(totalQuantity);
        medicineRepository.save(medicine);

        return savedBatch;
    }
}

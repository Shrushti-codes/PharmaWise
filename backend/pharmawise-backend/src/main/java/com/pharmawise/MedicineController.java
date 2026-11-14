
package com.pharmawise;

import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/medicines")
public class MedicineController {

    private final MedicineRepository medicineRepository;
    private final MedicineBatchRepository medicineBatchRepository;
    private final UserRepository userRepository;

    public MedicineController(
            MedicineRepository medicineRepository,
            MedicineBatchRepository medicineBatchRepository,
            UserRepository userRepository) {

        this.medicineRepository = medicineRepository;
        this.medicineBatchRepository = medicineBatchRepository;
        this.userRepository = userRepository;
    }

    // Get only the logged-in user's medicines
    @GetMapping
    public List<Medicine> getAllMedicines(Principal principal) {
        return medicineRepository.findAllByOwner_Email(
                principal.getName()
        );
    }

    // Add medicine for the logged-in user
    @PostMapping
    public Medicine addMedicine(
            @RequestBody Medicine medicine,
            Principal principal) {

        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        medicine.setOwner(user);

        return medicineRepository.save(medicine);
    }

    // Update only the logged-in user's medicine
    @PutMapping("/{id}")
    public Medicine updateMedicine(
            @PathVariable Long id,
            @RequestBody Medicine updatedMedicine,
            Principal principal) {

        Medicine medicine = medicineRepository
                .findByIdAndOwner_Email(id, principal.getName())
                .orElseThrow(() -> new RuntimeException("Medicine not found"));

        medicine.setName(updatedMedicine.getName());
        medicine.setPrice(updatedMedicine.getPrice());
        medicine.setExpiryDate(updatedMedicine.getExpiryDate());

        // Quantity is maintained through batches, so preserve it here.

        return medicineRepository.save(medicine);
    }

    // Delete only the logged-in user's medicine and its batches
    @DeleteMapping("/{id}")
    @Transactional
    public String deleteMedicine(
            @PathVariable Long id,
            Principal principal) {

        Medicine medicine = medicineRepository
                .findByIdAndOwner_Email(id, principal.getName())
                .orElseThrow(() -> new RuntimeException("Medicine not found"));
    medicineBatchRepository.deleteByMedicine_IdAndOwner_Email(
        medicine.getId(), principal.getName());
        medicineRepository.delete(medicine);

        return "Medicine and its batches deleted successfully!";
    }
}

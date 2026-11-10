
package com.pharmawise;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/medicines")
public class MedicineController {

    private final MedicineRepository medicineRepository;

    public MedicineController(MedicineRepository medicineRepository) {
        this.medicineRepository = medicineRepository;
    }

    @GetMapping
    public List<Medicine> getAllMedicines() {
        return medicineRepository.findAll();
    }

    @PostMapping
    public Medicine addMedicine(@RequestBody Medicine medicine) {
        return medicineRepository.save(medicine);
    }
    @PutMapping("/{id}")
public Medicine updateMedicine(@PathVariable Long id,
                               @RequestBody Medicine updatedMedicine) {

    Medicine medicine = medicineRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Medicine not found"));

    medicine.setName(updatedMedicine.getName());
    medicine.setPrice(updatedMedicine.getPrice());
    medicine.setQuantity(updatedMedicine.getQuantity());
    medicine.setExpiryDate(updatedMedicine.getExpiryDate());
    
    return medicineRepository.save(medicine);
    }    
    @DeleteMapping("/{id}")
public String deleteMedicine(@PathVariable Long id) {

    medicineRepository.deleteById(id);

    return "Medicine deleted successfully!";
}
}


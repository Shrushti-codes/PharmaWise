
package com.pharmawise;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MedicineRepository extends JpaRepository<Medicine, Long> {

    // Fetch only medicines belonging to a particular user
    List<Medicine> findAllByOwner_Email(String email);

    // Find a medicine only if it belongs to the logged-in user
    Optional<Medicine> findByIdAndOwner_Email(Long id, String email);

}



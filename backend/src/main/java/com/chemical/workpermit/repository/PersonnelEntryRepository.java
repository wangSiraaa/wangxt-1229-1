package com.chemical.workpermit.repository;

import com.chemical.workpermit.entity.PersonnelEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PersonnelEntryRepository extends JpaRepository<PersonnelEntry, UUID> {

    List<PersonnelEntry> findByPermitIdOrderByCreatedAtAsc(UUID permitId);

    List<PersonnelEntry> findByPermitIdAndIsInsideTrue(UUID permitId);

    Optional<PersonnelEntry> findByPermitIdAndPersonnelId(UUID permitId, String personnelId);

    long countByPermitIdAndIsInsideTrue(UUID permitId);
}

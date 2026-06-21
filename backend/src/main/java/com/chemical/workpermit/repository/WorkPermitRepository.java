package com.chemical.workpermit.repository;

import com.chemical.workpermit.entity.WorkPermit;
import com.chemical.workpermit.enums.PermitStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WorkPermitRepository extends JpaRepository<WorkPermit, UUID> {

    Page<WorkPermit> findByStatusIn(List<PermitStatus> statuses, Pageable pageable);

    Page<WorkPermit> findByApplicantId(String applicantId, Pageable pageable);

    Page<WorkPermit> findByGuardianId(String guardianId, Pageable pageable);

    boolean existsByPermitNo(String permitNo);
}

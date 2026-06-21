package com.chemical.workpermit.repository;

import com.chemical.workpermit.entity.GasDetection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GasDetectionRepository extends JpaRepository<GasDetection, UUID> {

    List<GasDetection> findByPermitIdOrderByDetectionTimeDesc(UUID permitId);

    GasDetection findTopByPermitIdOrderByDetectionTimeDesc(UUID permitId);
}

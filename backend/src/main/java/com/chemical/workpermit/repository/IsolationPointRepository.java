package com.chemical.workpermit.repository;

import com.chemical.workpermit.entity.IsolationPoint;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface IsolationPointRepository extends JpaRepository<IsolationPoint, UUID> {

    List<IsolationPoint> findByPermitIdOrderByCreatedAtAsc(UUID permitId);

    long countByPermitIdAndIsConfirmedFalse(UUID permitId);
}

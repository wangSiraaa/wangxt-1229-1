package com.chemical.workpermit.entity;

import com.chemical.workpermit.enums.ApprovalAction;
import com.chemical.workpermit.enums.PermitStatus;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "approval_record")
public class ApprovalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "permit_id", nullable = false)
    private UUID permitId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApprovalAction action;

    @Column(name = "operator_id", nullable = false, length = 50)
    private String operatorId;

    @Column(name = "operator_name", nullable = false, length = 100)
    private String operatorName;

    @Column(columnDefinition = "TEXT")
    private String comment;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_status")
    private PermitStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_status")
    private PermitStatus toStatus;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}

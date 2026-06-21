package com.chemical.workpermit.entity;

import com.chemical.workpermit.enums.PermitStatus;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "work_permit")
public class WorkPermit {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "permit_no", unique = true, nullable = false, length = 50)
    private String permitNo;

    @Column(nullable = false, length = 200)
    private String equipment;

    @Column(name = "work_content", nullable = false, columnDefinition = "TEXT")
    private String workContent;

    @Column(name = "applicant_id", nullable = false, length = 50)
    private String applicantId;

    @Column(name = "applicant_name", nullable = false, length = 100)
    private String applicantName;

    @Column(name = "guardian_id", length = 50)
    private String guardianId;

    @Column(name = "guardian_name", length = 100)
    private String guardianName;

    @Column(name = "safety_officer_id", length = 50)
    private String safetyOfficerId;

    @Column(name = "safety_officer_name", length = 100)
    private String safetyOfficerName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PermitStatus status = PermitStatus.DRAFT;

    @Column(name = "plan_start_time")
    private LocalDateTime planStartTime;

    @Column(name = "plan_end_time")
    private LocalDateTime planEndTime;

    @Column(name = "gas_expire_time")
    private LocalDateTime gasExpireTime;

    @Column(name = "actual_start_time")
    private LocalDateTime actualStartTime;

    @Column(name = "actual_end_time")
    private LocalDateTime actualEndTime;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Version
    private Integer version = 0;
}

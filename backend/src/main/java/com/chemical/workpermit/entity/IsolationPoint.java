package com.chemical.workpermit.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "isolation_point")
public class IsolationPoint {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "permit_id", nullable = false)
    private UUID permitId;

    @Column(nullable = false, length = 200)
    private String location;

    @Column(nullable = false, length = 500)
    private String measure;

    @Column(name = "isolation_tag_no", length = 50)
    private String isolationTagNo;

    @Column(name = "is_confirmed", nullable = false)
    private Boolean isConfirmed = false;

    @Column(name = "confirmer_id", length = 50)
    private String confirmerId;

    @Column(name = "confirmer_name", length = 100)
    private String confirmerName;

    @Column(name = "confirm_time")
    private LocalDateTime confirmTime;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}

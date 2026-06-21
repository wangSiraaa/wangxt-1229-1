package com.chemical.workpermit.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "personnel_entry", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"permit_id", "personnel_id"})
})
public class PersonnelEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "permit_id", nullable = false)
    private UUID permitId;

    @Column(name = "personnel_id", nullable = false, length = 50)
    private String personnelId;

    @Column(name = "personnel_name", nullable = false, length = 100)
    private String personnelName;

    @Column(name = "entry_time")
    private LocalDateTime entryTime;

    @Column(name = "exit_time")
    private LocalDateTime exitTime;

    @Column(name = "is_inside", nullable = false)
    private Boolean isInside = false;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}

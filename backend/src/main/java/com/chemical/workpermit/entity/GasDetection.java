package com.chemical.workpermit.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Entity
@Table(name = "gas_detection")
public class GasDetection {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "permit_id", nullable = false)
    private UUID permitId;

    @Column(name = "oxygen_content", nullable = false, precision = 5, scale = 2)
    private BigDecimal oxygenContent;

    @Column(name = "combustible_gas", nullable = false, precision = 8, scale = 4)
    private BigDecimal combustibleGas;

    @Column(name = "toxic_gas", precision = 8, scale = 4)
    private BigDecimal toxicGas;

    @Column(name = "detection_time", nullable = false)
    private LocalDateTime detectionTime;

    @Column(name = "expire_time", nullable = false)
    private LocalDateTime expireTime;

    @Column(name = "tester_id", nullable = false, length = 50)
    private String testerId;

    @Column(name = "tester_name", nullable = false, length = 100)
    private String testerName;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}

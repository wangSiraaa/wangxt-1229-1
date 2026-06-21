package com.chemical.workpermit.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class GasDetectionDTO {
    private UUID id;
    private UUID permitId;
    private BigDecimal oxygenContent;
    private BigDecimal combustibleGas;
    private BigDecimal toxicGas;
    private LocalDateTime detectionTime;
    private LocalDateTime expireTime;
    private String testerId;
    private String testerName;
    private LocalDateTime createdAt;
}

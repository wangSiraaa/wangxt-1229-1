package com.chemical.workpermit.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class IsolationPointDTO {
    private UUID id;
    private UUID permitId;
    private String location;
    private String measure;
    private String isolationTagNo;
    private Boolean isConfirmed;
    private String confirmerId;
    private String confirmerName;
    private LocalDateTime confirmTime;
    private LocalDateTime createdAt;
}

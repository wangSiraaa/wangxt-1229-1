package com.chemical.workpermit.dto;

import com.chemical.workpermit.enums.PermitStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class WorkPermitDTO {
    private UUID id;
    private String permitNo;
    private String equipment;
    private String workContent;
    private String applicantId;
    private String applicantName;
    private String guardianId;
    private String guardianName;
    private String safetyOfficerId;
    private String safetyOfficerName;
    private PermitStatus status;
    private LocalDateTime planStartTime;
    private LocalDateTime planEndTime;
    private LocalDateTime gasExpireTime;
    private LocalDateTime actualStartTime;
    private LocalDateTime actualEndTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

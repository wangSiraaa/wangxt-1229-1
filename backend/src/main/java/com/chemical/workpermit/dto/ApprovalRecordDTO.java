package com.chemical.workpermit.dto;

import com.chemical.workpermit.enums.ApprovalAction;
import com.chemical.workpermit.enums.PermitStatus;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ApprovalRecordDTO {
    private UUID id;
    private UUID permitId;
    private ApprovalAction action;
    private String operatorId;
    private String operatorName;
    private String comment;
    private PermitStatus fromStatus;
    private PermitStatus toStatus;
    private LocalDateTime createdAt;
}

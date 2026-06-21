package com.chemical.workpermit.dto;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class PersonnelEntryDTO {
    private UUID id;
    private UUID permitId;
    private String personnelId;
    private String personnelName;
    private LocalDateTime entryTime;
    private LocalDateTime exitTime;
    private Boolean isInside;
    private String remarks;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

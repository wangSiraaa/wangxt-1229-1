package com.chemical.workpermit.dto;

import lombok.Data;

import java.util.List;

@Data
public class WorkPermitDetailDTO {
    private WorkPermitDTO permit;
    private List<GasDetectionDTO> gasDetections;
    private List<IsolationPointDTO> isolationPoints;
    private List<PersonnelEntryDTO> personnelEntries;
    private List<ApprovalRecordDTO> approvalRecords;
    private boolean gasExpired;
    private boolean allIsolationConfirmed;
    private boolean allPersonnelExited;
    private long insidePersonnelCount;
}

package com.chemical.workpermit.controller;

import com.chemical.workpermit.dto.*;
import com.chemical.workpermit.enums.PermitStatus;
import com.chemical.workpermit.service.WorkPermitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/work-permits")
@RequiredArgsConstructor
public class WorkPermitController {

    private final WorkPermitService workPermitService;

    @GetMapping
    public ResponseEntity<Page<WorkPermitDTO>> listPermits(
            @RequestParam(required = false) List<PermitStatus> statuses,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {
        Page<WorkPermitDTO> result;
        if (statuses != null && !statuses.isEmpty()) {
            result = workPermitService.listPermitsByStatus(statuses, pageable);
        } else {
            result = workPermitService.listPermits(pageable);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<WorkPermitDetailDTO> getPermitDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(workPermitService.getPermitDetail(id));
    }

    @PostMapping
    public ResponseEntity<WorkPermitDTO> createPermit(@Valid @RequestBody CreateWorkPermitDTO dto) {
        return ResponseEntity.ok(workPermitService.createPermit(dto));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<WorkPermitDTO> submitPermit(
            @PathVariable UUID id,
            @Valid @RequestBody ApproveActionDTO dto) {
        return ResponseEntity.ok(workPermitService.submitPermit(id, dto));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<WorkPermitDTO> approvePermit(
            @PathVariable UUID id,
            @Valid @RequestBody ApproveActionDTO dto) {
        return ResponseEntity.ok(workPermitService.approvePermit(id, dto));
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<WorkPermitDTO> rejectPermit(
            @PathVariable UUID id,
            @Valid @RequestBody ApproveActionDTO dto) {
        return ResponseEntity.ok(workPermitService.rejectPermit(id, dto));
    }

    @PostMapping("/{id}/gas-detection")
    public ResponseEntity<GasDetectionDTO> recordGasDetection(
            @PathVariable UUID id,
            @Valid @RequestBody RecordGasDetectionDTO dto) {
        return ResponseEntity.ok(workPermitService.recordGasDetection(id, dto));
    }

    @PostMapping("/{id}/isolation-points")
    public ResponseEntity<IsolationPointDTO> addIsolationPoint(
            @PathVariable UUID id,
            @Valid @RequestBody CreateIsolationPointDTO dto) {
        return ResponseEntity.ok(workPermitService.addIsolationPoint(id, dto));
    }

    @PostMapping("/{id}/isolation-points/{pointId}/confirm")
    public ResponseEntity<IsolationPointDTO> confirmIsolationPoint(
            @PathVariable UUID id,
            @PathVariable UUID pointId,
            @Valid @RequestBody ApproveActionDTO dto) {
        return ResponseEntity.ok(workPermitService.confirmIsolationPoint(id, pointId, dto));
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<WorkPermitDTO> startWork(
            @PathVariable UUID id,
            @Valid @RequestBody ApproveActionDTO dto) {
        return ResponseEntity.ok(workPermitService.startWork(id, dto));
    }

    @PostMapping("/{id}/personnel/entry")
    public ResponseEntity<PersonnelEntryDTO> recordEntry(
            @PathVariable UUID id,
            @Valid @RequestBody PersonnelOperationDTO dto) {
        return ResponseEntity.ok(workPermitService.recordEntry(id, dto));
    }

    @PostMapping("/{id}/personnel/exit")
    public ResponseEntity<PersonnelEntryDTO> recordExit(
            @PathVariable UUID id,
            @Valid @RequestBody PersonnelOperationDTO dto) {
        return ResponseEntity.ok(workPermitService.recordExit(id, dto));
    }

    @PostMapping("/{id}/confirm-resume")
    public ResponseEntity<WorkPermitDTO> confirmResume(
            @PathVariable UUID id,
            @Valid @RequestBody ApproveActionDTO dto) {
        return ResponseEntity.ok(workPermitService.confirmResume(id, dto));
    }

    @PostMapping("/{id}/close")
    public ResponseEntity<WorkPermitDTO> closePermit(
            @PathVariable UUID id,
            @Valid @RequestBody ApproveActionDTO dto) {
        return ResponseEntity.ok(workPermitService.closePermit(id, dto));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<WorkPermitDTO> cancelPermit(
            @PathVariable UUID id,
            @Valid @RequestBody ApproveActionDTO dto) {
        return ResponseEntity.ok(workPermitService.cancelPermit(id, dto));
    }
}

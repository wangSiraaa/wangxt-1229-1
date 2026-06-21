package com.chemical.workpermit.service;

import com.chemical.workpermit.dto.*;
import com.chemical.workpermit.entity.*;
import com.chemical.workpermit.enums.ApprovalAction;
import com.chemical.workpermit.enums.PermitEvent;
import com.chemical.workpermit.enums.PermitStatus;
import com.chemical.workpermit.exception.BusinessException;
import com.chemical.workpermit.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeanUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.statemachine.StateMachine;
import org.springframework.statemachine.config.StateMachineFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class WorkPermitService {

    private final WorkPermitRepository workPermitRepository;
    private final GasDetectionRepository gasDetectionRepository;
    private final IsolationPointRepository isolationPointRepository;
    private final PersonnelEntryRepository personnelEntryRepository;
    private final ApprovalRecordRepository approvalRecordRepository;
    private final StateMachineFactory<PermitStatus, PermitEvent> stateMachineFactory;

    private static final DateTimeFormatter PERMIT_NO_FORMATTER = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");

    public Page<WorkPermitDTO> listPermits(Pageable pageable) {
        return workPermitRepository.findAll(pageable)
                .map(this::convertToDTO);
    }

    public Page<WorkPermitDTO> listPermitsByStatus(List<PermitStatus> statuses, Pageable pageable) {
        return workPermitRepository.findByStatusIn(statuses, pageable)
                .map(this::convertToDTO);
    }

    public WorkPermitDetailDTO getPermitDetail(UUID id) {
        WorkPermit permit = workPermitRepository.findById(id)
                .orElseThrow(() -> new BusinessException("PERMIT_NOT_FOUND", "作业票不存在"));

        WorkPermitDetailDTO detail = new WorkPermitDetailDTO();
        detail.setPermit(convertToDTO(permit));

        List<GasDetection> gasDetections = gasDetectionRepository.findByPermitIdOrderByDetectionTimeDesc(id);
        detail.setGasDetections(gasDetections.stream()
                .map(this::convertToGasDTO)
                .collect(Collectors.toList()));

        List<IsolationPoint> isolationPoints = isolationPointRepository.findByPermitIdOrderByCreatedAtAsc(id);
        detail.setIsolationPoints(isolationPoints.stream()
                .map(this::convertToIsolationDTO)
                .collect(Collectors.toList()));

        List<PersonnelEntry> personnelEntries = personnelEntryRepository.findByPermitIdOrderByCreatedAtAsc(id);
        detail.setPersonnelEntries(personnelEntries.stream()
                .map(this::convertToPersonnelDTO)
                .collect(Collectors.toList()));

        List<ApprovalRecord> approvalRecords = approvalRecordRepository.findByPermitIdOrderByCreatedAtDesc(id);
        detail.setApprovalRecords(approvalRecords.stream()
                .map(this::convertToApprovalDTO)
                .collect(Collectors.toList()));

        detail.setGasExpired(checkGasExpired(permit));
        detail.setAllIsolationConfirmed(checkAllIsolationConfirmed(id));
        detail.setAllPersonnelExited(checkAllPersonnelExited(id));
        detail.setInsidePersonnelCount(personnelEntryRepository.countByPermitIdAndIsInsideTrue(id));

        return detail;
    }

    @Transactional
    public WorkPermitDTO createPermit(CreateWorkPermitDTO dto) {
        WorkPermit permit = new WorkPermit();
        BeanUtils.copyProperties(dto, permit);
        permit.setPermitNo(generatePermitNo());
        permit.setStatus(PermitStatus.DRAFT);

        permit = workPermitRepository.save(permit);
        log.info("创建作业票成功: id={}, permitNo={}", permit.getId(), permit.getPermitNo());

        return convertToDTO(permit);
    }

    @Transactional
    public WorkPermitDTO submitPermit(UUID id, ApproveActionDTO dto) {
        WorkPermit permit = getPermitById(id);
        validateStatus(permit, PermitStatus.DRAFT);

        sendEvent(permit, PermitEvent.SUBMIT);

        permit.setStatus(PermitStatus.PENDING_APPROVAL);
        permit = workPermitRepository.save(permit);

        recordApproval(permit, ApprovalAction.SUBMIT, dto, PermitStatus.DRAFT, PermitStatus.PENDING_APPROVAL);

        log.info("提交作业票成功: id={}", id);
        return convertToDTO(permit);
    }

    @Transactional
    public WorkPermitDTO approvePermit(UUID id, ApproveActionDTO dto) {
        WorkPermit permit = getPermitById(id);
        validateStatus(permit, PermitStatus.PENDING_APPROVAL);

        sendEvent(permit, PermitEvent.APPROVE);

        permit.setStatus(PermitStatus.GAS_TEST_PENDING);
        permit = workPermitRepository.save(permit);

        recordApproval(permit, ApprovalAction.APPROVE, dto, PermitStatus.PENDING_APPROVAL, PermitStatus.GAS_TEST_PENDING);

        log.info("审批作业票成功: id={}", id);
        return convertToDTO(permit);
    }

    @Transactional
    public WorkPermitDTO rejectPermit(UUID id, ApproveActionDTO dto) {
        WorkPermit permit = getPermitById(id);
        validateStatus(permit, PermitStatus.PENDING_APPROVAL);

        sendEvent(permit, PermitEvent.REJECT);

        permit.setStatus(PermitStatus.DRAFT);
        permit = workPermitRepository.save(permit);

        recordApproval(permit, ApprovalAction.REJECT, dto, PermitStatus.PENDING_APPROVAL, PermitStatus.DRAFT);

        log.info("驳回作业票成功: id={}", id);
        return convertToDTO(permit);
    }

    @Transactional
    public GasDetectionDTO recordGasDetection(UUID permitId, RecordGasDetectionDTO dto) {
        WorkPermit permit = getPermitById(permitId);
        validateStatus(permit, PermitStatus.GAS_TEST_PENDING);

        if (dto.getOxygenContent().doubleValue() < 19.5 || dto.getOxygenContent().doubleValue() > 23.5) {
            throw new BusinessException("INVALID_GAS_CONTENT", "氧含量必须在19.5%-23.5%之间");
        }

        if (dto.getCombustibleGas().doubleValue() > 10) {
            throw new BusinessException("INVALID_GAS_CONTENT", "可燃气体含量必须低于10%LEL");
        }

        GasDetection detection = new GasDetection();
        BeanUtils.copyProperties(dto, detection);
        detection.setPermitId(permitId);
        detection.setDetectionTime(LocalDateTime.now());
        detection.setExpireTime(LocalDateTime.now().plusHours(8));

        detection = gasDetectionRepository.save(detection);

        permit.setGasExpireTime(detection.getExpireTime());
        permit.setStatus(PermitStatus.ISOLATION_PENDING);
        permit.setSafetyOfficerId(dto.getTesterId());
        permit.setSafetyOfficerName(dto.getTesterName());
        workPermitRepository.save(permit);

        ApprovalRecord record = new ApprovalRecord();
        record.setPermitId(permitId);
        record.setAction(ApprovalAction.GAS_TEST_RECORD);
        record.setOperatorId(dto.getTesterId());
        record.setOperatorName(dto.getTesterName());
        record.setFromStatus(PermitStatus.GAS_TEST_PENDING);
        record.setToStatus(PermitStatus.ISOLATION_PENDING);
        record.setComment("气体检测记录: 氧含量=" + dto.getOxygenContent() + "%, 可燃气体=" + dto.getCombustibleGas() + "%LEL");
        approvalRecordRepository.save(record);

        sendEvent(permit, PermitEvent.RECORD_GAS_TEST);

        log.info("气体检测记录成功: permitId={}, detectionId={}", permitId, detection.getId());
        return convertToGasDTO(detection);
    }

    @Transactional
    public IsolationPointDTO addIsolationPoint(UUID permitId, CreateIsolationPointDTO dto) {
        WorkPermit permit = getPermitById(permitId);

        if (permit.getStatus().ordinal() > PermitStatus.ISOLATION_PENDING.ordinal()) {
            throw new BusinessException("INVALID_STATUS", "作业票状态不允许添加隔离点");
        }

        IsolationPoint point = new IsolationPoint();
        BeanUtils.copyProperties(dto, point);
        point.setPermitId(permitId);
        point.setIsConfirmed(false);

        point = isolationPointRepository.save(point);
        log.info("添加隔离点成功: permitId={}, pointId={}", permitId, point.getId());

        return convertToIsolationDTO(point);
    }

    @Transactional
    public IsolationPointDTO confirmIsolationPoint(UUID permitId, UUID pointId, ApproveActionDTO dto) {
        WorkPermit permit = getPermitById(permitId);
        validateStatus(permit, PermitStatus.ISOLATION_PENDING);

        IsolationPoint point = isolationPointRepository.findById(pointId)
                .orElseThrow(() -> new BusinessException("POINT_NOT_FOUND", "隔离点不存在"));

        if (!point.getPermitId().equals(permitId)) {
            throw new BusinessException("INVALID_POINT", "隔离点不属于该作业票");
        }

        if (point.getIsConfirmed()) {
            throw new BusinessException("ALREADY_CONFIRMED", "隔离点已确认");
        }

        point.setIsConfirmed(true);
        point.setConfirmerId(dto.getOperatorId());
        point.setConfirmerName(dto.getOperatorName());
        point.setConfirmTime(LocalDateTime.now());
        point = isolationPointRepository.save(point);

        if (checkAllIsolationConfirmed(permitId)) {
            permit.setStatus(PermitStatus.READY_TO_START);
            workPermitRepository.save(permit);

            ApprovalRecord record = new ApprovalRecord();
            record.setPermitId(permitId);
            record.setAction(ApprovalAction.ISOLATION_CONFIRM);
            record.setOperatorId(dto.getOperatorId());
            record.setOperatorName(dto.getOperatorName());
            record.setFromStatus(PermitStatus.ISOLATION_PENDING);
            record.setToStatus(PermitStatus.READY_TO_START);
            record.setComment("所有能量隔离点已确认");
            approvalRecordRepository.save(record);

            sendEvent(permit, PermitEvent.CONFIRM_ISOLATION);
        }

        log.info("确认隔离点成功: permitId={}, pointId={}", permitId, pointId);
        return convertToIsolationDTO(point);
    }

    @Transactional
    public WorkPermitDTO startWork(UUID id, ApproveActionDTO dto) {
        WorkPermit permit = getPermitById(id);
        validateStatus(permit, PermitStatus.READY_TO_START, PermitStatus.RESUME_CONFIRMED);

        PermitStatus fromStatus = permit.getStatus();

        if (checkGasExpired(permit)) {
            throw new BusinessException("GAS_EXPIRED", "气体检测已过期，无法开工");
        }

        if (!checkAllIsolationConfirmed(id)) {
            throw new BusinessException("ISOLATION_NOT_CONFIRMED", "能量隔离未全部确认，无法进入");
        }

        sendEvent(permit, PermitEvent.START_WORK);

        permit.setStatus(PermitStatus.IN_PROGRESS);
        if (permit.getActualStartTime() == null) {
            permit.setActualStartTime(LocalDateTime.now());
        }
        permit = workPermitRepository.save(permit);

        recordApproval(permit, ApprovalAction.START_WORK, dto, fromStatus, PermitStatus.IN_PROGRESS);

        log.info("作业开始: id={}", id);
        return convertToDTO(permit);
    }

    @Transactional
    public PersonnelEntryDTO recordEntry(UUID permitId, PersonnelOperationDTO dto) {
        WorkPermit permit = getPermitById(permitId);
        validateStatus(permit, PermitStatus.IN_PROGRESS);

        if (checkGasExpired(permit)) {
            throw new BusinessException("GAS_EXPIRED", "气体检测已过期，人员禁止进入");
        }

        PersonnelEntry entry = personnelEntryRepository.findByPermitIdAndPersonnelId(permitId, dto.getPersonnelId())
                .orElse(new PersonnelEntry());

        if (entry.getIsInside()) {
            throw new BusinessException("ALREADY_INSIDE", "该人员已在受限空间内");
        }

        entry.setPermitId(permitId);
        entry.setPersonnelId(dto.getPersonnelId());
        entry.setPersonnelName(dto.getPersonnelName());
        entry.setEntryTime(LocalDateTime.now());
        entry.setIsInside(true);
        entry.setExitTime(null);
        entry.setRemarks(dto.getRemarks());
        entry = personnelEntryRepository.save(entry);

        ApprovalRecord record = new ApprovalRecord();
        record.setPermitId(permitId);
        record.setAction(ApprovalAction.ENTRY_RECORD);
        record.setOperatorId(dto.getOperatorId());
        record.setOperatorName(dto.getOperatorName());
        record.setComment("人员进入: " + dto.getPersonnelName());
        approvalRecordRepository.save(record);

        sendEvent(permit, PermitEvent.RECORD_ENTRY);

        log.info("人员进入记录: permitId={}, personnel={}", permitId, dto.getPersonnelName());
        return convertToPersonnelDTO(entry);
    }

    @Transactional
    public PersonnelEntryDTO recordExit(UUID permitId, PersonnelOperationDTO dto) {
        WorkPermit permit = getPermitById(permitId);
        validateStatus(permit, PermitStatus.IN_PROGRESS);

        PersonnelEntry entry = personnelEntryRepository.findByPermitIdAndPersonnelId(permitId, dto.getPersonnelId())
                .orElseThrow(() -> new BusinessException("ENTRY_NOT_FOUND", "未找到该人员的进入记录"));

        if (!entry.getIsInside()) {
            throw new BusinessException("NOT_INSIDE", "该人员不在受限空间内");
        }

        entry.setExitTime(LocalDateTime.now());
        entry.setIsInside(false);
        entry.setRemarks(dto.getRemarks());
        entry = personnelEntryRepository.save(entry);

        ApprovalRecord record = new ApprovalRecord();
        record.setPermitId(permitId);
        record.setAction(ApprovalAction.EXIT_RECORD);
        record.setOperatorId(dto.getOperatorId());
        record.setOperatorName(dto.getOperatorName());
        record.setComment("人员撤出: " + dto.getPersonnelName());
        approvalRecordRepository.save(record);

        sendEvent(permit, PermitEvent.RECORD_EXIT);

        if (checkAllPersonnelExited(permitId)) {
            permit.setStatus(PermitStatus.PENDING_RESUME);
            workPermitRepository.save(permit);
        }

        log.info("人员撤出记录: permitId={}, personnel={}", permitId, dto.getPersonnelName());
        return convertToPersonnelDTO(entry);
    }

    @Transactional
    public WorkPermitDTO confirmResume(UUID id, ApproveActionDTO dto) {
        WorkPermit permit = getPermitById(id);
        validateStatus(permit, PermitStatus.PENDING_RESUME);

        if (checkGasExpired(permit)) {
            throw new BusinessException("GAS_EXPIRED", "气体检测已过期，需要重新检测");
        }

        sendEvent(permit, PermitEvent.CONFIRM_RESUME);

        permit.setStatus(PermitStatus.RESUME_CONFIRMED);
        permit = workPermitRepository.save(permit);

        recordApproval(permit, ApprovalAction.RESUME_CONFIRM, dto, PermitStatus.PENDING_RESUME, PermitStatus.RESUME_CONFIRMED);

        log.info("复工确认成功: id={}", id);
        return convertToDTO(permit);
    }

    @Transactional
    public WorkPermitDTO closePermit(UUID id, ApproveActionDTO dto) {
        WorkPermit permit = getPermitById(id);

        if (!checkAllPersonnelExited(id)) {
            long insideCount = personnelEntryRepository.countByPermitIdAndIsInsideTrue(id);
            throw new BusinessException("PERSONNEL_INSIDE", "还有 " + insideCount + " 名人员未签出，不能关闭作业票");
        }

        if (permit.getStatus() != PermitStatus.IN_PROGRESS &&
            permit.getStatus() != PermitStatus.RESUME_CONFIRMED &&
            permit.getStatus() != PermitStatus.CLOSING) {
            throw new BusinessException("INVALID_STATUS", "作业票状态不允许关闭");
        }

        PermitStatus fromStatus = permit.getStatus();

        sendEvent(permit, PermitEvent.CLOSE);

        permit.setStatus(PermitStatus.CLOSED);
        permit.setActualEndTime(LocalDateTime.now());
        permit = workPermitRepository.save(permit);

        recordApproval(permit, ApprovalAction.CLOSE, dto, fromStatus, PermitStatus.CLOSED);

        log.info("作业票关闭成功: id={}", id);
        return convertToDTO(permit);
    }

    @Transactional
    public WorkPermitDTO cancelPermit(UUID id, ApproveActionDTO dto) {
        WorkPermit permit = getPermitById(id);

        if (permit.getStatus() != PermitStatus.DRAFT && permit.getStatus() != PermitStatus.PENDING_APPROVAL) {
            throw new BusinessException("INVALID_STATUS", "作业票状态不允许取消");
        }

        if (!checkAllPersonnelExited(id)) {
            throw new BusinessException("PERSONNEL_INSIDE", "还有人员未撤出，不能取消作业票");
        }

        PermitStatus fromStatus = permit.getStatus();

        sendEvent(permit, PermitEvent.CANCEL);

        permit.setStatus(PermitStatus.CANCELLED);
        permit = workPermitRepository.save(permit);

        recordApproval(permit, ApprovalAction.CANCEL, dto, fromStatus, PermitStatus.CANCELLED);

        log.info("作业票取消成功: id={}", id);
        return convertToDTO(permit);
    }

    private WorkPermit getPermitById(UUID id) {
        return workPermitRepository.findById(id)
                .orElseThrow(() -> new BusinessException("PERMIT_NOT_FOUND", "作业票不存在"));
    }

    private void validateStatus(WorkPermit permit, PermitStatus... expectedStatuses) {
        for (PermitStatus expected : expectedStatuses) {
            if (permit.getStatus() == expected) {
                return;
            }
        }
        throw new BusinessException("INVALID_STATUS",
                "当前状态: " + permit.getStatus() + "，不允许此操作");
    }

    private boolean checkGasExpired(WorkPermit permit) {
        if (permit.getGasExpireTime() == null) {
            return true;
        }
        return LocalDateTime.now().isAfter(permit.getGasExpireTime());
    }

    private boolean checkAllIsolationConfirmed(UUID permitId) {
        return isolationPointRepository.countByPermitIdAndIsConfirmedFalse(permitId) == 0;
    }

    private boolean checkAllPersonnelExited(UUID permitId) {
        return personnelEntryRepository.countByPermitIdAndIsInsideTrue(permitId) == 0;
    }

    private void sendEvent(WorkPermit permit, PermitEvent event) {
        StateMachine<PermitStatus, PermitEvent> stateMachine =
                stateMachineFactory.getStateMachine("permitStateMachine");
        stateMachine.start();
        stateMachine.sendEvent(MessageBuilder.withPayload(event)
                .setHeader("permitId", permit.getId())
                .build());
    }

    private void recordApproval(WorkPermit permit, ApprovalAction action,
                                ApproveActionDTO dto, PermitStatus from, PermitStatus to) {
        ApprovalRecord record = new ApprovalRecord();
        record.setPermitId(permit.getId());
        record.setAction(action);
        record.setOperatorId(dto.getOperatorId());
        record.setOperatorName(dto.getOperatorName());
        record.setComment(dto.getComment());
        record.setFromStatus(from);
        record.setToStatus(to);
        approvalRecordRepository.save(record);
    }

    private String generatePermitNo() {
        String prefix = "WP-" + LocalDateTime.now().format(PERMIT_NO_FORMATTER);
        String permitNo = prefix;
        int suffix = 1;
        while (workPermitRepository.existsByPermitNo(permitNo)) {
            permitNo = prefix + "-" + suffix;
            suffix++;
        }
        return permitNo;
    }

    private WorkPermitDTO convertToDTO(WorkPermit permit) {
        WorkPermitDTO dto = new WorkPermitDTO();
        BeanUtils.copyProperties(permit, dto);
        return dto;
    }

    private GasDetectionDTO convertToGasDTO(GasDetection entity) {
        GasDetectionDTO dto = new GasDetectionDTO();
        BeanUtils.copyProperties(entity, dto);
        return dto;
    }

    private IsolationPointDTO convertToIsolationDTO(IsolationPoint entity) {
        IsolationPointDTO dto = new IsolationPointDTO();
        BeanUtils.copyProperties(entity, dto);
        return dto;
    }

    private PersonnelEntryDTO convertToPersonnelDTO(PersonnelEntry entity) {
        PersonnelEntryDTO dto = new PersonnelEntryDTO();
        BeanUtils.copyProperties(entity, dto);
        return dto;
    }

    private ApprovalRecordDTO convertToApprovalDTO(ApprovalRecord entity) {
        ApprovalRecordDTO dto = new ApprovalRecordDTO();
        BeanUtils.copyProperties(entity, dto);
        return dto;
    }
}

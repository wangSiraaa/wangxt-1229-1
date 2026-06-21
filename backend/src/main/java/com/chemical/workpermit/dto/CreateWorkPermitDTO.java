package com.chemical.workpermit.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateWorkPermitDTO {
    @NotBlank(message = "设备名称不能为空")
    private String equipment;

    @NotBlank(message = "作业内容不能为空")
    private String workContent;

    @NotBlank(message = "申请人ID不能为空")
    private String applicantId;

    @NotBlank(message = "申请人姓名不能为空")
    private String applicantName;

    private String guardianId;
    private String guardianName;

    @NotNull(message = "计划开始时间不能为空")
    private LocalDateTime planStartTime;

    @NotNull(message = "计划结束时间不能为空")
    private LocalDateTime planEndTime;
}

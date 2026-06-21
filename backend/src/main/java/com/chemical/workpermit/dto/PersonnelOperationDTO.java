package com.chemical.workpermit.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PersonnelOperationDTO {
    @NotBlank(message = "人员ID不能为空")
    private String personnelId;

    @NotBlank(message = "人员姓名不能为空")
    private String personnelName;

    private String remarks;

    @NotBlank(message = "操作人ID不能为空")
    private String operatorId;

    @NotBlank(message = "操作人姓名不能为空")
    private String operatorName;
}

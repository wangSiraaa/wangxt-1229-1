package com.chemical.workpermit.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ApproveActionDTO {
    @NotBlank(message = "操作人ID不能为空")
    private String operatorId;

    @NotBlank(message = "操作人姓名不能为空")
    private String operatorName;

    private String comment;
}

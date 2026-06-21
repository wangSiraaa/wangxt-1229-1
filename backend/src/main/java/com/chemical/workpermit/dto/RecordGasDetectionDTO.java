package com.chemical.workpermit.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class RecordGasDetectionDTO {
    @NotNull(message = "氧含量不能为空")
    @DecimalMin(value = "19.5", message = "氧含量不能低于19.5%")
    @DecimalMax(value = "23.5", message = "氧含量不能高于23.5%")
    private BigDecimal oxygenContent;

    @NotNull(message = "可燃气体含量不能为空")
    @DecimalMin(value = "0", message = "可燃气体含量不能为负数")
    @DecimalMax(value = "100", message = "可燃气体含量不能超过100%")
    private BigDecimal combustibleGas;

    private BigDecimal toxicGas;

    @NotBlank(message = "检测人ID不能为空")
    private String testerId;

    @NotBlank(message = "检测人姓名不能为空")
    private String testerName;
}

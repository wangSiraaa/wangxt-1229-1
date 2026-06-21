package com.chemical.workpermit.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateIsolationPointDTO {
    @NotBlank(message = "隔离位置不能为空")
    private String location;

    @NotBlank(message = "隔离措施不能为空")
    private String measure;

    private String isolationTagNo;
}

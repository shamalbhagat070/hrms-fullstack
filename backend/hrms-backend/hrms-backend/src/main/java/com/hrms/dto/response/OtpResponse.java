package com.hrms.dto.response;



import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class OtpResponse {

    private boolean success;
    private String message;
    private Integer otp;
}

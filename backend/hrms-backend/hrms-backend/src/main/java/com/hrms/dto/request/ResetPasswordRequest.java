package com.hrms.dto.request;

import lombok.Data;

public class ResetPasswordRequest {
    private String email;
    private String newPassword;

}
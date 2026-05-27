package com.hrms.dto.request;

import lombok.Data;
public class OTPRequest {
    private String emailOrMobile; // Email or mobile passed here
    private String otp;

    public String getEmailOrMobile() { return emailOrMobile; }
    public void setEmailOrMobile(String emailOrMobile) { this.emailOrMobile = emailOrMobile; }

    public String getOtp() {
        return otp; }
    public void setOtp(String otp) {
        this.otp = otp; }
}
package com.ridehub.dto;

import com.ridehub.model.DriverVerificationStatus;
import java.time.OffsetDateTime;

public class DriverProfileResponse {
    private Long id;
    private Long userId;
    private String licenseNumber;
    private DriverVerificationStatus verificationStatus;
    private OffsetDateTime createdAt;

    public DriverProfileResponse() {}

    public DriverProfileResponse(Long id, Long userId, String licenseNumber, DriverVerificationStatus verificationStatus, OffsetDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.licenseNumber = licenseNumber;
        this.verificationStatus = verificationStatus;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getLicenseNumber() { return licenseNumber; }
    public void setLicenseNumber(String licenseNumber) { this.licenseNumber = licenseNumber; }

    public DriverVerificationStatus getVerificationStatus() { return verificationStatus; }
    public void setVerificationStatus(DriverVerificationStatus verificationStatus) { this.verificationStatus = verificationStatus; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}

package com.ridehub.model;

import java.time.OffsetDateTime;

public class DriverProfile {
    private Long id;
    private Long userId;
    private String licenseNumber;
    private DriverVerificationStatus verificationStatus = DriverVerificationStatus.PENDING;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public DriverProfile() {}

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

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}

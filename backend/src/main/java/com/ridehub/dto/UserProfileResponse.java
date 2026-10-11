package com.ridehub.dto;

import com.ridehub.model.AccountStatus;
import java.time.OffsetDateTime;
import java.util.Set;

public class UserProfileResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private Set<String> roles;
    private AccountStatus accountStatus;
    private OffsetDateTime createdAt;

    public UserProfileResponse() {}

    public UserProfileResponse(Long id, String fullName, String email, String phone, Set<String> roles, AccountStatus accountStatus, OffsetDateTime createdAt) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.roles = roles;
        this.accountStatus = accountStatus;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public Set<String> getRoles() { return roles; }
    public void setRoles(Set<String> roles) { this.roles = roles; }

    public AccountStatus getAccountStatus() { return accountStatus; }
    public void setAccountStatus(AccountStatus accountStatus) { this.accountStatus = accountStatus; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}

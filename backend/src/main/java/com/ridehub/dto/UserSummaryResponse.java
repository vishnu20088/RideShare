package com.ridehub.dto;

import com.ridehub.model.AccountStatus;
import java.util.Set;

public class UserSummaryResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private Set<String> roles;
    private AccountStatus accountStatus;

    public UserSummaryResponse() {}

    public UserSummaryResponse(Long id, String fullName, String email, String phone, Set<String> roles, AccountStatus accountStatus) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.phone = phone;
        this.roles = roles;
        this.accountStatus = accountStatus;
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
}

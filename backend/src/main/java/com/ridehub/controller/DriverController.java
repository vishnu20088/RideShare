package com.ridehub.controller;

import com.ridehub.dto.ApiResponse;
import com.ridehub.dto.DriverProfileRequest;
import com.ridehub.dto.DriverProfileResponse;
import com.ridehub.security.UserPrincipal;
import com.ridehub.service.DriverService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/driver")
@Tag(name = "Driver Profile", description = "Endpoints for driver profile setup and status")
public class DriverController {

    private final DriverService driverService;

    public DriverController(DriverService driverService) {
        this.driverService = driverService;
    }

    @PostMapping("/profile")
    @Operation(summary = "Create or update driver profile and activate driver status")
    public ResponseEntity<ApiResponse<DriverProfileResponse>> createOrUpdateDriverProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody DriverProfileRequest request) {
        DriverProfileResponse response = driverService.createOrUpdateDriverProfile(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Driver profile updated successfully", response));
    }

    @GetMapping("/profile")
    @Operation(summary = "Get current user driver profile")
    public ResponseEntity<ApiResponse<DriverProfileResponse>> getDriverProfile(
            @AuthenticationPrincipal UserPrincipal principal) {
        DriverProfileResponse response = driverService.getDriverProfile(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Driver profile retrieved", response));
    }
}

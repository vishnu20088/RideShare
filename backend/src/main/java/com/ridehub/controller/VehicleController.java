package com.ridehub.controller;

import com.ridehub.dto.ApiResponse;
import com.ridehub.dto.VehicleRequest;
import com.ridehub.dto.VehicleResponse;
import com.ridehub.security.UserPrincipal;
import com.ridehub.service.DriverService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/vehicles")
@Tag(name = "Vehicles", description = "Endpoints for driver vehicle management")
public class VehicleController {

    private final DriverService driverService;

    public VehicleController(DriverService driverService) {
        this.driverService = driverService;
    }

    @PostMapping
    @Operation(summary = "Register a new vehicle for the driver")
    public ResponseEntity<ApiResponse<VehicleResponse>> createVehicle(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody VehicleRequest request) {
        VehicleResponse response = driverService.createVehicle(principal.getId(), request);
        return new ResponseEntity<>(ApiResponse.ok("Vehicle created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping("/my")
    @Operation(summary = "Get all vehicles owned by current driver")
    public ResponseEntity<ApiResponse<List<VehicleResponse>>> getMyVehicles(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<VehicleResponse> vehicles = driverService.getMyVehicles(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Vehicles retrieved", vehicles));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update vehicle details")
    public ResponseEntity<ApiResponse<VehicleResponse>> updateVehicle(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody VehicleRequest request) {
        VehicleResponse response = driverService.updateVehicle(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.ok("Vehicle updated successfully", response));
    }
}

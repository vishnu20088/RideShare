package com.ridehub.controller;

import com.ridehub.dto.ApiResponse;
import com.ridehub.dto.CreateRideRequest;
import com.ridehub.dto.PagedResponse;
import com.ridehub.dto.RideResponse;
import com.ridehub.dto.RideSearchCriteria;
import com.ridehub.dto.UpdateRideRequest;
import com.ridehub.security.UserPrincipal;
import com.ridehub.service.RideService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/rides")
@Tag(name = "Rides", description = "Endpoints for publishing, searching, managing, and completing rides")
public class RideController {

    private final RideService rideService;

    public RideController(RideService rideService) {
        this.rideService = rideService;
    }

    @PostMapping
    @Operation(summary = "Publish a new ride")
    public ResponseEntity<ApiResponse<RideResponse>> createRide(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateRideRequest request) {
        RideResponse ride = rideService.createRide(principal.getId(), request);
        return new ResponseEntity<>(ApiResponse.ok("Ride published successfully", ride), HttpStatus.CREATED);
    }

    @GetMapping({"", "/search"})
    @Operation(summary = "Search available rides with filtering and pagination")
    public ResponseEntity<ApiResponse<PagedResponse<RideResponse>>> searchRides(
            @RequestParam(required = false) String origin,
            @RequestParam(required = false) String destination,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate travelDate,
            @RequestParam(required = false) Integer seats,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "departureTime") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        RideSearchCriteria criteria = new RideSearchCriteria();
        criteria.setOrigin(origin);
        criteria.setDestination(destination);
        criteria.setTravelDate(travelDate);
        criteria.setSeats(seats);
        criteria.setMaxPrice(maxPrice);
        criteria.setSortBy(sortBy);
        criteria.setSortDir(sortDir);
        criteria.setPage(page);
        criteria.setSize(size);

        PagedResponse<RideResponse> results = rideService.searchRides(criteria);
        return ResponseEntity.ok(ApiResponse.ok("Rides found", results));
    }

    @GetMapping("/my")
    @Operation(summary = "Get all rides published by current driver")
    public ResponseEntity<ApiResponse<List<RideResponse>>> getMyRides(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<RideResponse> rides = rideService.getMyRides(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Driver rides retrieved", rides));
    }

    @GetMapping("/{id:\\d+}")
    @Operation(summary = "Get ride details by ID")
    public ResponseEntity<ApiResponse<RideResponse>> getRideById(@PathVariable Long id) {
        RideResponse ride = rideService.getRideById(id);
        return ResponseEntity.ok(ApiResponse.ok("Ride retrieved", ride));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Update an existing ride (driver ownership required)")
    public ResponseEntity<ApiResponse<RideResponse>> updateRide(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateRideRequest request) {
        RideResponse ride = rideService.updateRide(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.ok("Ride updated successfully", ride));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancel a ride (driver ownership required)")
    public ResponseEntity<ApiResponse<Void>> cancelRide(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        rideService.cancelRide(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Ride cancelled successfully"));
    }

    @PostMapping("/{id}/complete")
    @Operation(summary = "Mark a ride as completed (driver ownership required)")
    public ResponseEntity<ApiResponse<Void>> completeRide(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        rideService.completeRide(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Ride marked as completed"));
    }
}

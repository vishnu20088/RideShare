package com.ridehub.controller;

import com.ridehub.dto.AdminDashboardStatsResponse;
import com.ridehub.dto.ApiResponse;
import com.ridehub.dto.BookingResponse;
import com.ridehub.dto.PagedResponse;
import com.ridehub.dto.ReportResponse;
import com.ridehub.dto.RideResponse;
import com.ridehub.dto.UpdateReportStatusRequest;
import com.ridehub.dto.UpdateUserStatusRequest;
import com.ridehub.dto.UserSummaryResponse;
import com.ridehub.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Administration", description = "Endpoints for administrators to manage users, rides, bookings, and reports")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get overall platform metrics and statistics")
    public ResponseEntity<ApiResponse<AdminDashboardStatsResponse>> getDashboardStats() {
        AdminDashboardStatsResponse stats = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.ok("Admin stats retrieved", stats));
    }

    @GetMapping("/users")
    @Operation(summary = "Get registered users with pagination")
    public ResponseEntity<ApiResponse<PagedResponse<UserSummaryResponse>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<UserSummaryResponse> users = adminService.getAllUsers(page, size);
        return ResponseEntity.ok(ApiResponse.ok("Users retrieved", users));
    }

    @PatchMapping("/users/{id}/status")
    @Operation(summary = "Suspend or reactivate a user account")
    public ResponseEntity<ApiResponse<UserSummaryResponse>> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserStatusRequest request) {
        UserSummaryResponse user = adminService.updateUserStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.ok("User status updated successfully", user));
    }

    @GetMapping("/rides")
    @Operation(summary = "Get all platform rides with pagination")
    public ResponseEntity<ApiResponse<PagedResponse<RideResponse>>> getAllRides(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<RideResponse> rides = adminService.getAllRides(page, size);
        return ResponseEntity.ok(ApiResponse.ok("Rides retrieved", rides));
    }

    @GetMapping("/bookings")
    @Operation(summary = "Get all platform bookings with pagination")
    public ResponseEntity<ApiResponse<PagedResponse<BookingResponse>>> getAllBookings(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<BookingResponse> bookings = adminService.getAllBookings(page, size);
        return ResponseEntity.ok(ApiResponse.ok("Bookings retrieved", bookings));
    }

    @GetMapping("/reports")
    @Operation(summary = "Get user reports with pagination")
    public ResponseEntity<ApiResponse<PagedResponse<ReportResponse>>> getAllReports(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        PagedResponse<ReportResponse> reports = adminService.getAllReports(page, size);
        return ResponseEntity.ok(ApiResponse.ok("Reports retrieved", reports));
    }

    @PatchMapping("/reports/{id}")
    @Operation(summary = "Update report status (INVESTIGATING, RESOLVED, DISMISSED)")
    public ResponseEntity<ApiResponse<ReportResponse>> updateReportStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateReportStatusRequest request) {
        ReportResponse report = adminService.updateReportStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.ok("Report status updated successfully", report));
    }
}

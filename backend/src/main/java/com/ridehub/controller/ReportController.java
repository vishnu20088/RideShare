package com.ridehub.controller;

import com.ridehub.dto.ApiResponse;
import com.ridehub.dto.CreateReportRequest;
import com.ridehub.dto.ReportResponse;
import com.ridehub.security.UserPrincipal;
import com.ridehub.service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reports")
@Tag(name = "Reports", description = "Endpoints for reporting suspicious behavior or safety concerns")
public class ReportController {

    private final AdminService adminService;

    public ReportController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping
    @Operation(summary = "Submit a safety or misconduct report")
    public ResponseEntity<ApiResponse<ReportResponse>> createReport(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateReportRequest request) {
        ReportResponse report = adminService.createReport(principal.getId(), request);
        return new ResponseEntity<>(ApiResponse.ok("Report submitted successfully for administrator review", report), HttpStatus.CREATED);
    }
}

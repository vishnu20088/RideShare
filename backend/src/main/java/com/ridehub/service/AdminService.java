package com.ridehub.service;

import com.ridehub.dto.AdminDashboardStatsResponse;
import com.ridehub.dto.BookingResponse;
import com.ridehub.dto.CreateReportRequest;
import com.ridehub.dto.PagedResponse;
import com.ridehub.dto.ReportResponse;
import com.ridehub.dto.RideResponse;
import com.ridehub.dto.UserSummaryResponse;
import com.ridehub.exception.ResourceNotFoundException;
import com.ridehub.model.AccountStatus;
import com.ridehub.model.Booking;
import com.ridehub.model.Report;
import com.ridehub.model.ReportStatus;
import com.ridehub.model.Ride;
import com.ridehub.model.RideStatus;
import com.ridehub.model.RoleType;
import com.ridehub.model.User;
import com.ridehub.repository.BookingRepository;
import com.ridehub.repository.ReportRepository;
import com.ridehub.repository.RideRepository;
import com.ridehub.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final RideRepository rideRepository;
    private final BookingRepository bookingRepository;
    private final ReportRepository reportRepository;
    private final RideService rideService;
    private final AuthService authService;
    private final NotificationService notificationService;

    public AdminService(UserRepository userRepository,
                        RideRepository rideRepository,
                        BookingRepository bookingRepository,
                        ReportRepository reportRepository,
                        RideService rideService,
                        AuthService authService,
                        NotificationService notificationService) {
        this.userRepository = userRepository;
        this.rideRepository = rideRepository;
        this.bookingRepository = bookingRepository;
        this.reportRepository = reportRepository;
        this.rideService = rideService;
        this.authService = authService;
        this.notificationService = notificationService;
    }

    public AdminDashboardStatsResponse getDashboardStats() {
        AdminDashboardStatsResponse stats = new AdminDashboardStatsResponse();
        stats.setTotalUsers(userRepository.countAll());
        stats.setTotalDrivers(userRepository.countByRole(RoleType.ROLE_DRIVER.name()));
        stats.setTotalRides(rideRepository.countAll());
        stats.setTotalBookings(bookingRepository.countAll());
        stats.setTotalCompletedRides(rideRepository.countByStatus(RideStatus.COMPLETED));
        stats.setTotalPendingReports(reportRepository.countByStatus(ReportStatus.PENDING));
        stats.setTotalEstimatedBookingValue(bookingRepository.sumCompletedBookingValue());
        return stats;
    }

    public PagedResponse<UserSummaryResponse> getAllUsers(int page, int size) {
        List<User> users = userRepository.findAll(page, size);
        long total = userRepository.countAll();

        List<UserSummaryResponse> content = users.stream()
                .map(authService::mapToSummary)
                .collect(Collectors.toList());

        return new PagedResponse<>(content, page, size, total);
    }

    @Transactional
    public UserSummaryResponse updateUserStatus(Long userId, AccountStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        userRepository.updateStatus(userId, status);
        user.setAccountStatus(status);

        notificationService.createNotification(
                userId,
                "Account Status Updated",
                "Your account status has been changed to: " + status
        );

        return authService.mapToSummary(user);
    }

    public PagedResponse<RideResponse> getAllRides(int page, int size) {
        List<Ride> rides = rideRepository.findAll(page, size);
        long total = rideRepository.countAll();

        List<RideResponse> content = rides.stream()
                .map(r -> {
                    User driver = userRepository.findById(r.getDriverId()).orElse(null);
                    return rideService.mapToRideResponse(r, driver);
                })
                .collect(Collectors.toList());

        return new PagedResponse<>(content, page, size, total);
    }

    public PagedResponse<BookingResponse> getAllBookings(int page, int size) {
        List<Booking> bookings = bookingRepository.findAll(page, size);
        long total = bookingRepository.countAll();

        List<BookingResponse> content = bookings.stream()
                .map(b -> {
                    Ride ride = rideRepository.findById(b.getRideId()).orElse(null);
                    User passenger = userRepository.findById(b.getPassengerId()).orElse(null);
                    User driver = (ride != null) ? userRepository.findById(ride.getDriverId()).orElse(null) : null;

                    BookingResponse res = new BookingResponse();
                    res.setId(b.getId());
                    res.setRideId(b.getRideId());
                    if (ride != null) {
                        res.setOrigin(ride.getOrigin());
                        res.setDestination(ride.getDestination());
                        res.setDepartureTime(ride.getDepartureTime());
                        res.setDriverId(ride.getDriverId());
                    }
                    res.setPassengerId(b.getPassengerId());
                    if (passenger != null) res.setPassengerName(passenger.getFullName());
                    if (driver != null) res.setDriverName(driver.getFullName());
                    res.setSeatsRequested(b.getSeatsRequested());
                    res.setTotalPrice(b.getTotalPrice());
                    res.setStatus(b.getStatus());
                    res.setRequestedAt(b.getRequestedAt());
                    res.setUpdatedAt(b.getUpdatedAt());
                    return res;
                })
                .collect(Collectors.toList());

        return new PagedResponse<>(content, page, size, total);
    }

    @Transactional
    public ReportResponse createReport(Long reporterId, CreateReportRequest request) {
        Report report = new Report();
        report.setReporterId(reporterId);
        report.setReportedUserId(request.getReportedUserId());
        report.setRideId(request.getRideId());
        report.setReason(request.getReason().trim());
        report.setDescription(request.getDescription().trim());
        report.setStatus(ReportStatus.PENDING);

        Report saved = reportRepository.save(report);
        return mapToReportResponse(saved);
    }

    public PagedResponse<ReportResponse> getAllReports(int page, int size) {
        List<Report> reports = reportRepository.findAll(page, size);
        long total = reportRepository.countAll();

        List<ReportResponse> content = reports.stream()
                .map(this::mapToReportResponse)
                .collect(Collectors.toList());

        return new PagedResponse<>(content, page, size, total);
    }

    @Transactional
    public ReportResponse updateReportStatus(Long reportId, ReportStatus status) {
        Report report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + reportId));

        reportRepository.updateStatus(reportId, status);
        report.setStatus(status);

        return mapToReportResponse(report);
    }

    private ReportResponse mapToReportResponse(Report r) {
        ReportResponse res = new ReportResponse();
        res.setId(r.getId());
        res.setReporterId(r.getReporterId());
        User reporter = userRepository.findById(r.getReporterId()).orElse(null);
        if (reporter != null) res.setReporterName(reporter.getFullName());

        res.setReportedUserId(r.getReportedUserId());
        if (r.getReportedUserId() != null) {
            User reported = userRepository.findById(r.getReportedUserId()).orElse(null);
            if (reported != null) res.setReportedUserName(reported.getFullName());
        }

        res.setRideId(r.getRideId());
        res.setReason(r.getReason());
        res.setDescription(r.getDescription());
        res.setStatus(r.getStatus());
        res.setCreatedAt(r.getCreatedAt());
        return res;
    }
}

package com.ridehub.dto;

import java.math.BigDecimal;

public class AdminDashboardStatsResponse {
    private long totalUsers;
    private long totalDrivers;
    private long totalRides;
    private long totalBookings;
    private long totalCompletedRides;
    private long totalPendingReports;
    private BigDecimal totalEstimatedBookingValue;

    public AdminDashboardStatsResponse() {}

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getTotalDrivers() { return totalDrivers; }
    public void setTotalDrivers(long totalDrivers) { this.totalDrivers = totalDrivers; }

    public long getTotalRides() { return totalRides; }
    public void setTotalRides(long totalRides) { this.totalRides = totalRides; }

    public long getTotalBookings() { return totalBookings; }
    public void setTotalBookings(long totalBookings) { this.totalBookings = totalBookings; }

    public long getTotalCompletedRides() { return totalCompletedRides; }
    public void setTotalCompletedRides(long totalCompletedRides) { this.totalCompletedRides = totalCompletedRides; }

    public long getTotalPendingReports() { return totalPendingReports; }
    public void setTotalPendingReports(long totalPendingReports) { this.totalPendingReports = totalPendingReports; }

    public BigDecimal getTotalEstimatedBookingValue() { return totalEstimatedBookingValue; }
    public void setTotalEstimatedBookingValue(BigDecimal totalEstimatedBookingValue) { this.totalEstimatedBookingValue = totalEstimatedBookingValue; }
}

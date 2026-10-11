package com.ridehub.dto;

import java.math.BigDecimal;

public class PublicProfileResponse {
    private Long id;
    private String fullName;
    private BigDecimal averageRating;
    private int totalReviews;
    private int totalRidesAsDriver;

    public PublicProfileResponse() {}

    public PublicProfileResponse(Long id, String fullName, BigDecimal averageRating, int totalReviews, int totalRidesAsDriver) {
        this.id = id;
        this.fullName = fullName;
        this.averageRating = averageRating;
        this.totalReviews = totalReviews;
        this.totalRidesAsDriver = totalRidesAsDriver;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public BigDecimal getAverageRating() { return averageRating; }
    public void setAverageRating(BigDecimal averageRating) { this.averageRating = averageRating; }

    public int getTotalReviews() { return totalReviews; }
    public void setTotalReviews(int totalReviews) { this.totalReviews = totalReviews; }

    public int getTotalRidesAsDriver() { return totalRidesAsDriver; }
    public void setTotalRidesAsDriver(int totalRidesAsDriver) { this.totalRidesAsDriver = totalRidesAsDriver; }
}

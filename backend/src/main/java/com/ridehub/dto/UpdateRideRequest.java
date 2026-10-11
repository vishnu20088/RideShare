package com.ridehub.dto;

import com.ridehub.model.RideStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

public class UpdateRideRequest {

    private String origin;
    private String destination;
    private BigDecimal originLatitude;
    private BigDecimal originLongitude;
    private BigDecimal destinationLatitude;
    private BigDecimal destinationLongitude;
    private OffsetDateTime departureTime;
    private OffsetDateTime estimatedArrivalTime;

    @Min(value = 1, message = "Total seats must be at least 1")
    @Max(value = 20, message = "Total seats cannot exceed 20")
    private Integer totalSeats;

    @Min(value = 0, message = "Available seats cannot be negative")
    private Integer availableSeats;

    @DecimalMin(value = "0.00", message = "Price per seat must be non-negative")
    private BigDecimal pricePerSeat;

    private String description;
    private RideStatus status;

    public UpdateRideRequest() {}

    public String getOrigin() { return origin; }
    public void setOrigin(String origin) { this.origin = origin; }

    public String getDestination() { return destination; }
    public void setDestination(String destination) { this.destination = destination; }

    public BigDecimal getOriginLatitude() { return originLatitude; }
    public void setOriginLatitude(BigDecimal originLatitude) { this.originLatitude = originLatitude; }

    public BigDecimal getOriginLongitude() { return originLongitude; }
    public void setOriginLongitude(BigDecimal originLongitude) { this.originLongitude = originLongitude; }

    public BigDecimal getDestinationLatitude() { return destinationLatitude; }
    public void setDestinationLatitude(BigDecimal destinationLatitude) { this.destinationLatitude = destinationLatitude; }

    public BigDecimal getDestinationLongitude() { return destinationLongitude; }
    public void setDestinationLongitude(BigDecimal destinationLongitude) { this.destinationLongitude = destinationLongitude; }

    public OffsetDateTime getDepartureTime() { return departureTime; }
    public void setDepartureTime(OffsetDateTime departureTime) { this.departureTime = departureTime; }

    public OffsetDateTime getEstimatedArrivalTime() { return estimatedArrivalTime; }
    public void setEstimatedArrivalTime(OffsetDateTime estimatedArrivalTime) { this.estimatedArrivalTime = estimatedArrivalTime; }

    public Integer getTotalSeats() { return totalSeats; }
    public void setTotalSeats(Integer totalSeats) { this.totalSeats = totalSeats; }

    public Integer getAvailableSeats() { return availableSeats; }
    public void setAvailableSeats(Integer availableSeats) { this.availableSeats = availableSeats; }

    public BigDecimal getPricePerSeat() { return pricePerSeat; }
    public void setPricePerSeat(BigDecimal pricePerSeat) { this.pricePerSeat = pricePerSeat; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public RideStatus getStatus() { return status; }
    public void setStatus(RideStatus status) { this.status = status; }
}

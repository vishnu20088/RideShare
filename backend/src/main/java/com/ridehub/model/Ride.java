package com.ridehub.model;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public class Ride {
    private Long id;
    private Long driverId;
    private String origin;
    private String destination;
    private BigDecimal originLatitude;
    private BigDecimal originLongitude;
    private BigDecimal destinationLatitude;
    private BigDecimal destinationLongitude;
    private OffsetDateTime departureTime;
    private OffsetDateTime estimatedArrivalTime;
    private Integer totalSeats;
    private Integer availableSeats;
    private BigDecimal pricePerSeat;
    private String description;
    private RideStatus status = RideStatus.OPEN;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public Ride() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getDriverId() { return driverId; }
    public void setDriverId(Long driverId) { this.driverId = driverId; }

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

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }

    public OffsetDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(OffsetDateTime updatedAt) { this.updatedAt = updatedAt; }
}

package com.ridehub.dto;

import java.time.OffsetDateTime;

public class VehicleResponse {
    private Long id;
    private Long driverId;
    private String make;
    private String model;
    private String registrationNumber;
    private String color;
    private Integer seatCapacity;
    private OffsetDateTime createdAt;

    public VehicleResponse() {}

    public VehicleResponse(Long id, Long driverId, String make, String model, String registrationNumber, String color, Integer seatCapacity, OffsetDateTime createdAt) {
        this.id = id;
        this.driverId = driverId;
        this.make = make;
        this.model = model;
        this.registrationNumber = registrationNumber;
        this.color = color;
        this.seatCapacity = seatCapacity;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getDriverId() { return driverId; }
    public void setDriverId(Long driverId) { this.driverId = driverId; }

    public String getMake() { return make; }
    public void setMake(String make) { this.make = make; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public String getRegistrationNumber() { return registrationNumber; }
    public void setRegistrationNumber(String registrationNumber) { this.registrationNumber = registrationNumber; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public Integer getSeatCapacity() { return seatCapacity; }
    public void setSeatCapacity(Integer seatCapacity) { this.seatCapacity = seatCapacity; }

    public OffsetDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(OffsetDateTime createdAt) { this.createdAt = createdAt; }
}

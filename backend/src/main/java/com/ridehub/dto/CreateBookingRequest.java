package com.ridehub.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class CreateBookingRequest {

    @NotNull(message = "Number of requested seats is required")
    @Min(value = 1, message = "Must request at least 1 seat")
    @Max(value = 20, message = "Cannot request more than 20 seats")
    private Integer seatsRequested;

    public CreateBookingRequest() {}

    public CreateBookingRequest(Integer seatsRequested) {
        this.seatsRequested = seatsRequested;
    }

    public Integer getSeatsRequested() { return seatsRequested; }
    public void setSeatsRequested(Integer seatsRequested) { this.seatsRequested = seatsRequested; }
}

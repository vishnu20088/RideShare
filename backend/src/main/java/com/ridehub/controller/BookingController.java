package com.ridehub.controller;

import com.ridehub.dto.ApiResponse;
import com.ridehub.dto.BookingResponse;
import com.ridehub.dto.CreateBookingRequest;
import com.ridehub.security.UserPrincipal;
import com.ridehub.service.BookingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Bookings", description = "Endpoints for booking requests, driver confirmations, and cancellations")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping("/rides/{rideId}/bookings")
    @Operation(summary = "Request seats on a ride as a passenger")
    public ResponseEntity<ApiResponse<BookingResponse>> createBooking(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long rideId,
            @Valid @RequestBody CreateBookingRequest request) {
        BookingResponse booking = bookingService.createBooking(principal.getId(), rideId, request);
        return new ResponseEntity<>(ApiResponse.ok("Booking request submitted successfully", booking), HttpStatus.CREATED);
    }

    @GetMapping("/bookings/my")
    @Operation(summary = "Get all bookings requested by current passenger")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getMyBookings(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<BookingResponse> bookings = bookingService.getMyBookings(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok("Bookings retrieved", bookings));
    }

    @GetMapping("/rides/{rideId}/bookings")
    @Operation(summary = "Get all passenger bookings for a driver's ride")
    public ResponseEntity<ApiResponse<List<BookingResponse>>> getRideBookings(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long rideId) {
        List<BookingResponse> bookings = bookingService.getRideBookings(principal.getId(), rideId);
        return ResponseEntity.ok(ApiResponse.ok("Ride bookings retrieved", bookings));
    }

    @PatchMapping("/bookings/{id}/confirm")
    @Operation(summary = "Confirm a pending booking request (driver only)")
    public ResponseEntity<ApiResponse<BookingResponse>> confirmBooking(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        BookingResponse booking = bookingService.confirmBooking(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Booking confirmed successfully", booking));
    }

    @PatchMapping("/bookings/{id}/reject")
    @Operation(summary = "Reject a pending booking request (driver only)")
    public ResponseEntity<ApiResponse<BookingResponse>> rejectBooking(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        BookingResponse booking = bookingService.rejectBooking(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Booking rejected", booking));
    }

    @PatchMapping("/bookings/{id}/cancel")
    @Operation(summary = "Cancel a booking (allowed by passenger or driver)")
    public ResponseEntity<ApiResponse<BookingResponse>> cancelBooking(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        BookingResponse booking = bookingService.cancelBooking(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Booking cancelled successfully", booking));
    }
}

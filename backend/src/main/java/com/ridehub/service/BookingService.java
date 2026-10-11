package com.ridehub.service;

import com.ridehub.dto.BookingResponse;
import com.ridehub.dto.CreateBookingRequest;
import com.ridehub.exception.BadRequestException;
import com.ridehub.exception.ForbiddenException;
import com.ridehub.exception.InsufficientSeatsException;
import com.ridehub.exception.ResourceNotFoundException;
import com.ridehub.model.Booking;
import com.ridehub.model.BookingStatus;
import com.ridehub.model.Ride;
import com.ridehub.model.RideStatus;
import com.ridehub.model.User;
import com.ridehub.repository.BookingRepository;
import com.ridehub.repository.RideRepository;
import com.ridehub.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final RideRepository rideRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public BookingService(BookingRepository bookingRepository,
                          RideRepository rideRepository,
                          UserRepository userRepository,
                          NotificationService notificationService) {
        this.bookingRepository = bookingRepository;
        this.rideRepository = rideRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public BookingResponse createBooking(Long passengerId, Long rideId, CreateBookingRequest request) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found with id: " + rideId));

        if (ride.getDriverId().equals(passengerId)) {
            throw new BadRequestException("Drivers cannot book seats on their own ride");
        }

        if (ride.getStatus() != RideStatus.OPEN) {
            throw new BadRequestException("Ride is not open for bookings (status: " + ride.getStatus() + ")");
        }

        if (request.getSeatsRequested() <= 0) {
            throw new BadRequestException("Requested seats must be greater than 0");
        }

        if (request.getSeatsRequested() > ride.getAvailableSeats()) {
            throw new InsufficientSeatsException("Requested seats (" + request.getSeatsRequested() +
                    ") exceeds available seats (" + ride.getAvailableSeats() + ")");
        }

        if (bookingRepository.existsActiveBooking(rideId, passengerId)) {
            throw new BadRequestException("You already have an active or pending booking for this ride");
        }

        BigDecimal totalPrice = ride.getPricePerSeat().multiply(BigDecimal.valueOf(request.getSeatsRequested()));

        Booking booking = new Booking();
        booking.setRideId(rideId);
        booking.setPassengerId(passengerId);
        booking.setSeatsRequested(request.getSeatsRequested());
        booking.setTotalPrice(totalPrice);
        booking.setStatus(BookingStatus.PENDING);

        Booking saved = bookingRepository.save(booking);

        // Notify driver of pending request
        User passenger = userRepository.findById(passengerId).orElse(null);
        String passengerName = passenger != null ? passenger.getFullName() : "A passenger";
        notificationService.createNotification(
                ride.getDriverId(),
                "New Booking Request",
                passengerName + " requested " + request.getSeatsRequested() + " seat(s) on your ride from " +
                ride.getOrigin() + " to " + ride.getDestination() + "."
        );

        User driver = userRepository.findById(ride.getDriverId()).orElse(null);
        return mapToResponse(saved, ride, passenger, driver);
    }

    @Transactional
    public BookingResponse confirmBooking(Long driverId, Long bookingId) {
        Booking booking = bookingRepository.findByIdForUpdate(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        Ride ride = rideRepository.findByIdForUpdate(booking.getRideId())
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found with id: " + booking.getRideId()));

        if (!ride.getDriverId().equals(driverId)) {
            throw new ForbiddenException("You are not authorized to confirm bookings for this ride");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Booking is not pending (current status: " + booking.getStatus() + ")");
        }

        // Deduct seats atomically
        int updated = rideRepository.decrementSeatsConditionally(ride.getId(), booking.getSeatsRequested());
        if (updated == 0) {
            throw new InsufficientSeatsException("Not enough seats available to confirm this booking");
        }

        bookingRepository.updateStatus(bookingId, BookingStatus.CONFIRMED);
        booking.setStatus(BookingStatus.CONFIRMED);

        // Notify passenger of confirmation
        notificationService.createNotification(
                booking.getPassengerId(),
                "Booking Confirmed!",
                "Your booking for " + booking.getSeatsRequested() + " seat(s) on the ride from " +
                ride.getOrigin() + " to " + ride.getDestination() + " has been confirmed by the driver."
        );

        User passenger = userRepository.findById(booking.getPassengerId()).orElse(null);
        User driver = userRepository.findById(driverId).orElse(null);
        return mapToResponse(booking, ride, passenger, driver);
    }

    @Transactional
    public BookingResponse rejectBooking(Long driverId, Long bookingId) {
        Booking booking = bookingRepository.findByIdForUpdate(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        Ride ride = rideRepository.findById(booking.getRideId())
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found with id: " + booking.getRideId()));

        if (!ride.getDriverId().equals(driverId)) {
            throw new ForbiddenException("You are not authorized to reject bookings for this ride");
        }

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new BadRequestException("Only pending bookings can be rejected (current status: " + booking.getStatus() + ")");
        }

        bookingRepository.updateStatus(bookingId, BookingStatus.REJECTED);
        booking.setStatus(BookingStatus.REJECTED);

        // Notify passenger of rejection
        notificationService.createNotification(
                booking.getPassengerId(),
                "Booking Declined",
                "Your booking request for the ride from " + ride.getOrigin() + " to " +
                ride.getDestination() + " was declined by the driver."
        );

        User passenger = userRepository.findById(booking.getPassengerId()).orElse(null);
        User driver = userRepository.findById(driverId).orElse(null);
        return mapToResponse(booking, ride, passenger, driver);
    }

    @Transactional
    public BookingResponse cancelBooking(Long userId, Long bookingId) {
        Booking booking = bookingRepository.findByIdForUpdate(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));

        Ride ride = rideRepository.findByIdForUpdate(booking.getRideId())
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found with id: " + booking.getRideId()));

        boolean isPassenger = booking.getPassengerId().equals(userId);
        boolean isDriver = ride.getDriverId().equals(userId);

        if (!isPassenger && !isDriver) {
            throw new ForbiddenException("You are not authorized to cancel this booking");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled");
        }

        if (booking.getStatus() == BookingStatus.REJECTED) {
            throw new BadRequestException("Cannot cancel a rejected booking");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel an already completed ride booking");
        }

        // If booking was CONFIRMED, restore seats to ride atomically
        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            rideRepository.incrementSeats(ride.getId(), booking.getSeatsRequested());
        }

        bookingRepository.updateStatus(bookingId, BookingStatus.CANCELLED);
        booking.setStatus(BookingStatus.CANCELLED);

        // Notify the opposite party
        if (isPassenger) {
            User passenger = userRepository.findById(userId).orElse(null);
            String name = passenger != null ? passenger.getFullName() : "A passenger";
            notificationService.createNotification(
                    ride.getDriverId(),
                    "Booking Cancelled",
                    name + " cancelled their booking for " + booking.getSeatsRequested() +
                    " seat(s) on your ride to " + ride.getDestination() + "."
            );
        } else {
            notificationService.createNotification(
                    booking.getPassengerId(),
                    "Booking Cancelled by Driver",
                    "Your booking for the ride from " + ride.getOrigin() + " to " +
                    ride.getDestination() + " has been cancelled by the driver."
            );
        }

        User passenger = userRepository.findById(booking.getPassengerId()).orElse(null);
        User driver = userRepository.findById(ride.getDriverId()).orElse(null);
        return mapToResponse(booking, ride, passenger, driver);
    }

    public List<BookingResponse> getMyBookings(Long passengerId) {
        List<Booking> bookings = bookingRepository.findByPassengerId(passengerId);
        User passenger = userRepository.findById(passengerId).orElse(null);

        return bookings.stream().map(b -> {
            Ride ride = rideRepository.findById(b.getRideId()).orElse(null);
            User driver = (ride != null) ? userRepository.findById(ride.getDriverId()).orElse(null) : null;
            return mapToResponse(b, ride, passenger, driver);
        }).collect(Collectors.toList());
    }

    public List<BookingResponse> getRideBookings(Long driverId, Long rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found with id: " + rideId));

        if (!ride.getDriverId().equals(driverId)) {
            throw new ForbiddenException("You are not authorized to view bookings for this ride");
        }

        User driver = userRepository.findById(driverId).orElse(null);
        List<Booking> bookings = bookingRepository.findByRideId(rideId);

        return bookings.stream().map(b -> {
            User passenger = userRepository.findById(b.getPassengerId()).orElse(null);
            return mapToResponse(b, ride, passenger, driver);
        }).collect(Collectors.toList());
    }

    private BookingResponse mapToResponse(Booking b, Ride r, User passenger, User driver) {
        BookingResponse res = new BookingResponse();
        res.setId(b.getId());
        res.setRideId(b.getRideId());
        if (r != null) {
            res.setOrigin(r.getOrigin());
            res.setDestination(r.getDestination());
            res.setDepartureTime(r.getDepartureTime());
            res.setDriverId(r.getDriverId());
        }
        res.setPassengerId(b.getPassengerId());
        if (passenger != null) {
            res.setPassengerName(passenger.getFullName());
            res.setPassengerPhone(passenger.getPhone());
        }
        if (driver != null) {
            res.setDriverName(driver.getFullName());
            res.setDriverPhone(driver.getPhone());
        }
        res.setSeatsRequested(b.getSeatsRequested());
        res.setTotalPrice(b.getTotalPrice());
        res.setStatus(b.getStatus());
        res.setRequestedAt(b.getRequestedAt());
        res.setUpdatedAt(b.getUpdatedAt());
        return res;
    }
}

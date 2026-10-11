package com.ridehub.service;

import com.ridehub.dto.CreateRideRequest;
import com.ridehub.dto.PagedResponse;
import com.ridehub.dto.RideResponse;
import com.ridehub.dto.RideSearchCriteria;
import com.ridehub.dto.UpdateRideRequest;
import com.ridehub.exception.BadRequestException;
import com.ridehub.exception.ForbiddenException;
import com.ridehub.exception.ResourceNotFoundException;
import com.ridehub.model.Booking;
import com.ridehub.model.BookingStatus;
import com.ridehub.model.Ride;
import com.ridehub.model.RideStatus;
import com.ridehub.model.RoleType;
import com.ridehub.model.User;
import com.ridehub.repository.BookingRepository;
import com.ridehub.repository.ReviewRepository;
import com.ridehub.repository.RideRepository;
import com.ridehub.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RideService {

    private final RideRepository rideRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;
    private final NotificationService notificationService;

    public RideService(RideRepository rideRepository,
                       UserRepository userRepository,
                       BookingRepository bookingRepository,
                       ReviewRepository reviewRepository,
                       NotificationService notificationService) {
        this.rideRepository = rideRepository;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.reviewRepository = reviewRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public RideResponse createRide(Long driverId, CreateRideRequest request) {
        User driver = userRepository.findById(driverId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        if (!driver.getRoles().contains(RoleType.ROLE_DRIVER.name())) {
            // Automatically add driver role
            userRepository.addRole(driverId, RoleType.ROLE_DRIVER.name());
        }

        if (request.getDepartureTime().isBefore(OffsetDateTime.now())) {
            throw new BadRequestException("Departure time must be in the future");
        }

        Ride ride = new Ride();
        ride.setDriverId(driverId);
        ride.setOrigin(request.getOrigin().trim());
        ride.setDestination(request.getDestination().trim());
        ride.setOriginLatitude(request.getOriginLatitude());
        ride.setOriginLongitude(request.getOriginLongitude());
        ride.setDestinationLatitude(request.getDestinationLatitude());
        ride.setDestinationLongitude(request.getDestinationLongitude());
        ride.setDepartureTime(request.getDepartureTime());
        ride.setEstimatedArrivalTime(request.getEstimatedArrivalTime());
        ride.setTotalSeats(request.getTotalSeats());
        ride.setAvailableSeats(request.getTotalSeats());
        ride.setPricePerSeat(request.getPricePerSeat());
        ride.setDescription(request.getDescription());
        ride.setStatus(RideStatus.OPEN);

        Ride saved = rideRepository.save(ride);
        return mapToRideResponse(saved, driver);
    }

    public RideResponse getRideById(Long id) {
        Ride ride = rideRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found with id: " + id));

        User driver = userRepository.findById(ride.getDriverId()).orElse(null);
        return mapToRideResponse(ride, driver);
    }

    public PagedResponse<RideResponse> searchRides(RideSearchCriteria criteria) {
        List<Ride> rides = rideRepository.searchRides(criteria);
        long total = rideRepository.countSearchRides(criteria);

        List<RideResponse> content = rides.stream()
                .map(r -> {
                    User driver = userRepository.findById(r.getDriverId()).orElse(null);
                    return mapToRideResponse(r, driver);
                })
                .collect(Collectors.toList());

        return new PagedResponse<>(content, criteria.getPage(), criteria.getSize(), total);
    }

    public List<RideResponse> getMyRides(Long driverId) {
        User driver = userRepository.findById(driverId).orElse(null);
        return rideRepository.findByDriverId(driverId).stream()
                .map(r -> mapToRideResponse(r, driver))
                .collect(Collectors.toList());
    }

    @Transactional
    public RideResponse updateRide(Long driverId, Long rideId, UpdateRideRequest request) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found with id: " + rideId));

        if (!ride.getDriverId().equals(driverId)) {
            throw new ForbiddenException("You are not authorized to update this ride");
        }

        if (ride.getStatus() == RideStatus.COMPLETED || ride.getStatus() == RideStatus.CANCELLED) {
            throw new BadRequestException("Cannot update a ride that is already " + ride.getStatus());
        }

        if (request.getOrigin() != null) ride.setOrigin(request.getOrigin().trim());
        if (request.getDestination() != null) ride.setDestination(request.getDestination().trim());
        if (request.getDepartureTime() != null) ride.setDepartureTime(request.getDepartureTime());
        if (request.getEstimatedArrivalTime() != null) ride.setEstimatedArrivalTime(request.getEstimatedArrivalTime());
        if (request.getPricePerSeat() != null) ride.setPricePerSeat(request.getPricePerSeat());
        if (request.getDescription() != null) ride.setDescription(request.getDescription());

        if (request.getTotalSeats() != null) {
            int bookedSeats = ride.getTotalSeats() - ride.getAvailableSeats();
            if (request.getTotalSeats() < bookedSeats) {
                throw new BadRequestException("Cannot reduce total seats below already booked seats (" + bookedSeats + ")");
            }
            ride.setTotalSeats(request.getTotalSeats());
            ride.setAvailableSeats(request.getTotalSeats() - bookedSeats);
            if (ride.getAvailableSeats() == 0) {
                ride.setStatus(RideStatus.FULL);
            } else if (ride.getStatus() == RideStatus.FULL && ride.getAvailableSeats() > 0) {
                ride.setStatus(RideStatus.OPEN);
            }
        }

        rideRepository.update(ride);
        User driver = userRepository.findById(driverId).orElse(null);
        return mapToRideResponse(ride, driver);
    }

    @Transactional
    public void cancelRide(Long driverId, Long rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found with id: " + rideId));

        if (!ride.getDriverId().equals(driverId)) {
            throw new ForbiddenException("You are not authorized to cancel this ride");
        }

        if (ride.getStatus() == RideStatus.CANCELLED) {
            throw new BadRequestException("Ride is already cancelled");
        }
        if (ride.getStatus() == RideStatus.COMPLETED) {
            throw new BadRequestException("Cannot cancel an already completed ride");
        }

        rideRepository.updateStatus(rideId, RideStatus.CANCELLED);

        // Cancel all active bookings and notify passengers
        List<Booking> bookings = bookingRepository.findByRideId(rideId);
        for (Booking booking : bookings) {
            if (booking.getStatus() == BookingStatus.PENDING || booking.getStatus() == BookingStatus.CONFIRMED) {
                bookingRepository.updateStatus(booking.getId(), BookingStatus.CANCELLED);
                notificationService.createNotification(
                        booking.getPassengerId(),
                        "Ride Cancelled by Driver",
                        "The ride from " + ride.getOrigin() + " to " + ride.getDestination() + " scheduled for " +
                        ride.getDepartureTime() + " has been cancelled by the driver."
                );
            }
        }
    }

    @Transactional
    public void completeRide(Long driverId, Long rideId) {
        Ride ride = rideRepository.findById(rideId)
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found with id: " + rideId));

        if (!ride.getDriverId().equals(driverId)) {
            throw new ForbiddenException("You are not authorized to complete this ride");
        }

        if (ride.getStatus() == RideStatus.COMPLETED) {
            throw new BadRequestException("Ride is already marked as completed");
        }
        if (ride.getStatus() == RideStatus.CANCELLED) {
            throw new BadRequestException("Cannot complete a cancelled ride");
        }

        rideRepository.updateStatus(rideId, RideStatus.COMPLETED);

        // Mark all confirmed bookings as COMPLETED and invite reviews
        List<Booking> bookings = bookingRepository.findByRideId(rideId);
        for (Booking booking : bookings) {
            if (booking.getStatus() == BookingStatus.CONFIRMED) {
                bookingRepository.updateStatus(booking.getId(), BookingStatus.COMPLETED);
                notificationService.createNotification(
                        booking.getPassengerId(),
                        "Ride Completed - Leave a Review",
                        "Your ride from " + ride.getOrigin() + " to " + ride.getDestination() +
                        " has been completed. Please rate your driver to help the community!"
                );
            }
        }
    }

    public RideResponse mapToRideResponse(Ride ride, User driver) {
        RideResponse res = new RideResponse();
        res.setId(ride.getId());
        res.setDriverId(ride.getDriverId());
        if (driver != null) {
            res.setDriverName(driver.getFullName());
            res.setDriverPhone(driver.getPhone());
            res.setDriverRating(reviewRepository.calculateAverageRating(driver.getId()));
        }
        res.setOrigin(ride.getOrigin());
        res.setDestination(ride.getDestination());
        res.setOriginLatitude(ride.getOriginLatitude());
        res.setOriginLongitude(ride.getOriginLongitude());
        res.setDestinationLatitude(ride.getDestinationLatitude());
        res.setDestinationLongitude(ride.getDestinationLongitude());
        res.setDepartureTime(ride.getDepartureTime());
        res.setEstimatedArrivalTime(ride.getEstimatedArrivalTime());
        res.setTotalSeats(ride.getTotalSeats());
        res.setAvailableSeats(ride.getAvailableSeats());
        res.setPricePerSeat(ride.getPricePerSeat());
        res.setDescription(ride.getDescription());
        res.setStatus(ride.getStatus());
        res.setCreatedAt(ride.getCreatedAt());
        return res;
    }
}

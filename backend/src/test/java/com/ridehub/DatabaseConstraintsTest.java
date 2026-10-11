package com.ridehub;

import com.ridehub.dto.CreateReviewRequest;
import com.ridehub.exception.BadRequestException;
import com.ridehub.model.AccountStatus;
import com.ridehub.model.Booking;
import com.ridehub.model.BookingStatus;
import com.ridehub.model.Ride;
import com.ridehub.model.RideStatus;
import com.ridehub.model.User;
import com.ridehub.repository.BookingRepository;
import com.ridehub.repository.RideRepository;
import com.ridehub.repository.UserRepository;
import com.ridehub.service.ReviewService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class DatabaseConstraintsTest {

    @Autowired
    private ReviewService reviewService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RideRepository rideRepository;

    @Autowired
    private BookingRepository bookingRepository;

    @Test
    @DisplayName("Review submission should be rejected if ride is not completed")
    void testReviewRejectedIfNotCompleted() {
        long t = System.currentTimeMillis();
        User driver = new User();
        driver.setFullName("Driver D");
        driver.setEmail("driver.d." + t + "@test.com");
        driver.setPasswordHash("hash");
        driver.setAccountStatus(AccountStatus.ACTIVE);
        driver.setRoles(Set.of("ROLE_DRIVER"));
        driver = userRepository.save(driver);

        User passenger = new User();
        passenger.setFullName("Passenger P");
        passenger.setEmail("passenger.p." + t + "@test.com");
        passenger.setPasswordHash("hash");
        passenger.setAccountStatus(AccountStatus.ACTIVE);
        passenger.setRoles(Set.of("ROLE_PASSENGER"));
        passenger = userRepository.save(passenger);

        Ride ride = new Ride();
        ride.setDriverId(driver.getId());
        ride.setOrigin("Chicago, IL");
        ride.setDestination("Madison, WI");
        ride.setDepartureTime(OffsetDateTime.now().plusDays(2));
        ride.setTotalSeats(3);
        ride.setAvailableSeats(3);
        ride.setPricePerSeat(new BigDecimal("20.00"));
        ride.setStatus(RideStatus.OPEN); // NOT COMPLETED
        ride = rideRepository.save(ride);

        CreateReviewRequest req = new CreateReviewRequest();
        req.setRideId(ride.getId());
        req.setReviewedUserId(driver.getId());
        req.setRating(5);
        req.setComment("Great driver!");

        User finalPassenger = passenger;
        assertThrows(BadRequestException.class, () ->
                reviewService.createReview(finalPassenger.getId(), req)
        );
    }
}

package com.ridehub;

import com.ridehub.dto.BookingResponse;
import com.ridehub.dto.CreateBookingRequest;
import com.ridehub.dto.CreateRideRequest;
import com.ridehub.dto.PagedResponse;
import com.ridehub.dto.RideResponse;
import com.ridehub.dto.RideSearchCriteria;
import com.ridehub.exception.BadRequestException;
import com.ridehub.exception.ForbiddenException;
import com.ridehub.exception.InsufficientSeatsException;
import com.ridehub.model.AccountStatus;
import com.ridehub.model.BookingStatus;
import com.ridehub.model.RideStatus;
import com.ridehub.model.User;
import com.ridehub.repository.UserRepository;
import com.ridehub.service.BookingService;
import com.ridehub.service.RideService;
import org.junit.jupiter.api.BeforeEach;
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
public class RideAndBookingLogicTest {

    @Autowired
    private RideService rideService;

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserRepository userRepository;

    private User driver;
    private User passenger;
    private User anotherDriver;

    @BeforeEach
    void setUp() {
        long timestamp = System.currentTimeMillis();

        driver = new User();
        driver.setFullName("Driver One");
        driver.setEmail("driver." + timestamp + "@test.com");
        driver.setPasswordHash("hash");
        driver.setAccountStatus(AccountStatus.ACTIVE);
        driver.setRoles(Set.of("ROLE_DRIVER", "ROLE_PASSENGER"));
        driver = userRepository.save(driver);

        passenger = new User();
        passenger.setFullName("Passenger One");
        passenger.setEmail("passenger." + timestamp + "@test.com");
        passenger.setPasswordHash("hash");
        passenger.setAccountStatus(AccountStatus.ACTIVE);
        passenger.setRoles(Set.of("ROLE_PASSENGER"));
        passenger = userRepository.save(passenger);

        anotherDriver = new User();
        anotherDriver.setFullName("Driver Two");
        anotherDriver.setEmail("driver2." + timestamp + "@test.com");
        anotherDriver.setPasswordHash("hash");
        anotherDriver.setAccountStatus(AccountStatus.ACTIVE);
        anotherDriver.setRoles(Set.of("ROLE_DRIVER", "ROLE_PASSENGER"));
        anotherDriver = userRepository.save(anotherDriver);
    }

    @Test
    @DisplayName("Should create and search rides successfully")
    void testCreateAndSearchRides() {
        CreateRideRequest request = new CreateRideRequest();
        request.setOrigin("San Francisco, CA");
        request.setDestination("San Jose, CA");
        request.setDepartureTime(OffsetDateTime.now().plusDays(2));
        request.setEstimatedArrivalTime(OffsetDateTime.now().plusDays(2).plusHours(1));
        request.setTotalSeats(3);
        request.setPricePerSeat(new BigDecimal("25.00"));
        request.setDescription("Daily commute via US-101");

        RideResponse created = rideService.createRide(driver.getId(), request);
        assertNotNull(created.getId());
        assertEquals(3, created.getAvailableSeats());
        assertEquals(RideStatus.OPEN, created.getStatus());

        RideSearchCriteria criteria = new RideSearchCriteria();
        criteria.setOrigin("Francisco");
        criteria.setDestination("Jose");
        PagedResponse<RideResponse> searchResults = rideService.searchRides(criteria);

        assertTrue(searchResults.getContent().stream().anyMatch(r -> r.getId().equals(created.getId())));
    }

    @Test
    @DisplayName("Driver cannot book seats on their own ride")
    void testDriverCannotBookOwnRide() {
        CreateRideRequest rideReq = new CreateRideRequest();
        rideReq.setOrigin("Seattle, WA");
        rideReq.setDestination("Portland, OR");
        rideReq.setDepartureTime(OffsetDateTime.now().plusDays(1));
        rideReq.setTotalSeats(4);
        rideReq.setPricePerSeat(new BigDecimal("30.00"));

        RideResponse ride = rideService.createRide(driver.getId(), rideReq);

        CreateBookingRequest bookReq = new CreateBookingRequest(1);
        assertThrows(BadRequestException.class, () ->
                bookingService.createBooking(driver.getId(), ride.getId(), bookReq)
        );
    }

    @Test
    @DisplayName("Should prevent booking with insufficient seats")
    void testInsufficientSeatsBooking() {
        CreateRideRequest rideReq = new CreateRideRequest();
        rideReq.setOrigin("Austin, TX");
        rideReq.setDestination("Dallas, TX");
        rideReq.setDepartureTime(OffsetDateTime.now().plusDays(3));
        rideReq.setTotalSeats(2);
        rideReq.setPricePerSeat(new BigDecimal("20.00"));

        RideResponse ride = rideService.createRide(driver.getId(), rideReq);

        CreateBookingRequest bookReq = new CreateBookingRequest(5); // Requests 5 seats, only 2 available
        assertThrows(InsufficientSeatsException.class, () ->
                bookingService.createBooking(passenger.getId(), ride.getId(), bookReq)
        );
    }

    @Test
    @DisplayName("Should execute atomic seat deduction upon confirmation, block repeated confirmations, and restore seats on cancellation")
    void testBookingConfirmationAndCancellationLifecycle() {
        CreateRideRequest rideReq = new CreateRideRequest();
        rideReq.setOrigin("Boston, MA");
        rideReq.setDestination("New York, NY");
        rideReq.setDepartureTime(OffsetDateTime.now().plusDays(4));
        rideReq.setTotalSeats(3);
        rideReq.setPricePerSeat(new BigDecimal("45.00"));

        RideResponse ride = rideService.createRide(driver.getId(), rideReq);
        assertEquals(3, ride.getAvailableSeats());

        // 1. Passenger requests 2 seats
        CreateBookingRequest bookReq = new CreateBookingRequest(2);
        BookingResponse booking = bookingService.createBooking(passenger.getId(), ride.getId(), bookReq);
        assertEquals(BookingStatus.PENDING, booking.getStatus());
        assertEquals(new BigDecimal("90.00"), booking.getTotalPrice());

        // 2. Another driver cannot confirm this booking
        assertThrows(ForbiddenException.class, () ->
                bookingService.confirmBooking(anotherDriver.getId(), booking.getId())
        );

        // 3. Right driver confirms booking
        BookingResponse confirmed = bookingService.confirmBooking(driver.getId(), booking.getId());
        assertEquals(BookingStatus.CONFIRMED, confirmed.getStatus());

        // Verify available seats reduced by 2
        RideResponse updatedRide = rideService.getRideById(ride.getId());
        assertEquals(1, updatedRide.getAvailableSeats());

        // 4. Repeated confirmation should be rejected
        assertThrows(BadRequestException.class, () ->
                bookingService.confirmBooking(driver.getId(), booking.getId())
        );

        // 5. Cancellation restores seats atomically
        BookingResponse cancelled = bookingService.cancelBooking(passenger.getId(), booking.getId());
        assertEquals(BookingStatus.CANCELLED, cancelled.getStatus());

        RideResponse restoredRide = rideService.getRideById(ride.getId());
        assertEquals(3, restoredRide.getAvailableSeats());
    }
}

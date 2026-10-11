package com.ridehub.service;

import com.ridehub.dto.CreateReviewRequest;
import com.ridehub.dto.ReviewResponse;
import com.ridehub.exception.BadRequestException;
import com.ridehub.exception.ConflictException;
import com.ridehub.exception.ForbiddenException;
import com.ridehub.exception.ResourceNotFoundException;
import com.ridehub.model.Booking;
import com.ridehub.model.BookingStatus;
import com.ridehub.model.Review;
import com.ridehub.model.Ride;
import com.ridehub.model.RideStatus;
import com.ridehub.model.User;
import com.ridehub.repository.BookingRepository;
import com.ridehub.repository.ReviewRepository;
import com.ridehub.repository.RideRepository;
import com.ridehub.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final RideRepository rideRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ReviewService(ReviewRepository reviewRepository,
                         RideRepository rideRepository,
                         BookingRepository bookingRepository,
                         UserRepository userRepository,
                         NotificationService notificationService) {
        this.reviewRepository = reviewRepository;
        this.rideRepository = rideRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public ReviewResponse createReview(Long reviewerId, CreateReviewRequest request) {
        if (reviewerId.equals(request.getReviewedUserId())) {
            throw new BadRequestException("You cannot review yourself");
        }

        Ride ride = rideRepository.findById(request.getRideId())
                .orElseThrow(() -> new ResourceNotFoundException("Ride not found with id: " + request.getRideId()));

        if (ride.getStatus() != RideStatus.COMPLETED) {
            throw new BadRequestException("Reviews are only allowed after a completed ride");
        }

        // Check participation
        boolean isDriver = ride.getDriverId().equals(reviewerId);
        List<Booking> rideBookings = bookingRepository.findByRideId(ride.getId());

        boolean isPassenger = rideBookings.stream().anyMatch(b ->
                b.getPassengerId().equals(reviewerId) &&
                (b.getStatus() == BookingStatus.COMPLETED || b.getStatus() == BookingStatus.CONFIRMED));

        if (!isDriver && !isPassenger) {
            throw new ForbiddenException("Only verified participants of this completed ride can submit a review");
        }

        // Validate reviewed user was part of the ride
        boolean reviewedUserIsDriver = ride.getDriverId().equals(request.getReviewedUserId());
        boolean reviewedUserIsPassenger = rideBookings.stream().anyMatch(b ->
                b.getPassengerId().equals(request.getReviewedUserId()) &&
                (b.getStatus() == BookingStatus.COMPLETED || b.getStatus() == BookingStatus.CONFIRMED));

        if (!reviewedUserIsDriver && !reviewedUserIsPassenger) {
            throw new BadRequestException("The reviewed user was not a participant on this ride");
        }

        if (reviewRepository.exists(request.getRideId(), reviewerId, request.getReviewedUserId())) {
            throw new ConflictException("You have already reviewed this participant for this ride");
        }

        Review review = new Review();
        review.setRideId(request.getRideId());
        review.setReviewerId(reviewerId);
        review.setReviewedUserId(request.getReviewedUserId());
        review.setRating(request.getRating());
        review.setComment(request.getComment() != null ? request.getComment().trim() : null);

        Review saved = reviewRepository.save(review);

        // Notify reviewed user
        User reviewer = userRepository.findById(reviewerId).orElse(null);
        String reviewerName = (reviewer != null) ? reviewer.getFullName() : "A participant";
        notificationService.createNotification(
                request.getReviewedUserId(),
                "New Review Received",
                reviewerName + " left you a " + request.getRating() + "-star rating!"
        );

        User reviewedUser = userRepository.findById(request.getReviewedUserId()).orElse(null);
        return mapToResponse(saved, reviewer, reviewedUser);
    }

    public List<ReviewResponse> getUserReviews(Long userId) {
        User reviewedUser = userRepository.findById(userId).orElse(null);
        return reviewRepository.findByReviewedUserId(userId).stream()
                .map(r -> {
                    User reviewer = userRepository.findById(r.getReviewerId()).orElse(null);
                    return mapToResponse(r, reviewer, reviewedUser);
                })
                .collect(Collectors.toList());
    }

    private ReviewResponse mapToResponse(Review r, User reviewer, User reviewedUser) {
        ReviewResponse res = new ReviewResponse();
        res.setId(r.getId());
        res.setRideId(r.getRideId());
        res.setReviewerId(r.getReviewerId());
        if (reviewer != null) {
            res.setReviewerName(reviewer.getFullName());
        }
        res.setReviewedUserId(r.getReviewedUserId());
        if (reviewedUser != null) {
            res.setReviewedUserName(reviewedUser.getFullName());
        }
        res.setRating(r.getRating());
        res.setComment(r.getComment());
        res.setCreatedAt(r.getCreatedAt());
        return res;
    }
}

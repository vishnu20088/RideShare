package com.ridehub.service;

import com.ridehub.dto.PublicProfileResponse;
import com.ridehub.dto.UpdateProfileRequest;
import com.ridehub.dto.UserProfileResponse;
import com.ridehub.exception.ResourceNotFoundException;
import com.ridehub.model.User;
import com.ridehub.repository.ReviewRepository;
import com.ridehub.repository.RideRepository;
import com.ridehub.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final RideRepository rideRepository;

    public UserService(UserRepository userRepository,
                       ReviewRepository reviewRepository,
                       RideRepository rideRepository) {
        this.userRepository = userRepository;
        this.reviewRepository = reviewRepository;
        this.rideRepository = rideRepository;
    }

    public UserProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        return mapToProfileResponse(user);
    }

    @Transactional
    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        user.setFullName(request.getFullName().trim());
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone().trim());
        }
        userRepository.update(user);

        return mapToProfileResponse(user);
    }

    public PublicProfileResponse getPublicProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        BigDecimal avgRating = reviewRepository.calculateAverageRating(userId);
        int totalReviews = reviewRepository.countReviewsForUser(userId);
        int ridesCount = rideRepository.countRidesAsDriver(userId);

        return new PublicProfileResponse(
                user.getId(),
                user.getFullName(),
                avgRating,
                totalReviews,
                ridesCount
        );
    }

    private UserProfileResponse mapToProfileResponse(User user) {
        return new UserProfileResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRoles(),
                user.getAccountStatus(),
                user.getCreatedAt()
        );
    }
}

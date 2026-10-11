package com.ridehub.controller;

import com.ridehub.dto.ApiResponse;
import com.ridehub.dto.CreateReviewRequest;
import com.ridehub.dto.ReviewResponse;
import com.ridehub.security.UserPrincipal;
import com.ridehub.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Reviews", description = "Endpoints for leaving and browsing verified ride participant reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping("/reviews")
    @Operation(summary = "Submit a review for a completed ride participant")
    public ResponseEntity<ApiResponse<ReviewResponse>> createReview(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateReviewRequest request) {
        ReviewResponse review = reviewService.createReview(principal.getId(), request);
        return new ResponseEntity<>(ApiResponse.ok("Review submitted successfully", review), HttpStatus.CREATED);
    }

    @GetMapping("/users/{id}/reviews")
    @Operation(summary = "Get all reviews received by a user")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getUserReviews(@PathVariable Long id) {
        List<ReviewResponse> reviews = reviewService.getUserReviews(id);
        return ResponseEntity.ok(ApiResponse.ok("Reviews retrieved", reviews));
    }
}

package com.ridehub.service;

import com.ridehub.dto.AuthResponse;
import com.ridehub.dto.LoginRequest;
import com.ridehub.dto.RegisterRequest;
import com.ridehub.dto.UserSummaryResponse;
import com.ridehub.exception.BadRequestException;
import com.ridehub.exception.ConflictException;
import com.ridehub.exception.UnauthorizedException;
import com.ridehub.model.AccountStatus;
import com.ridehub.model.RoleType;
import com.ridehub.model.User;
import com.ridehub.repository.UserRepository;
import com.ridehub.security.JwtTokenProvider;
import com.ridehub.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final NotificationService notificationService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider tokenProvider,
                       NotificationService notificationService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.tokenProvider = tokenProvider;
        this.notificationService = notificationService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Email is already in use: " + email);
        }

        User user = new User();
        user.setFullName(request.getFullName().trim());
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        user.setAccountStatus(AccountStatus.ACTIVE);

        Set<String> roles = new HashSet<>();
        roles.add(RoleType.ROLE_PASSENGER.name());
        if (request.isRegisterAsDriver()) {
            roles.add(RoleType.ROLE_DRIVER.name());
        }
        user.setRoles(roles);

        User savedUser = userRepository.save(user);

        // Send welcome notification
        notificationService.createNotification(
                savedUser.getId(),
                "Welcome to RideHub!",
                "Your account has been created successfully. Start exploring or offering rides today."
        );

        String token = tokenProvider.generateToken(savedUser.getEmail(), savedUser.getId(), savedUser.getRoles());
        UserSummaryResponse summary = mapToSummary(savedUser);

        return new AuthResponse(token, summary);
    }

    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, request.getPassword())
            );

            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(principal.getId())
                    .orElseThrow(() -> new UnauthorizedException("User not found"));

            if (user.getAccountStatus() == AccountStatus.SUSPENDED) {
                throw new BadRequestException("Account is suspended. Please contact platform support.");
            }

            String token = tokenProvider.generateToken(user.getEmail(), user.getId(), user.getRoles());
            UserSummaryResponse summary = mapToSummary(user);

            return new AuthResponse(token, summary);
        } catch (BadCredentialsException e) {
            throw new BadCredentialsException("Invalid email or password");
        }
    }

    public UserSummaryResponse getCurrentUser(UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        return mapToSummary(user);
    }

    public UserSummaryResponse mapToSummary(User user) {
        return new UserSummaryResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getRoles(),
                user.getAccountStatus()
        );
    }
}

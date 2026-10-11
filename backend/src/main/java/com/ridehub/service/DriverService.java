package com.ridehub.service;

import com.ridehub.dto.DriverProfileRequest;
import com.ridehub.dto.DriverProfileResponse;
import com.ridehub.dto.VehicleRequest;
import com.ridehub.dto.VehicleResponse;
import com.ridehub.exception.ConflictException;
import com.ridehub.exception.ResourceNotFoundException;
import com.ridehub.model.DriverProfile;
import com.ridehub.model.DriverVerificationStatus;
import com.ridehub.model.RoleType;
import com.ridehub.model.Vehicle;
import com.ridehub.repository.DriverProfileRepository;
import com.ridehub.repository.UserRepository;
import com.ridehub.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DriverService {

    private final DriverProfileRepository driverProfileRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public DriverService(DriverProfileRepository driverProfileRepository,
                         VehicleRepository vehicleRepository,
                         UserRepository userRepository,
                         NotificationService notificationService) {
        this.driverProfileRepository = driverProfileRepository;
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public DriverProfileResponse createOrUpdateDriverProfile(Long userId, DriverProfileRequest request) {
        Optional<DriverProfile> existing = driverProfileRepository.findByUserId(userId);
        DriverProfile profile;

        if (existing.isPresent()) {
            profile = existing.get();
            profile.setLicenseNumber(request.getLicenseNumber().trim());
            driverProfileRepository.update(profile);
        } else {
            profile = new DriverProfile();
            profile.setUserId(userId);
            profile.setLicenseNumber(request.getLicenseNumber().trim());
            profile.setVerificationStatus(DriverVerificationStatus.VERIFIED); // Pre-verified or active for carpooling
            profile = driverProfileRepository.save(profile);

            // Add ROLE_DRIVER to user roles if not already present
            userRepository.addRole(userId, RoleType.ROLE_DRIVER.name());

            notificationService.createNotification(
                    userId,
                    "Driver Profile Active",
                    "Your driver profile is now active. You can now add vehicles and publish rides."
            );
        }

        return mapToDriverResponse(profile);
    }

    public DriverProfileResponse getDriverProfile(Long userId) {
        DriverProfile profile = driverProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Driver profile not found for user: " + userId));
        return mapToDriverResponse(profile);
    }

    @Transactional
    public VehicleResponse createVehicle(Long userId, VehicleRequest request) {
        if (vehicleRepository.existsByRegistrationNumber(request.getRegistrationNumber())) {
            throw new ConflictException("Vehicle with registration number " + request.getRegistrationNumber() + " already exists");
        }

        Vehicle vehicle = new Vehicle();
        vehicle.setDriverId(userId);
        vehicle.setMake(request.getMake().trim());
        vehicle.setModel(request.getModel().trim());
        vehicle.setRegistrationNumber(request.getRegistrationNumber().trim().toUpperCase());
        vehicle.setColor(request.getColor().trim());
        vehicle.setSeatCapacity(request.getSeatCapacity());

        Vehicle saved = vehicleRepository.save(vehicle);

        // Ensure user has driver role
        userRepository.addRole(userId, RoleType.ROLE_DRIVER.name());

        return mapToVehicleResponse(saved);
    }

    public List<VehicleResponse> getMyVehicles(Long userId) {
        return vehicleRepository.findByDriverId(userId).stream()
                .map(this::mapToVehicleResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public VehicleResponse updateVehicle(Long userId, Long vehicleId, VehicleRequest request) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + vehicleId));

        if (!vehicle.getDriverId().equals(userId)) {
            throw new ResourceNotFoundException("Vehicle not found or does not belong to you");
        }

        vehicle.setMake(request.getMake().trim());
        vehicle.setModel(request.getModel().trim());
        vehicle.setColor(request.getColor().trim());
        vehicle.setSeatCapacity(request.getSeatCapacity());

        vehicleRepository.update(vehicle);
        return mapToVehicleResponse(vehicle);
    }

    private DriverProfileResponse mapToDriverResponse(DriverProfile p) {
        return new DriverProfileResponse(
                p.getId(),
                p.getUserId(),
                p.getLicenseNumber(),
                p.getVerificationStatus(),
                p.getCreatedAt()
        );
    }

    private VehicleResponse mapToVehicleResponse(Vehicle v) {
        return new VehicleResponse(
                v.getId(),
                v.getDriverId(),
                v.getMake(),
                v.getModel(),
                v.getRegistrationNumber(),
                v.getColor(),
                v.getSeatCapacity(),
                v.getCreatedAt()
        );
    }
}

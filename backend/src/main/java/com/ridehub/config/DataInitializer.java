package com.ridehub.config;

import com.ridehub.model.AccountStatus;
import com.ridehub.model.DriverProfile;
import com.ridehub.model.DriverVerificationStatus;
import com.ridehub.model.RoleType;
import com.ridehub.model.User;
import com.ridehub.model.Vehicle;
import com.ridehub.repository.DriverProfileRepository;
import com.ridehub.repository.UserRepository;
import com.ridehub.repository.VehicleRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.HashSet;
import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final DriverProfileRepository driverProfileRepository;
    private final VehicleRepository vehicleRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository,
                           DriverProfileRepository driverProfileRepository,
                           VehicleRepository vehicleRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.driverProfileRepository = driverProfileRepository;
        this.vehicleRepository = vehicleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        try {
            // Seed default administrator if not present
            if (!userRepository.existsByEmail("admin@ridehub.com")) {
                User admin = new User();
                admin.setFullName("Platform Admin");
                admin.setEmail("admin@ridehub.com");
                admin.setPasswordHash(passwordEncoder.encode("Admin@123"));
                admin.setPhone("+15550000000");
                admin.setAccountStatus(AccountStatus.ACTIVE);

                Set<String> roles = new HashSet<>();
                roles.add(RoleType.ROLE_ADMIN.name());
                roles.add(RoleType.ROLE_DRIVER.name());
                roles.add(RoleType.ROLE_PASSENGER.name());
                admin.setRoles(roles);

                User savedAdmin = userRepository.save(admin);
                log.info("Initialized default administrator account: admin@ridehub.com (ID: {})", savedAdmin.getId());
            }

            // Seed a starter driver for immediate testing convenience if database is brand new
            if (!userRepository.existsByEmail("driver@ridehub.com")) {
                User driver = new User();
                driver.setFullName("David Miller");
                driver.setEmail("driver@ridehub.com");
                driver.setPasswordHash(passwordEncoder.encode("Driver@123"));
                driver.setPhone("+15551234567");
                driver.setAccountStatus(AccountStatus.ACTIVE);

                Set<String> driverRoles = new HashSet<>();
                driverRoles.add(RoleType.ROLE_DRIVER.name());
                driverRoles.add(RoleType.ROLE_PASSENGER.name());
                driver.setRoles(driverRoles);

                User savedDriver = userRepository.save(driver);

                DriverProfile profile = new DriverProfile();
                profile.setUserId(savedDriver.getId());
                profile.setLicenseNumber("DL-987654321");
                profile.setVerificationStatus(DriverVerificationStatus.VERIFIED);
                driverProfileRepository.save(profile);

                Vehicle vehicle = new Vehicle();
                vehicle.setDriverId(savedDriver.getId());
                vehicle.setMake("Toyota");
                vehicle.setModel("Camry");
                vehicle.setRegistrationNumber("KA-01-AB-1234");
                vehicle.setColor("Midnight Blue");
                vehicle.setSeatCapacity(4);
                vehicleRepository.save(vehicle);

                log.info("Initialized demo driver account: driver@ridehub.com");
            }

            // Seed a starter passenger for immediate testing convenience
            if (!userRepository.existsByEmail("passenger@ridehub.com")) {
                User passenger = new User();
                passenger.setFullName("Sarah Connor");
                passenger.setEmail("passenger@ridehub.com");
                passenger.setPasswordHash(passwordEncoder.encode("Passenger@123"));
                passenger.setPhone("+15559876543");
                passenger.setAccountStatus(AccountStatus.ACTIVE);

                Set<String> passengerRoles = new HashSet<>();
                passengerRoles.add(RoleType.ROLE_PASSENGER.name());
                passenger.setRoles(passengerRoles);

                userRepository.save(passenger);
                log.info("Initialized demo passenger account: passenger@ridehub.com");
            }
        } catch (Exception e) {
            log.warn("Data initialization skipped or already present: {}", e.getMessage());
        }
    }
}

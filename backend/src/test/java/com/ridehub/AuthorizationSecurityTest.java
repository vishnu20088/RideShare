package com.ridehub;

import com.ridehub.security.JwtTokenProvider;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Set;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public class AuthorizationSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Test
    @DisplayName("Non-admin passenger should be forbidden from accessing admin dashboard")
    void testPassengerCannotAccessAdminDashboard() throws Exception {
        String passengerToken = tokenProvider.generateToken("passenger@ridehub.com", 3L, Set.of("ROLE_PASSENGER"));

        mockMvc.perform(get("/api/v1/admin/dashboard")
                        .header("Authorization", "Bearer " + passengerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Admin user should successfully access admin dashboard")
    void testAdminCanAccessAdminDashboard() throws Exception {
        String adminToken = tokenProvider.generateToken("admin@ridehub.com", 1L, Set.of("ROLE_ADMIN"));

        mockMvc.perform(get("/api/v1/admin/dashboard")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }
}

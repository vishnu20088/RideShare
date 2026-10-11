package com.ridehub.repository;

import com.ridehub.model.DriverProfile;
import com.ridehub.model.DriverVerificationStatus;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.ZoneOffset;
import java.util.Optional;

@Repository
public class DriverProfileRepository {

    private final JdbcTemplate jdbcTemplate;

    public DriverProfileRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<DriverProfile> rowMapper = new RowMapper<>() {
        @Override
        public DriverProfile mapRow(ResultSet rs, int rowNum) throws SQLException {
            DriverProfile profile = new DriverProfile();
            profile.setId(rs.getLong("id"));
            profile.setUserId(rs.getLong("user_id"));
            profile.setLicenseNumber(rs.getString("license_number"));
            profile.setVerificationStatus(DriverVerificationStatus.valueOf(rs.getString("verification_status")));

            Timestamp createdAt = rs.getTimestamp("created_at");
            if (createdAt != null) {
                profile.setCreatedAt(createdAt.toInstant().atOffset(ZoneOffset.UTC));
            }
            Timestamp updatedAt = rs.getTimestamp("updated_at");
            if (updatedAt != null) {
                profile.setUpdatedAt(updatedAt.toInstant().atOffset(ZoneOffset.UTC));
            }
            return profile;
        }
    };

    public DriverProfile save(DriverProfile profile) {
        String sql = "INSERT INTO driver_profiles (user_id, license_number, verification_status, created_at, updated_at) " +
                     "VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, new String[]{"id"});
            ps.setLong(1, profile.getUserId());
            ps.setString(2, profile.getLicenseNumber());
            ps.setString(3, profile.getVerificationStatus() != null ? profile.getVerificationStatus().name() : DriverVerificationStatus.PENDING.name());
            return ps;
        }, keyHolder);

        Number key = extractGeneratedId(keyHolder);
        if (key != null) {
            profile.setId(key.longValue());
        }
        return profile;
    }

    private Number extractGeneratedId(KeyHolder keyHolder) {
        if (keyHolder.getKeys() != null) {
            if (keyHolder.getKeys().containsKey("id")) return (Number) keyHolder.getKeys().get("id");
            if (keyHolder.getKeys().containsKey("ID")) return (Number) keyHolder.getKeys().get("ID");
        }
        try {
            return keyHolder.getKey();
        } catch (Exception e) {
            return null;
        }
    }

    public Optional<DriverProfile> findByUserId(Long userId) {
        String sql = "SELECT id, user_id, license_number, verification_status, created_at, updated_at " +
                     "FROM driver_profiles WHERE user_id = ?";
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, rowMapper, userId));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Optional<DriverProfile> findById(Long id) {
        String sql = "SELECT id, user_id, license_number, verification_status, created_at, updated_at " +
                     "FROM driver_profiles WHERE id = ?";
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, rowMapper, id));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public int update(DriverProfile profile) {
        String sql = "UPDATE driver_profiles SET license_number = ?, verification_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        return jdbcTemplate.update(sql, profile.getLicenseNumber(), profile.getVerificationStatus().name(), profile.getId());
    }

    public int updateVerificationStatus(Long userId, DriverVerificationStatus status) {
        String sql = "UPDATE driver_profiles SET verification_status = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?";
        return jdbcTemplate.update(sql, status.name(), userId);
    }
}

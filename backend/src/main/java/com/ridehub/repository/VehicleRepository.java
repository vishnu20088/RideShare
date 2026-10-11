package com.ridehub.repository;

import com.ridehub.model.Vehicle;
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
import java.util.List;
import java.util.Optional;

@Repository
public class VehicleRepository {

    private final JdbcTemplate jdbcTemplate;

    public VehicleRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Vehicle> rowMapper = new RowMapper<>() {
        @Override
        public Vehicle mapRow(ResultSet rs, int rowNum) throws SQLException {
            Vehicle vehicle = new Vehicle();
            vehicle.setId(rs.getLong("id"));
            vehicle.setDriverId(rs.getLong("driver_id"));
            vehicle.setMake(rs.getString("make"));
            vehicle.setModel(rs.getString("model"));
            vehicle.setRegistrationNumber(rs.getString("registration_number"));
            vehicle.setColor(rs.getString("color"));
            vehicle.setSeatCapacity(rs.getInt("seat_capacity"));

            Timestamp createdAt = rs.getTimestamp("created_at");
            if (createdAt != null) {
                vehicle.setCreatedAt(createdAt.toInstant().atOffset(ZoneOffset.UTC));
            }
            return vehicle;
        }
    };

    public Vehicle save(Vehicle vehicle) {
        String sql = "INSERT INTO vehicles (driver_id, make, model, registration_number, color, seat_capacity, created_at) " +
                     "VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, new String[]{"id"});
            ps.setLong(1, vehicle.getDriverId());
            ps.setString(2, vehicle.getMake());
            ps.setString(3, vehicle.getModel());
            ps.setString(4, vehicle.getRegistrationNumber().toUpperCase().trim());
            ps.setString(5, vehicle.getColor());
            ps.setInt(6, vehicle.getSeatCapacity());
            return ps;
        }, keyHolder);

        Number key = extractGeneratedId(keyHolder);
        if (key != null) {
            vehicle.setId(key.longValue());
        }
        return vehicle;
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

    public Optional<Vehicle> findById(Long id) {
        String sql = "SELECT id, driver_id, make, model, registration_number, color, seat_capacity, created_at " +
                     "FROM vehicles WHERE id = ?";
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, rowMapper, id));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<Vehicle> findByDriverId(Long driverId) {
        String sql = "SELECT id, driver_id, make, model, registration_number, color, seat_capacity, created_at " +
                     "FROM vehicles WHERE driver_id = ? ORDER BY id DESC";
        return jdbcTemplate.query(sql, rowMapper, driverId);
    }

    public boolean existsByRegistrationNumber(String regNo) {
        String sql = "SELECT COUNT(*) FROM vehicles WHERE UPPER(registration_number) = UPPER(?)";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, regNo.trim());
        return count != null && count > 0;
    }

    public int update(Vehicle vehicle) {
        String sql = "UPDATE vehicles SET make = ?, model = ?, color = ?, seat_capacity = ? WHERE id = ? AND driver_id = ?";
        return jdbcTemplate.update(sql, vehicle.getMake(), vehicle.getModel(), vehicle.getColor(), vehicle.getSeatCapacity(), vehicle.getId(), vehicle.getDriverId());
    }

    public int delete(Long id, Long driverId) {
        String sql = "DELETE FROM vehicles WHERE id = ? AND driver_id = ?";
        return jdbcTemplate.update(sql, id, driverId);
    }
}

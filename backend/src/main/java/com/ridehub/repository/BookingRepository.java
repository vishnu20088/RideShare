package com.ridehub.repository;

import com.ridehub.model.Booking;
import com.ridehub.model.BookingStatus;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

@Repository
public class BookingRepository {

    private final JdbcTemplate jdbcTemplate;

    public BookingRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Booking> rowMapper = new RowMapper<>() {
        @Override
        public Booking mapRow(ResultSet rs, int rowNum) throws SQLException {
            Booking booking = new Booking();
            booking.setId(rs.getLong("id"));
            booking.setRideId(rs.getLong("ride_id"));
            booking.setPassengerId(rs.getLong("passenger_id"));
            booking.setSeatsRequested(rs.getInt("seats_requested"));
            booking.setTotalPrice(rs.getBigDecimal("total_price"));
            booking.setStatus(BookingStatus.valueOf(rs.getString("status")));

            Timestamp reqAt = rs.getTimestamp("requested_at");
            if (reqAt != null) {
                booking.setRequestedAt(reqAt.toInstant().atOffset(ZoneOffset.UTC));
            }
            Timestamp updAt = rs.getTimestamp("updated_at");
            if (updAt != null) {
                booking.setUpdatedAt(updAt.toInstant().atOffset(ZoneOffset.UTC));
            }
            return booking;
        }
    };

    public Booking save(Booking booking) {
        String sql = "INSERT INTO bookings (ride_id, passenger_id, seats_requested, total_price, status, requested_at, updated_at) " +
                     "VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, new String[]{"id"});
            ps.setLong(1, booking.getRideId());
            ps.setLong(2, booking.getPassengerId());
            ps.setInt(3, booking.getSeatsRequested());
            ps.setBigDecimal(4, booking.getTotalPrice());
            ps.setString(5, booking.getStatus() != null ? booking.getStatus().name() : BookingStatus.PENDING.name());
            return ps;
        }, keyHolder);

        Number key = extractGeneratedId(keyHolder);
        if (key != null) {
            booking.setId(key.longValue());
        }
        return booking;
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

    public Optional<Booking> findById(Long id) {
        String sql = "SELECT id, ride_id, passenger_id, seats_requested, total_price, status, requested_at, updated_at " +
                     "FROM bookings WHERE id = ?";
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, rowMapper, id));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Optional<Booking> findByIdForUpdate(Long id) {
        String sql = "SELECT id, ride_id, passenger_id, seats_requested, total_price, status, requested_at, updated_at " +
                     "FROM bookings WHERE id = ? FOR UPDATE";
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, rowMapper, id));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<Booking> findByRideId(Long rideId) {
        String sql = "SELECT id, ride_id, passenger_id, seats_requested, total_price, status, requested_at, updated_at " +
                     "FROM bookings WHERE ride_id = ? ORDER BY requested_at DESC";
        return jdbcTemplate.query(sql, rowMapper, rideId);
    }

    public List<Booking> findByPassengerId(Long passengerId) {
        String sql = "SELECT id, ride_id, passenger_id, seats_requested, total_price, status, requested_at, updated_at " +
                     "FROM bookings WHERE passenger_id = ? ORDER BY requested_at DESC";
        return jdbcTemplate.query(sql, rowMapper, passengerId);
    }

    public boolean existsActiveBooking(Long rideId, Long passengerId) {
        String sql = "SELECT COUNT(*) FROM bookings WHERE ride_id = ? AND passenger_id = ? AND status IN ('PENDING', 'CONFIRMED')";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, rideId, passengerId);
        return count != null && count > 0;
    }

    public int updateStatus(Long bookingId, BookingStatus status) {
        String sql = "UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        return jdbcTemplate.update(sql, status.name(), bookingId);
    }

    public int updateStatusConditionally(Long bookingId, BookingStatus fromStatus, BookingStatus toStatus) {
        String sql = "UPDATE bookings SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND status = ?";
        return jdbcTemplate.update(sql, toStatus.name(), bookingId, fromStatus.name());
    }

    public List<Booking> findAll(int page, int size) {
        int offset = page * size;
        String sql = "SELECT id, ride_id, passenger_id, seats_requested, total_price, status, requested_at, updated_at " +
                     "FROM bookings ORDER BY requested_at DESC LIMIT ? OFFSET ?";
        return jdbcTemplate.query(sql, rowMapper, size, offset);
    }

    public long countAll() {
        String sql = "SELECT COUNT(*) FROM bookings";
        Long count = jdbcTemplate.queryForObject(sql, Long.class);
        return count != null ? count : 0L;
    }

    public BigDecimal sumCompletedBookingValue() {
        String sql = "SELECT COALESCE(SUM(total_price), 0) FROM bookings WHERE status = 'COMPLETED'";
        BigDecimal total = jdbcTemplate.queryForObject(sql, BigDecimal.class);
        return total != null ? total : BigDecimal.ZERO;
    }
}

package com.ridehub.repository;

import com.ridehub.dto.RideSearchCriteria;
import com.ridehub.model.Ride;
import com.ridehub.model.RideStatus;
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
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class RideRepository {

    private final JdbcTemplate jdbcTemplate;

    public RideRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Ride> rowMapper = new RowMapper<>() {
        @Override
        public Ride mapRow(ResultSet rs, int rowNum) throws SQLException {
            Ride ride = new Ride();
            ride.setId(rs.getLong("id"));
            ride.setDriverId(rs.getLong("driver_id"));
            ride.setOrigin(rs.getString("origin"));
            ride.setDestination(rs.getString("destination"));
            ride.setOriginLatitude(rs.getBigDecimal("origin_latitude"));
            ride.setOriginLongitude(rs.getBigDecimal("origin_longitude"));
            ride.setDestinationLatitude(rs.getBigDecimal("destination_latitude"));
            ride.setDestinationLongitude(rs.getBigDecimal("destination_longitude"));

            Timestamp depTime = rs.getTimestamp("departure_time");
            if (depTime != null) {
                ride.setDepartureTime(depTime.toInstant().atOffset(ZoneOffset.UTC));
            }
            Timestamp arrTime = rs.getTimestamp("estimated_arrival_time");
            if (arrTime != null) {
                ride.setEstimatedArrivalTime(arrTime.toInstant().atOffset(ZoneOffset.UTC));
            }

            ride.setTotalSeats(rs.getInt("total_seats"));
            ride.setAvailableSeats(rs.getInt("available_seats"));
            ride.setPricePerSeat(rs.getBigDecimal("price_per_seat"));
            ride.setDescription(rs.getString("description"));
            ride.setStatus(RideStatus.valueOf(rs.getString("status")));

            Timestamp createdAt = rs.getTimestamp("created_at");
            if (createdAt != null) {
                ride.setCreatedAt(createdAt.toInstant().atOffset(ZoneOffset.UTC));
            }
            Timestamp updatedAt = rs.getTimestamp("updated_at");
            if (updatedAt != null) {
                ride.setUpdatedAt(updatedAt.toInstant().atOffset(ZoneOffset.UTC));
            }
            return ride;
        }
    };

    public Ride save(Ride ride) {
        String sql = "INSERT INTO rides (driver_id, origin, destination, origin_latitude, origin_longitude, " +
                     "destination_latitude, destination_longitude, departure_time, estimated_arrival_time, " +
                     "total_seats, available_seats, price_per_seat, description, status, created_at, updated_at) " +
                     "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, new String[]{"id"});
            ps.setLong(1, ride.getDriverId());
            ps.setString(2, ride.getOrigin());
            ps.setString(3, ride.getDestination());
            ps.setBigDecimal(4, ride.getOriginLatitude());
            ps.setBigDecimal(5, ride.getOriginLongitude());
            ps.setBigDecimal(6, ride.getDestinationLatitude());
            ps.setBigDecimal(7, ride.getDestinationLongitude());
            ps.setTimestamp(8, ride.getDepartureTime() != null ? Timestamp.from(ride.getDepartureTime().toInstant()) : null);
            ps.setTimestamp(9, ride.getEstimatedArrivalTime() != null ? Timestamp.from(ride.getEstimatedArrivalTime().toInstant()) : null);
            ps.setInt(10, ride.getTotalSeats());
            ps.setInt(11, ride.getAvailableSeats() != null ? ride.getAvailableSeats() : ride.getTotalSeats());
            ps.setBigDecimal(12, ride.getPricePerSeat());
            ps.setString(13, ride.getDescription());
            ps.setString(14, ride.getStatus() != null ? ride.getStatus().name() : RideStatus.OPEN.name());
            return ps;
        }, keyHolder);

        Number key = extractGeneratedId(keyHolder);
        if (key != null) {
            ride.setId(key.longValue());
        }
        return ride;
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

    public Optional<Ride> findById(Long id) {
        String sql = "SELECT id, driver_id, origin, destination, origin_latitude, origin_longitude, " +
                     "destination_latitude, destination_longitude, departure_time, estimated_arrival_time, " +
                     "total_seats, available_seats, price_per_seat, description, status, created_at, updated_at " +
                     "FROM rides WHERE id = ?";
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, rowMapper, id));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    /**
     * SELECT FOR UPDATE to lock the ride row during atomic booking seat deductions.
     */
    public Optional<Ride> findByIdForUpdate(Long id) {
        String sql = "SELECT id, driver_id, origin, destination, origin_latitude, origin_longitude, " +
                     "destination_latitude, destination_longitude, departure_time, estimated_arrival_time, " +
                     "total_seats, available_seats, price_per_seat, description, status, created_at, updated_at " +
                     "FROM rides WHERE id = ? FOR UPDATE";
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, rowMapper, id));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<Ride> findByDriverId(Long driverId) {
        String sql = "SELECT id, driver_id, origin, destination, origin_latitude, origin_longitude, " +
                     "destination_latitude, destination_longitude, departure_time, estimated_arrival_time, " +
                     "total_seats, available_seats, price_per_seat, description, status, created_at, updated_at " +
                     "FROM rides WHERE driver_id = ? ORDER BY departure_time DESC";
        return jdbcTemplate.query(sql, rowMapper, driverId);
    }

    public List<Ride> searchRides(RideSearchCriteria criteria) {
        StringBuilder sql = new StringBuilder("SELECT id, driver_id, origin, destination, origin_latitude, origin_longitude, ")
                .append("destination_latitude, destination_longitude, departure_time, estimated_arrival_time, ")
                .append("total_seats, available_seats, price_per_seat, description, status, created_at, updated_at ")
                .append("FROM rides WHERE status = 'OPEN' AND available_seats > 0 ");

        List<Object> params = new ArrayList<>();

        if (criteria.getOrigin() != null && !criteria.getOrigin().isBlank()) {
            sql.append("AND LOWER(origin) LIKE LOWER(?) ");
            params.add("%" + criteria.getOrigin().trim() + "%");
        }
        if (criteria.getDestination() != null && !criteria.getDestination().isBlank()) {
            sql.append("AND LOWER(destination) LIKE LOWER(?) ");
            params.add("%" + criteria.getDestination().trim() + "%");
        }
        if (criteria.getTravelDate() != null) {
            OffsetDateTime startOfDay = criteria.getTravelDate().atStartOfDay().atOffset(ZoneOffset.UTC);
            OffsetDateTime endOfDay = criteria.getTravelDate().plusDays(1).atStartOfDay().atOffset(ZoneOffset.UTC);
            sql.append("AND departure_time >= ? AND departure_time < ? ");
            params.add(Timestamp.from(startOfDay.toInstant()));
            params.add(Timestamp.from(endOfDay.toInstant()));
        } else {
            // Default only future or current rides
            sql.append("AND departure_time >= ? ");
            params.add(Timestamp.from(OffsetDateTime.now().toInstant()));
        }
        if (criteria.getSeats() != null && criteria.getSeats() > 0) {
            sql.append("AND available_seats >= ? ");
            params.add(criteria.getSeats());
        }
        if (criteria.getMaxPrice() != null) {
            sql.append("AND price_per_seat <= ? ");
            params.add(criteria.getMaxPrice());
        }

        // Sorting
        String sortColumn = "price".equalsIgnoreCase(criteria.getSortBy()) ? "price_per_seat" : "departure_time";
        String direction = "desc".equalsIgnoreCase(criteria.getSortDir()) ? "DESC" : "ASC";
        sql.append("ORDER BY ").append(sortColumn).append(" ").append(direction).append(" ");

        // Pagination
        sql.append("LIMIT ? OFFSET ?");
        params.add(criteria.getSize());
        params.add(criteria.getPage() * criteria.getSize());

        return jdbcTemplate.query(sql.toString(), rowMapper, params.toArray());
    }

    public long countSearchRides(RideSearchCriteria criteria) {
        StringBuilder sql = new StringBuilder("SELECT COUNT(*) FROM rides WHERE status = 'OPEN' AND available_seats > 0 ");
        List<Object> params = new ArrayList<>();

        if (criteria.getOrigin() != null && !criteria.getOrigin().isBlank()) {
            sql.append("AND LOWER(origin) LIKE LOWER(?) ");
            params.add("%" + criteria.getOrigin().trim() + "%");
        }
        if (criteria.getDestination() != null && !criteria.getDestination().isBlank()) {
            sql.append("AND LOWER(destination) LIKE LOWER(?) ");
            params.add("%" + criteria.getDestination().trim() + "%");
        }
        if (criteria.getTravelDate() != null) {
            OffsetDateTime startOfDay = criteria.getTravelDate().atStartOfDay().atOffset(ZoneOffset.UTC);
            OffsetDateTime endOfDay = criteria.getTravelDate().plusDays(1).atStartOfDay().atOffset(ZoneOffset.UTC);
            sql.append("AND departure_time >= ? AND departure_time < ? ");
            params.add(Timestamp.from(startOfDay.toInstant()));
            params.add(Timestamp.from(endOfDay.toInstant()));
        } else {
            sql.append("AND departure_time >= ? ");
            params.add(Timestamp.from(OffsetDateTime.now().toInstant()));
        }
        if (criteria.getSeats() != null && criteria.getSeats() > 0) {
            sql.append("AND available_seats >= ? ");
            params.add(criteria.getSeats());
        }
        if (criteria.getMaxPrice() != null) {
            sql.append("AND price_per_seat <= ? ");
            params.add(criteria.getMaxPrice());
        }

        Long count = jdbcTemplate.queryForObject(sql.toString(), Long.class, params.toArray());
        return count != null ? count : 0L;
    }

    public int update(Ride ride) {
        String sql = "UPDATE rides SET origin = ?, destination = ?, origin_latitude = ?, origin_longitude = ?, " +
                     "destination_latitude = ?, destination_longitude = ?, departure_time = ?, estimated_arrival_time = ?, " +
                     "total_seats = ?, available_seats = ?, price_per_seat = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP " +
                     "WHERE id = ?";
        return jdbcTemplate.update(sql,
                ride.getOrigin(),
                ride.getDestination(),
                ride.getOriginLatitude(),
                ride.getOriginLongitude(),
                ride.getDestinationLatitude(),
                ride.getDestinationLongitude(),
                ride.getDepartureTime() != null ? Timestamp.from(ride.getDepartureTime().toInstant()) : null,
                ride.getEstimatedArrivalTime() != null ? Timestamp.from(ride.getEstimatedArrivalTime().toInstant()) : null,
                ride.getTotalSeats(),
                ride.getAvailableSeats(),
                ride.getPricePerSeat(),
                ride.getDescription(),
                ride.getStatus().name(),
                ride.getId()
        );
    }

    /**
     * Atomically decrements available seats ensuring available_seats >= requestedSeats.
     * Returns 1 if successful, 0 if seats were no longer available.
     */
    public int decrementSeatsConditionally(Long rideId, int seatsToDeduct) {
        String sql = "UPDATE rides SET available_seats = available_seats - ?, " +
                     "status = CASE WHEN available_seats - ? = 0 THEN 'FULL' ELSE status END, " +
                     "updated_at = CURRENT_TIMESTAMP " +
                     "WHERE id = ? AND available_seats >= ? AND status = 'OPEN'";
        return jdbcTemplate.update(sql, seatsToDeduct, seatsToDeduct, rideId, seatsToDeduct);
    }

    /**
     * Restores seats when a booking is cancelled or rejected after confirmation.
     */
    public int incrementSeats(Long rideId, int seatsToAdd) {
        String sql = "UPDATE rides SET available_seats = LEAST(total_seats, available_seats + ?), " +
                     "status = CASE WHEN status = 'FULL' THEN 'OPEN' ELSE status END, " +
                     "updated_at = CURRENT_TIMESTAMP " +
                     "WHERE id = ?";
        return jdbcTemplate.update(sql, seatsToAdd, rideId);
    }

    public int updateStatus(Long rideId, RideStatus status) {
        String sql = "UPDATE rides SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        return jdbcTemplate.update(sql, status.name(), rideId);
    }

    public int delete(Long id) {
        String sql = "DELETE FROM rides WHERE id = ?";
        return jdbcTemplate.update(sql, id);
    }

    public List<Ride> findAll(int page, int size) {
        int offset = page * size;
        String sql = "SELECT id, driver_id, origin, destination, origin_latitude, origin_longitude, " +
                     "destination_latitude, destination_longitude, departure_time, estimated_arrival_time, " +
                     "total_seats, available_seats, price_per_seat, description, status, created_at, updated_at " +
                     "FROM rides ORDER BY departure_time DESC LIMIT ? OFFSET ?";
        return jdbcTemplate.query(sql, rowMapper, size, offset);
    }

    public long countAll() {
        String sql = "SELECT COUNT(*) FROM rides";
        Long count = jdbcTemplate.queryForObject(sql, Long.class);
        return count != null ? count : 0L;
    }

    public long countByStatus(RideStatus status) {
        String sql = "SELECT COUNT(*) FROM rides WHERE status = ?";
        Long count = jdbcTemplate.queryForObject(sql, Long.class, status.name());
        return count != null ? count : 0L;
    }

    public int countRidesAsDriver(Long driverId) {
        String sql = "SELECT COUNT(*) FROM rides WHERE driver_id = ? AND status = 'COMPLETED'";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, driverId);
        return count != null ? count : 0;
    }
}

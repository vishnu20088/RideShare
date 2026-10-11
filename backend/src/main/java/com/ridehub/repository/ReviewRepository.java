package com.ridehub.repository;

import com.ridehub.model.Review;
import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

@Repository
public class ReviewRepository {

    private final JdbcTemplate jdbcTemplate;

    public ReviewRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Review> rowMapper = new RowMapper<>() {
        @Override
        public Review mapRow(ResultSet rs, int rowNum) throws SQLException {
            Review review = new Review();
            review.setId(rs.getLong("id"));
            review.setRideId(rs.getLong("ride_id"));
            review.setReviewerId(rs.getLong("reviewer_id"));
            review.setReviewedUserId(rs.getLong("reviewed_user_id"));
            review.setRating(rs.getInt("rating"));
            review.setComment(rs.getString("comment"));

            Timestamp createdAt = rs.getTimestamp("created_at");
            if (createdAt != null) {
                review.setCreatedAt(createdAt.toInstant().atOffset(ZoneOffset.UTC));
            }
            return review;
        }
    };

    public Review save(Review review) {
        String sql = "INSERT INTO reviews (ride_id, reviewer_id, reviewed_user_id, rating, comment, created_at) " +
                     "VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, new String[]{"id"});
            ps.setLong(1, review.getRideId());
            ps.setLong(2, review.getReviewerId());
            ps.setLong(3, review.getReviewedUserId());
            ps.setInt(4, review.getRating());
            ps.setString(5, review.getComment());
            return ps;
        }, keyHolder);

        Number key = extractGeneratedId(keyHolder);
        if (key != null) {
            review.setId(key.longValue());
        }
        return review;
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

    public Optional<Review> findById(Long id) {
        String sql = "SELECT id, ride_id, reviewer_id, reviewed_user_id, rating, comment, created_at " +
                     "FROM reviews WHERE id = ?";
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, rowMapper, id));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<Review> findByReviewedUserId(Long reviewedUserId) {
        String sql = "SELECT id, ride_id, reviewer_id, reviewed_user_id, rating, comment, created_at " +
                     "FROM reviews WHERE reviewed_user_id = ? ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, rowMapper, reviewedUserId);
    }

    public List<Review> findByRideId(Long rideId) {
        String sql = "SELECT id, ride_id, reviewer_id, reviewed_user_id, rating, comment, created_at " +
                     "FROM reviews WHERE ride_id = ? ORDER BY created_at DESC";
        return jdbcTemplate.query(sql, rowMapper, rideId);
    }

    public boolean exists(Long rideId, Long reviewerId, Long reviewedUserId) {
        String sql = "SELECT COUNT(*) FROM reviews WHERE ride_id = ? AND reviewer_id = ? AND reviewed_user_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, rideId, reviewerId, reviewedUserId);
        return count != null && count > 0;
    }

    public BigDecimal calculateAverageRating(Long userId) {
        String sql = "SELECT AVG(rating) FROM reviews WHERE reviewed_user_id = ?";
        Double avg = jdbcTemplate.queryForObject(sql, Double.class, userId);
        if (avg == null) {
            return BigDecimal.ZERO;
        }
        return BigDecimal.valueOf(avg).setScale(1, RoundingMode.HALF_UP);
    }

    public int countReviewsForUser(Long userId) {
        String sql = "SELECT COUNT(*) FROM reviews WHERE reviewed_user_id = ?";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, userId);
        return count != null ? count : 0;
    }
}

package com.ridehub.repository;

import com.ridehub.model.Report;
import com.ridehub.model.ReportStatus;
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
import java.sql.Types;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

@Repository
public class ReportRepository {

    private final JdbcTemplate jdbcTemplate;

    public ReportRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Report> rowMapper = new RowMapper<>() {
        @Override
        public Report mapRow(ResultSet rs, int rowNum) throws SQLException {
            Report report = new Report();
            report.setId(rs.getLong("id"));
            report.setReporterId(rs.getLong("reporter_id"));

            long reportedUserId = rs.getLong("reported_user_id");
            if (!rs.wasNull()) {
                report.setReportedUserId(reportedUserId);
            }
            long rideId = rs.getLong("ride_id");
            if (!rs.wasNull()) {
                report.setRideId(rideId);
            }

            report.setReason(rs.getString("reason"));
            report.setDescription(rs.getString("description"));
            report.setStatus(ReportStatus.valueOf(rs.getString("status")));

            Timestamp createdAt = rs.getTimestamp("created_at");
            if (createdAt != null) {
                report.setCreatedAt(createdAt.toInstant().atOffset(ZoneOffset.UTC));
            }
            return report;
        }
    };

    public Report save(Report report) {
        String sql = "INSERT INTO reports (reporter_id, reported_user_id, ride_id, reason, description, status, created_at) " +
                     "VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, new String[]{"id"});
            ps.setLong(1, report.getReporterId());
            if (report.getReportedUserId() != null) {
                ps.setLong(2, report.getReportedUserId());
            } else {
                ps.setNull(2, Types.BIGINT);
            }
            if (report.getRideId() != null) {
                ps.setLong(3, report.getRideId());
            } else {
                ps.setNull(3, Types.BIGINT);
            }
            ps.setString(4, report.getReason());
            ps.setString(5, report.getDescription());
            ps.setString(6, report.getStatus() != null ? report.getStatus().name() : ReportStatus.PENDING.name());
            return ps;
        }, keyHolder);

        Number key = extractGeneratedId(keyHolder);
        if (key != null) {
            report.setId(key.longValue());
        }
        return report;
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

    public Optional<Report> findById(Long id) {
        String sql = "SELECT id, reporter_id, reported_user_id, ride_id, reason, description, status, created_at " +
                     "FROM reports WHERE id = ?";
        try {
            return Optional.ofNullable(jdbcTemplate.queryForObject(sql, rowMapper, id));
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public List<Report> findAll(int page, int size) {
        int offset = page * size;
        String sql = "SELECT id, reporter_id, reported_user_id, ride_id, reason, description, status, created_at " +
                     "FROM reports ORDER BY created_at DESC LIMIT ? OFFSET ?";
        return jdbcTemplate.query(sql, rowMapper, size, offset);
    }

    public long countAll() {
        String sql = "SELECT COUNT(*) FROM reports";
        Long count = jdbcTemplate.queryForObject(sql, Long.class);
        return count != null ? count : 0L;
    }

    public long countByStatus(ReportStatus status) {
        String sql = "SELECT COUNT(*) FROM reports WHERE status = ?";
        Long count = jdbcTemplate.queryForObject(sql, Long.class, status.name());
        return count != null ? count : 0L;
    }

    public int updateStatus(Long reportId, ReportStatus status) {
        String sql = "UPDATE reports SET status = ? WHERE id = ?";
        return jdbcTemplate.update(sql, status.name(), reportId);
    }
}

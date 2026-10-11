package com.ridehub.repository;

import com.ridehub.model.AccountStatus;
import com.ridehub.model.User;
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
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public class UserRepository {

    private final JdbcTemplate jdbcTemplate;

    public UserRepository(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<User> userRowMapper = new RowMapper<>() {
        @Override
        public User mapRow(ResultSet rs, int rowNum) throws SQLException {
            User user = new User();
            user.setId(rs.getLong("id"));
            user.setFullName(rs.getString("full_name"));
            user.setEmail(rs.getString("email"));
            user.setPasswordHash(rs.getString("password_hash"));
            user.setPhone(rs.getString("phone"));
            user.setAccountStatus(AccountStatus.valueOf(rs.getString("account_status")));

            Timestamp createdAt = rs.getTimestamp("created_at");
            if (createdAt != null) {
                user.setCreatedAt(createdAt.toInstant().atOffset(ZoneOffset.UTC));
            }
            Timestamp updatedAt = rs.getTimestamp("updated_at");
            if (updatedAt != null) {
                user.setUpdatedAt(updatedAt.toInstant().atOffset(ZoneOffset.UTC));
            }
            return user;
        }
    };

    public User save(User user) {
        String sql = "INSERT INTO users (full_name, email, password_hash, phone, account_status, created_at, updated_at) " +
                     "VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)";
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(sql, new String[]{"id"});
            ps.setString(1, user.getFullName());
            ps.setString(2, user.getEmail().toLowerCase().trim());
            ps.setString(3, user.getPasswordHash());
            ps.setString(4, user.getPhone());
            ps.setString(5, user.getAccountStatus() != null ? user.getAccountStatus().name() : AccountStatus.ACTIVE.name());
            return ps;
        }, keyHolder);

        Number key = extractGeneratedId(keyHolder);
        if (key != null) {
            user.setId(key.longValue());
        }

        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            for (String role : user.getRoles()) {
                addRole(user.getId(), role);
            }
        }
        return user;
    }

    private Number extractGeneratedId(KeyHolder keyHolder) {
        if (keyHolder.getKeys() != null) {
            if (keyHolder.getKeys().containsKey("id")) {
                return (Number) keyHolder.getKeys().get("id");
            }
            if (keyHolder.getKeys().containsKey("ID")) {
                return (Number) keyHolder.getKeys().get("ID");
            }
        }
        try {
            return keyHolder.getKey();
        } catch (Exception e) {
            return null;
        }
    }

    public Optional<User> findById(Long id) {
        String sql = "SELECT id, full_name, email, password_hash, phone, account_status, created_at, updated_at " +
                     "FROM users WHERE id = ?";
        try {
            User user = jdbcTemplate.queryForObject(sql, userRowMapper, id);
            if (user != null) {
                user.setRoles(findRolesByUserId(user.getId()));
            }
            return Optional.ofNullable(user);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public Optional<User> findByEmail(String email) {
        String sql = "SELECT id, full_name, email, password_hash, phone, account_status, created_at, updated_at " +
                     "FROM users WHERE LOWER(email) = LOWER(?)";
        try {
            User user = jdbcTemplate.queryForObject(sql, userRowMapper, email.trim());
            if (user != null) {
                user.setRoles(findRolesByUserId(user.getId()));
            }
            return Optional.ofNullable(user);
        } catch (EmptyResultDataAccessException e) {
            return Optional.empty();
        }
    }

    public boolean existsByEmail(String email) {
        String sql = "SELECT COUNT(*) FROM users WHERE LOWER(email) = LOWER(?)";
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, email.trim());
        return count != null && count > 0;
    }

    public Set<String> findRolesByUserId(Long userId) {
        String sql = "SELECT role FROM user_roles WHERE user_id = ?";
        List<String> roles = jdbcTemplate.queryForList(sql, String.class, userId);
        return new HashSet<>(roles);
    }

    public void addRole(Long userId, String role) {
        String sql = "INSERT INTO user_roles (user_id, role) VALUES (?, ?) ON CONFLICT DO NOTHING";
        // Check if role exists for H2 / standard fallback
        String checkSql = "SELECT COUNT(*) FROM user_roles WHERE user_id = ? AND role = ?";
        Integer count = jdbcTemplate.queryForObject(checkSql, Integer.class, userId, role);
        if (count == null || count == 0) {
            jdbcTemplate.update("INSERT INTO user_roles (user_id, role) VALUES (?, ?)", userId, role);
        }
    }

    public void removeRole(Long userId, String role) {
        String sql = "DELETE FROM user_roles WHERE user_id = ? AND role = ?";
        jdbcTemplate.update(sql, userId, role);
    }

    public int update(User user) {
        String sql = "UPDATE users SET full_name = ?, phone = ?, account_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        return jdbcTemplate.update(sql, user.getFullName(), user.getPhone(), user.getAccountStatus().name(), user.getId());
    }

    public int updateStatus(Long userId, AccountStatus status) {
        String sql = "UPDATE users SET account_status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?";
        return jdbcTemplate.update(sql, status.name(), userId);
    }

    public List<User> findAll(int page, int size) {
        int offset = page * size;
        String sql = "SELECT id, full_name, email, password_hash, phone, account_status, created_at, updated_at " +
                     "FROM users ORDER BY id DESC LIMIT ? OFFSET ?";
        List<User> users = jdbcTemplate.query(sql, userRowMapper, size, offset);
        for (User user : users) {
            user.setRoles(findRolesByUserId(user.getId()));
        }
        return users;
    }

    public long countAll() {
        String sql = "SELECT COUNT(*) FROM users";
        Long count = jdbcTemplate.queryForObject(sql, Long.class);
        return count != null ? count : 0L;
    }

    public long countByRole(String role) {
        String sql = "SELECT COUNT(DISTINCT user_id) FROM user_roles WHERE role = ?";
        Long count = jdbcTemplate.queryForObject(sql, Long.class, role);
        return count != null ? count : 0L;
    }
}

package com.ridehub.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import javax.sql.DataSource;
import java.net.URI;

@Configuration
public class DataSourceConfig {

    private static final Logger log = LoggerFactory.getLogger(DataSourceConfig.class);

    @Value("${spring.datasource.url:}")
    private String rawUrl;

    @Value("${spring.datasource.username:}")
    private String rawUsername;

    @Value("${spring.datasource.password:}")
    private String rawPassword;

    @Value("${spring.datasource.driver-class-name:}")
    private String rawDriver;

    @Bean
    @Primary
    public DataSource dataSource() {
        HikariConfig config = new HikariConfig();
        String url = rawUrl != null ? rawUrl.trim() : "";
        String username = rawUsername != null ? rawUsername.trim() : "";
        String password = rawPassword != null ? rawPassword.trim() : "";
        String driver = rawDriver != null ? rawDriver.trim() : "";

        // Default to in-memory H2 if no custom URL was provided
        if (url.isEmpty() || url.contains("jdbc:h2:mem:")) {
            String h2Url = url.isEmpty() 
                    ? "jdbc:h2:mem:ridehub;DB_CLOSE_DELAY=-1;MODE=PostgreSQL;DATABASE_TO_LOWER=TRUE;DEFAULT_NULL_ORDERING=HIGH" 
                    : url;
            config.setJdbcUrl(h2Url);
            config.setUsername(username.isEmpty() ? "sa" : username);
            config.setPassword(password);
            config.setDriverClassName("org.h2.Driver");
            log.info("Initialized local in-memory H2 PostgreSQL-compatible database");
            return new HikariDataSource(config);
        }

        // Support cloud PostgreSQL URIs (e.g. Neon, Render, Supabase) starting with postgres:// or postgresql://
        if (url.startsWith("postgres://") || url.startsWith("postgresql://")) {
            try {
                URI uri = URI.create(url);
                String userInfo = uri.getUserInfo();
                String host = uri.getHost();
                int port = uri.getPort() == -1 ? 5432 : uri.getPort();
                String path = uri.getPath();
                String query = uri.getQuery();

                String jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path;
                if (query != null && !query.isEmpty()) {
                    jdbcUrl += "?" + query;
                }
                config.setJdbcUrl(jdbcUrl);

                if (userInfo != null && userInfo.contains(":")) {
                    String[] parts = userInfo.split(":", 2);
                    config.setUsername(username.isEmpty() ? parts[0] : username);
                    config.setPassword(password.isEmpty() ? parts[1] : password);
                } else {
                    config.setUsername(username);
                    config.setPassword(password);
                }
                config.setDriverClassName("org.postgresql.Driver");
                log.info("Configured cloud PostgreSQL database connection to host: {}", host);
            } catch (Exception e) {
                log.warn("Failed to parse standard PostgreSQL URI, attempting direct jdbc: prefix conversion: {}", e.getMessage());
                config.setJdbcUrl("jdbc:" + url);
                config.setUsername(username);
                config.setPassword(password);
                config.setDriverClassName("org.postgresql.Driver");
            }
        } else {
            // Already formatted with jdbc:
            config.setJdbcUrl(url);
            config.setUsername(username);
            config.setPassword(password);

            if (!driver.isEmpty()) {
                config.setDriverClassName(driver);
            } else if (url.startsWith("jdbc:postgresql:")) {
                config.setDriverClassName("org.postgresql.Driver");
            } else if (url.startsWith("jdbc:h2:")) {
                config.setDriverClassName("org.h2.Driver");
            }
            log.info("Configured JDBC connection: {}", url.replaceAll(":[^:@]+@", ":****@"));
        }

        // Production connection pool tuning
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setIdleTimeout(30000);
        config.setMaxLifetime(1800000);
        config.setConnectionTimeout(30000);

        return new HikariDataSource(config);
    }
}

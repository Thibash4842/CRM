package com.scratchio.crm.config;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DbFixer {

    private final JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void fixDb() {
        try {
            jdbcTemplate.execute("ALTER TABLE quotes DROP CONSTRAINT IF EXISTS quotes_status_check");
            System.out.println("SUCCESSFULLY DROPPED quotes_status_check CONSTRAINT");
        } catch (Exception e) {
            System.out.println("Could not drop constraint: " + e.getMessage());
        }
    }
}

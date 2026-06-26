package com.scratchio.crm.config;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/**
 * Validates that all required environment variables are present at startup.
 * If any are missing, the application will fail to start with a clear error message.
 */
@Component
public class EnvValidator {

    private static final Logger log = LoggerFactory.getLogger(EnvValidator.class);

    @Value("${spring.datasource.url}")
    private String dbUrl;

    @Value("${spring.datasource.username}")
    private String dbUsername;

    @Value("${spring.datasource.password}")
    private String dbPassword;

    @Value("${app.jwt.secret}")
    private String jwtSecret;

    @PostConstruct
    public void validate() {
        List<String> missing = new ArrayList<>();

        if (isBlank(dbUrl)) missing.add("DB_URL");
        if (isBlank(dbUsername)) missing.add("DB_USERNAME");
        if (isBlank(dbPassword)) missing.add("DB_PASSWORD");
        if (isBlank(jwtSecret)) missing.add("JWT_SECRET");

        if (!missing.isEmpty()) {
            String errorMsg = """
                    
                    ============================================================
                    ❌  STARTUP FAILED: Missing required environment variables
                    ============================================================
                    The following environment variables must be set:
                    
                    """ + String.join("\n    ", missing.stream().map(v -> "  → " + v).toList()) + """
                    
                    
                    📋 How to fix:
                       1. Copy backend/.env.example to backend/.env
                       2. Fill in all required values in backend/.env
                       3. Load the .env file before starting the app
                    
                    See README.md for full setup instructions.
                    ============================================================
                    """;
            log.error(errorMsg);
            throw new IllegalStateException(
                "Missing required environment variables: " + String.join(", ", missing) +
                ". See application logs for details."
            );
        }

        log.info("✅ Environment validation passed — all required variables are set.");
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}

USE passit_db;

CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
    `reset_token_id` BIGINT NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `token` VARCHAR(64) NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `expires_at` DATETIME NOT NULL,
    `used` BOOLEAN NOT NULL DEFAULT FALSE,
    `used_at` DATETIME NULL,
    PRIMARY KEY (`reset_token_id`),
    UNIQUE KEY `unique_password_reset_token` (`token`),
    INDEX `idx_password_reset_email` (`email`),
    INDEX `idx_password_reset_token_used` (`token`, `used`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='비밀번호 재설정 토큰 테이블';

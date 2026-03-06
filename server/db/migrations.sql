-- MindCare Database Schema Migrations
-- Complete 22-table schema for AWS Lambda migration
-- Run this script to create all required tables

-- ============================================================================
-- TABLE 1: USERS (Authentication + Roles)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role ENUM('user', 'counsellor', 'admin') DEFAULT 'user',
    account_status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    counsellor_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    profile_photo VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 2: LOGIN HISTORY (Admin Analytics)
-- ============================================================================
CREATE TABLE IF NOT EXISTS login_history (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP NULL,
    device_info VARCHAR(255),
    ip_address VARCHAR(45),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_login (user_id, login_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 3: USER ACTIVITY LOG (Recent Activity)
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_activity_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    activity_type VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_activity (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 4: MOOD CHECK-INS (Quick Mood Check-in)
-- ============================================================================
CREATE TABLE IF NOT EXISTS mood_check_ins (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    mood ENUM('Happy', 'Dull', 'Sad', 'Anxious', 'Angry', 'Stressed', 'Depressed') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, created_at),
    INDEX idx_mood (mood)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 5: JOURNAL ENTRIES
-- ============================================================================
CREATE TABLE IF NOT EXISTS journal_entries (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    entry_text TEXT NOT NULL,
    sentiment VARCHAR(20),
    ai_feedback TEXT,
    entry_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, entry_date),
    INDEX idx_entry_date (entry_date),
    INDEX idx_sentiment (sentiment)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 6: AI CHAT CONVERSATIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS chat_conversations (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_conversation (user_id, started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 7: CHAT MESSAGES (AI Companion)
-- ============================================================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(36) PRIMARY KEY,
    conversation_id VARCHAR(36),
    sender ENUM('user', 'ai'),
    message_text TEXT,
    emotion_detected VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE,
    INDEX idx_conversation_time (conversation_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 8: VOICE LOGS (MIC INPUT - AWS Transcribe + S3)
-- ============================================================================
CREATE TABLE IF NOT EXISTS voice_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    audio_url VARCHAR(255),
    transcription TEXT,
    emotion_detected VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_voice (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 9: COUNSELLOR SESSIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS counsellor_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    counsellor_id VARCHAR(36),
    scheduled_at TIMESTAMP,
    duration_minutes INT DEFAULT 60,
    session_status ENUM('scheduled', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
    patient_feedback INT,
    counsellor_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (counsellor_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_sessions (user_id, scheduled_at),
    INDEX idx_counsellor_sessions (counsellor_id, scheduled_at),
    INDEX idx_status (session_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 10: COUNSELLOR WORKING HOURS
-- ============================================================================
CREATE TABLE IF NOT EXISTS counsellor_availability (
    id VARCHAR(36) PRIMARY KEY,
    counsellor_id VARCHAR(36),
    weekday ENUM('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
    start_time TIME,
    end_time TIME,
    FOREIGN KEY (counsellor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_counsellor_weekday (counsellor_id, weekday)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 11: COUNSELLOR GROUP THERAPY
-- ============================================================================
CREATE TABLE IF NOT EXISTS counsellor_groups (
    id VARCHAR(36) PRIMARY KEY,
    counsellor_id VARCHAR(36),
    group_name VARCHAR(100),
    description TEXT,
    max_members INT DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (counsellor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_counsellor_groups (counsellor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 12: GROUP MEMBERS
-- ============================================================================
CREATE TABLE IF NOT EXISTS group_members (
    id VARCHAR(36) PRIMARY KEY,
    group_id VARCHAR(36),
    user_id VARCHAR(36),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'left', 'removed') DEFAULT 'active',
    FOREIGN KEY (group_id) REFERENCES counsellor_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_group_member (group_id, user_id),
    INDEX idx_group_members (group_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 13: GROUP CHAT
-- ============================================================================
CREATE TABLE IF NOT EXISTS group_messages (
    id VARCHAR(36) PRIMARY KEY,
    group_id VARCHAR(36),
    sender_id VARCHAR(36),
    message_text TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES counsellor_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_group_messages (group_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 14: GROUP ACTIVITY LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS group_activity_logs (
    id VARCHAR(36) PRIMARY KEY,
    group_id VARCHAR(36),
    activity_type VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES counsellor_groups(id) ON DELETE CASCADE,
    INDEX idx_group_activity (group_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 15: WELLNESS CHALLENGES
-- ============================================================================
CREATE TABLE IF NOT EXISTS wellness_challenges (
    id VARCHAR(36) PRIMARY KEY,
    challenge_name VARCHAR(100),
    description TEXT,
    points_reward INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 16: USER WELLNESS PROGRESS
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_wellness_progress (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    challenge_id VARCHAR(36),
    status ENUM('started', 'completed'),
    completed_at TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (challenge_id) REFERENCES wellness_challenges(id) ON DELETE CASCADE,
    INDEX idx_user_challenge (user_id, challenge_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 17: USER POINTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_points (
    user_id VARCHAR(36) PRIMARY KEY,
    total_points INT DEFAULT 0,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_activity_date DATE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 18: REWARDS
-- ============================================================================
CREATE TABLE IF NOT EXISTS rewards (
    id VARCHAR(36) PRIMARY KEY,
    reward_name VARCHAR(100),
    description TEXT,
    points_required INT,
    reward_type ENUM('badge', 'achievement'),
    icon_url VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 19: USER REWARDS
-- ============================================================================
CREATE TABLE IF NOT EXISTS user_rewards (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    reward_id VARCHAR(36),
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_reward (user_id, reward_id),
    INDEX idx_user_rewards (user_id, earned_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 20: PATIENT IMPROVEMENT TRACKING
-- ============================================================================
CREATE TABLE IF NOT EXISTS patient_progress (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    counsellor_id VARCHAR(36),
    improvement_status ENUM('improving', 'stable', 'needs_attention'),
    progress_score INT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (counsellor_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_patient_progress (user_id, counsellor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 21: ADMIN SYSTEM ALERTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS system_alerts (
    id VARCHAR(36) PRIMARY KEY,
    alert_type VARCHAR(100),
    message TEXT,
    severity ENUM('low', 'medium', 'high'),
    status ENUM('active', 'resolved'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_alert_status (status, severity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- TABLE 22: ADMIN DAILY ANALYTICS
-- ============================================================================
CREATE TABLE IF NOT EXISTS daily_analytics (
    analytics_date DATE PRIMARY KEY,
    total_users INT,
    active_users INT,
    total_counsellors INT,
    active_counsellors INT,
    sessions_conducted INT,
    satisfaction_rate DECIMAL(5,2),
    INDEX idx_date (analytics_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- INSERT DEFAULT DATA
-- ============================================================================

-- Insert default rewards
INSERT INTO rewards (id, reward_name, description, points_required, reward_type) VALUES
('reward-1', 'First Steps', 'Complete your first wellness activity', 10, 'badge'),
('reward-2', 'Week Warrior', 'Maintain a 7-day streak', 50, 'badge'),
('reward-3', 'Mood Master', 'Log mood for 30 consecutive days', 100, 'badge'),
('reward-4', 'Reflection Pro', 'Write 10 journal entries', 75, 'badge'),
('reward-5', 'Wellness Champion', 'Earn 500 total points', 500, 'achievement')
ON DUPLICATE KEY UPDATE reward_name=reward_name;

-- Insert default wellness challenges
INSERT INTO wellness_challenges (id, challenge_name, description, points_reward) VALUES
('challenge-1', 'Morning Meditation', 'Complete 5 minutes of morning meditation', 15),
('challenge-2', 'Gratitude Journal', 'Write 3 things you are grateful for', 10),
('challenge-3', 'Deep Breathing', 'Practice deep breathing for 10 minutes', 10),
('challenge-4', 'Positive Affirmations', 'Repeat 5 positive affirmations', 10),
('challenge-5', 'Mindful Walk', 'Take a 15-minute mindful walk', 20)
ON DUPLICATE KEY UPDATE challenge_name=challenge_name;

-- ============================================================================
-- CREATE VIEWS FOR DASHBOARD OPTIMIZATION
-- ============================================================================

-- User Dashboard Summary View
CREATE OR REPLACE VIEW user_dashboard_summary AS
SELECT 
    u.id as user_id,
    u.name,
    u.email,
    u.profile_photo,
    COALESCE(up.total_points, 0) as total_points,
    COALESCE(up.current_streak, 0) as current_streak,
    COALESCE(up.longest_streak, 0) as longest_streak,
    (SELECT COUNT(*) FROM mood_check_ins WHERE user_id = u.id AND DATE(created_at) = CURDATE()) as today_mood_checkins,
    (SELECT mood FROM mood_check_ins WHERE user_id = u.id ORDER BY created_at DESC LIMIT 1) as latest_mood,
    (SELECT COUNT(*) FROM user_wellness_progress WHERE user_id = u.id AND status = 'completed' AND DATE(completed_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)) as weekly_challenges_completed,
    (SELECT COUNT(*) FROM journal_entries WHERE user_id = u.id) as total_journal_entries,
    (SELECT COUNT(*) FROM user_rewards WHERE user_id = u.id) as total_badges,
    (SELECT scheduled_at FROM counsellor_sessions WHERE user_id = u.id AND scheduled_at > NOW() ORDER BY scheduled_at LIMIT 1) as next_session
FROM users u
LEFT JOIN user_points up ON u.id = up.user_id
WHERE u.role = 'user';

-- Counsellor Dashboard Summary View
CREATE OR REPLACE VIEW counsellor_dashboard_summary AS
SELECT 
    u.id as counsellor_id,
    u.name,
    u.email,
    u.profile_photo,
    u.counsellor_status,
    COUNT(DISTINCT cs.user_id) as total_patients,
    COUNT(DISTINCT CASE WHEN DATE(cs.scheduled_at) = CURDATE() THEN cs.id END) as today_sessions,
    COUNT(DISTINCT CASE WHEN cs.session_status = 'completed' THEN cs.id END) as completed_sessions,
    COUNT(DISTINCT CASE WHEN cs.session_status = 'scheduled' AND cs.scheduled_at > NOW() THEN cs.id END) as upcoming_sessions,
    COUNT(DISTINCT cg.id) as total_groups,
    AVG(CASE WHEN cs.session_status = 'completed' THEN cs.duration_minutes END) as avg_session_duration,
    AVG(CASE WHEN cs.patient_feedback IS NOT NULL THEN cs.patient_feedback END) as avg_patient_rating,
    (SELECT COUNT(*) FROM patient_progress WHERE counsellor_id = u.id AND improvement_status = 'improving') as improving_patients,
    (SELECT COUNT(*) FROM patient_progress WHERE counsellor_id = u.id AND improvement_status = 'needs_attention') as patients_need_attention
FROM users u
LEFT JOIN counsellor_sessions cs ON u.id = cs.counsellor_id
LEFT JOIN counsellor_groups cg ON u.id = cg.counsellor_id
WHERE u.role = 'counsellor'
GROUP BY u.id, u.name, u.email, u.profile_photo, u.counsellor_status;

-- Admin Dashboard Summary View
CREATE OR REPLACE VIEW admin_dashboard_summary AS
SELECT 
    (SELECT COUNT(*) FROM users WHERE role = 'user') as total_users,
    (SELECT COUNT(*) FROM users WHERE role = 'user' AND account_status = 'active') as active_users,
    (SELECT COUNT(*) FROM users WHERE role = 'counsellor') as total_counsellors,
    (SELECT COUNT(*) FROM users WHERE role = 'counsellor' AND counsellor_status = 'approved') as approved_counsellors,
    (SELECT COUNT(*) FROM users WHERE role = 'counsellor' AND counsellor_status = 'pending') as pending_counsellors,
    (SELECT COUNT(*) FROM counsellor_sessions WHERE DATE(scheduled_at) = CURDATE()) as today_sessions,
    (SELECT COUNT(*) FROM counsellor_sessions WHERE session_status = 'completed') as total_completed_sessions,
    (SELECT AVG(patient_feedback) FROM counsellor_sessions WHERE patient_feedback IS NOT NULL) as avg_satisfaction_rate,
    (SELECT COUNT(*) FROM login_history WHERE DATE(login_time) = CURDATE()) as daily_active_users,
    (SELECT COUNT(DISTINCT user_id) FROM login_history WHERE DATE(login_time) = CURDATE() AND user_id IN (SELECT id FROM users WHERE role = 'counsellor')) as daily_active_counsellors,
    (SELECT COUNT(*) FROM system_alerts WHERE status = 'active') as active_alerts,
    (SELECT COUNT(*) FROM system_alerts WHERE status = 'active' AND severity = 'high') as high_priority_alerts;

-- ============================================================================
-- STORED PROCEDURES FOR COMMON OPERATIONS
-- ============================================================================

-- Procedure to update user points and streak
DELIMITER //
CREATE PROCEDURE IF NOT EXISTS update_user_points(
    IN p_user_id VARCHAR(36),
    IN p_points_to_add INT
)
BEGIN
    DECLARE v_last_activity DATE;
    DECLARE v_current_streak INT;
    
    -- Get last activity date
    SELECT last_activity_date, current_streak INTO v_last_activity, v_current_streak
    FROM user_points WHERE user_id = p_user_id;
    
    -- If no record exists, create one
    IF v_last_activity IS NULL THEN
        INSERT INTO user_points (user_id, total_points, current_streak, longest_streak, last_activity_date)
        VALUES (p_user_id, p_points_to_add, 1, 1, CURDATE());
    ELSE
        -- Check if activity is consecutive
        IF v_last_activity = DATE_SUB(CURDATE(), INTERVAL 1 DAY) THEN
            -- Consecutive day - increment streak
            UPDATE user_points 
            SET total_points = total_points + p_points_to_add,
                current_streak = current_streak + 1,
                longest_streak = GREATEST(longest_streak, current_streak + 1),
                last_activity_date = CURDATE()
            WHERE user_id = p_user_id;
        ELSEIF v_last_activity = CURDATE() THEN
            -- Same day - just add points
            UPDATE user_points 
            SET total_points = total_points + p_points_to_add
            WHERE user_id = p_user_id;
        ELSE
            -- Streak broken - reset to 1
            UPDATE user_points 
            SET total_points = total_points + p_points_to_add,
                current_streak = 1,
                last_activity_date = CURDATE()
            WHERE user_id = p_user_id;
        END IF;
    END IF;
END //
DELIMITER ;

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC OPERATIONS
-- ============================================================================

-- Trigger to award points when mood check-in is created
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_mood_checkin_insert
AFTER INSERT ON mood_check_ins
FOR EACH ROW
BEGIN
    CALL update_user_points(NEW.user_id, 10);
END //
DELIMITER ;

-- Trigger to award points when journal entry is created
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_journal_entry_insert
AFTER INSERT ON journal_entries
FOR EACH ROW
BEGIN
    CALL update_user_points(NEW.user_id, 15);
END //
DELIMITER ;

-- Trigger to award points when wellness challenge is completed
DELIMITER //
CREATE TRIGGER IF NOT EXISTS after_wellness_progress_update
AFTER UPDATE ON user_wellness_progress
FOR EACH ROW
BEGIN
    IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
        DECLARE v_points INT;
        SELECT points_reward INTO v_points FROM wellness_challenges WHERE id = NEW.challenge_id;
        CALL update_user_points(NEW.user_id, v_points);
    END IF;
END //
DELIMITER ;

-- ============================================================================
-- INDEXES FOR PERFORMANCE OPTIMIZATION
-- ============================================================================

-- Additional indexes for frequently queried fields
CREATE INDEX IF NOT EXISTS idx_users_account_status ON users(account_status);
CREATE INDEX IF NOT EXISTS idx_users_counsellor_status ON users(counsellor_status);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON counsellor_sessions(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_chat_user ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_voice_user_date ON voice_logs(user_id, created_at);

-- ============================================================================
-- SCHEMA COMPLETE - 22 TABLES CREATED
-- ============================================================================
-- Tables support:
-- - User authentication and roles (users, login_history, user_activity_logs)
-- - Mood tracking (mood_check_ins)
-- - Journaling (journal_entries)
-- - AI chat (chat_conversations, chat_messages)
-- - Voice input (voice_logs) - AWS Transcribe + S3
-- - Counsellor sessions (counsellor_sessions, counsellor_availability)
-- - Group therapy (counsellor_groups, group_members, group_messages, group_activity_logs)
-- - Wellness challenges (wellness_challenges, user_wellness_progress)
-- - Gamification (user_points, rewards, user_rewards)
-- - Patient tracking (patient_progress)
-- - Admin monitoring (system_alerts, daily_analytics)
-- ============================================================================

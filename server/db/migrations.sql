-- MindCare Database Schema Migrations
-- Run this script to create all required tables for AWS Lambda migration

-- Mood tracking table
CREATE TABLE IF NOT EXISTS mood_check_ins (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    mood_value INT NOT NULL CHECK (mood_value BETWEEN 1 AND 10),
    emotion VARCHAR(50),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, created_at),
    INDEX idx_emotion (emotion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Journal entries table
CREATE TABLE IF NOT EXISTS journal_entries (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    entry_text TEXT NOT NULL,
    sentiment VARCHAR(20),
    ai_feedback TEXT,
    entry_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_date (user_id, entry_date),
    INDEX idx_entry_date (entry_date),
    INDEX idx_sentiment (sentiment)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Wellness activities table
CREATE TABLE IF NOT EXISTS wellness_activities (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    activity_name VARCHAR(100),
    duration_minutes INT,
    points_earned INT DEFAULT 10,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_activity (user_id, completed_at),
    INDEX idx_activity_type (activity_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    message_text TEXT NOT NULL,
    response_text TEXT,
    emotion VARCHAR(50),
    model_used VARCHAR(50) DEFAULT 'bedrock-claude',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_chat (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Counsellor sessions table
CREATE TABLE IF NOT EXISTS counsellor_sessions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    counsellor_id VARCHAR(36),
    scheduled_at TIMESTAMP NOT NULL,
    duration_minutes INT DEFAULT 60,
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show')),
    notes TEXT,
    session_type VARCHAR(50) DEFAULT 'individual',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (counsellor_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_sessions (user_id, scheduled_at),
    INDEX idx_counsellor_sessions (counsellor_id, scheduled_at),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Rewards table (available rewards)
CREATE TABLE IF NOT EXISTS rewards (
    id VARCHAR(36) PRIMARY KEY,
    reward_name VARCHAR(100) NOT NULL,
    reward_description TEXT,
    points_required INT NOT NULL,
    reward_type VARCHAR(50) DEFAULT 'badge',
    icon_url VARCHAR(255),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User rewards table (earned rewards)
CREATE TABLE IF NOT EXISTS user_rewards (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    reward_id VARCHAR(36) NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reward_id) REFERENCES rewards(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_reward (user_id, reward_id),
    INDEX idx_user_rewards (user_id, earned_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User points table (wellness points tracking)
CREATE TABLE IF NOT EXISTS user_points (
    user_id VARCHAR(36) PRIMARY KEY,
    total_points INT DEFAULT 0,
    current_streak INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    last_activity_date DATE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Counsellor groups table
CREATE TABLE IF NOT EXISTS counsellor_groups (
    id VARCHAR(36) PRIMARY KEY,
    counsellor_id VARCHAR(36) NOT NULL,
    group_name VARCHAR(100) NOT NULL,
    group_description TEXT,
    max_members INT DEFAULT 10,
    meeting_schedule VARCHAR(100),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (counsellor_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_counsellor_groups (counsellor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Group members table
CREATE TABLE IF NOT EXISTS group_members (
    id VARCHAR(36) PRIMARY KEY,
    group_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'removed')),
    FOREIGN KEY (group_id) REFERENCES counsellor_groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_group_member (group_id, user_id),
    INDEX idx_group_members (group_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Analytics aggregation table (for dashboard performance)
CREATE TABLE IF NOT EXISTS daily_analytics (
    id VARCHAR(36) PRIMARY KEY,
    analytics_date DATE NOT NULL,
    total_users INT DEFAULT 0,
    active_users INT DEFAULT 0,
    total_counsellors INT DEFAULT 0,
    active_counsellors INT DEFAULT 0,
    total_sessions INT DEFAULT 0,
    completed_sessions INT DEFAULT 0,
    total_chat_messages INT DEFAULT 0,
    total_mood_checkins INT DEFAULT 0,
    average_mood DECIMAL(3,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_date (analytics_date),
    INDEX idx_date (analytics_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default rewards
INSERT INTO rewards (id, reward_name, reward_description, points_required, reward_type) VALUES
('reward-1', 'First Steps', 'Complete your first wellness activity', 10, 'badge'),
('reward-2', 'Week Warrior', 'Maintain a 7-day streak', 50, 'badge'),
('reward-3', 'Mood Master', 'Log mood for 30 consecutive days', 100, 'badge'),
('reward-4', 'Reflection Pro', 'Write 10 journal entries', 75, 'badge'),
('reward-5', 'Wellness Champion', 'Earn 500 total points', 500, 'achievement')
ON DUPLICATE KEY UPDATE reward_name=reward_name;

-- Create view for user dashboard summary
CREATE OR REPLACE VIEW user_dashboard_summary AS
SELECT 
    u.id as user_id,
    u.name,
    u.email,
    COALESCE(up.total_points, 0) as total_points,
    COALESCE(up.current_streak, 0) as current_streak,
    (SELECT COUNT(*) FROM mood_check_ins WHERE user_id = u.id AND DATE(created_at) = CURDATE()) as today_mood_checkins,
    (SELECT COUNT(*) FROM wellness_activities WHERE user_id = u.id AND DATE(completed_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)) as weekly_activities,
    (SELECT COUNT(*) FROM user_rewards WHERE user_id = u.id) as total_badges,
    (SELECT scheduled_at FROM counsellor_sessions WHERE user_id = u.id AND scheduled_at > NOW() ORDER BY scheduled_at LIMIT 1) as next_session
FROM users u
LEFT JOIN user_points up ON u.id = up.user_id
WHERE u.role = 'user';

-- Create view for counsellor dashboard summary
CREATE OR REPLACE VIEW counsellor_dashboard_summary AS
SELECT 
    u.id as counsellor_id,
    u.name,
    COUNT(DISTINCT cs.user_id) as total_patients,
    COUNT(DISTINCT CASE WHEN DATE(cs.scheduled_at) = CURDATE() THEN cs.id END) as today_sessions,
    COUNT(DISTINCT CASE WHEN cs.status = 'completed' THEN cs.id END) as completed_sessions,
    COUNT(DISTINCT cg.id) as total_groups,
    AVG(CASE WHEN cs.status = 'completed' THEN cs.duration_minutes END) as avg_session_duration
FROM users u
LEFT JOIN counsellor_sessions cs ON u.id = cs.counsellor_id
LEFT JOIN counsellor_groups cg ON u.id = cg.counsellor_id
WHERE u.role = 'counsellor'
GROUP BY u.id, u.name;

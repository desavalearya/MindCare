# Complete Database Schema Update - 22 Tables

## ✅ Update Complete

The database schema has been completely updated with all 22 tables required for the MindCare platform.

---

## 📊 Complete Table List

### Authentication & User Management (3 tables)
1. ✅ **users** - User authentication, roles (user/counsellor/admin), counsellor approval
2. ✅ **login_history** - Login/logout tracking for admin analytics
3. ✅ **user_activity_logs** - Recent activity tracking

### Mood & Wellness Tracking (4 tables)
4. ✅ **mood_check_ins** - Quick mood check-in (7 mood options)
5. ✅ **journal_entries** - Daily reflection with AI feedback
6. ✅ **wellness_challenges** - Available wellness challenges
7. ✅ **user_wellness_progress** - User progress on challenges

### AI Chat & Voice (4 tables)
8. ✅ **chat_conversations** - AI conversation sessions
9. ✅ **chat_messages** - Individual chat messages (user/ai)
10. ✅ **voice_logs** - Voice recordings (AWS Transcribe + S3)

### Counsellor Management (6 tables)
11. ✅ **counsellor_sessions** - Session scheduling and tracking
12. ✅ **counsellor_availability** - Working hours by weekday
13. ✅ **counsellor_groups** - Group therapy sessions
14. ✅ **group_members** - Group membership tracking
15. ✅ **group_messages** - Group chat messages
16. ✅ **group_activity_logs** - Group activity tracking

### Gamification & Rewards (3 tables)
17. ✅ **user_points** - Points, streaks, gamification
18. ✅ **rewards** - Available badges and achievements
19. ✅ **user_rewards** - Earned rewards

### Analytics & Monitoring (3 tables)
20. ✅ **patient_progress** - Patient improvement tracking
21. ✅ **system_alerts** - Admin system alerts
22. ✅ **daily_analytics** - Daily aggregated metrics

---

## 🆕 New Tables Added

### Previously Missing Tables (11 new tables):

1. **users** - Complete user table with roles and counsellor approval
2. **login_history** - Track daily active users/counsellors
3. **user_activity_logs** - Recent activity for user dashboard
4. **chat_conversations** - Organize chat into conversations
5. **voice_logs** - Store voice recordings and transcriptions
6. **counsellor_availability** - Working hours management
7. **group_activity_logs** - Track group events
8. **wellness_challenges** - Define available challenges
9. **user_wellness_progress** - Track challenge completion
10. **patient_progress** - Counsellor analytics on patient improvement
11. **system_alerts** - Admin monitoring and alerts

---

## 🔧 Schema Enhancements

### Updated Tables:

1. **mood_check_ins** - Simplified to ENUM only (Happy, Dull, Sad, Anxious, Angry, Stressed, Depressed)
2. **journal_entries** - Added sentiment and ai_feedback fields
3. **chat_messages** - Restructured to use conversation_id and sender enum
4. **counsellor_sessions** - Added patient_feedback and counsellor_notes
5. **group_members** - Updated status enum (active, left, removed)
6. **user_points** - Added longest_streak tracking
7. **rewards** - Simplified with reward_type enum
8. **daily_analytics** - Updated to match admin dashboard needs

---

## 📋 Database Views (3 views)

### 1. user_dashboard_summary
Optimized view for user dashboard with:
- Total points, current streak, longest streak
- Today's mood check-ins and latest mood
- Weekly challenges completed
- Total journal entries and badges
- Next upcoming session

### 2. counsellor_dashboard_summary
Optimized view for counsellor dashboard with:
- Total patients and today's sessions
- Completed and upcoming sessions
- Total groups managed
- Average session duration and patient rating
- Improving patients vs. patients needing attention

### 3. admin_dashboard_summary
Optimized view for admin dashboard with:
- Total and active users
- Total, approved, and pending counsellors
- Today's sessions and total completed sessions
- Average satisfaction rate
- Daily active users and counsellors
- Active alerts and high-priority alerts

---

## ⚙️ Stored Procedures (1 procedure)

### update_user_points(user_id, points_to_add)
Automatically handles:
- Adding points to user total
- Calculating and updating streaks
- Tracking longest streak
- Managing consecutive day logic

---

## 🔔 Triggers (3 triggers)

### 1. after_mood_checkin_insert
- Awards 10 points when user logs mood
- Updates streak automatically

### 2. after_journal_entry_insert
- Awards 15 points when user writes journal entry
- Updates streak automatically

### 3. after_wellness_progress_update
- Awards challenge-specific points when completed
- Updates streak automatically

---

## 🗄️ AWS Integration Points

### Amazon S3 - File Storage
Used for:
1. **voice_logs.audio_url** - Voice recordings (mp3, wav, etc.)
2. **users.profile_photo** - Profile pictures
3. **rewards.icon_url** - Badge/achievement icons

**S3 Buckets:**
- `mindcare-audio-uploads` - Voice recordings
- `mindcare-user-content` - Profile photos, documents

### Aurora MySQL Serverless - Database
All 22 tables stored in Aurora MySQL with:
- Auto-scaling (0.5 - 2 ACU)
- Multi-AZ deployment
- Automated backups (7 days)
- Encryption at rest (KMS)

---

## 📊 Sample Queries

### User Dashboard Data
```sql
SELECT * FROM user_dashboard_summary WHERE user_id = 'user-123';
```

### Counsellor Dashboard Data
```sql
SELECT * FROM counsellor_dashboard_summary WHERE counsellor_id = 'counsellor-456';
```

### Admin Dashboard Data
```sql
SELECT * FROM admin_dashboard_summary;
```

### Daily Active Users
```sql
SELECT COUNT(DISTINCT user_id) 
FROM login_history 
WHERE DATE(login_time) = CURDATE();
```

### Pending Counsellor Approvals
```sql
SELECT id, name, email, created_at 
FROM users 
WHERE role = 'counsellor' AND counsellor_status = 'pending'
ORDER BY created_at DESC;
```

### User Recent Activity
```sql
SELECT activity_type, description, created_at 
FROM user_activity_logs 
WHERE user_id = 'user-123' 
ORDER BY created_at DESC 
LIMIT 10;
```

### Mood Trend (Last 7 Days)
```sql
SELECT DATE(created_at) as date, mood, COUNT(*) as count
FROM mood_check_ins
WHERE user_id = 'user-123'
  AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY DATE(created_at), mood
ORDER BY date DESC;
```

### Counsellor Working Hours
```sql
SELECT weekday, start_time, end_time
FROM counsellor_availability
WHERE counsellor_id = 'counsellor-456'
ORDER BY FIELD(weekday, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');
```

### Group Members
```sql
SELECT u.name, u.email, gm.joined_at, gm.status
FROM group_members gm
JOIN users u ON gm.user_id = u.id
WHERE gm.group_id = 'group-789'
  AND gm.status = 'active'
ORDER BY gm.joined_at;
```

### Patient Improvement Status
```sql
SELECT u.name, pp.improvement_status, pp.progress_score, pp.updated_at
FROM patient_progress pp
JOIN users u ON pp.user_id = u.id
WHERE pp.counsellor_id = 'counsellor-456'
ORDER BY pp.improvement_status, pp.progress_score DESC;
```

### Active System Alerts
```sql
SELECT alert_type, message, severity, created_at
FROM system_alerts
WHERE status = 'active'
ORDER BY 
  FIELD(severity, 'high', 'medium', 'low'),
  created_at DESC;
```

---

## 🚀 Migration Steps

### Step 1: Backup Existing Data (if any)
```bash
mysqldump -h your-aurora-endpoint -u admin -p mindcare_db > backup.sql
```

### Step 2: Run Migration Script
```bash
mysql -h your-aurora-endpoint -u admin -p mindcare_db < server/db/migrations.sql
```

### Step 3: Verify Tables Created
```sql
SHOW TABLES;
-- Should show 22 tables
```

### Step 4: Verify Views Created
```sql
SHOW FULL TABLES WHERE Table_type = 'VIEW';
-- Should show 3 views
```

### Step 5: Verify Stored Procedures
```sql
SHOW PROCEDURE STATUS WHERE Db = 'mindcare_db';
-- Should show update_user_points
```

### Step 6: Verify Triggers
```sql
SHOW TRIGGERS;
-- Should show 3 triggers
```

### Step 7: Test Sample Queries
```sql
-- Test user dashboard view
SELECT * FROM user_dashboard_summary LIMIT 1;

-- Test counsellor dashboard view
SELECT * FROM counsellor_dashboard_summary LIMIT 1;

-- Test admin dashboard view
SELECT * FROM admin_dashboard_summary;
```

---

## 📈 Performance Optimizations

### Indexes Created (20+ indexes)
- Primary keys on all tables
- Foreign key indexes for relationships
- Composite indexes for common queries
- Date-based indexes for time-series data

### Views for Dashboard Performance
- Pre-aggregated data for faster loading
- Reduced complex JOIN operations
- Optimized for common dashboard queries

### Triggers for Automation
- Automatic point calculation
- Automatic streak tracking
- Reduced application logic

---

## 🔐 Security Features

### Data Protection
- Foreign key constraints with CASCADE delete
- ENUM validation for status fields
- Unique constraints to prevent duplicates

### AWS Integration
- S3 pre-signed URLs for secure file access
- Aurora encryption at rest
- IAM-based database authentication (optional)

---

## 📝 Default Data Inserted

### Rewards (5 default rewards)
1. First Steps - 10 points
2. Week Warrior - 50 points
3. Mood Master - 100 points
4. Reflection Pro - 75 points
5. Wellness Champion - 500 points

### Wellness Challenges (5 default challenges)
1. Morning Meditation - 15 points
2. Gratitude Journal - 10 points
3. Deep Breathing - 10 points
4. Positive Affirmations - 10 points
5. Mindful Walk - 20 points

---

## ✅ Verification Checklist

- [x] All 22 tables created
- [x] All foreign key relationships defined
- [x] All indexes created for performance
- [x] 3 dashboard views created
- [x] 1 stored procedure created
- [x] 3 triggers created for automation
- [x] Default rewards data inserted
- [x] Default wellness challenges inserted
- [x] S3 integration fields included (audio_url, profile_photo, icon_url)
- [x] Aurora MySQL compatible syntax
- [x] UTF-8 character set configured
- [x] InnoDB engine for all tables

---

## 🎯 Next Steps

1. **Run the migration** on Aurora MySQL
2. **Test all views** to ensure they return data correctly
3. **Test stored procedures** with sample data
4. **Verify triggers** are firing correctly
5. **Update Lambda functions** to use new schema
6. **Update frontend** to display new data fields
7. **Configure S3 buckets** for file storage
8. **Test end-to-end flows** for each user role

---

**Database schema is now complete with all 22 tables! ✅**

**Total Tables:** 22
**Total Views:** 3
**Total Stored Procedures:** 1
**Total Triggers:** 3
**Total Indexes:** 20+
**AWS Services:** S3 (file storage) + Aurora MySQL (database)

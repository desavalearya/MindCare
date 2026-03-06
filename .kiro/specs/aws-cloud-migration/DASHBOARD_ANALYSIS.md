# Dashboard Requirements Analysis & AWS Migration Enhancement Plan

## Executive Summary

This document analyzes the comprehensive dashboard requirements for the MindCare platform across three user roles (USER, COUNSELLOR, ADMIN) and identifies gaps in the current AWS cloud migration specification. The analysis reveals significant missing components related to:

1. **Database Schema Enhancements**: Additional tables for mood tracking, wellness activities, rewards, analytics aggregation
2. **Analytics Engine**: Real-time and batch analytics processing for user insights, counsellor performance, admin monitoring
3. **Dashboard-Specific APIs**: Role-based endpoints for dashboard data retrieval and updates
4. **Monitoring & Alerting**: System health metrics, admin alerts, performance tracking
5. **Microservices Architecture**: Potential separation of analytics and dashboard services

## Current Spec Analysis

### What's Already Covered
✅ Infrastructure setup (VPC, ECS, Aurora, S3)
✅ AI services migration (Bedrock, Transcribe, Polly, Comprehend)
✅ Authentication with Cognito (basic user/counsellor/admin groups)
✅ Basic database schema (users, sessions, messages, preferences, ai_interactions)
✅ CI/CD pipelines
✅ Monitoring with CloudWatch
✅ Security (IAM, Secrets Manager, KMS)

### Critical Gaps Identified

#### 1. Database Schema Gaps
**Missing Tables:**
- `mood_check_ins` - Store daily mood data with emotion classification
- `wellness_activities` - Track completed wellness challenges
- `wellness_points` - User gamification points system
- `rewards` - Badge assignments and achievement tracking
- `journal_entries` - Daily reflection with sentiment analysis
- `counsellor_recommendations` - Recommendation logic and history
- `group_sessions` - Group therapy sessions
- `group_members` - Group membership tracking
- `group_messages` - Group chat functionality
- `patient_assignments` - Counsellor-patient relationships
- `analytics_snapshots` - Pre-aggregated analytics data
- `system_metrics` - Admin monitoring data

**Missing Indexes:**
- Composite indexes for analytics queries
- Time-series indexes for mood tracking
- User-counsellor relationship indexes

#### 2. Analytics & Aggregation Logic
**Missing Components:**
- Real-time analytics calculation engine
- Batch aggregation jobs (daily/weekly/monthly)
- Counsellor performance metrics calculation
- User improvement tracking algorithms
- Admin dashboard metrics aggregation
- Trend analysis and comparison logic

#### 3. Dashboard-Specific APIs
**Missing Endpoints:**

**User Dashboard:**
- `GET /api/v1/users/{userId}/dashboard` - Complete dashboard data
- `POST /api/v1/mood-check-ins` - Submit mood data
- `GET /api/v1/mood-check-ins/streak` - Get current streak
- `GET /api/v1/wellness/activities` - Get available activities
- `POST /api/v1/wellness/activities/{activityId}/complete` - Mark complete
- `GET /api/v1/wellness/points` - Get current points
- `GET /api/v1/rewards` - Get earned badges
- `GET /api/v1/journal` - Get journal entries
- `POST /api/v1/journal` - Create journal entry
- `GET /api/v1/counsellors/suggested` - Get recommended counsellors
- `GET /api/v1/sessions/upcoming` - Get upcoming sessions

**Counsellor Dashboard:**
- `GET /api/v1/counsellors/{counsellorId}/dashboard` - Complete dashboard
- `GET /api/v1/counsellors/{counsellorId}/patients` - Get assigned patients
- `GET /api/v1/counsellors/{counsellorId}/analytics` - Performance analytics
- `GET /api/v1/counsellors/{counsellorId}/groups` - Get managed groups
- `POST /api/v1/groups` - Create new group
- `POST /api/v1/groups/{groupId}/sessions` - Schedule group session
- `GET /api/v1/groups/{groupId}/messages` - Get group chat
- `POST /api/v1/groups/{groupId}/messages` - Send group message
- `GET /api/v1/patients/{patientId}/trends` - Get patient emotional trends

**Admin Dashboard:**
- `GET /api/v1/admin/dashboard` - Complete admin dashboard
- `GET /api/v1/admin/users` - Get all users with filters
- `GET /api/v1/admin/counsellors/pending` - Get pending approvals
- `PUT /api/v1/admin/counsellors/{counsellorId}/approve` - Approve counsellor
- `PUT /api/v1/admin/counsellors/{counsellorId}/reject` - Reject counsellor
- `GET /api/v1/admin/analytics` - System-wide analytics
- `GET /api/v1/admin/metrics` - System health metrics
- `GET /api/v1/admin/alerts` - System alerts

#### 4. Microservices Architecture Gaps
**Potential Service Separation:**
- **Analytics Service**: Separate ECS service for analytics processing
- **Dashboard Service**: Dedicated service for dashboard data aggregation
- **Notification Service**: Real-time alerts and notifications
- **Recommendation Engine**: ML-based counsellor recommendations

#### 5. CloudWatch Metrics Gaps
**Missing Custom Metrics:**
- Daily Active Users (DAU)
- Daily Active Counsellors
- Session completion rate
- Average mood score
- Wellness activity completion rate
- AI interaction frequency
- User retention rate
- Counsellor utilization rate

#### 6. Admin Monitoring System
**Missing Components:**
- System health dashboard
- Real-time alert system
- Backup status monitoring
- Server load tracking
- User growth tracking
- Satisfaction rate calculation

## Enhanced Database Schema Design

### Core Tables (Already Exist - Need Enhancement)

#### users (Enhanced)
```sql
ALTER TABLE users ADD COLUMN wellness_points INT DEFAULT 0;
ALTER TABLE users ADD COLUMN mood_streak INT DEFAULT 0;
ALTER TABLE users ADD COLUMN last_mood_check_in TIMESTAMP;
ALTER TABLE users ADD COLUMN onboarding_step VARCHAR(50);
ALTER TABLE users ADD COLUMN satisfaction_rating DECIMAL(3,2);
CREATE INDEX idx_users_wellness_points ON users(wellness_points);
CREATE INDEX idx_users_mood_streak ON users(mood_streak);
```

### New Tables Required

#### mood_check_ins
```sql
CREATE TABLE mood_check_ins (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    mood ENUM('Happy', 'Dull', 'Sad', 'Anxious', 'Angry', 'Stressed', 'Depressed') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, created_at),
    INDEX idx_mood (mood)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### wellness_activities
```sql
CREATE TABLE wellness_activities (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50),
    duration_minutes INT,
    points_reward INT DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### user_wellness_completions
```sql
CREATE TABLE user_wellness_completions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    activity_id VARCHAR(36) NOT NULL,
    duration_minutes INT,
    points_earned INT,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (activity_id) REFERENCES wellness_activities(id),
    INDEX idx_completions_user (user_id),
    INDEX idx_completions_date (completed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### journal_entries
```sql
CREATE TABLE journal_entries (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    entry_text TEXT NOT NULL,
    sentiment VARCHAR(20),
    sentiment_score DECIMAL(3,2),
    ai_feedback TEXT,
    entry_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_journal_user_date (user_id, entry_date),
    UNIQUE KEY unique_user_date (user_id, entry_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### rewards
```sql
CREATE TABLE rewards (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    badge_icon VARCHAR(255),
    criteria_type VARCHAR(50),
    criteria_value INT,
    is_active BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### user_rewards
```sql
CREATE TABLE user_rewards (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    reward_id VARCHAR(36) NOT NULL,
    earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reward_id) REFERENCES rewards(id),
    INDEX idx_user_rewards (user_id),
    UNIQUE KEY unique_user_reward (user_id, reward_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### counsellor_recommendations
```sql
CREATE TABLE counsellor_recommendations (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    counsellor_id VARCHAR(36) NOT NULL,
    recommendation_score DECIMAL(3,2),
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (counsellor_id) REFERENCES users(id),
    INDEX idx_recommendations_user (user_id),
    INDEX idx_recommendations_score (recommendation_score DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### patient_assignments
```sql
CREATE TABLE patient_assignments (
    id VARCHAR(36) PRIMARY KEY,
    counsellor_id VARCHAR(36) NOT NULL,
    patient_id VARCHAR(36) NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active',
    FOREIGN KEY (counsellor_id) REFERENCES users(id),
    FOREIGN KEY (patient_id) REFERENCES users(id),
    INDEX idx_assignments_counsellor (counsellor_id),
    INDEX idx_assignments_patient (patient_id),
    UNIQUE KEY unique_assignment (counsellor_id, patient_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### groups
```sql
CREATE TABLE groups (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    counsellor_id VARCHAR(36) NOT NULL,
    max_members INT DEFAULT 10,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (counsellor_id) REFERENCES users(id),
    INDEX idx_groups_counsellor (counsellor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### group_members
```sql
CREATE TABLE group_members (
    id VARCHAR(36) PRIMARY KEY,
    group_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP NULL,
    status VARCHAR(20) DEFAULT 'active',
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_members_group (group_id),
    INDEX idx_members_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### group_sessions
```sql
CREATE TABLE group_sessions (
    id VARCHAR(36) PRIMARY KEY,
    group_id VARCHAR(36) NOT NULL,
    scheduled_at TIMESTAMP NOT NULL,
    duration_minutes INT DEFAULT 60,
    status VARCHAR(20) DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    INDEX idx_group_sessions_group (group_id),
    INDEX idx_group_sessions_date (scheduled_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### group_messages
```sql
CREATE TABLE group_messages (
    id VARCHAR(36) PRIMARY KEY,
    group_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    message_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_group_messages_group (group_id),
    INDEX idx_group_messages_date (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### analytics_snapshots
```sql
CREATE TABLE analytics_snapshots (
    id VARCHAR(36) PRIMARY KEY,
    snapshot_type VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(36),
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,2),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_snapshots_type_entity (snapshot_type, entity_type, entity_id),
    INDEX idx_snapshots_period (period_start, period_end),
    INDEX idx_snapshots_metric (metric_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

#### system_metrics
```sql
CREATE TABLE system_metrics (
    id VARCHAR(36) PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value DECIMAL(10,2),
    metric_unit VARCHAR(20),
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_system_metrics_name (metric_name),
    INDEX idx_system_metrics_date (recorded_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## Analytics Aggregation Design

### Real-Time Analytics (Lambda/ECS)

#### User Dashboard Analytics
```python
def calculate_user_dashboard_metrics(user_id: str) -> dict:
    """Calculate real-time user dashboard metrics"""
    return {
        "mood_streak": get_mood_streak(user_id),
        "wellness_points": get_wellness_points(user_id),
        "recent_activities": get_recent_activities(user_id, limit=5),
        "upcoming_sessions": get_upcoming_sessions(user_id),
        "ai_interaction_count": get_ai_interaction_count(user_id, days=7)
    }
```

#### Counsellor Dashboard Analytics
```python
def calculate_counsellor_dashboard_metrics(counsellor_id: str) -> dict:
    """Calculate real-time counsellor dashboard metrics"""
    patients = get_assigned_patients(counsellor_id)
    
    return {
        "total_patients": len(patients),
        "todays_sessions": count_todays_sessions(counsellor_id),
        "weekly_hours": calculate_weekly_hours(counsellor_id),
        "improvement_percentage": calculate_improvement_rate(patients),
        "session_trends": get_session_trends(counsellor_id, months=6),
        "patient_insights": {
            "improving": count_improving_patients(patients),
            "stable": count_stable_patients(patients),
            "need_attention": count_attention_needed(patients)
        }
    }
```

#### Admin Dashboard Analytics
```python
def calculate_admin_dashboard_metrics() -> dict:
    """Calculate real-time admin dashboard metrics"""
    return {
        "total_users": count_users_by_role("USER"),
        "active_counsellors": count_active_counsellors(),
        "active_sessions": count_active_sessions(),
        "satisfaction_rate": calculate_satisfaction_rate(),
        "monthly_growth": calculate_monthly_growth(),
        "pending_approvals": count_pending_counsellors(),
        "dau": calculate_daily_active_users(),
        "system_health": get_system_health_status()
    }
```

### Batch Aggregation (EventBridge + Lambda)

#### Daily Aggregation Job
```python
def daily_aggregation_job():
    """Run daily at midnight UTC"""
    # Aggregate mood data
    aggregate_daily_mood_stats()
    
    # Calculate wellness activity completion rates
    aggregate_wellness_completions()
    
    # Update user streaks
    update_mood_streaks()
    
    # Calculate counsellor performance metrics
    aggregate_counsellor_metrics()
    
    # Update system metrics
    aggregate_system_metrics()
    
    # Store snapshots in analytics_snapshots table
    store_analytics_snapshots()
```

## AWS Architecture Enhancements

### Proposed Microservices Split

```
Current: 2 services (Express Backend + FastAPI AI)

Proposed: 5 services
1. Express Backend (Core API)
2. FastAPI AI Service (AI operations)
3. Analytics Service (Node.js/Python) - NEW
4. Dashboard Service (Node.js) - NEW
5. Notification Service (Node.js) - NEW
```

### Analytics Service Design
- **Purpose**: Handle all analytics calculations and aggregations
- **Technology**: Python (for data processing) or Node.js
- **Endpoints**:
  - `POST /analytics/user/{userId}/calculate`
  - `POST /analytics/counsellor/{counsellorId}/calculate`
  - `POST /analytics/admin/calculate`
  - `POST /analytics/batch/daily`
- **Triggers**: EventBridge scheduled events, API Gateway requests
- **Storage**: Write to analytics_snapshots table

### Dashboard Service Design
- **Purpose**: Aggregate and serve dashboard data
- **Technology**: Node.js with caching (Redis/ElastiCache)
- **Endpoints**:
  - `GET /dashboard/user/{userId}`
  - `GET /dashboard/counsellor/{counsellorId}`
  - `GET /dashboard/admin`
- **Caching Strategy**: Cache dashboard data for 5 minutes
- **Data Sources**: Aurora + analytics_snapshots

### CloudWatch Custom Metrics

```python
# Publish custom metrics
cloudwatch.put_metric_data(
    Namespace='MindCare/Application',
    MetricData=[
        {
            'MetricName': 'DailyActiveUsers',
            'Value': dau_count,
            'Unit': 'Count',
            'Timestamp': datetime.utcnow()
        },
        {
            'MetricName': 'AverageMoodScore',
            'Value': avg_mood,
            'Unit': 'None',
            'Timestamp': datetime.utcnow()
        },
        {
            'MetricName': 'SessionCompletionRate',
            'Value': completion_rate,
            'Unit': 'Percent',
            'Timestamp': datetime.utcnow()
        }
    ]
)
```

## Missing Task Categories

### Phase 12: Dashboard Database Schema Implementation
- Create all new tables
- Add indexes for analytics queries
- Create stored procedures for common aggregations
- Implement database triggers for auto-calculations

### Phase 13: Dashboard API Development
- Implement user dashboard endpoints
- Implement counsellor dashboard endpoints
- Implement admin dashboard endpoints
- Add caching layer (ElastiCache)

### Phase 14: Analytics Engine Development
- Create analytics service
- Implement real-time calculation functions
- Create batch aggregation jobs
- Set up EventBridge schedules

### Phase 15: Recommendation Engine
- Implement counsellor recommendation algorithm
- Create ML model for matching (optional: SageMaker)
- Integrate with dashboard APIs

### Phase 16: Group Management System
- Implement group CRUD operations
- Create group chat functionality
- Implement group session scheduling
- Add group analytics

### Phase 17: Wellness & Gamification System
- Implement wellness activity tracking
- Create points calculation system
- Implement rewards/badges logic
- Add streak tracking

### Phase 18: Admin Monitoring Dashboard
- Create system metrics collection
- Implement alert system
- Create admin dashboard UI components
- Add user management features

### Phase 19: Performance Optimization
- Implement database query optimization
- Add read replicas for analytics queries
- Implement caching strategies
- Optimize aggregation queries

### Phase 20: Advanced Monitoring
- Set up custom CloudWatch metrics
- Create CloudWatch dashboards for each role
- Implement alerting rules
- Add X-Ray tracing for analytics

## Risk Assessment

### High Risk Areas
1. **Analytics Performance**: Complex aggregation queries may impact database performance
   - **Mitigation**: Use read replicas, implement caching, pre-aggregate data
   
2. **Real-time Dashboard Updates**: High frequency updates may cause load issues
   - **Mitigation**: Implement WebSocket connections, use caching, rate limiting

3. **Data Consistency**: Multiple services updating analytics data
   - **Mitigation**: Use database transactions, implement event sourcing

4. **Scalability**: Analytics service may become bottleneck
   - **Mitigation**: Horizontal scaling with ECS, use SQS for async processing

### Medium Risk Areas
1. **Recommendation Algorithm Accuracy**: ML-based recommendations may not be accurate initially
   - **Mitigation**: Start with rule-based system, iterate with ML

2. **Group Chat Performance**: Real-time messaging at scale
   - **Mitigation**: Use WebSocket with API Gateway, implement message queuing

## Scalability Plan

### Database Scaling
- **Read Replicas**: Create 2 read replicas for analytics queries
- **Partitioning**: Partition large tables (mood_check_ins, messages) by date
- **Archival**: Move old data (>1 year) to S3 for long-term storage

### Application Scaling
- **Auto-scaling**: Configure ECS auto-scaling for all services
- **Caching**: Implement ElastiCache (Redis) for dashboard data
- **CDN**: Use CloudFront for static dashboard assets

### Analytics Scaling
- **Batch Processing**: Use AWS Batch for heavy aggregations
- **Stream Processing**: Consider Kinesis for real-time analytics
- **Data Warehouse**: Consider Redshift for historical analytics

## Monitoring & Alerting Strategy

### CloudWatch Dashboards
1. **User Dashboard Metrics**
   - Daily active users
   - Average mood score
   - Wellness activity completion rate
   - AI interaction frequency

2. **Counsellor Dashboard Metrics**
   - Active counsellors
   - Average patients per counsellor
   - Session completion rate
   - Patient improvement rate

3. **Admin Dashboard Metrics**
   - System health score
   - Error rates
   - API latency
   - Database performance

4. **System Health Metrics**
   - ECS CPU/Memory utilization
   - Aurora connections
   - API Gateway throttling
   - Lambda errors

### Alerting Rules
- **Critical**: System down, database unavailable, high error rate (>5%)
- **Warning**: High latency (>1s), low disk space, approaching rate limits
- **Info**: Daily metrics summary, backup completion

## Next Steps

1. **Review & Approve**: Review this analysis with stakeholders
2. **Update Requirements**: Add new requirements to requirements.md
3. **Update Design**: Enhance design.md with new components
4. **Update Tasks**: Add new phases and tasks to tasks.md
5. **Prioritize**: Determine which features are MVP vs. future enhancements
6. **Estimate**: Provide time and cost estimates for each phase
7. **Execute**: Begin implementation following the enhanced task plan

## Conclusion

The current AWS migration spec provides a solid foundation for infrastructure and basic application migration. However, significant enhancements are required to support the comprehensive dashboard requirements across all three user roles. The proposed enhancements include:

- 13 new database tables
- 30+ new API endpoints
- 3 new microservices
- Advanced analytics engine
- Real-time monitoring system
- Comprehensive admin dashboard

Estimated additional effort: 8-12 weeks beyond the current 14-week migration plan.

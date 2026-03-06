# Database Schema Update - mood_check_ins Table

## 🔄 Change Summary

Updated the `mood_check_ins` table to match the Quick Mood Check-in UI requirements.

---

## ✅ What Changed

### Old Schema (Before)
```sql
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
);
```

### New Schema (After)
```sql
CREATE TABLE IF NOT EXISTS mood_check_ins (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    mood ENUM('Happy', 'Dull', 'Sad', 'Anxious', 'Angry', 'Stressed', 'Depressed') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, created_at),
    INDEX idx_mood (mood)
);
```

---

## 📋 Changes Made

### Removed Fields
- ❌ `mood_value` (INT 1-10) - No longer needed
- ❌ `emotion` (VARCHAR) - Replaced with ENUM
- ❌ `notes` (TEXT) - Not required for quick check-in

### Added/Modified Fields
- ✅ `mood` (ENUM) - Now stores exact mood option
  - Values: 'Happy', 'Dull', 'Sad', 'Anxious', 'Angry', 'Stressed', 'Depressed'
  - NOT NULL constraint
  - Indexed for fast queries

### Kept Fields
- ✅ `id` - Primary key
- ✅ `user_id` - Foreign key to users
- ✅ `created_at` - Timestamp
- ✅ `idx_user_date` - Index for user + date queries

---

## 🎯 Benefits

1. **Simpler Data Model** - Only stores what's needed
2. **Data Integrity** - ENUM ensures only valid moods
3. **Better Performance** - Smaller row size, faster queries
4. **Exact Match to UI** - Matches the 7 mood options in the UI
5. **Type Safety** - Database enforces valid mood values

---

## 💾 Sample Data

### Insert Examples
```sql
-- Insert Happy mood
INSERT INTO mood_check_ins (id, user_id, mood, created_at)
VALUES (UUID(), 'user-123', 'Happy', NOW());

-- Insert Anxious mood
INSERT INTO mood_check_ins (id, user_id, mood, created_at)
VALUES (UUID(), 'user-123', 'Anxious', NOW());

-- Insert Depressed mood
INSERT INTO mood_check_ins (id, user_id, mood, created_at)
VALUES (UUID(), 'user-123', 'Depressed', NOW());
```

### Query Examples
```sql
-- Get today's mood check-ins for a user
SELECT mood, created_at 
FROM mood_check_ins 
WHERE user_id = 'user-123' 
  AND DATE(created_at) = CURDATE()
ORDER BY created_at DESC;

-- Count moods by type for a user (last 30 days)
SELECT mood, COUNT(*) as count
FROM mood_check_ins
WHERE user_id = 'user-123'
  AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY mood
ORDER BY count DESC;

-- Get mood trend for last 7 days
SELECT DATE(created_at) as date, mood
FROM mood_check_ins
WHERE user_id = 'user-123'
  AND created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY created_at ASC;
```

---

## 🔄 Migration Steps

### If You Already Have Data

If you've already created the old table with data, run this migration:

```sql
-- Step 1: Create new table with correct schema
CREATE TABLE mood_check_ins_new (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    mood ENUM('Happy', 'Dull', 'Sad', 'Anxious', 'Angry', 'Stressed', 'Depressed') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, created_at),
    INDEX idx_mood (mood)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Step 2: Migrate data (if you have any)
-- Map old emotion values to new mood ENUM
INSERT INTO mood_check_ins_new (id, user_id, mood, created_at)
SELECT 
    id, 
    user_id,
    CASE 
        WHEN emotion IN ('happy', 'joy', 'excited') THEN 'Happy'
        WHEN emotion IN ('neutral', 'calm', 'okay') THEN 'Dull'
        WHEN emotion IN ('sad', 'down', 'unhappy') THEN 'Sad'
        WHEN emotion IN ('anxious', 'worried', 'nervous') THEN 'Anxious'
        WHEN emotion IN ('angry', 'frustrated', 'mad') THEN 'Angry'
        WHEN emotion IN ('stressed', 'overwhelmed', 'tense') THEN 'Stressed'
        WHEN emotion IN ('depressed', 'hopeless', 'empty') THEN 'Depressed'
        ELSE 'Dull' -- Default fallback
    END as mood,
    created_at
FROM mood_check_ins
WHERE emotion IS NOT NULL;

-- Step 3: Drop old table
DROP TABLE mood_check_ins;

-- Step 4: Rename new table
RENAME TABLE mood_check_ins_new TO mood_check_ins;
```

### Fresh Installation

If you haven't created the table yet, just run the updated `migrations.sql` file:

```bash
mysql -h YOUR_DB_ENDPOINT -u admin -p mindcare < server/db/migrations.sql
```

---

## 🎨 Frontend Integration

### TypeScript Type
```typescript
type Mood = 'Happy' | 'Dull' | 'Sad' | 'Anxious' | 'Angry' | 'Stressed' | 'Depressed';

interface MoodCheckIn {
  id: string;
  userId: string;
  mood: Mood;
  createdAt: Date;
}
```

### API Request Example
```typescript
// Save mood check-in
const saveMoodCheckIn = async (mood: Mood) => {
  const response = await fetch('/api/mood-checkins', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: currentUser.id,
      mood: mood, // 'Happy', 'Dull', 'Sad', etc.
    }),
  });
  return response.json();
};
```

### React Component Example
```tsx
const MoodCheckIn = () => {
  const moods: Mood[] = ['Happy', 'Dull', 'Sad', 'Anxious', 'Angry', 'Stressed', 'Depressed'];
  
  const handleMoodSelect = async (mood: Mood) => {
    await saveMoodCheckIn(mood);
    toast.success(`Mood "${mood}" saved!`);
  };
  
  return (
    <div className="mood-options">
      {moods.map(mood => (
        <button key={mood} onClick={() => handleMoodSelect(mood)}>
          {mood}
        </button>
      ))}
    </div>
  );
};
```

---

## 📊 Analytics Queries

### Mood Distribution
```sql
-- Get mood distribution for all users (last 30 days)
SELECT 
    mood,
    COUNT(*) as count,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
FROM mood_check_ins
WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY mood
ORDER BY count DESC;
```

### User Mood Trends
```sql
-- Get user's mood trend over time
SELECT 
    DATE(created_at) as date,
    mood,
    COUNT(*) as check_ins
FROM mood_check_ins
WHERE user_id = 'user-123'
  AND created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY DATE(created_at), mood
ORDER BY date ASC, mood;
```

### Most Common Mood by Time of Day
```sql
-- Analyze mood patterns by time of day
SELECT 
    HOUR(created_at) as hour,
    mood,
    COUNT(*) as count
FROM mood_check_ins
WHERE user_id = 'user-123'
GROUP BY HOUR(created_at), mood
ORDER BY hour, count DESC;
```

---

## ✅ Updated Files

The following file has been updated:
- ✅ `server/db/migrations.sql` - Updated mood_check_ins table schema

---

## 🚀 Next Steps

1. **Run the migration** on your database
2. **Update your API endpoints** to use the new `mood` field
3. **Update frontend components** to send mood as string (not number)
4. **Test the mood check-in flow** end-to-end
5. **Update any analytics queries** that reference old fields

---

## 📝 Notes

- The ENUM type ensures data integrity at the database level
- Only the 7 specified mood values can be stored
- Attempting to insert an invalid mood will result in a database error
- The mood field is indexed for fast filtering and aggregation
- The schema is now simpler and matches the UI exactly

---

**Status**: ✅ Schema Updated
**File**: `server/db/migrations.sql`
**Date**: Now
**Breaking Change**: Yes (if you have existing data)

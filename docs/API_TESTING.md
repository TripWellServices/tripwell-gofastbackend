# GoFast V2 API Testing Guide

## 🔑 Authentication

All requests require Firebase Auth token in header:
```
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

---

## 📍 Base URL
```
Development: http://localhost:5000
Production: https://your-domain.com
```

---

## 🏃 Race Endpoints

### Create Race
```http
POST /api/race/create
Content-Type: application/json
Authorization: Bearer <token>

{
  "raceName": "Boston Marathon",
  "raceType": "marathon",
  "raceDate": "2024-04-15",
  "goalTime": "3:30:00",
  "baseline5k": "22:30",
  "baselineWeeklyMileage": 30,
  "location": "Boston, MA"
}
```

**Response:**
```json
{
  "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "userId": "...",
  "raceName": "Boston Marathon",
  "raceType": "marathon",
  "raceDate": "2024-04-15T00:00:00.000Z",
  "goalTime": "3:30:00",
  "goalPace": "8:01",
  "baseline5k": "22:30",
  "distanceMiles": 26.2,
  "weeksAway": 16,
  "status": "planning"
}
```

### Get Active Race
```http
GET /api/race/active
Authorization: Bearer <token>
```

### Update Race Prediction
```http
PUT /api/race/:raceId/prediction
Content-Type: application/json
Authorization: Bearer <token>

{
  "adaptive5kTime": "21:45"
}
```

### Submit Race Result
```http
POST /api/race/:raceId/result
Content-Type: application/json
Authorization: Bearer <token>

{
  "finishTime": "3:28:15",
  "placement": 523,
  "ageGroupPlacement": 45,
  "notes": "Felt strong! Hit all my splits."
}
```

---

## 📅 Training Plan Endpoints

### Generate Training Plan
```http
POST /api/training-plan/generate/:raceId
Content-Type: application/json
Authorization: Bearer <token>

{
  "userAge": 32
}
```

**Response:**
```json
{
  "message": "Training plan generated successfully",
  "plan": {
    "_id": "...",
    "userId": "...",
    "raceId": "...",
    "totalWeeks": 16,
    "status": "draft",
    "weeks": [...]
  },
  "totalWeeks": 16,
  "totalDays": 112
}
```

### Activate Training Plan
```http
PUT /api/training-plan/:planId/activate
Authorization: Bearer <token>
```

### Get Training Plan for Race
```http
GET /api/training-plan/race/:raceId
Authorization: Bearer <token>
```

### Get Active Training Plan
```http
GET /api/training-plan/active
Authorization: Bearer <token>
```

---

## 📆 Training Day Endpoints

### Get Today's Workout
```http
GET /api/training-day/today
Authorization: Bearer <token>
```

**Response:**
```json
{
  "date": "2024-01-15T00:00:00.000Z",
  "status": "pending",
  "planned": {
    "type": "tempo",
    "mileage": 6,
    "paceRange": "7:30-7:45",
    "targetPace": "7:37",
    "hrZone": 3,
    "hrRange": "150-165",
    "label": "Tempo Run",
    "segments": [...]
  },
  "actual": {
    "completed": false
  },
  "analysis": {},
  "feedback": {}
}
```

### Get Workout by Date
```http
GET /api/training-day/date/2024-01-15
Authorization: Bearer <token>
```

### Get Week Workouts
```http
GET /api/training-day/week/0
Authorization: Bearer <token>
```

**Response:**
```json
[
  {
    "_id": "...",
    "date": "2024-01-15",
    "weekIndex": 0,
    "dayIndex": 0,
    "dayName": "Monday",
    "phase": "build",
    "planned": {...},
    "actual": {...}
  },
  ...
]
```

### Submit Workout Feedback
```http
POST /api/training-day/:trainingDayId/feedback
Content-Type: application/json
Authorization: Bearer <token>

{
  "mood": "😊",
  "effort": 7,
  "injuryFlag": false,
  "notes": "Felt great today!"
}
```

### Get Weekly Summary
```http
GET /api/training-day/week/0/summary
Authorization: Bearer <token>
```

**Response:**
```json
{
  "weekIndex": 0,
  "totalWorkouts": 7,
  "completedWorkouts": 5,
  "completionRate": 71,
  "totalPlannedMileage": 35,
  "totalActualMileage": 32,
  "avgHR": 148,
  "workouts": [...]
}
```

### Get Training Progress
```http
GET /api/training-day/progress
Authorization: Bearer <token>
```

**Response:**
```json
{
  "totalDays": 112,
  "completedDays": 45,
  "completionRate": 40,
  "totalMileage": 234.5
}
```

### Trigger Garmin Hydration
```http
POST /api/training-day/hydrate/2024-01-15
Authorization: Bearer <token>
```

---

## 🧪 Testing Flow

### 1. Create a Race
```bash
curl -X POST http://localhost:5000/api/race/create \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "raceName": "Test Marathon",
    "raceType": "marathon",
    "raceDate": "2024-06-01",
    "goalTime": "4:00:00",
    "baseline5k": "25:00",
    "baselineWeeklyMileage": 25
  }'
```

### 2. Generate Training Plan
```bash
# Use raceId from step 1
curl -X POST http://localhost:5000/api/training-plan/generate/{raceId} \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"userAge": 30}'
```

### 3. Activate Plan
```bash
# Use planId from step 2
curl -X PUT http://localhost:5000/api/training-plan/{planId}/activate \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Get Today's Workout
```bash
curl -X GET http://localhost:5000/api/training-day/today \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Submit Workout Feedback
```bash
# Use trainingDayId from step 4
curl -X POST http://localhost:5000/api/training-day/{trainingDayId}/feedback \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mood": "😊",
    "effort": 7,
    "notes": "Great workout!"
  }'
```

---

## 🔍 Common Issues & Solutions

### Issue: "User not found"
**Solution:** Ensure Firebase token is valid and user exists in database

### Issue: "No active race found"
**Solution:** Create a race first before generating a plan

### Issue: "No workout scheduled for today"
**Solution:** Ensure training plan is generated and activated

### Issue: "No Garmin data found"
**Solution:** Check that Garmin webhook fired or manually trigger sync

---

## 📊 Expected Data Flow

1. **User Signs Up** → Firebase creates account
2. **User Creates Race** → `POST /api/race/create`
3. **System Generates Plan** → `POST /api/training-plan/generate/:raceId`
4. **User Accepts Plan** → `PUT /api/training-plan/:planId/activate`
5. **Daily: User Checks Workout** → `GET /api/training-day/today`
6. **Post-Run: Garmin Syncs** → Webhook fires → TrainingDay hydrated
7. **User Submits Feedback** → `POST /api/training-day/:id/feedback`
8. **Weekly: System Updates Prediction** → `PUT /api/race/:raceId/prediction`
9. **Race Day: User Submits Result** → `POST /api/race/:raceId/result`

---

## 🧰 Postman Collection

Import this JSON into Postman:

```json
{
  "info": {
    "name": "GoFast V2 API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Race",
      "item": [
        {
          "name": "Create Race",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{firebaseToken}}"
              }
            ],
            "url": "{{baseUrl}}/api/race/create",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"raceName\": \"Test Marathon\",\n  \"raceType\": \"marathon\",\n  \"raceDate\": \"2024-06-01\",\n  \"goalTime\": \"4:00:00\",\n  \"baseline5k\": \"25:00\",\n  \"baselineWeeklyMileage\": 25\n}"
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:5000"
    },
    {
      "key": "firebaseToken",
      "value": "YOUR_FIREBASE_TOKEN_HERE"
    }
  ]
}
```

---

## ✅ Validation Checklist

- [ ] Race creation works
- [ ] Training plan generation works
- [ ] TrainingDays created correctly
- [ ] Today's workout returns data
- [ ] Garmin hydration works
- [ ] Feedback submission works
- [ ] Weekly summary calculates correctly
- [ ] Race prediction updates
- [ ] Race result submission works
- [ ] CompletionFlags update automatically

---

**Last Updated:** January 2024


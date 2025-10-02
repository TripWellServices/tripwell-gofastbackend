# 🔄 Migration Guide: GoFast V1 → V2

## ⚠️ Pre-Migration Checklist

### 1. **Backup Your Database**
```bash
# Create backup before migration
mongodump --uri="YOUR_MONGO_URI" --out=backups/pre-v2-migration

# Verify backup
ls -la backups/pre-v2-migration
```

### 2. **Environment Check**
```bash
# Verify .env file has MONGO_URI
cat .env | grep MONGO_URI

# Test MongoDB connection
node -e "require('dotenv').config(); console.log(process.env.MONGO_URI)"
```

### 3. **Dependencies**
```bash
# Install/update dependencies
npm install
```

---

## 🚀 Running the Migration

### Step 1: Review What Will Migrate
The migration script will:
- ✅ Migrate `TrainingBase + GoalProfile` → `Race` model
- ✅ Migrate old `TrainingPlan` → new structure with `TrainingDay` documents
- ✅ Migrate `GarminActivity` → `Session` model
- ✅ Create `CompletionFlags` for existing users

### Step 2: Run Migration (Dry Run)
```bash
# First, review the script
cat scripts/migrateToNormalizedModels.js

# Optional: Add --dry-run flag (you'd need to implement this)
# For now, just review the code
```

### Step 3: Execute Migration
```bash
node scripts/migrateToNormalizedModels.js
```

**Expected Output:**
```
🚀 Starting Migration to Normalized Models...

✅ MongoDB connected to GoFastFamily...

📦 Step 1: Migrating TrainingBase + GoalProfile to Race...
  ✅ Migrated race for user 65a1b2c3...
  ✅ Migrated race for user 65a1b2c4...
📊 Race Migration Complete: 12 migrated, 0 skipped

📦 Step 2: Migrating TrainingPlans to new structure...
  ✅ Migrated training plan for user 65a1b2c3...
  📍 Migrated 50 sessions...
📊 TrainingPlan Migration Complete: 8 migrated, 2 skipped

📦 Step 3: Migrating GarminActivity to Session...
  📍 Migrated 50 sessions...
  📍 Migrated 100 sessions...
📊 Session Migration Complete: 245 migrated, 0 skipped

📦 Step 4: Creating CompletionFlags for existing users...
📊 CompletionFlags Creation Complete: 15 created

✅ Migration Complete!
```

### Step 4: Verify Migration
```bash
# Connect to MongoDB and verify
mongosh "YOUR_MONGO_URI"

# Check collections exist
use GoFastFamily
show collections

# Should see:
# - races
# - trainingdays
# - sessions
# - completionflags

# Check sample data
db.races.findOne()
db.trainingdays.findOne()
db.sessions.findOne()
db.completionflags.findOne()
```

---

## 🧪 Post-Migration Testing

### 1. **API Health Check**
```bash
# Start server
npm start

# Test root endpoint
curl http://localhost:5000/
```

### 2. **Test New Endpoints**
```bash
# Get Firebase token (from frontend or Firebase console)
export TOKEN="your_firebase_token_here"

# Test get active race
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/race/active

# Test today's workout
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/training-day/today

# Test active plan
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/training-plan/active
```

### 3. **Verify Data Integrity**
```bash
# Run verification script (create this if needed)
node scripts/verifyMigration.js
```

---

## 🔧 Troubleshooting

### Issue: "Cannot connect to MongoDB"
**Solution:**
```bash
# Check .env file
cat .env | grep MONGO_URI

# Test connection
mongosh "YOUR_MONGO_URI"

# Verify network access (if using MongoDB Atlas)
# Add your IP to whitelist
```

### Issue: "Duplicate key error"
**Solution:**
```bash
# Migration is idempotent - already migrated data is skipped
# If you see this, it means some data already exists (safe to ignore)

# To re-run fresh:
# 1. Restore from backup
# 2. Run migration again
```

### Issue: "No race found for user"
**Solution:**
```bash
# Some users might not have TrainingBase records
# This is expected - they'll be skipped in migration
# They can create new races using the new API
```

### Issue: "TrainingDays not created"
**Solution:**
```bash
# Check if old TrainingPlan had weeks array
# If weeks array is empty, no TrainingDays will be created
# User can generate new plan using new API
```

---

## 🔄 Rollback Procedure

### If Something Goes Wrong:

#### Option 1: Restore from Backup
```bash
# Drop current database
mongosh "YOUR_MONGO_URI" --eval "db.dropDatabase()"

# Restore from backup
mongorestore --uri="YOUR_MONGO_URI" backups/pre-v2-migration
```

#### Option 2: Manual Cleanup (if partial migration)
```bash
# Remove new collections
mongosh "YOUR_MONGO_URI" --eval "
  use GoFastFamily;
  db.races.drop();
  db.trainingdays.drop();
  db.sessions.drop();
  db.completionflags.drop();
"

# Old collections remain intact
```

---

## 📊 Migration Statistics

### Expected Data Growth:
- **Races:** ~1 per user with TrainingBase
- **TrainingDays:** ~112 per active training plan (16 weeks × 7 days)
- **Sessions:** Same count as GarminActivity
- **CompletionFlags:** 1 per user

### Example for 100 Users:
- Users: 100
- Races: ~50 (50% have set race goals)
- TrainingPlans: ~30 (30% have active plans)
- TrainingDays: ~3,360 (30 plans × 112 days)
- Sessions: ~500 (avg 5 Garmin activities per user)
- CompletionFlags: 100

**Total New Documents:** ~4,010

---

## ✅ Migration Success Checklist

After migration, verify:

- [ ] All TrainingBase converted to Race
- [ ] All GoalProfile data merged into Race
- [ ] Old TrainingPlans converted to new structure
- [ ] TrainingDay documents created for each day
- [ ] GarminActivity data copied to Session
- [ ] CompletionFlags created for all users
- [ ] No duplicate documents
- [ ] All relationships (ObjectIds) valid
- [ ] API endpoints return data
- [ ] No console errors when server starts

---

## 🚀 Deployment Steps

### Staging Environment:
1. ✅ Backup staging database
2. ✅ Run migration on staging
3. ✅ Test all API endpoints
4. ✅ Verify data integrity
5. ✅ Run smoke tests
6. ✅ Get team approval

### Production Environment:
1. ✅ Schedule maintenance window
2. ✅ Notify users (if applicable)
3. ✅ Backup production database
4. ✅ Run migration on production
5. ✅ Test critical paths
6. ✅ Monitor error logs
7. ✅ Update frontend to use new endpoints
8. ✅ Monitor for 24-48 hours

---

## 📞 Support

### Need Help?
1. Check migration logs: `migration.log`
2. Review docs: `docs/NORMALIZED_ARCHITECTURE.md`
3. Test endpoints: `docs/API_TESTING.md`
4. Check this guide's Troubleshooting section

### Report Issues:
Include:
- Migration log output
- MongoDB version
- Node.js version
- Error messages
- Steps to reproduce

---

## 🎯 Timeline

### Recommended Schedule:
- **Day 1:** Review migration script, backup database
- **Day 2:** Run on staging, test thoroughly
- **Day 3:** Fix any issues, re-test
- **Day 4:** Run on production during low-traffic window
- **Day 5+:** Monitor and optimize

---

## 🏆 Final Notes

- Migration is **idempotent** - safe to run multiple times
- Old collections are **preserved** - no data deleted
- New collections have **optimized indexes** - faster queries
- Backend is **backward compatible** - old endpoints still work during transition

**🚀 You're ready to migrate! Good luck!**

---

**Last Updated:** January 2024  
**Migration Version:** 2.0.0  
**Status:** Production Ready


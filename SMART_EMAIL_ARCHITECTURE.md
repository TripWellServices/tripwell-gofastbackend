# Smart Email Architecture - Python Intelligence

## 🧠 **THE BIG PICTURE**

Python service becomes an **intelligent email brain** that:
1. **Scrapes user data daily** from MongoDB
2. **Analyzes user journey stages** 
3. **Sends contextual emails** based on conditions
4. **Tracks email engagement** and optimizes campaigns

## 📧 **SMART EMAIL CAMPAIGNS**

### **Email Types Based on User Journey**

#### **1. Welcome Email**
- **Trigger**: New user with `funnelStage: "none"`
- **Condition**: `welcomeEmailSent: false`
- **Template**: `welcome.html`
- **Message**: "Welcome to TripWell! Let's plan your first trip"

#### **2. Congrats Trip Setup**
- **Trigger**: User created their first trip
- **Condition**: `tripId` exists + `tripSetupEmailSent: false`
- **Template**: `trip_setup.html`
- **Message**: "Congrats! Your trip is set up. Ready to plan?"

#### **3. Congrats Itinerary Setup**
- **Trigger**: User completed itinerary planning
- **Condition**: `TripDay` records exist + `itinerarySetupEmailSent: false`
- **Template**: `itinerary_setup.html`
- **Message**: "Amazing! Your itinerary is ready. Time to travel!"

#### **4. Trip Upcoming**
- **Trigger**: Trip starts in 3 days
- **Condition**: `startDate` is 3 days away + `tripUpcomingEmailSent: false`
- **Template**: `trip_upcoming.html`
- **Message**: "Your trip to [City] starts in 3 days! Get ready!"

#### **5. Trip - How's It Going?**
- **Trigger**: Trip is in progress (day 2-3)
- **Condition**: `tripStarted: true` + `currentDayIndex: 2-3` + `tripCheckinEmailSent: false`
- **Template**: `trip_checkin.html`
- **Message**: "How's your trip going? Need any recommendations?"

#### **6. Trip Complete - Way to Go!**
- **Trigger**: Trip completed
- **Condition**: `tripComplete: true` + `tripCompleteEmailSent: false`
- **Template**: `trip_complete.html`
- **Message**: "Way to go! How was your trip? Share your experience!"

#### **7. Inactive User - Do Another Trip?**
- **Trigger**: User completed trip but inactive for 30+ days
- **Condition**: `tripComplete: true` + `lastActiveAt` > 30 days + `reEngagementEmailSent: false`
- **Template**: `re_engagement.html`
- **Message**: "Hey! Ready for another adventure? Let's plan your next trip!"

## 🏗️ **SMART PYTHON ARCHITECTURE**

### **Daily Cron Job Flow**
```python
# smart_email_service.py
class SmartEmailService:
    def __init__(self):
        self.mongo_client = MongoClient(MONGO_URI)
        self.db = self.mongo_client.tripwell
        self.email_service = EmailService()
    
    def daily_email_scan(self):
        """Run daily to analyze all users and send appropriate emails"""
        print("🧠 Starting daily smart email scan...")
        
        # Get all users
        users = self.db.tripwellusers.find({})
        
        for user in users:
            self.analyze_user_and_send_email(user)
    
    def analyze_user_and_send_email(self, user):
        """Analyze user data and send appropriate email"""
        user_id = user['_id']
        email = user['email']
        funnel_stage = user.get('funnelStage', 'none')
        
        # Skip demo users
        if funnel_stage in ['spots_demo', 'itinerary_demo', 'updates_only']:
            return
        
        # Check email conditions
        if self.should_send_welcome_email(user):
            self.send_welcome_email(user)
        elif self.should_send_trip_setup_email(user):
            self.send_trip_setup_email(user)
        elif self.should_send_itinerary_setup_email(user):
            self.send_itinerary_setup_email(user)
        elif self.should_send_trip_upcoming_email(user):
            self.send_trip_upcoming_email(user)
        elif self.should_send_trip_checkin_email(user):
            self.send_trip_checkin_email(user)
        elif self.should_send_trip_complete_email(user):
            self.send_trip_complete_email(user)
        elif self.should_send_re_engagement_email(user):
            self.send_re_engagement_email(user)
    
    def should_send_welcome_email(self, user):
        """Check if user should get welcome email"""
        return (
            user.get('funnelStage') == 'none' and
            not user.get('welcomeEmailSent', False)
        )
    
    def should_send_trip_setup_email(self, user):
        """Check if user should get trip setup email"""
        return (
            user.get('tripId') and
            not user.get('tripSetupEmailSent', False)
        )
    
    def should_send_itinerary_setup_email(self, user):
        """Check if user should get itinerary setup email"""
        if not user.get('tripId'):
            return False
        
        # Check if user has TripDay records
        trip_days = self.db.tripdays.find({'tripId': user['tripId']})
        has_itinerary = trip_days.count() > 0
        
        return (
            has_itinerary and
            not user.get('itinerarySetupEmailSent', False)
        )
    
    def should_send_trip_upcoming_email(self, user):
        """Check if user should get trip upcoming email"""
        if not user.get('tripId'):
            return False
        
        # Get trip data
        trip = self.db.tripbases.find_one({'_id': user['tripId']})
        if not trip:
            return False
        
        # Check if trip starts in 3 days
        start_date = trip['startDate']
        days_until_trip = (start_date - datetime.now()).days
        
        return (
            days_until_trip == 3 and
            not user.get('tripUpcomingEmailSent', False)
        )
    
    def should_send_trip_checkin_email(self, user):
        """Check if user should get trip checkin email"""
        if not user.get('tripId'):
            return False
        
        # Get trip data
        trip = self.db.tripbases.find_one({'_id': user['tripId']})
        if not trip:
            return False
        
        # Check if trip is in progress (day 2-3)
        start_date = trip['startDate']
        current_day = (datetime.now() - start_date).days + 1
        
        return (
            2 <= current_day <= 3 and
            not user.get('tripCheckinEmailSent', False)
        )
    
    def should_send_trip_complete_email(self, user):
        """Check if user should get trip complete email"""
        if not user.get('tripId'):
            return False
        
        # Get trip data
        trip = self.db.tripbases.find_one({'_id': user['tripId']})
        if not trip:
            return False
        
        # Check if trip is completed
        end_date = trip['endDate']
        trip_completed = datetime.now() > end_date
        
        return (
            trip_completed and
            not user.get('tripCompleteEmailSent', False)
        )
    
    def should_send_re_engagement_email(self, user):
        """Check if user should get re-engagement email"""
        if not user.get('tripId'):
            return False
        
        # Check if user completed trip but is inactive
        trip = self.db.tripbases.find_one({'_id': user['tripId']})
        if not trip:
            return False
        
        end_date = trip['endDate']
        last_active = user.get('updatedAt', user.get('createdAt'))
        days_since_trip = (datetime.now() - end_date).days
        days_since_active = (datetime.now() - last_active).days
        
        return (
            days_since_trip >= 30 and
            days_since_active >= 30 and
            not user.get('reEngagementEmailSent', False)
        )
```

## 📊 **ENHANCED USER MODEL**

### **Add Email Tracking Fields**
```javascript
// Add to TripWellUser model
{
  // === EMAIL ENGAGEMENT FLAGS ===
  welcomeEmailSent: Boolean,        // Has welcome email been sent?
  welcomeEmailSentAt: Date,         // When was welcome email sent?
  tripSetupEmailSent: Boolean,      // Has trip setup email been sent?
  tripSetupEmailSentAt: Date,       // When was trip setup email sent?
  itinerarySetupEmailSent: Boolean, // Has itinerary setup email been sent?
  itinerarySetupEmailSentAt: Date,  // When was itinerary setup email sent?
  tripUpcomingEmailSent: Boolean,   // Has trip upcoming email been sent?
  tripUpcomingEmailSentAt: Date,    // When was trip upcoming email sent?
  tripCheckinEmailSent: Boolean,    // Has trip checkin email been sent?
  tripCheckinEmailSentAt: Date,     // When was trip checkin email sent?
  tripCompleteEmailSent: Boolean,   // Has trip complete email been sent?
  tripCompleteEmailSentAt: Date,    // When was trip complete email sent?
  reEngagementEmailSent: Boolean,   // Has re-engagement email been sent?
  reEngagementEmailSentAt: Date,    // When was re-engagement email sent?
  
  // === EMAIL ANALYTICS ===
  lastEmailSent: Date,              // Last email sent to user
  emailOpenCount: Number,           // Email open tracking
  emailClickCount: Number,          // Email click tracking
  emailBounceCount: Number,         // Email bounce tracking
  emailOptIn: Boolean,              // Has user opted into emails?
}
```

## 🚀 **DEPLOYMENT ARCHITECTURE**

### **Python Service Structure**
```
tripwell-ai/
├── main.py                    # FastAPI app
├── smart_email_service.py     # Intelligent email brain
├── email_service.py           # Microsoft Graph integration
├── templates/
│   ├── welcome.html
│   ├── trip_setup.html
│   ├── itinerary_setup.html
│   ├── trip_upcoming.html
│   ├── trip_checkin.html
│   ├── trip_complete.html
│   └── re_engagement.html
├── requirements.txt
└── cron_job.py               # Daily email scan
```

### **Cron Job Setup**
```python
# cron_job.py
import schedule
import time
from smart_email_service import SmartEmailService

def run_daily_email_scan():
    service = SmartEmailService()
    service.daily_email_scan()

# Schedule daily at 9 AM
schedule.every().day.at("09:00").do(run_daily_email_scan)

while True:
    schedule.run_pending()
    time.sleep(60)
```

## 🎯 **THE GENIUS OF THIS APPROACH**

1. **Contextual Intelligence**: Python analyzes user data and sends relevant emails
2. **Journey-Based**: Emails match user's actual progress through the app
3. **Automated**: No manual intervention needed
4. **Scalable**: Handles thousands of users automatically
5. **Engaging**: Users get emails that make sense for their current state
6. **Re-engagement**: Automatically brings back inactive users

## 🧠 **SMART EMAIL BRAIN**

The Python service becomes a **smart email brain** that:
- **Understands** user journey stages
- **Remembers** what emails have been sent
- **Decides** when to send the next email
- **Tracks** engagement and optimizes campaigns
- **Re-engages** inactive users automatically

This is **WAY** smarter than just sending welcome emails! 🚀

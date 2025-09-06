# TripWell Email Service Architecture

## 🏗️ System Overview

The TripWell email service integrates a Python FastAPI microservice with the Node.js backend to send automated welcome emails to new users.

## 📧 Email Service Components

### 1. Python FastAPI Microservice (`tripwell-ai/`)
- **Location**: `tripwell-ai/main.py`, `tripwell-ai/email_service.py`
- **Purpose**: Handles Microsoft Graph API integration for sending emails
- **Endpoint**: `POST /emails/welcome`
- **Template**: `templates/welcome.html`

### 2. Node.js Backend Integration (`gofastbackend/`)
- **Route**: `POST /tripwell/email/welcome`
- **Service**: `routes/TripWell/emailServiceRoute.js`
- **Integration**: Calls Python microservice via HTTP

## 🔄 User Flow & Funnel Stages

### Funnel Stage System
The system uses the existing `funnelStage` field to track user engagement:

- **"none"** - Brand new user (triggers welcome email)
- **"itinerary_demo"** - User tried itinerary demo
- **"spots_demo"** - User tried best things demo
- **"updates_only"** - User wants updates only
- **"full_app"** - User is using full app

### Email Trigger Logic
Welcome emails are sent when:
1. **New user created** with `funnelStage: "none"` (default)
2. **NOT sent** for demo funnel users (`itinerary_demo`, `spots_demo`)
3. **Automatic** during user creation in `POST /tripwell/user/createOrFind`

## 🛠️ Implementation Details

### User Creation Flow
```javascript
// In TripWellUserRoute.js
if (!user) {
  // Create new user
  user = new TripWellUser({
    firebaseId,
    email,
    funnelStage: funnelStage || "none"  // Default to "none"
  });
  
  // Send welcome email for brand new users only
  if (isNewUser && (!funnelStage || funnelStage === "none")) {
    // Call Python email service
    await axios.post(`${EMAIL_SERVICE_URL}/emails/welcome`, {
      email: email,
      name: email.split('@')[0]
    });
  }
}
```

### Environment Variables
```bash
# Python Email Service
MICROSOFT_CLIENT_ID=your_client_id
MICROSOFT_TENANT_ID=your_tenant_id
MICROSOFT_CLIENT_SECRET=your_client_secret
TRIPWELL_EMAIL_SENDER=adam@tripwell.net

# Node.js Backend
EMAIL_SERVICE_URL=http://localhost:8000  # or deployed URL
```

## 📋 API Endpoints

### Node.js Backend Routes
- `POST /tripwell/user/createOrFind` - Creates user and triggers welcome email
- `POST /tripwell/email/welcome` - Manual welcome email sending
- `GET /tripwell/email/health` - Email service health check
- `PUT /tripwell/user/completeOnboarding` - Upgrade user from "none" to "full_app"

### Python Microservice Routes
- `POST /emails/welcome` - Send welcome email via Microsoft Graph
- `GET /health` - Service health check
- `GET /` - Service info

## 🎯 User Journey Examples

### Example 1: Brand New User
1. User signs up via Firebase → `POST /tripwell/user/createOrFind`
2. User created with `funnelStage: "none"`
3. Welcome email sent automatically
4. User completes profile → `funnelStage: "none" → "full_app"`

### Example 2: Demo User
1. User tries demo → `POST /tripwell/demo/bestthings`
2. User created with `funnelStage: "spots_demo"`
3. **NO welcome email sent** (demo users get different flow)
4. User can upgrade to full app later

### Example 3: Existing User
1. User signs in again → `POST /tripwell/user/createOrFind`
2. Existing user found → **NO email sent**
3. User continues with existing funnel stage

## 🔧 Deployment Architecture

### Development
```bash
# Start Python email service
cd tripwell-ai
python main.py  # Runs on http://localhost:8000

# Start Node.js backend
cd gofastbackend
npm start  # Runs on http://localhost:5000
```

### Production
- **Python Service**: Deploy to Render/Docker with environment variables
- **Node.js Backend**: Update `EMAIL_SERVICE_URL` to production Python service URL
- **Microsoft Graph**: Configure app registration with Mail.Send permissions

## 🧪 Testing

### Test User Creation
```bash
curl -X POST http://localhost:5000/tripwell/user/createOrFind \
  -H "Content-Type: application/json" \
  -d '{"firebaseId":"test123","email":"test@example.com"}'
```

### Test Email Service Directly
```bash
curl -X POST http://localhost:8000/emails/welcome \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test"}'
```

### Test Email Service via Backend
```bash
curl -X POST http://localhost:5000/tripwell/email/welcome \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test"}'
```

## 🚨 Error Handling

### Email Service Failures
- User creation **continues** even if email fails
- Errors logged but don't block user flow
- Health check endpoint for monitoring

### Common Issues
- **Connection refused**: Python service not running
- **Timeout**: Email service taking too long
- **Microsoft Graph errors**: Check credentials and permissions

## 📊 Monitoring

### Logs to Watch
- `✅ Created new user: email with funnelStage: none`
- `📧 Sending welcome email to new user: email`
- `✅ Welcome email sent successfully to email`
- `❌ Failed to send welcome email to email: error`

### Health Checks
- `GET /tripwell/email/health` - Check email service status
- Monitor Microsoft Graph API quotas and limits

## 📊 **Admin Dashboard Integration**

### **UserJourney Sorting/Filtering Capabilities**
- **Current Filtering**: Shows only full app users (`full_app`, `none` funnel stages)
- **User Status Categories**:
  1. **Active User** - Has trip (`user.tripId` exists)
  2. **New User** - Account <15 days old + has profile
  3. **Incomplete Profile** - Account <15 days old + no profile  
  4. **Abandoned Account** - Account >15 days old + no profile
  5. **Inactive User** - Account >15 days old + has profile but no trip
- **Display**: User list with status badges, journey funnel (4 stages), status breakdown
- **No sorting dropdowns** - just displays all full app users

### **Email Strategy vs User Status**
**User Status Categories** are for tracking **"are they using the app or not"**:
- Active User, New User, Incomplete Profile, Abandoned Account, Inactive User

**Email Strategy** needs **CRM/engagement flags** for **"how do we engage them"**:
- Welcome emails, follow-up emails, re-engagement emails, etc.

### **Proposed Email-Specific Flags**
```javascript
// Add to TripWellUser model for email engagement
{
  // === EMAIL ENGAGEMENT FLAGS ===
  welcomeEmailSent: Boolean,        // Has welcome email been sent?
  welcomeEmailSentAt: Date,         // When was welcome email sent?
  lastEmailSent: Date,              // Last email sent to user
  emailEngagementStage: String,     // "new", "engaged", "dormant", "unsubscribed"
  emailOptIn: Boolean,              // Has user opted into emails?
  emailBounceCount: Number,         // Email bounce tracking
  emailOpenCount: Number,           // Email open tracking
  emailClickCount: Number,          // Email click tracking
  
  // === EMAIL CAMPAIGN FLAGS ===
  profileReminderSent: Boolean,     // Profile completion reminder sent?
  tripReminderSent: Boolean,        // Trip creation reminder sent?
  reEngagementSent: Boolean,        // Re-engagement email sent?
}
```

### **Email Engagement Stages**
- **"new"** - Brand new user, send welcome email
- **"engaged"** - Active user, send relevant updates
- **"dormant"** - Inactive user, send re-engagement
- **"unsubscribed"** - User opted out, no emails

## 🔄 Future Enhancements

### Potential Improvements
1. **Email Templates**: Add more email types (trip reminders, etc.)
2. **Queue System**: Use Redis/RabbitMQ for reliable email delivery
3. **Analytics**: Track email open rates and engagement
4. **A/B Testing**: Test different welcome email templates
5. **Retry Logic**: Automatic retry for failed emails

### Integration Points
- **Profile Completion**: Send follow-up emails after profile setup
- **Trip Creation**: Send trip confirmation emails
- **Demo Conversion**: Send conversion emails to demo users
- **Admin Notifications**: Email admins about new user signups

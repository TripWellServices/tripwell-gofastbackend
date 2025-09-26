# Marketing System Documentation

## 🎯 **Purpose**
Track marketing emails sent to users at key moments in their journey.

## 📧 **Email Triggers**
- **Profile Complete** - User finishes profile setup
- **Trip Setup** - User creates their first trip

## 🗄️ **MarketingData Model**
```javascript
{
  userId: ObjectId,           // Reference to TripWellUser._id
  email: String,              // User's email address
  trigger: String,            // "profile_complete" or "trip_setup"
  sent: Boolean,              // Success flag - was email sent?
  sentAt: Date,               // When email was sent
  campaign: String,           // Marketing campaign name
  status: String              // "sent", "failed", "bounced"
}
```

## 🔄 **Flow**
1. **User completes action** (profile/trip setup)
2. **Create MarketingData record** with `sent: false`
3. **Python service sends email** (background)
4. **Update MarketingData** with `sent: true` and `sentAt`

## 🧹 **Clean User Model**
- ❌ **Remove** `lastMarketingEmail` from TripWellUser
- ❌ **Remove** `personaScore` from TripWellUser  
- ❌ **Remove** `planningFlex` from TripWellUser
- ✅ **Keep** only user data in TripWellUser

## 🚀 **Benefits**
- **Clean separation** - Marketing data separate from user data
- **Better performance** - Don't load marketing data when not needed
- **Easier management** - Marketing team can work independently
- **Scalable** - Can add more marketing triggers easily

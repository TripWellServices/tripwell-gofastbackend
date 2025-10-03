# 📧 Email Setup for GoFast

## Gmail SMTP Setup (MVP Approach)

### 1. Create Gmail App Password

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Security → 2-Step Verification (enable if not already)
3. Security → App passwords
4. Generate app password for "Mail"
5. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### 2. Set Environment Variables in Render

Add these to your Render environment variables:

```bash
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=abcdefghijklmnop
```

### 3. Email Templates

The system sends 3 types of emails:

1. **Welcome Email** - After signup
2. **Generation Started** - When GPT starts creating plan
3. **Plan Ready** - When training plan is complete

### 4. Testing

To test email functionality:

```bash
# Test in your local environment
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-app-password
```

### 5. Future: HubSpot Integration

For production scale, consider:
- HubSpot API integration
- Email templates in HubSpot
- Automated workflows
- Analytics and tracking

## Current Email Flow

```
User Signs Up → Welcome Email
     ↓
User Creates Race Intent → "Generation Started" Email
     ↓
GPT Creates Plan → "Plan Ready" Email
     ↓
User Gets Training Plan Link
```

## Email Content

All emails include:
- GoFast branding (orange/red gradient)
- Personalized with user's "goesBy" name
- Clear call-to-action buttons
- Mobile-friendly HTML design
- Links back to the app

## Troubleshooting

**Common Issues:**
- App password not working → Check 2FA is enabled
- Emails going to spam → Add SPF/DKIM records (future)
- SMTP timeout → Check Render environment variables

**Logs:**
- Check Render logs for email send status
- Email failures don't break the main flow
- All email operations are wrapped in try/catch

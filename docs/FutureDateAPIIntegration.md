# Future Date/Time API Integration

## Overview
For production, we need proper date/time APIs instead of relying on server system clocks. This will enable accurate timezone handling and user-specific date calculations.

## Current MVP Limitation
- **Server Clock Only**: `datetime.now()` uses Render server time
- **No Timezone Support**: Can't handle user's local timezone
- **No City-Specific Times**: Can't calculate "local time" for destinations

## Future API Integration

### 1. Date/Time APIs
- **WorldTimeAPI** (free): `http://worldtimeapi.org/api/timezone/{area}/{location}`
- **TimeZoneDB** (paid): More reliable, higher limits
- **Google Time Zone API** (paid): Most accurate
- **DateAPI.com** (paid): Simple date calculations

### 2. Python Integration
```python
# Example with WorldTimeAPI
import requests

def get_city_time(city, country):
    """Get current time for a specific city"""
    try:
        # Map city to timezone
        timezone = get_timezone_for_city(city, country)
        
        # Call WorldTimeAPI
        response = requests.get(f"http://worldtimeapi.org/api/timezone/{timezone}")
        data = response.json()
        
        return {
            "datetime": data["datetime"],
            "timezone": data["timezone"],
            "utc_offset": data["utc_offset"]
        }
    except Exception as e:
        logger.error(f"Error getting city time: {e}")
        return None

def calculate_trip_timing(user_city, destination_city, trip_dates):
    """Calculate trip timing based on user and destination cities"""
    user_time = get_city_time(user_city["city"], user_city["country"])
    dest_time = get_city_time(destination_city["city"], destination_city["country"])
    
    # Calculate time differences
    # Determine best times to send emails
    # Account for timezone differences
```

### 3. Enhanced Engagement Logic
```python
def get_engagement_level_with_timezone(user_data, trip_data):
    """Get engagement level considering user's timezone"""
    user_city = user_data.get("hometownCity")
    destination = trip_data.get("city")
    
    # Get current time in user's city
    user_time = get_city_time(user_city)
    dest_time = get_city_time(destination)
    
    # Calculate trip timing relative to user's local time
    days_until = calculate_days_until_trip(user_time, trip_data["startDate"])
    
    # Send emails at appropriate local times
    if days_until == 1 and is_good_time_to_email(user_time):
        return "bon_voyage"
    elif 2 <= days_until <= 7:
        return "getting_ready"
    # etc.
```

### 4. City-to-Timezone Mapping
```python
# City to timezone mapping service
CITY_TIMEZONES = {
    "New York": "America/New_York",
    "Los Angeles": "America/Los_Angeles", 
    "London": "Europe/London",
    "Paris": "Europe/Paris",
    "Tokyo": "Asia/Tokyo",
    "Sydney": "Australia/Sydney",
    # ... comprehensive mapping
}

def get_timezone_for_city(city, country=None):
    """Get timezone for a city"""
    # Try exact match first
    if city in CITY_TIMEZONES:
        return CITY_TIMEZONES[city]
    
    # Fallback to geocoding API
    return geocode_city_to_timezone(city, country)
```

### 5. Smart Email Timing
```python
def is_good_time_to_email(user_timezone, user_city):
    """Check if it's a good time to send email to user"""
    current_time = get_city_time(user_city)
    hour = current_time.hour
    
    # Don't send emails between 10 PM and 8 AM local time
    if 22 <= hour or hour <= 8:
        return False
    
    # Don't send on weekends (optional)
    if current_time.weekday() >= 5:  # Saturday = 5, Sunday = 6
        return False
    
    return True
```

## Implementation Priority
1. **Phase 1**: Add WorldTimeAPI integration
2. **Phase 2**: City-to-timezone mapping
3. **Phase 3**: Smart email timing
4. **Phase 4**: User timezone preferences
5. **Phase 5**: Advanced scheduling features

## Benefits
- **Accurate Timing**: Emails sent at appropriate local times
- **Timezone Awareness**: Proper handling of international users
- **Better UX**: Users get notifications when they're awake
- **Professional**: No more 3 AM emails to users in different timezones

## Current Workaround
For MVP, we use server time and assume users are in similar timezones. This works for initial testing but needs proper API integration for production.

## Notes
- WorldTimeAPI is free but has rate limits
- Consider caching timezone data to reduce API calls
- May need fallback to server time if API is down
- Consider user timezone preferences in profile

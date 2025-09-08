# Participant Features to Add

## Overview
Currently the system focuses on originators (trip creators). We need to add participant functionality for users who join trips via join codes.

## Current State
- **Originator Logic**: `tripStartedByOriginator: true` → `trip_active`
- **Participant Logic**: `tripStartedByParticipant: true` → Not yet implemented

## Features to Add

### 1. Participant Admin Dashboard
- **New Admin Page**: `/participant-tracker`
- **Purpose**: Track participants who join trips via join codes
- **Features**:
  - List all participants across all trips
  - Filter by trip, engagement level, journey stage
  - View participant journey progression
  - Send targeted emails to participants

### 2. Participant Journey Stages
- **New Journey Stages**:
  - `participant_joined` - Joined trip via join code
  - `participant_active` - Participant is actively using the trip
  - `participant_complete` - Participant completed their part of the trip

### 3. Participant Engagement Levels
- **New Engagement Levels**:
  - `participant_onboarding` - New participant, send welcome
  - `participant_encouraging` - Encourage trip participation
  - `participant_active` - Participant is active in trip
  - `participant_followup` - Follow up after trip completion

### 4. Participant Email Templates
- **New Templates**:
  - `participant_welcome.html` - Welcome new participant
  - `participant_encouraging.html` - Encourage participation
  - `participant_active.html` - Check in during trip
  - `participant_followup.html` - Follow up after trip

### 5. Python Service Updates
- **Update `user_interpretive_service.py`**:
  - Add participant journey stage logic
  - Add participant engagement level logic
  - Handle `tripStartedByParticipant` flag

### 6. Database Schema Updates
- **TripWellUser Model**:
  - Add `participantRole` field
  - Add `joinedTripAt` timestamp
  - Add `participantEngagementLevel` field

### 7. Admin Dashboard Updates
- **Add Participant Section**:
  - Participant user table
  - Participant journey tracking
  - Participant engagement metrics
  - Participant email campaign management

## Implementation Priority
1. **Phase 1**: Update Python service to handle participant flags
2. **Phase 2**: Create participant admin dashboard
3. **Phase 3**: Add participant email templates
4. **Phase 4**: Add participant engagement tracking

## Current Workaround
For now, participants are treated as regular users with `tripStartedByParticipant: true` flag, but they don't get specialized journey stages or engagement levels.

## Notes
- Participants join trips via join codes
- Participants have different engagement patterns than originators
- Participants may need different email campaigns and touchpoints
- Consider participant-specific analytics and reporting

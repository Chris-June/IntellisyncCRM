# Follow-up Reminder MCP Service

## Overview
The Follow-up Reminder Service manages intelligent follow-up scheduling and automation for sales and client engagement. It uses AI to determine optimal timing and content for follow-ups based on client interaction history, deal status, and engagement patterns.

## Core Responsibilities
- Scheduling automated follow-ups
- Determining optimal contact timing
- Generating follow-up content suggestions
- Managing reminder priorities
- Tracking engagement responses
- Coordinating team follow-ups

## API Endpoints

### Get User Reminders
```http
GET /reminders/{user_id}
```
Retrieves all pending reminders for a user.

**Response:**
```json
{
  "reminders": [
    {
      "id": "string",
      "type": "follow_up" | "check_in" | "milestone" | "urgent",
      "priority": "high" | "medium" | "low",
      "due_date": "datetime",
      "context": {
        "client_id": "string",
        "lead_id": "string",
        "last_interaction": "datetime",
        "suggested_actions": string[]
      }
    }
  ],
  "metadata": {
    "total_count": number,
    "urgent_count": number,
    "overdue_count": number
  }
}
```

### Snooze Reminder
```http
POST /reminders/snooze
```
Delays a reminder for a specified duration.

**Request Body:**
```json
{
  "reminder_id": "string",
  "duration": "string",
  "reason": "string"
}
```

### Create Follow-up
```http
POST /reminders
```
Creates a new follow-up reminder.

### Complete Reminder
```http
POST /reminders/{id}/complete
```
Marks a reminder as completed with outcome.

## Data Models

### Reminder
```typescript
{
  id: string;
  user_id: string;
  client_id: string;
  type: "follow_up" | "check_in" | "milestone" | "urgent";
  priority: "high" | "medium" | "low";
  due_date: DateTime;
  completed_at?: DateTime;
  snoozed_until?: DateTime;
  context: {
    lead_id?: string;
    project_id?: string;
    last_interaction: DateTime;
    suggested_actions: string[];
  };
  created_at: DateTime;
  updated_at: DateTime;
}
```

### ReminderOutcome
```typescript
{
  reminder_id: string;
  status: "completed" | "snoozed" | "cancelled";
  outcome: string;
  next_steps?: string[];
  completed_at: DateTime;
}
```

## Scheduling Logic

### 1. Timing Factors
- Client engagement history
- Deal stage requirements
- Industry best practices
- Time zone considerations
- Team availability

### 2. Priority Determination
- Deal value assessment
- Risk level integration
- Response urgency
- Relationship status
- Historical engagement

### 3. Content Suggestions
- Previous interaction context
- Deal stage requirements
- Client preferences
- Success patterns
- Team feedback

## Integration Points
- Receives triggers from Deal Risk Detector
- Coordinates with Calendar Server
- Updates Sales Funnel status
- Feeds data to Memory Manager
- Syncs with Project Management

## Notification System
- Email notifications
- In-app alerts
- Mobile push notifications
- Team coordination
- Escalation rules

## Performance Optimization
- Batch notification processing
- Smart scheduling algorithms
- Reminder deduplication
- Priority queue management
- Cache utilization

## Analytics & Reporting
- Follow-up effectiveness
- Response rates
- Team performance
- Engagement patterns
- Optimization opportunities
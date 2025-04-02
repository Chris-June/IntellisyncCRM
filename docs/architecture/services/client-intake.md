# Client Intake MCP Service

## Overview
The Client Intake Service manages the initial client onboarding process, collecting and analyzing client information through structured forms and conversational interfaces.

## Core Responsibilities
- Managing intake session lifecycle
- Storing and validating client responses
- Generating intake summaries
- Triggering opportunity analysis

## API Endpoints

### Start Intake Session
```http
POST /intake/start
```
Initiates a new client intake session.

**Request Body:**
```json
{
  "client_id": "string",
  "responses": {
    "field_name": "value"
  }
}
```

### Update Intake Session
```http
POST /intake/update/{session_id}
```
Updates an existing intake session with new responses.

### Get Intake Summary
```http
GET /intake/{client_id}
```
Retrieves the compiled intake summary for a client.

## Data Models

### IntakeSession
```typescript
{
  client_id: string;
  responses: Record<string, any>;
  status: "in_progress" | "completed" | "abandoned";
  created_at: DateTime;
  updated_at: DateTime;
}
```

## Integration Points
- Triggers Discovery Analysis Server for opportunity detection
- Updates CRM records via Supabase
- Notifies Sales Funnel Server of new leads
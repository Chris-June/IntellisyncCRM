# Sales Funnel MCP Service

## Overview
The Sales Funnel Service manages the complete sales pipeline, from lead tracking to deal closure, integrating with AI-driven opportunity scoring and proposal generation.

## Core Responsibilities
- Managing lead lifecycle stages
- Tracking deal progress and status
- Coordinating proposal generation
- Monitoring deal health and risks
- Automating follow-up actions

## API Endpoints

### List Leads
```http
GET /leads
```
Retrieves all leads with optional filtering.

**Query Parameters:**
- `stage`: Filter by pipeline stage
- `status`: Filter by lead status
- `from_date`: Filter by creation date
- `to_date`: Filter by end date

**Response:**
```json
{
  "leads": [
    {
      "id": "string",
      "client_id": "string",
      "stage": "discovery" | "proposal" | "negotiation" | "closed",
      "status": "active" | "stalled" | "won" | "lost",
      "value": number,
      "probability": number,
      "last_activity": "datetime"
    }
  ],
  "total": number,
  "page": number
}
```

### Create Lead
```http
POST /leads
```
Creates a new lead in the sales pipeline.

**Request Body:**
```json
{
  "client_id": "string",
  "source": "string",
  "initial_value": number,
  "opportunity_ids": string[]
}
```

### Update Lead Stage
```http
PUT /leads/{id}/stage
```
Updates the pipeline stage for a lead.

**Request Body:**
```json
{
  "stage": "discovery" | "proposal" | "negotiation" | "closed",
  "reason": "string",
  "next_actions": string[]
}
```

### Get Lead Details
```http
GET /leads/{id}
```
Retrieves detailed information about a specific lead.

## Data Models

### Lead
```typescript
{
  id: string;
  client_id: string;
  stage: "discovery" | "proposal" | "negotiation" | "closed";
  status: "active" | "stalled" | "won" | "lost";
  value: number;
  probability: number;
  opportunities: Opportunity[];
  activities: Activity[];
  created_at: DateTime;
  updated_at: DateTime;
}
```

### Activity
```typescript
{
  id: string;
  lead_id: string;
  type: "note" | "email" | "meeting" | "task";
  description: string;
  created_at: DateTime;
  created_by: string;
}
```

## Integration Points
- Receives leads from Client Intake Service
- Coordinates with Opportunity Scoring
- Triggers Proposal Generator
- Feeds data to Deal Risk Detector
- Updates CRM records
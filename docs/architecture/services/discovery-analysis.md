# Discovery Analysis MCP Service

## Overview
The Discovery Analysis Service performs semantic analysis on client intake data and discovery notes to identify business opportunities, challenges, and potential AI solution fits.

## Core Responsibilities
- Analyzing client intake responses
- Extracting key business goals and challenges
- Identifying potential AI application areas
- Generating structured opportunity data
- Triggering opportunity scoring

## API Endpoints

### Analyze Client Data
```http
POST /analyze
```
Analyzes client intake data and discovery notes.

**Request Body:**
```json
{
  "client_id": "string",
  "intake_data": {
    "responses": {},
    "notes": "string",
    "documents": []
  }
}
```

**Response:**
```json
{
  "analysis_id": "string",
  "opportunities": [
    {
      "title": "string",
      "description": "string",
      "ai_fit_score": number,
      "potential_impact": "high" | "medium" | "low"
    }
  ],
  "business_goals": [],
  "challenges": []
}
```

## Data Models

### AnalysisResult
```typescript
{
  client_id: string;
  analysis_id: string;
  opportunities: Array<Opportunity>;
  business_goals: Array<BusinessGoal>;
  challenges: Array<Challenge>;
  created_at: DateTime;
}
```

### Opportunity
```typescript
{
  title: string;
  description: string;
  ai_fit_score: number;
  potential_impact: "high" | "medium" | "low";
  relevant_solutions: string[];
}
```

## Integration Points
- Receives data from Client Intake Service
- Triggers Opportunity Scoring Agent
- Updates CRM with identified opportunities
- Feeds data to Proposal Generator
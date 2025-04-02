# Opportunity Scoring MCP Service

## Overview
The Opportunity Scoring Service evaluates and ranks business opportunities identified during the discovery phase, providing AI-fit scoring and prioritization recommendations.

## Core Responsibilities
- Scoring opportunities based on AI applicability
- Calculating potential business impact
- Ranking opportunities by priority
- Generating implementation recommendations
- Estimating resource requirements

## API Endpoints

### Score Opportunity
```http
POST /score
```
Scores and ranks an identified opportunity.

**Request Body:**
```json
{
  "opportunity_id": "string",
  "analysis_data": {
    "description": "string",
    "client_context": {},
    "technical_requirements": []
  }
}
```

**Response:**
```json
{
  "score_id": "string",
  "scores": {
    "ai_fit": number,
    "business_impact": number,
    "implementation_complexity": number,
    "overall": number
  },
  "recommendations": {
    "priority": "high" | "medium" | "low",
    "suggested_approach": "string",
    "estimated_timeline": "string",
    "required_resources": []
  }
}
```

## Data Models

### OpportunityScore
```typescript
{
  opportunity_id: string;
  scores: {
    ai_fit: number;
    business_impact: number;
    implementation_complexity: number;
    overall: number;
  };
  recommendations: {
    priority: "high" | "medium" | "low";
    suggested_approach: string;
    estimated_timeline: string;
    required_resources: string[];
  };
  created_at: DateTime;
}
```

## Scoring Criteria
- AI Solution Fit (0-100)
- Business Impact (0-100)
- Implementation Complexity (0-100)
- Resource Availability
- Timeline Feasibility
- Risk Factors

## Integration Points
- Receives data from Discovery Analysis Service
- Updates Sales Funnel with scored opportunities
- Feeds into Proposal Generator
- Informs Project Management planning
# Context Controller MCP Service

## Overview
The Context Controller Service manages dynamic context switching and state management for AI models across the MCP ecosystem. It ensures that agents maintain appropriate context awareness while operating on different tasks, projects, or client interactions.

## Core Responsibilities
- Managing model context states
- Handling context switching between tasks
- Maintaining context history
- Supporting context rollback
- Ensuring context isolation between agents
- Optimizing context retention and cleanup

## API Endpoints

### Switch Context
```http
POST /context/switch
```
Switches the active context for an agent or model.

**Request Body:**
```json
{
  "agent_id": "string",
  "context_type": "project" | "client" | "task",
  "context_id": "string",
  "metadata": {
    "role": "string",
    "scope": "string",
    "parameters": {}
  }
}
```

**Response:**
```json
{
  "context_id": "string",
  "status": "active",
  "previous_context": "string",
  "timestamp": "datetime"
}
```

### Get Current Context
```http
GET /context/current
```
Retrieves the current active context for an agent.

**Query Parameters:**
- `agent_id`: The ID of the agent

**Response:**
```json
{
  "agent_id": "string",
  "current_context": {
    "type": "string",
    "id": "string",
    "metadata": {},
    "activated_at": "datetime"
  },
  "context_history": [
    {
      "context_id": "string",
      "type": "string",
      "switched_at": "datetime"
    }
  ]
}
```

### Rollback Context
```http
POST /context/rollback
```
Reverts to a previous context state.

**Request Body:**
```json
{
  "agent_id": "string",
  "target_context_id": "string",
  "reason": "string"
}
```

## Data Models

### Context
```typescript
{
  id: string;
  agent_id: string;
  type: "project" | "client" | "task";
  context_id: string;
  metadata: Record<string, any>;
  status: "active" | "archived";
  created_at: DateTime;
  updated_at: DateTime;
}
```

### ContextSwitch
```typescript
{
  id: string;
  agent_id: string;
  from_context: string;
  to_context: string;
  reason: string;
  timestamp: DateTime;
}
```

## Context Types
1. **Project Context**
   - Project-specific goals and constraints
   - Team member roles and permissions
   - Project timeline and milestones
   - Client preferences and requirements

2. **Client Context**
   - Client profile and history
   - Communication preferences
   - Business objectives
   - Past interactions and decisions

3. **Task Context**
   - Task requirements and dependencies
   - Resource constraints
   - Success criteria
   - Related task history

## Integration Points
- Works with Memory Manager for context persistence
- Coordinates with Agent Orchestrator for task context
- Supports Project Management for workflow context
- Integrates with Client Intake for client context
- Provides context awareness to all MCP agents

## Context Switching Rules
1. **Atomic Operations**
   - Context switches must be atomic
   - All or nothing state transitions
   - Maintain consistency across systems

2. **State Validation**
   - Validate context compatibility
   - Check permission requirements
   - Verify resource availability

3. **History Tracking**
   - Log all context switches
   - Maintain switch timestamps
   - Record switch reasons

4. **Rollback Support**
   - Save previous context state
   - Enable clean rollbacks
   - Maintain context chain

## Performance Considerations
- Optimize context load time
- Minimize context switch overhead
- Implement context caching
- Handle concurrent context access
- Manage memory usage efficiently
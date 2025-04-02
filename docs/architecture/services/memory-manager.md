# Memory Manager MCP Service

## Overview
The Memory Manager Service provides a centralized system for storing and retrieving agent context and operational memory across the MCP ecosystem.

## Core Responsibilities
- Managing short-term and long-term agent memory
- Handling context persistence and retrieval
- Managing memory expiration and cleanup
- Providing memory isolation between agents

## API Endpoints

### Store Memory
```http
POST /memory/remember
```
Stores a new memory entry for an agent.

**Request Body:**
```json
{
  "agent_id": "string",
  "memory_type": "string",
  "context": {
    "key": "value"
  },
  "expires_at": "datetime"
}
```

### Recall Memory
```http
GET /memory/recall?agent_id={agent_id}&memory_type={memory_type}
```
Retrieves stored memory for an agent.

## Data Models

### MemoryEntry
```typescript
{
  agent_id: string;
  memory_type: string;
  context: Record<string, any>;
  expires_at?: DateTime;
  created_at: DateTime;
}
```

## Memory Types
- Short-term (session-based)
- Medium-term (task context)
- Long-term (client history)
- Permanent (system configuration)

## Integration Points
- Used by all MCP agents for context management
- Integrates with Context Controller for state management
- Supports Agent Orchestrator for task memory
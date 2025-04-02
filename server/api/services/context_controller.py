"""
Context Controller Service manages dynamic context switching and state management for AI models.

This service ensures that agents maintain appropriate context awareness while
operating on different tasks, projects, or client interactions.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import os
from ..models import ModelManager, ModelRegistry
from ..models.config import ModelType

router = APIRouter(prefix="/context", tags=["context-controller"])

# Initialize model registry and manager
model_registry = ModelRegistry()
model_manager = ModelManager(model_registry)

class ContextType(str, Enum):
    PROJECT = "project"
    CLIENT = "client" 
    TASK = "task"

class ContextStatus(str, Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"

class ContextMetadata(BaseModel):
    role: str
    scope: str
    parameters: Dict[str, Any] = {}

class ContextSwitchRequest(BaseModel):
    agent_id: str
    context_type: ContextType
    context_id: str
    metadata: ContextMetadata

class ContextHistory(BaseModel):
    context_id: str
    type: str
    switched_at: datetime

class CurrentContext(BaseModel):
    type: str
    id: str
    metadata: Dict[str, Any]
    activated_at: datetime

class ContextResponse(BaseModel):
    context_id: str
    status: ContextStatus
    previous_context: Optional[str] = None
    timestamp: datetime

class CurrentContextResponse(BaseModel):
    agent_id: str
    current_context: CurrentContext
    context_history: List[ContextHistory]

class RollbackRequest(BaseModel):
    agent_id: str
    target_context_id: str
    reason: str

@router.post("/switch", response_model=ContextResponse)
async def switch_context(request: ContextSwitchRequest):
    """
    Switches the active context for an agent or model.
    """
    try:
        # In a real implementation, this would update context in database
        # and possibly run AI reasoning about the context switch
        
        # Use OpenAI to analyze context switch implications
        messages = [
            {"role": "system", "content": "You are the Context Controller for IntelliSync CMS. Your job is to analyze context switches and ensure proper state transitions."},
            {"role": "user", "content": f"Agent {request.agent_id} is switching context from unknown to {request.context_type}/{request.context_id}. Role: {request.metadata.role}, Scope: {request.metadata.scope}. Analyze implications of this context switch and provide any context information that should be preserved or noted."}
        ]
        
        response, usage = await model_manager.generate_text(
            service_name="context_controller",
            messages=messages,
            temperature=0.1  # Low temperature for consistent, focused response
        )
        
        # Extract reasoning from response
        reasoning = response["choices"][0]["message"]["content"]
        
        # Create context response
        context_response = ContextResponse(
            context_id=f"ctx-{request.context_type}-{request.context_id}",
            status=ContextStatus.ACTIVE,
            previous_context=None,  # Would come from database in real impl
            timestamp=datetime.now()
        )
        
        # Return the context response with AI reasoning
        return {
            **context_response.dict(),
            "reasoning": reasoning
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/current", response_model=CurrentContextResponse)
async def get_current_context(agent_id: str):
    """
    Retrieves the current active context for an agent.
    """
    try:
        # In a real implementation, this would query the database
        
        # Generate sample context for demo purposes
        current_context = CurrentContext(
            type="project",
            id="project-123",
            metadata={
                "role": "executor",
                "scope": "full_access",
                "project_name": "AI Chatbot Implementation",
                "client_id": "client-456"
            },
            activated_at=datetime.now()
        )
        
        context_history = [
            ContextHistory(
                context_id="ctx-client-456",
                type="client",
                switched_at=datetime.now()
            ),
            ContextHistory(
                context_id="ctx-project-123", 
                type="project",
                switched_at=datetime.now()
            )
        ]
        
        return CurrentContextResponse(
            agent_id=agent_id,
            current_context=current_context,
            context_history=context_history
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/rollback", response_model=ContextResponse)
async def rollback_context(request: RollbackRequest):
    """
    Reverts to a previous context state.
    """
    try:
        # In a real implementation, this would revert to a previous context
        
        # Use OpenAI to analyze rollback implications
        messages = [
            {"role": "system", "content": "You are the Context Controller for IntelliSync CMS. Your job is to analyze context rollbacks and ensure proper state transitions."},
            {"role": "user", "content": f"Agent {request.agent_id} is rolling back to context {request.target_context_id}. Reason: {request.reason}. Analyze implications of this rollback and provide any context information that should be restored or noted."}
        ]
        
        response, usage = await model_manager.generate_text(
            service_name="context_controller",
            messages=messages,
            temperature=0.1
        )
        
        # Extract reasoning from response
        reasoning = response["choices"][0]["message"]["content"]
        
        return {
            "context_id": request.target_context_id,
            "status": ContextStatus.ACTIVE,
            "previous_context": "ctx-current-context-id",  # Would be actual ID in real impl
            "timestamp": datetime.now(),
            "reasoning": reasoning
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{agent_id}")
async def get_context_history(agent_id: str, limit: int = 10):
    """
    Retrieves the context switching history for an agent.
    """
    try:
        # In a real implementation, this would query the database
        
        return {
            "agent_id": agent_id,
            "history": [
                {
                    "from_context": "ctx-client-456",
                    "to_context": "ctx-project-123",
                    "reason": "Project work started",
                    "timestamp": datetime.now()
                },
                {
                    "from_context": "ctx-project-123",
                    "to_context": "ctx-task-789",
                    "reason": "Task assignment",
                    "timestamp": datetime.now()
                }
            ],
            "total": 2,
            "limit": limit
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze")
async def analyze_context_compatibility(
    source_context_id: str,
    target_context_id: str
):
    """
    Analyzes the compatibility of two contexts.
    """
    try:
        # In a real implementation, this would retrieve context details and analyze
        
        # Use OpenAI to analyze context compatibility
        messages = [
            {"role": "system", "content": "You are the Context Controller for IntelliSync CMS. Your job is to analyze context compatibility and transitions."},
            {"role": "user", "content": f"Analyze the compatibility between source context {source_context_id} and target context {target_context_id}. What information needs to be preserved? Are there any conflicts? What are the implications of this transition?"}
        ]
        
        response, usage = await model_manager.generate_text(
            service_name="context_controller",
            messages=messages,
            temperature=0.1
        )
        
        # Extract analysis from response
        analysis = response["choices"][0]["message"]["content"]
        
        return {
            "source_context_id": source_context_id,
            "target_context_id": target_context_id,
            "compatibility_score": 0.85,  # Would be calculated in real impl
            "analysis": analysis,
            "preservation_needed": ["client_preferences", "communication_history"],
            "potential_conflicts": ["task_priorities"],
            "transition_recommendations": [
                "Preserve client communication preferences",
                "Update task priorities after transition"
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
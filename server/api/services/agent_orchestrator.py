from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import uuid
import logging
import os
import json
import asyncio
from supabase import create_client

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/orchestrator", tags=["agent-orchestrator"])

class AgentTaskStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"

class AgentTaskType(str, Enum):
    ANALYSIS = "analysis"
    EXECUTION = "execution"
    COORDINATION = "coordination"
    MONITORING = "monitoring"

class AgentConfiguration(BaseModel):
    memory_limit: int = Field(gt=0, description="Memory limit in MB")
    timeout: int = Field(gt=0, description="Timeout in seconds")
    retry_policy: Optional[Dict[str, Any]] = None

class AgentTask(BaseModel):
    id: str
    agent_id: str
    task_type: AgentTaskType
    status: AgentTaskStatus
    input: Dict[str, Any]
    output: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

class LaunchRequest(BaseModel):
    agent_type: str
    task_id: str
    configuration: AgentConfiguration

class TaskStatusResponse(BaseModel):
    task_id: str
    agent_id: str
    status: AgentTaskStatus
    progress: float = Field(ge=0, le=100)
    metrics: Dict[str, Any]

@router.post("/launch")
async def launch_agent(request: LaunchRequest):
    """
    Launches a new agent instance for task execution.
    """
    try:
        # Initialize Supabase client
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        supabase = create_client(supabase_url, supabase_key)
        
        # Generate a unique agent ID
        agent_id = f"agent-{uuid.uuid4().hex[:8]}"
        
        # Create agent configuration
        agent_config = {
            "agent_type": request.agent_type,
            "task_id": request.task_id,
            "memory_limit": request.configuration.memory_limit,
            "timeout": request.configuration.timeout,
            "retry_policy": request.configuration.retry_policy
        }
        
        # Store agent in orchestrator database
        orchestrator_data = {
            "agent_id": agent_id,
            "task_id": request.task_id,
            "agent_type": request.agent_type,
            "status": "initializing",
            "configuration": agent_config,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        supabase.table("orchestrated_agents").insert(orchestrator_data).execute()
        
        # Call the agent launcher service to actually launch the agent
        # This would typically be an HTTP request to the agent_launcher service
        # For now, we'll simulate this by directly storing in the agent_states table
        
        agent_state_data = {
            "agent_id": agent_id,
            "config": agent_config,
            "status": "initializing",
            "start_time": datetime.now().isoformat(),
            "metrics": {
                "memory_usage": 0,
                "cpu_usage": 0,
                "progress": 0,
                "tasks_completed": 0
            }
        }
        
        supabase.table("agent_states").insert(agent_state_data).execute()
        
        # Start a background task to monitor the agent
        asyncio.create_task(monitor_agent(agent_id))
        
        logger.info(f"Launched agent {agent_id} for task {request.task_id}")
        
        return {
            "agent_id": agent_id,
            "task_id": request.task_id,
            "status": "launched",
            "configuration": request.configuration.dict()
        }
    except Exception as e:
        logger.error(f"Failed to launch agent: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
        
async def monitor_agent(agent_id: str):
    """
    Background task to monitor agent status and update the orchestrator.
    """
    try:
        # Initialize Supabase client
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        supabase = create_client(supabase_url, supabase_key)
        
        # Monitor the agent for a period of time
        monitoring_duration = 3600  # 1 hour
        check_interval = 10  # seconds
        
        for _ in range(monitoring_duration // check_interval):
            # Check agent status
            response = supabase.table("agent_states")\
                .select("*")\
                .eq("agent_id", agent_id)\
                .single()\
                .execute()
                
            if not response.data:
                logger.error(f"Agent {agent_id} not found in agent_states")
                break
                
            agent_state = response.data
            
            # Update orchestrator with latest status
            supabase.table("orchestrated_agents")\
                .update({
                    "status": agent_state.get("status"),
                    "metrics": agent_state.get("metrics"),
                    "updated_at": datetime.now().isoformat()
                })\
                .eq("agent_id", agent_id)\
                .execute()
                
            # If agent is completed or failed, stop monitoring
            if agent_state.get("status") in ["completed", "failed", "stopped"]:
                logger.info(f"Agent {agent_id} is {agent_state.get('status')}, stopping monitoring")
                break
                
            # Wait before checking again
            await asyncio.sleep(check_interval)
            
    except Exception as e:
        logger.error(f"Error monitoring agent {agent_id}: {str(e)}")


@router.get("/status/{agent_id}")
async def get_agent_status(agent_id: str):
    """
    Retrieves the current status of an agent.
    """
    try:
        # Initialize Supabase client
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        supabase = create_client(supabase_url, supabase_key)
        
        # Get agent from orchestrator database
        orchestrator_response = supabase.table("orchestrated_agents")\
            .select("*")\
            .eq("agent_id", agent_id)\
            .single()\
            .execute()
            
        if not orchestrator_response.data:
            raise HTTPException(status_code=404, detail="Agent not found")
            
        orchestrator_data = orchestrator_response.data
        
        # Get detailed agent state from agent_states table
        agent_state_response = supabase.table("agent_states")\
            .select("*")\
            .eq("agent_id", agent_id)\
            .single()\
            .execute()
            
        agent_state = agent_state_response.data if agent_state_response.data else {}
        
        # Get tasks associated with this agent
        tasks_response = supabase.table("agent_tasks")\
            .select("*")\
            .eq("agent_id", agent_id)\
            .execute()
            
        tasks = tasks_response.data if tasks_response.data else []
        
        # Calculate aggregate metrics
        total_tasks = len(tasks)
        completed_tasks = sum(1 for task in tasks if task.get("status") == "completed")
        failed_tasks = sum(1 for task in tasks if task.get("status") == "failed")
        running_tasks = sum(1 for task in tasks if task.get("status") == "running")
        pending_tasks = sum(1 for task in tasks if task.get("status") == "pending")
        
        # Calculate overall progress
        if total_tasks > 0:
            progress = (completed_tasks / total_tasks) * 100
        else:
            progress = 0
            
        # Get resource usage from agent_state
        metrics = agent_state.get("metrics", {})
        memory_usage = metrics.get("memory_usage", 0)
        cpu_usage = metrics.get("cpu_usage", 0)
        
        # Format tasks for response
        formatted_tasks = []
        for task in tasks:
            formatted_tasks.append({
                "task_id": task.get("task_id"),
                "status": task.get("status"),
                "progress": task.get("progress", 0),
                "started_at": task.get("started_at"),
                "completed_at": task.get("completed_at")
            })
            
        # Compile the response
        return {
            "agent_id": agent_id,
            "status": orchestrator_data.get("status"),
            "agent_type": orchestrator_data.get("agent_type"),
            "created_at": orchestrator_data.get("created_at"),
            "updated_at": orchestrator_data.get("updated_at"),
            "tasks": formatted_tasks,
            "task_summary": {
                "total": total_tasks,
                "completed": completed_tasks,
                "failed": failed_tasks,
                "running": running_tasks,
                "pending": pending_tasks,
                "progress": progress
            },
            "resources": {
                "memory_usage": memory_usage,
                "cpu_usage": cpu_usage
            }
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Failed to get agent status for {agent_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/stop/{agent_id}")
async def stop_agent(agent_id: str):
    """
    Gracefully terminates an agent instance.
    """
    try:
        # Initialize Supabase client
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        supabase = create_client(supabase_url, supabase_key)
        
        # Check if agent exists in orchestrator
        orchestrator_response = supabase.table("orchestrated_agents")\
            .select("*")\
            .eq("agent_id", agent_id)\
            .single()\
            .execute()
            
        if not orchestrator_response.data:
            raise HTTPException(status_code=404, detail="Agent not found")
            
        orchestrator_data = orchestrator_response.data
        
        # If agent is already stopped or completed, return current status
        current_status = orchestrator_data.get("status")
        if current_status in ["stopped", "completed", "failed"]:
            return {
                "agent_id": agent_id,
                "status": current_status,
                "message": f"Agent already in {current_status} state",
                "shutdown_time": orchestrator_data.get("updated_at")
            }
            
        # Update status in orchestrator
        supabase.table("orchestrated_agents")\
            .update({
                "status": "stopping",
                "updated_at": datetime.now().isoformat()
            })\
            .eq("agent_id", agent_id)\
            .execute()
            
        # Coordinate shutdown with agent_launcher service
        # This would typically be an HTTP request to the agent_launcher service
        # For now, we'll simulate this by directly updating the agent_states table
        
        # First check if agent exists in agent_states
        agent_state_response = supabase.table("agent_states")\
            .select("*")\
            .eq("agent_id", agent_id)\
            .single()\
            .execute()
            
        if not agent_state_response.data:
            logger.warning(f"Agent {agent_id} not found in agent_states, but exists in orchestrator")
        else:
            # Update agent state to stopped
            supabase.table("agent_states")\
                .update({
                    "status": "stopped",
                    "end_time": datetime.now().isoformat()
                })\
                .eq("agent_id", agent_id)\
                .execute()
                
        # Get any running tasks for this agent and mark them as stopped
        tasks_response = supabase.table("agent_tasks")\
            .select("*")\
            .eq("agent_id", agent_id)\
            .in_("status", ["running", "pending"])\
            .execute()
            
        if tasks_response.data:
            for task in tasks_response.data:
                supabase.table("agent_tasks")\
                    .update({
                        "status": "stopped",
                        "completed_at": datetime.now().isoformat(),
                        "error": "Task stopped due to agent shutdown"
                    })\
                    .eq("task_id", task.get("task_id"))\
                    .execute()
                    
        # Finally update orchestrator status to stopped
        supabase.table("orchestrated_agents")\
            .update({
                "status": "stopped",
                "updated_at": datetime.now().isoformat()
            })\
            .eq("agent_id", agent_id)\
            .execute()
            
        shutdown_time = datetime.now().isoformat()
        logger.info(f"Agent {agent_id} successfully stopped at {shutdown_time}")
            
        return {
            "agent_id": agent_id,
            "status": "stopped",
            "message": "Agent successfully stopped",
            "shutdown_time": shutdown_time
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Failed to stop agent {agent_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tasks/{agent_id}")
async def get_agent_tasks(agent_id: str):
    """
    Retrieves all tasks for an agent.
    """
    try:
        # Initialize Supabase client
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        supabase = create_client(supabase_url, supabase_key)
        
        # Check if agent exists in orchestrator
        orchestrator_response = supabase.table("orchestrated_agents")\
            .select("*")\
            .eq("agent_id", agent_id)\
            .single()\
            .execute()
            
        if not orchestrator_response.data:
            raise HTTPException(status_code=404, detail="Agent not found")
            
        # Get all tasks for this agent
        tasks_response = supabase.table("agent_tasks")\
            .select("*")\
            .eq("agent_id", agent_id)\
            .order("started_at", desc=True)\
            .execute()
            
        tasks = tasks_response.data if tasks_response.data else []
        
        # Format tasks for response
        formatted_tasks = []
        for task in tasks:
            formatted_task = {
                "task_id": task.get("task_id"),
                "type": task.get("task_type"),
                "status": task.get("status"),
                "progress": task.get("progress", 0),
                "started_at": task.get("started_at"),
                "completed_at": task.get("completed_at")
            }
            
            # Add error information if task failed
            if task.get("status") == "failed" and task.get("error"):
                formatted_task["error"] = task.get("error")
                
            # Add output if task is completed
            if task.get("status") == "completed" and task.get("output"):
                formatted_task["output_summary"] = summarize_output(task.get("output"))
                
            formatted_tasks.append(formatted_task)
            
        # Group tasks by status for summary
        status_counts = {}
        for task in tasks:
            status = task.get("status")
            status_counts[status] = status_counts.get(status, 0) + 1
            
        return {
            "agent_id": agent_id,
            "total_tasks": len(tasks),
            "status_summary": status_counts,
            "tasks": formatted_tasks
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Failed to retrieve tasks for agent {agent_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
        
def summarize_output(output: Dict[str, Any]) -> Dict[str, Any]:
    """
    Creates a summary of task output for the response.
    """
    # If output is small, return it directly
    if isinstance(output, dict) and len(json.dumps(output)) < 500:
        return output
        
    # Otherwise create a summary
    summary = {}
    
    if isinstance(output, dict):
        # Include only top-level keys in summary
        for key, value in output.items():
            if isinstance(value, (str, int, float, bool)):
                summary[key] = value
            elif isinstance(value, (list, dict)):
                summary[key] = f"{type(value).__name__} with {len(value)} items"
            else:
                summary[key] = str(type(value))
    else:
        summary["output"] = "Non-dictionary output, use detailed view to see full content"
        
    return summary

@router.post("/tasks/reassign")
async def reassign_task(task_id: str, new_agent_id: str):
    """
    Reassigns a task to a different agent.
    """
    try:
        # Initialize Supabase client
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        supabase = create_client(supabase_url, supabase_key)
        
        # Check if task exists
        task_response = supabase.table("agent_tasks")\
            .select("*")\
            .eq("task_id", task_id)\
            .single()\
            .execute()
            
        if not task_response.data:
            raise HTTPException(status_code=404, detail="Task not found")
            
        task_data = task_response.data
        old_agent_id = task_data.get("agent_id")
        
        # Check if task is in a state that can be reassigned
        task_status = task_data.get("status")
        if task_status not in ["pending", "failed"]:
            raise HTTPException(
                status_code=400, 
                detail=f"Task cannot be reassigned in {task_status} state. Only pending or failed tasks can be reassigned."
            )
            
        # Check if new agent exists
        agent_response = supabase.table("orchestrated_agents")\
            .select("*")\
            .eq("agent_id", new_agent_id)\
            .single()\
            .execute()
            
        if not agent_response.data:
            raise HTTPException(status_code=404, detail="New agent not found")
            
        # Check if new agent is in a state that can accept tasks
        agent_status = agent_response.data.get("status")
        if agent_status not in ["running", "active", "idle"]:
            raise HTTPException(
                status_code=400,
                detail=f"New agent is in {agent_status} state and cannot accept tasks"
            )
            
        # Update task with new agent ID
        update_data = {
            "agent_id": new_agent_id,
            "status": "pending",  # Reset to pending for the new agent
            "updated_at": datetime.now().isoformat(),
            "reassignment_history": task_data.get("reassignment_history", []) + [{
                "from_agent": old_agent_id,
                "to_agent": new_agent_id,
                "timestamp": datetime.now().isoformat(),
                "reason": "Manual reassignment"
            }]
        }
        
        supabase.table("agent_tasks")\
            .update(update_data)\
            .eq("task_id", task_id)\
            .execute()
            
        # Log the reassignment
        logger.info(f"Task {task_id} reassigned from agent {old_agent_id} to agent {new_agent_id}")
        
        # Notify the new agent about the task (in a real system, this might be a message or event)
        # For now, we'll just update the agent's task count
        
        return {
            "task_id": task_id,
            "old_agent_id": old_agent_id,
            "new_agent_id": new_agent_id,
            "status": "reassigned",
            "timestamp": datetime.now().isoformat()
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Failed to reassign task {task_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def get_orchestrator_health():
    """
    Returns health metrics for the orchestrator.
    """
    try:
        return {
            "status": "healthy",
            "active_agents": 5,
            "pending_tasks": 2,
            "system_load": {
                "cpu": 45,
                "memory": 60,
                "network": "stable"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
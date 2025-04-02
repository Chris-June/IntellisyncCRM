from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import uuid
import asyncio
import logging
from supabase_client import supabase
import psutil
import os

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/agent", tags=["agent-launcher"])

class AgentStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    STOPPED = "stopped"
    INITIALIZING = "initializing"
    ACTIVE = "active"

class AgentType(str, Enum):
    TASK_EXECUTOR = "task_executor"
    ANALYZER = "analyzer"
    COORDINATOR = "coordinator"
    MONITOR = "monitor"

class AgentConfiguration(BaseModel):
    memory_limit: int = Field(gt=0, description="Memory limit in MB")
    timeout: int = Field(gt=0, description="Timeout in seconds")
    priority: int = Field(ge=1, le=5, description="Priority level (1-5)")
    retry_count: int = Field(ge=0, le=3, default=0)

class AgentLaunchRequest(BaseModel):
    agent_type: AgentType
    task_id: str
    configuration: AgentConfiguration
    context: Optional[Dict[str, Any]] = None
    objectives: Optional[Dict[str, Any]] = None

class AgentLaunchResponse(BaseModel):
    agent_id: str
    status_url: str

class AgentStatusResponse(BaseModel):
    agent_id: str
    status: AgentStatus
    task_id: str
    progress: float = Field(ge=0, le=100)
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    error: Optional[str] = None
    metrics: Dict[str, Any]

class AgentStateManager:
    def __init__(self):
        self.supabase_url = os.getenv('SUPABASE_URL')
        self.supabase_key = os.getenv('SUPABASE_KEY')
        self.supabase = supabase.create_client(self.supabase_url, self.supabase_key)

    def create_agent_state(self, agent_id: str, config: dict, status: AgentStatus):
        response = self.supabase.table('agent_states').insert({
            "agent_id": agent_id,
            "config": config,
            "status": status.value,
            "start_time": datetime.now().isoformat(),
            "metrics": self._init_metrics()
        }).execute()
        return response.data[0] if response.data else None

    def get_agent_state(self, agent_id: str) -> dict:
        response = self.supabase.table('agent_states')\
            .select('*')\
            .eq('agent_id', agent_id)\
            .single().execute()
        return self._format_state(response.data) if response.data else None

    def update_agent_status(self, agent_id: str, status: AgentStatus):
        update_data = {"status": status.value}
        if status in [AgentStatus.COMPLETED, AgentStatus.FAILED, AgentStatus.STOPPED]:
            update_data["end_time"] = datetime.now().isoformat()
        
        self.supabase.table('agent_states')\
            .update(update_data)\
            .eq('agent_id', agent_id)\
            .execute()

    def update_agent_metrics(self, agent_id: str):
        self.supabase.table('agent_states')\
            .update({"metrics": self._collect_system_metrics()})\
            .eq('agent_id', agent_id)\
            .execute()

    def _init_metrics(self):
        return {
            "memory_usage": [],
            "cpu_usage": [],
            "tasks_completed": 0,
            "avg_response_time": 0.0
        }

    def _collect_system_metrics(self):
        process = psutil.Process(os.getpid())
        return {
            "memory_usage": process.memory_info().rss,
            "cpu_usage": process.cpu_percent(),
            "thread_count": process.num_threads()
        }

    def _format_state(self, agent: dict) -> dict:
        return {
            "agent_id": agent['agent_id'],
            "config": agent['config'],
            "status": agent['status'],
            "start_time": agent['start_time'],
            "end_time": agent.get('end_time'),
            "error": agent.get('error'),
            "metrics": agent['metrics']
        }

async def load_agent_skills(state: Dict[str, Any]):
    # Implement agent skill loading logic
    pass

async def initialize_memory_systems(state: Dict[str, Any]):
    # Implement memory system initialization logic
    pass

def setup_agent_monitoring(state: Dict[str, Any]):
    # Implement agent monitoring setup logic
    pass

@router.post("", response_model=AgentLaunchResponse)
async def launch_agent(request: AgentLaunchRequest):
    """
    Initializes and launches an AI agent with specified parameters
    """
    try:
        # Validate agent configuration
        if not request.agent_type or not request.objectives:
            raise HTTPException(status_code=400, detail="Agent type and objectives are required")

        # Create agent configuration
        agent_id = f"agent-{uuid.uuid4().hex[:8]}"
        
        # Store agent state
        AgentStateManager().create_agent_state(
            agent_id=agent_id,
            config=request.dict(),
            status=AgentStatus.INITIALIZING
        )

        # Initiate agent process
        asyncio.create_task(initialize_agent_process(agent_id))

        return AgentLaunchResponse(
            agent_id=agent_id,
            status_url=f"/agents/{agent_id}/status"
        )

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Agent launch failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Agent initialization failed")

async def initialize_agent_process(agent_id: str):
    """
    Background task to initialize agent capabilities
    """
    try:
        state = AgentStateManager().get_agent_state(agent_id)
        
        # 1. Load required skills
        await load_agent_skills(state)
        
        # 2. Initialize memory systems
        await initialize_memory_systems(state)
        
        # 3. Establish monitoring
        setup_agent_monitoring(state)
        
        # Update status to active
        AgentStateManager().update_agent_status(agent_id, AgentStatus.ACTIVE)
        
    except Exception as e:
        logger.error(f"Agent initialization failed: {str(e)}")
        AgentStateManager().update_agent_status(agent_id, AgentStatus.FAILED)

# Background metric collector
async def metrics_collector():
    while True:
        try:
            agents = AgentStateManager().supabase.table('agent_states')\
                .select('*')\
                .eq('status', AgentStatus.ACTIVE.value)\
                .execute()
            for agent in agents.data:
                AgentStateManager().update_agent_metrics(agent['agent_id'])
        except Exception as e:
            logger.error(f"Metrics collection failed: {str(e)}")
        await asyncio.sleep(5)  # Collect every 5 seconds

@router.get("/status/{agent_id}", response_model=AgentStatusResponse)
async def get_agent_status(agent_id: str):
    """
    Retrieves current status and metrics for a running agent
    """
    try:
        state = AgentStateManager().get_agent_state(agent_id)
        if not state:
            raise HTTPException(status_code=404, detail="Agent not found")

        return AgentStatusResponse(
            agent_id=agent_id,
            status=state['status'],
            task_id=state['config'].get('task_id'),
            progress=state['metrics'].get('progress', 0.0),
            started_at=state['start_time'],
            completed_at=state.get('end_time'),
            error=state.get('error'),
            metrics={
                "memory_usage": state['metrics'].get('memory_usage'),
                "cpu_usage": state['metrics'].get('cpu_usage'),
                "tasks_completed": state['metrics'].get('tasks_completed', 0)
            }
        )

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Status check failed for agent {agent_id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to retrieve agent status")

@router.post("/stop/{agent_id}")
async def stop_agent(agent_id: str):
    """
    Gracefully terminates an agent instance.
    """
    try:
        # Get the current agent state
        state_manager = AgentStateManager()
        agent_state = state_manager.get_agent_state(agent_id)
        
        if not agent_state:
            raise HTTPException(status_code=404, detail="Agent not found")
            
        # Check if the agent is already stopped or completed
        current_status = agent_state.get('status')
        if current_status in [AgentStatus.STOPPED, AgentStatus.COMPLETED, AgentStatus.FAILED]:
            return {"status": current_status, "agent_id": agent_id, "message": f"Agent already in {current_status} state"}
        
        # Update agent status to STOPPED
        state_manager.update_agent_status(agent_id, AgentStatus.STOPPED)
        
        # Record end time
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        supabase = supabase.create_client(supabase_url, supabase_key)
        
        supabase.table("agent_states")\
            .update({"end_time": datetime.now().isoformat()})\
            .eq("agent_id", agent_id)\
            .execute()
        
        # Log the termination
        logger.info(f"Agent {agent_id} has been terminated")
        
        return {"status": "stopped", "agent_id": agent_id, "message": "Agent successfully stopped"}
    except Exception as e:
        logger.error(f"Failed to stop agent {agent_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/metrics/{agent_id}")
async def get_agent_metrics(agent_id: str):
    """
    Retrieves performance metrics for an agent.
    """
    try:
        # Get the agent state from the database
        state_manager = AgentStateManager()
        agent_state = state_manager.get_agent_state(agent_id)
        
        if not agent_state:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        # Extract metrics from agent state
        metrics = agent_state.get('metrics', {})
        
        # Calculate uptime if agent is still running
        start_time = datetime.fromisoformat(agent_state.get('start_time'))
        end_time = None
        
        if agent_state.get('end_time'):
            end_time = datetime.fromisoformat(agent_state.get('end_time'))
        else:
            end_time = datetime.now()
            
        uptime_seconds = (end_time - start_time).total_seconds()
        hours, remainder = divmod(uptime_seconds, 3600)
        minutes, seconds = divmod(remainder, 60)
        uptime_str = f"{int(hours)}h {int(minutes)}m {int(seconds)}s"
        
        # Update metrics with calculated values
        metrics['uptime'] = uptime_str
        metrics['uptime_seconds'] = uptime_seconds
        
        # Add additional performance metrics
        metrics['efficiency_score'] = calculate_efficiency_score(metrics)
        metrics['resource_utilization'] = calculate_resource_utilization(metrics)
        
        return {
            "agent_id": agent_id,
            "status": agent_state.get('status'),
            "metrics": metrics,
            "config": agent_state.get('config')
        }
    except Exception as e:
        logger.error(f"Failed to retrieve metrics for agent {agent_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
        
def calculate_efficiency_score(metrics: Dict[str, Any]) -> float:
    """
    Calculate an efficiency score based on the agent's metrics.
    """
    # Simple calculation based on CPU and memory usage
    cpu_usage = metrics.get('cpu_usage', 0)
    memory_usage = metrics.get('memory_usage', 0)
    tasks_completed = metrics.get('tasks_completed', 0)
    
    if cpu_usage == 0 or memory_usage == 0:
        return 0.0
    
    # Higher score for more tasks with less resource usage
    return min(100, (tasks_completed * 10) / ((cpu_usage + memory_usage) / 2) * 10)
    
def calculate_resource_utilization(metrics: Dict[str, Any]) -> Dict[str, float]:
    """
    Calculate resource utilization percentages.
    """
    return {
        "cpu": metrics.get('cpu_usage', 0) / 100,  # Convert to percentage
        "memory": metrics.get('memory_usage', 0) / 1024,  # Convert to percentage of 1GB
        "io": metrics.get('io_operations', 0) / 1000  # Normalize IO operations
    }

class ScalingRequest(BaseModel):
    agent_type: AgentType
    target_count: int = Field(gt=0, description="Target number of agent instances")
    priority: Optional[int] = Field(None, ge=1, le=5, description="Priority level (1-5)")
    resource_limits: Optional[Dict[str, int]] = None

@router.post("/scale")
async def scale_agents(scaling_request: ScalingRequest):
    """
    Scales agent instances based on workload.
    """
    try:
        # Get current agent count for the specified type
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        supabase_client = supabase.create_client(supabase_url, supabase_key)
        
        # Query active agents of the specified type
        response = supabase_client.table("agent_states")\
            .select("agent_id")\
            .eq("config->agent_type", scaling_request.agent_type)\
            .in_("status", [AgentStatus.RUNNING, AgentStatus.INITIALIZING, AgentStatus.ACTIVE, AgentStatus.PENDING])\
            .execute()
            
        current_agents = response.data
        current_count = len(current_agents)
        
        # Calculate how many agents to add or remove
        delta = scaling_request.target_count - current_count
        
        if delta == 0:
            return {
                "status": "unchanged",
                "message": f"Already at target count of {current_count} agents",
                "current_count": current_count
            }
            
        if delta > 0:
            # Need to launch new agents
            new_agents = []
            for _ in range(delta):
                # Create configuration for the new agent
                config = AgentConfiguration(
                    memory_limit=scaling_request.resource_limits.get("memory_limit", 512) if scaling_request.resource_limits else 512,
                    timeout=scaling_request.resource_limits.get("timeout", 3600) if scaling_request.resource_limits else 3600,
                    priority=scaling_request.priority or 3,
                    retry_count=0
                )
                
                # Launch a new agent
                launch_request = AgentLaunchRequest(
                    agent_type=scaling_request.agent_type,
                    task_id=f"scaling-{uuid.uuid4().hex[:8]}",
                    configuration=config,
                    context={"source": "auto-scaling"},
                    objectives={"auto_assigned": True}
                )
                
                # Call the launch_agent function directly
                response = await launch_agent(launch_request)
                new_agents.append(response.agent_id)
                
            return {
                "status": "scaled_up",
                "message": f"Launched {delta} new agents",
                "current_count": current_count + delta,
                "new_agents": new_agents
            }
        else:
            # Need to terminate excess agents
            # Sort by priority (terminate lowest priority first)
            response = supabase_client.table("agent_states")\
                .select("agent_id, config->priority")\
                .eq("config->agent_type", scaling_request.agent_type)\
                .in_("status", [AgentStatus.RUNNING, AgentStatus.INITIALIZING, AgentStatus.ACTIVE, AgentStatus.PENDING])\
                .order("config->priority")\
                .limit(abs(delta))\
                .execute()
                
            agents_to_terminate = response.data
            terminated_agents = []
            
            for agent in agents_to_terminate:
                # Call the stop_agent function directly
                await stop_agent(agent["agent_id"])
                terminated_agents.append(agent["agent_id"])
                
            return {
                "status": "scaled_down",
                "message": f"Terminated {len(terminated_agents)} agents",
                "current_count": current_count - len(terminated_agents),
                "terminated_agents": terminated_agents
            }
            
    except Exception as e:
        logger.error(f"Scaling operation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

asyncio.create_task(metrics_collector())
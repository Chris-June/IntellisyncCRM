from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from enum import Enum

router = APIRouter(prefix="/projects", tags=["project-management"])

class ProjectStatus(str, Enum):
    PLANNING = "planning"
    ACTIVE = "active"
    PAUSED = "paused"
    COMPLETED = "completed"

class HealthStatus(str, Enum):
    GREEN = "green"
    YELLOW = "yellow"
    RED = "red"

class TaskStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    BLOCKED = "blocked"

class TaskPriority(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class MilestoneStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    AT_RISK = "at_risk"

class ResourceType(str, Enum):
    HUMAN = "human"
    AI_AGENT = "ai_agent"

class Timeline(BaseModel):
    start_date: datetime
    end_date: datetime

class Resources(BaseModel):
    team_size: int
    budget: float
    skill_requirements: List[str]

class Scope(BaseModel):
    objectives: List[str]
    deliverables: List[str]
    timeline: Timeline
    resources: Resources

class Task(BaseModel):
    id: str
    project_id: str
    title: str
    description: str
    status: TaskStatus
    priority: TaskPriority
    assigned_to: str
    deadline: datetime
    dependencies: List[str]
    progress: float
    estimated_hours: float
    actual_hours: float

class Milestone(BaseModel):
    id: str
    project_id: str
    title: str
    description: str
    due_date: datetime
    status: MilestoneStatus
    deliverables: List[str]
    dependencies: List[str]

class Resource(BaseModel):
    id: str
    type: ResourceType
    name: str
    skills: List[str]
    availability: float
    allocated_hours: float
    cost_rate: float

class ProjectMetrics(BaseModel):
    on_track_tasks: int
    at_risk_tasks: int
    completed_tasks: int
    upcoming_milestones: int

class ProjectCreate(BaseModel):
    client_id: str
    opportunity_id: str
    name: str
    scope: Scope

class Project(BaseModel):
    id: str
    client_id: str
    name: str
    status: ProjectStatus
    progress: float
    health: HealthStatus
    start_date: datetime
    end_date: datetime
    tasks: List[Task]
    milestones: List[Milestone]
    resources: List[Resource]
    created_at: datetime
    updated_at: datetime

@router.post("", response_model=Project)
async def create_project(request: ProjectCreate):
    """
    Creates a new project from a won opportunity.
    """
    try:
        # In a real implementation, this would create a project in the database
        start_date = request.scope.timeline.start_date
        end_date = request.scope.timeline.end_date
        
        return Project(
            id="project-123",
            client_id=request.client_id,
            name=request.name,
            status=ProjectStatus.PLANNING,
            progress=0.0,
            health=HealthStatus.GREEN,
            start_date=start_date,
            end_date=end_date,
            tasks=[],
            milestones=[
                Milestone(
                    id="milestone-1",
                    project_id="project-123",
                    title="Project Kickoff",
                    description="Initial client meeting and requirements confirmation",
                    due_date=start_date + timedelta(days=7),
                    status=MilestoneStatus.PENDING,
                    deliverables=["Signed SOW", "Project Plan", "Requirements Document"],
                    dependencies=[]
                )
            ],
            resources=[],
            created_at=datetime.now(),
            updated_at=datetime.now()
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{client_id}")
async def get_client_projects(client_id: str):
    """
    Retrieves all projects for a specific client.
    """
    try:
        return {
            "projects": [
                {
                    "id": "project-123",
                    "name": "Website Redesign",
                    "status": ProjectStatus.ACTIVE,
                    "progress": 45.0,
                    "health": HealthStatus.GREEN,
                    "tasks": [
                        {
                            "id": "task-1",
                            "title": "Design Homepage",
                            "status": TaskStatus.COMPLETED,
                            "priority": TaskPriority.HIGH,
                            "progress": 100.0
                        },
                        {
                            "id": "task-2",
                            "title": "Implement User Authentication",
                            "status": TaskStatus.IN_PROGRESS,
                            "priority": TaskPriority.HIGH,
                            "progress": 60.0
                        }
                    ],
                    "milestones": [
                        {
                            "id": "milestone-1",
                            "title": "Design Approval",
                            "status": MilestoneStatus.COMPLETED,
                            "due_date": datetime.now() - timedelta(days=7)
                        },
                        {
                            "id": "milestone-2",
                            "title": "Beta Launch",
                            "status": MilestoneStatus.PENDING,
                            "due_date": datetime.now() + timedelta(days=14)
                        }
                    ],
                    "metrics": {
                        "on_track_tasks": 5,
                        "at_risk_tasks": 1,
                        "completed_tasks": 3,
                        "upcoming_milestones": 2
                    }
                }
            ],
            "metadata": {
                "total_count": 1,
                "active_count": 1
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{id}")
async def update_project(id: str, project_update: Dict[str, Any]):
    """
    Updates project details or status.
    """
    try:
        return {
            "id": id,
            "updated_fields": list(project_update.keys()),
            "updated_at": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{id}/analytics")
async def get_project_analytics(id: str):
    """
    Retrieves detailed project performance metrics.
    """
    try:
        return {
            "project_id": id,
            "timeline_metrics": {
                "planned_duration": "45 days",
                "current_duration": "50 days",
                "variance": "+5 days",
                "completion_trend": "Delayed by 1 week"
            },
            "resource_metrics": {
                "budget_consumed": 65.0,
                "budget_remaining": 35.0,
                "resource_utilization": 78.5,
                "top_contributors": [
                    {"name": "Jane Doe", "tasks_completed": 8},
                    {"name": "John Smith", "tasks_completed": 6}
                ]
            },
            "quality_metrics": {
                "defect_count": 3,
                "defect_density": 0.15,
                "test_coverage": 85.0,
                "client_satisfaction": 4.5
            },
            "risk_assessment": {
                "overall_risk": "Low",
                "top_risks": [
                    {"description": "Integration complexity", "impact": "Medium", "likelihood": "Low"},
                    {"description": "Resource availability", "impact": "High", "likelihood": "Low"}
                ]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{id}/tasks")
async def add_project_task(
    id: str,
    title: str,
    description: str,
    assigned_to: str,
    deadline: datetime,
    priority: TaskPriority,
    estimated_hours: float,
    dependencies: Optional[List[str]] = None
):
    """
    Adds a new task to a project.
    """
    try:
        return {
            "id": "task-123",
            "project_id": id,
            "title": title,
            "description": description,
            "status": TaskStatus.PENDING,
            "priority": priority,
            "assigned_to": assigned_to,
            "deadline": deadline,
            "dependencies": dependencies or [],
            "progress": 0.0,
            "estimated_hours": estimated_hours,
            "actual_hours": 0.0,
            "created_at": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/tasks/{task_id}")
async def update_task(
    task_id: str,
    status: Optional[TaskStatus] = None,
    progress: Optional[float] = None,
    actual_hours: Optional[float] = None
):
    """
    Updates task status or progress.
    """
    try:
        updates = {}
        if status is not None:
            updates["status"] = status
        if progress is not None:
            updates["progress"] = progress
        if actual_hours is not None:
            updates["actual_hours"] = actual_hours
            
        return {
            "id": task_id,
            "updated_fields": list(updates.keys()),
            "updated_at": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{id}/milestones")
async def add_project_milestone(
    id: str,
    title: str,
    description: str,
    due_date: datetime,
    deliverables: List[str],
    dependencies: Optional[List[str]] = None
):
    """
    Adds a new milestone to a project.
    """
    try:
        return {
            "id": "milestone-123",
            "project_id": id,
            "title": title,
            "description": description,
            "due_date": due_date,
            "status": MilestoneStatus.PENDING,
            "deliverables": deliverables,
            "dependencies": dependencies or [],
            "created_at": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/milestones/{milestone_id}")
async def update_milestone(
    milestone_id: str,
    status: MilestoneStatus
):
    """
    Updates milestone status.
    """
    try:
        return {
            "id": milestone_id,
            "status": status,
            "updated_at": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{id}/resources")
async def allocate_resource(
    id: str,
    resource_type: ResourceType,
    name: str,
    skills: List[str],
    availability: float,
    allocated_hours: float,
    cost_rate: float
):
    """
    Allocates a resource to a project.
    """
    try:
        return {
            "id": "resource-123",
            "project_id": id,
            "type": resource_type,
            "name": name,
            "skills": skills,
            "availability": availability,
            "allocated_hours": allocated_hours,
            "cost_rate": cost_rate,
            "created_at": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/dashboard")
async def get_projects_dashboard():
    """
    Retrieves a dashboard overview of all projects.
    """
    try:
        return {
            "total_projects": 12,
            "status_distribution": {
                "planning": 2,
                "active": 8,
                "paused": 1,
                "completed": 1
            },
            "health_distribution": {
                "green": 7,
                "yellow": 4,
                "red": 1
            },
            "upcoming_milestones": [
                {
                    "id": "milestone-123",
                    "project_id": "project-123",
                    "title": "Beta Launch",
                    "due_date": datetime.now() + timedelta(days=5)
                }
            ],
            "at_risk_projects": [
                {
                    "id": "project-456",
                    "name": "Mobile App Development",
                    "health": HealthStatus.RED,
                    "reason": "Resource shortage and timeline slippage"
                }
            ],
            "resource_utilization": 78.5
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{id}/health-check")
async def perform_project_health_check(id: str):
    """
    Performs an automated health check on a project.
    """
    try:
        return {
            "project_id": id,
            "health_status": HealthStatus.YELLOW,
            "issues_found": [
                {
                    "type": "schedule",
                    "description": "2 tasks are behind schedule",
                    "impact": "Medium",
                    "recommendation": "Adjust timeline or allocate additional resources"
                }
            ],
            "on_track_aspects": [
                "Budget is within planned limits",
                "Resource utilization is optimal",
                "Client feedback is positive"
            ],
            "performed_at": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
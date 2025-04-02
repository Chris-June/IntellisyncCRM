from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import uuid
import logging
from openai import OpenAI
from collections import defaultdict

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/decompose", tags=["task-decomposer"])

class ComplexityLevel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class AssigneeType(str, Enum):
    HUMAN = "human"
    AI_AGENT = "ai_agent"

class Priority(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class Timeline(BaseModel):
    start_date: datetime
    end_date: datetime

class ResourceConstraints(BaseModel):
    team_size: int
    budget: float
    available_skills: List[str]

class ProjectScope(BaseModel):
    description: str
    objectives: List[str]
    deliverables: List[str]
    constraints: Dict[str, Any]

class DecomposeRequest(BaseModel):
    project_id: str
    scope: ProjectScope

class TaskMetadata(BaseModel):
    risk_level: ComplexityLevel
    confidence_score: float = Field(ge=0, le=1)
    automation_potential: float = Field(ge=0, le=1)

class Task(BaseModel):
    id: str
    title: str
    description: str
    estimated_duration: str
    complexity: ComplexityLevel
    dependencies: List[str]
    suggested_assignee_type: AssigneeType
    required_skills: List[str]
    estimated_effort_hours: float
    priority: Priority
    group_id: Optional[str]
    metadata: TaskMetadata

class TaskGroup(BaseModel):
    id: str
    name: str
    tasks: List[str]
    parallel_execution: bool
    estimated_completion_time: str

class ResourceAllocation(BaseModel):
    human_hours_required: float
    ai_agent_hours_required: float
    skill_distribution: Dict[str, float]

class DecompositionResponse(BaseModel):
    decomposition_id: str
    tasks: List[Task]
    task_groups: List[TaskGroup]
    critical_path: List[str]
    resource_allocation: ResourceAllocation

class TaskBreakdown(BaseModel):
    tasks: List[Task]

def parse_ai_response(ai_response: str) -> List[Task]:
    tasks = []
    current_task = {}
    
    for line in ai_response.split('\n'):
        line = line.strip()
        if line.startswith('- Task title:'):
            current_task['title'] = line.split(': ')[1]
        elif line.startswith('- Description:'):
            current_task['description'] = line.split(': ')[1]
        elif line.startswith('- Estimated duration:'):
            current_task['estimated_duration'] = line.split(': ')[1]
        elif line.startswith('- Complexity level:'):
            complexity = line.split(': ')[1].lower()
            current_task['complexity'] = ComplexityLevel(complexity)
        elif line.startswith('- Dependencies:'):
            deps = line.split(': ')[1].split(', ') if line.split(': ')[1] else []
            current_task['dependencies'] = deps
        elif line.startswith('- Suggested assignee type:'):
            assignee = line.split(': ')[1].lower()
            current_task['suggested_assignee_type'] = AssigneeType(assignee)
        elif line.startswith('- Required skills:'):
            skills = line.split(': ')[1].split(', ') if line.split(': ')[1] else []
            current_task['required_skills'] = skills
        elif line.startswith('- Estimated effort hours:'):
            hours = float(line.split(': ')[1])
            current_task['estimated_effort_hours'] = hours
        elif line.startswith('- Priority:'):
            priority = line.split(': ')[1].lower()
            current_task['priority'] = Priority(priority)
            
            # Create Task object with generated ID
            task_id = f"task-{len(tasks)+1}"
            tasks.append(Task(
                id=task_id,
                title=current_task['title'],
                description=current_task['description'],
                estimated_duration=current_task['estimated_duration'],
                complexity=current_task['complexity'],
                dependencies=current_task['dependencies'],
                suggested_assignee_type=current_task['suggested_assignee_type'],
                required_skills=current_task['required_skills'],
                estimated_effort_hours=current_task['estimated_effort_hours'],
                priority=current_task['priority'],
                metadata=TaskMetadata(
                    risk_level=ComplexityLevel.LOW,  # Temporary
                    confidence_score=0.8,            # Temporary
                    automation_potential=0.5         # Temporary
                )
            ))
            current_task = {}
    
    return tasks

def identify_task_groups(tasks: List[Task]) -> List[TaskGroup]:
    # Implement task group identification logic
    # For now, return a mock response
    task_groups = [
        TaskGroup(
            id="group-1",
            name="Setup Phase",
            tasks=["task-1"],
            parallel_execution=False,
            estimated_completion_time="2d"
        )
    ]
    return task_groups

def calculate_critical_path(tasks: List[Task]) -> List[str]:
    # Implement critical path calculation logic
    # For now, return a mock response
    critical_path = ["task-1"]
    return critical_path

def analyze_resource_allocation(tasks: List[Task]) -> ResourceAllocation:
    # Implement resource allocation analysis logic
    # For now, return a mock response
    resource_allocation = ResourceAllocation(
        human_hours_required=16.0,
        ai_agent_hours_required=0.0,
        skill_distribution={"devops": 8.0, "cloud": 8.0}
    )
    return resource_allocation

@router.post("", response_model=DecompositionResponse)
async def decompose_project(request: DecomposeRequest):
    """
    Analyzes a project scope and returns a structured task breakdown using AI.
    """
    try:
        # Validate input
        if not request.scope.objectives or not request.scope.deliverables:
            raise HTTPException(status_code=400, detail="Project scope must include objectives and deliverables")

        # Prepare AI prompt
        prompt = f"""Analyze this project scope and decompose into actionable tasks:
        Project Description: {request.scope.description}
        Objectives: {', '.join(request.scope.objectives)}
        Deliverables: {', '.join(request.scope.deliverables)}
        Constraints: {request.scope.constraints}

        Output format:
        - Task title
        - Description
        - Estimated duration
        - Complexity level (high/medium/low)
        - Dependencies
        - Suggested assignee type (human/ai_agent)
        - Required skills
        - Estimated effort hours
        - Priority (high/medium/low)
        """

        # Call OpenAI API with GPT-4o-mini
        client = OpenAI()
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2000,
            temperature=0.7
        )

        # Parse AI response into structured tasks
        tasks = parse_ai_response(response.choices[0].message.content)

        # Generate decomposition ID
        decomposition_id = f"decomp-{uuid.uuid4().hex[:8]}"
        
        # Create task groups, critical path, and resource allocation
        task_groups = identify_task_groups(tasks)
        critical_path = calculate_critical_path(tasks)
        resource_allocation = analyze_resource_allocation(tasks)
        
        # Initialize Supabase client
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        supabase = create_client(supabase_url, supabase_key)
        
        # Store the decomposition in Supabase
        decomposition_data = {
            "decomposition_id": decomposition_id,
            "project_id": request.project_id,
            "tasks": [task.dict() for task in tasks],
            "task_groups": [group.dict() for group in task_groups],
            "critical_path": critical_path,
            "resource_allocation": resource_allocation.dict(),
            "created_at": datetime.now().isoformat(),
            "scope": request.scope.dict()
        }
        
        supabase.table("decompositions").insert(decomposition_data).execute()

        return DecompositionResponse(
            decomposition_id=decomposition_id,
            tasks=tasks,
            task_groups=task_groups,
            critical_path=critical_path,
            resource_allocation=resource_allocation
        )

    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Decomposition failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to decompose project")

@router.get("/{decomposition_id}", response_model=DecompositionResponse)
async def get_decomposition(decomposition_id: str):
    """
    Retrieves a specific task decomposition.
    """
    try:
        # Initialize Supabase client
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        supabase = create_client(supabase_url, supabase_key)
        
        # Query the decompositions table
        response = supabase.table("decompositions")\
            .select("*")\
            .eq("decomposition_id", decomposition_id)\
            .single()\
            .execute()
            
        if not response.data:
            raise HTTPException(status_code=404, detail="Decomposition not found")
            
        # Convert the stored data back to our model
        decomposition_data = response.data
        
        # Parse tasks, task groups, and resource allocation
        tasks = [Task(**task) for task in decomposition_data.get("tasks", [])]
        task_groups = [TaskGroup(**group) for group in decomposition_data.get("task_groups", [])]
        resource_allocation = ResourceAllocation(**decomposition_data.get("resource_allocation", {}))
        critical_path = decomposition_data.get("critical_path", [])
        
        return DecompositionResponse(
            decomposition_id=decomposition_id,
            tasks=tasks,
            task_groups=task_groups,
            critical_path=critical_path,
            resource_allocation=resource_allocation
        )
    except Exception as e:
        logger.error(f"Error retrieving decomposition: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

class UpdateTaskStructureRequest(BaseModel):
    tasks: Optional[List[Task]] = None
    task_groups: Optional[List[TaskGroup]] = None
    constraints: Optional[Dict[str, Any]] = None

@router.put("/{decomposition_id}", response_model=DecompositionResponse)
async def update_task_structure(decomposition_id: str, update_request: UpdateTaskStructureRequest):
    """
    Updates an existing task decomposition with new information or constraints.
    """
    try:
        # Initialize Supabase client
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        supabase = create_client(supabase_url, supabase_key)
        
        # First, retrieve the existing decomposition
        response = supabase.table("decompositions")\
            .select("*")\
            .eq("decomposition_id", decomposition_id)\
            .single()\
            .execute()
            
        if not response.data:
            raise HTTPException(status_code=404, detail="Decomposition not found")
            
        # Get the existing data
        existing_data = response.data
        
        # Update the fields that were provided in the request
        update_data = {}
        
        if update_request.tasks is not None:
            update_data["tasks"] = [task.dict() for task in update_request.tasks]
            
        if update_request.task_groups is not None:
            update_data["task_groups"] = [group.dict() for group in update_request.task_groups]
            
        if update_request.constraints is not None:
            update_data["constraints"] = update_request.constraints
            
        # If tasks were updated, recalculate critical path and resource allocation
        tasks = update_request.tasks or [Task(**task) for task in existing_data.get("tasks", [])]
        
        if update_request.tasks is not None:
            update_data["critical_path"] = calculate_critical_path(tasks)
            update_data["resource_allocation"] = analyze_resource_allocation(tasks).dict()
            
        # Update the decomposition in the database
        supabase.table("decompositions")\
            .update(update_data)\
            .eq("decomposition_id", decomposition_id)\
            .execute()
            
        # Retrieve the updated decomposition
        updated_response = supabase.table("decompositions")\
            .select("*")\
            .eq("decomposition_id", decomposition_id)\
            .single()\
            .execute()
            
        updated_data = updated_response.data
        
        # Convert the data back to our model
        tasks = [Task(**task) for task in updated_data.get("tasks", [])]
        task_groups = [TaskGroup(**group) for group in updated_data.get("task_groups", [])]
        resource_allocation = ResourceAllocation(**updated_data.get("resource_allocation", {}))
        critical_path = updated_data.get("critical_path", [])
        
        return DecompositionResponse(
            decomposition_id=decomposition_id,
            tasks=tasks,
            task_groups=task_groups,
            critical_path=critical_path,
            resource_allocation=resource_allocation
        )
    except Exception as e:
        logger.error(f"Error updating task structure: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/resources")
async def analyze_resource_requirements(breakdown: TaskBreakdown):
    """
    Analyzes resource requirements for a validated task breakdown
    """
    try:
        # Calculate total effort hours
        total_hours = sum(task.estimated_effort_hours for task in breakdown.tasks)
        
        # Identify skill requirements
        skill_counts = defaultdict(int)
        for task in breakdown.tasks:
            for skill in task.required_skills:
                skill_counts[skill] += 1
        
        # Determine parallelization potential
        parallel_tasks = len([t for t in breakdown.tasks if not t.dependencies])
        
        return {
            "total_effort_hours": total_hours,
            "required_skills": dict(skill_counts),
            "parallel_capacity": parallel_tasks,
            "recommended_team_size": max(1, int(total_hours // 40))  # 40h/week baseline
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

router = APIRouter(prefix="/templates", tags=["workflow-template"])

class TemplateType(str, Enum):
    INTAKE = "intake"
    SALES = "sales"
    PROJECT = "project"
    SUPPORT = "support"
    CUSTOM = "custom"

class TemplateStatus(str, Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    ARCHIVED = "archived"

class StepType(str, Enum):
    HUMAN = "human"
    AGENT = "agent"
    APPROVAL = "approval"
    NOTIFICATION = "notification"
    INTEGRATION = "integration"
    CONDITION = "condition"

class WorkflowStep(BaseModel):
    id: str
    name: str
    type: StepType
    description: str
    configuration: Dict[str, Any]
    next_steps: List[str]
    conditional_logic: Optional[Dict[str, Any]] = None
    timeout: Optional[int] = None
    retry_policy: Optional[Dict[str, Any]] = None

class TemplateCreate(BaseModel):
    name: str
    description: str
    type: TemplateType
    steps: List[WorkflowStep]
    triggers: Optional[List[Dict[str, Any]]] = None
    metadata: Optional[Dict[str, Any]] = None

class WorkflowTemplate(BaseModel):
    id: str
    name: str
    description: str
    type: TemplateType
    status: TemplateStatus
    steps: List[WorkflowStep]
    triggers: List[Dict[str, Any]]
    version: str
    created_by: str
    created_at: datetime
    updated_at: datetime
    metadata: Dict[str, Any]

@router.post("", response_model=WorkflowTemplate)
async def create_template(template: TemplateCreate):
    """
    Create a new workflow template.
    """
    try:
        return WorkflowTemplate(
            id="template-123",
            name=template.name,
            description=template.description,
            type=template.type,
            status=TemplateStatus.DRAFT,
            steps=template.steps,
            triggers=template.triggers or [],
            version="1.0.0",
            created_by="user-123",
            created_at=datetime.now(),
            updated_at=datetime.now(),
            metadata=template.metadata or {}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("", response_model=List[WorkflowTemplate])
async def list_templates(
    type: Optional[TemplateType] = None,
    status: Optional[TemplateStatus] = None
):
    """
    List all workflow templates.
    """
    try:
        # TODO: Implement template listing logic with filters
        return [
            WorkflowTemplate(
                id="template-123",
                name="Standard Client Intake",
                description="Standard workflow for new client onboarding",
                type=TemplateType.INTAKE,
                status=TemplateStatus.ACTIVE,
                steps=[
                    WorkflowStep(
                        id="step-1",
                        name="Collect Client Information",
                        type=StepType.HUMAN,
                        description="Collect basic client information",
                        configuration={
                            "form_id": "client-intake-form",
                            "required_fields": ["name", "email", "company"]
                        },
                        next_steps=["step-2"]
                    ),
                    WorkflowStep(
                        id="step-2",
                        name="Analyze Business Needs",
                        type=StepType.AGENT,
                        description="AI analysis of client needs and opportunities",
                        configuration={
                            "agent_id": "discovery-analysis-agent",
                            "input_mapping": {
                                "client_data": "$.step-1.responses"
                            }
                        },
                        next_steps=["step-3"]
                    )
                ],
                triggers=[
                    {
                        "type": "manual",
                        "description": "Manually triggered for new clients"
                    }
                ],
                version="1.0.0",
                created_by="user-123",
                created_at=datetime.now(),
                updated_at=datetime.now(),
                metadata={}
            )
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{template_id}", response_model=WorkflowTemplate)
async def get_template(template_id: str):
    """
    Retrieve a specific workflow template.
    """
    try:
        # TODO: Implement template retrieval logic
        raise HTTPException(status_code=404, detail="Template not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{template_id}", response_model=WorkflowTemplate)
async def update_template(template_id: str, template: TemplateCreate):
    """
    Update an existing workflow template.
    """
    try:
        # TODO: Implement template update logic
        return WorkflowTemplate(
            id=template_id,
            name=template.name,
            description=template.description,
            type=template.type,
            status=TemplateStatus.DRAFT,
            steps=template.steps,
            triggers=template.triggers or [],
            version="1.1.0",  # Version incremented
            created_by="user-123",
            created_at=datetime.now(),
            updated_at=datetime.now(),
            metadata=template.metadata or {}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{template_id}")
async def delete_template(template_id: str):
    """
    Delete a workflow template.
    """
    try:
        # TODO: Implement template deletion logic
        return {
            "id": template_id,
            "deleted": True
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{template_id}/activate")
async def activate_template(template_id: str):
    """
    Activate a draft template.
    """
    try:
        # TODO: Implement template activation logic
        return {
            "id": template_id,
            "status": TemplateStatus.ACTIVE,
            "activated_at": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{template_id}/archive")
async def archive_template(template_id: str):
    """
    Archive an active template.
    """
    try:
        # TODO: Implement template archiving logic
        return {
            "id": template_id,
            "status": TemplateStatus.ARCHIVED,
            "archived_at": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{template_id}/clone")
async def clone_template(template_id: str, name: str):
    """
    Clone an existing template.
    """
    try:
        # TODO: Implement template cloning logic
        return {
            "original_id": template_id,
            "new_id": "template-234",
            "name": name,
            "cloned_at": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{template_id}/versions")
async def get_template_versions(template_id: str):
    """
    Get all versions of a template.
    """
    try:
        # TODO: Implement version retrieval logic
        return {
            "template_id": template_id,
            "versions": [
                {
                    "version": "1.0.0",
                    "created_at": datetime.now(),
                    "created_by": "user-123",
                    "changes": ["Initial version"]
                },
                {
                    "version": "1.1.0",
                    "created_at": datetime.now(),
                    "created_by": "user-123",
                    "changes": ["Added new approval step"]
                }
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{template_id}/instances")
async def create_workflow_instance(
    template_id: str,
    context: Dict[str, Any],
    client_id: Optional[str] = None,
    project_id: Optional[str] = None
):
    """
    Create a new workflow instance from a template.
    """
    try:
        # TODO: Implement workflow instance creation logic
        return {
            "workflow_id": "workflow-123",
            "template_id": template_id,
            "client_id": client_id,
            "project_id": project_id,
            "status": "initialized",
            "current_step": "step-1",
            "context": context,
            "created_at": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
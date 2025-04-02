from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

router = APIRouter(prefix="/leads", tags=["sales-funnel"])

class PipelineStage(str, Enum):
    DISCOVERY = "discovery"
    PROPOSAL = "proposal"
    NEGOTIATION = "negotiation"
    CLOSED = "closed"

class LeadStatus(str, Enum):
    ACTIVE = "active"
    STALLED = "stalled"
    WON = "won"
    LOST = "lost"

class Activity(BaseModel):
    id: str
    lead_id: str
    type: str
    description: str
    created_at: datetime
    created_by: str

class Lead(BaseModel):
    id: str
    client_id: str
    stage: PipelineStage
    status: LeadStatus
    value: float
    probability: float = Field(ge=0, le=1)
    opportunities: List[str]
    activities: List[Activity]
    created_at: datetime
    updated_at: datetime

class LeadCreate(BaseModel):
    client_id: str
    source: str
    initial_value: float
    opportunity_ids: List[str]

class StageUpdate(BaseModel):
    stage: PipelineStage
    reason: str
    next_actions: List[str]

@router.get("")
async def list_leads(
    stage: Optional[PipelineStage] = None,
    status: Optional[LeadStatus] = None,
    from_date: Optional[datetime] = None,
    to_date: Optional[datetime] = None,
    page: int = 1,
    limit: int = 10
):
    """
    Retrieves all leads with optional filtering.
    """
    try:
        # TODO: Implement lead filtering and pagination
        return {
            "leads": [
                {
                    "id": "lead-123",
                    "client_id": "client-456",
                    "stage": PipelineStage.PROPOSAL,
                    "status": LeadStatus.ACTIVE,
                    "value": 50000.0,
                    "probability": 0.75,
                    "last_activity": datetime.now()
                }
            ],
            "total": 1,
            "page": page
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("")
async def create_lead(lead: LeadCreate):
    """
    Creates a new lead in the sales pipeline.
    """
    try:
        return {
            "id": "lead-123",
            "client_id": lead.client_id,
            "stage": PipelineStage.DISCOVERY,
            "status": LeadStatus.ACTIVE,
            "value": lead.initial_value,
            "probability": 0.3,
            "created_at": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{id}/stage")
async def update_lead_stage(id: str, update: StageUpdate):
    """
    Updates the pipeline stage for a lead.
    """
    try:
        return {
            "id": id,
            "stage": update.stage,
            "updated_at": datetime.now(),
            "next_actions": update.next_actions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{id}")
async def get_lead_details(id: str):
    """
    Retrieves detailed information about a specific lead.
    """
    try:
        return {
            "id": id,
            "client_id": "client-456",
            "stage": PipelineStage.PROPOSAL,
            "status": LeadStatus.ACTIVE,
            "value": 50000.0,
            "probability": 0.75,
            "opportunities": ["opp-123", "opp-124"],
            "activities": [
                {
                    "id": "activity-123",
                    "type": "note",
                    "description": "Initial discovery call completed",
                    "created_at": datetime.now(),
                    "created_by": "user-789"
                }
            ],
            "created_at": datetime.now(),
            "updated_at": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{id}/activities")
async def add_lead_activity(
    id: str,
    activity_type: str,
    description: str
):
    """
    Adds a new activity to a lead.
    """
    try:
        return {
            "id": "activity-123",
            "lead_id": id,
            "type": activity_type,
            "description": description,
            "created_at": datetime.now(),
            "created_by": "user-789"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics/pipeline")
async def get_pipeline_analytics():
    """
    Retrieves pipeline analytics and metrics.
    """
    try:
        return {
            "total_value": 250000.0,
            "stage_distribution": {
                "discovery": 5,
                "proposal": 3,
                "negotiation": 2,
                "closed": 1
            },
            "win_rate": 0.65,
            "average_deal_size": 50000.0,
            "average_sales_cycle": 45  # days
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{id}/probability")
async def update_win_probability(id: str, probability: float):
    """
    Updates the win probability for a lead.
    """
    try:
        return {
            "id": id,
            "probability": probability,
            "updated_at": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
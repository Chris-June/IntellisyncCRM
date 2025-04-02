from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

router = APIRouter(prefix="/risks", tags=["deal-risk-detector"])

class RiskLevel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class AlertSeverity(str, Enum):
    CRITICAL = "critical"
    WARNING = "warning"
    INFO = "info"

class WarningSignal(BaseModel):
    type: str
    description: str
    severity: AlertSeverity
    detected_at: datetime

class KeyEvent(BaseModel):
    event_type: str
    description: str
    timestamp: datetime

class RiskTrendPoint(BaseModel):
    timestamp: datetime
    score: float

class RiskAssessment(BaseModel):
    risk_score: float = Field(ge=0, le=100)
    risk_level: RiskLevel
    warning_signals: List[WarningSignal]
    recommendations: List[str]

class HistoricalData(BaseModel):
    risk_trend: List[RiskTrendPoint]
    key_events: List[KeyEvent]

class DealRiskResponse(BaseModel):
    risk_assessment: RiskAssessment
    historical_data: HistoricalData

@router.get("/{lead_id}", response_model=DealRiskResponse)
async def get_deal_risks(lead_id: str):
    """
    Retrieves risk assessment for a specific lead.
    """
    try:
        # In a real implementation, this would analyze deal data for risk factors
        return DealRiskResponse(
            risk_assessment=RiskAssessment(
                risk_score=65.5,
                risk_level=RiskLevel.MEDIUM,
                warning_signals=[
                    WarningSignal(
                        type="delayed_response",
                        description="Client has not responded to latest proposal for 7 days",
                        severity=AlertSeverity.WARNING,
                        detected_at=datetime.now()
                    ),
                    WarningSignal(
                        type="budget_concern",
                        description="Multiple discussions about budget constraints in recent communications",
                        severity=AlertSeverity.WARNING,
                        detected_at=datetime.now()
                    )
                ],
                recommendations=[
                    "Schedule a follow-up call to address budget concerns",
                    "Prepare alternative pricing options",
                    "Involve executive sponsor for relationship reinforcement"
                ]
            ),
            historical_data=HistoricalData(
                risk_trend=[
                    RiskTrendPoint(timestamp=datetime.now(), score=45.0),
                    RiskTrendPoint(timestamp=datetime.now(), score=55.0),
                    RiskTrendPoint(timestamp=datetime.now(), score=65.5)
                ],
                key_events=[
                    KeyEvent(
                        event_type="meeting",
                        description="Initial proposal presentation",
                        timestamp=datetime.now()
                    ),
                    KeyEvent(
                        event_type="email",
                        description="Client requested budget revisions",
                        timestamp=datetime.now()
                    )
                ]
            )
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/pipeline/health")
async def analyze_pipeline_health():
    """
    Returns overall pipeline health metrics and risk distribution.
    """
    try:
        return {
            "overall_health_score": 78.5,
            "risk_distribution": {
                "high_risk": 3,
                "medium_risk": 8,
                "low_risk": 12
            },
            "total_value_at_risk": 450000,
            "top_risk_factors": [
                {
                    "factor": "delayed_response",
                    "count": 5,
                    "impact": "high"
                },
                {
                    "factor": "budget_concern",
                    "count": 7,
                    "impact": "high"
                },
                {
                    "factor": "stakeholder_change",
                    "count": 3,
                    "impact": "medium"
                }
            ],
            "recommendations": [
                "Focus on the 3 high-risk deals with values over $100K",
                "Address budget concerns proactively in upcoming meetings",
                "Implement executive sponsorship program for at-risk deals"
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/factors")
async def update_risk_factors(factors: List[Dict[str, Any]]):
    """
    Updates or adds new risk detection factors.
    """
    try:
        return {
            "updated": len(factors),
            "status": "success",
            "timestamp": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/lead/{lead_id}/timeline")
async def get_risk_timeline(lead_id: str):
    """
    Retrieves a timeline of risk evolution for a specific lead.
    """
    try:
        return {
            "lead_id": lead_id,
            "timeline": [
                {
                    "date": datetime.now(),
                    "risk_score": 35.0,
                    "notable_events": ["Initial contact", "Discovery call scheduled"]
                },
                {
                    "date": datetime.now(),
                    "risk_score": 40.0,
                    "notable_events": ["Discovery call completed", "Requirements gathering"]
                },
                {
                    "date": datetime.now(),
                    "risk_score": 65.5,
                    "notable_events": ["Budget concerns raised", "Decision maker changed"]
                }
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/leads/batch-analyze")
async def batch_analyze_risks(lead_ids: List[str]):
    """
    Performs risk analysis on multiple leads.
    """
    try:
        return {
            "analyzed": len(lead_ids),
            "high_risk_count": 2,
            "results": {
                lead_id: {"risk_score": 65.5, "risk_level": "medium"} 
                for lead_id in lead_ids
            },
            "processing_time": "1.2s"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/patterns")
async def identify_risk_patterns():
    """
    Identifies common risk patterns across the sales pipeline.
    """
    try:
        return {
            "patterns": [
                {
                    "pattern": "Extended decision timeline",
                    "frequency": "High",
                    "average_impact": 15.5,
                    "affected_deals": 8,
                    "mitigation_strategy": "Implement deal momentum tracking with automated alerts"
                },
                {
                    "pattern": "Multiple stakeholder changes",
                    "frequency": "Medium",
                    "average_impact": 25.0,
                    "affected_deals": 4,
                    "mitigation_strategy": "Develop broader relationships within client organization"
                }
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
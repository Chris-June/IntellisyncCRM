from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from enum import Enum

router = APIRouter(prefix="/reminders", tags=["follow-up-reminder"])

class ReminderType(str, Enum):
    FOLLOW_UP = "follow_up"
    CHECK_IN = "check_in"
    MILESTONE = "milestone"
    URGENT = "urgent"

class ReminderPriority(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class ReminderContext(BaseModel):
    client_id: str
    lead_id: Optional[str] = None
    last_interaction: datetime
    suggested_actions: List[str]

class Reminder(BaseModel):
    id: str
    type: ReminderType
    priority: ReminderPriority
    due_date: datetime
    context: ReminderContext

class ReminderMetadata(BaseModel):
    total_count: int
    urgent_count: int
    overdue_count: int

class ReminderResponse(BaseModel):
    reminders: List[Reminder]
    metadata: ReminderMetadata

class SnoozeRequest(BaseModel):
    reminder_id: str
    duration: str  # e.g., "1d", "4h", "1w"
    reason: Optional[str] = None

@router.get("/{user_id}", response_model=ReminderResponse)
async def get_user_reminders(user_id: str):
    """
    Retrieves all pending reminders for a user.
    """
    try:
        # In a real implementation, this would query the database for reminders
        return ReminderResponse(
            reminders=[
                Reminder(
                    id="reminder-123",
                    type=ReminderType.FOLLOW_UP,
                    priority=ReminderPriority.HIGH,
                    due_date=datetime.now() + timedelta(days=1),
                    context=ReminderContext(
                        client_id="client-456",
                        lead_id="lead-789",
                        last_interaction=datetime.now() - timedelta(days=5),
                        suggested_actions=[
                            "Review proposal feedback",
                            "Schedule next meeting",
                            "Prepare pricing options"
                        ]
                    )
                ),
                Reminder(
                    id="reminder-124",
                    type=ReminderType.CHECK_IN,
                    priority=ReminderPriority.MEDIUM,
                    due_date=datetime.now() + timedelta(days=3),
                    context=ReminderContext(
                        client_id="client-457",
                        lead_id="lead-790",
                        last_interaction=datetime.now() - timedelta(days=10),
                        suggested_actions=[
                            "Check project satisfaction",
                            "Discuss potential expansion opportunities"
                        ]
                    )
                )
            ],
            metadata=ReminderMetadata(
                total_count=2,
                urgent_count=1,
                overdue_count=0
            )
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/snooze")
async def snooze_reminder(request: SnoozeRequest):
    """
    Delays a reminder for a specified duration.
    """
    try:
        # Parse duration string (e.g., "1d" -> 1 day)
        duration_unit = request.duration[-1]
        duration_value = int(request.duration[:-1])
        
        if duration_unit == 'd':
            new_date = datetime.now() + timedelta(days=duration_value)
        elif duration_unit == 'h':
            new_date = datetime.now() + timedelta(hours=duration_value)
        elif duration_unit == 'w':
            new_date = datetime.now() + timedelta(weeks=duration_value)
        else:
            raise ValueError(f"Invalid duration unit: {duration_unit}")
        
        return {
            "reminder_id": request.reminder_id,
            "original_due_date": datetime.now() + timedelta(days=1),
            "new_due_date": new_date,
            "reason": request.reason,
            "snoozed_at": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("")
async def create_follow_up(
    client_id: str,
    type: ReminderType,
    priority: ReminderPriority,
    due_date: datetime,
    lead_id: Optional[str] = None,
    suggested_actions: Optional[List[str]] = None
):
    """
    Creates a new follow-up reminder.
    """
    try:
        return {
            "id": "reminder-125",
            "type": type,
            "priority": priority,
            "due_date": due_date,
            "context": {
                "client_id": client_id,
                "lead_id": lead_id,
                "last_interaction": datetime.now(),
                "suggested_actions": suggested_actions or []
            },
            "created_at": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{id}/complete")
async def complete_reminder(id: str, outcome: str, next_steps: Optional[List[str]] = None):
    """
    Marks a reminder as completed with outcome.
    """
    try:
        return {
            "id": id,
            "status": "completed",
            "outcome": outcome,
            "next_steps": next_steps or [],
            "completed_at": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/overdue/{user_id}")
async def get_overdue_reminders(user_id: str):
    """
    Retrieves all overdue reminders for a user.
    """
    try:
        return {
            "overdue_count": 2,
            "reminders": [
                {
                    "id": "reminder-126",
                    "type": ReminderType.FOLLOW_UP,
                    "priority": ReminderPriority.HIGH,
                    "due_date": datetime.now() - timedelta(days=2),
                    "days_overdue": 2,
                    "client": {
                        "id": "client-458",
                        "name": "Acme Corporation"
                    }
                }
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/upcoming/{days}")
async def get_upcoming_reminders(days: int = 7):
    """
    Retrieves reminders due in the next specified number of days.
    """
    try:
        end_date = datetime.now() + timedelta(days=days)
        return {
            "period": f"Next {days} days",
            "total_reminders": 5,
            "priority_distribution": {
                "high": 2,
                "medium": 2,
                "low": 1
            },
            "daily_breakdown": [
                {
                    "date": (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d"),
                    "count": 2
                },
                {
                    "date": (datetime.now() + timedelta(days=3)).strftime("%Y-%m-%d"),
                    "count": 3
                }
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/batch")
async def create_batch_reminders(reminders: List[Dict[str, Any]]):
    """
    Creates multiple reminders in a batch.
    """
    try:
        return {
            "created_count": len(reminders),
            "reminder_ids": [f"reminder-{i}" for i in range(127, 127 + len(reminders))],
            "created_at": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/statistics/{user_id}")
async def get_reminder_statistics(user_id: str):
    """
    Retrieves reminder completion statistics for a user.
    """
    try:
        return {
            "user_id": user_id,
            "total_reminders": 45,
            "completed_on_time": 32,
            "completed_late": 8,
            "snoozed": 3,
            "pending": 2,
            "completion_rate": 0.89,
            "average_completion_time": "1.5 days",
            "most_common_type": "follow_up"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
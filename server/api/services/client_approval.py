from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

router = APIRouter(prefix="/approvals", tags=["client-approval"])

class ApprovalStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    REVISION_REQUESTED = "revision_requested"

class DeliverableType(str, Enum):
    DOCUMENT = "document"
    DESIGN = "design"
    CODE = "code"
    ANALYSIS = "analysis"
    REPORT = "report"
    PRESENTATION = "presentation"

class FeedbackType(str, Enum):
    GENERAL = "general"
    SPECIFIC = "specific"
    QUESTION = "question"
    SUGGESTION = "suggestion"

class ApprovalRequest(BaseModel):
    project_id: str
    client_id: str
    deliverable_type: DeliverableType
    title: str
    description: str
    files: List[str]
    due_by: Optional[datetime] = None
    reviewers: List[str]
    metadata: Dict[str, Any] = {}

class Feedback(BaseModel):
    id: str
    user_id: str
    content: str
    type: FeedbackType
    location: Optional[str] = None
    created_at: datetime

class SubmissionResponse(BaseModel):
    submission_id: str
    project_id: str
    client_id: str
    status: ApprovalStatus
    created_at: datetime
    expires_at: Optional[datetime] = None
    approval_url: str

class ApprovalAction(BaseModel):
    status: ApprovalStatus
    feedback: Optional[str] = None
    requested_changes: Optional[List[str]] = None

@router.post("/submit")
async def submit_for_approval(request: ApprovalRequest) -> SubmissionResponse:
    """
    Submit a deliverable for client approval.
    """
    try:
        # TODO: Implement submission logic
        return SubmissionResponse(
            submission_id="submission-123",
            project_id=request.project_id,
            client_id=request.client_id,
            status=ApprovalStatus.PENDING,
            created_at=datetime.now(),
            expires_at=datetime.now() if request.due_by else None,
            approval_url=f"https://example.com/approve/submission-123"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{client_id}")
async def get_client_approvals(
    client_id: str, 
    status: Optional[ApprovalStatus] = None,
    project_id: Optional[str] = None,
    limit: int = 10,
    offset: int = 0
):
    """
    Retrieve approval submissions for a client.
    """
    try:
        return {
            "submissions": [
                {
                    "id": "submission-123",
                    "project_id": "project-456",
                    "title": "Website Design Mockup",
                    "deliverable_type": DeliverableType.DESIGN,
                    "status": ApprovalStatus.PENDING,
                    "submitted_at": datetime.now(),
                    "expires_at": datetime.now(),
                }
            ],
            "total": 1,
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{submission_id}/approve")
async def approve_submission(submission_id: str, action: ApprovalAction):
    """
    Approve or reject a submission.
    """
    try:
        return {
            "submission_id": submission_id,
            "status": action.status,
            "processed_at": datetime.now(),
            "feedback": action.feedback
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{submission_id}/feedback")
async def add_feedback(
    submission_id: str,
    user_id: str,
    feedback_type: FeedbackType,
    content: str,
    location: Optional[str] = None
):
    """
    Add feedback to a submission.
    """
    try:
        return {
            "id": "feedback-123",
            "submission_id": submission_id,
            "user_id": user_id,
            "type": feedback_type,
            "content": content,
            "location": location,
            "created_at": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{submission_id}/feedback")
async def get_submission_feedback(submission_id: str):
    """
    Get all feedback for a submission.
    """
    try:
        return {
            "submission_id": submission_id,
            "feedback": [
                {
                    "id": "feedback-123",
                    "user_id": "user-456",
                    "type": FeedbackType.SPECIFIC,
                    "content": "Please adjust the color scheme in the header",
                    "location": "header section",
                    "created_at": datetime.now()
                }
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{submission_id}/remind")
async def send_approval_reminder(submission_id: str, message: Optional[str] = None):
    """
    Send a reminder for pending approval.
    """
    try:
        return {
            "submission_id": submission_id,
            "reminder_sent": True,
            "sent_at": datetime.now(),
            "message": message or "A gentle reminder that your approval is requested for this deliverable."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/stats/{project_id}")
async def get_approval_stats(project_id: str):
    """
    Get approval statistics for a project.
    """
    try:
        return {
            "project_id": project_id,
            "total_submissions": 10,
            "pending": 3,
            "approved": 5,
            "rejected": 1,
            "revision_requested": 1,
            "average_time_to_approve": "2d 4h",
            "recent_activity": [
                {
                    "submission_id": "submission-123",
                    "action": "approved",
                    "timestamp": datetime.now()
                }
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
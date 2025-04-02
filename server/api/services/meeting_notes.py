from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import uuid
import os
import logging
import textwrap
from supabase import create_client
from openai import OpenAI

# Configure logger
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/meeting-notes", tags=["meeting-notes"])

class MeetingType(str, Enum):
    DISCOVERY = "discovery"
    SALES = "sales"
    PROJECT = "project"
    STATUS = "status"
    INTERNAL = "internal"
    CLIENT = "client"
    OTHER = "other"

class AttendeeType(str, Enum):
    INTERNAL = "internal"
    CLIENT = "client"
    PARTNER = "partner"
    OTHER = "other"

class ActionItemStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    BLOCKED = "blocked"

class Attendee(BaseModel):
    id: str
    name: str
    email: str
    type: AttendeeType
    role: Optional[str] = None

class ActionItem(BaseModel):
    id: str
    description: str
    assigned_to: str
    due_date: Optional[datetime] = None
    status: ActionItemStatus = ActionItemStatus.PENDING
    notes: Optional[str] = None

class MeetingNotes(BaseModel):
    id: str
    title: str
    meeting_type: MeetingType
    client_id: Optional[str] = None
    project_id: Optional[str] = None
    date: datetime
    duration_minutes: int
    attendees: List[Attendee]
    notes: str
    action_items: List[ActionItem]
    key_points: List[str]
    decisions: List[str]
    topics_discussed: List[str]
    follow_up_meeting: Optional[datetime] = None
    recorded: bool = False
    recording_url: Optional[str] = None
    created_by: str
    created_at: datetime
    updated_at: datetime

class NotesSummaryRequest(BaseModel):
    meeting_type: MeetingType
    date: datetime
    duration_minutes: int
    attendees: List[Attendee]
    transcript: str
    client_id: Optional[str] = None
    project_id: Optional[str] = None
    title: Optional[str] = None

class NotesSummaryResponse(BaseModel):
    notes_id: str
    title: str
    key_points: List[str]
    action_items: List[ActionItem]
    decisions: List[str]
    topics_discussed: List[str]
    summary: str

@router.post("/summarize", response_model=NotesSummaryResponse)
async def summarize_meeting(request: NotesSummaryRequest):
    """
    Generate a summary of meeting notes from a transcript.
    """
    try:
        # In a real implementation, this would process the transcript with AI
        title = request.title or f"Meeting with {request.attendees[0].name}" if request.attendees else "Meeting Summary"
        
        return NotesSummaryResponse(
            notes_id="notes-123",
            title=title,
            key_points=[
                "Team agreed on project timeline",
                "Client prefers weekly status updates",
                "Budget concerns addressed with phased approach"
            ],
            action_items=[
                ActionItem(
                    id="action-1",
                    description="Send project plan document to client",
                    assigned_to="user-123",
                    due_date=datetime.now(),
                    status=ActionItemStatus.PENDING
                ),
                ActionItem(
                    id="action-2",
                    description="Schedule weekly status meetings",
                    assigned_to="user-456",
                    due_date=datetime.now(),
                    status=ActionItemStatus.PENDING
                )
            ],
            decisions=[
                "Project will follow Agile methodology",
                "First milestone delivery set for next month",
                "Testing phase will involve client stakeholders"
            ],
            topics_discussed=[
                "Project timeline",
                "Budget constraints",
                "Technical requirements",
                "Communication protocol"
            ],
            summary="Meeting focused on project kickoff. Team established timeline, budget parameters, and communication protocols. Client expressed concern about timeline, which was addressed with a phased approach. Weekly status meetings scheduled, with first milestone delivery next month."
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("", response_model=MeetingNotes)
async def create_meeting_notes(notes: MeetingNotes):
    """
    Create a new meeting notes entry.
    """
    try:
        # Initialize Supabase client
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        supabase = create_client(supabase_url, supabase_key)
        
        # Generate a unique ID if not provided
        if not notes.id or notes.id == "":
            notes.id = f"notes-{uuid.uuid4().hex[:8]}"
        
        # Prepare data for storage
        notes_data = {
            "id": notes.id,
            "title": notes.title,
            "meeting_type": notes.meeting_type,
            "client_id": notes.client_id,
            "project_id": notes.project_id,
            "date": notes.date.isoformat(),
            "duration_minutes": notes.duration_minutes,
            "attendees": [att.dict() for att in notes.attendees],
            "summary": notes.summary,
            "key_points": notes.key_points,
            "decisions": notes.decisions,
            "topics_discussed": notes.topics_discussed,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        # Store action items separately if provided
        action_items_data = []
        if notes.action_items:
            for item in notes.action_items:
                # Generate ID for action item if not provided
                if not item.id or item.id == "":
                    item.id = f"action-{uuid.uuid4().hex[:8]}"
                
                action_items_data.append({
                    "id": item.id,
                    "notes_id": notes.id,
                    "description": item.description,
                    "assigned_to": item.assigned_to,
                    "due_date": item.due_date.isoformat() if item.due_date else None,
                    "status": item.status,
                    "notes": item.notes,
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat()
                })
        
        # Insert meeting notes into database
        supabase.table("meeting_notes").insert(notes_data).execute()
        
        # Insert action items if any
        if action_items_data:
            supabase.table("action_items").insert(action_items_data).execute()
        
        # Log the creation
        logger.info(f"Created meeting notes {notes.id} for {notes.meeting_type} meeting: {notes.title}")
        
        return notes
    except Exception as e:
        logger.error(f"Failed to create meeting notes: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{notes_id}", response_model=MeetingNotes)
async def get_meeting_notes(notes_id: str):
    """
    Retrieve meeting notes by ID.
    """
    try:
        # Initialize Supabase client
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        supabase = create_client(supabase_url, supabase_key)
        
        # Fetch meeting notes
        notes_response = supabase.table("meeting_notes")\
            .select("*")\
            .eq("id", notes_id)\
            .single()\
            .execute()
            
        if not notes_response.data:
            raise HTTPException(status_code=404, detail="Meeting notes not found")
        
        notes_data = notes_response.data
        
        # Fetch action items for these notes
        action_items_response = supabase.table("action_items")\
            .select("*")\
            .eq("notes_id", notes_id)\
            .execute()
            
        action_items = action_items_response.data
        
        # Convert date strings to datetime objects
        notes_data["date"] = datetime.fromisoformat(notes_data["date"].replace("Z", "+00:00"))
        
        # Process action items
        for item in action_items:
            if item.get("due_date"):
                item["due_date"] = datetime.fromisoformat(item["due_date"].replace("Z", "+00:00"))
        
        # Combine data
        notes_data["action_items"] = action_items
        
        # Log the retrieval
        logger.info(f"Retrieved meeting notes {notes_id}")
        
        return MeetingNotes(**notes_data)
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Failed to retrieve meeting notes {notes_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history/{client_id}")
async def get_client_meeting_history(
    client_id: str,
    project_id: Optional[str] = None,
    meeting_type: Optional[MeetingType] = None,
    limit: int = 10,
    offset: int = 0
):
    """
    Retrieve meeting history for a client.
    """
    try:
        # Initialize Supabase client
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        supabase = create_client(supabase_url, supabase_key)
        
        # Build query
        query = supabase.table("meeting_notes").select("*").eq("client_id", client_id)
        
        # Apply filters if provided
        if project_id:
            query = query.eq("project_id", project_id)
        if meeting_type:
            query = query.eq("meeting_type", meeting_type)
            
        # Apply pagination
        query = query.order("date", desc=True).range(offset, offset + limit - 1)
        
        # Execute query
        response = query.execute()
        meetings = response.data
        
        # Get total count for pagination
        count_query = supabase.table("meeting_notes").select("id", count="exact").eq("client_id", client_id)
        if project_id:
            count_query = count_query.eq("project_id", project_id)
        if meeting_type:
            count_query = count_query.eq("meeting_type", meeting_type)
            
        count_response = count_query.execute()
        total = count_response.count
        
        # For each meeting, get action item counts
        formatted_meetings = []
        for meeting in meetings:
            # Get action items for this meeting
            action_items_query = supabase.table("action_items")\
                .select("id, status")\
                .eq("notes_id", meeting["id"])\
                .execute()
                
            action_items = action_items_query.data
            
            # Count completed action items
            completed_count = sum(1 for item in action_items if item["status"] == ActionItemStatus.COMPLETED)
            
            formatted_meetings.append({
                "id": meeting["id"],
                "title": meeting["title"],
                "meeting_type": meeting["meeting_type"],
                "date": meeting["date"],
                "action_items_count": len(action_items),
                "action_items_completed": completed_count,
                "summary": meeting.get("summary", "")[:100] + "..." if meeting.get("summary", "") else ""
            })
        
        # Log the retrieval
        logger.info(f"Retrieved {len(meetings)} meeting notes for client {client_id}")
        
        return {
            "client_id": client_id,
            "project_id": project_id,
            "meetings": formatted_meetings,
            "total": total,
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        logger.error(f"Failed to retrieve meeting history for client {client_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{notes_id}/action-items/{action_id}")
async def update_action_item(
    notes_id: str,
    action_id: str,
    status: ActionItemStatus,
    notes: Optional[str] = None
):
    """
    Update the status of an action item.
    """
    try:
        # Initialize Supabase client
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        supabase = create_client(supabase_url, supabase_key)
        
        # Check if meeting notes exist
        notes_response = supabase.table("meeting_notes")\
            .select("id")\
            .eq("id", notes_id)\
            .single()\
            .execute()
            
        if not notes_response.data:
            raise HTTPException(status_code=404, detail="Meeting notes not found")
        
        # Check if action item exists
        action_response = supabase.table("action_items")\
            .select("*")\
            .eq("id", action_id)\
            .eq("notes_id", notes_id)\
            .single()\
            .execute()
            
        if not action_response.data:
            raise HTTPException(status_code=404, detail="Action item not found")
        
        # Prepare update data
        update_data = {
            "status": status,
            "updated_at": datetime.now().isoformat()
        }
        
        # Add notes if provided
        if notes is not None:
            update_data["notes"] = notes
        
        # Update action item
        supabase.table("action_items")\
            .update(update_data)\
            .eq("id", action_id)\
            .eq("notes_id", notes_id)\
            .execute()
        
        # Log the update
        logger.info(f"Updated action item {action_id} in meeting notes {notes_id} to status {status}")
        
        # Get the updated action item
        updated_action = supabase.table("action_items")\
            .select("*")\
            .eq("id", action_id)\
            .single()\
            .execute()
            
        # Format due date if present
        action_data = updated_action.data
        if action_data.get("due_date"):
            action_data["due_date"] = datetime.fromisoformat(action_data["due_date"].replace("Z", "+00:00"))
        
        return {
            "notes_id": notes_id,
            "action_id": action_id,
            "status": status,
            "notes": action_data.get("notes"),
            "updated_at": action_data.get("updated_at")
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Failed to update action item {action_id} in meeting notes {notes_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{notes_id}/action-items")
async def add_action_item(
    notes_id: str,
    description: str,
    assigned_to: str,
    due_date: Optional[datetime] = None
):
    """
    Add a new action item to meeting notes.
    """
    try:
        # Initialize Supabase client
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        supabase = create_client(supabase_url, supabase_key)
        
        # Check if meeting notes exist
        notes_response = supabase.table("meeting_notes")\
            .select("id")\
            .eq("id", notes_id)\
            .single()\
            .execute()
            
        if not notes_response.data:
            raise HTTPException(status_code=404, detail="Meeting notes not found")
        
        # Generate a unique ID for the action item
        action_id = f"action-{uuid.uuid4().hex[:8]}"
        
        # Prepare action item data
        action_data = {
            "id": action_id,
            "notes_id": notes_id,
            "description": description,
            "assigned_to": assigned_to,
            "status": ActionItemStatus.PENDING,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        # Add due date if provided
        if due_date:
            action_data["due_date"] = due_date.isoformat()
        
        # Insert action item into database
        supabase.table("action_items").insert(action_data).execute()
        
        # Log the creation
        logger.info(f"Added action item {action_id} to meeting notes {notes_id}")
        
        # Return the created action item
        return {
            "id": action_id,
            "notes_id": notes_id,
            "description": description,
            "assigned_to": assigned_to,
            "due_date": due_date,
            "status": ActionItemStatus.PENDING,
            "created_at": datetime.now().isoformat()
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Failed to add action item to meeting notes {notes_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{notes_id}/share")
async def share_meeting_notes(
    notes_id: str,
    recipients: List[str],
    include_action_items: bool = True,
    message: Optional[str] = None
):
    """
    Share meeting notes with specified recipients.
    """
    try:
        # Initialize Supabase client
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        supabase = create_client(supabase_url, supabase_key)
        
        # Check if meeting notes exist
        notes_response = supabase.table("meeting_notes")\
            .select("*")\
            .eq("id", notes_id)\
            .single()\
            .execute()
            
        if not notes_response.data:
            raise HTTPException(status_code=404, detail="Meeting notes not found")
        
        notes_data = notes_response.data
        
        # Get action items if requested
        action_items = []
        if include_action_items:
            action_items_response = supabase.table("action_items")\
                .select("*")\
                .eq("notes_id", notes_id)\
                .execute()
            action_items = action_items_response.data
        
        # Generate a unique share ID
        share_id = f"share-{uuid.uuid4().hex[:8]}"
        
        # Create a shareable link with token
        access_token = uuid.uuid4().hex
        access_link = f"https://intellisync-crm.com/shared/notes/{notes_id}?token={access_token}"
        
        # Prepare share data
        share_data = {
            "id": share_id,
            "notes_id": notes_id,
            "created_at": datetime.now().isoformat(),
            "expires_at": (datetime.now() + timedelta(days=30)).isoformat(),  # Expires in 30 days
            "access_token": access_token,
            "recipients": recipients,
            "include_action_items": include_action_items,
            "message": message,
            "status": "active"
        }
        
        # Store share data in database
        supabase.table("shared_notes").insert(share_data).execute()
        
        # Format meeting date
        meeting_date = datetime.fromisoformat(notes_data["date"].replace("Z", "+00:00"))
        formatted_date = meeting_date.strftime("%B %d, %Y at %I:%M %p")
        
        # Create email content in a simple way
        email_content = "<h2>Meeting Notes: " + notes_data['title'] + "</h2>"
        email_content += "<p>Meeting Date: " + formatted_date + "</p>"
        email_content += "<p>Meeting Type: " + notes_data['meeting_type'] + "</p>"
        
        email_content += "<h3>Summary</h3>"
        email_content += "<p>" + notes_data.get('summary', 'No summary available') + "</p>"
        
        email_content += "<h3>Key Points</h3>"
        email_content += "<ul>"
        for point in notes_data.get('key_points', []):
            email_content += "<li>" + point + "</li>"
        email_content += "</ul>"
        
        # Add action items if requested
        if include_action_items and action_items:
            email_content += "<h3>Action Items</h3>"
            email_content += "<ul>"
            for item in action_items:
                due_date = ""
                if item.get("due_date"):
                    due_date_obj = datetime.fromisoformat(item['due_date'].replace('Z', '+00:00'))
                    due_date = " (Due: " + due_date_obj.strftime('%B %d, %Y') + ")"
                    
                email_content += "<li><strong>" + item['description'] + "</strong> - Assigned to: " + item['assigned_to'] + due_date + " - Status: " + item['status'] + "</li>"
            email_content += "</ul>"
        
        # Add access link
        email_content += "<p>You can view the complete meeting notes here: <a href=\"" + access_link + "\">" + notes_data['title'] + " - Meeting Notes</a></p>"
        
        # Add optional message
        if message:
            email_content += "<p>Message from sender: " + message + "</p>"
        
        # In a real implementation, we would send emails to recipients here
        # For now, we'll just log the action
        for recipient in recipients:
            logger.info(f"Would send meeting notes email to {recipient} with access link {access_link}")
        
        # Log the sharing
        logger.info(f"Shared meeting notes {notes_id} with {len(recipients)} recipients")
        
        return {
            "notes_id": notes_id,
            "shared_with": recipients,
            "shared_at": datetime.now().isoformat(),
            "access_link": access_link,
            "share_id": share_id,
            "expires_at": (datetime.now() + timedelta(days=30)).isoformat()
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Failed to share meeting notes {notes_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search")
async def search_meeting_notes(
    query: str,
    client_id: Optional[str] = None,
    project_id: Optional[str] = None,
    meeting_type: Optional[MeetingType] = None,
    date_from: Optional[datetime] = None,
    date_to: Optional[datetime] = None
):
    """
    Search meeting notes by content.
    """
    try:
        # Initialize Supabase client
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        supabase = create_client(supabase_url, supabase_key)
        
        # Initialize OpenAI client for text embeddings
        openai_client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
        
        # Normalize search query
        normalized_query = query.lower().strip()
        
        # Build base query to get all meeting notes that match filters
        base_query = supabase.table("meeting_notes").select("*")
        
        # Apply filters if provided
        if client_id:
            base_query = base_query.eq("client_id", client_id)
        if project_id:
            base_query = base_query.eq("project_id", project_id)
        if meeting_type:
            base_query = base_query.eq("meeting_type", meeting_type)
        if date_from:
            base_query = base_query.gte("date", date_from.isoformat())
        if date_to:
            base_query = base_query.lte("date", date_to.isoformat())
            
        # Execute the query
        response = base_query.execute()
        notes = response.data
        
        # If no notes found, return empty results
        if not notes:
            return {
                "query": query,
                "results": [],
                "total": 0
            }
        
        # For each note, compute relevance score based on text matching
        results = []
        for note in notes:
            # Combine all text fields for searching
            note_text = (
                note.get("title", "") + " " +
                note.get("summary", "") + " " +
                " ".join(note.get("key_points", [])) + " " +
                " ".join(note.get("decisions", [])) + " " +
                " ".join(note.get("topics_discussed", []))
            ).lower()
            
            # Simple text matching for relevance score
            # In a production system, we would use embeddings and vector search
            relevance_score = 0.0
            matches = []
            
            # Check title match (highest weight)
            if normalized_query in note.get("title", "").lower():
                relevance_score += 0.5
                matches.append({
                    "field": "title",
                    "context": note.get("title", "")
                })
            
            # Check summary match
            summary = note.get("summary", "")
            if normalized_query in summary.lower():
                relevance_score += 0.3
                # Get context around the match
                start_idx = max(0, summary.lower().find(normalized_query) - 20)
                end_idx = min(len(summary), summary.lower().find(normalized_query) + len(normalized_query) + 20)
                context = "..." + summary[start_idx:end_idx] + "..."
                matches.append({
                    "field": "summary",
                    "context": context
                })
            
            # Check key points match
            for i, point in enumerate(note.get("key_points", [])):
                if normalized_query in point.lower():
                    relevance_score += 0.2
                    matches.append({
                        "field": "key_points",
                        "context": point
                    })
            
            # Check decisions match
            for i, decision in enumerate(note.get("decisions", [])):
                if normalized_query in decision.lower():
                    relevance_score += 0.2
                    matches.append({
                        "field": "decisions",
                        "context": decision
                    })
            
            # Check topics match
            for i, topic in enumerate(note.get("topics_discussed", [])):
                if normalized_query in topic.lower():
                    relevance_score += 0.1
                    matches.append({
                        "field": "topics_discussed",
                        "context": topic
                    })
            
            # If we have matches, add to results
            if relevance_score > 0:
                # Format date
                note_date = datetime.fromisoformat(note["date"].replace("Z", "+00:00"))
                
                results.append({
                    "id": note["id"],
                    "title": note["title"],
                    "meeting_type": note["meeting_type"],
                    "date": note_date.isoformat(),
                    "relevance_score": min(1.0, relevance_score),  # Cap at 1.0
                    "matches": matches
                })
        
        # Sort results by relevance score (highest first)
        results.sort(key=lambda x: x["relevance_score"], reverse=True)
        
        # Log the search
        logger.info(f"Searched meeting notes for '{query}' with {len(results)} results")
        
        return {
            "query": query,
            "results": results,
            "total": len(results)
        }
    except Exception as e:
        logger.error(f"Failed to search meeting notes: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{notes_id}/export")
async def export_meeting_notes(notes_id: str, format: str = "pdf"):
    """
    Export meeting notes in the specified format.
    """
    try:
        # Initialize Supabase client
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        supabase = create_client(supabase_url, supabase_key)
        
        # Validate format
        valid_formats = ["pdf", "docx", "html", "txt"]
        if format.lower() not in valid_formats:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid format. Supported formats are: {', '.join(valid_formats)}"
            )
        
        # Check if meeting notes exist
        notes_response = supabase.table("meeting_notes")\
            .select("*")\
            .eq("id", notes_id)\
            .single()\
            .execute()
            
        if not notes_response.data:
            raise HTTPException(status_code=404, detail="Meeting notes not found")
        
        notes_data = notes_response.data
        
        # Get action items for these notes
        action_items_response = supabase.table("action_items")\
            .select("*")\
            .eq("notes_id", notes_id)\
            .execute()
            
        action_items = action_items_response.data
        
        # Format meeting date
        meeting_date = datetime.fromisoformat(notes_data["date"].replace("Z", "+00:00"))
        formatted_date = meeting_date.strftime("%B %d, %Y at %I:%M %p")
        
        # Generate a unique export ID
        export_id = f"export-{uuid.uuid4().hex[:8]}"
        
        # Create content for export
        html_content = textwrap.dedent(f"""
            <!DOCTYPE html>
            <html>
            <head>
                <title>Meeting Notes: {notes_data['title']}</title>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }}
                    h1, h2, h3 {{ color: #333; }}
                    .header {{ border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 20px; }}
                    .metadata {{ color: #666; font-size: 0.9em; }}
                    .section {{ margin-bottom: 20px; }}
                    .action-item {{ background-color: #f9f9f9; padding: 10px; margin-bottom: 10px; border-left: 3px solid #ddd; }}
                    .action-item.pending {{ border-left-color: #f0ad4e; }}
                    .action-item.in_progress {{ border-left-color: #5bc0de; }}
                    .action-item.completed {{ border-left-color: #5cb85c; }}
                    .action-item.blocked {{ border-left-color: #d9534f; }}
                    .footer {{ margin-top: 30px; border-top: 1px solid #ddd; padding-top: 10px; font-size: 0.8em; color: #666; }}
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>Meeting Notes: {notes_data['title']}</h1>
                    <div class="metadata">
                        <p>Date: {formatted_date}</p>
                        <p>Meeting Type: {notes_data['meeting_type']}</p>
                        <p>Duration: {notes_data.get('duration_minutes', 0)} minutes</p>
                    </div>
                </div>
                
                <div class="section">
                    <h2>Summary</h2>
                    <p>{notes_data.get('summary', 'No summary available')}</p>
                </div>
                
                <div class="section">
                    <h2>Key Points</h2>
                    <ul>
        """)
        # Append key points
        for point in notes_data.get('key_points', []):
            html_content += f"            <li>{point}</li>\n"
        html_content += textwrap.dedent("""
                    </ul>
                </div>
                
                <div class="section">
                    <h2>Decisions</h2>
                    <ul>
        """)
        # Append decisions
        if notes_data.get('decisions', []):
            for decision in notes_data.get('decisions', []):
                html_content += f"            <li>{decision}</li>\n"
        else:
            html_content += "            <li>No decisions recorded</li>\n"
        html_content += textwrap.dedent("""
                    </ul>
                </div>
                
                <div class="section">
                    <h2>Topics Discussed</h2>
                    <ul>
        """)
        # Append topics discussed
        if notes_data.get('topics_discussed', []):
            for topic in notes_data.get('topics_discussed', []):
                html_content += f"            <li>{topic}</li>\n"
        else:
            html_content += "            <li>No topics recorded</li>\n"
        html_content += textwrap.dedent("""
                    </ul>
                </div>
                
                <div class="section">
                    <h2>Action Items</h2>
        """)
        # Append action items
        if action_items:
            for item in action_items:
                status = item.get("status", "pending")
                due_date = ""
                if item.get("due_date"):
                    due_date_obj = datetime.fromisoformat(item['due_date'].replace('Z', '+00:00'))
                    due_date = f" (Due: {due_date_obj.strftime('%B %d, %Y')})"
                html_content += textwrap.dedent(f"""
                    <div class="action-item {status}">
                        <strong>{item['description']}</strong><br>
                        Assigned to: {item['assigned_to']}{due_date}<br>
                        Status: {status}
                        {f'<br>Notes: {item.get("notes", "")}' if item.get("notes") else ''}
                    </div>
                """)
        else:
            html_content += "        <p>No action items recorded</p>\n"
        html_content += textwrap.dedent("""
                <div class="section">
                    <h2>Attendees</h2>
                    <ul>
        """)
        # Append attendees
        if notes_data.get('attendees', []):
            for attendee in notes_data.get('attendees', []):
                html_content += f"            <li>{attendee.get('name', 'Unknown')} ({attendee.get('email', 'No email')}) - {attendee.get('role', 'Participant')}</li>\n"
        else:
            html_content += "            <li>No attendees recorded</li>\n"
        html_content += textwrap.dedent(f"""
                    </ul>
                </div>
                
                <div class="footer">
                    <p>Generated on {datetime.now().strftime('%B %d, %Y at %I:%M %p')} by Intellisync CRM</p>
                    <p>Meeting ID: {notes_id}</p>
                </div>
            </body>
            </html>
        """)
        
        # Generate a unique filename
        filename = f"{notes_data['title'].replace(' ', '_')}_{datetime.now().strftime('%Y%m%d')}.{format.lower()}"
        
        # Create export record in database
        export_data = {
            "id": export_id,
            "notes_id": notes_id,
            "format": format.lower(),
            "filename": filename,
            "created_at": datetime.now().isoformat(),
            "expires_at": (datetime.now() + timedelta(days=7)).isoformat(),  # Expires in 7 days
            "status": "completed"
        }
        
        # Store export record in database
        supabase.table("notes_exports").insert(export_data).execute()
        
        # In a real implementation, we would upload the file to a storage service
        # and generate a signed URL for download. For now, we'll simulate this.
        download_url = f"https://intellisync-crm.com/api/downloads/{export_id}/{filename}"
        
        # Log the export
        logger.info(f"Exported meeting notes {notes_id} to {format} format")
        
        return {
            "notes_id": notes_id,
            "format": format.lower(),
            "filename": filename,
            "download_url": download_url,
            "expires_at": (datetime.now() + timedelta(days=7)).isoformat()
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Failed to export meeting notes {notes_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
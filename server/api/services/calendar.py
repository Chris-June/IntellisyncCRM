from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
from enum import Enum
import uuid
import os
import logging
from supabase import create_client

# Configure logger
logger = logging.getLogger(__name__)
router = APIRouter(prefix="/calendar", tags=["calendar"])

class EventType(str, Enum):
    MEETING = "meeting"
    MILESTONE = "milestone"
    DEADLINE = "deadline"
    FOLLOW_UP = "follow_up"
    REMINDER = "reminder"

class EventStatus(str, Enum):
    SCHEDULED = "scheduled"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    RESCHEDULED = "rescheduled"

class EventPriority(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class Attendee(BaseModel):
    id: str
    email: str
    role: str
    response_status: Optional[str] = "pending"

class RecurrenceRule(BaseModel):
    frequency: str
    interval: int
    until: Optional[datetime] = None
    count: Optional[int] = None

class Event(BaseModel):
    id: str
    type: EventType
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    timezone: str
    status: EventStatus
    priority: EventPriority
    client_id: Optional[str] = None
    project_id: Optional[str] = None
    attendees: List[Attendee]
    location: Optional[str] = None
    recurrence: Optional[RecurrenceRule] = None
    metadata: Dict[str, Any] = {}

class EventCreate(BaseModel):
    type: EventType
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    timezone: str = "UTC"
    priority: EventPriority = EventPriority.MEDIUM
    client_id: Optional[str] = None
    project_id: Optional[str] = None
    attendees: List[Attendee]
    location: Optional[str] = None
    recurrence: Optional[RecurrenceRule] = None
    metadata: Dict[str, Any] = {}

@router.post("/events")
async def create_event(event: EventCreate):
    """
    Creates a new calendar event.
    """
    try:
        # Initialize Supabase client
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        supabase = create_client(supabase_url, supabase_key)
        
        # Generate a unique event ID
        event_id = f"event-{uuid.uuid4().hex[:8]}"
        
        # Prepare event data for storage
        event_data = {
            "id": event_id,
            "type": event.type,
            "title": event.title,
            "description": event.description,
            "start_time": event.start_time.isoformat(),
            "end_time": event.end_time.isoformat(),
            "timezone": event.timezone,
            "status": EventStatus.SCHEDULED,
            "priority": event.priority,
            "client_id": event.client_id,
            "project_id": event.project_id,
            "location": event.location,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat(),
            "metadata": event.metadata
        }
        
        # Add recurrence data if provided
        if event.recurrence:
            event_data["recurrence"] = {
                "frequency": event.recurrence.frequency,
                "interval": event.recurrence.interval,
                "until": event.recurrence.until.isoformat() if event.recurrence.until else None,
                "count": event.recurrence.count
            }
        
        # Process attendees
        attendees_data = []
        for attendee in event.attendees:
            attendees_data.append({
                "id": attendee.id,
                "email": attendee.email,
                "role": attendee.role,
                "response_status": attendee.response_status,
                "event_id": event_id
            })
        
        # Store event in database
        supabase.table("calendar_events").insert(event_data).execute()
        
        # Store attendees in database
        if attendees_data:
            supabase.table("event_attendees").insert(attendees_data).execute()
        
        # Log event creation
        logger.info(f"Created calendar event {event_id}: {event.title}")
        
        # Return created event details
        return {
            "id": event_id,
            "status": "scheduled",
            "created_at": datetime.now().isoformat(),
            **event.dict()
        }
    except Exception as e:
        logger.error(f"Failed to create calendar event: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/events/{client_id}")
async def get_client_events(
    client_id: str,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    event_type: Optional[EventType] = None
):
    """
    Retrieves events for a specific client within a date range.
    """
    try:
        # Initialize Supabase client
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        supabase = create_client(supabase_url, supabase_key)
        
        # Build query
        query = supabase.table("calendar_events").select("*").eq("client_id", client_id)
        
        # Apply date filters if provided
        if start_date:
            query = query.gte("start_time", start_date.isoformat())
        if end_date:
            query = query.lte("end_time", end_date.isoformat())
        
        # Apply event type filter if provided
        if event_type:
            query = query.eq("type", event_type)
            
        # Execute query
        response = query.execute()
        events = response.data
        
        # For each event, fetch attendees
        for event in events:
            attendees_response = supabase.table("event_attendees")\
                .select("*")\
                .eq("event_id", event["id"])\
                .execute()
            event["attendees"] = attendees_response.data
        
        # Log event retrieval
        logger.info(f"Retrieved {len(events)} events for client {client_id}")
        
        return {
            "events": events,
            "total": len(events)
        }
    except Exception as e:
        logger.error(f"Failed to retrieve events for client {client_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/events/{event_id}")
async def delete_event(event_id: str):
    """
    Deletes a calendar event.
    """
    try:
        # Initialize Supabase client
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        supabase = create_client(supabase_url, supabase_key)
        
        # Check if event exists
        event_response = supabase.table("calendar_events")\
            .select("*")\
            .eq("id", event_id)\
            .single()\
            .execute()
            
        if not event_response.data:
            raise HTTPException(status_code=404, detail="Event not found")
        
        # Delete attendees first (foreign key constraint)
        supabase.table("event_attendees")\
            .delete()\
            .eq("event_id", event_id)\
            .execute()
        
        # Delete the event
        supabase.table("calendar_events")\
            .delete()\
            .eq("id", event_id)\
            .execute()
        
        # Log event deletion
        logger.info(f"Deleted calendar event {event_id}")
        
        return {
            "status": "deleted",
            "event_id": event_id,
            "deleted_at": datetime.now().isoformat()
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Failed to delete event {event_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/events/{event_id}")
async def update_event(event_id: str, event: EventCreate):
    """
    Updates an existing calendar event.
    """
    try:
        # Initialize Supabase client
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        supabase = create_client(supabase_url, supabase_key)
        
        # Check if event exists
        event_response = supabase.table("calendar_events")\
            .select("*")\
            .eq("id", event_id)\
            .single()\
            .execute()
            
        if not event_response.data:
            raise HTTPException(status_code=404, detail="Event not found")
        
        # Prepare event data for update
        event_data = {
            "type": event.type,
            "title": event.title,
            "description": event.description,
            "start_time": event.start_time.isoformat(),
            "end_time": event.end_time.isoformat(),
            "timezone": event.timezone,
            "priority": event.priority,
            "client_id": event.client_id,
            "project_id": event.project_id,
            "location": event.location,
            "updated_at": datetime.now().isoformat(),
            "metadata": event.metadata
        }
        
        # Add recurrence data if provided
        if event.recurrence:
            event_data["recurrence"] = {
                "frequency": event.recurrence.frequency,
                "interval": event.recurrence.interval,
                "until": event.recurrence.until.isoformat() if event.recurrence.until else None,
                "count": event.recurrence.count
            }
        
        # Update event in database
        supabase.table("calendar_events")\
            .update(event_data)\
            .eq("id", event_id)\
            .execute()
        
        # Process attendees - first delete existing attendees
        supabase.table("event_attendees")\
            .delete()\
            .eq("event_id", event_id)\
            .execute()
        
        # Then add new attendees
        attendees_data = []
        for attendee in event.attendees:
            attendees_data.append({
                "id": attendee.id,
                "email": attendee.email,
                "role": attendee.role,
                "response_status": attendee.response_status,
                "event_id": event_id
            })
        
        if attendees_data:
            supabase.table("event_attendees").insert(attendees_data).execute()
        
        # Log event update
        logger.info(f"Updated calendar event {event_id}: {event.title}")
        
        # Return updated event details
        return {
            "id": event_id,
            "status": "updated",
            "updated_at": datetime.now().isoformat(),
            **event.dict()
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Failed to update event {event_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/events/{event_id}/attendees")
async def get_event_attendees(event_id: str):
    """
    Retrieves attendees for a specific event.
    """
    try:
        # Initialize Supabase client
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        supabase = create_client(supabase_url, supabase_key)
        
        # Check if event exists
        event_response = supabase.table("calendar_events")\
            .select("*")\
            .eq("id", event_id)\
            .single()\
            .execute()
            
        if not event_response.data:
            raise HTTPException(status_code=404, detail="Event not found")
        
        # Fetch attendees
        attendees_response = supabase.table("event_attendees")\
            .select("*")\
            .eq("event_id", event_id)\
            .execute()
        
        attendees = attendees_response.data
        
        # Log attendee retrieval
        logger.info(f"Retrieved {len(attendees)} attendees for event {event_id}")
        
        return {
            "event_id": event_id,
            "event_title": event_response.data.get("title"),
            "attendees": attendees
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Failed to retrieve attendees for event {event_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/events/{event_id}/reschedule")
async def reschedule_event(
    event_id: str,
    new_start_time: datetime,
    new_end_time: datetime
):
    """
    Reschedules an existing event.
    """
    try:
        # Initialize Supabase client
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        supabase = create_client(supabase_url, supabase_key)
        
        # Check if event exists
        event_response = supabase.table("calendar_events")\
            .select("*")\
            .eq("id", event_id)\
            .single()\
            .execute()
            
        if not event_response.data:
            raise HTTPException(status_code=404, detail="Event not found")
        
        event_data = event_response.data
        old_start_time = event_data.get("start_time")
        old_end_time = event_data.get("end_time")
        
        # Validate new times
        if new_start_time >= new_end_time:
            raise HTTPException(
                status_code=400, 
                detail="New start time must be before new end time"
            )
        
        # Update event with new times
        update_data = {
            "start_time": new_start_time.isoformat(),
            "end_time": new_end_time.isoformat(),
            "status": EventStatus.RESCHEDULED,
            "updated_at": datetime.now().isoformat(),
            "rescheduling_history": event_data.get("rescheduling_history", []) + [{
                "old_start_time": old_start_time,
                "old_end_time": old_end_time,
                "new_start_time": new_start_time.isoformat(),
                "new_end_time": new_end_time.isoformat(),
                "rescheduled_at": datetime.now().isoformat()
            }]
        }
        
        # Update the event in database
        supabase.table("calendar_events")\
            .update(update_data)\
            .eq("id", event_id)\
            .execute()
        
        # Log event rescheduling
        logger.info(f"Rescheduled event {event_id} from {old_start_time} to {new_start_time.isoformat()}")
        
        # Notify attendees about the reschedule (in a real system)
        # For now, we'll just log it
        logger.info(f"Notification would be sent to attendees about event {event_id} reschedule")
        
        return {
            "event_id": event_id,
            "status": "rescheduled",
            "old_start_time": old_start_time,
            "old_end_time": old_end_time,
            "new_start_time": new_start_time.isoformat(),
            "new_end_time": new_end_time.isoformat(),
            "rescheduled_at": datetime.now().isoformat()
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Failed to reschedule event {event_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/availability/{user_id}")
async def get_user_availability(
    user_id: str,
    start_date: datetime,
    end_date: datetime
):
    """
    Retrieves available time slots for a user.
    """
    try:
        # Initialize Supabase client
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        supabase = create_client(supabase_url, supabase_key)
        
        # Validate date range
        if start_date >= end_date:
            raise HTTPException(
                status_code=400,
                detail="Start date must be before end date"
            )
        
        # Fetch user's events within the date range
        # First, get events where the user is the organizer
        events_response = supabase.table("calendar_events")\
            .select("*")\
            .gte("start_time", start_date.isoformat())\
            .lte("end_time", end_date.isoformat())\
            .execute()
            
        # Then, get events where the user is an attendee
        attendee_events_response = supabase.table("event_attendees")\
            .select("event_id")\
            .eq("id", user_id)\
            .execute()
            
        attendee_event_ids = [item["event_id"] for item in attendee_events_response.data]
        
        if attendee_event_ids:
            attendee_events = supabase.table("calendar_events")\
                .select("*")\
                .in_("id", attendee_event_ids)\
                .gte("start_time", start_date.isoformat())\
                .lte("end_time", end_date.isoformat())\
                .execute()
                
            # Combine all events
            all_events = events_response.data + attendee_events.data
        else:
            all_events = events_response.data
        
        # Sort events by start time
        all_events.sort(key=lambda x: x["start_time"])
        
        # Define working hours (9 AM to 5 PM by default)
        working_start_hour = 9  # 9 AM
        working_end_hour = 17   # 5 PM
        
        # Calculate available slots
        available_slots = []
        current_date = start_date.replace(hour=working_start_hour, minute=0, second=0, microsecond=0)
        end_date_workday = end_date.replace(hour=working_end_hour, minute=0, second=0, microsecond=0)
        
        while current_date < end_date_workday:
            # Skip weekends (Saturday=5, Sunday=6)
            if current_date.weekday() >= 5:
                current_date = (current_date + timedelta(days=1)).replace(hour=working_start_hour, minute=0, second=0, microsecond=0)
                continue
                
            day_end = current_date.replace(hour=working_end_hour, minute=0, second=0, microsecond=0)
            
            # Find busy slots for this day
            busy_slots = []
            for event in all_events:
                event_start = datetime.fromisoformat(event["start_time"].replace("Z", "+00:00"))
                event_end = datetime.fromisoformat(event["end_time"].replace("Z", "+00:00"))
                
                # Check if event is on the current day
                if (event_start.date() == current_date.date() or event_end.date() == current_date.date()):
                    # Adjust event times to working hours if needed
                    if event_start < current_date:
                        event_start = current_date
                    if event_end > day_end:
                        event_end = day_end
                        
                    busy_slots.append((event_start, event_end))
            
            # Sort busy slots by start time
            busy_slots.sort()
            
            # Merge overlapping busy slots
            merged_busy_slots = []
            for slot in busy_slots:
                if not merged_busy_slots or slot[0] > merged_busy_slots[-1][1]:
                    merged_busy_slots.append(slot)
                else:
                    merged_busy_slots[-1] = (merged_busy_slots[-1][0], max(merged_busy_slots[-1][1], slot[1]))
            
            # Calculate free slots
            free_start = current_date
            for busy_start, busy_end in merged_busy_slots:
                if free_start < busy_start:
                    available_slots.append({
                        "start_time": free_start.isoformat(),
                        "end_time": busy_start.isoformat(),
                        "duration_minutes": int((busy_start - free_start).total_seconds() / 60)
                    })
                free_start = busy_end
                
            # Add the last free slot of the day if any
            if free_start < day_end:
                available_slots.append({
                    "start_time": free_start.isoformat(),
                    "end_time": day_end.isoformat(),
                    "duration_minutes": int((day_end - free_start).total_seconds() / 60)
                })
                
            # Move to next day
            current_date = (current_date + timedelta(days=1)).replace(hour=working_start_hour, minute=0, second=0, microsecond=0)
        
        # Filter out slots that are too short (less than 30 minutes)
        available_slots = [slot for slot in available_slots if slot["duration_minutes"] >= 30]
        
        # Log availability calculation
        logger.info(f"Calculated {len(available_slots)} available slots for user {user_id}")
        
        return {
            "user_id": user_id,
            "date_range": {
                "start": start_date.isoformat(),
                "end": end_date.isoformat()
            },
            "available_slots": available_slots
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Failed to calculate availability for user {user_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
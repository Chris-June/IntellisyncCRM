"""
Calendar operations tool for managing events and schedules.
"""

from typing import Dict, Any, List, Optional
import logging
from datetime import datetime, timedelta
import uuid
from ..base import Tool, ToolResult, ToolStatus, ToolError

logger = logging.getLogger(__name__)


class CalendarOperationsTool(Tool):
    """
    Tool for managing calendar events and finding available times.
    
    Capabilities:
    - Create and schedule events
    - Find available time slots
    - Check scheduling conflicts
    - Manage event reminders
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        """
        Initialize the calendar operations tool.
        
        Args:
            config: Optional configuration dictionary with settings:
                - default_duration: Default event duration in minutes
                - business_hours: Dictionary defining business hours by day
                - timezone: Default timezone for operations
        """
        super().__init__(config)
        self.default_duration = config.get("default_duration", 60)  # minutes
        self.timezone = config.get("timezone", "UTC")
        
        # Set default business hours if not provided
        self.business_hours = config.get("business_hours", {
            "monday": {"start": "09:00", "end": "17:00"},
            "tuesday": {"start": "09:00", "end": "17:00"},
            "wednesday": {"start": "09:00", "end": "17:00"},
            "thursday": {"start": "09:00", "end": "17:00"},
            "friday": {"start": "09:00", "end": "17:00"},
            "saturday": None,  # No business hours
            "sunday": None     # No business hours
        })
        
        # In-memory event storage for demonstration
        # In a real implementation, this would use a database or calendar API
        self._events: Dict[str, Dict[str, Any]] = {}
        
        logger.info(f"Initialized CalendarOperationsTool with timezone {self.timezone}")
    
    async def execute(self, input_data: Dict[str, Any]) -> ToolResult:
        """
        Execute a calendar operation.
        
        Args:
            input_data: Dictionary containing:
                - operation: Operation to perform (create_event, find_availability, check_conflicts)
                - parameters: Operation-specific parameters
                
        Returns:
            ToolResult: Result of the calendar operation
        """
        try:
            # Extract operation
            operation = input_data.get("operation")
            parameters = input_data.get("parameters", {})
            
            if not operation:
                raise ToolError("No calendar operation specified", code="MISSING_OPERATION")
            
            # Execute appropriate operation
            if operation == "create_event":
                result = self._create_event(parameters)
            elif operation == "find_availability":
                result = self._find_availability(parameters)
            elif operation == "check_conflicts":
                result = self._check_conflicts(parameters)
            elif operation == "get_event":
                result = self._get_event(parameters)
            elif operation == "update_event":
                result = self._update_event(parameters)
            elif operation == "delete_event":
                result = self._delete_event(parameters)
            else:
                raise ToolError(
                    f"Unknown calendar operation: {operation}",
                    code="UNKNOWN_OPERATION",
                    details={"supported_operations": [
                        "create_event", "find_availability", "check_conflicts",
                        "get_event", "update_event", "delete_event"
                    ]}
                )
            
            # Return successful result
            return ToolResult(
                status=ToolStatus.SUCCESS,
                data=result,
                metadata={
                    "operation": operation,
                    "timestamp": datetime.now().isoformat()
                }
            )
            
        except ToolError as e:
            # Re-raise tool errors
            raise e
            
        except Exception as e:
            # Wrap other exceptions
            logger.exception(f"Error in CalendarOperationsTool: {str(e)}")
            raise ToolError(
                f"Failed to perform calendar operation: {str(e)}",
                code="CALENDAR_OPERATION_ERROR",
                details={"error_type": type(e).__name__}
            )
    
    async def validate_input(self, input_data: Dict[str, Any]) -> bool:
        """
        Validate that the input meets the tool's requirements.
        
        Args:
            input_data: Input data to validate
            
        Returns:
            bool: True if input is valid, False otherwise
        """
        # Operation is required
        if "operation" not in input_data:
            return False
            
        # Parameters must be a dictionary if provided
        if "parameters" in input_data and not isinstance(input_data["parameters"], dict):
            return False
        
        # Validate based on operation
        operation = input_data.get("operation")
        parameters = input_data.get("parameters", {})
        
        if operation == "create_event":
            # Title and start_time are required for event creation
            if "title" not in parameters or "start_time" not in parameters:
                return False
                
        elif operation == "find_availability":
            # Start_date and end_date are required for availability
            if "start_date" not in parameters or "end_date" not in parameters:
                return False
                
        elif operation == "check_conflicts":
            # Start_time and end_time are required for conflict checking
            if "start_time" not in parameters or "end_time" not in parameters:
                return False
                
        elif operation == "get_event" or operation == "delete_event":
            # Event ID is required for get and delete operations
            if "event_id" not in parameters:
                return False
                
        elif operation == "update_event":
            # Event ID is required for update operations
            if "event_id" not in parameters:
                return False
        
        return True
    
    def get_capabilities(self) -> Dict[str, Any]:
        """
        Return the tool's capabilities and metadata.
        
        Returns:
            Dict[str, Any]: Tool capabilities and metadata
        """
        return {
            "description": "Manages calendar events and scheduling operations",
            "operations": {
                "create_event": "Create a new calendar event",
                "find_availability": "Find available time slots",
                "check_conflicts": "Check for scheduling conflicts",
                "get_event": "Retrieve event details",
                "update_event": "Update an existing event",
                "delete_event": "Delete a calendar event"
            },
            "input_schema": {
                "operation": "Operation to perform",
                "parameters": "Operation-specific parameters"
            },
            "operation_parameters": {
                "create_event": {
                    "title": "Event title",
                    "description": "Event description",
                    "start_time": "Event start time (ISO format)",
                    "end_time": "Event end time (ISO format)",
                    "duration": "Event duration in minutes (alternative to end_time)",
                    "attendees": "List of attendee emails",
                    "location": "Event location",
                    "reminder": "Reminder time in minutes before event"
                },
                "find_availability": {
                    "start_date": "Start date for availability search (ISO format)",
                    "end_date": "End date for availability search (ISO format)",
                    "duration": "Desired meeting duration in minutes",
                    "participants": "List of participant emails to check availability",
                    "business_hours_only": "Whether to restrict to business hours"
                },
                "check_conflicts": {
                    "start_time": "Start time to check (ISO format)",
                    "end_time": "End time to check (ISO format)",
                    "attendees": "List of attendee emails to check conflicts"
                },
                "get_event": {
                    "event_id": "ID of the event to retrieve"
                },
                "update_event": {
                    "event_id": "ID of the event to update",
                    "title": "Updated event title",
                    "description": "Updated event description",
                    "start_time": "Updated start time",
                    "end_time": "Updated end time",
                    "attendees": "Updated list of attendees",
                    "location": "Updated location"
                },
                "delete_event": {
                    "event_id": "ID of the event to delete"
                }
            },
            "settings": {
                "timezone": self.timezone,
                "default_duration": self.default_duration,
                "business_hours": self.business_hours
            }
        }
    
    def _create_event(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a new calendar event.
        
        Args:
            parameters: Dictionary containing event details
            
        Returns:
            Dict[str, Any]: Created event details
        """
        # Extract parameters
        title = parameters.get("title")
        description = parameters.get("description", "")
        start_time_str = parameters.get("start_time")
        end_time_str = parameters.get("end_time")
        duration = parameters.get("duration", self.default_duration)
        attendees = parameters.get("attendees", [])
        location = parameters.get("location", "")
        reminder = parameters.get("reminder", 15)  # minutes before
        
        if not title:
            raise ToolError("Event title is required", code="MISSING_TITLE")
            
        if not start_time_str:
            raise ToolError("Event start time is required", code="MISSING_START_TIME")
        
        # Parse start time
        try:
            start_time = datetime.fromisoformat(start_time_str)
        except ValueError:
            raise ToolError(
                "Invalid start time format, expected ISO format",
                code="INVALID_TIME_FORMAT"
            )
        
        # Calculate end time if not provided
        if end_time_str:
            try:
                end_time = datetime.fromisoformat(end_time_str)
            except ValueError:
                raise ToolError(
                    "Invalid end time format, expected ISO format",
                    code="INVALID_TIME_FORMAT"
                )
        else:
            end_time = start_time + timedelta(minutes=duration)
        
        # Check for conflicts
        conflicts = self._find_conflicts(start_time, end_time, attendees)
        
        # Generate event ID
        event_id = str(uuid.uuid4())
        
        # Create event
        event = {
            "id": event_id,
            "title": title,
            "description": description,
            "start_time": start_time.isoformat(),
            "end_time": end_time.isoformat(),
            "duration": int((end_time - start_time).total_seconds() / 60),
            "attendees": attendees,
            "location": location,
            "reminder": reminder,
            "created_at": datetime.now().isoformat(),
            "status": "confirmed"
        }
        
        # Store event
        self._events[event_id] = event
        
        # Add conflicts information to the response
        event["conflicts"] = conflicts
        
        return event
    
    def _find_availability(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Find available time slots within a date range.
        
        Args:
            parameters: Dictionary containing search parameters
            
        Returns:
            Dict[str, Any]: Available time slots
        """
        # Extract parameters
        start_date_str = parameters.get("start_date")
        end_date_str = parameters.get("end_date")
        duration = parameters.get("duration", self.default_duration)
        participants = parameters.get("participants", [])
        business_hours_only = parameters.get("business_hours_only", True)
        
        if not start_date_str or not end_date_str:
            raise ToolError(
                "Start date and end date are required",
                code="MISSING_DATE_RANGE"
            )
        
        # Parse dates
        try:
            start_date = datetime.fromisoformat(start_date_str)
            end_date = datetime.fromisoformat(end_date_str)
        except ValueError:
            raise ToolError(
                "Invalid date format, expected ISO format",
                code="INVALID_DATE_FORMAT"
            )
        
        # Ensure start is before end
        if start_date >= end_date:
            raise ToolError(
                "Start date must be before end date",
                code="INVALID_DATE_RANGE"
            )
        
        # For this simplified implementation, we'll generate some available slots
        # In a real implementation, this would check against actual calendars
        
        available_slots = []
        current_date = start_date
        
        # Generate slots for each day in the range
        while current_date < end_date:
            day_name = current_date.strftime("%A").lower()
            
            # Skip if not a business day and business_hours_only is True
            if business_hours_only and self.business_hours.get(day_name) is None:
                current_date += timedelta(days=1)
                continue
            
            # Get business hours for the day
            hours = self.business_hours.get(day_name)
            
            if hours:
                start_hour, start_minute = map(int, hours["start"].split(":"))
                end_hour, end_minute = map(int, hours["end"].split(":"))
                
                # Start time for this day
                slot_start = current_date.replace(
                    hour=start_hour,
                    minute=start_minute,
                    second=0,
                    microsecond=0
                )
                
                # End time for this day
                day_end = current_date.replace(
                    hour=end_hour,
                    minute=end_minute,
                    second=0,
                    microsecond=0
                )
                
                # Generate 30-minute slots
                while slot_start + timedelta(minutes=duration) <= day_end:
                    slot_end = slot_start + timedelta(minutes=duration)
                    
                    # Check for conflicts with existing events
                    if not self._find_conflicts(slot_start, slot_end, participants):
                        available_slots.append({
                            "start": slot_start.isoformat(),
                            "end": slot_end.isoformat(),
                            "duration": duration
                        })
                    
                    # Move to next slot
                    slot_start += timedelta(minutes=30)
            
            # Move to next day
            current_date += timedelta(days=1)
        
        return {
            "available_slots": available_slots,
            "parameters": {
                "start_date": start_date_str,
                "end_date": end_date_str,
                "duration": duration,
                "participants": participants,
                "business_hours_only": business_hours_only
            }
        }
    
    def _check_conflicts(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Check for scheduling conflicts in a time range.
        
        Args:
            parameters: Dictionary containing check parameters
            
        Returns:
            Dict[str, Any]: Conflicts found
        """
        # Extract parameters
        start_time_str = parameters.get("start_time")
        end_time_str = parameters.get("end_time")
        attendees = parameters.get("attendees", [])
        
        if not start_time_str or not end_time_str:
            raise ToolError(
                "Start time and end time are required",
                code="MISSING_TIME_RANGE"
            )
        
        # Parse times
        try:
            start_time = datetime.fromisoformat(start_time_str)
            end_time = datetime.fromisoformat(end_time_str)
        except ValueError:
            raise ToolError(
                "Invalid time format, expected ISO format",
                code="INVALID_TIME_FORMAT"
            )
        
        # Find conflicts
        conflicts = self._find_conflicts(start_time, end_time, attendees)
        
        return {
            "has_conflicts": bool(conflicts),
            "conflicts": conflicts,
            "parameters": {
                "start_time": start_time_str,
                "end_time": end_time_str,
                "attendees": attendees
            }
        }
    
    def _get_event(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Retrieve event details.
        
        Args:
            parameters: Dictionary containing event_id
            
        Returns:
            Dict[str, Any]: Event details
        """
        # Extract parameters
        event_id = parameters.get("event_id")
        
        if not event_id:
            raise ToolError("Event ID is required", code="MISSING_EVENT_ID")
        
        # Find event
        event = self._events.get(event_id)
        
        if not event:
            raise ToolError(
                f"Event with ID {event_id} not found",
                code="EVENT_NOT_FOUND"
            )
        
        return event
    
    def _update_event(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update an existing event.
        
        Args:
            parameters: Dictionary containing event updates
            
        Returns:
            Dict[str, Any]: Updated event details
        """
        # Extract parameters
        event_id = parameters.get("event_id")
        
        if not event_id:
            raise ToolError("Event ID is required", code="MISSING_EVENT_ID")
        
        # Find event
        event = self._events.get(event_id)
        
        if not event:
            raise ToolError(
                f"Event with ID {event_id} not found",
                code="EVENT_NOT_FOUND"
            )
        
        # Update fields
        updateable_fields = [
            "title", "description", "start_time", "end_time",
            "attendees", "location", "reminder", "status"
        ]
        
        for field in updateable_fields:
            if field in parameters:
                event[field] = parameters[field]
        
        # Update duration if start_time or end_time changed
        if "start_time" in parameters or "end_time" in parameters:
            try:
                start_time = datetime.fromisoformat(event["start_time"])
                end_time = datetime.fromisoformat(event["end_time"])
                event["duration"] = int((end_time - start_time).total_seconds() / 60)
            except ValueError:
                raise ToolError(
                    "Invalid time format in update, expected ISO format",
                    code="INVALID_TIME_FORMAT"
                )
        
        # Add updated timestamp
        event["updated_at"] = datetime.now().isoformat()
        
        # Store updated event
        self._events[event_id] = event
        
        return event
    
    def _delete_event(self, parameters: Dict[str, Any]) -> Dict[str, Any]:
        """
        Delete a calendar event.
        
        Args:
            parameters: Dictionary containing event_id
            
        Returns:
            Dict[str, Any]: Deletion result
        """
        # Extract parameters
        event_id = parameters.get("event_id")
        
        if not event_id:
            raise ToolError("Event ID is required", code="MISSING_EVENT_ID")
        
        # Find event
        if event_id not in self._events:
            raise ToolError(
                f"Event with ID {event_id} not found",
                code="EVENT_NOT_FOUND"
            )
        
        # Store event details before deletion
        event = self._events[event_id].copy()
        
        # Delete event
        del self._events[event_id]
        
        return {
            "deleted": True,
            "event_id": event_id,
            "event": event,
            "deleted_at": datetime.now().isoformat()
        }
    
    def _find_conflicts(
        self,
        start_time: datetime,
        end_time: datetime,
        attendees: List[str]
    ) -> List[Dict[str, Any]]:
        """
        Find conflicts with existing events.
        
        Args:
            start_time: Start time to check
            end_time: End time to check
            attendees: List of attendees to check
            
        Returns:
            List[Dict[str, Any]]: List of conflicting events
        """
        conflicts = []
        
        # Check each event for conflicts
        for event_id, event in self._events.items():
            event_start = datetime.fromisoformat(event["start_time"])
            event_end = datetime.fromisoformat(event["end_time"])
            event_attendees = event["attendees"]
            
            # Check for time overlap
            time_overlap = (
                (start_time <= event_start < end_time) or
                (start_time < event_end <= end_time) or
                (event_start <= start_time and event_end >= end_time)
            )
            
            # Check for attendee overlap
            attendee_overlap = any(
                attendee in event_attendees for attendee in attendees
            ) if attendees else False
            
            # If both time and attendee overlap, it's a conflict
            if time_overlap and attendee_overlap:
                conflicts.append({
                    "event_id": event_id,
                    "title": event["title"],
                    "start_time": event["start_time"],
                    "end_time": event["end_time"],
                    "attendees": event["attendees"]
                })
        
        return conflicts
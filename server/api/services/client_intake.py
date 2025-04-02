from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
import uuid
import logging
import os
import json
from supabase import create_client
from openai import OpenAIClient

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/intake", tags=["client-intake"])

class IntakeSession(BaseModel):
    client_id: str
    responses: Dict[str, Any]

class IntakeResponse(BaseModel):
    session_id: str
    status: str
    summary: Optional[str] = None

@router.post("/start")
async def start_intake(session: IntakeSession) -> IntakeResponse:
    try:
        # Validate input
        if not session.client_id:
            raise HTTPException(status_code=400, detail="Client ID is required")
        
        # Initialize Supabase client
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        supabase = create_client(supabase_url, supabase_key)
        
        # Check if client exists
        client_response = supabase.table("clients")\
            .select("id")\
            .eq("id", session.client_id)\
            .execute()
            
        if not client_response.data:
            raise HTTPException(status_code=404, detail="Client not found")
        
        # Generate a unique session ID
        session_id = f"intake-{uuid.uuid4().hex[:8]}"
        
        # Create a new intake session
        session_data = {
            "session_id": session_id,
            "client_id": session.client_id,
            "responses": session.responses,
            "status": "in_progress",
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        # Store the session in Supabase
        supabase.table("intake_sessions").insert(session_data).execute()
        
        # Log the session creation
        logger.info(f"Created intake session {session_id} for client {session.client_id}")
        
        return IntakeResponse(
            session_id=session_id,
            status="in_progress"
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Failed to create intake session: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/update/{session_id}")
async def update_intake(session_id: str, responses: Dict[str, Any]) -> IntakeResponse:
    try:
        # Initialize Supabase client
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        supabase = create_client(supabase_url, supabase_key)
        
        # Check if session exists
        session_response = supabase.table("intake_sessions")\
            .select("*")\
            .eq("session_id", session_id)\
            .single()\
            .execute()
            
        if not session_response.data:
            raise HTTPException(status_code=404, detail="Intake session not found")
            
        # Get the existing session data
        existing_session = session_response.data
        existing_responses = existing_session.get("responses", {})
        
        # Merge the existing responses with the new ones
        merged_responses = {**existing_responses, **responses}
        
        # Update the session with the new responses
        update_data = {
            "responses": merged_responses,
            "updated_at": datetime.now().isoformat()
        }
        
        # If all required questions are answered, update status to completed
        required_questions = ["company_name", "contact_name", "project_type", "budget_range"]
        all_required_answered = all(q in merged_responses for q in required_questions)
        
        if all_required_answered:
            update_data["status"] = "completed"
        
        # Update the session in Supabase
        supabase.table("intake_sessions")\
            .update(update_data)\
            .eq("session_id", session_id)\
            .execute()
            
        # Log the session update
        logger.info(f"Updated intake session {session_id} with new responses")
        
        return IntakeResponse(
            session_id=session_id,
            status=update_data.get("status", existing_session.get("status", "in_progress"))
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Failed to update intake session {session_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{client_id}")
async def get_intake_summary(client_id: str) -> IntakeResponse:
    try:
        # Initialize Supabase client
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        supabase = create_client(supabase_url, supabase_key)
        
        # Get the most recent completed intake session for this client
        session_response = supabase.table("intake_sessions")\
            .select("*")\
            .eq("client_id", client_id)\
            .eq("status", "completed")\
            .order("updated_at", desc=True)\
            .limit(1)\
            .execute()
            
        if not session_response.data or len(session_response.data) == 0:
            raise HTTPException(status_code=404, detail="No completed intake sessions found for this client")
            
        session_data = session_response.data[0]
        responses = session_data.get("responses", {})
        
        # Generate a summary using OpenAI
        openai_client = OpenAIClient()
        
        prompt = f"""Generate a concise summary of the following client intake information:
        
        Company: {responses.get('company_name', 'Not provided')}
        Contact: {responses.get('contact_name', 'Not provided')}
        Project Type: {responses.get('project_type', 'Not provided')}
        Budget Range: {responses.get('budget_range', 'Not provided')}
        Timeline: {responses.get('timeline', 'Not provided')}
        Goals: {responses.get('goals', 'Not provided')}
        Challenges: {responses.get('challenges', 'Not provided')}
        Previous Experience: {responses.get('previous_experience', 'Not provided')}
        
        Format the summary as a concise paragraph that highlights the key points about the client and their needs.
        """
        
        summary_response = await openai_client.chat_completion(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=300,
            temperature=0.7
        )
        
        summary = summary_response.choices[0].message.content.strip()
        
        # Update the session with the generated summary
        supabase.table("intake_sessions")\
            .update({"summary": summary})\
            .eq("session_id", session_data.get("session_id"))\
            .execute()
            
        return IntakeResponse(
            session_id=session_data.get("session_id"),
            status=session_data.get("status"),
            summary=summary
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Failed to retrieve intake summary for client {client_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
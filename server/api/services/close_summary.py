from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

router = APIRouter(prefix="/close-summary", tags=["close-summary"])

class ProjectStatus(str, Enum):
    COMPLETED = "completed"
    TERMINATED = "terminated"
    ON_HOLD = "on_hold"

class CloseReason(str, Enum):
    SUCCESSFUL = "successful"
    CLIENT_REQUEST = "client_request"
    SCOPE_CHANGE = "scope_change"
    BUDGET_CONSTRAINTS = "budget_constraints"
    OTHER = "other"

class MetricScore(str, Enum):
    EXCEEDED = "exceeded"
    MET = "met"
    PARTIALLY_MET = "partially_met"
    NOT_MET = "not_met"

class LessonCategory(str, Enum):
    PROCESS = "process"
    TECHNICAL = "technical"
    COMMUNICATION = "communication"
    RESOURCE = "resource"
    CLIENT = "client"

class DeliverableStatus(BaseModel):
    id: str
    name: str
    status: str
    delivery_date: Optional[datetime]
    acceptance_date: Optional[datetime]
    notes: Optional[str]

class ProjectMetric(BaseModel):
    name: str
    target: str
    actual: str
    score: MetricScore
    notes: Optional[str]

class LessonLearned(BaseModel):
    category: LessonCategory
    description: str
    impact: str
    recommendation: str

class SummaryRequest(BaseModel):
    project_id: str
    client_id: str
    status: ProjectStatus
    close_reason: CloseReason
    close_date: datetime
    additional_notes: Optional[str] = None

class SummaryResponse(BaseModel):
    summary_id: str
    project_id: str
    client_id: str
    generated_at: datetime
    content: Dict[str, Any]

@router.post("/summarize", response_model=SummaryResponse)
async def generate_close_summary(request: SummaryRequest):
    """
    Generate a close-out summary for a completed project.
    """
    try:
        # Initialize OpenAI client for AI-driven summary generation
        openai_client = OpenAIClient()
        
        # Fetch project data from database
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        supabase = create_client(supabase_url, supabase_key)
        
        # Fetch project details
        project_response = supabase.table("projects")\
            .select("*, client_id, start_date, name, description")\
            .eq("id", request.project_id)\
            .single()\
            .execute()
            
        if not project_response.data:
            raise HTTPException(status_code=404, detail="Project not found")
            
        project = project_response.data
        
        # Fetch deliverables
        deliverables_response = supabase.table("deliverables")\
            .select("*")\
            .eq("project_id", request.project_id)\
            .execute()
            
        deliverables = deliverables_response.data or []
        
        # Fetch metrics
        metrics_response = supabase.table("project_metrics")\
            .select("*")\
            .eq("project_id", request.project_id)\
            .execute()
            
        metrics = metrics_response.data or []
        
        # Generate AI-driven lessons learned
        prompt = f"""Generate lessons learned for the following project:
        Project Name: {project.get('name')}
        Description: {project.get('description')}
        Status: {request.status}
        Close Reason: {request.close_reason}
        
        Format the response as a JSON array with the following structure for each lesson:
        [{{
            "category": "<category>",  // One of: process, technical, communication, resource, client
            "description": "<description>",
            "impact": "<impact>",
            "recommendation": "<recommendation>"
        }}]
        """
        
        lessons_response = await openai_client.chat_completion(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1000,
            temperature=0.7
        )
        
        # Parse the lessons learned from the AI response
        lessons_text = lessons_response.choices[0].message.content
        lessons_learned = parse_lessons_learned(lessons_text)
        
        # Generate next steps recommendations
        next_steps_prompt = f"""Based on the following project closure information, recommend 3-5 next steps:
        Project Name: {project.get('name')}
        Status: {request.status}
        Close Reason: {request.close_reason}
        Additional Notes: {request.additional_notes or 'None provided'}
        
        Format the response as a JSON array of strings.
        """
        
        next_steps_response = await openai_client.chat_completion(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": next_steps_prompt}],
            max_tokens=500,
            temperature=0.7
        )
        
        # Parse the next steps from the AI response
        next_steps_text = next_steps_response.choices[0].message.content
        next_steps = parse_next_steps(next_steps_text)
        
        # Create the summary content
        summary_content = {
            "project_overview": {
                "name": project.get('name'),
                "description": project.get('description'),
                "duration": calculate_duration(project.get('start_date'), request.close_date),
                "start_date": project.get('start_date'),
                "end_date": request.close_date.isoformat(),
                "status": request.status,
                "close_reason": request.close_reason,
                "additional_notes": request.additional_notes
            },
            "deliverables": format_deliverables(deliverables),
            "metrics": format_metrics(metrics),
            "lessons_learned": lessons_learned,
            "next_steps": next_steps
        }
        
        # Generate a unique summary ID
        summary_id = f"summary-{uuid.uuid4().hex[:8]}"
        
        # Store the summary in the database
        summary_data = {
            "summary_id": summary_id,
            "project_id": request.project_id,
            "client_id": request.client_id,
            "generated_at": datetime.now().isoformat(),
            "status": request.status,
            "close_reason": request.close_reason,
            "content": summary_content
        }
        
        supabase.table("project_summaries").insert(summary_data).execute()
        
        return SummaryResponse(
            summary_id=summary_id,
            project_id=request.project_id,
            client_id=request.client_id,
            generated_at=datetime.now(),
            content=summary_content
        )
        
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Summary generation failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate summary: {str(e)}")

def parse_lessons_learned(lessons_text: str) -> List[Dict[str, str]]:
    """Parse lessons learned from AI-generated text"""
    try:
        # Extract JSON array from the text if needed
        if "[" in lessons_text and "]" in lessons_text:
            start_idx = lessons_text.find("[")
            end_idx = lessons_text.rfind("]") + 1
            lessons_text = lessons_text[start_idx:end_idx]
            
        lessons = json.loads(lessons_text)
        return lessons
    except Exception as e:
        logger.error(f"Failed to parse lessons learned: {str(e)}")
        return [
            {
                "category": "process",
                "description": "Unable to parse AI-generated lessons",
                "impact": "N/A",
                "recommendation": "Please review project documentation manually"
            }
        ]

def parse_next_steps(next_steps_text: str) -> List[str]:
    """Parse next steps from AI-generated text"""
    try:
        # Extract JSON array from the text if needed
        if "[" in next_steps_text and "]" in next_steps_text:
            start_idx = next_steps_text.find("[")
            end_idx = next_steps_text.rfind("]") + 1
            next_steps_text = next_steps_text[start_idx:end_idx]
            
        next_steps = json.loads(next_steps_text)
        return next_steps
    except Exception as e:
        logger.error(f"Failed to parse next steps: {str(e)}")
        return [
            "Schedule follow-up meeting to discuss project outcomes",
            "Document lessons learned for future reference",
            "Consider opportunities for continued engagement"
        ]

def calculate_duration(start_date_str: str, end_date: datetime) -> str:
    """Calculate project duration in months and days"""
    try:
        start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
        delta = end_date - start_date
        
        months = delta.days // 30
        days = delta.days % 30
        
        if months > 0 and days > 0:
            return f"{months} month{'s' if months > 1 else ''} and {days} day{'s' if days > 1 else ''}"
        elif months > 0:
            return f"{months} month{'s' if months > 1 else ''}"
        else:
            return f"{delta.days} day{'s' if delta.days > 1 else ''}"
    except Exception as e:
        logger.error(f"Failed to calculate duration: {str(e)}")
        return "Unknown duration"

def format_deliverables(deliverables: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Format deliverables for the summary"""
    formatted = []
    for d in deliverables:
        formatted.append({
            "id": d.get("id"),
            "name": d.get("name"),
            "status": d.get("status"),
            "delivery_date": d.get("delivery_date"),
            "acceptance_date": d.get("acceptance_date"),
            "notes": d.get("notes")
        })
    return formatted

def format_metrics(metrics: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Format metrics for the summary"""
    formatted = []
    for m in metrics:
        # Determine score based on target and actual values
        target = m.get("target")
        actual = m.get("actual")
        score = determine_metric_score(target, actual)
        
        formatted.append({
            "name": m.get("name"),
            "target": target,
            "actual": actual,
            "score": score,
            "notes": m.get("notes")
        })
    return formatted

def determine_metric_score(target: str, actual: str) -> str:
    """Determine metric score based on target and actual values"""
    try:
        # Try to convert to numbers for comparison
        target_num = float(target.replace('%', '').replace('/5', ''))
        actual_num = float(actual.replace('%', '').replace('/5', ''))
        
        # Compare and return appropriate score
        if actual_num >= target_num * 1.1:
            return MetricScore.EXCEEDED
        elif actual_num >= target_num:
            return MetricScore.MET
        elif actual_num >= target_num * 0.8:
            return MetricScore.PARTIALLY_MET
        else:
            return MetricScore.NOT_MET
    except Exception:
        # If conversion fails, default to MET
        return MetricScore.MET

@router.get("/{summary_id}", response_model=SummaryResponse)
async def get_summary(summary_id: str):
    """
    Retrieve an existing close-out summary.
    """
    try:
        # Initialize Supabase client
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        supabase = create_client(supabase_url, supabase_key)
        
        # Query the database for the summary
        response = supabase.table("project_summaries")\
            .select("*")\
            .eq("summary_id", summary_id)\
            .single()\
            .execute()
            
        if not response.data:
            raise HTTPException(status_code=404, detail="Summary not found")
            
        summary_data = response.data
        
        # Convert the stored data to the response model
        return SummaryResponse(
            summary_id=summary_data["summary_id"],
            project_id=summary_data["project_id"],
            client_id=summary_data["client_id"],
            generated_at=datetime.fromisoformat(summary_data["generated_at"].replace('Z', '+00:00')),
            content=summary_data["content"]
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Failed to retrieve summary {summary_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/project/{project_id}", response_model=SummaryResponse)
async def get_project_summary(project_id: str):
    """
    Retrieve the close-out summary for a specific project.
    """
    try:
        # Initialize Supabase client
        supabase_url = os.environ.get("SUPABASE_URL")
        supabase_key = os.environ.get("SUPABASE_KEY")
        supabase = create_client(supabase_url, supabase_key)
        
        # Query the database for the most recent summary for this project
        response = supabase.table("project_summaries")\
            .select("*")\
            .eq("project_id", project_id)\
            .order("generated_at", desc=True)\
            .limit(1)\
            .execute()
            
        if not response.data or len(response.data) == 0:
            raise HTTPException(status_code=404, detail="No summary found for this project")
            
        summary_data = response.data[0]
        
        # Convert the stored data to the response model
        return SummaryResponse(
            summary_id=summary_data["summary_id"],
            project_id=summary_data["project_id"],
            client_id=summary_data["client_id"],
            generated_at=datetime.fromisoformat(summary_data["generated_at"].replace('Z', '+00:00')),
            content=summary_data["content"]
        )
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Failed to retrieve project summary for project {project_id}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{summary_id}/export")
async def export_summary(summary_id: str, format: str = "pdf"):
    """
    Export a summary in the specified format.
    """
    try:
        return {
            "summary_id": summary_id,
            "format": format,
            "download_url": f"https://example.com/summaries/{summary_id}.{format}",
            "expires_at": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{summary_id}/share")
async def share_summary(summary_id: str, recipients: List[str], message: Optional[str] = None):
    """
    Share a summary with specified recipients.
    """
    try:
        return {
            "summary_id": summary_id,
            "shared_with": recipients,
            "shared_at": datetime.now(),
            "access_link": f"https://example.com/shared/summaries/{summary_id}",
            "expires_at": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
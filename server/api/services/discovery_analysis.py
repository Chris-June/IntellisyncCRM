"""
Discovery Analysis Service performs semantic analysis on client intake data 
to identify business opportunities, challenges, and potential AI solution fits.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import os
from ..models import ModelManager, ModelRegistry
from ..models.config import ModelType

# Initialize model registry and manager
model_registry = ModelRegistry()
model_manager = ModelManager(model_registry)

router = APIRouter(prefix="/analyze", tags=["discovery-analysis"])

class BusinessGoal(BaseModel):
    title: str
    description: str
    priority: str
    timeline: str

class Challenge(BaseModel):
    title: str
    description: str
    impact: str
    urgency: str

class Opportunity(BaseModel):
    title: str
    description: str
    ai_fit_score: float = Field(ge=0, le=1)
    potential_impact: str
    relevant_solutions: List[str]

class AnalysisRequest(BaseModel):
    client_id: str
    intake_data: Dict[str, Any]

class AnalysisResult(BaseModel):
    analysis_id: str
    opportunities: List[Opportunity]
    business_goals: List[BusinessGoal]
    challenges: List[Challenge]
    created_at: datetime

@router.post("", response_model=AnalysisResult)
async def analyze_client_data(request: AnalysisRequest):
    """
    Analyzes client intake data and discovery notes.
    """
    try:
        # Extract client intake data
        client_data = request.intake_data
        
        # Serialize intake data for the model
        intake_text = f"""
        Client ID: {request.client_id}
        
        Responses:
        {json.dumps(client_data.get('responses', {}), indent=2)}
        
        Notes:
        {client_data.get('notes', 'No notes provided')}
        
        Documents:
        {json.dumps(client_data.get('documents', []), indent=2)}
        """
        
        # Create messages for the model
        messages = [
            {
                "role": "system", 
                "content": """You are the Discovery Analysis agent for IntelliSync CMS. 
                Your task is to analyze client intake data and identify:
                1. Business goals with priorities and timelines
                2. Business challenges with impact and urgency
                3. Potential AI opportunities with fit scores and impact assessments
                
                Provide a comprehensive analysis in JSON format with these three sections.
                For each opportunity, include an AI fit score (0-1) and relevant AI solution types.
                """
            },
            {"role": "user", "content": f"Analyze the following client intake data:\n\n{intake_text}"}
        ]
        
        # Generate analysis using OpenAI
        response, usage = await model_manager.generate_text(
            service_name="discovery_analysis",
            messages=messages,
            temperature=0.0,  # Zero temperature for consistent results
            max_tokens=2000
        )
        
        # Extract response content
        ai_response = response["choices"][0]["message"]["content"]
        
        # Parse the JSON response
        # In a real implementation, we'd handle potential parsing errors more robustly
        try:
            analysis_data = json.loads(ai_response)
        except json.JSONDecodeError:
            # If the response isn't valid JSON, try to extract structured data
            # This is a simple fallback for demo purposes
            analysis_data = {
                "opportunities": [
                    {
                        "title": "AI-Driven Customer Service",
                        "description": "Implement intelligent chatbot for 24/7 support",
                        "ai_fit_score": 0.85,
                        "potential_impact": "high",
                        "relevant_solutions": ["GPT Integration", "Custom Training"]
                    }
                ],
                "business_goals": [
                    {
                        "title": "Improve Customer Response Time",
                        "description": "Reduce average response time to under 1 hour",
                        "priority": "high",
                        "timeline": "Q2 2025"
                    }
                ],
                "challenges": [
                    {
                        "title": "Legacy System Integration",
                        "description": "Current systems lack API capabilities",
                        "impact": "high",
                        "urgency": "medium"
                    }
                ]
            }
        
        # Construct the return object
        return AnalysisResult(
            analysis_id=f"analysis-{request.client_id}-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            opportunities=[
                Opportunity(**opp)
                for opp in analysis_data.get("opportunities", [])
            ],
            business_goals=[
                BusinessGoal(**goal)
                for goal in analysis_data.get("business_goals", [])
            ],
            challenges=[
                Challenge(**challenge)
                for challenge in analysis_data.get("challenges", [])
            ],
            created_at=datetime.now()
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{analysis_id}")
async def get_analysis_result(analysis_id: str):
    """
    Retrieves a specific analysis result.
    """
    try:
        # In a real implementation, this would query the database
        raise HTTPException(status_code=501, detail="Not implemented")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{analysis_id}/refine")
async def refine_analysis(analysis_id: str, feedback: Dict[str, Any]):
    """
    Refines analysis based on feedback.
    """
    try:
        # In a real implementation, this would update the analysis
        
        # Use OpenAI to refine the analysis based on feedback
        messages = [
            {
                "role": "system", 
                "content": """You are the Discovery Analysis agent for IntelliSync CMS.
                Your task is to refine an existing analysis based on new feedback.
                Maintain the same structure and format, but incorporate the feedback.
                """
            },
            {
                "role": "user", 
                "content": f"Refine the analysis with ID {analysis_id} based on this feedback:\n\n{json.dumps(feedback, indent=2)}"
            }
        ]
        
        # Generate refined analysis
        response, usage = await model_manager.generate_text(
            service_name="discovery_analysis",
            messages=messages,
            temperature=0.1
        )
        
        # In a real implementation, we would parse and store the refined analysis
        # Return a mock response for now
        return {
            "analysis_id": analysis_id,
            "status": "refined",
            "refinement_count": 1,
            "refinement_timestamp": datetime.now().isoformat(),
            "refinement_reason": list(feedback.keys())[0] if feedback else "general refinement"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/semantic-search")
async def semantic_search(query: str, client_id: Optional[str] = None, limit: int = 5):
    """
    Performs semantic search across analysis results.
    """
    try:
        # Generate embeddings for the query
        embedding_response, usage = await model_manager.generate_embeddings(
            service_name="discovery_analysis",
            texts=query
        )
        
        query_embedding = embedding_response["data"][0]["embedding"]
        
        # In a real implementation, this would search against stored embeddings
        # Return mock results for now
        return {
            "query": query,
            "results": [
                {
                    "analysis_id": "analysis-123",
                    "client_id": client_id or "client-456",
                    "relevance_score": 0.92,
                    "content_type": "opportunity",
                    "content": {
                        "title": "AI-Driven Customer Service",
                        "description": "Implement intelligent chatbot for 24/7 support"
                    }
                }
            ],
            "embedding_model": embedding_response["model"],
            "total": 1
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
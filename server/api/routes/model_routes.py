"""
Routes for managing and monitoring AI models.
"""

from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any, List
from ..models import ModelManager, ModelRegistry

# Initialize model registry and manager
model_registry = ModelRegistry()
model_manager = ModelManager(model_registry)

router = APIRouter(prefix="/api/models", tags=["models"])

@router.get("/configurations")
async def get_model_configurations():
    """
    Get model configurations for all services.
    """
    try:
        return model_registry.get_all_service_configurations()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/usage")
async def get_model_usage_statistics():
    """
    Get model usage statistics.
    """
    try:
        return model_manager.get_usage_statistics()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/clear-usage-history")
async def clear_usage_history():
    """
    Clear model usage history.
    """
    try:
        model_manager.clear_usage_history()
        return {"status": "success", "message": "Usage history cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/test")
async def test_model(
    service_name: str,
    prompt: str,
    temperature: float = 0.7
):
    """
    Test a model with a prompt.
    """
    try:
        messages = [
            {"role": "system", "content": "You are a helpful assistant for IntelliSync CMS."},
            {"role": "user", "content": prompt}
        ]
        
        response, usage = await model_manager.generate_text(
            service_name=service_name,
            messages=messages,
            temperature=temperature
        )
        
        return {
            "service_name": service_name,
            "model_used": response["model"],
            "response": response["choices"][0]["message"]["content"],
            "usage": usage.to_dict()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
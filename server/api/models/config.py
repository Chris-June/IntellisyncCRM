"""
Model configurations for IntelliSync CMS.

This module defines which models should be used for different services
and provides configuration options for each model.
"""

from enum import Enum
from typing import Dict, Any, Optional, List

class ModelType(str, Enum):
    """Types of AI models available in the system."""
    OPENAI_CHAT = "openai_chat"
    OPENAI_EMBEDDING = "openai_embedding"
    OPENAI_VISION = "openai_vision"
    OPENAI_AUDIO = "openai_audio"

class ModelTier(str, Enum):
    """Performance/capability tiers for models."""
    BASIC = "basic"         # Simple, fast, cost-efficient (e.g., GPT-4o-mini)
    STANDARD = "standard"   # Balanced performance (e.g., GPT-4o)
    ADVANCED = "advanced"   # High capability (e.g., GPT-o1)
    PREMIUM = "premium"     # Maximum capability (e.g., GPT-o3)

class ServiceCategory(str, Enum):
    """Categories of MCP services."""
    CLIENT_INTAKE = "client_intake"
    DISCOVERY = "discovery" 
    SALES = "sales"
    PROJECT = "project"
    INFRASTRUCTURE = "infrastructure"
    ANALYSIS = "analysis"

class ModelConfig:
    """Configuration for AI models."""
    
    # Default models for each tier
    DEFAULT_MODELS = {
        ModelTier.BASIC: {
            ModelType.OPENAI_CHAT: "gpt-4o-mini",
            ModelType.OPENAI_EMBEDDING: "text-embedding",
            ModelType.OPENAI_VISION: "gpt-4o-mini",
            ModelType.OPENAI_AUDIO: "gpt-4o realtime api"
        },
        ModelTier.STANDARD: {
            ModelType.OPENAI_CHAT: "gpt-4o",
            ModelType.OPENAI_EMBEDDING: "text-embedding",
            ModelType.OPENAI_VISION: "gpt-4o",
            ModelType.OPENAI_AUDIO: "gpt-4o realtime api"
        },
        ModelTier.ADVANCED: {
            ModelType.OPENAI_CHAT: "o3-mini",
            ModelType.OPENAI_EMBEDDING: "text-embedding",
            ModelType.OPENAI_VISION: "o3-mini",
            ModelType.OPENAI_AUDIO: "gpt-4o realtime api"
        },
        ModelTier.PREMIUM: {
            ModelType.OPENAI_CHAT: "o1",
            ModelType.OPENAI_EMBEDDING: "text-embedding",
            ModelType.OPENAI_VISION: "o1",
            ModelType.OPENAI_AUDIO: "gpt-4o realtime api"
        }
    }
    
    # Service tier assignments
    SERVICE_TIERS = {
        # Client-facing services that need high quality
        "client_intake": ModelTier.ADVANCED,
        "discovery_analysis": ModelTier.ADVANCED,
        "opportunity_scoring": ModelTier.ADVANCED,
        
        # Sales services that need good quality but are cost-sensitive
        "sales_funnel": ModelTier.STANDARD,
        "deal_risk_detector": ModelTier.STANDARD,
        "follow_up_reminder": ModelTier.BASIC,
        "contract_builder": ModelTier.ADVANCED,
        
        # Project management services with varying needs
        "project_management": ModelTier.STANDARD,
        "task_decomposer": ModelTier.ADVANCED,
        "revision_tracker": ModelTier.STANDARD,
        
        # Analysis and collaboration services
        "retrospective": ModelTier.ADVANCED,
        "meeting_notes": ModelTier.STANDARD,
        
        # Infrastructure services that can use simpler models
        "agent_orchestrator": ModelTier.BASIC,
        "calendar": ModelTier.BASIC,
        "filesystem": ModelTier.BASIC,
        "workflow_template": ModelTier.STANDARD,
        
        # Memory and context services that need advanced understanding
        "memory_manager": ModelTier.STANDARD,
        "context_controller": ModelTier.ADVANCED,
        
        # Default fallback
        "default": ModelTier.STANDARD
    }
    
    # Tool-specific configurations
    TOOL_CONFIGS = {
        "text_analysis": {
            "model_type": ModelType.OPENAI_CHAT,
            "model_tier": ModelTier.STANDARD,
            "temperature": 0.0,  # Low temperature for factual analysis
            "max_tokens": 1000
        },
        "template_engine": {
            "model_type": ModelType.OPENAI_CHAT,
            "model_tier": ModelTier.BASIC,
            "temperature": 0.2,
            "max_tokens": 2000
        },
        "email_composer": {
            "model_type": ModelType.OPENAI_CHAT,
            "model_tier": ModelTier.STANDARD,
            "temperature": 0.7,  # Higher temperature for creative writing
            "max_tokens": 1500
        },
        "semantic_search": {
            "model_type": ModelType.OPENAI_EMBEDDING,
            "model_tier": ModelTier.ADVANCED,
            "dimensions": 1536
        }
    }
    
    # Model-specific parameters
    MODEL_PARAMS = {
        "gpt-4o-mini": {
            "default_temp": 0.7,
            "default_max_tokens": 4000
        },
        "gpt-4o": {
            "default_temp": 0.7,
            "default_max_tokens": 8000
        },
        "gpt-o1": {
            "default_temp": 0.7,
            "default_max_tokens": 8000
        },
        "gpt-o3": {
            "default_temp": 0.7,
            "default_max_tokens": 8000
        },
        "gpt-4o realtime api": {
            "default_temp": 0.7,
            "default_max_tokens": 8000
        },
        "o3-mini": {
            "default_temp": 0.7,
            "default_max_tokens": 8000
        },
        "o1": {
            "default_temp": 0.7,
            "default_max_tokens": 8000
        }
    }
    
    @classmethod
    def get_model_for_service(cls, service_name: str, model_type: ModelType = ModelType.OPENAI_CHAT) -> str:
        """
        Get the appropriate model name for a service.
        
        Args:
            service_name: Name of the service requesting a model
            model_type: Type of model required
            
        Returns:
            str: Model name
        """
        # Get the tier for this service
        service_tier = cls.SERVICE_TIERS.get(service_name, cls.SERVICE_TIERS["default"])
        
        # Get the model for this tier and type
        return cls.DEFAULT_MODELS[service_tier][model_type]
    
    @classmethod
    def get_model_params(cls, model_name: str) -> Dict[str, Any]:
        """
        Get default parameters for a specific model.
        
        Args:
            model_name: Name of the model
            
        Returns:
            Dict[str, Any]: Model parameters
        """
        return cls.MODEL_PARAMS.get(model_name, {
            "default_temp": 0.7,
            "default_max_tokens": 2000
        })
    
    @classmethod
    def get_tool_config(cls, tool_name: str) -> Dict[str, Any]:
        """
        Get configuration for a specific tool.
        
        Args:
            tool_name: Name of the tool
            
        Returns:
            Dict[str, Any]: Tool configuration
        """
        return cls.TOOL_CONFIGS.get(tool_name, {
            "model_type": ModelType.OPENAI_CHAT,
            "model_tier": ModelTier.STANDARD,
            "temperature": 0.7,
            "max_tokens": 2000
        })
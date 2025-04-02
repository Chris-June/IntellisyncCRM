"""
Model Registry for managing and accessing AI models.
"""

from typing import Dict, Any, List, Optional
import logging
import os
from .config import ModelConfig, ModelType, ModelTier
from .openai import OpenAIClient

logger = logging.getLogger(__name__)


class ModelRegistry:
    """
    Registry for storing and accessing AI model clients.
    
    The ModelRegistry maintains configurations for different models
    and provides access to model clients with appropriate settings.
    """
    
    def __init__(self):
        """Initialize the model registry."""
        self._clients: Dict[str, Any] = {}
        
        # Initialize OpenAI client by default
        self._initialize_openai()
        
        logger.info("Initialized ModelRegistry")
    
    def _initialize_openai(self) -> None:
        """Initialize the OpenAI client."""
        api_key = os.getenv("OPENAI_API_KEY")
        organization = os.getenv("OPENAI_ORGANIZATION", None)
        
        if not api_key:
            logger.warning("No OpenAI API key found. Set OPENAI_API_KEY environment variable.")
            return
        
        try:
            self._clients["openai"] = OpenAIClient(
                api_key=api_key,
                organization=organization
            )
            logger.info("Registered OpenAI client")
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI client: {e}")
    
    def get_openai_client(self) -> Optional[OpenAIClient]:
        """
        Get the OpenAI client.
        
        Returns:
            Optional[OpenAIClient]: OpenAI client or None if not initialized
        """
        return self._clients.get("openai")
    
    def get_model_for_service(
        self,
        service_name: str,
        model_type: ModelType = ModelType.OPENAI_CHAT
    ) -> str:
        """
        Get the appropriate model name for a service.
        
        Args:
            service_name: Name of the service requesting a model
            model_type: Type of model required
            
        Returns:
            str: Model name
        """
        return ModelConfig.get_model_for_service(service_name, model_type)
    
    def get_model_for_tool(
        self,
        tool_name: str,
        model_type: Optional[ModelType] = None
    ) -> str:
        """
        Get the appropriate model name for a tool.
        
        Args:
            tool_name: Name of the tool
            model_type: Type of model required (if None, use tool config)
            
        Returns:
            str: Model name
        """
        tool_config = ModelConfig.get_tool_config(tool_name)
        
        # Use specified model_type or get from tool config
        actual_model_type = model_type or tool_config.get("model_type", ModelType.OPENAI_CHAT)
        model_tier = tool_config.get("model_tier", ModelTier.STANDARD)
        
        return ModelConfig.DEFAULT_MODELS[model_tier][actual_model_type]
    
    def get_default_parameters(self, model_name: str) -> Dict[str, Any]:
        """
        Get default parameters for a model.
        
        Args:
            model_name: Model name
            
        Returns:
            Dict[str, Any]: Default parameters
        """
        return ModelConfig.get_model_params(model_name)
    
    def get_all_service_configurations(self) -> Dict[str, Dict[str, Any]]:
        """
        Get all service model configurations.
        
        Returns:
            Dict[str, Dict[str, Any]]: Service configurations
        """
        result = {}
        for service_name, tier in ModelConfig.SERVICE_TIERS.items():
            model_name = ModelConfig.DEFAULT_MODELS[tier][ModelType.OPENAI_CHAT]
            result[service_name] = {
                "model": model_name,
                "tier": tier,
                "parameters": ModelConfig.get_model_params(model_name)
            }
        return result
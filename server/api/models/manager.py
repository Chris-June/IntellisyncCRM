"""
Model Manager for handling AI model access and execution.
"""

from typing import Dict, Any, List, Optional, Tuple, Union
import logging
import json
from datetime import datetime
from .registry import ModelRegistry
from .config import ModelType
from .openai import ModelUsage

logger = logging.getLogger(__name__)


class ModelManager:
    """
    Manager for executing AI model operations.
    
    The ModelManager provides a layer of abstraction over the ModelRegistry,
    handling model selection, execution, and usage tracking.
    """
    
    def __init__(self, registry: ModelRegistry):
        """
        Initialize with a model registry.
        
        Args:
            registry: ModelRegistry instance to use
        """
        self.registry = registry
        self.usage_history: List[Dict[str, Any]] = []
        self.max_history_size = 1000
        
        logger.info("Initialized ModelManager")
    
    async def generate_text(
        self, 
        service_name: str,
        messages: List[Dict[str, Any]],
        temperature: Optional[float] = None,
        max_tokens: Optional[int] = None,
        tools: Optional[List[Dict[str, Any]]] = None,
        tool_choice: Optional[str] = None
    ) -> Tuple[Dict[str, Any], ModelUsage]:
        """
        Generate text using a chat model.
        
        Args:
            service_name: Name of the service making the request
            messages: List of messages for the chat
            temperature: Temperature parameter (0.0 to 1.0)
            max_tokens: Maximum tokens to generate
            tools: List of tools the model can use
            tool_choice: How the model chooses to use tools
            
        Returns:
            Tuple of (response data, usage statistics)
        """
        # Get appropriate model for this service
        model = self.registry.get_model_for_service(service_name, ModelType.OPENAI_CHAT)
        
        # Get default parameters for this model
        default_params = self.registry.get_default_parameters(model)
        
        # Use provided parameters or defaults
        actual_temp = temperature if temperature is not None else default_params.get("default_temp", 0.7)
        actual_max_tokens = max_tokens if max_tokens is not None else default_params.get("default_max_tokens", 2000)
        
        # Get OpenAI client
        openai_client = self.registry.get_openai_client()
        if not openai_client:
            raise ValueError("OpenAI client not available")
        
        # Create chat completion
        logger.info(f"Generating text with model {model} for service {service_name}")
        start_time = datetime.now()
        
        response, usage = await openai_client.chat_completion(
            messages=messages,
            model=model,
            temperature=actual_temp,
            max_tokens=actual_max_tokens,
            tools=tools,
            tool_choice=tool_choice
        )
        
        # Log usage
        self._record_usage(
            service_name=service_name,
            model=model,
            usage=usage,
            operation_type="text_generation",
            duration_ms=(datetime.now() - start_time).total_seconds() * 1000
        )
        
        return response, usage
    
    async def generate_embeddings(
        self,
        service_name: str,
        texts: Union[str, List[str]],
        dimensions: Optional[int] = None
    ) -> Tuple[Dict[str, Any], ModelUsage]:
        """
        Generate embeddings for text.
        
        Args:
            service_name: Name of the service making the request
            texts: Text or texts to embed
            dimensions: Optional embedding dimensions
            
        Returns:
            Tuple of (response data, usage statistics)
        """
        # Get appropriate model for this service
        model = self.registry.get_model_for_service(service_name, ModelType.OPENAI_EMBEDDING)
        
        # Get OpenAI client
        openai_client = self.registry.get_openai_client()
        if not openai_client:
            raise ValueError("OpenAI client not available")
        
        # Create embeddings
        logger.info(f"Generating embeddings with model {model} for service {service_name}")
        start_time = datetime.now()
        
        response, usage = await openai_client.embeddings(
            input_text=texts,
            model=model,
            dimensions=dimensions
        )
        
        # Log usage
        self._record_usage(
            service_name=service_name,
            model=model,
            usage=usage,
            operation_type="embeddings",
            duration_ms=(datetime.now() - start_time).total_seconds() * 1000
        )
        
        return response, usage
    
    async def analyze_image(
        self,
        service_name: str,
        image_url: str,
        prompt: str,
        max_tokens: Optional[int] = None
    ) -> Tuple[Dict[str, Any], ModelUsage]:
        """
        Analyze an image using a vision model.
        
        Args:
            service_name: Name of the service making the request
            image_url: URL of the image to analyze
            prompt: Prompt for the vision model
            max_tokens: Maximum tokens to generate
            
        Returns:
            Tuple of (response data, usage statistics)
        """
        # Get appropriate model for this service
        model = self.registry.get_model_for_service(service_name, ModelType.OPENAI_VISION)
        
        # Get default parameters for this model
        default_params = self.registry.get_default_parameters(model)
        
        # Use provided parameters or defaults
        actual_max_tokens = max_tokens if max_tokens is not None else default_params.get("default_max_tokens", 2000)
        
        # Get OpenAI client
        openai_client = self.registry.get_openai_client()
        if not openai_client:
            raise ValueError("OpenAI client not available")
        
        # Create vision request (using chat completion with image content)
        logger.info(f"Analyzing image with model {model} for service {service_name}")
        start_time = datetime.now()
        
        # Format messages for vision request
        messages = [
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {
                        "type": "image_url",
                        "image_url": {"url": image_url}
                    }
                ]
            }
        ]
        
        response, usage = await openai_client.chat_completion(
            messages=messages,
            model=model,
            max_tokens=actual_max_tokens
        )
        
        # Log usage
        self._record_usage(
            service_name=service_name,
            model=model,
            usage=usage,
            operation_type="image_analysis",
            duration_ms=(datetime.now() - start_time).total_seconds() * 1000
        )
        
        return response, usage
    
    async def transcribe_audio(
        self,
        service_name: str,
        audio_file_path: str,
        language: Optional[str] = None,
        prompt: Optional[str] = None
    ) -> Tuple[Dict[str, Any], ModelUsage]:
        """
        Transcribe audio to text.
        
        Args:
            service_name: Name of the service making the request
            audio_file_path: Path to the audio file
            language: Language code (e.g., "en")
            prompt: Optional prompt for the transcription
            
        Returns:
            Tuple of (response data, usage statistics)
        """
        # Get appropriate model for this service
        model = self.registry.get_model_for_service(service_name, ModelType.OPENAI_AUDIO)
        
        # Get OpenAI client
        openai_client = self.registry.get_openai_client()
        if not openai_client:
            raise ValueError("OpenAI client not available")
        
        # Transcribe audio
        logger.info(f"Transcribing audio with model {model} for service {service_name}")
        start_time = datetime.now()
        
        response, usage = await openai_client.audio_transcription(
            audio_file_path=audio_file_path,
            model=model,
            language=language,
            prompt=prompt
        )
        
        # Log usage
        self._record_usage(
            service_name=service_name,
            model=model,
            usage=usage,
            operation_type="audio_transcription",
            duration_ms=(datetime.now() - start_time).total_seconds() * 1000
        )
        
        return response, usage
    
    def get_usage_statistics(self) -> Dict[str, Any]:
        """
        Get usage statistics.
        
        Returns:
            Dict[str, Any]: Usage statistics
        """
        # Group by service
        usage_by_service = {}
        for entry in self.usage_history:
            service_name = entry["service_name"]
            
            if service_name not in usage_by_service:
                usage_by_service[service_name] = {
                    "total_requests": 0,
                    "total_tokens": 0,
                    "total_cost": 0.0
                }
                
            service_stats = usage_by_service[service_name]
            service_stats["total_requests"] += 1
            service_stats["total_tokens"] += entry["usage"]["total_tokens"]
            service_stats["total_cost"] += entry["usage"]["estimated_cost_usd"]
        
        # Group by model
        usage_by_model = {}
        for entry in self.usage_history:
            model = entry["model"]
            
            if model not in usage_by_model:
                usage_by_model[model] = {
                    "total_requests": 0,
                    "total_tokens": 0,
                    "total_cost": 0.0
                }
                
            model_stats = usage_by_model[model]
            model_stats["total_requests"] += 1
            model_stats["total_tokens"] += entry["usage"]["total_tokens"]
            model_stats["total_cost"] += entry["usage"]["estimated_cost_usd"]
        
        # Group by operation type
        usage_by_operation = {}
        for entry in self.usage_history:
            operation_type = entry["operation_type"]
            
            if operation_type not in usage_by_operation:
                usage_by_operation[operation_type] = {
                    "total_requests": 0,
                    "total_tokens": 0,
                    "total_cost": 0.0
                }
                
            operation_stats = usage_by_operation[operation_type]
            operation_stats["total_requests"] += 1
            operation_stats["total_tokens"] += entry["usage"]["total_tokens"]
            operation_stats["total_cost"] += entry["usage"]["estimated_cost_usd"]
        
        return {
            "total_requests": len(self.usage_history),
            "total_cost": sum(entry["usage"]["estimated_cost_usd"] for entry in self.usage_history),
            "total_tokens": sum(entry["usage"]["total_tokens"] for entry in self.usage_history),
            "usage_by_service": usage_by_service,
            "usage_by_model": usage_by_model,
            "usage_by_operation": usage_by_operation
        }
    
    def clear_usage_history(self) -> None:
        """Clear usage history."""
        self.usage_history = []
        logger.info("Usage history cleared")
    
    def _record_usage(
        self,
        service_name: str,
        model: str,
        usage: ModelUsage,
        operation_type: str,
        duration_ms: float
    ) -> None:
        """
        Record model usage.
        
        Args:
            service_name: Name of the service making the request
            model: Model name
            usage: Usage statistics
            operation_type: Type of operation
            duration_ms: Request duration in milliseconds
        """
        usage_entry = {
            "service_name": service_name,
            "model": model,
            "operation_type": operation_type,
            "timestamp": datetime.now().isoformat(),
            "duration_ms": duration_ms,
            "usage": usage.to_dict()
        }
        
        self.usage_history.append(usage_entry)
        
        # Trim history if too large
        if len(self.usage_history) > self.max_history_size:
            self.usage_history = self.usage_history[-self.max_history_size:]
        
        # Log usage statistics
        logger.info(
            f"Model usage: {model} for {service_name}, "
            f"{usage.total_tokens} tokens (${usage.estimated_cost_usd:.4f})"
        )
"""
OpenAI client wrapper for IntelliSync CMS.

This module provides a wrapper around the OpenAI API client,
handling authentication, rate limiting, and usage tracking.
"""

from typing import Dict, Any, List, Optional, Union, Tuple
import os
import logging
from datetime import datetime
import json
import asyncio
import httpx
from pydantic import BaseModel

# Configure logging
logger = logging.getLogger(__name__)

class ModelUsage(BaseModel):
    """Track model usage and costs."""
    
    prompt_tokens: int
    completion_tokens: int
    total_tokens: int
    estimated_cost_usd: float
    model: str
    timestamp: datetime
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert to dictionary."""
        return {
            "prompt_tokens": self.prompt_tokens,
            "completion_tokens": self.completion_tokens,
            "total_tokens": self.total_tokens,
            "estimated_cost_usd": self.estimated_cost_usd,
            "model": self.model,
            "timestamp": self.timestamp.isoformat()
        }

class OpenAIClient:
    """Client for interacting with OpenAI API."""
    
    # Approximate costs per 1K tokens (as of April 2025)
    MODEL_COSTS = {
        # GPT-4o mini models
        "gpt-4o-mini": {"prompt": 0.00015, "completion": 0.0006},
        
        # o3-mini models
        "o3-mini": {"prompt": 0.0011, "completion": 0.0044, "cached_prompt": 0.00055},
        
        # GPT-4o models
        "gpt-4o": {"prompt": 0.0025, "completion": 0.01},
        
        # OpenAI o1 models
        "o1": {"prompt": 0.015, "completion": 0.06, "cached_prompt": 0.0075},
        
        # GPT-4.5 models
        "gpt-4.5": {"prompt": 0.075, "completion": 0.15},
        
        # OpenAI o1-Pro models
        "o1-pro": {"prompt": 0.15, "completion": 0.6}
    }
    
    def __init__(
        self, 
        api_key: Optional[str] = None,
        organization: Optional[str] = None,
        base_url: Optional[str] = None,
        timeout: float = 60.0,
        max_retries: int = 3
    ):
        """
        Initialize the OpenAI client.
        
        Args:
            api_key: OpenAI API key (defaults to OPENAI_API_KEY env var)
            organization: OpenAI organization ID
            base_url: Custom API base URL
            timeout: Request timeout in seconds
            max_retries: Maximum number of retry attempts for failed requests
        """
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            logger.warning("No OpenAI API key provided. Set OPENAI_API_KEY environment variable.")
        
        self.organization = organization or os.getenv("OPENAI_ORGANIZATION")
        self.base_url = base_url or "https://api.openai.com/v1"
        self.timeout = timeout
        self.max_retries = max_retries
        
        self.usage_log: List[ModelUsage] = []
        self.max_usage_log_size = 1000
        
        logger.info("Initialized OpenAI client")
    
    async def chat_completion(
        self,
        messages: List[Dict[str, Any]],
        model: str = "gpt-4o-mini",
        temperature: float = 0.7,
        max_tokens: Optional[int] = None,
        top_p: float = 1.0,
        frequency_penalty: float = 0.0,
        presence_penalty: float = 0.0,
        tools: Optional[List[Dict[str, Any]]] = None,
        tool_choice: Optional[str] = None,
        response_format: Optional[Dict[str, str]] = None
    ) -> Tuple[Dict[str, Any], ModelUsage]:
        """
        Create a chat completion.
        
        Args:
            messages: List of message objects
            model: Model to use
            temperature: Sampling temperature
            max_tokens: Maximum number of tokens to generate
            top_p: Nucleus sampling parameter
            frequency_penalty: Frequency penalty parameter
            presence_penalty: Presence penalty parameter
            tools: List of tools the model can use
            tool_choice: How the model chooses to use tools
            response_format: Format to return the response in
            
        Returns:
            Tuple of (response data, usage statistics)
        """
        endpoint = f"{self.base_url}/chat/completions"
        
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "top_p": top_p,
            "frequency_penalty": frequency_penalty,
            "presence_penalty": presence_penalty
        }
        
        if max_tokens is not None:
            payload["max_tokens"] = max_tokens
            
        if tools:
            payload["tools"] = tools
            
        if tool_choice:
            payload["tool_choice"] = tool_choice
            
        if response_format:
            payload["response_format"] = response_format
        
        headers = self._get_headers()
        
        response_data = await self._make_request("POST", endpoint, headers, payload)
        
        # Calculate and track usage
        usage = self._calculate_usage(response_data.get("usage", {}), model)
        
        return response_data, usage
    
    async def embeddings(
        self,
        input_text: Union[str, List[str]],
        model: str = "text-embedding",
        dimensions: Optional[int] = None
    ) -> Tuple[Dict[str, Any], ModelUsage]:
        """
        Create embeddings for text.
        
        Args:
            input_text: Text to create embeddings for
            model: Model to use
            dimensions: Desired embedding dimensions
            
        Returns:
            Tuple of (response data, usage statistics)
        """
        endpoint = f"{self.base_url}/embeddings"
        
        # Convert single string to list
        if isinstance(input_text, str):
            input_text = [input_text]
        
        payload = {
            "model": model,
            "input": input_text
        }
        
        if dimensions is not None:
            payload["dimensions"] = dimensions
        
        headers = self._get_headers()
        
        response_data = await self._make_request("POST", endpoint, headers, payload)
        
        # Calculate and track usage
        usage = self._calculate_usage(response_data.get("usage", {}), model)
        
        return response_data, usage
    
    async def audio_transcription(
        self,
        audio_file_path: str,
        model: str = "whisper-1",
        language: Optional[str] = None,
        prompt: Optional[str] = None
    ) -> Tuple[Dict[str, Any], ModelUsage]:
        """
        Transcribe audio to text.
        
        Args:
            audio_file_path: Path to audio file
            model: Model to use
            language: Language of the audio (ISO-639-1 code)
            prompt: Optional prompt for the model
            
        Returns:
            Tuple of (response data, usage statistics)
        """
        endpoint = f"{self.base_url}/audio/transcriptions"
        
        # Prepare form data
        form_data = {
            "model": model,
            "file": open(audio_file_path, "rb")
        }
        
        if language is not None:
            form_data["language"] = language
            
        if prompt is not None:
            form_data["prompt"] = prompt
        
        headers = self._get_headers(content_type=None)  # Let httpx set for multipart
        
        # Use httpx directly for form data
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(
                endpoint,
                headers=headers,
                files={"file": open(audio_file_path, "rb")},
                data={"model": model, "language": language} if language else {"model": model}
            )
            
            if response.status_code != 200:
                raise Exception(f"OpenAI API error: {response.text}")
            
            response_data = response.json()
        
        # Estimate usage (OpenAI doesn't provide usage stats for audio)
        # This is a rough estimate based on audio duration
        usage = ModelUsage(
            prompt_tokens=0,  # Not provided by API
            completion_tokens=0,  # Not provided by API
            total_tokens=0,  # Not provided by API
            estimated_cost_usd=0.0,  # Would need duration to estimate
            model=model,
            timestamp=datetime.now()
        )
        
        return response_data, usage
    
    async def _make_request(
        self, 
        method: str, 
        url: str, 
        headers: Dict[str, str], 
        data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Make an API request with retries.
        
        Args:
            method: HTTP method
            url: Request URL
            headers: Request headers
            data: Request data
            
        Returns:
            Dict[str, Any]: Response data
        """
        attempts = 0
        last_error = None
        
        while attempts < self.max_retries:
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.request(
                        method,
                        url,
                        headers=headers,
                        json=data
                    )
                    
                    if response.status_code == 200:
                        return response.json()
                    
                    # Handle rate limiting
                    if response.status_code == 429:
                        retry_after = int(response.headers.get("retry-after", "1"))
                        logger.warning(f"Rate limited. Retrying after {retry_after} seconds.")
                        await asyncio.sleep(retry_after)
                        attempts += 1
                        continue
                    
                    # Handle other errors
                    error_data = response.json()
                    error_message = error_data.get("error", {}).get("message", "Unknown OpenAI API error")
                    raise Exception(f"OpenAI API error: {error_message}")
                
            except Exception as e:
                last_error = e
                attempts += 1
                
                # Exponential backoff with jitter
                backoff_time = 2 ** attempts + (attempts * 0.1)
                logger.warning(f"Request failed, retrying in {backoff_time:.1f} seconds. Error: {e}")
                await asyncio.sleep(backoff_time)
        
        # All retries failed
        raise Exception(f"Failed after {self.max_retries} retries. Last error: {last_error}")
    
    def _get_headers(self, content_type: Optional[str] = "application/json") -> Dict[str, str]:
        """
        Get request headers.
        
        Args:
            content_type: Content type header value
            
        Returns:
            Dict[str, str]: Request headers
        """
        headers = {
            "Authorization": f"Bearer {self.api_key}"
        }
        
        if self.organization:
            headers["OpenAI-Organization"] = self.organization
            
        if content_type:
            headers["Content-Type"] = content_type
            
        return headers
    
    def _calculate_usage(self, usage_data: Dict[str, Any], model: str) -> ModelUsage:
        """
        Calculate and track model usage.
        
        Args:
            usage_data: Usage data from API response
            model: Model name
            
        Returns:
            ModelUsage: Usage statistics
        """
        prompt_tokens = usage_data.get("prompt_tokens", 0)
        completion_tokens = usage_data.get("completion_tokens", 0)
        total_tokens = usage_data.get("total_tokens", 0)
        
        # Get cost rates for this model
        cost_rates = self.MODEL_COSTS.get(model, {"prompt": 0.0, "completion": 0.0})
        
        # Calculate cost
        prompt_cost = (prompt_tokens / 1000) * cost_rates["prompt"]
        completion_cost = (completion_tokens / 1000) * cost_rates["completion"]
        total_cost = prompt_cost + completion_cost
        
        # Create usage record
        usage = ModelUsage(
            prompt_tokens=prompt_tokens,
            completion_tokens=completion_tokens,
            total_tokens=total_tokens,
            estimated_cost_usd=total_cost,
            model=model,
            timestamp=datetime.now()
        )
        
        # Add to usage log
        self.usage_log.append(usage)
        
        # Trim log if too large
        if len(self.usage_log) > self.max_usage_log_size:
            self.usage_log = self.usage_log[-self.max_usage_log_size:]
        
        return usage
    
    def get_usage_statistics(self) -> Dict[str, Any]:
        """
        Get usage statistics.
        
        Returns:
            Dict[str, Any]: Usage statistics
        """
        total_prompt_tokens = sum(usage.prompt_tokens for usage in self.usage_log)
        total_completion_tokens = sum(usage.completion_tokens for usage in self.usage_log)
        total_tokens = sum(usage.total_tokens for usage in self.usage_log)
        total_cost = sum(usage.estimated_cost_usd for usage in self.usage_log)
        
        # Group by model
        usage_by_model = {}
        for usage in self.usage_log:
            if usage.model not in usage_by_model:
                usage_by_model[usage.model] = {
                    "prompt_tokens": 0,
                    "completion_tokens": 0,
                    "total_tokens": 0,
                    "cost": 0.0,
                    "calls": 0
                }
                
            model_stats = usage_by_model[usage.model]
            model_stats["prompt_tokens"] += usage.prompt_tokens
            model_stats["completion_tokens"] += usage.completion_tokens
            model_stats["total_tokens"] += usage.total_tokens
            model_stats["cost"] += usage.estimated_cost_usd
            model_stats["calls"] += 1
        
        return {
            "total_requests": len(self.usage_log),
            "total_prompt_tokens": total_prompt_tokens,
            "total_completion_tokens": total_completion_tokens,
            "total_tokens": total_tokens,
            "total_cost_usd": total_cost,
            "usage_by_model": usage_by_model
        }
    
    def clear_usage_log(self) -> None:
        """Clear usage log."""
        self.usage_log = []
        logger.info("Usage log cleared")
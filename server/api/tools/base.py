"""
Base Tool interface and related classes for the MCP Tool system.
"""

from typing import Dict, Any, Optional, List
from abc import ABC, abstractmethod
from enum import Enum
from datetime import datetime
import uuid


class ToolError(Exception):
    """Base exception for tool-related errors."""
    
    def __init__(self, message: str, code: str = "TOOL_ERROR", details: Dict[str, Any] = None):
        self.message = message
        self.code = code
        self.details = details or {}
        super().__init__(message)


class ToolStatus(str, Enum):
    """Status codes for tool execution results."""
    
    SUCCESS = "success"
    ERROR = "error"
    PARTIAL = "partial"


class ToolResult:
    """Standard container for tool execution results."""
    
    def __init__(
        self,
        status: ToolStatus,
        data: Dict[str, Any] = None,
        error: Optional[ToolError] = None,
        execution_time: Optional[float] = None,
        metadata: Dict[str, Any] = None
    ):
        self.id = str(uuid.uuid4())
        self.status = status
        self.data = data or {}
        self.error = error
        self.execution_time = execution_time
        self.metadata = metadata or {}
        self.timestamp = datetime.now().isoformat()
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert the result to a dictionary."""
        result = {
            "id": self.id,
            "status": self.status,
            "data": self.data,
            "timestamp": self.timestamp,
            "metadata": self.metadata
        }
        
        if self.error:
            result["error"] = {
                "message": self.error.message,
                "code": self.error.code,
                "details": self.error.details
            }
        
        if self.execution_time is not None:
            result["execution_time"] = self.execution_time
            
        return result


class Tool(ABC):
    """Base class for all MCP tools."""
    
    def __init__(self, config: Dict[str, Any] = None):
        """
        Initialize the tool with optional configuration.
        
        Args:
            config: Configuration dictionary for the tool
        """
        self.config = config or {}
        self.tool_id = str(uuid.uuid4())
        self.tool_name = self.__class__.__name__
    
    @abstractmethod
    async def execute(self, input_data: Dict[str, Any]) -> ToolResult:
        """
        Execute the tool's primary function.
        
        Args:
            input_data: Input data for the tool
            
        Returns:
            ToolResult: The result of the tool execution
        """
        pass
    
    @abstractmethod
    async def validate_input(self, input_data: Dict[str, Any]) -> bool:
        """
        Validate that the input meets the tool's requirements.
        
        Args:
            input_data: Input data to validate
            
        Returns:
            bool: True if input is valid, False otherwise
        """
        pass
    
    @abstractmethod
    def get_capabilities(self) -> Dict[str, Any]:
        """
        Return the tool's capabilities and metadata.
        
        Returns:
            Dict[str, Any]: Tool capabilities and metadata
        """
        pass
    
    def get_info(self) -> Dict[str, Any]:
        """
        Get basic information about the tool.
        
        Returns:
            Dict[str, Any]: Tool information
        """
        return {
            "id": self.tool_id,
            "name": self.tool_name,
            "type": self.__class__.__name__,
            "capabilities": self.get_capabilities()
        }
    
    def __str__(self) -> str:
        return f"{self.tool_name}({self.tool_id})"
    
    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(id={self.tool_id})"
"""
Tool Manager for handling tool execution and coordination.
"""

from typing import Dict, Any, List, Optional
import logging
import time
import asyncio
from .registry import ToolRegistry
from .base import Tool, ToolResult, ToolStatus, ToolError

logger = logging.getLogger(__name__)


class ToolManager:
    """
    Manager for executing tools and handling their results.
    
    The ToolManager provides a layer of abstraction over the ToolRegistry,
    handling tool execution, error management, and result processing.
    """
    
    def __init__(self, registry: ToolRegistry):
        """
        Initialize with a tool registry.
        
        Args:
            registry: ToolRegistry instance to use for tool access
        """
        self.registry = registry
        self.execution_history: List[Dict[str, Any]] = []
        self.max_history_size = 100
    
    async def execute_tool(self, tool_name: str, input_data: Dict[str, Any]) -> ToolResult:
        """
        Execute a tool by name with the provided input.
        
        Args:
            tool_name: Name of the tool to execute
            input_data: Input data for the tool
            
        Returns:
            ToolResult: Result of the tool execution
            
        Raises:
            ToolError: If the tool cannot be found or execution fails
        """
        try:
            tool = self.registry.get_tool(tool_name)
            
            # Validate input
            is_valid = await tool.validate_input(input_data)
            if not is_valid:
                raise ToolError(
                    f"Invalid input for tool '{tool_name}'",
                    code="INVALID_TOOL_INPUT"
                )
            
            # Execute tool and measure performance
            start_time = time.time()
            result = await tool.execute(input_data)
            execution_time = time.time() - start_time
            
            # Update result with execution time if not already set
            if result.execution_time is None:
                result.execution_time = execution_time
            
            # Record execution for history
            self._record_execution(tool_name, input_data, result)
            
            return result
            
        except ToolError as e:
            # Pass through tool errors
            logger.error(f"Tool error for '{tool_name}': {e.message}")
            result = ToolResult(
                status=ToolStatus.ERROR,
                error=e,
                execution_time=0,
                metadata={"tool_name": tool_name}
            )
            self._record_execution(tool_name, input_data, result)
            return result
            
        except Exception as e:
            # Wrap other exceptions in ToolError
            logger.exception(f"Unexpected error executing tool '{tool_name}': {str(e)}")
            error = ToolError(
                f"Failed to execute tool '{tool_name}': {str(e)}",
                code="TOOL_EXECUTION_ERROR",
                details={"error_type": type(e).__name__}
            )
            result = ToolResult(
                status=ToolStatus.ERROR,
                error=error,
                execution_time=0,
                metadata={"tool_name": tool_name}
            )
            self._record_execution(tool_name, input_data, result)
            return result
    
    async def execute_tools_parallel(
        self, 
        tool_requests: List[Dict[str, Any]]
    ) -> Dict[str, ToolResult]:
        """
        Execute multiple tools in parallel.
        
        Args:
            tool_requests: List of tool execution requests, each containing:
                - tool_name: Name of the tool to execute
                - input_data: Input data for the tool
                
        Returns:
            Dict[str, ToolResult]: Dictionary mapping tool names to their results
        """
        tasks = []
        for request in tool_requests:
            tool_name = request.get("tool_name")
            input_data = request.get("input_data", {})
            
            if not tool_name:
                logger.error("Missing tool_name in tool request")
                continue
                
            tasks.append(self.execute_tool(tool_name, input_data))
            
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        # Map results back to tool names
        result_map = {}
        for i, result in enumerate(results):
            tool_name = tool_requests[i].get("tool_name")
            
            if isinstance(result, Exception):
                error = ToolError(
                    f"Failed to execute tool '{tool_name}': {str(result)}",
                    code="TOOL_EXECUTION_ERROR",
                    details={"error_type": type(result).__name__}
                )
                result = ToolResult(
                    status=ToolStatus.ERROR,
                    error=error,
                    metadata={"tool_name": tool_name}
                )
                
            result_map[tool_name] = result
            
        return result_map
    
    def get_tool_capabilities(self, tool_name: str) -> Dict[str, Any]:
        """
        Get a tool's capabilities.
        
        Args:
            tool_name: Name of the tool
            
        Returns:
            Dict[str, Any]: Tool capabilities
            
        Raises:
            ToolError: If the tool is not found
        """
        tool = self.registry.get_tool(tool_name)
        return tool.get_capabilities()
    
    def get_available_tools(self) -> List[str]:
        """
        Get a list of all available tool names.
        
        Returns:
            List[str]: List of tool names
        """
        return self.registry.list_tools()
    
    def get_execution_history(self, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """
        Get the execution history.
        
        Args:
            limit: Maximum number of history items to return
            
        Returns:
            List[Dict[str, Any]]: Execution history
        """
        if limit is None or limit > len(self.execution_history):
            return self.execution_history.copy()
        
        return self.execution_history[-limit:]
    
    def clear_history(self) -> None:
        """Clear the execution history."""
        self.execution_history.clear()
    
    def _record_execution(self, tool_name: str, input_data: Dict[str, Any], result: ToolResult) -> None:
        """
        Record tool execution in history.
        
        Args:
            tool_name: Name of the executed tool
            input_data: Input provided to the tool
            result: Result of the tool execution
        """
        # Create a sanitized version of input_data to avoid storing sensitive information
        sanitized_input = self._sanitize_data(input_data)
        
        execution_record = {
            "tool_name": tool_name,
            "input_data": sanitized_input,
            "result": result.to_dict(),
            "timestamp": result.timestamp
        }
        
        self.execution_history.append(execution_record)
        
        # Limit history size
        if len(self.execution_history) > self.max_history_size:
            self.execution_history = self.execution_history[-self.max_history_size:]
    
    def _sanitize_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Remove sensitive information from input data for history recording.
        
        Args:
            data: Input data to sanitize
            
        Returns:
            Dict[str, Any]: Sanitized data
        """
        # Make a shallow copy to avoid modifying the original
        sanitized = data.copy()
        
        # List of potentially sensitive field names to redact
        sensitive_fields = [
            "password", "api_key", "token", "secret", "credential", "auth",
            "private", "key", "certificate", "ssn", "social_security",
            "credit_card", "card_number", "cvv", "pin"
        ]
        
        # Redact any matching fields
        for key in list(sanitized.keys()):
            if any(sensitive in key.lower() for sensitive in sensitive_fields):
                sanitized[key] = "[REDACTED]"
        
        return sanitized
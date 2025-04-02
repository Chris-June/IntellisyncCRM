"""
Tool Registry for managing and accessing available tools.
"""

from typing import Dict, List, Type, Any, Optional
import logging
from .base import Tool, ToolError

logger = logging.getLogger(__name__)


class ToolRegistry:
    """
    Registry for storing and retrieving tools.
    
    The ToolRegistry is a central repository for all available tools.
    It allows tools to be registered, retrieved, and listed.
    """
    
    def __init__(self):
        """Initialize an empty tool registry."""
        self._tools: Dict[str, Tool] = {}
    
    def register_tool(self, tool_name: str, tool_instance: Tool) -> None:
        """
        Register a tool in the registry.
        
        Args:
            tool_name: Unique name for the tool
            tool_instance: Instance of the tool to register
            
        Raises:
            ToolError: If a tool with the same name is already registered
        """
        if tool_name in self._tools:
            raise ToolError(
                f"Tool '{tool_name}' is already registered",
                code="DUPLICATE_TOOL"
            )
        
        self._tools[tool_name] = tool_instance
        logger.info(f"Registered tool: {tool_name}")
    
    def register_tool_class(self, tool_name: str, tool_class: Type[Tool], config: Dict[str, Any] = None) -> Tool:
        """
        Create and register a tool from its class.
        
        Args:
            tool_name: Unique name for the tool
            tool_class: Class of the tool to instantiate
            config: Optional configuration for the tool instance
            
        Returns:
            Tool: The registered tool instance
            
        Raises:
            ToolError: If a tool with the same name is already registered
        """
        if tool_name in self._tools:
            raise ToolError(
                f"Tool '{tool_name}' is already registered",
                code="DUPLICATE_TOOL"
            )
        
        try:
            tool_instance = tool_class(config=config)
            self._tools[tool_name] = tool_instance
            logger.info(f"Registered tool class: {tool_name} ({tool_class.__name__})")
            return tool_instance
        except Exception as e:
            raise ToolError(
                f"Failed to instantiate tool '{tool_name}': {str(e)}",
                code="TOOL_INSTANTIATION_ERROR",
                details={"error": str(e), "tool_class": tool_class.__name__}
            )
    
    def get_tool(self, tool_name: str) -> Tool:
        """
        Get a tool by name.
        
        Args:
            tool_name: Name of the tool to retrieve
            
        Returns:
            Tool: The requested tool instance
            
        Raises:
            ToolError: If the requested tool is not found
        """
        if tool_name not in self._tools:
            raise ToolError(
                f"Tool '{tool_name}' not found in registry",
                code="TOOL_NOT_FOUND"
            )
        
        return self._tools[tool_name]
    
    def unregister_tool(self, tool_name: str) -> None:
        """
        Remove a tool from the registry.
        
        Args:
            tool_name: Name of the tool to unregister
            
        Raises:
            ToolError: If the tool is not found
        """
        if tool_name not in self._tools:
            raise ToolError(
                f"Cannot unregister tool '{tool_name}': not found in registry",
                code="TOOL_NOT_FOUND"
            )
        
        del self._tools[tool_name]
        logger.info(f"Unregistered tool: {tool_name}")
    
    def list_tools(self) -> List[str]:
        """
        List all available tools.
        
        Returns:
            List[str]: List of registered tool names
        """
        return list(self._tools.keys())
    
    def get_tool_info(self, tool_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Get information about registered tools.
        
        Args:
            tool_name: Optional name of a specific tool to get info for
            
        Returns:
            Dict[str, Any]: Information about the requested tool(s)
            
        Raises:
            ToolError: If a specific tool is requested but not found
        """
        if tool_name:
            if tool_name not in self._tools:
                raise ToolError(
                    f"Tool '{tool_name}' not found in registry",
                    code="TOOL_NOT_FOUND"
                )
            return self._tools[tool_name].get_info()
        
        return {name: tool.get_info() for name, tool in self._tools.items()}
    
    def clear(self) -> None:
        """Clear all tools from the registry."""
        self._tools.clear()
        logger.info("Cleared all tools from registry")
    
    def __len__(self) -> int:
        return len(self._tools)
    
    def __contains__(self, tool_name: str) -> bool:
        return tool_name in self._tools
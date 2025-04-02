"""
Example usage of the MCP tools system.
"""

import asyncio
import logging
from typing import Dict, Any
from .registry import ToolRegistry
from .manager import ToolManager
from .text.analysis import TextAnalysisTool
from .document.template_engine import TemplateEngineTool
from .email.composer import EmailComposerTool
from .calendar.operations import CalendarOperationsTool

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def run_example():
    """Run example tool usage."""
    # Create tool registry
    registry = ToolRegistry()
    
    # Register tools
    registry.register_tool("text_analysis", TextAnalysisTool())
    registry.register_tool("template_engine", TemplateEngineTool())
    registry.register_tool("email_composer", EmailComposerTool())
    registry.register_tool("calendar", CalendarOperationsTool())
    
    # Create tool manager
    manager = ToolManager(registry)
    
    # Example 1: Analyze text
    logger.info("Running text analysis example...")
    text_result = await manager.execute_tool("text_analysis", {
        "text": "Apple Inc. is planning to invest $5 billion in AI research by January 15, 2026. The CEO Tim Cook announced this during their annual conference.",
        "operations": ["entities", "keywords", "sentiment"]
    })
    logger.info(f"Text analysis result: {text_result.to_dict()}")
    
    # Example 2: Fill a template
    logger.info("\nRunning template engine example...")
    template_result = await manager.execute_tool("template_engine", {
        "template": "Dear {{client_name}},\n\nThank you for your interest in {{service_name}}. Our team will contact you within {{response_time}} business days.\n\nBest regards,\nIntelliSync Solutions",
        "data": {
            "client_name": "John Smith",
            "service_name": "AI Consulting Services",
            "response_time": "2"
        }
    })
    logger.info(f"Template result: {template_result.to_dict()}")
    
    # Example 3: Compose an email
    logger.info("\nRunning email composer example...")
    email_result = await manager.execute_tool("email_composer", {
        "template_name": "follow_up",
        "recipient_name": "Sarah Johnson",
        "recipient_email": "sarah.johnson@example.com",
        "subject": "Following up on our AI implementation discussion",
        "variables": {
            "topic": "AI implementation strategy"
        }
    })
    logger.info(f"Email result: {email_result.to_dict()}")
    
    # Example 4: Create calendar event
    logger.info("\nRunning calendar operations example...")
    calendar_result = await manager.execute_tool("calendar", {
        "operation": "create_event",
        "parameters": {
            "title": "Project Kickoff Meeting",
            "description": "Initial meeting to discuss project scope and timeline",
            "start_time": "2025-01-15T10:00:00",
            "duration": 60,
            "attendees": ["john@example.com", "sarah@example.com"],
            "location": "Conference Room A"
        }
    })
    logger.info(f"Calendar result: {calendar_result.to_dict()}")
    
    # Show available tools
    logger.info("\nAvailable tools:")
    tools = manager.get_available_tools()
    for tool in tools:
        capabilities = manager.get_tool_capabilities(tool)
        logger.info(f"- {tool}: {capabilities['description']}")
    
    return "Examples completed successfully"


if __name__ == "__main__":
    # Run the event loop
    asyncio.run(run_example())
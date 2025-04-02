"""
Email composition tool for creating well-structured emails.
"""

from typing import Dict, Any, List, Optional
import logging
from ..base import Tool, ToolResult, ToolStatus, ToolError
from datetime import datetime

logger = logging.getLogger(__name__)


class EmailComposerTool(Tool):
    """
    Tool for creating well-structured emails from templates.
    
    Capabilities:
    - Generate email content from templates
    - Create appropriate subject lines
    - Format email body with proper greeting and closing
    - Include personalization based on recipient
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        """
        Initialize the email composer tool.
        
        Args:
            config: Optional configuration dictionary with settings:
                - email_templates: Dictionary of email templates by name
                - company_name: Name of the company for signatures
                - default_sender: Default sender name
        """
        super().__init__(config)
        self.email_templates = config.get("email_templates", {})
        self.company_name = config.get("company_name", "IntelliSync Solutions")
        self.default_sender = config.get("default_sender", "The IntelliSync Team")
        
        # Add default templates if not provided
        if not self.email_templates:
            self._setup_default_templates()
        
        logger.info(f"Initialized EmailComposerTool with {len(self.email_templates)} templates")
    
    async def execute(self, input_data: Dict[str, Any]) -> ToolResult:
        """
        Generate an email from the provided data.
        
        Args:
            input_data: Dictionary containing:
                - template_name: Name of the template to use
                - recipient_name: Name of the recipient
                - recipient_email: Email of the recipient
                - subject: Optional custom subject line
                - sender_name: Optional sender name
                - custom_content: Optional custom content to include
                - variables: Optional variables to fill in the template
                
        Returns:
            ToolResult: Result containing the generated email
        """
        try:
            # Extract and validate input
            template_name = input_data.get("template_name")
            recipient_name = input_data.get("recipient_name", "")
            recipient_email = input_data.get("recipient_email", "")
            custom_subject = input_data.get("subject")
            sender_name = input_data.get("sender_name", self.default_sender)
            custom_content = input_data.get("custom_content", "")
            variables = input_data.get("variables", {})
            
            if not template_name:
                raise ToolError("No template name provided", code="MISSING_TEMPLATE")
                
            if template_name not in self.email_templates:
                raise ToolError(
                    f"Template '{template_name}' not found",
                    code="UNKNOWN_TEMPLATE",
                    details={"available_templates": list(self.email_templates.keys())}
                )
            
            # Get template data
            template = self.email_templates[template_name]
            subject = custom_subject or template.get("subject", "")
            
            # Replace variables in subject
            for key, value in variables.items():
                subject = subject.replace(f"{{{key}}}", str(value))
            
            # Format the email body
            body = self._format_email_body(
                template_name=template_name,
                recipient_name=recipient_name,
                sender_name=sender_name,
                custom_content=custom_content,
                variables=variables
            )
            
            # Create email data structure
            email_data = {
                "to": recipient_email,
                "subject": subject,
                "body": body,
                "from": f"{sender_name} <noreply@intellisync.example.com>",
                "generated_at": datetime.now().isoformat()
            }
            
            # Return success result
            return ToolResult(
                status=ToolStatus.SUCCESS,
                data=email_data,
                metadata={
                    "template_name": template_name,
                    "body_length": len(body),
                    "personalized": bool(recipient_name)
                }
            )
            
        except ToolError as e:
            # Re-raise tool errors
            raise e
            
        except Exception as e:
            # Wrap other exceptions
            logger.exception(f"Error in EmailComposerTool: {str(e)}")
            raise ToolError(
                f"Failed to generate email: {str(e)}",
                code="EMAIL_GENERATION_ERROR",
                details={"error_type": type(e).__name__}
            )
    
    async def validate_input(self, input_data: Dict[str, Any]) -> bool:
        """
        Validate that the input meets the tool's requirements.
        
        Args:
            input_data: Input data to validate
            
        Returns:
            bool: True if input is valid, False otherwise
        """
        # Template name is required
        if "template_name" not in input_data:
            return False
            
        # Check if template exists
        if input_data["template_name"] not in self.email_templates:
            return False
        
        # Variables must be a dictionary if provided
        if "variables" in input_data and not isinstance(input_data["variables"], dict):
            return False
        
        return True
    
    def get_capabilities(self) -> Dict[str, Any]:
        """
        Return the tool's capabilities and metadata.
        
        Returns:
            Dict[str, Any]: Tool capabilities and metadata
        """
        return {
            "description": "Creates well-structured emails from templates",
            "templates": list(self.email_templates.keys()),
            "features": {
                "personalization": "Include recipient name and custom content",
                "variable_substitution": "Replace {variable} placeholders with values",
                "professional_formatting": "Proper greeting, body, and closing"
            },
            "input_schema": {
                "template_name": "Name of the template to use",
                "recipient_name": "Name of the recipient",
                "recipient_email": "Email of the recipient",
                "subject": "Optional custom subject line",
                "sender_name": "Optional sender name",
                "custom_content": "Optional custom content to include",
                "variables": "Optional variables to fill in the template"
            },
            "output_schema": {
                "to": "Recipient email address",
                "subject": "Email subject line",
                "body": "Formatted email body",
                "from": "Sender information",
                "generated_at": "Timestamp of generation"
            }
        }
    
    def _format_email_body(
        self,
        template_name: str,
        recipient_name: str,
        sender_name: str,
        custom_content: str,
        variables: Dict[str, Any]
    ) -> str:
        """
        Format the email body with proper greeting, content, and signature.
        
        Args:
            template_name: Name of the template to use
            recipient_name: Name of the recipient
            sender_name: Name of the sender
            custom_content: Custom content to include
            variables: Variables to fill in the template
            
        Returns:
            str: Formatted email body
        """
        template = self.email_templates[template_name]
        
        # Extract template parts
        greeting = template.get("greeting", "Hello{recipient_prefix},")
        body_template = template.get("body", "")
        closing = template.get("closing", "Best regards,")
        
        # Format greeting with recipient name if available
        recipient_prefix = f" {recipient_name}" if recipient_name else ""
        greeting = greeting.replace("{recipient_prefix}", recipient_prefix)
        
        # Replace variables in body
        body = body_template
        for key, value in variables.items():
            body = body.replace(f"{{{key}}}", str(value))
        
        # Add custom content if provided
        if custom_content:
            body += f"\n\n{custom_content}"
        
        # Compose the complete email
        email_parts = [
            greeting,
            "",  # Blank line after greeting
            body,
            "",  # Blank line before closing
            closing,
            sender_name,
            self.company_name
        ]
        
        return "\n".join(email_parts)
    
    def _setup_default_templates(self) -> None:
        """Set up default email templates."""
        self.email_templates = {
            "follow_up": {
                "subject": "Following up on our conversation",
                "greeting": "Hello{recipient_prefix},",
                "body": "I hope this email finds you well. I wanted to follow up on our previous conversation about {topic}.\n\nLet me know if you have any questions or if you'd like to schedule some time to discuss further.",
                "closing": "Best regards,"
            },
            "proposal": {
                "subject": "Proposal for {project_name}",
                "greeting": "Dear{recipient_prefix},",
                "body": "Thank you for the opportunity to present this proposal for {project_name}.\n\nBased on our discussions, we've prepared a comprehensive solution that addresses your requirements. You'll find the details attached to this email.",
                "closing": "Looking forward to your feedback,"
            },
            "meeting_request": {
                "subject": "Meeting Request: {topic}",
                "greeting": "Hello{recipient_prefix},",
                "body": "I'd like to schedule a meeting to discuss {topic}.\n\nWould you be available on {proposed_date} at {proposed_time}? If not, please let me know what times work best for you in the coming week.",
                "closing": "Thank you,"
            },
            "welcome": {
                "subject": "Welcome to IntelliSync Solutions!",
                "greeting": "Welcome{recipient_prefix}!",
                "body": "Thank you for choosing IntelliSync Solutions. We're excited to have you onboard and look forward to helping you achieve your goals.\n\nYour account has been successfully created and is now ready to use. You can log in using the credentials you provided during registration.",
                "closing": "Warm regards,"
            },
            "status_update": {
                "subject": "Status Update: {project_name}",
                "greeting": "Hello{recipient_prefix},",
                "body": "I wanted to provide you with an update on the status of {project_name}.\n\nCurrent Progress: {progress}%\n\nRecent Accomplishments:\n- {accomplishment1}\n- {accomplishment2}\n\nNext Steps:\n- {next_step1}\n- {next_step2}\n\nIs there anything specific you'd like us to prioritize or address?",
                "closing": "Best regards,"
            }
        }
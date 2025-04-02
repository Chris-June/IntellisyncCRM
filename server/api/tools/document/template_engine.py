"""
Template engine tool for generating documents from templates.
"""

from typing import Dict, Any, List, Optional
import re
import logging
import json
from ..base import Tool, ToolResult, ToolStatus, ToolError

logger = logging.getLogger(__name__)


class TemplateEngineTool(Tool):
    """
    Tool for filling templates with dynamic content to generate documents.
    
    Capabilities:
    - Variable substitution in templates
    - Conditional sections based on data
    - Loops/iterations for repeated content
    - Nested templates and includes
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        """
        Initialize the template engine tool.
        
        Args:
            config: Optional configuration dictionary with settings:
                - template_dir: Directory containing template files
                - template_cache_size: Maximum number of templates to cache
        """
        super().__init__(config)
        self.template_dir = config.get("template_dir", "./templates")
        self.template_cache_size = config.get("template_cache_size", 50)
        self.template_cache: Dict[str, str] = {}
        
        logger.info(f"Initialized TemplateEngineTool with template directory: {self.template_dir}")
    
    async def execute(self, input_data: Dict[str, Any]) -> ToolResult:
        """
        Fill a template with provided data.
        
        Args:
            input_data: Dictionary containing:
                - template: Template string or template name
                - template_file: Optional template file path (alternative to template)
                - data: Dictionary of values to fill into the template
                - output_format: Optional format for the result (text, html, markdown)
                
        Returns:
            ToolResult: Result containing the filled template
        """
        try:
            # Extract input parameters
            template_str = input_data.get("template")
            template_file = input_data.get("template_file")
            data = input_data.get("data", {})
            output_format = input_data.get("output_format", "text")
            
            # Get template content
            if template_str:
                # Use provided template string
                template_content = template_str
            elif template_file:
                # Load template from file (or cache)
                template_content = self._load_template(template_file)
            else:
                raise ToolError(
                    "No template or template_file provided",
                    code="MISSING_TEMPLATE"
                )
            
            # Process template
            processed_content = self._process_template(template_content, data)
            
            # Format output if needed
            if output_format != "text":
                processed_content = self._format_output(processed_content, output_format)
            
            # Return successful result
            return ToolResult(
                status=ToolStatus.SUCCESS,
                data={
                    "content": processed_content,
                    "format": output_format
                },
                metadata={
                    "template_length": len(template_content),
                    "output_length": len(processed_content),
                    "template_file": template_file
                }
            )
            
        except ToolError as e:
            # Re-raise tool errors
            raise e
            
        except Exception as e:
            # Wrap other exceptions
            logger.exception(f"Error in TemplateEngineTool: {str(e)}")
            raise ToolError(
                f"Failed to process template: {str(e)}",
                code="TEMPLATE_PROCESSING_ERROR",
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
        # Must have either template or template_file
        if "template" not in input_data and "template_file" not in input_data:
            return False
        
        # Data must be a dictionary if provided
        if "data" in input_data and not isinstance(input_data["data"], dict):
            return False
        
        # Validate output_format if provided
        if "output_format" in input_data:
            valid_formats = {"text", "html", "markdown", "json"}
            if input_data["output_format"] not in valid_formats:
                return False
        
        return True
    
    def get_capabilities(self) -> Dict[str, Any]:
        """
        Return the tool's capabilities and metadata.
        
        Returns:
            Dict[str, Any]: Tool capabilities and metadata
        """
        return {
            "description": "Fills templates with dynamic content to generate documents",
            "features": {
                "variable_substitution": "Replace {{variable}} placeholders with values",
                "conditionals": "Include or exclude sections based on conditions {{#if condition}}...{{/if}}",
                "loops": "Iterate over arrays with {{#each items}}...{{/each}}",
                "formatting": "Output in various formats (text, html, markdown, json)"
            },
            "input_schema": {
                "template": "Template string with placeholders",
                "template_file": "Path to template file (alternative to template)",
                "data": "Dictionary of values to fill into the template",
                "output_format": "Format for the result (text, html, markdown, json)"
            },
            "output_schema": {
                "content": "Processed template with variables replaced",
                "format": "Output format of the content"
            },
            "template_dir": self.template_dir,
            "cached_templates": len(self.template_cache)
        }
    
    def _load_template(self, template_file: str) -> str:
        """
        Load a template from file or cache.
        
        Args:
            template_file: Path to the template file
            
        Returns:
            str: Template content
            
        Raises:
            ToolError: If the template file cannot be loaded
        """
        # Check cache first
        if template_file in self.template_cache:
            return self.template_cache[template_file]
        
        # Construct full path
        template_path = f"{self.template_dir}/{template_file}"
        
        try:
            # Read template file
            with open(template_path, 'r') as file:
                template_content = file.read()
            
            # Add to cache if not full
            if len(self.template_cache) < self.template_cache_size:
                self.template_cache[template_file] = template_content
            
            return template_content
            
        except FileNotFoundError:
            raise ToolError(
                f"Template file not found: {template_file}",
                code="TEMPLATE_NOT_FOUND"
            )
        except Exception as e:
            raise ToolError(
                f"Failed to load template file: {str(e)}",
                code="TEMPLATE_LOAD_ERROR",
                details={"error_type": type(e).__name__}
            )
    
    def _process_template(self, template: str, data: Dict[str, Any]) -> str:
        """
        Process a template by filling in variables, handling conditionals, and loops.
        
        Args:
            template: Template string
            data: Data to fill into the template
            
        Returns:
            str: Processed template
        """
        # Process in multiple passes to handle different template features
        
        # Pass 1: Process conditionals
        template = self._process_conditionals(template, data)
        
        # Pass 2: Process loops
        template = self._process_loops(template, data)
        
        # Pass 3: Process variables
        template = self._process_variables(template, data)
        
        return template
    
    def _process_variables(self, template: str, data: Dict[str, Any]) -> str:
        """
        Replace {{variable}} placeholders with values from data.
        
        Args:
            template: Template string
            data: Data dictionary
            
        Returns:
            str: Template with variables replaced
        """
        def _get_nested_value(obj: Dict[str, Any], path: str) -> Any:
            """Get a value from a nested dictionary using dot notation."""
            parts = path.split('.')
            current = obj
            
            for part in parts:
                if isinstance(current, dict) and part in current:
                    current = current[part]
                else:
                    return None  # Path not found
                    
            return current
        
        # Find all variable placeholders
        var_pattern = r'\{\{([^#\/][^}]*?)\}\}'
        
        def replace_var(match):
            var_name = match.group(1).strip()
            
            # Handle nested properties with dot notation
            if '.' in var_name:
                value = _get_nested_value(data, var_name)
            else:
                value = data.get(var_name)
            
            # Convert to string or use empty string if None
            return str(value) if value is not None else ""
        
        # Replace all variables
        processed = re.sub(var_pattern, replace_var, template)
        
        return processed
    
    def _process_conditionals(self, template: str, data: Dict[str, Any]) -> str:
        """
        Process conditional sections {{#if condition}}...{{/if}}.
        
        Args:
            template: Template string
            data: Data dictionary
            
        Returns:
            str: Template with conditionals processed
        """
        # Process conditionals recursively until no more changes
        while True:
            # Find conditional blocks
            if_pattern = r'\{\{#if\s+([^}]+)\}\}(.*?)\{\{\/if\}\}'
            if_else_pattern = r'\{\{#if\s+([^}]+)\}\}(.*?)\{\{else\}\}(.*?)\{\{\/if\}\}'
            
            # Process if-else blocks first
            def replace_if_else(match):
                condition = match.group(1).strip()
                if_content = match.group(2)
                else_content = match.group(3)
                
                # Evaluate condition
                condition_value = data.get(condition, False)
                
                # Return appropriate content
                return if_content if condition_value else else_content
            
            new_template = re.sub(if_else_pattern, replace_if_else, template, flags=re.DOTALL)
            
            # Process if-only blocks
            def replace_if(match):
                condition = match.group(1).strip()
                content = match.group(2)
                
                # Evaluate condition
                condition_value = data.get(condition, False)
                
                # Return content or empty string
                return content if condition_value else ""
            
            new_template = re.sub(if_pattern, replace_if, new_template, flags=re.DOTALL)
            
            # Check if any changes were made
            if new_template == template:
                break
                
            template = new_template
        
        return template
    
    def _process_loops(self, template: str, data: Dict[str, Any]) -> str:
        """
        Process loop sections {{#each items}}...{{/each}}.
        
        Args:
            template: Template string
            data: Data dictionary
            
        Returns:
            str: Template with loops processed
        """
        # Process loops recursively until no more changes
        while True:
            # Find loop blocks
            each_pattern = r'\{\{#each\s+([^}]+)\}\}(.*?)\{\{\/each\}\}'
            
            def replace_each(match):
                array_name = match.group(1).strip()
                item_template = match.group(2)
                
                # Get array from data
                array = data.get(array_name, [])
                if not isinstance(array, list):
                    # Try to handle non-list iterables
                    try:
                        array = list(array)
                    except:
                        return ""  # Not iterable
                
                # Process each item
                result = []
                for item in array:
                    # Create item context
                    if isinstance(item, dict):
                        # For dictionaries, use the item directly
                        item_data = item
                    else:
                        # For simple values, use "this" as the value
                        item_data = {"this": item}
                    
                    # Combine with original data for access to outer scope
                    context = {**data, "item": item_data}
                    
                    # Process item template
                    item_result = self._process_template(item_template, context)
                    result.append(item_result)
                
                return "".join(result)
            
            new_template = re.sub(each_pattern, replace_each, template, flags=re.DOTALL)
            
            # Check if any changes were made
            if new_template == template:
                break
                
            template = new_template
        
        return template
    
    def _format_output(self, content: str, format_type: str) -> str:
        """
        Format the output in the requested format.
        
        Args:
            content: Processed template content
            format_type: Desired output format
            
        Returns:
            str: Formatted content
        """
        if format_type == "html":
            # Escape HTML special characters that weren't explicitly in the template
            escaped = content
            # We'd do proper HTML escaping here in a real implementation
            return escaped
            
        elif format_type == "markdown":
            # No special processing needed for markdown
            return content
            
        elif format_type == "json":
            # Try to parse the content as JSON for validation
            try:
                # If already valid JSON, return as is
                json.loads(content)
                return content
            except:
                # If not valid JSON, wrap in quotes as a JSON string
                return json.dumps(content)
        
        # Default to plain text
        return content
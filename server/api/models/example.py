"""
Example usage of the MCP models system.
"""

import asyncio
import logging
from typing import Dict, Any
from .registry import ModelRegistry
from .manager import ModelManager
from .config import ModelType

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def run_example():
    """Run example model usage."""
    # Create model registry and manager
    registry = ModelRegistry()
    manager = ModelManager(registry)
    
    # Example 1: Generate text for client intake
    logger.info("Running text generation example for client intake...")
    messages = [
        {"role": "system", "content": "You are a helpful assistant for IntelliSync CMS."},
        {"role": "user", "content": "Summarize the key business challenges from this client intake: 'We're struggling with customer response times. Our team is overwhelmed with support tickets and we can't keep up. We need an AI solution to help categorize and prioritize customer inquiries and potentially provide automated responses to common questions.'"}
    ]
    
    response, usage = await manager.generate_text(
        service_name="client_intake",
        messages=messages,
        temperature=0.2  # Lower temperature for more focused response
    )
    
    logger.info(f"Generated text: {response['choices'][0]['message']['content']}")
    logger.info(f"Usage: {usage.to_dict()}")
    
    # Example 2: Generate text for opportunity scoring
    logger.info("\nRunning text generation example for opportunity scoring...")
    messages = [
        {"role": "system", "content": "You are an AI that evaluates business opportunities and provides scores."},
        {"role": "user", "content": "Score this opportunity: 'Client needs an AI-powered customer support chatbot to handle tier-1 support questions. They have 50,000 customers and receive approximately 500 support tickets daily. Their team of 5 support agents is overwhelmed. They use Zendesk as their ticketing system.'"}
    ]
    
    response, usage = await manager.generate_text(
        service_name="opportunity_scoring",
        messages=messages,
        temperature=0.1  # Even lower for consistent scoring
    )
    
    logger.info(f"Generated text: {response['choices'][0]['message']['content']}")
    logger.info(f"Usage: {usage.to_dict()}")
    
    # Example 3: Generate embeddings for semantic search
    logger.info("\nRunning embeddings generation example...")
    texts = [
        "Customer service automation solution",
        "AI-powered support ticket prioritization",
        "Machine learning for response time optimization"
    ]
    
    response, usage = await manager.generate_embeddings(
        service_name="discovery_analysis",
        texts=texts
    )
    
    logger.info(f"Generated {len(response['data'])} embeddings")
    logger.info(f"Embedding dimensions: {len(response['data'][0]['embedding'])}")
    logger.info(f"Usage: {usage.to_dict()}")
    
    # Print model configurations for different services
    logger.info("\nModel configurations for services:")
    for service, config in registry.get_all_service_configurations().items():
        logger.info(f"- {service}: {config['model']} (Tier: {config['tier']})")
    
    # Print usage statistics
    logger.info("\nUsage statistics:")
    stats = manager.get_usage_statistics()
    logger.info(f"Total requests: {stats['total_requests']}")
    logger.info(f"Total tokens: {stats['total_tokens']}")
    logger.info(f"Total cost: ${stats['total_cost']:.4f}")
    
    return "Examples completed successfully"


if __name__ == "__main__":
    # Run the event loop
    asyncio.run(run_example())
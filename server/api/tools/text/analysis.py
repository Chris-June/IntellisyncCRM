"""
Text analysis tool for extracting information from text.
"""

from typing import Dict, Any, List, Optional
import re
import logging
from ..base import Tool, ToolResult, ToolStatus, ToolError

logger = logging.getLogger(__name__)


class TextAnalysisTool(Tool):
    """
    Tool for analyzing text to extract entities, sentiment, and key information.
    
    Capabilities:
    - Entity extraction: Names, organizations, locations, dates, etc.
    - Keyword extraction: Important terms and phrases
    - Sentiment analysis: Positive, negative, or neutral sentiment
    - Topic classification: Categorize text into predefined topics
    """
    
    def __init__(self, config: Dict[str, Any] = None):
        """
        Initialize the text analysis tool.
        
        Args:
            config: Optional configuration dictionary with settings:
                - entity_types: List of entity types to extract
                - min_keyword_length: Minimum length for keywords
                - max_keywords: Maximum number of keywords to extract
                - topic_model: Path to topic classification model
        """
        super().__init__(config)
        self.entity_types = config.get("entity_types", ["PERSON", "ORG", "GPE", "DATE", "MONEY"])
        self.min_keyword_length = config.get("min_keyword_length", 4)
        self.max_keywords = config.get("max_keywords", 10)
        
        # In a real implementation, we would load NLP models here
        # For example: spaCy, NLTK, or custom models
        
        logger.info(f"Initialized TextAnalysisTool with {len(self.entity_types)} entity types")
    
    async def execute(self, input_data: Dict[str, Any]) -> ToolResult:
        """
        Execute text analysis on the provided text.
        
        Args:
            input_data: Dictionary containing:
                - text: Text to analyze
                - operations: List of operations to perform (entities, keywords, sentiment, topics)
                
        Returns:
            ToolResult: Result containing extracted information
        """
        try:
            # Extract and validate input
            text = input_data.get("text", "")
            operations = input_data.get("operations", ["entities", "keywords"])
            
            if not text:
                raise ToolError("No text provided for analysis", code="MISSING_TEXT")
            
            results = {}
            
            # Perform requested operations
            if "entities" in operations:
                results["entities"] = self._extract_entities(text)
                
            if "keywords" in operations:
                results["keywords"] = self._extract_keywords(text)
                
            if "sentiment" in operations:
                results["sentiment"] = self._analyze_sentiment(text)
                
            if "topics" in operations:
                results["topics"] = self._classify_topics(text)
            
            # Create success result
            return ToolResult(
                status=ToolStatus.SUCCESS,
                data=results,
                metadata={
                    "text_length": len(text),
                    "operations": operations
                }
            )
            
        except ToolError as e:
            # Re-raise tool errors
            raise e
            
        except Exception as e:
            # Wrap other exceptions
            logger.exception(f"Error in TextAnalysisTool: {str(e)}")
            raise ToolError(
                f"Failed to analyze text: {str(e)}",
                code="TEXT_ANALYSIS_ERROR",
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
        # Check for required text field
        if "text" not in input_data or not isinstance(input_data["text"], str):
            return False
            
        # Validate operations if provided
        if "operations" in input_data:
            if not isinstance(input_data["operations"], list):
                return False
                
            valid_operations = {"entities", "keywords", "sentiment", "topics"}
            if not all(op in valid_operations for op in input_data["operations"]):
                return False
        
        return True
    
    def get_capabilities(self) -> Dict[str, Any]:
        """
        Return the tool's capabilities and metadata.
        
        Returns:
            Dict[str, Any]: Tool capabilities and metadata
        """
        return {
            "description": "Analyzes text to extract entities, keywords, sentiment, and topics",
            "operations": {
                "entities": "Extract named entities (people, organizations, locations, etc.)",
                "keywords": "Extract important keywords and phrases",
                "sentiment": "Analyze sentiment (positive, negative, neutral)",
                "topics": "Classify text into predefined topics"
            },
            "input_schema": {
                "text": "String containing the text to analyze",
                "operations": "Optional list of operations to perform"
            },
            "output_schema": {
                "entities": "Dictionary mapping entity types to lists of entities",
                "keywords": "List of important keywords in the text",
                "sentiment": "Object containing sentiment scores",
                "topics": "Object containing topic classifications"
            },
            "entity_types": self.entity_types,
            "performance": {
                "avg_processing_time": "~100ms per 1KB of text"
            }
        }
    
    def _extract_entities(self, text: str) -> Dict[str, List[str]]:
        """
        Extract named entities from text.
        
        Args:
            text: Text to analyze
            
        Returns:
            Dict[str, List[str]]: Mapping of entity types to lists of entities
        """
        # This is a simplified implementation
        # In a real tool, we would use a proper NLP library (spaCy, NLTK, etc.)
        
        entities = {entity_type: [] for entity_type in self.entity_types}
        
        # Simple regex-based extraction for demonstration
        # PERSON: Capitalized words preceded by Mr., Ms., Dr., etc.
        person_matches = re.findall(r'\b(Mr\.|Ms\.|Mrs\.|Dr\.|Prof\.)\s([A-Z][a-z]+(?:\s[A-Z][a-z]+)*)', text)
        entities["PERSON"].extend([match[1] for match in person_matches])
        
        # More capitalized words that might be names
        name_matches = re.findall(r'\b([A-Z][a-z]+(?:\s[A-Z][a-z]+){1,2})\b', text)
        entities["PERSON"].extend(name_matches)
        
        # ORG: Words ending in Inc., Corp., LLC, etc.
        org_matches = re.findall(r'\b([A-Za-z]+(?:\s[A-Za-z]+)*)\s(Inc\.|Corp\.|LLC|Ltd\.)', text)
        entities["ORG"].extend([match[0] for match in org_matches])
        
        # DATE: Simple date patterns
        date_matches = re.findall(r'\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b', text)
        date_matches.extend(re.findall(r'\b(January|February|March|April|May|June|July|August|September|October|November|December)\s\d{1,2},\s\d{4}\b', text))
        entities["DATE"] = date_matches
        
        # MONEY: Dollar amounts
        money_matches = re.findall(r'\$\d+(?:\.\d{2})?', text)
        entities["MONEY"] = money_matches
        
        # Remove duplicates
        for entity_type in entities:
            entities[entity_type] = list(set(entities[entity_type]))
        
        return entities
    
    def _extract_keywords(self, text: str) -> List[str]:
        """
        Extract important keywords from text.
        
        Args:
            text: Text to analyze
            
        Returns:
            List[str]: List of keywords
        """
        # In a real implementation, we would use TF-IDF, TextRank, or similar algorithms
        
        # Remove punctuation and convert to lowercase
        text = re.sub(r'[^\w\s]', '', text.lower())
        
        # Split into words
        words = text.split()
        
        # Remove common stop words
        stop_words = {
            "the", "and", "is", "in", "it", "to", "of", "for", "with", "on", 
            "that", "by", "this", "be", "are", "from", "at", "as", "an", "was",
            "were", "have", "has", "had", "a", "but", "or", "if", "than", "then"
        }
        filtered_words = [word for word in words if word not in stop_words and len(word) >= self.min_keyword_length]
        
        # Count word frequencies
        word_counts = {}
        for word in filtered_words:
            word_counts[word] = word_counts.get(word, 0) + 1
        
        # Sort by frequency
        sorted_words = sorted(word_counts.items(), key=lambda x: x[1], reverse=True)
        
        # Take top keywords
        keywords = [word for word, count in sorted_words[:self.max_keywords]]
        
        return keywords
    
    def _analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """
        Analyze sentiment in text.
        
        Args:
            text: Text to analyze
            
        Returns:
            Dict[str, Any]: Sentiment analysis results
        """
        # In a real implementation, we would use a sentiment analysis model
        
        # Simple lexicon-based approach for demonstration
        positive_words = {
            "good", "great", "excellent", "amazing", "wonderful", "fantastic",
            "best", "happy", "pleased", "love", "like", "enjoy", "awesome",
            "beneficial", "better", "outstanding", "perfect", "positive"
        }
        
        negative_words = {
            "bad", "terrible", "horrible", "awful", "worst", "poor", "negative",
            "hate", "dislike", "disappointed", "disappointing", "problem",
            "failure", "fail", "failed", "worse", "difficult", "angry"
        }
        
        # Normalize text
        text = re.sub(r'[^\w\s]', '', text.lower())
        words = text.split()
        
        # Count sentiment words
        positive_count = sum(1 for word in words if word in positive_words)
        negative_count = sum(1 for word in words if word in negative_words)
        total_count = len(words)
        
        # Calculate sentiment scores
        if total_count > 0:
            positive_score = positive_count / total_count
            negative_score = negative_count / total_count
            
            # Compound score: difference between positive and negative, normalized to [-1, 1]
            compound = (positive_count - negative_count) / total_count
        else:
            positive_score = 0
            negative_score = 0
            compound = 0
        
        # Determine overall sentiment
        if compound > 0.05:
            label = "positive"
        elif compound < -0.05:
            label = "negative"
        else:
            label = "neutral"
        
        return {
            "label": label,
            "scores": {
                "positive": positive_score,
                "negative": negative_score,
                "compound": compound
            },
            "word_counts": {
                "positive": positive_count,
                "negative": negative_count,
                "total": total_count
            }
        }
    
    def _classify_topics(self, text: str) -> Dict[str, float]:
        """
        Classify text into predefined topics.
        
        Args:
            text: Text to analyze
            
        Returns:
            Dict[str, float]: Topic classification scores
        """
        # In a real implementation, we would use a topic classification model
        
        # Simple keyword-based approach for demonstration
        topic_keywords = {
            "business": [
                "company", "market", "business", "industry", "product", "service",
                "customer", "client", "revenue", "profit", "strategy", "sales"
            ],
            "technology": [
                "technology", "software", "hardware", "data", "system", "computer",
                "network", "internet", "application", "programming", "code", "tech"
            ],
            "health": [
                "health", "medical", "doctor", "patient", "hospital", "treatment",
                "disease", "care", "medicine", "therapy", "diagnosis", "healthcare"
            ],
            "finance": [
                "finance", "financial", "money", "investment", "bank", "fund",
                "stock", "market", "investor", "asset", "portfolio", "capital"
            ]
        }
        
        # Normalize text
        text = re.sub(r'[^\w\s]', '', text.lower())
        words = set(text.split())  # Use set to count each unique word only once
        
        # Calculate topic scores
        topic_scores = {}
        for topic, keywords in topic_keywords.items():
            # Count matching keywords
            matches = sum(1 for keyword in keywords if keyword in words)
            
            # Calculate score as percentage of matched keywords
            topic_scores[topic] = matches / len(keywords)
        
        # Sort by score (highest first)
        sorted_topics = sorted(topic_scores.items(), key=lambda x: x[1], reverse=True)
        
        # Determine primary topic
        primary_topic = sorted_topics[0][0] if sorted_topics and sorted_topics[0][1] > 0.1 else "general"
        
        return {
            "primary_topic": primary_topic,
            "topic_scores": dict(sorted_topics),
            "confidence": sorted_topics[0][1] if sorted_topics else 0
        }
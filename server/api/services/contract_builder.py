from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

router = APIRouter(prefix="/contracts", tags=["contract-builder"])

class ContractType(str, Enum):
    SERVICE_AGREEMENT = "service_agreement"
    NDA = "nda"
    SOW = "sow"

class ContractStatus(str, Enum):
    DRAFT = "draft"
    PENDING_REVIEW = "pending_review"
    FINAL = "final"

class ContractTerms(BaseModel):
    payment_terms: str
    delivery_schedule: str
    special_conditions: List[str]

class ScopeDetails(BaseModel):
    included_services: List[str]
    exclusions: List[str]
    deliverables: List[str]

class ContractCustomizations(BaseModel):
    terms: ContractTerms
    scope: ScopeDetails

class ContractRequest(BaseModel):
    proposal_id: str
    contract_type: ContractType
    client_id: str
    customizations: ContractCustomizations

class ContractMetadata(BaseModel):
    template_used: str
    custom_clauses: List[str]
    approval_required: bool

class Contract(BaseModel):
    id: str
    proposal_id: str
    client_id: str
    type: ContractType
    status: ContractStatus
    content: str
    version: str
    metadata: ContractMetadata
    created_at: datetime
    updated_at: datetime

@router.post("/build")
async def build_contract(request: ContractRequest):
    """
    Generates a new contract from proposal data.
    """
    try:
        return {
            "contract_id": "contract-123",
            "status": ContractStatus.DRAFT,
            "document_url": "https://example.com/contracts/123",
            "version": "1.0.0",
            "generated_at": datetime.now(),
            "metadata": {
                "template_used": "standard_service_agreement",
                "custom_clauses": ["data_protection", "ai_usage_rights"],
                "approval_required": True
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{contract_id}")
async def get_contract_status(contract_id: str):
    """
    Retrieves the current status and details of a contract.
    """
    try:
        return {
            "id": contract_id,
            "status": ContractStatus.PENDING_REVIEW,
            "version": "1.0.0",
            "last_modified": datetime.now(),
            "reviewers": [
                {
                    "id": "user-123",
                    "name": "John Doe",
                    "status": "pending"
                }
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{contract_id}")
async def update_contract(contract_id: str, updates: Dict[str, Any]):
    """
    Updates an existing contract with new terms or revisions.
    """
    try:
        return {
            "id": contract_id,
            "status": ContractStatus.DRAFT,
            "version": "1.1.0",
            "updated_at": datetime.now(),
            "changes": [
                {
                    "field": "payment_terms",
                    "old_value": "net_30",
                    "new_value": "net_45"
                }
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/templates")
async def list_templates():
    """
    Returns available contract templates.
    """
    try:
        return {
            "templates": [
                {
                    "id": "template-123",
                    "name": "Standard Service Agreement",
                    "type": ContractType.SERVICE_AGREEMENT,
                    "version": "2.0.0",
                    "last_updated": datetime.now()
                }
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{contract_id}/review")
async def submit_for_review(contract_id: str):
    """
    Submits a contract for internal review.
    """
    try:
        return {
            "id": contract_id,
            "status": ContractStatus.PENDING_REVIEW,
            "submitted_at": datetime.now(),
            "reviewers": [
                {
                    "id": "user-123",
                    "name": "John Doe",
                    "role": "legal_review"
                }
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{contract_id}/approve")
async def approve_contract(contract_id: str, reviewer_id: str, comments: Optional[str] = None):
    """
    Approves a contract after review.
    """
    try:
        return {
            "id": contract_id,
            "status": ContractStatus.FINAL,
            "approved_at": datetime.now(),
            "approved_by": reviewer_id,
            "comments": comments
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{contract_id}/history")
async def get_contract_history(contract_id: str):
    """
    Retrieves the version history of a contract.
    """
    try:
        return {
            "contract_id": contract_id,
            "versions": [
                {
                    "version": "1.0.0",
                    "status": ContractStatus.FINAL,
                    "created_at": datetime.now(),
                    "created_by": "user-123",
                    "changes": ["Initial version"]
                }
            ]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{contract_id}/export")
async def export_contract(contract_id: str, format: str = "pdf"):
    """
    Exports a contract in the specified format.
    """
    try:
        return {
            "contract_id": contract_id,
            "format": format,
            "download_url": f"https://example.com/contracts/{contract_id}.{format}",
            "expires_at": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
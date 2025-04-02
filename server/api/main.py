from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import os
from dotenv import load_dotenv
from services import task_decomposer, agent_launcher, agent_orchestrator, calendar, revision_tracker, client_intake, discovery_analysis, opportunity_scoring, sales_funnel, contract_builder, client_approval, close_summary, retrospective, reengagement, filesystem, workflow_template, meeting_notes, deal_risk_detector, follow_up_reminder, project_management, context_controller
from routes import model_routes

# Load environment variables
load_dotenv()

app = FastAPI(
    title="IntelliSync CMS - MCP API",
    description="Model Context Protocol API for IntelliSync CMS",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update this for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(task_decomposer.router)
app.include_router(agent_launcher.router)
app.include_router(agent_orchestrator.router)
app.include_router(calendar.router)
app.include_router(revision_tracker.router)
app.include_router(client_intake.router)
app.include_router(discovery_analysis.router)
app.include_router(opportunity_scoring.router)
app.include_router(sales_funnel.router)
app.include_router(contract_builder.router)
app.include_router(client_approval.router)
app.include_router(close_summary.router)
app.include_router(retrospective.router)
app.include_router(reengagement.router)
app.include_router(filesystem.router)
app.include_router(workflow_template.router)
app.include_router(meeting_notes.router)
app.include_router(deal_risk_detector.router)
app.include_router(follow_up_reminder.router)
app.include_router(project_management.router)
app.include_router(context_controller.router)

# Include model routes
app.include_router(model_routes.router)

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "mcp-api"}

# Version endpoint
@app.get("/version")
async def version():
    return {"version": "1.0.0", "name": "IntelliSync CMS - MCP API"}
# Product Requirements Document (PRD)

## Product Name: IntelliSync CMS – AI-First Client Management System

## Overview
IntelliSync CMS is a modular, AI-first Client Management System designed to support the core operations of IntelliSync Solutions. It empowers our team and clients with intelligent, agent-driven workflows for onboarding, sales, project execution, and lifecycle management—all built atop a robust CRM foundation. The CMS integrates modular MCP (Model Context Protocol) agents that execute context-aware tasks and collaborate across the client lifecycle.

## 1. Goals & Objectives
- Centralize and automate all client-related operations
- Improve productivity and reduce manual workload via intelligent agents
- Enable scalable multi-agent workflows across key business phases
- Create reusable IP and workflows for custom AI services delivery
- Provide transparency, insights, and operational clarity to both clients and the team

## 2. Core Modules (Agent Workflows)

### 2.1 Client Intake Agent Module
**Purpose:** Capture client identity, needs, goals, and pain points

**Key Features:**
- Structured and conversational intake (via form/chat)
- AI-powered pain point and opportunity analysis
- Auto-tagging of CRM profile
- Onboarding summary generation

**MCP Servers & Endpoints:**
- `client-intake-server`
  - `POST /intake/start` – Start a new intake session
  - `POST /intake/update` – Append responses to the session
  - `GET /intake/{client_id}` – Retrieve completed intake summary
- `discovery-analysis-server`
  - `POST /analyze` – Analyze intake data for opportunities
- `opportunity-scoring-agent`
  - `POST /score` – Return opportunity score and recommendations

### 2.2 Sales Management Agent Module
**Purpose:** Manage lead funnel and proposal lifecycle

**Key Features:**
- Lead stage tracking (Discovery > Proposal > Negotiation > Closed)
- Proposal and SOW generation
- Risk detection and follow-up recommendations
- Client communication logging

**MCP Servers & Endpoints:**
- `sales-funnel-server`
  - `GET /leads` – List leads by stage
  - `POST /leads` – Add new lead
  - `PUT /leads/{id}/stage` – Update stage
  - `GET /leads/{id}` – Get lead record
- `proposal-generator-server`
  - `POST /generate` – Generate a proposal
  - `GET /proposals/{client_id}` – Retrieve proposals
- `contract-builder-server`
  - `POST /build` – Generate contract from proposal
- `deal-risk-detector`
  - `GET /risks/{lead_id}` – Detect risk or stagnation
- `follow-up-reminder-server`
  - `GET /reminders/{user_id}` – List follow-up reminders
  - `POST /reminders/snooze` – Delay reminder

### 2.3 Project Management Agent Module
**Purpose:** Manage post-sale project delivery

**Key Features:**
- Job order generation and task decomposition
- Deliverable tracking
- Agent task assignments and oversight
- Calendar integration for milestones
- Progress monitoring and revision tracking

**MCP Servers & Endpoints:**
- `project-management-server`
  - `POST /projects` – Create project
  - `GET /projects/{client_id}` – Retrieve client projects
  - `PUT /projects/{id}` – Update project
- `task-decomposer-server`
  - `POST /decompose` – Break scope into tasks
- `agent-launcher-server`
  - `POST /agent` – Launch agent for task
  - `GET /agent/status/{id}` – Check agent status
- `calendar-server` – Schedule events and deadlines
- `revision-tracker-server`
  - `POST /revisions` – Log revision
  - `GET /revisions/{project_id}` – View history
- `client-approval-server`
  - `POST /submit` – Submit deliverable for approval
  - `GET /approvals/{client_id}` – Retrieve approval status

### 2.4 Close/Won or Lost Agent Module
**Purpose:** Finalize deals, handoff, and track re-engagement

**Key Features:**
- Project retrospective generation
- Client handoff package generation
- Loss tracking and analysis
- Re-engagement and upsell timing

**MCP Servers & Endpoints:**
- `close-summary-generator`
  - `POST /summarize` – Generate close-out summary
- `retrospective-agent`
  - `POST /retrospective` – Run retrospective analysis
- `client-reengagement-timer`
  - `POST /set` – Set check-in timer
  - `GET /upcoming/{user_id}` – View upcoming check-ins

## 3. CRM Foundation Layer
Shared across all modules.

**Core Entities:**
- Clients (contacts, org, industry, tags)
- Opportunities (needs, goals, value potential)
- Deals (status, pipeline stage, close reason)
- Projects (tasks, job orders, agents)
- Tasks (assignee, deadline, deliverables)
- Communications (notes, emails, meetings)

## 4. Shared MCP Tools & Infrastructure
Each tool is a standalone Python FastAPI microservice integrated with the MCP + OpenAI Agent SDK stack.

### `filesystem-server`
- `GET /files/{project_id}`
- `POST /files/upload`
- `DELETE /files/{file_id}`

### `calendar-server`
- `POST /events`
- `GET /events/{client_id}`
- `DELETE /events/{event_id}`

### `agent-orchestrator-server`
- `POST /launch`
- `GET /status/{agent_id}`
- `POST /stop`

### `workflow-template-server`
- `GET /templates`
- `POST /templates`
- `DELETE /templates/{id}`

### `meeting-notes-summarizer`
- `POST /summarize`
- `GET /history/{client_id}`

### `context-controller-server`
- `POST /switch`
- `GET /current`
- `POST /rollback`

### `memory-manager-server`
- `POST /remember`
- `GET /recall?type={scope}`
- `DELETE /forget/{id}`

## 5. MVP Scope & Build Phases

### Phase 1
- CRM Foundation (Supabase)
- Client Intake Agent Module
- Sales Management Agent Module
- Shared Services (Calendar, Files, Meeting Summaries)

### Phase 2
- Project Management Agent Module
- Close/Won or Lost Agent Module
- Feedback & Re-engagement Systems

## 6. Success Metrics
- Time saved per client engagement
- Reduction in manual proposal generation
- Agent execution success rate
- Client retention and re-engagement lift
- User feedback on CMS visibility and ease of use

## 7. Integrations
- Supabase (CRM)
- Stripe (payments)
- Calendly / Google Calendar
- OpenAI Agent SDK + MCP SDK
- GPT-4o-mini, GPT-4o, GPT-o1, reasoning/vision models
- Email & Notification Layer

## 8. Tech Stack
**Frontend:**
- Vite, React, ShadCN, Lucide-react, Framer-motion

**Backend:**
- Python (FastAPI), Pydantic, async orchestration

**Database:**
- Supabase (Postgres + Auth)

**AI & LLM:**
- OpenAI Models (GPT-4o-mini, GPT-4o, GPT-o1, Vision)
- MCP SDK + Agent SDK

**DevOps:**
- GitHub Actions, CI/CD

## 9. Future Vision
- Plug-and-play agent marketplace
- Multi-org + white-labeled deployments
- Client self-serve AI workflow builder
- Memory-based agent refinement
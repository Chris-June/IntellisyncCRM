# IntelliSync CMS - MCP API Server

## Overview
This is the Model Context Protocol (MCP) API server for IntelliSync CMS. It provides the backend services for client intake, agent orchestration, and memory management.

## Setup
1. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

2. Set up environment variables:
   ```bash
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. Run the server:
   ```bash
   uvicorn main:app --reload
   ```

## API Documentation
Once running, visit `/docs` for the OpenAPI documentation.

## Project Structure
- `/services` - MCP service modules
- `/utils` - Shared utilities
- `main.py` - FastAPI application entry point
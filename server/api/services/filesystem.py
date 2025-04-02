from fastapi import APIRouter, HTTPException, UploadFile, File, Form, Depends
from fastapi.responses import FileResponse
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum
import os
import shutil
import uuid

router = APIRouter(prefix="/files", tags=["filesystem"])

class FileCategory(str, Enum):
    DOCUMENT = "document"
    IMAGE = "image"
    VIDEO = "video"
    AUDIO = "audio"
    CODE = "code"
    DATA = "data"
    OTHER = "other"

class FileVisibility(str, Enum):
    PUBLIC = "public"
    PRIVATE = "private"
    SHARED = "shared"

UPLOAD_DIR = "/tmp/uploads"  # In production, use a proper storage solution
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    project_id: str = Form(...),
    category: FileCategory = Form(FileCategory.OTHER),
    description: Optional[str] = Form(None),
    visibility: FileVisibility = Form(FileVisibility.PRIVATE),
    tags: Optional[str] = Form(None),
    metadata: Optional[str] = Form(None)
):
    """
    Upload a file to the project filesystem.
    """
    try:
        file_id = str(uuid.uuid4())
        file_extension = os.path.splitext(file.filename)[1] if file.filename else ""
        new_filename = f"{file_id}{file_extension}"
        
        # Create project directory if it doesn't exist
        project_dir = os.path.join(UPLOAD_DIR, project_id)
        os.makedirs(project_dir, exist_ok=True)
        
        file_path = os.path.join(project_dir, new_filename)
        
        # Save the file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Process tags if provided
        tag_list = tags.split(",") if tags else []
        
        return {
            "file_id": file_id,
            "project_id": project_id,
            "original_filename": file.filename,
            "size": os.path.getsize(file_path),
            "category": category,
            "description": description,
            "visibility": visibility,
            "tags": tag_list,
            "metadata": metadata,
            "uploaded_at": datetime.now(),
            "download_url": f"/files/{project_id}/{file_id}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{project_id}")
async def list_project_files(
    project_id: str,
    category: Optional[FileCategory] = None,
    visibility: Optional[FileVisibility] = None
):
    """
    List all files in a project.
    """
    try:
        project_dir = os.path.join(UPLOAD_DIR, project_id)
        
        if not os.path.exists(project_dir):
            return {"files": [], "total": 0}
        
        # In a real implementation, this would query a database instead
        files = []
        for filename in os.listdir(project_dir):
            file_path = os.path.join(project_dir, filename)
            if os.path.isfile(file_path):
                file_id = os.path.splitext(filename)[0]
                files.append({
                    "file_id": file_id,
                    "filename": filename,
                    "size": os.path.getsize(file_path),
                    "last_modified": datetime.fromtimestamp(os.path.getmtime(file_path)),
                    "download_url": f"/files/{project_id}/{file_id}"
                })
                
        return {"files": files, "total": len(files)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{project_id}/{file_id}")
async def download_file(project_id: str, file_id: str):
    """
    Download a specific file.
    """
    try:
        project_dir = os.path.join(UPLOAD_DIR, project_id)
        
        # Find the file with the matching ID prefix
        for filename in os.listdir(project_dir):
            if filename.startswith(file_id):
                file_path = os.path.join(project_dir, filename)
                return FileResponse(
                    path=file_path,
                    filename=filename,
                    media_type="application/octet-stream"
                )
                
        raise HTTPException(status_code=404, detail="File not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{project_id}/{file_id}")
async def delete_file(project_id: str, file_id: str):
    """
    Delete a file from the project.
    """
    try:
        project_dir = os.path.join(UPLOAD_DIR, project_id)
        
        # Find and delete the file with the matching ID prefix
        for filename in os.listdir(project_dir):
            if filename.startswith(file_id):
                file_path = os.path.join(project_dir, filename)
                os.remove(file_path)
                return {"status": "deleted", "file_id": file_id}
                
        raise HTTPException(status_code=404, detail="File not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/rename/{project_id}/{file_id}")
async def rename_file(project_id: str, file_id: str, new_name: str):
    """
    Rename a file.
    """
    try:
        project_dir = os.path.join(UPLOAD_DIR, project_id)
        
        # Find the file with the matching ID prefix
        for filename in os.listdir(project_dir):
            if filename.startswith(file_id):
                file_path = os.path.join(project_dir, filename)
                file_extension = os.path.splitext(filename)[1]
                new_filename = f"{file_id}_{new_name}{file_extension}"
                new_file_path = os.path.join(project_dir, new_filename)
                
                os.rename(file_path, new_file_path)
                
                return {
                    "file_id": file_id,
                    "original_filename": filename,
                    "new_filename": new_filename,
                    "download_url": f"/files/{project_id}/{file_id}"
                }
                
        raise HTTPException(status_code=404, detail="File not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/share/{project_id}/{file_id}")
async def share_file(
    project_id: str,
    file_id: str,
    visibility: FileVisibility,
    share_with: Optional[List[str]] = None,
    expiration: Optional[datetime] = None
):
    """
    Share a file with specific users or make it publicly accessible.
    """
    try:
        # In a real implementation, this would update a database entry
        return {
            "file_id": file_id,
            "project_id": project_id,
            "visibility": visibility,
            "shared_with": share_with,
            "expiration": expiration,
            "share_url": f"https://example.com/shared/{file_id}",
            "shared_at": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/folders/{project_id}")
async def create_folder(project_id: str, folder_name: str):
    """
    Create a new folder in the project.
    """
    try:
        project_dir = os.path.join(UPLOAD_DIR, project_id)
        os.makedirs(project_dir, exist_ok=True)
        
        folder_id = str(uuid.uuid4())
        folder_path = os.path.join(project_dir, f"{folder_id}_{folder_name}")
        os.makedirs(folder_path, exist_ok=True)
        
        return {
            "folder_id": folder_id,
            "project_id": project_id,
            "folder_name": folder_name,
            "created_at": datetime.now()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/search")
async def search_files(
    query: str,
    project_id: Optional[str] = None,
    category: Optional[FileCategory] = None
):
    """
    Search for files by name, description, or tag.
    """
    try:
        # In a real implementation, this would perform a database search
        return {
            "query": query,
            "project_id": project_id,
            "category": category,
            "results": [
                {
                    "file_id": "file-123",
                    "filename": "example.docx",
                    "project_id": project_id or "project-456",
                    "category": FileCategory.DOCUMENT,
                    "description": "Example document containing search term",
                    "matches": ["title", "content"],
                    "relevance_score": 0.85,
                    "last_modified": datetime.now()
                }
            ],
            "total": 1
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
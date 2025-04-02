from supabase import create_client, Client
from typing import Optional
import os

def get_supabase_client() -> Optional[Client]:
    try:
        url = os.getenv("SUPABASE_URL")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
        
        if not url or not key:
            raise ValueError("Missing Supabase credentials")
            
        return create_client(url, key)
    except Exception as e:
        print(f"Error creating Supabase client: {str(e)}")
        return None
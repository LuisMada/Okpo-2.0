from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
import json
import os
from datetime import datetime
import uuid
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="OkPo Prompt Compiler API", version="1.0.0")

# CORS middleware for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Data models
class PromptBlock(BaseModel):
    id: str
    name: str
    description: str
    content: str
    layer_type: str
    version: int
    author: str
    created_at: str
    change_comment: str
    tags: List[str] = []
    parent_id: Optional[str] = None

class PromptStack(BaseModel):
    id: str
    name: str
    description: str
    prompts: Dict[str, str]  # layer_type -> prompt_id
    weights: Dict[str, int] = {}
    locks: Dict[str, bool] = {}
    created_at: str
    author: str

class LayerType(BaseModel):
    name: str
    description: str
    order: int
    required: bool = False

# In-memory storage (JSON file persistence)
DATA_FILE = "prompt_data.json"

def load_data():
    """Load data from JSON file or return default structure"""
    if os.path.exists(DATA_FILE):
        try:
            with open(DATA_FILE, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading data: {e}")
    
    # Default data structure
    return {
        "prompts": {},
        "stacks": {},
        "layer_types": {
            "global": {"name": "global", "description": "Universal rules and constraints", "order": 1, "required": True},
            "company": {"name": "company", "description": "Brand voice and company-specific guidelines", "order": 2, "required": False},
            "task": {"name": "task", "description": "Specific task instructions", "order": 3, "required": True},
            "campaign": {"name": "campaign", "description": "Campaign or project-specific context", "order": 4, "required": False},
            "memory": {"name": "memory", "description": "Session memory and context", "order": 5, "required": False}
        }
    }

def save_data(data):
    """Save data to JSON file"""
    try:
        with open(DATA_FILE, 'w') as f:
            json.dump(data, f, indent=2)
        return True
    except Exception as e:
        print(f"Error saving data: {e}")
        return False

# Initialize data
data_store = load_data()

@app.get("/")
async def root():
    return {"message": "OkPo Prompt Compiler API", "status": "running"}

@app.get("/api/layer-types")
async def get_layer_types():
    """Get all available layer types"""
    return {"layer_types": list(data_store["layer_types"].values())}

@app.get("/api/prompts")
async def get_prompts(layer_type: Optional[str] = None):
    """Get all prompts, optionally filtered by layer type"""
    prompts = list(data_store["prompts"].values())
    
    if layer_type:
        prompts = [p for p in prompts if p["layer_type"] == layer_type]
    
    # Sort by creation date, newest first
    prompts.sort(key=lambda x: x["created_at"], reverse=True)
    
    return {"prompts": prompts}

@app.get("/api/prompts/{prompt_id}")
async def get_prompt(prompt_id: str):
    """Get specific prompt by ID"""
    if prompt_id not in data_store["prompts"]:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    return {"prompt": data_store["prompts"][prompt_id]}

@app.get("/api/prompts/{prompt_id}/versions")
async def get_prompt_versions(prompt_id: str):
    """Get all versions of a prompt (including the current one and its ancestors)"""
    if prompt_id not in data_store["prompts"]:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    versions = []
    current_prompt = data_store["prompts"][prompt_id]
    versions.append(current_prompt)
    
    # Traverse back through parent versions
    parent_id = current_prompt.get("parent_id")
    while parent_id and parent_id in data_store["prompts"]:
        parent_prompt = data_store["prompts"][parent_id]
        versions.append(parent_prompt)
        parent_id = parent_prompt.get("parent_id")
    
    return {"versions": versions}

@app.post("/api/prompts")
async def create_prompt(prompt_data: dict):
    """Create a new prompt block"""
    
    # Extract data from request body
    name = prompt_data.get('name', '').strip()
    description = prompt_data.get('description', '').strip()
    content = prompt_data.get('content', '').strip()
    layer_type = prompt_data.get('layer_type', 'global')
    author = prompt_data.get('author', 'User')
    change_comment = prompt_data.get('change_comment', '').strip()
    tags = prompt_data.get('tags', [])
    parent_id = prompt_data.get('parent_id')
    
    # Validation
    if not name or not content:
        raise HTTPException(status_code=400, detail="Name and content are required")
    
    if not change_comment:
        raise HTTPException(status_code=400, detail="Change comment is required")
    
    # Validate layer type
    if layer_type not in data_store["layer_types"]:
        raise HTTPException(status_code=400, detail="Invalid layer type")
    
    # Generate new version
    version = 1
    if parent_id and parent_id in data_store["prompts"]:
        parent_prompt = data_store["prompts"][parent_id]
        version = parent_prompt["version"] + 1
    
    prompt_id = str(uuid.uuid4())
    new_prompt = {
        "id": prompt_id,
        "name": name,
        "description": description,
        "content": content,
        "layer_type": layer_type,
        "version": version,
        "author": author,
        "created_at": datetime.now().isoformat(),
        "change_comment": change_comment,
        "tags": tags if isinstance(tags, list) else [],
        "parent_id": parent_id
    }
    
    data_store["prompts"][prompt_id] = new_prompt
    
    if save_data(data_store):
        return {"prompt": new_prompt, "message": "Prompt created successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to save prompt")

@app.post("/api/stacks")
async def create_stack(stack_data: dict):
    """Create a new prompt stack"""
    
    # Extract data from request body
    name = stack_data.get('name', '').strip()
    description = stack_data.get('description', '').strip()
    prompts = stack_data.get('prompts', {})  # layer_type -> prompt_id
    author = stack_data.get('author', 'User')
    weights = stack_data.get('weights', {})
    locks = stack_data.get('locks', {})
    
    # Validation
    if not name:
        raise HTTPException(status_code=400, detail="Stack name is required")
    
    if not prompts:
        raise HTTPException(status_code=400, detail="At least one prompt must be selected")
    
    # Validate all prompt IDs exist
    for layer_type, prompt_id in prompts.items():
        if prompt_id not in data_store["prompts"]:
            raise HTTPException(status_code=400, detail=f"Prompt {prompt_id} not found")
        
        # Validate layer type matches
        prompt = data_store["prompts"][prompt_id]
        if prompt["layer_type"] != layer_type:
            raise HTTPException(status_code=400, detail=f"Prompt {prompt_id} layer type mismatch")
    
    stack_id = str(uuid.uuid4())
    new_stack = {
        "id": stack_id,
        "name": name,
        "description": description,
        "prompts": prompts,
        "weights": weights,
        "locks": locks,
        "created_at": datetime.now().isoformat(),
        "author": author
    }
    
    data_store["stacks"][stack_id] = new_stack
    
    if save_data(data_store):
        return {"stack": new_stack, "message": "Stack created successfully"}
    else:
        raise HTTPException(status_code=500, detail="Failed to save stack")

@app.get("/api/stacks")
async def get_stacks():
    """Get all prompt stacks"""
    stacks = list(data_store["stacks"].values())
    stacks.sort(key=lambda x: x["created_at"], reverse=True)
    return {"stacks": stacks}

@app.get("/api/stacks/{stack_id}")
async def get_stack(stack_id: str):
    """Get specific stack by ID"""
    if stack_id not in data_store["stacks"]:
        raise HTTPException(status_code=404, detail="Stack not found")
    
    return {"stack": data_store["stacks"][stack_id]}

@app.get("/api/stacks/{stack_id}/compile")
async def compile_stack(stack_id: str):
    """Compile a prompt stack into final prompt text"""
    if stack_id not in data_store["stacks"]:
        raise HTTPException(status_code=404, detail="Stack not found")
    
    stack = data_store["stacks"][stack_id]
    compiled_sections = []
    
    # Get layer types in order
    layer_order = sorted(data_store["layer_types"].values(), key=lambda x: x["order"])
    
    for layer in layer_order:
        layer_name = layer["name"]
        if layer_name in stack["prompts"]:
            prompt_id = stack["prompts"][layer_name]
            if prompt_id in data_store["prompts"]:
                prompt = data_store["prompts"][prompt_id]
                weight = stack["weights"].get(layer_name, 1)
                locked = stack["locks"].get(layer_name, False)
                
                section = {
                    "layer": layer_name,
                    "prompt_name": prompt["name"],
                    "content": prompt["content"],
                    "weight": weight,
                    "locked": locked
                }
                compiled_sections.append(section)
    
    # Generate final compiled text
    compiled_text = ""
    for section in compiled_sections:
        compiled_text += f"# {section['layer'].upper()} LAYER ({section['prompt_name']})\n"
        compiled_text += f"{section['content']}\n\n"
    
    return {
        "stack_id": stack_id,
        "compiled_sections": compiled_sections,
        "compiled_text": compiled_text.strip(),
        "total_sections": len(compiled_sections)
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
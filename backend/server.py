from datetime import datetime, timedelta, timezone
import logging
import os
from pathlib import Path
from typing import Any, Dict, List
import re
import uuid

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, FastAPI, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from motor.motor_asyncio import AsyncIOMotorClient
from passlib.context import CryptContext
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from starlette.middleware.cors import CORSMiddleware


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]
projects_collection = db.website_builder_projects
users_collection = db.website_builder_users

jwt_secret = os.environ["JWT_SECRET"]
access_token_expire_minutes = int(os.environ["ACCESS_TOKEN_EXPIRE_MINUTES"])
jwt_algorithm = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
bearer_scheme = HTTPBearer(auto_error=False)

app = FastAPI()
api_router = APIRouter(prefix="/api")


def create_id() -> str:
    return str(uuid.uuid4())


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def slugify(value: str) -> str:
    normalized = re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")
    return normalized or f"page-{create_id()[:8]}"


def normalize_email(value: str) -> str:
    return value.strip().lower()


def create_access_token(user_id: str) -> str:
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=access_token_expire_minutes)
    payload = {
        "sub": user_id,
        "exp": expires_at,
    }
    return jwt.encode(payload, jwt_secret, algorithm=jwt_algorithm)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return pwd_context.verify(password, password_hash)


def validate_password_strength(password: str) -> None:
    if len(password) < 8:
        raise HTTPException(status_code=400, detail="Password must be at least 8 characters long")


def normalize_section(section: Dict[str, Any]) -> Dict[str, Any]:
    return {
        "id": section.get("id") or create_id(),
        "presetKey": section.get("presetKey") or section.get("type") or "custom-section",
        "type": section.get("type") or "custom",
        "name": section.get("name") or "Untitled Section",
        "description": section.get("description") or "Custom section",
        "category": section.get("category") or "Custom",
        "content": section.get("content") or {},
        "styles": section.get("styles") or {},
    }


def normalize_page(page: Dict[str, Any], index: int) -> Dict[str, Any]:
    page_name = page.get("name") or f"Page {index + 1}"
    sections = [normalize_section(section) for section in page.get("sections", [])]
    return {
        "id": page.get("id") or create_id(),
        "name": page_name,
        "slug": slugify(page.get("slug") or page_name),
        "seo_title": page.get("seo_title") or page_name,
        "seo_description": page.get("seo_description") or f"{page_name} built in Creative Studio.",
        "sections": sections,
    }


def build_project_summary(project: Dict[str, Any]) -> Dict[str, Any]:
    pages = project.get("pages", [])
    section_count = sum(len(page.get("sections", [])) for page in pages)
    return {
        "id": project["id"],
        "name": project["name"],
        "description": project.get("description", ""),
        "status": project.get("status", "draft"),
        "page_count": len(pages),
        "section_count": section_count,
        "created_at": project.get("created_at", now_iso()),
        "updated_at": project.get("updated_at", now_iso()),
    }


def serialize_user(user: Dict[str, Any]) -> Dict[str, str]:
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "created_at": user["created_at"],
    }


class UserPublic(BaseModel):
    id: str
    name: str
    email: str
    created_at: str


class AuthSignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class AuthLoginRequest(BaseModel):
    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


class PageDocument(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=create_id)
    name: str
    slug: str
    seo_title: str = ""
    seo_description: str = ""
    sections: List[Dict[str, Any]] = Field(default_factory=list)


class BuilderProject(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=create_id)
    name: str
    description: str = ""
    status: str = "draft"
    pages: List[PageDocument] = Field(default_factory=list)
    created_at: str = Field(default_factory=now_iso)
    updated_at: str = Field(default_factory=now_iso)


class BuilderProjectCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: str
    description: str = ""
    status: str = "draft"
    pages: List[PageDocument] = Field(default_factory=list)


class BuilderProjectUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    name: str
    description: str = ""
    status: str = "draft"
    pages: List[PageDocument] = Field(default_factory=list)


class BuilderProjectSummary(BaseModel):
    id: str
    name: str
    description: str = ""
    status: str = "draft"
    page_count: int = 0
    section_count: int = 0
    created_at: str
    updated_at: str


class DeleteResponse(BaseModel):
    success: bool
    deleted_id: str


async def get_user_by_email(email: str) -> Dict[str, Any] | None:
    return await users_collection.find_one({"email": normalize_email(email)}, {"_id": 0})


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> Dict[str, Any]:
    if not credentials or not credentials.credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")

    try:
        payload = jwt.decode(credentials.credentials, jwt_secret, algorithms=[jwt_algorithm])
    except JWTError as error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token") from error

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    user = await users_collection.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user


async def get_project_or_404(project_id: str, owner_id: str) -> Dict[str, Any]:
    project = await projects_collection.find_one({"id": project_id, "owner_id": owner_id}, {"_id": 0})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@app.on_event("startup")
async def startup_indexes() -> None:
    await users_collection.create_index("id", unique=True)
    await users_collection.create_index("email", unique=True)
    await projects_collection.create_index("id", unique=True)
    await projects_collection.create_index([("owner_id", 1), ("updated_at", -1)])


@api_router.get("/")
async def root() -> Dict[str, str]:
    return {"message": "Creative Studio Builder API"}


@api_router.get("/website-builder/health")
async def builder_health() -> Dict[str, str]:
    return {"status": "ok"}


@api_router.post("/auth/signup", response_model=AuthResponse, status_code=201)
async def signup(payload: AuthSignupRequest) -> AuthResponse:
    name = payload.name.strip()
    email = normalize_email(str(payload.email))
    validate_password_strength(payload.password)

    if not name:
        raise HTTPException(status_code=400, detail="Name is required")

    existing_user = await get_user_by_email(email)
    if existing_user:
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    user_doc = {
        "id": create_id(),
        "name": name,
        "email": email,
        "password_hash": hash_password(payload.password),
        "created_at": now_iso(),
    }
    await users_collection.insert_one(user_doc)

    public_user = UserPublic(**serialize_user(user_doc))
    return AuthResponse(access_token=create_access_token(user_doc["id"]), user=public_user)


@api_router.post("/auth/login", response_model=AuthResponse)
async def login(payload: AuthLoginRequest) -> AuthResponse:
    email = normalize_email(str(payload.email))
    user = await get_user_by_email(email)

    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    public_user = UserPublic(**serialize_user(user))
    return AuthResponse(access_token=create_access_token(user["id"]), user=public_user)


@api_router.get("/auth/me", response_model=UserPublic)
async def get_me(current_user: Dict[str, Any] = Depends(get_current_user)) -> UserPublic:
    return UserPublic(**serialize_user(current_user))


@api_router.get("/website-builder/projects", response_model=List[BuilderProjectSummary])
async def list_projects(current_user: Dict[str, Any] = Depends(get_current_user)) -> List[BuilderProjectSummary]:
    projects = await projects_collection.find(
        {"owner_id": current_user["id"]},
        {"_id": 0},
    ).sort("updated_at", -1).to_list(200)
    return [BuilderProjectSummary(**build_project_summary(project)) for project in projects]


@api_router.post("/website-builder/projects", response_model=BuilderProject)
async def create_project(
    payload: BuilderProjectCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> BuilderProject:
    pages_payload = payload.model_dump().get("pages") or [{"name": "Home", "slug": "home", "sections": []}]
    normalized_pages = [normalize_page(page, index) for index, page in enumerate(pages_payload)]

    project = BuilderProject(
        name=payload.name,
        description=payload.description,
        status=payload.status,
        pages=[PageDocument(**page) for page in normalized_pages],
    )

    project_doc = project.model_dump()
    project_doc["owner_id"] = current_user["id"]
    await projects_collection.insert_one(project_doc)
    stored_project = await get_project_or_404(project.id, current_user["id"])
    return BuilderProject(**stored_project)


@api_router.get("/website-builder/projects/{project_id}", response_model=BuilderProject)
async def get_project(
    project_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> BuilderProject:
    project = await get_project_or_404(project_id, current_user["id"])
    return BuilderProject(**project)


@api_router.put("/website-builder/projects/{project_id}", response_model=BuilderProject)
async def update_project(
    project_id: str,
    payload: BuilderProjectUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> BuilderProject:
    existing_project = await get_project_or_404(project_id, current_user["id"])
    normalized_pages = [normalize_page(page, index) for index, page in enumerate(payload.model_dump().get("pages", []))]

    updated_project = {
        "id": project_id,
        "owner_id": existing_project["owner_id"],
        "name": payload.name,
        "description": payload.description,
        "status": payload.status,
        "pages": normalized_pages,
        "created_at": existing_project["created_at"],
        "updated_at": now_iso(),
    }

    await projects_collection.update_one(
        {"id": project_id, "owner_id": current_user["id"]},
        {"$set": updated_project},
    )
    stored_project = await get_project_or_404(project_id, current_user["id"])
    return BuilderProject(**stored_project)


@api_router.delete("/website-builder/projects/{project_id}", response_model=DeleteResponse)
async def delete_project(
    project_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
) -> DeleteResponse:
    await get_project_or_404(project_id, current_user["id"])
    await projects_collection.delete_one({"id": project_id, "owner_id": current_user["id"]})
    return DeleteResponse(success=True, deleted_id=project_id)


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client() -> None:
    client.close()
from fastapi import APIRouter
from app.Models.APIs.Auth import UserCreate
from app.controllers.Auth import create_user

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/signup")
async def signup(user: UserCreate):
    await create_user(user)
    
from app.utils.db import get_session
from app.Models.APIs.Auth import UserCreate
from app.Models.Schemas.user import User
from fastapi import HTTPException, status
from app.utils.logger import logger
from sqlalchemy.future import select


async def create_user(user: UserCreate):
    """Create a new user in the database."""
    db_user = User(
        username=user.username,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        hashed_password=user.password,
        is_active=True,
    )

    try:
        async with get_session() as session:
            session.add(db_user)
            await session.commit()
            await session.refresh(db_user)
            logger.info(f"User created: {db_user.id}")
    except Exception as e:
        await session.rollback()
        logger.error(f"Error creating user: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user."
        ) from e

    return db_user

async def get_user_by_username(username: str):
    """Retrieve a user by username."""
    async with get_session() as session:
        result = await session.execute(
            select(User).where(User.username == username)
        )
        user = result.scalars().first()
        if not user:
            logger.warning(f"User not found: {username}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found."
            )
        return user

async def get_user_by_email(email: str):
    """Retrieve a user by email."""
    async with get_session() as session:
        result = await session.execute(
            select(User).where(User.email == email)
        )
        user = result.scalars().first()
        if not user:
            logger.warning(f"User not found: {email}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found."
            )
        return user
from app.Models.APIs.Auth import UserCreate
from fastapi import HTTPException, status
from app.utils.logger import logger
from backend.src.app.dao.user import create_user as dao_create_user, get_user_by_username, get_user_by_email
import re
from app.utils.hash import hash as hash_password

async def create_user(user: UserCreate):
    # verify user inputs
    # check first and second name dont contain invalid characters
    if not user.first_name.isalnum():
        logger.error("Invalid characters found in first name field.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid characters in first name field."
        )
    if not user.last_name.isalnum():
        logger.error("Invalid characters found in last name field.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid characters in last name field."
        )

    # check email is valid using simple regex
    email_regex = r"^[\w\.-]+@[\w\.-]+\.\w+$"
    if not user.email or not re.match(email_regex, user.email):
        logger.error("Invalid email address.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid email address."
        )
        
    # password contains at least 10 characters, at least one uppercase, one lowercase, three digit, one special character
    password_regex = r"^(?=.*[a-z])(?=.*[A-Z])(?=(?:.*\d){3,})(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{10,}$"
    if not re.match(password_regex, user.password):
        logger.error("Password does not meet complexity requirements.")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 10 characters long, contain at least one uppercase letter, one lowercase letter, three digits, and one special character."
        )
        
    # check if username or email already exists in the database
    try:
        existing_user_by_username = get_user_by_username(user.username)
        if existing_user_by_username:
            logger.error(f"Username already exists: {user.username}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already exists."
            )
    except HTTPException as e:
        if e.status_code != status.HTTP_404_NOT_FOUND:
            raise 
    try:
        existing_user_by_email = get_user_by_email(user.email)

        if existing_user_by_email:
            logger.error(f"Email already exists: {user.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists."
            )
    except HTTPException as e:
        if e.status_code != status.HTTP_404_NOT_FOUND:
            raise
        
    # hash password
    user.password = hash_password(user.password)
    db_user = await dao_create_user(user)
    
    if not db_user:
        logger.error("Failed to create user in the database.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user."
        )
    
    return {
        "status": "success",
        "message": "User created successfully.",
    }
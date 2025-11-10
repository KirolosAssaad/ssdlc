from fastapi import APIRouter
from app.core.settings import settings
from app.core.Auth import get_user_roles, get_user_info
from app.core.Auth import require_auth
from fastapi import Request

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.get("/sso")
async def signup():
    AUTH_URL = "https://kahf-bookstore.us.auth0.com/oauth2/authorize"
    
    query_params = {
        "response_type": "code",
        "client_id": settings.AUTH0_CLIENT_ID,
        "redirect_uri": "http://localhost:8000/auth/callback",        
        "scope": "openid profile email offline_access read:users read:roles read:role_members",
        "audience": settings.AUTH0_AUDIENCE
    }

    from urllib.parse import urlencode
    url = f"{AUTH_URL}?{urlencode(query_params)}"
    return {"auth_url": url}


@router.get("/callback")
async def callback(code: str):
    
    AUTH_TOKEN_URL = "https://kahf-bookstore.us.auth0.com/oauth/token"

    token_payload = {
        "grant_type": "authorization_code",
        "client_id": settings.AUTH0_CLIENT_ID,
        "client_secret": settings.AUTH0_CLIENT_SECRET,
        "code": code,
        "redirect_uri": settings.AUTH_REDIRECT_URI
    }
    
    import requests
    response = requests.post(AUTH_TOKEN_URL, json=token_payload)
    response_data = response.json()
    user_info = await get_user_info(response_data.get("access_token"))
    user_id = user_info.get("sub")
    roles = await get_user_roles(user_id)
    user_info["roles"] = roles
    
    response = {
        "access_token": response_data.get("access_token"),
        "refresh_token": response_data.get("refresh_token"),}
    
    response.update(user_info)
    
    return response

@router.get("/user")
@require_auth()
async def user_info(request: Request):
    AUTH_USERINFO_URL = "https://kahf-bookstore.us.auth0.com/userinfo"
    
    headers = {
        "Authorization": f"Bearer {request.state.access_token}"
    }
    
    import requests
    response = requests.get(AUTH_USERINFO_URL, headers=headers)
    user_info = response.json()
    return user_info
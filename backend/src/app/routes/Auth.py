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

# ADMIN ROLE_ID: rol_3rIPylnLOf4V0LHJ
# SUDO ADMIN ROLE_ID: rol_Rse83znIx3ekyIHp
@router.get("/set-role/{user_id}")
@require_auth(required_roles=["sudo_admin"])
async def set_admin(user_id: str, role: str):
    from app.core.Auth import get_management_token
    token = get_management_token()
    url = f"https://{settings.AUTH0_DOMAIN}/api/v2/users/{user_id}/roles"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    role_id = "rol_3rIPylnLOf4V0LHJ" if role == "admin" else "rol_Rse83znIx3ekyIHp"
    payload = { "roles": [role_id] }
    import requests
    resp = requests.post(url, json=payload, headers=headers, timeout=10)
    resp.raise_for_status()
    return {"detail": f"User {user_id} has been assigned the admin role."}

@router.get("/roles/{user_id}")
@require_auth()
async def get_roles(user_id: str):
    roles = await get_user_roles(user_id)
    return {"user_id": user_id, "roles": roles}

@router.get("/refresh-token")
@require_auth()
async def refresh_token(request: Request):
    AUTH_TOKEN_URL = "https://kahf-bookstore.us.auth0.com/oauth/token"

    refresh_payload = {
        "grant_type": "refresh_token",
        "client_id": settings.AUTH0_CLIENT_ID,
        "client_secret": settings.AUTH0_CLIENT_SECRET,
        "refresh_token": request.state.refresh_token,
    }
    
    import requests
    response = requests.post(AUTH_TOKEN_URL, json=refresh_payload)
    response_data = response.json()
    
    return {
        "access_token": response_data.get("access_token"),
        "refresh_token": response_data.get("refresh_token"),
    }
    
@router.get("/roles")
@require_auth()
async def all_roles(request: Request):
    return {
        "available_roles": ["user", "admin", "sudo_admin"]
    }
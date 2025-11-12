from app.core.settings import settings
import jwt
from jwt import PyJWKClient

AUTH0_DOMAIN = settings.AUTH0_DOMAIN
API_AUDIENCE = settings.AUTH0_AUDIENCE
ISSUER = f"https://{AUTH0_DOMAIN}/"
JWKS_URL = f"{ISSUER}.well-known/jwks.json"





def get_management_token() -> str:
    """Client Credentials flow to get a Management API token."""
    url = f"https://{settings.AUTH0_DOMAIN}/oauth/token"
    payload = {
        "grant_type": "client_credentials",
        "client_id": settings.AUTH0_CLIENT_ID,
        "client_secret": settings.AUTH0_CLIENT_SECRET,
        "audience": settings.AUTH0_AUDIENCE,
    }
    import requests
    resp = requests.post(url, json=payload, timeout=10)
    resp.raise_for_status()
    return resp.json()["access_token"]


async def get_user_roles(user_id: str):
    token = get_management_token()
    url = f"https://{settings.AUTH0_DOMAIN}/api/v2/users/{user_id}/roles"
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    import requests
    resp = requests.get(url, headers=headers, timeout=10)
    resp.raise_for_status()
    return resp.json()


async def get_user_info(access_token: str):
    AUTH_USERINFO_URL = "https://kahf-bookstore.us.auth0.com/userinfo"

    headers = {
        "Authorization": f"Bearer {access_token}"
    }

    import requests
    response = requests.get(AUTH_USERINFO_URL, headers=headers)
    user_info = response.json()
    return user_info


from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from functools import wraps

security = HTTPBearer()


def require_auth(required_roles: list[str] = []):
    """
    FastAPI decorator that validates Auth0 JWT token and checks roles.
    Sets user info in request state.
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(request: Request, *args, **kwargs):
            auth_header = request.headers.get("authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
            
            token = auth_header.split(" ")[1]
            try:

                # Validate token
                jwks_client = PyJWKClient(JWKS_URL)
                signing_key = jwks_client.get_signing_key_from_jwt(token).key

                decoded = jwt.decode(
                    token,
                    signing_key,
                    algorithms=["RS256"],
                    audience=API_AUDIENCE,
                    issuer=ISSUER,
                    options={"require": ["exp", "iat", "iss", "aud"]}
                )

                user_info = await get_user_info(token)
                user_id = decoded.get("sub")
                roles = await get_user_roles(user_id)

                # Check required roles
                if len(required_roles) > 0:
                    user_role_names = [role.get("name") for role in roles]
                    if not any(role in user_role_names for role in required_roles):
                        raise HTTPException(
                            status_code=403, detail="Insufficient permissions")

                # Set user info in request state
                request.state.user_id = user_id
                request.state.user_email = user_info.get("email")
                request.state.user_roles = roles
                request.state.access_token = token

                return await func(request, *args, **kwargs)

            except jwt.InvalidTokenError:
                raise HTTPException(status_code=401, detail="Invalid token")
            except Exception as e:
                raise HTTPException(status_code=401, detail=str(e))

        return wrapper
    return decorator
# ADD THIS FUNCTION TO THE END OF app/core/Auth.py
def get_current_user_id(request: Request) -> int:
    """
    Extract the current user's ID from the authenticated request.
    
    Args:
        request: FastAPI request object
        
    Returns:
        User ID as integer
        
    Raises:
        HTTPException: If user not authenticated
    """
    # Option 1: If you store user_id in request.state
    if hasattr(request.state, "user_id"):
        return request.state.user_id
    
    # Option 2: If you store user info in request.state
    if hasattr(request.state, "user") and hasattr(request.state.user, "id"):
        return request.state.user.id
    
    # Option 3: Extract from Auth0 JWT token
    if hasattr(request.state, "user_info"):
        user_info = request.state.user_info
        # Auth0 typically uses 'sub' (subject) field
        user_id_str = user_info.get("sub", "").split("|")[-1]
        try:
            return int(user_id_str)
        except ValueError:
            pass
    
    # If we can't find user ID, raise error
    from app.utils.logger import logger
    logger.error("Could not extract user ID from request")
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="User ID not found in request. Please ensure you're authenticated."
    )

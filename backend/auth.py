import os
import httpx
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, jwk
from jose.exceptions import JOSEError, JWTClaimsError, ExpiredSignatureError
from typing import Any, Dict

# --- Configuration ---

# This is the URL you copied from your Clerk Dashboard
CLERK_ISSUER_URL = "https://moving-cougar-76.clerk.accounts.dev" 

# This is where Clerk's public keys are found
JWKS_URL = f"{CLERK_ISSUER_URL}/.well-known/jwks.json"

# This defines the "Bearer <token>" in the Authorization header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- JWKS Caching ---

# We cache the keys so we don't have to fetch them on every request
_jwks_cache = None

async def get_jwks() -> Dict[str, Any]:
    """
    Fetches and caches the JWKS (JSON Web Key Set) from Clerk.
    """
    global _jwks_cache
    if _jwks_cache:
        return _jwks_cache
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(JWKS_URL)
            response.raise_for_status()
            _jwks_cache = response.json()
            return _jwks_cache
        except httpx.HTTPStatusError as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch JWKS: {e}")

# --- Token Validation ---

async def get_current_user(token: str = Depends(oauth2_scheme)) -> str:
    """
    FastAPI Dependency to validate a Clerk JWT and return the user ID.
    
    This function will be run on every request to a protected endpoint.
    """
    try:
        # Get the JWKS
        jwks = await get_jwks()
        
        # Decode the token's header to find the key ID (kid)
        header = jwt.get_unverified_header(token)
        kid = header.get("kid")
        
        if not kid:
            raise HTTPException(status_code=401, detail="Invalid token: 'kid' not found in header")

        # Find the matching public key from the JWKS
        rsa_key = {}
        for key in jwks["keys"]:
            if key["kid"] == kid:
                rsa_key = {
                    "kty": key["kty"],
                    "kid": key["kid"],
                    "use": key["use"],
                    "n": key["n"],
                    "e": key["e"],
                }
                break
        
        if not rsa_key:
            raise HTTPException(status_code=401, detail="Invalid token: Public key not found")

        # Decode and validate the token
        payload = jwt.decode(
            token,
            rsa_key,
            algorithms=["RS256"],
            issuer=CLERK_ISSUER_URL,
            audience=None # No specific audience required for Clerk
        )
        
        # Token is valid, return the user ID (subject)
        user_id = payload.get("sub")
        if not user_id:
             raise HTTPException(status_code=401, detail="Invalid token: User ID ('sub') not found")

        return user_id

    except ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except JWTClaimsError:
        raise HTTPException(status_code=401, detail="Invalid token: Claims are incorrect")
    except JOSEError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {e}")
from fastapi import HTTPException
from fastapi.responses import JSONResponse
import requests
from decouple import config
from fastapi.security import OAuth2AuthorizationCodeBearer
from jose import jwt
from jose.exceptions import JWTError

def get_public_keys():
    keys_url = "https://www.googleapis.com/oauth2/v3/certs"
    response = requests.get(keys_url)
    keys = response.json()["keys"]
    return {key["kid"]: key for key in keys}

def validate_jwt(token: str, public_keys):
    header = jwt.get_unverified_header(token)
    kid = header['kid']
    public_key = public_keys.get(kid)

    if not public_key:
        raise HTTPException(status_code=401, detail="Public key not found")

    try:
        # Decode the token using the correct public key
        decoded_token = jwt.decode(token, public_key, algorithms=["RS256"], audience=config('GOOGLE_CLIENT_ID'), options={"verify_at_hash": False})
        return JSONResponse(content={"token": decoded_token}, status_code=200)
    except JWTError as error:
        raise HTTPException(status_code=401, detail=f"JWT validation failed: {str(error)}")


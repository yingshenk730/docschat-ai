
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.security import OAuth2AuthorizationCodeBearer
from fastapi import Depends
from decouple import config
from authlib.integrations.starlette_client import OAuth, OAuthError
from src.jwt import validate_jwt, get_public_keys

router = APIRouter()
oauth2_scheme = OAuth2AuthorizationCodeBearer(authorizationUrl="/auth", tokenUrl="/token")

oauth = OAuth()
oauth.register(
    'google',
    client_id=config('GOOGLE_CLIENT_ID'),
    client_secret=config('GOOGLE_CLIENT_SECRET'),
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile',
        'prompt': 'select_account',
    },
)

@router.get('/login')
async def login(request: Request):
    redirect_uri = request.url_for('auth')
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get('/auth')
async def auth(request: Request):
    try:
        token = await oauth.google.authorize_access_token(request)
    except OAuthError as error:
        return JSONResponse(content={'error': error.error}, status_code=400)
    frontend_url = config('FRONTEND_URL')
    url = f'{frontend_url}/auth?token={token.get("id_token")}'
    return RedirectResponse(url=url)


@router.get('/logout')
async def logout(request: Request):
    request.session.pop('user', None)
    return JSONResponse(content={"message": "Logged out successfully"}, status_code=200)

    
@router.get("/token")
async def get_token(token: str = Depends(oauth2_scheme)):
    public_keys = get_public_keys()
    return validate_jwt(token, public_keys)

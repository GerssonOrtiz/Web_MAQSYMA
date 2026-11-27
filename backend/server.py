import base64
import hashlib
import hmac
import json
import logging
import os
import secrets
import time
from pathlib import Path
from typing import List, Optional
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError

from dotenv import load_dotenv
from fastapi import APIRouter, Depends, FastAPI, HTTPException, Query
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, ConfigDict, Field
from starlette.middleware.cors import CORSMiddleware

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class Product(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str
    brand: str
    model: str
    category: str
    process: str
    main_image: str
    additional_images: List[str] = Field(default_factory=list)
    description: str = ""
    amperage: str = ""
    voltage: str = ""
    power_supply: str = ""
    duty_cycle: str = ""
    applications: List[str] = Field(default_factory=list)
    features: List[str] = Field(default_factory=list)
    price: Optional[str] = None
    availability: Optional[str] = None
    datasheet_url: Optional[str] = None
    sku: Optional[str] = None
    quote_url: Optional[str] = None
    is_example: bool = True
    featured: bool = True
    sort_order: int = 0
    created_at: Optional[str] = None


class ProductCreate(BaseModel):
    brand: str
    model: str
    category: str
    process: str
    main_image: str
    additional_images: List[str] = Field(default_factory=list)
    description: str = ""
    amperage: str = ""
    voltage: str = ""
    power_supply: str = ""
    duty_cycle: str = ""
    applications: List[str] = Field(default_factory=list)
    features: List[str] = Field(default_factory=list)
    price: Optional[str] = None
    availability: Optional[str] = None
    datasheet_url: Optional[str] = None
    sku: Optional[str] = None
    quote_url: Optional[str] = None
    is_example: bool = True
    featured: bool = True
    sort_order: int = 0


def _supabase_config(require_service_role: bool = False) -> tuple[str, str]:
    url = os.environ.get("SUPABASE_URL", "").strip().rstrip("/")
    service_key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()
    anon_key = os.environ.get("SUPABASE_ANON_KEY", "").strip()
    key = service_key if require_service_role else (service_key or anon_key)
    if not url or not key:
        raise HTTPException(
            status_code=503,
            detail="Supabase no está configurado en el servidor (SUPABASE_URL / SUPABASE_KEY).",
        )
    return url, key


def _supabase_request(
    method: str,
    path: str,
    *,
    params: Optional[dict] = None,
    payload: Optional[dict] = None,
    require_service_role: bool = False,
    prefer: Optional[str] = None,
):
    base_url, api_key = _supabase_config(require_service_role=require_service_role)
    query = f"?{urlencode(params)}" if params else ""
    full_url = f"{base_url}/rest/v1/{path.lstrip('/')}{query}"

    headers = {
        "apikey": api_key,
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    if prefer:
        headers["Prefer"] = prefer

    data = json.dumps(payload).encode("utf-8") if payload is not None else None
    req = Request(full_url, data=data, headers=headers, method=method)

    try:
        with urlopen(req, timeout=15) as resp:
            raw = resp.read().decode("utf-8")
            return json.loads(raw) if raw else None
    except HTTPError as exc:
        body = exc.read().decode("utf-8", errors="ignore")
        logger.error("Supabase HTTP %s: %s", exc.code, body)
        raise HTTPException(status_code=exc.code, detail=body or "Error en Supabase") from exc


app = FastAPI(title="MAQSYMA API")
api_router = APIRouter(prefix="/api")

_EPHEMERAL_JWT_SECRET = secrets.token_urlsafe(32)
_bearer_scheme = HTTPBearer(auto_error=False)


class AdminLoginRequest(BaseModel):
    username: str = Field(..., min_length=1, max_length=128)
    password: str = Field(..., min_length=1, max_length=256)


class AdminTokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    admin: dict


def _get_jwt_secret() -> str:
    secret = os.environ.get("JWT_SECRET", "").strip()
    if not secret:
        logger.warning("JWT_SECRET no definido; usando clave efímera para esta sesión.")
        return _EPHEMERAL_JWT_SECRET
    return secret


def _b64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64url_decode(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def _create_access_token(subject: str, expires_in: int) -> str:
    now = int(time.time())
    header = _b64url_encode(json.dumps({"alg": "HS256", "typ": "JWT"}, separators=(",", ":")).encode())
    payload = _b64url_encode(
        json.dumps(
            {"sub": subject, "role": "admin", "iat": now, "exp": now + expires_in},
            separators=(",", ":"),
        ).encode()
    )
    signing_input = f"{header}.{payload}".encode("ascii")
    sig = hmac.new(_get_jwt_secret().encode("utf-8"), signing_input, hashlib.sha256).digest()
    return f"{header}.{payload}.{_b64url_encode(sig)}"


def _decode_access_token(token: str) -> dict:
    try:
        parts = token.split(".")
        if len(parts) != 3:
            raise ValueError("Formato de token inválido")
        header_b64, payload_b64, sig_b64 = parts
        signing_input = f"{header_b64}.{payload_b64}".encode("ascii")
        expected_sig = hmac.new(
            _get_jwt_secret().encode("utf-8"), signing_input, hashlib.sha256
        ).digest()
        if not hmac.compare_digest(_b64url_decode(sig_b64), expected_sig):
            raise ValueError("Firma inválida")
        payload = json.loads(_b64url_decode(payload_b64).decode("utf-8"))
        if int(payload.get("exp", 0)) < int(time.time()):
            raise ValueError("Token expirado")
        return payload
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Token inválido o expirado") from exc


def _verify_admin_password(password: str) -> bool:
    password_hash = os.environ.get("ADMIN_PASSWORD_HASH", "").strip()
    if password_hash:
        try:
            scheme, iter_s, salt, digest_hex = password_hash.split("$", 3)
            if scheme != "pbkdf2_sha256":
                return False
            derived = hashlib.pbkdf2_hmac(
                "sha256", password.encode("utf-8"), salt.encode("utf-8"), int(iter_s)
            ).hex()
            return hmac.compare_digest(derived, digest_hex)
        except ValueError:
            return False

    plain_password = os.environ.get("ADMIN_PASSWORD", "")
    if not plain_password:
        raise HTTPException(
            status_code=503,
            detail="Credenciales de administrador no configuradas en el servidor",
        )
    return hmac.compare_digest(password, plain_password)


def _verify_supabase_admin_token(token: str) -> Optional[dict]:
    """Valida un access_token emitido por Supabase Auth y verifica role == 'admin' en public.profiles."""
    base_url = os.environ.get("SUPABASE_URL", "").strip().rstrip("/")
    api_key = (
        os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "").strip()
        or os.environ.get("SUPABASE_ANON_KEY", "").strip()
    )
    if not base_url or not api_key:
        return None

    try:
        req = Request(
            f"{base_url}/auth/v1/user",
            headers={"apikey": api_key, "Authorization": f"Bearer {token}"},
            method="GET",
        )
        with urlopen(req, timeout=10) as resp:
            user_data = json.loads(resp.read().decode("utf-8"))
        user_id = user_data.get("id")
        if not user_id:
            return None

        rows = _supabase_request(
            "GET",
            "profiles",
            params={"select": "role,email", "id": f"eq.{user_id}", "limit": 1},
            require_service_role=True,
        ) or []
        if not rows or rows[0].get("role") != "admin":
            raise HTTPException(status_code=403, detail="Permisos de administrador requeridos")
        return {"username": rows[0].get("email") or user_data.get("email"), "role": "admin", "id": user_id}
    except HTTPException:
        raise
    except Exception:
        return None


async def get_current_admin(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(_bearer_scheme),
) -> dict:
    if not credentials or credentials.scheme.lower() != "bearer":
        raise HTTPException(status_code=401, detail="Autenticación requerida")

    supa_admin = _verify_supabase_admin_token(credentials.credentials)
    if supa_admin is not None:
        return supa_admin

    payload = _decode_access_token(credentials.credentials)
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Permisos insuficientes")
    return {"username": payload.get("sub"), "role": "admin"}


@api_router.post("/admin/login", response_model=AdminTokenResponse)
async def admin_login(body: AdminLoginRequest):
    expected_user = os.environ.get("ADMIN_USERNAME", "admin")
    user_ok = hmac.compare_digest(body.username.strip(), expected_user)
    pass_ok = _verify_admin_password(body.password)

    if not (user_ok and pass_ok):
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

    expires_in = int(os.environ.get("JWT_EXPIRE_SECONDS", "28800"))
    token = _create_access_token(subject=expected_user, expires_in=expires_in)
    return AdminTokenResponse(
        access_token=token,
        expires_in=expires_in,
        admin={"username": expected_user, "role": "admin"},
    )


@api_router.get("/admin/me")
async def admin_me(admin: dict = Depends(get_current_admin)):
    return admin


@api_router.get("/")
async def root():
    return {"message": "MAQSYMA API (Supabase)"}


@api_router.get("/products", response_model=List[Product])
async def list_products(category: Optional[str] = Query(None)):
    params = {"select": "*", "order": "sort_order.asc"}
    if category:
        params["category"] = f"eq.{category}"
    rows = _supabase_request("GET", "products", params=params) or []
    return [Product.model_validate(r) for r in rows]


@api_router.get("/products/{product_id}", response_model=Product)
async def get_product(product_id: str):
    rows = _supabase_request(
        "GET", "products", params={"select": "*", "id": f"eq.{product_id}", "limit": 1}
    ) or []
    if not rows:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return Product.model_validate(rows[0])


@api_router.post("/products", response_model=Product, status_code=201)
async def create_product(input: ProductCreate, _admin: dict = Depends(get_current_admin)):
    rows = _supabase_request(
        "POST",
        "products",
        payload=input.model_dump(),
        require_service_role=True,
        prefer="return=representation",
    )
    return Product.model_validate(rows[0])


@api_router.put("/products/{product_id}", response_model=Product)
async def update_product(
    product_id: str, input: ProductCreate, _admin: dict = Depends(get_current_admin)
):
    rows = _supabase_request(
        "PATCH",
        "products",
        params={"id": f"eq.{product_id}"},
        payload=input.model_dump(),
        require_service_role=True,
        prefer="return=representation",
    ) or []
    if not rows:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return Product.model_validate(rows[0])


@api_router.delete("/products/{product_id}", status_code=204)
async def delete_product(product_id: str, _admin: dict = Depends(get_current_admin)):
    rows = _supabase_request(
        "DELETE",
        "products",
        params={"id": f"eq.{product_id}"},
        require_service_role=True,
        prefer="return=representation",
    ) or []
    if not rows:
        raise HTTPException(status_code=404, detail="Producto no encontrado")


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

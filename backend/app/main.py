from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session

from .db import engine, Base, get_db
from .models import User, Org
from .auth import verify_password, create_access_token
from .deps import get_current_user
from .admin import router as admin_router

# create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Vanguard SkyWatch API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:5500", "http://localhost:5500"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(admin_router)

@app.get("/")
def home():
    return {"name": "Vanguard SkyWatch", "status": "running", "docs": "/docs"}

@app.get("/health")
def health():
    return {"ok": True}

class LoginIn(BaseModel):
    email: EmailStr
    password: str

class LoginOut(BaseModel):
    token: str

@app.post("/api/login", response_model=LoginOut)
def login(payload: LoginIn, db: Session = Depends(get_db)):
    u = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if not u or not u.enabled:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(payload.password, u.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(str(u.id))
    return LoginOut(token=token)

@app.get("/api/me")
def me(u: User = Depends(get_current_user)):
    return {"id": u.id, "email": u.email, "org_id": u.org_id, "role": u.role}

# ✅ Keep your existing /api/aircraft logic.
# Here is a placeholder that enforces auth (so it stops being public).
@app.get("/api/aircraft")
def aircraft(lamin: float, lomin: float, lamax: float, lomax: float, u: User = Depends(get_current_user)):
    # Replace this with your real OpenSky call / existing implementation.
    return {"bbox": [lamin, lomin, lamax, lomax], "count": 0, "states": []}

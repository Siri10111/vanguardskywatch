from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional, List

from .db import get_db
from .models import Org, User, AuditLog
from .deps import require_admin
from .auth import hash_password

router = APIRouter(prefix="/api/admin", tags=["admin"])

class OrgCreate(BaseModel):
    name: str

class OrgOut(BaseModel):
    id: int
    name: str

class UserCreate(BaseModel):
    org_id: int
    email: EmailStr
    password: str
    role: str = "viewer"

class UserOut(BaseModel):
    id: int
    org_id: int
    email: str
    role: str
    enabled: bool

class UserPatch(BaseModel):
    role: Optional[str] = None
    enabled: Optional[bool] = None

class AuditOut(BaseModel):
    created_at: str
    org_id: int
    user_id: int
    action: str
    detail: Optional[str] = None

def audit(db: Session, org_id: int, user_id: int, action: str, detail: str | None = None):
    db.add(AuditLog(org_id=org_id, user_id=user_id, action=action, detail=detail))
    db.commit()

@router.get("/orgs", response_model=List[OrgOut])
def list_orgs(db: Session = Depends(get_db), _=Depends(require_admin)):
    rows = db.query(Org).order_by(Org.id.desc()).all()
    return [OrgOut(id=o.id, name=o.name) for o in rows]

@router.post("/orgs", response_model=OrgOut)
def create_org(payload: OrgCreate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    o = Org(name=payload.name.strip())
    db.add(o)
    db.commit()
    db.refresh(o)
    audit(db, o.id, admin.id, "org.create", o.name)
    return OrgOut(id=o.id, name=o.name)

@router.get("/users", response_model=List[UserOut])
def list_users(db: Session = Depends(get_db), _=Depends(require_admin)):
    rows = db.query(User).order_by(User.id.desc()).all()
    return [UserOut(id=u.id, org_id=u.org_id, email=u.email, role=u.role, enabled=u.enabled) for u in rows]

@router.post("/users", response_model=UserOut)
def create_user(payload: UserCreate, db: Session = Depends(get_db), admin=Depends(require_admin)):
    u = User(
        org_id=payload.org_id,
        email=payload.email.lower().strip(),
        password_hash=hash_password(payload.password),
        role=payload.role,
        enabled=True,
    )
    db.add(u)
    db.commit()
    db.refresh(u)
    audit(db, u.org_id, admin.id, "user.create", u.email)
    return UserOut(id=u.id, org_id=u.org_id, email=u.email, role=u.role, enabled=u.enabled)

@router.patch("/users/{user_id}", response_model=UserOut)
def patch_user(user_id: int, payload: UserPatch, db: Session = Depends(get_db), admin=Depends(require_admin)):
    u = db.query(User).filter(User.id == user_id).first()
    if not u:
        # let FastAPI return 404-ish behavior as a simple response
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="User not found")

    if payload.role is not None:
        u.role = payload.role
    if payload.enabled is not None:
        u.enabled = payload.enabled

    db.commit()
    db.refresh(u)

    audit(db, u.org_id, admin.id, "user.update", f"id={u.id} role={u.role} enabled={u.enabled}")
    return UserOut(id=u.id, org_id=u.org_id, email=u.email, role=u.role, enabled=u.enabled)

@router.get("/audit", response_model=List[AuditOut])
def get_audit(limit: int = 200, db: Session = Depends(get_db), _=Depends(require_admin)):
    rows = db.query(AuditLog).order_by(AuditLog.id.desc()).limit(limit).all()
    return [
        AuditOut(
            created_at=r.created_at.isoformat(),
            org_id=r.org_id,
            user_id=r.user_id,
            action=r.action,
            detail=r.detail,
        )
        for r in rows
    ]

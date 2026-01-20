from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from .db import get_db
from .models import User
from .auth import decode_token

bearer = HTTPBearer(auto_error=False)

def get_current_user(
    db: Session = Depends(get_db),
    creds: HTTPAuthorizationCredentials = Depends(bearer),
) -> User:
    if not creds or not creds.credentials:
        raise HTTPException(status_code=401, detail="Unauthorized")

    user_id = decode_token(creds.credentials)
    if not user_id:
        raise HTTPException(status_code=401, detail="Unauthorized")

    u = db.query(User).filter(User.id == int(user_id)).first()
    if not u or not u.enabled:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return u

def require_admin(u: User = Depends(get_current_user)) -> User:
    if u.role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    return u

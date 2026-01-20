from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext

SECRET_KEY = "dev-change-me-super-secret"  # later: move to env var
ALGORITHM = "HS256"
ACCESS_TOKEN_MINUTES = 60 * 24  # 24 hours

pwd = CryptContext(schemes=["argon2"], deprecated="auto")

def hash_password(p: str) -> str:
    return pwd.hash(p)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd.verify(plain, hashed)

def create_access_token(subject: str) -> str:
    exp = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_MINUTES)
    payload = {"sub": subject, "exp": exp}
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str) -> str:
    try:
        data = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return data.get("sub")
    except JWTError:
        return ""

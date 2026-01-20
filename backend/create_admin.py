from sqlalchemy.orm import Session
from app.db import SessionLocal, engine, Base
from app.models import Org, User
from app.auth import hash_password

Base.metadata.create_all(bind=engine)

def main():
    db: Session = SessionLocal()
    try:
        org_name = input("Org name: ").strip()
        email = input("Admin email: ").strip().lower()
        pw = input("Admin password: ").strip()

        org = db.query(Org).filter(Org.name == org_name).first()
        if not org:
            org = Org(name=org_name)
            db.add(org)
            db.commit()
            db.refresh(org)

        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print("User already exists.")
            return

        u = User(
            org_id=org.id,
            email=email,
            password_hash=hash_password(pw),
            role="admin",
            enabled=True,
        )
        db.add(u)
        db.commit()
        db.refresh(u)
        print(f"Created admin user id={u.id} org_id={org.id}")
    finally:
        db.close()

if __name__ == "__main__":
    main()

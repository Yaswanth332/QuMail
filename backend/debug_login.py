import sys
import os

# Add the current directory to sys.path so we can import app modules
sys.path.append(os.getcwd())

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import models
from app.auth import auth

# Use the same DB URL
SQLALCHEMY_DATABASE_URL = "sqlite:///./qumail_v3.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

print("--- DEBUGGING LOGIN ---")

try:
    users = db.query(models.User).all()
    print(f"Found {len(users)} users in database.")
    for u in users:
        print(f"User: {u.email} | Hash: {u.hashed_password[:10]}...")
        
    # specific test
    test_email = "test@example.com"
    test_pass = "password123"
    
    user = db.query(models.User).filter(models.User.email == test_email).first()
    if not user:
        print(f"Creating test user: {test_email}")
        hashed = auth.get_password_hash(test_pass)
        print(f"Generated hash: {hashed}")
        new_user = models.User(email=test_email, hashed_password=hashed)
        db.add(new_user)
        db.commit()
        user = new_user
    
    print(f"Verifying password for {user.email}...")
    is_valid = auth.verify_password(test_pass, user.hashed_password)
    print(f"Is Valid: {is_valid}")
    
    if is_valid:
        print("LOGIN CHECK PASSED")
    else:
        print("LOGIN CHECK FAILED")
        
except Exception as e:
    print(f"EXCEPTION OCCURRED: {e}")
    import traceback
    traceback.print_exc()
finally:
    db.close()

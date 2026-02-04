from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Email(Base):
    __tablename__ = "emails"

    id = Column(Integer, primary_key=True, index=True)
    sender = Column(String, index=True)
    recipient = Column(String, index=True)
    subject = Column(String) # For simplicity, subject is plaintext or handle encryption later
    body_encrypted = Column(Text) # Hex string of ciphertext
    encryption_level = Column(String) # "otp", "aes-quantum", "none"
    sent_at = Column(DateTime, default=datetime.utcnow)
    
    # Feature Flags
    is_deleted = Column(Boolean, default=False)
    is_spam = Column(Boolean, default=False)
    is_draft = Column(Boolean, default=False)
    parent_id = Column(Integer, nullable=True) # Threading ID
    
    # Attachments: JSON String "[{'name': 'x.pdf', 'data': 'base64...'}]"
    attachments = Column(Text, default="[]")
    
    # We rely on an external mechanism (mocked QKD) for key retrieval, verification
    # Key ID or Reference might be needed if we mock QKD
    key_id = Column(String, index=True) 

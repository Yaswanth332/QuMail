from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from cryptography.hazmat.primitives.ciphers.aead import AESGCM 

from typing import List, Optional
from ..database import db, models
from ..auth import auth
from ..crypto import qrng, otp, comparison, aes_engine, qkd_engine
from ..quantum import key_service
from pydantic import BaseModel, validator
import time
import json
import requests # standard requests

router = APIRouter()

# --- SIMULATED QKD TRUSTED NODE ---
# In a real architecture, this would be a separate piece of hardware/server.
# We simulate it here to demonstrate ARCHITECTURAL SEPARATION.
# The Email Server (Database) NEVER sees these keys, only the Key IDs.
QKD_KEY_STORE = {} 

class QKDKeyStoreRequest(BaseModel):
    key_id: str
    key_hex: str

@router.post("/qkd/store_key")
def store_qkd_key(payload: QKDKeyStoreRequest):
    """
    Simulates Alice pushing a key to the QKD Trusted Node.
    """
    QKD_KEY_STORE[payload.key_id] = payload.key_hex
    return {"msg": "Key stored in QKD Node"}

@router.get("/qkd/retrieve_key/{key_id}")
def retrieve_qkd_key(key_id: str, current_user: models.User = Depends(auth.get_current_user)):
    """
    Retrieves key from QKD Node (Volatile Memory).
    Integates with the new Quantum Key Service for Panel compatibility.
    """
    # 1. Try Volatile Store (New Key Service)
    key_hex = key_service.retrieve_key(key_id, current_user.email)
    
    if key_hex:
        return {"key": key_hex}

    # 2. Legacy/Fallback: Check old QKD_KEY_STORE
    if key_id in QKD_KEY_STORE:
        key = QKD_KEY_STORE[key_id]
        del QKD_KEY_STORE[key_id]
        return {"key": key}

    raise HTTPException(status_code=404, detail="Key expired, destroyed, or unauthorized.")

# --- Pydantic Models ---
class UserCreate(BaseModel):
    email: str
    password: str
    
    @validator("email")
    def lower_email(cls, v):
        return v.lower().strip()

class GoogleLoginRequest(BaseModel):
    credential: str

class EmailSendRequest(BaseModel):
    to_email: str
    subject: str
    body: str
    encryption_level: str = "otp" 
    attachments: List[dict] = [] 
    key_id: Optional[str] = None
    
    @validator("to_email")
    def lower_to_email(cls, v):
        return v.lower().strip()

class EmailResponse(BaseModel):
    id: int
    sender: str
    subject: str
    sent_at: str
    is_encrypted: bool
    encryption_level: str = "none" # Added field

class DecryptedEmail(BaseModel):
    id: int
    subject: str
    body_plaintext: str
    sender: str
    received_at: str
    attachments: List[dict] = []

# --- AUTH ROUTES ---
@router.post("/register")
def register(user: UserCreate, database: Session = Depends(db.get_db)):
    # Standardize email
    email_clean = user.email.lower().strip()
    
    db_user = database.query(models.User).filter(models.User.email == email_clean).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed_pwd = auth.get_password_hash(user.password)
    new_user = models.User(email=email_clean, hashed_password=hashed_pwd)
    database.add(new_user)
    database.commit()
    return {"msg": "User created successfully"}

@router.post("/token")
def login(form_data: UserCreate, database: Session = Depends(db.get_db)):
    email_clean = form_data.email.lower().strip()
    user = database.query(models.User).filter(models.User.email == email_clean).first()
    if not user or not auth.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token = auth.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer", "user_email": user.email}

@router.post("/auth/google")
def google_auth(request: GoogleLoginRequest, database: Session = Depends(db.get_db)):
    """
    Verifies Google Access Token via UserInfo endpoint and logs in/registers the user.
    """
    token = request.credential
    try:
        # Verify Access Token by fetching user info
        resp = requests.get(f"https://www.googleapis.com/oauth2/v1/userinfo?access_token={token}")
        if resp.status_code != 200:
             raise ValueError("Invalid Access Token")
             
        user_info = resp.json()
        raw_email = user_info.get('email')
        
        if not raw_email:
             raise ValueError("Email not found in Google Account")
             
        email = raw_email.lower().strip()

        # Check if user exists
        user = database.query(models.User).filter(models.User.email == email).first()
        if not user:
            # Auto-Register
            new_user = models.User(email=email, hashed_password="GOOGLE_OAUTH_USER")
            database.add(new_user)
            database.commit()
        
        # Create Session Token
        access_token = auth.create_access_token(data={"sub": email})
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_email": email
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Google Auth Failed: {str(e)}")

# --- EMAIL ROUTES ---
@router.post("/send_email")
def send_email(
    request: EmailSendRequest, 
    current_user: models.User = Depends(auth.get_current_user),
    database: Session = Depends(db.get_db)
):
    recipient_email = request.to_email.lower().strip()
    recipient = database.query(models.User).filter(models.User.email == recipient_email).first()
    if not recipient:
         raise HTTPException(status_code=404, detail=f"Recipient '{recipient_email}' not registered. Please register them first.")

    encrypted_body = request.body
    key_id = request.key_id 
    final_subject = request.subject 
    
    payload = {
        "body": request.body,
        "attachments": request.attachments 
    }
    payload_str = json.dumps(payload)
    
    public_attachments_meta = []
    for att in request.attachments:
        public_attachments_meta.append({"name": att.get("name", "unknown")})
    
    # If a key_id was pre-generated by the UI (QRNG Panel), we use it.
    pre_generated_key_hex = None
    if key_id:
        if request.encryption_level in ["otp", "aes"]:
            # Retrieve the Pre-Generated Key from Volatile Store (Peek, don't consume yet)
            # Actually, we need to retrieve it to encrypt.
            # We use a special internal retrieval that checks ownership but doesn't delete sender access yet.
            # Since retrieve_key checks if user is sender/recipient, sender can retrieve it.
            pre_generated_key_hex = key_service.retrieve_key(key_id, current_user.email)
            if not pre_generated_key_hex:
                 raise HTTPException(status_code=400, detail="Provided Quantum Key ID invalid or expired.")

    if request.encryption_level == "otp":
        if pre_generated_key_hex:
            key_hex = pre_generated_key_hex
            kf_id = key_id
        else:
            payload_bytes = payload_str.encode('utf-8')
            kf_id, key_hex, _ = key_service.generate_qkd_key(current_user.email, recipient_email, len(payload_bytes))
        
        encrypted_body_hex = otp.encrypt_message_otp(payload_str, key_hex)
        encrypted_body = encrypted_body_hex
        key_id = kf_id
        
    elif request.encryption_level == "aes":
        if pre_generated_key_hex:
             aes_key_hex = pre_generated_key_hex
             kf_id = key_id
        else:
            aes_key_hex = qrng.qrng_service.generate_otp_key(32) 
            kf_id, _, _ = key_service.store_key_direct(current_user.email, recipient_email, aes_key_hex)
        
        aes_key_bytes = bytes.fromhex(aes_key_hex)
        key_id = kf_id
        
        encrypted_result = aes_engine.encrypt_aes_gcm(payload_str, aes_key_bytes)
        encrypted_body = f"{encrypted_result['iv']}|{encrypted_result['tag']}|{encrypted_result['ciphertext']}"
        enc_subj_res = aes_engine.encrypt_aes_gcm(request.subject, aes_key_bytes)
        final_subject = f"METAVAULT:{enc_subj_res['iv']}|{enc_subj_res['tag']}|{enc_subj_res['ciphertext']}"
        
    elif request.encryption_level == "client_aes":
        # Client Side Encryption - Server stores blind ciphertext
        encrypted_body = request.body 
        if not key_id:
            key_id = "CLIENT-SIDE-KEYS" 
        
    elif request.encryption_level == "otp_client":
        # Client Side OTP (Vernam Cipher) - Server stores blind ciphertext
        encrypted_body = request.body
        if not key_id:
            key_id = "OTP-DEMO-KEYS"

    else:
        encrypted_body = payload_str

    attachments_json = json.dumps(public_attachments_meta)

    new_email = models.Email(
        sender=current_user.email,
        recipient=recipient_email,
        subject=final_subject,
        body_encrypted=encrypted_body,
        encryption_level=request.encryption_level,
        key_id=key_id,
        attachments=attachments_json
    )

    database.add(new_email)
    database.commit()
    return {"msg": "Email sent secured!", "encryption": request.encryption_level}


class KeyGenRequest(BaseModel):
    type: str # 'otp' or 'aes'
    length: int # bytes
    recipient: str 

@router.post("/keys/generate")
def generate_key_endpoint(
    req: KeyGenRequest,
    current_user: models.User = Depends(auth.get_current_user)
):
    """
    Generates a key via QRNG for the sender and recipient.
    Returns ID, Metadata, and KEY MATERIAL (for client-side encryption).
    """
    recipient_email = req.recipient.lower().strip()
    
    if req.type.lower() == 'otp':
        key_id, key_hex, meta = key_service.generate_qkd_key(current_user.email, recipient_email, req.length)
    else:
        # AES
        key_hex = qrng.qrng_service.generate_otp_key(32)
        key_id, _, meta = key_service.store_key_direct(current_user.email, recipient_email, key_hex)
        
    return {"key_hex": key_hex, "meta": meta}

@router.get("/keys/{key_id}/metadata")
def get_key_metadata_endpoint(
    key_id: str,
    current_user: models.User = Depends(auth.get_current_user)
):
    meta = key_service.get_key_metadata(key_id)
    if not meta:
        raise HTTPException(status_code=404, detail="Key not found or expired")
    return meta

@router.post("/keys/{key_id}/discard")
def discard_key_endpoint(
    key_id: str,
    current_user: models.User = Depends(auth.get_current_user)
):
    # Only allow if user is involved? We can just simulate loss broadly for demo
    key_service.discard_key(key_id)
    return {"msg": "Key discarded"}

@router.get("/inbox", response_model=List[EmailResponse])
def get_inbox(
    current_user: models.User = Depends(auth.get_current_user),
    database: Session = Depends(db.get_db)
):
    emails = database.query(models.Email).filter(
        models.Email.recipient == current_user.email,
        models.Email.is_deleted == False,
        models.Email.is_spam == False,
        models.Email.is_draft == False
    ).order_by(models.Email.sent_at.desc()).all()
    response = []
    for e in emails:
        response.append(EmailResponse(
            id=e.id,
            sender=e.sender,
            subject=e.subject,
            sent_at=str(e.sent_at),
            is_encrypted=(e.encryption_level != "none"),
            encryption_level=e.encryption_level or "none"
        ))
    return response

@router.get("/sent", response_model=List[EmailResponse])
def get_sent(
    current_user: models.User = Depends(auth.get_current_user),
    database: Session = Depends(db.get_db)
):
    emails = database.query(models.Email).filter(
        models.Email.sender == current_user.email,
        models.Email.is_deleted == False,
        models.Email.is_draft == False
    ).order_by(models.Email.sent_at.desc()).all()
    response = []
    for e in emails:
        response.append(EmailResponse(
            id=e.id,
            sender=f"To: {e.recipient}", 
            subject=e.subject,
            sent_at=str(e.sent_at),
            is_encrypted=(e.encryption_level != "none"),
            encryption_level=e.encryption_level or "none"
        ))
    return response

@router.get("/trash", response_model=List[EmailResponse])
def get_trash(
    current_user: models.User = Depends(auth.get_current_user),
    database: Session = Depends(db.get_db)
):
    emails = database.query(models.Email).filter(
        (models.Email.recipient == current_user.email) | (models.Email.sender == current_user.email),
        models.Email.is_deleted == True
    ).order_by(models.Email.sent_at.desc()).all()
    response = []
    for e in emails:
        response.append(EmailResponse(
            id=e.id,
            sender=e.sender if e.recipient == current_user.email else f"To: {e.recipient}",
            subject=e.subject,
            sent_at=str(e.sent_at),
            is_encrypted=(e.encryption_level != "none"),
            encryption_level=e.encryption_level or "none"
        ))
    return response

@router.get("/spam", response_model=List[EmailResponse])
def get_spam(
    current_user: models.User = Depends(auth.get_current_user),
    database: Session = Depends(db.get_db)
):
    emails = database.query(models.Email).filter(
        models.Email.recipient == current_user.email,
        models.Email.is_spam == True,
        models.Email.is_deleted == False
    ).order_by(models.Email.sent_at.desc()).all()
    response = []
    for e in emails:
        response.append(EmailResponse(
            id=e.id,
            sender=e.sender,
            subject=e.subject,
            sent_at=str(e.sent_at),
            is_encrypted=(e.encryption_level != "none"),
            encryption_level=e.encryption_level or "none"
        ))
    return response

@router.get("/drafts", response_model=List[EmailResponse])
def get_drafts(
    current_user: models.User = Depends(auth.get_current_user),
    database: Session = Depends(db.get_db)
):
    emails = database.query(models.Email).filter(
        models.Email.sender == current_user.email,
        models.Email.is_draft == True,
        models.Email.is_deleted == False
    ).order_by(models.Email.sent_at.desc()).all()
    response = []
    for e in emails:
        response.append(EmailResponse(
            id=e.id,
            sender=e.recipient, 
            subject=e.subject,
            sent_at=str(e.sent_at),
            is_encrypted=(e.encryption_level != "none"),
            encryption_level=e.encryption_level or "none"
        ))
    return response

@router.post("/email/{email_id}/delete")
def delete_email(
    email_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    database: Session = Depends(db.get_db)
):
    email_msg = database.query(models.Email).filter(models.Email.id == email_id).first()
    if not email_msg:
        raise HTTPException(status_code=404, detail="Email not found")
    if current_user.email not in [email_msg.sender, email_msg.recipient]:
        raise HTTPException(status_code=403, detail="Not authorized")
    email_msg.is_deleted = True
    database.commit()
    return {"msg": "Email moved to trash"}

@router.post("/save_draft")
def save_draft(
    request: EmailSendRequest,
    current_user: models.User = Depends(auth.get_current_user),
    database: Session = Depends(db.get_db)
):
    new_email = models.Email(
        sender=current_user.email,
        recipient=request.to_email,
        subject=request.subject,
        body_encrypted=request.body, 
        encryption_level="none",
        is_draft=True
    )
    database.add(new_email)
    database.commit()
    return {"msg": "Draft saved"}

@router.get("/email/{email_id}/decrypt", response_model=DecryptedEmail)
def decrypt_email(
    email_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    database: Session = Depends(db.get_db)
):
    email_msg = database.query(models.Email).filter(models.Email.id == email_id).first()
    if not email_msg:
        raise HTTPException(status_code=404, detail="Email not found")
    if current_user.email not in [email_msg.recipient, email_msg.sender]:
        raise HTTPException(status_code=403, detail="Not authorized")
    plaintext_payload = email_msg.body_encrypted
    if email_msg.encryption_level == "otp" and not email_msg.is_draft:
        key_hex = key_service.retrieve_key(email_msg.key_id, current_user.email)
        if key_hex:
            try:
                plaintext_payload = otp.decrypt_message_otp(email_msg.body_encrypted, key_hex)
            except Exception as e:
                pass 
    elif email_msg.encryption_level == "aes":
        key_hex = key_service.retrieve_key(email_msg.key_id, current_user.email)
        if key_hex:
            try:
                parts = email_msg.body_encrypted.split("|")
                if len(parts) == 3:
                    iv, tag, cipher = parts
                    plaintext_payload = aes_engine.decrypt_aes_gcm(cipher, bytes.fromhex(key_hex), iv, tag)
            except Exception as e:
                pass
            if email_msg.subject.startswith("METAVAULT:"):
                 try:
                    raw_vault = email_msg.subject.replace("METAVAULT:", "")
                    v_iv, v_tag, v_cipher = raw_vault.split("|")
                    decrypted_subject = aes_engine.decrypt_aes_gcm(v_cipher, bytes.fromhex(key_hex), v_iv, v_tag)
                    email_msg.subject = decrypted_subject 
                 except:
                    email_msg.subject = "[Subject Decryption Failed]"

    elif email_msg.encryption_level == "client_aes" or email_msg.encryption_level == "otp_client":
        try:
             raw_att = json.loads(email_msg.attachments) if email_msg.attachments else []
        except:
             raw_att = []
        return DecryptedEmail(
            id=email_msg.id,
            subject=email_msg.subject,
            body_plaintext=email_msg.body_encrypted, 
            sender=email_msg.sender,
            received_at=str(email_msg.sent_at),
            attachments=raw_att
        )

    real_attachments = []
    final_body = plaintext_payload 
    if plaintext_payload and (plaintext_payload.strip().startswith("{") or plaintext_payload.strip().startswith("[")):
        try:
           bundle = json.loads(plaintext_payload)
           final_body = bundle.get("body", "")
           real_attachments = bundle.get("attachments", [])
        except:
           pass
    if not real_attachments:
        try:
             real_attachments = json.loads(email_msg.attachments) if email_msg.attachments else []
        except:
             real_attachments = []

    if len(final_body) > 5000 and not (final_body.strip().startswith("{") or final_body.strip().startswith("[") or " " in final_body[:100]):
         final_body = "[DECRYPTION FAILED] Payload too large or Key Missing. Content suppressed for safety."

    return DecryptedEmail(
        id=email_msg.id,
        subject=email_msg.subject,
        body_plaintext=final_body,
        sender=email_msg.sender,
        received_at=str(email_msg.sent_at),
        attachments=real_attachments
    )

@router.get("/qrng/stream")
def get_qrng_stream(length: int = 16):
    bit_string = qrng.qrng_service.generate_random_bits(length)
    return {"bits": bit_string}

@router.get("/qkd/establish_key")
def establish_qkd_key(key_length: int = 128, eve: bool = False):
    """
    Run a full BB84 simulation.
    Step 1: Alice bits (QRNG)
    Step 2: Channel transmission (with optional Eve)
    Step 3: Bob Measurement
    Step 4: Sifting
    Step 5: QBER Check
    Step 6: Privacy Amp
    Step 7: Final Key
    """
    # Create simulator
    simulator = qkd_engine.BB84Simulator(key_length=key_length, eve_presence=eve)
    
    # Run
    result = simulator.run_simulation()
    
    if result.get("success", False):
         # In a real system, we'd store result['key_hex'] into the Secure DB 
         # associated with the current user session or channel.
         pass
         
    return result

@router.get("/info/seed")
def get_quantum_seed():
    seed_hex = qrng.qrng_service.generate_otp_key(32)
    return {"seed": seed_hex}

@router.get("/keys/qkd")
def get_qkd_key(length: int = 32):
    """
    Simulates fetching a key from the Quantum Key Distribution network.
    In a real system, this would retrieve a pre-established key shared with the recipient.
    """
    # For demo purposes, we generate it on demand using QRNG
    key_hex = qrng.qrng_service.generate_otp_key(length)
    return {"key": key_hex, "id": f"QKD-{int(time.time()*1000)}"}

@router.get("/comparison/live")
def get_comparison_data(bits: int = 128):
    return comparison.perform_comparison(bits)

@router.get("/counts")
def get_counts(
    current_user: models.User = Depends(auth.get_current_user),
    database: Session = Depends(db.get_db)
):
    inbox_count = database.query(models.Email).filter(
        models.Email.recipient == current_user.email,
        models.Email.is_deleted == False,
        models.Email.is_spam == False,
        models.Email.is_draft == False,
        models.Email.sender != current_user.email # Important: don't count self-emails if possible, or maybe do. Standard inbox logic includes self-emails.
    ).count()

    # Drafts
    drafts_count = database.query(models.Email).filter(
        models.Email.sender == current_user.email,
        models.Email.is_draft == True,
        models.Email.is_deleted == False
    ).count()

    # Trash
    trash_count = database.query(models.Email).filter(
        (models.Email.recipient == current_user.email) | (models.Email.sender == current_user.email),
        models.Email.is_deleted == True
    ).count()

    return {
        "inbox": inbox_count,
        "drafts": drafts_count,
        "trash": trash_count,
        "sent": 0 # Sent count usually isn't shown in sidebar, but we return 0 placehold
    }

import os
import base64
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend

def encrypt_aes_gcm(plaintext: str, key_bytes: bytes) -> dict:
    """
    Encrypts plaintext using AES-256-GCM.
    Key must be 32 bytes (256 bits).
    Returns dict with hex-encoded ciphertext, iv, and tag.
    """
    if len(key_bytes) != 32:
        raise ValueError("Key must be 32 bytes for AES-256")

    iv = os.urandom(12) # GCM recommends 12 bytes
    cipher = Cipher(algorithms.AES(key_bytes), modes.GCM(iv), backend=default_backend())
    encryptor = cipher.encryptor()
    
    plaintext_bytes = plaintext.encode('utf-8')
    ciphertext = encryptor.update(plaintext_bytes) + encryptor.finalize()
    
    return {
        "ciphertext": ciphertext.hex(),
        "iv": iv.hex(),
        "tag": encryptor.tag.hex()
    }

def decrypt_aes_gcm(ciphertext_hex: str, key_bytes: bytes, iv_hex: str, tag_hex: str) -> str:
    """
    Decrypts AES-256-GCM.
    """
    if len(key_bytes) != 32:
        raise ValueError("Key must be 32 bytes")

    ciphertext = bytes.fromhex(ciphertext_hex)
    iv = bytes.fromhex(iv_hex)
    tag = bytes.fromhex(tag_hex)
    
    cipher = Cipher(algorithms.AES(key_bytes), modes.GCM(iv, tag), backend=default_backend())
    decryptor = cipher.decryptor()
    
    # Verify and decrypt
    decrypted_bytes = decryptor.update(ciphertext) + decryptor.finalize()
    return decrypted_bytes.decode('utf-8')

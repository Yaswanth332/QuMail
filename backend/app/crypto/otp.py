def xor_bytes(data: bytes, key: bytes) -> bytes:
    """
    XORs two byte sequences.
    """
    if len(data) > len(key):
        raise ValueError("Key must be at least as long as the data for OTP.")
    
    # Optimization: Byte-by-byte loop is slow for large files.
    # Convert to large integers, XOR, and convert back.
    data_int = int.from_bytes(data, 'big')
    # Slice the key to match data length exactly (OTP rule: use first N bytes)
    key_subset = key[:len(data)]
    key_int = int.from_bytes(key_subset, 'big')
    
    xor_int = data_int ^ key_int
    
    return xor_int.to_bytes(len(data), 'big')


def encrypt_message_otp(message: str, key_hex: str) -> str:
    """
    Encrypts a message using One-Time Pad.
    Returns the ciphertext in hex.
    """
    message_bytes = message.encode('utf-8')
    key_bytes = bytes.fromhex(key_hex)
    
    encrypted_bytes = xor_bytes(message_bytes, key_bytes)
    return encrypted_bytes.hex()

def decrypt_message_otp(ciphertext_hex: str, key_hex: str) -> str:
    """
    Decrypts a hex ciphertext using the key.
    """
    cipher_bytes = bytes.fromhex(ciphertext_hex)
    key_bytes = bytes.fromhex(key_hex)
    
    decrypted_bytes = xor_bytes(cipher_bytes, key_bytes)
    return decrypted_bytes.decode('utf-8')

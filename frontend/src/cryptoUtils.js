// cryptoUtils.js - Client-Side Encryption using Web Crypto API

// --- HELPERS ---
function arrayBufferToBase64(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function base64ToArrayBuffer(base64) {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

function stringToBytes(str) {
    return new TextEncoder().encode(str);
}

function bytesToString(bytes) {
    return new TextDecoder().decode(bytes);
}

// --- OPT/VERNAM CIPHER (Information-Theoretic Security) ---
export const encryptOTP = (text, keyHex) => {
    // 1. Convert text to bytes
    const textBytes = stringToBytes(text);

    // 2. Parse Key (Hex) to bytes
    // Key must be >= length of text
    const keyBytes = new Uint8Array(keyHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

    if (keyBytes.length < textBytes.length) {
        throw new Error("OTP Key too short for message (Info-Theoretic Insecurity)");
    }

    // 3. XOR
    const cipherBytes = new Uint8Array(textBytes.length);
    for (let i = 0; i < textBytes.length; i++) {
        cipherBytes[i] = textBytes[i] ^ keyBytes[i];
    }

    // 4. Return Hex
    return Array.from(cipherBytes).map(b => b.toString(16).padStart(2, '0')).join('');
};

export const decryptOTP = (cipherHex, keyHex) => {
    const cipherBytes = new Uint8Array(cipherHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
    const keyBytes = new Uint8Array(keyHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

    // console.log("Decrypting OTP. CipherLen:", cipherBytes.length, "KeyLen:", keyBytes.length);

    const textBytes = new Uint8Array(cipherBytes.length);
    for (let i = 0; i < cipherBytes.length; i++) {
        textBytes[i] = cipherBytes[i] ^ keyBytes[i];
    }

    return bytesToString(textBytes);
};

// --- AES-GCM (Computationally Secure) ---
export const generateKey = async () => {
    return await window.crypto.subtle.generateKey(
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
    );
};

// Encrypt data
export const encryptAES = async (text, attachments = [], manualKeyHex = null) => {
    let key;
    let exportedKeyBase64;

    if (manualKeyHex) {
        // Use Pre-Generated Quantum Key
        const keyBytes = new Uint8Array(manualKeyHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        key = await window.crypto.subtle.importKey(
            "raw",
            keyBytes,
            "AES-GCM",
            true,
            ["encrypt", "decrypt"]
        );
        exportedKeyBase64 = arrayBufferToBase64(keyBytes.buffer);
    } else {
        // Generate Local Key
        key = await generateKey();
        const exportedKey = await window.crypto.subtle.exportKey("raw", key);
        exportedKeyBase64 = arrayBufferToBase64(exportedKey);
    }

    const data = JSON.stringify({ body: text, attachments });
    const encodedData = stringToBytes(data);

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encryptedContent = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv: iv },
        key,
        encodedData
    );

    return {
        ciphertext: arrayBufferToBase64(encryptedContent),
        iv: arrayBufferToBase64(iv),
        key: exportedKeyBase64 // Encapsulated Key
    };
};

export const decryptAES = async (ciphertext, iv, keyInput, keyFormat = 'base64') => {
    let keyData;
    if (keyFormat === 'hex') {
        const bytes = new Uint8Array(keyInput.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
        keyData = bytes.buffer;
    } else {
        keyData = base64ToArrayBuffer(keyInput);
    }

    const key = await window.crypto.subtle.importKey(
        "raw",
        keyData,
        "AES-GCM",
        true,
        ["decrypt"]
    );

    const decryptedContent = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv: base64ToArrayBuffer(iv) },
        key,
        base64ToArrayBuffer(ciphertext)
    );

    const jsonStr = bytesToString(new Uint8Array(decryptedContent));
    return JSON.parse(jsonStr);
};

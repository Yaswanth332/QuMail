# QuMail - Quantum Secure Communication System
## ⚡ The Official User Manual & Rulebook

Welcome to **QuMail**, the world's first demonstration of *True Quantum Randomness* applied to everyday email communication. This system does not rely on math; it relies on the laws of physics to guarantee your privacy.

---

## 🚀 1. Getting Started

### Registration
1.  Navigate to the **Login Page**.
2.  Click **"Create Account"**.
3.  Enter a valid email (e.g., `alice@qumail.com`) and password.
4.  *Note: Since this is a high-security demo, there is no "Forgot Password". If you lose your credentials, your identity is lost.*

### Login
1.  Enter your credentials to access the **Quantum Dashboard**.
2.  The colored badge in the top-right corner indicates your connection status to the Quantum Random Number Generator (QRNG) stream.

---

## ✉️ 2. Sending Secure Emails

Navigate to the **Compose** tab (Pen Icon). You have three security levels available:

### ⚠️ Level 1: Standard (Plaintext)
*   **Use for:** Casual, non-sensitive chats.
*   **Mechanism:** Sends text exactly as is.
*   **DB Storage:** Readable text.
*   **Attachments:** Visible immediately.

### 🛡️ Level 2: AES Hybrid (Recommended)
*   **Use for:** Confidential business documents, long messages, large files.
*   **Mechanism:**
    *   Generates a **256-bit Key** using Quantum Noise.
    *   Encrypts your message + attachments using **AES-GCM** (Military Grade).
    *   **Metadata Vault**: Your Subject line is also encrypted.
*   **Experience:** Fast and secure.

### 🔒 Level 3: Quantum OTP (The Nuclear Option)
*   **Use for:** State secrets, whistleblowing, absolute zero-trust scenarios.
*   **Mechanism:**
    *   **One-Time Pad**: Generates a random key *the exact length* of your message.
    *   **Unbreakable**: It is mathematically impossible to crack this without the key.
*   **Cost:** Slower for very large files, but physically secure.

---

## 📥 3. Receiving & Decrypting

When you receive a secure email, it behaves differently from standard mail.

### The Inbox View
*   **Standard Emails**: Appear normally.
*   **Secure Emails**:
    *   **Subject**: Replaced with `*** ENCRYPTED METADATA ***` (Red Monospace Font).
    *   **Snippet**: Shows "Encrypted Message...".
    *   **Icon**: Displays a Lock 🔒.

### Reading the Message
1.  Click the email.
2.  **Initial State**: You see a **Black Terminal Block** with scrolling ciphertext. This proves the server only holds garbage data.
3.  **Action**: Click the **"Decrypt Content 🔓"** button.
4.  **The Handshake**:
    *   The app proves your identity to the **Key Service**.
    *   If authorized, the Key Service releases the ephemeral key from RAM.
5.  **The Reveal**: The terminal fades away, revealing the true **Subject**, **Body**, and **Attachments**.

### ⚠️ The "Burn After Reading" Rule
*   For **OTP** messages, the key is strictly one-time use.
*   Once the recipient decrypts the message, the key is **deleted from the server**.
*   This guarantees **Forward Secrecy**: Even if the server is seized tomorrow, that message can never be decrypted again.

---

## 🔬 4. Verifying True Randomness

Don't trust us? Verify the physics.
1.  Click **"Quantum Check"** (Dice Icon 🎲) in the sidebar.
2.  You will see a live battle between:
    *   🔴 **Classical Computer**: Uses math (pseudo-random). You might see faint patterns or diagonal lines in the heatmap.
    *   🟢 **Quantum Computer**: Uses physics (IBM Qiskit). The heatmap is pure "TV Static".
3.  **Chi-Square Test**: Look for a score close to `0.00`. This proves the data is unbiased.

---

## 📜 5. The Laws of QuMail (System Rules)

### Law #1: No Persistence
Encryption keys are stored in **Volatile RAM**, not on the hard drive.
*   **Consequence**: If the QuMail server restarts, **ALL** previously encrypted emails become permanently unreadable.
*   **Why**: This prevents "Data Forensics". A seized hard drive contains only white noise.

### Law #2: Recipient Eyes Only
*   Only the intended recipient can request the decryption key.
*   Alice cannot decrypt an email she sent to Bob (unless she is in the thread). Bob cannot decrypt Alice's other emails.

### Law #3: The Vault
*   We never store your file attachments in plaintext. They are bundled, encrypted, and only exist as temporary files in your browser's memory after decryption.

---
*QuMail: Because Math is Solvable, but Physics is Absolute.*

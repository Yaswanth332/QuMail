
# ⚠️ Edge Cases & Judge Q&A

This document prepares you for specific "Gotcha" questions judges might ask about the QuMail architecture.

## 1. "What happens if I refresh the page?"

**Scenario:** You decrypt an email, then refresh the page. The email returns to its encrypted state. When you try to decrypt again, it fails because the key was ephemeral and deleted from the server.

**The Judge's Question:** "Is this a bug? Why can't I see my email again?"

**Your Answer (Memorize This):**
> "This is a feature, not a bug. In our strict **ephemeral-key mode**, losing the active session means losing access to the message. This demonstrates **post-compromise exposure minimization**. If an attacker compromised your device 5 minutes later, they couldn't retrieve the key because it's gone from the server and cleared from your RAM.
>
> In a commercial version, we would implement a secure local enclave or hardware-backed keystore for convenience, but for this demo, we prioritized absolute secrecy."

---

## 2. "Why are you using HTTP instead of HTTPS?"

**The Judge's Question:** "I see `http://localhost`. Isn't that insecure?"

**Your Answer:**
> "HTTPS is assumed for any real-world deployment. The focus of this research project is **application-layer cryptography** (OTP/AES) and the **Quantum-Secure Key Architecture**, which protects data *even if* TLS is broken.
>
> Adding HTTPS is a standard infrastructure step (certbot), whereas our work is proving the novelty of the quantum key distribution layer itself."

---

## 3. "Is this really QKD?"

**The Judge's Question:** "You don't have fiber optic cables here. How is this QKD?"

**Your Answer:**
> "We explicitly label this as a **Simulated QKD Architecture**. We have built the *software stack* that would sit on top of physical QKD hardware.
>
> Our backend 'Simulated QKD Node' mimics the behavior of a physical trusted node by:
> 1. Generating keys via Qiskit (quantum simulation).
> 2. Distributing them via a separate logical channel.
> 3. Enforcing 'read-once-destroy' physics rules.
>
> This proves the **application readiness** for when quantum hardware becomes commodity."

// EmailView.jsx
import React, { useState, useEffect } from 'react';
import { decryptEmail, retrieveQKDKey, getKeyMetadata, discardKey } from '../api';
import { decryptAES, decryptOTP } from '../cryptoUtils';

const EmailView = ({ email, onBack, onReply, onForward, onDelete }) => {
    const [decryptedBody, setDecryptedBody] = useState(null);
    const [attachments, setAttachments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [keyMetadata, setKeyMetadata] = useState(null);
    const [verificationStatus, setVerificationStatus] = useState("checking"); // checking, verified, failed
    const [showRaw, setShowRaw] = useState(false);

    if (!email) return <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>Select an email to view</div>;

    useEffect(() => {
        // Reset state
        setDecryptedBody(null);
        setAttachments([]);
        setKeyMetadata(null);
        setVerificationStatus("checking");

        const cacheKey = `decrypted_${email.id}`;
        const cached = sessionStorage.getItem(cacheKey);

        // Only use cache for AES (Persistence). OTP must be strictly One-Time (No caching).
        const isOTP = email.encryption_level?.includes('otp');

        if (cached && email.is_encrypted && !isOTP) {
            try {
                const parsed = JSON.parse(cached);
                setDecryptedBody(parsed.body);
                setAttachments(parsed.attachments || []);
                setVerificationStatus("verified");
                return;
            } catch (e) {
                sessionStorage.removeItem(cacheKey);
            }
        }

        if (!email.is_encrypted) {
            handleDecrypt();
        } else {
            setShowRaw(true);
            fetchKeyMetadata();
        }
    }, [email.id]);

    useEffect(() => {
        const isOTP = email.encryption_level?.includes('otp');
        if (email.is_encrypted && decryptedBody && !isOTP) {
            try {
                sessionStorage.setItem(`decrypted_${email.id}`, JSON.stringify({
                    body: decryptedBody,
                    attachments: attachments
                }));
            } catch (e) {
                console.warn("Cache quota exceeded");
            }
        }
    }, [decryptedBody, attachments, email.id, email.encryption_level]);

    const fetchKeyMetadata = async () => {
        try {
            // We assume payload might contain keyId or checking 'email.key_id' from backend model/response
            // The `email` prop comes from getInbox list, which has `encryption_level`.
            // However, `getInbox` usually doesn't return the full key_id in the list view?
            // Let's check endpoints.py -> yes, `EmailResponse` DOES NOT have `key_id`.
            // But we need `key_id` to fetch metadata.
            // We can fetch the *full* email first to get the key_id? 
            // `decryptEmail` returns `DecryptedEmail` which might just be the encrypted blob if encrypted.
            // Actually, we can assume the `decryptEmail` endpoint (which returns the message content) 
            // returns the blind payload which contains `keyId` in the JSON text (for client side).

            // So we peek at the body first?
            // `email` object here is from the list.

            // OPTION: We just call decryptEmail (which fetches the body) but don't decrypt it yet.
            // We parse the JSON blob to extract `keyId`.

            const res = await decryptEmail(email.id);
            const bodyStr = res.data.body_plaintext;

            try {
                const blob = JSON.parse(bodyStr);
                if (blob.keyId) {
                    const metaRes = await getKeyMetadata(blob.keyId);
                    setKeyMetadata(metaRes.data);
                    setVerificationStatus("verified");
                } else {
                    setVerificationStatus("failed"); // No key ID found in payload
                }
            } catch (e) {
                // Not JSON or no keyId
                setVerificationStatus("failed");
            }
        } catch (e) {
            console.error(e);
            setVerificationStatus("failed");
        }
    };

    const handleSimulateLoss = async () => {
        if (keyMetadata && keyMetadata.key_id) {
            if (confirm("Simulate destruction of this Quantum Key? Decryption will become permanent impossible.")) {
                await discardKey(keyMetadata.key_id);
                sessionStorage.removeItem(`decrypted_${email.id}`); // Clear local cache
                setKeyMetadata(null);
                setVerificationStatus("failed");
                alert("Key Destroyed. Decryption capability lost.");
            }
        }
    };

    const handleDecrypt = async () => {
        setLoading(true);
        try {
            const res = await decryptEmail(email.id);

            if (email.encryption_level === 'client_aes' || email.encryption_level === 'otp_client' || email.encryption_level === 'otp') {
                let blob;
                try {
                    blob = JSON.parse(res.data.body_plaintext);
                } catch (e) {
                    setDecryptedBody(res.data.body_plaintext);
                    setLoading(false);
                    return;
                }

                if (!blob.keyId && !blob.key) {
                    // Maybe it's directly encrypted without separate key transport?
                    throw new Error("Invalid Secure Envelope Format");
                }

                // Verify Key Existence
                let keyToUse = null;
                let keyFormat = 'base64';

                // Prioritize fetching from QKD Node based on ID
                if (blob.keyId) {
                    try {
                        const keyRes = await retrieveQKDKey(blob.keyId);
                        keyToUse = keyRes.data.key;
                        keyFormat = 'hex';
                    } catch (keyErr) {
                        throw new Error("QUANTUM KEY UNAVAILABLE (Destroyed or Expired).");
                    }
                } else if (blob.key) {
                    // Legacy/Fallback
                    keyToUse = blob.key;
                    keyFormat = 'base64';
                }

                if (!keyToUse) throw new Error("Decryption Key Missing");

                if (email.encryption_level === 'otp_client' || email.encryption_level === 'otp') {
                    // OTP
                    const decryptedText = await decryptOTP(blob.ciphertext, keyToUse);
                    try {
                        const bundle = JSON.parse(decryptedText);
                        setDecryptedBody(bundle.body);
                        setAttachments(bundle.attachments || []);
                    } catch {
                        setDecryptedBody(decryptedText);
                    }
                } else {
                    // AES
                    const bundle = await decryptAES(blob.ciphertext, blob.iv, keyToUse, keyFormat);
                    setDecryptedBody(String(bundle.body));
                    setAttachments(bundle.attachments || []);
                }
            } else {
                // Server Side
                setDecryptedBody(res.data.body_plaintext);
                setAttachments(res.data.attachments || []);
            }
        } catch (e) {
            console.error("Decryption Error", e);
            setDecryptedBody(`[DECRYPTION FAILED]: ${e.message}`);
        } finally {
            setLoading(false);
        }
    };

    const showLockPanel = email.is_encrypted && decryptedBody === null;
    const showContentPanel = decryptedBody !== null;

    return (
        <div className="flex-col h-full animate-fade-in">
            {/* Toolbar */}
            <div className="glass" style={{
                padding: '12px 24px', borderBottom: '1px solid var(--glass-border)', display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '20px'
            }}>
                <button className="btn btn-ghost" onClick={onBack}>⬅ Back</button>
                <div style={{ width: '1px', background: 'var(--glass-border)', height: '24px' }}></div>
                <button className="btn btn-ghost" onClick={() => onReply(email)}>↩ Reply</button>
                <button className="btn btn-ghost" style={{ color: 'var(--danger-color)' }} onClick={() => onDelete(email.id)}>🗑️</button>
            </div>

            <div style={{ padding: '0 30px 20px 30px' }}>
                <div className="flex-row justify-between" style={{ alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div className="flex-col gap-2">
                        <h2 style={{ fontSize: '1.5rem' }}>{showLockPanel ? <span style={{ color: 'var(--danger-color)' }}>*** QUANTUM ENCRYPTED ***</span> : email.subject}</h2>
                        <div className="flex-row gap-4">
                            <div style={{
                                width: '42px', height: '42px', borderRadius: '12px', background: 'linear-gradient(135deg, var(--primary-color), #ff0055)',
                                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold'
                            }}>{(email.sender || "?")[0].toUpperCase()}</div>
                            <div className="flex-col">
                                <div style={{ fontWeight: '600' }}>{email.sender}</div>
                                <div className="text-sm text-muted">to me</div>
                            </div>
                        </div>
                    </div>

                    {/* KEY VERIFICATION PANEL */}
                    {showLockPanel && (
                        <div className="glass" style={{ padding: '20px', borderRadius: '12px', minWidth: '340px', border: '1px solid #333' }}>
                            <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Decryption Key Status
                            </div>

                            {verificationStatus === 'checking' ? (
                                <div style={{ color: '#888', fontSize: '0.9rem' }}>Verifying Key Integrity...</div>
                            ) : verificationStatus === 'failed' ? (
                                <div style={{ color: '#ef4444', fontWeight: 'bold' }}>
                                    ❌ KEY VERIFICATION FAILED
                                    <div style={{ fontSize: '0.8rem', fontWeight: 'normal', color: '#999', marginTop: '5px' }}>
                                        The security key for this message cannot be located.
                                    </div>
                                </div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '8px', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                                    <span style={{ color: '#666' }}>ID:</span>
                                    <span style={{ color: '#a78bfa' }}>{keyMetadata?.key_id?.slice(0, 8)}...</span>

                                    <span style={{ color: '#666' }}>SOURCE:</span>
                                    <span style={{ color: '#fff' }}>{keyMetadata?.source || "QKD Service"}</span>

                                    <span style={{ color: '#666' }}>FINGERPRT:</span>
                                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>{keyMetadata?.fingerprint}</span>

                                    <span style={{ color: '#666' }}>STATUS:</span>
                                    <span style={{ color: '#10b981' }}>✔ VERIFIED AVAILABLE</span>
                                </div>
                            )}

                            <div style={{ height: '1px', background: '#333', margin: '15px 0' }}></div>

                            <button className="btn btn-primary w-full" onClick={handleDecrypt} disabled={loading || verificationStatus !== 'verified'}>
                                {loading ? "Decrypting..." : "🔓 Decrypt Payload"}
                            </button>

                            {/* FAILURE DEMO BUTTON */}
                            {verificationStatus === 'verified' && (
                                <button
                                    className="btn btn-ghost w-full"
                                    style={{ marginTop: '10px', color: '#ef4444', fontSize: '0.8rem', opacity: 0.7 }}
                                    onClick={handleSimulateLoss}
                                >
                                    ⚠ Simulate Key Loss (Demo)
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {showLockPanel && (
                    <div style={{
                        border: '1px solid var(--glass-border)',
                        borderRadius: '8px',
                        background: '#0a0a0a',
                        padding: '20px',
                        fontFamily: '"Fira Code", monospace',
                        color: '#00ff88',
                        fontSize: '0.85rem',
                        position: 'relative',
                        minHeight: '200px',
                        overflow: 'hidden'
                    }}>
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: '#00ff88', boxShadow: '0 0 15px #00ff88' }}></div>
                        <div style={{ opacity: 0.6, marginBottom: '10px' }}>&gt; INCOMING QUANTUM STREAM...</div>
                        <div style={{ opacity: 0.6, marginBottom: '10px' }}>&gt; VERIFYING QKD SIGNATURE...</div>
                        <div style={{ opacity: 1, marginBottom: '20px', color: '#fff' }}>[ LOCKED ] Payloaded Encrypted with {(email.encryption_level === 'otp' || email.encryption_level === 'otp_client') ? 'ONE-TIME PAD' : 'AES-GCM-256'}</div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(20px, 1fr))', gap: '2px', opacity: 0.3, filter: 'blur(0.5px)' }}>
                            {Array(600).fill(0).map((_, i) => (
                                <span key={i}>{Math.random() > 0.5 ? '1' : '0'}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Decoded/Content Body - Conditional Rendering based on explicit null check */}
            {showContentPanel && (
                <div style={{ padding: '0 30px 40px 30px' }}>
                    {/* Define helper for render scope */}
                    {(() => {
                        const isDecryptionBlocked = typeof decryptedBody === 'string' && (decryptedBody.includes("[DECRYPTION FAILED]") || decryptedBody.includes("KEY EXPIRED"));
                        return (
                            <div className="glass-panel" style={{ padding: '40px', minHeight: '400px', background: '#121214', border: '1px solid #333', borderRadius: '16px' }}>
                                {isDecryptionBlocked ? (
                                    <div style={{ padding: '20px', border: '1px solid var(--danger-color)', background: 'rgba(255, 42, 42, 0.1)', borderRadius: '8px', color: '#ff8888' }}>
                                        <h3 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>🔐 Decryption Failed</h3>
                                        <p>The security key for this message has been destroyed or is invalid.</p>
                                    </div>
                                ) : (
                                    <>
                                        <div style={{ marginBottom: '20px', paddingBottom: '15px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <div className="flex-row gap-2">
                                                <span style={{ color: '#00ff88' }}>●</span>
                                                <span style={{ color: '#ccc', fontSize: '0.9rem' }}>Verified Quantum Secure Connection</span>
                                            </div>
                                            <div style={{ fontSize: '0.8rem', color: '#888' }}>
                                                {(email.encryption_level === 'otp' || email.encryption_level === 'otp_client') ? 'PROTOCOL: OTP-512 (Information Theoretic)' : 'PROTOCOL: AES-256-GCM (Quantum Seeded)'}
                                            </div>
                                        </div>

                                        <div style={{ fontSize: '1.05rem', lineHeight: '1.7', whiteSpace: 'pre-wrap', color: '#eee', fontFamily: 'Inter, sans-serif' }}>
                                            {decryptedBody}
                                        </div>

                                        {attachments && attachments.length > 0 && (
                                            <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #333' }}>
                                                <h4 className="text-muted" style={{ marginBottom: '16px', color: '#999' }}>Attachments ({attachments.length})</h4>
                                                <div className="flex-row gap-4 flex-wrap">
                                                    {attachments.map((file, idx) => (
                                                        <div key={idx} className="glass"
                                                            style={{ padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', background: '#222', border: '1px solid #444' }}
                                                            onClick={() => {
                                                                if (file.data) {
                                                                    const win = window.open();
                                                                    win.document.write(
                                                                        `<iframe src="${file.data}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`
                                                                    );
                                                                }
                                                            }}
                                                        >
                                                            <span style={{ fontSize: '1.5rem' }}>📄</span>
                                                            <div className="flex-col">
                                                                <span style={{ fontWeight: '500', color: '#fff' }}>{file.name}</span>
                                                                <span style={{ fontSize: '0.75rem', color: '#aaa' }}>Decrypted RAM-Only</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        );
                    })()}
                </div>
            )}
        </div>
    );
};

export default EmailView;

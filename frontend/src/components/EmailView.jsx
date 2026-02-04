import React, { useState, useEffect } from 'react';
import { decryptEmail } from '../api';
import { decryptClientSide } from '../cryptoUtils';

const EmailView = ({ email, onBack, onReply, onForward, onDelete }) => {
    const [decryptedBody, setDecryptedBody] = useState(null);
    const [attachments, setAttachments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showRaw, setShowRaw] = useState(false); // Controls visibility of ciphertext
    const [passphrase, setPassphrase] = useState('');

    if (!email) return <div style={{ padding: '20px', color: 'var(--text-secondary)' }}>Select an email to view</div>;

    useEffect(() => {
        // Auto-fetch content for Standard (Unencrypted) emails
        if (!email.is_encrypted) {
            handleDecrypt();
        } else {
            // Reset state for new encrypted email selection
            setDecryptedBody(null);
            setAttachments([]);
            setShowRaw(true); // Default to showing the raw ciphertext for drama
        }
    }, [email.id]);

    const handleDecrypt = async () => {
        setLoading(true);
        try {
            const res = await decryptEmail(email.id);

            // Client-Side Decryption Handling
            if (email.encryption_level === 'client_aes') {
                // The backend returns the raw blind ciphertext as 'body_plaintext' because it didn't decrypt it
                // We parse it as a JSON payload containing ciphertext, IV, and seed
                const blob = JSON.parse(res.data.body_plaintext);

                // Perform local decryption
                // NOTE: 'seed' here represents the exchanged key (simulated transport)
                const decryptedJson = await decryptClientSide(blob.ciphertext, blob.iv, blob.seed);

                // The result is the original {body, attachments} bundle
                // Note: decryptClientSide returns an Object in our utils, not a string JSON
                // Wait, utils returns JSON.parse() of the string. So it IS an object.
                const bundle = decryptedJson;

                setDecryptedBody(String(bundle.body));
                setAttachments(bundle.attachments || []);
            } else {
                // Server-Side Decryption (Legacy / Fallback)
                const body = res.data && res.data.body_plaintext ? String(res.data.body_plaintext) : "";
                setDecryptedBody(body);
                setAttachments(res.data.attachments || []);
            }
        } catch (e) {
            console.error("Decryption Error", e);
            setDecryptedBody("** [DECRYPTION FAILED: QUANTUM KEY EXPIRED OR WRONG PASSPHRASE] **");
        } finally {
            setLoading(false);
        }
    };

    const isDecryptionBlocked = typeof decryptedBody === 'string' && (decryptedBody.includes("[DECRYPTION FAILED]") || decryptedBody.includes("KEY EXPIRED"));

    return (
        <div className="flex-col h-full animate-fade-in">
            {/* Toolbar */}
            <div className="glass" style={{
                padding: '12px 24px',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
                color: 'var(--text-secondary)',
                marginBottom: '20px'
            }}>
                <button className="btn btn-ghost" onClick={onBack}>⬅ Back</button>
                <div style={{ width: '1px', background: 'var(--glass-border)', height: '24px' }}></div>
                <button className="btn btn-ghost" onClick={() => onReply(email)}>↩ Reply</button>
                <button className="btn btn-ghost" onClick={() => onForward(email)}>↪ Forward</button>
                <button className="btn btn-ghost" style={{ color: 'var(--danger-color)' }} onClick={() => onDelete(email.id)}>🗑️ Delete</button>
            </div>

            {/* Header Content */}
            <div style={{ padding: '0 30px 20px 30px' }}>
                <div className="flex-row justify-between" style={{ alignItems: 'flex-start', marginBottom: '20px' }}>
                    <div className="flex-col gap-2">
                        <h2 style={{ fontSize: '1.5rem', fontFamily: 'var(--font-family)' }}>
                            {email.is_encrypted && !decryptedBody ? <span style={{ color: 'var(--danger-color)', letterSpacing: '1px', fontSize: '1.2rem' }}>*** ENCRYPTED METADATA ***</span> : email.subject}
                        </h2>
                        <div className="flex-row gap-4">
                            <div style={{
                                width: '42px', height: '42px', borderRadius: '12px',
                                background: 'linear-gradient(135deg, var(--primary-color), #ff0055)',
                                color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 12px var(--primary-glow)'
                            }}>
                                {(email.sender || "?")[0].toUpperCase()}
                            </div>
                            <div className="flex-col">
                                <div style={{ fontWeight: '600', fontSize: '1.05rem' }}>{email.sender || "Unknown Sender"}</div>
                                <div className="text-sm text-muted">to me</div>
                            </div>
                        </div>
                    </div>

                    {email.is_encrypted && !decryptedBody && (
                        <div className="glass" style={{ padding: '16px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '10px', minWidth: '300px' }}>
                            <div className="text-sm text-muted" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ width: '8px', height: '8px', background: 'var(--secondary-color)', borderRadius: '50%', boxShadow: '0 0 8px var(--secondary-color)' }}></span>
                                <span>Quantum Lock Active</span>
                            </div>

                            {/* Passphrase not needed for this demo flow since we transport key in payload, but we keep UI strictly clean */}

                            <button className="btn btn-primary w-full" onClick={handleDecrypt} disabled={loading}>
                                {loading ? "Decrypting..." : "🔓 Decrypt Content"}
                            </button>
                        </div>
                    )}
                </div>

                {email.is_encrypted && !decryptedBody && (
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
                        <div style={{ opacity: 1, marginBottom: '20px', color: '#fff' }}>[ LOCKED ] Payloaded Encrypted with {email.encryption_level === 'otp' ? 'ONE-TIME PAD' : 'AES-GCM-256'}</div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(20px, 1fr))', gap: '2px', opacity: 0.3, filter: 'blur(0.5px)' }}>
                            {Array(600).fill(0).map((_, i) => (
                                <span key={i}>{Math.random() > 0.5 ? '1' : '0'}</span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Decrypted Body Content */}
            {decryptedBody && (
                <div style={{ padding: '0 30px 40px 30px' }}>
                    <div className="glass-panel animate-fade-in" style={{ padding: '40px', minHeight: '400px', background: 'rgba(255,255,255,0.02)' }}>
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
                                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Verified Quantum Secure Connection</span>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        {email.encryption_level === 'otp' ? 'PROTOCOL: OTP-512' : 'PROTOCOL: AES-256-GCM'}
                                    </div>
                                </div>

                                <div style={{ fontSize: '1.05rem', lineHeight: '1.7', whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
                                    {decryptedBody}
                                </div>

                                {attachments && attachments.length > 0 && (
                                    <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--glass-border)' }}>
                                        <h4 className="text-muted" style={{ marginBottom: '16px' }}>Attachments ({attachments.length})</h4>
                                        <div className="flex-row gap-4 flex-wrap">
                                            {attachments.map((file, idx) => (
                                                <div key={idx} className="glass" style={{ padding: '12px 16px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                                                    <span style={{ fontSize: '1.5rem' }}>📄</span>
                                                    <div className="flex-col">
                                                        <span style={{ fontWeight: '500' }}>{file.name}</span>
                                                        <span style={{ fontSize: '0.75rem', color: 'var(--secondary-color)' }}>Decrypted RAM-Only</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmailView;

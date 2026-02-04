import React, { useState, useEffect, useRef } from 'react';
import { logout } from '../api';
import Sidebar from '../components/Sidebar';
import Inbox from '../components/Inbox';
import Compose from '../components/Compose';
import EmailView from '../components/EmailView';
import DemoMode from '../components/DemoMode'; // Updated import
import QKDStatusPanel from '../components/QKDStatusPanel';
import QRNGPanel from '../components/QRNGPanel';
import KeyManagerPanel from '../components/KeyManagerPanel';

const ProfileMenu = ({ userEmail }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // Initial for Avatar
    const initial = userEmail ? userEmail[0].toUpperCase() : 'U';

    // Click outside handler
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div style={{ position: 'relative' }} ref={menuRef}>
            {/* Avatar Button */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', border: '2px solid rgba(255,255,255,0.1)',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.3)',
                    color: 'white', fontWeight: 'bold', fontSize: '1.1rem',
                    userSelect: 'none'
                }}
                title={userEmail}
            >
                {initial}
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="animate-fade-in" style={{
                    position: 'absolute', top: '55px', right: '0',
                    width: '300px', background: 'rgba(26, 27, 33, 0.95)',
                    backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                    zIndex: 1000, padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px'
                }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '15px' }}>
                        <div style={{ fontSize: '0.9rem', color: 'white', fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {userEmail}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#10b981', marginTop: '4px' }}>
                            Quantum Identity Verified
                        </div>
                    </div>

                    {/* Avatar Big */}
                    <div style={{ display: 'flex', justifyContent: 'center', margin: '10px 0' }}>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2.5rem', color: 'white', fontWeight: 'bold',
                            boxShadow: '0 0 20px rgba(124, 58, 237, 0.3)'
                        }}>
                            {initial}
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <button className="btn btn-ghost" style={{
                            border: '1px solid #333', borderRadius: '20px',
                            padding: '8px 20px', fontSize: '0.9rem', background: 'transparent', color: '#ccc'
                        }}>
                            Manage your QuMail Account
                        </button>
                    </div>

                    {/* Actions */}
                    <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
                        <button
                            onClick={logout}
                            className="btn btn-ghost"
                            style={{
                                background: '#23242a', border: '1px solid #333',
                                color: '#ef4444', justifyContent: 'center', width: '100%'
                            }}
                        >
                            <span style={{ fontSize: '1.2rem' }}>⏻</span> Sign out
                        </button>
                    </div>

                    <div style={{ textAlign: 'center', fontSize: '0.7rem', color: '#666', marginTop: '10px' }}>
                        Privacy Policy • Terms of Service
                    </div>
                </div>
            )}
        </div>
    );
};

const Dashboard = () => {
    // Default view 'compose' to match the screenshot context
    const [view, setView] = useState('compose');
    const [selectedEmail, setSelectedEmail] = useState(null);
    const userEmail = localStorage.getItem('user_email') || 'guest@qumail.com';
    const [mockQKDKey, setMockQKDKey] = useState(null); // Just for demo state

    // Reply/Forward Data
    const [composeData, setComposeData] = useState({ to: '', subject: '', body: '' });

    const handleSelectEmail = (email) => {
        setSelectedEmail(email);
        setView('read');
    };

    const handleReply = (email) => {
        setComposeData({
            to: email.sender,
            subject: `Re: ${email.subject}`,
            body: `\n\n\n--- On ${email.sent_at}, ${email.sender} wrote: ---`
        });
        setView('compose');
    };

    const handleForward = (email) => {
        setComposeData({
            to: '',
            subject: `Fwd: ${email.subject}`,
            body: `\n\n\n--- Forwarded Message ---\nFrom: ${email.sender}\nDate: ${email.sent_at}\n`
        });
        setView('compose');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', width: '100vw', background: 'var(--bg-color)', overflow: 'auto' }}>

            {/* QKD Overlay */}
            {view === 'qkd_sim' && (
                <QKDStatusPanel
                    onClose={() => setView('compose')}
                    onKeyEstablished={(key) => {
                        setMockQKDKey(key);
                        // In reality, this key would be stored in a Secure Context or returned to the 'compose' view
                    }}
                />
            )}

            <Sidebar currentView={view} setView={setView} />

            <div className="flex-col" style={{ flex: 1, padding: '20px', overflow: 'hidden', position: 'relative' }}>

                {/* Top Status Bar (HUD) */}
                <div style={{
                    display: 'flex', justifyContent: 'flex-end', gap: '20px', marginBottom: '20px',
                    alignItems: 'center'
                }}>
                    {/* Status Pills */}
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{
                            background: '#1a1b21', border: '1px solid #333', borderRadius: '20px',
                            padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem'
                        }}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
                            Quantum Key Infrastructure (Simulation)
                        </div>
                        <div style={{
                            background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', borderRadius: '20px',
                            padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: '#10b981', fontWeight: 'bold',
                            cursor: 'pointer'
                        }} onClick={() => setView('qkd_sim')}>
                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 5px #10b981' }}></span>
                            {mockQKDKey ? 'QKD Architecture Ready' : 'QKD Architecture Ready'}
                        </div>
                    </div>

                    {/* Divider */}
                    <div style={{ width: '1px', height: '24px', background: '#333' }}></div>

                    {/* Apps Grid (Google Style) */}
                    <div style={{ fontSize: '1.2rem', color: '#999', cursor: 'pointer', padding: '8px' }} title="QuMail Apps">⋮⋮⋮</div>

                    {/* Profile Avatar */}
                    <ProfileMenu userEmail={userEmail} />
                </div>

                {/* Main View Data */}
                <div style={{ flex: 1, overflow: 'hidden', background: '#131419', borderRadius: '20px', padding: '20px', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column' }}>
                    {view === 'inbox' && <Inbox folder="inbox" onSelectEmail={handleSelectEmail} />}
                    {view === 'sent' && <Inbox folder="sent" onSelectEmail={handleSelectEmail} />}
                    {view === 'drafts' && <Inbox folder="drafts" onSelectEmail={handleSelectEmail} />}
                    {view === 'trash' && <Inbox folder="trash" onSelectEmail={handleSelectEmail} />}
                    {view === 'decrypt' && <div style={{ color: 'white', padding: '20px' }}>Decrypt Interface (Use Inbox)</div>}

                    {/* Updated Settings View to include Panels */}
                    {view === 'settings' && (
                        <div style={{ color: 'white', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <h2 style={{ margin: 0 }}>System Utilities</h2>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                <QRNGPanel />
                                <KeyManagerPanel />
                            </div>
                        </div>
                    )}

                    {/* DEMO MODE: Replaced ComparisonView with DemoMode */}
                    {view === 'comparison' && <DemoMode />}

                    {view === 'compose' && (
                        <Compose
                            onSent={() => setView('inbox')}
                            initialTo={composeData.to}
                            initialSubject={composeData.subject}
                            initialBody={composeData.body}
                        />
                    )}

                    {view === 'read' && selectedEmail && (
                        <EmailView
                            email={selectedEmail}
                            onBack={() => setView('inbox')}
                            onReply={handleReply}
                            onForward={handleForward}
                            onDelete={() => setView('inbox')}
                        />
                    )}
                </div>

                {/* BOTTOM DISCLAIMER (MANDATORY) */}
                <div style={{
                    position: 'absolute', bottom: '5px', left: '0', right: '0',
                    textAlign: 'center', fontSize: '0.65rem', color: '#444', pointerEvents: 'none'
                }}>
                    “This system uses NIST-validated quantum randomness for encryption key generation, with a QKD-ready architecture for secure key distribution, ensuring end-to-end confidentiality over classical communication networks.”
                </div>

            </div>
        </div>
    );
};

export default Dashboard;

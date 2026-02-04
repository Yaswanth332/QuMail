import React, { useState, useEffect } from 'react';
import { getEmailCounts } from '../api';

const Sidebar = ({ currentView, setView }) => {
    const [counts, setCounts] = useState({ inbox: 0, drafts: 0, trash: 0, sent: 0 });

    useEffect(() => {
        const fetchCounts = async () => {
            try {
                const res = await getEmailCounts();
                setCounts(res.data);
            } catch (error) {
                console.error("Failed to fetch counts", error);
            }
        };

        // Fetch immediately and then poll
        fetchCounts();
        const interval = setInterval(fetchCounts, 5000);
        return () => clearInterval(interval);
    }, []);

    // Nav structure
    const mainNavItems = [
        { id: 'inbox', label: 'Inbox', icon: '📥', count: counts.inbox > 0 ? counts.inbox : null },
        { id: 'sent', label: 'Sent', icon: '↗️', count: null }, // Sent count usually hidden in gmail style
        { id: 'drafts', label: 'Drafts', icon: '📝', count: counts.drafts > 0 ? counts.drafts : null },
        { id: 'trash', label: 'Trash', icon: '🗑️', count: counts.trash > 0 ? counts.trash : null },
    ];

    const utilityItems = [
        { id: 'comparison', label: 'Demo Mode', icon: '📊' },
        { id: 'visualization', label: 'Quantum Concepts (Demo)', icon: '🌌' },
        { id: 'settings', label: 'Settings', icon: '⚙️' },
    ];

    return (
        <div style={{
            width: '260px',
            background: 'var(--sidebar-bg)', // Should be dark #0f1014 or similar
            display: 'flex',
            flexDirection: 'column',
            padding: '24px 16px', // Slightly less padding for hover areas
            height: '100vh',
            boxSizing: 'border-box',
            borderRight: '1px solid #1f2026'
        }}>
            {/* 1. Logo Area */}
            <div style={{ padding: '0 12px 20px 12px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => setView('inbox')}>
                <div style={{
                    minWidth: '32px', height: '32px',
                    background: 'linear-gradient(135deg, #7c3aed, #4c1d95)',
                    borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '18px', color: 'white',
                    boxShadow: '0 0 15px rgba(124, 58, 237, 0.4)'
                }}>🛡️</div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '1.3rem', fontWeight: 'bold', color: 'white', lineHeight: '1', fontFamily: 'Inter, sans-serif' }}>QuMail</span>
                </div>
            </div>

            {/* 2. Compose Button (Gmail Style) */}
            <div style={{ padding: '0 0 20px 0' }}>
                <button
                    onClick={() => setView('compose')}
                    className="hover-bright" // Add this class globally if needed or inline hover logic
                    style={{
                        background: 'var(--primary)',
                        color: 'white',
                        height: '56px',
                        width: '140px',
                        borderRadius: '16px',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        fontSize: '1rem',
                        fontWeight: '600',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                        transition: 'all 0.2s ease',
                    }}
                    onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.02)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(124, 58, 237, 0.4)'; }}
                    onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)'; }}
                >
                    <span style={{ fontSize: '1.5rem', lineHeight: 0 }}>✏️</span>
                    <span>Compose</span>
                </button>
            </div>

            {/* 3. Navigation List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>

                {mainNavItems.map(item => (
                    <div
                        key={item.id}
                        onClick={() => setView(item.id)}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            padding: '10px 16px 10px 26px', // Left padding for indent
                            borderRadius: '0 24px 24px 0', // Gmail style right-rounded
                            cursor: 'pointer',
                            background: currentView === item.id ? 'rgba(124, 58, 237, 0.15)' : 'transparent',
                            color: currentView === item.id ? '#c4b5fd' : '#d1d5db',
                            fontWeight: currentView === item.id ? 'bold' : 'normal',
                            transition: 'background 0.2s'
                        }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            {/* Icons can be replaced with SVGs for better quality */}
                            <span>{item.icon}</span>
                            <span>{item.label}</span>
                        </div>
                        {item.count && (
                            <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{item.count}</span>
                        )}
                    </div>
                ))}

                <div style={{ height: '1px', background: '#2d2e36', margin: '10px 0' }}></div>

                {/* QKD Trigger */}
                <div
                    onClick={() => setView('qkd_sim')}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '16px',
                        padding: '10px 16px 10px 26px',
                        borderRadius: '0 24px 24px 0',
                        cursor: 'pointer',
                        color: currentView === 'qkd_sim' ? '#10b981' : '#10b981',
                        background: currentView === 'qkd_sim' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
                        fontWeight: 'bold'
                    }}
                >
                    <span>⚛️</span>
                    <span>Quantum Link</span>
                </div>

                {utilityItems.map(item => (
                    <div
                        key={item.id}
                        onClick={() => setView(item.id)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '16px',
                            padding: '10px 16px 10px 26px',
                            borderRadius: '0 24px 24px 0',
                            cursor: 'pointer',
                            color: currentView === item.id ? '#c4b5fd' : '#9ca3af',
                            background: currentView === item.id ? 'rgba(124, 58, 237, 0.15)' : 'transparent',
                        }}
                    >
                        <span>{item.icon}</span>
                        <span>{item.label}</span>
                    </div>
                ))}
            </div>

            {/* 4. Bottom Security Legend */}
            <div style={{ marginTop: 'auto', border: '1px solid #2d2e36', borderRadius: '12px', padding: '15px', background: '#131419' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#666', marginBottom: '10px' }}>ARCHITECTURE STATUS</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span style={{ color: '#ccc' }}>QRNG Source</span>
                        <span style={{ color: '#10b981', fontWeight: 'bold' }}>Active (NIST)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span style={{ color: '#ccc' }}>QKD Layer</span>
                        <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>Simulated</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                        <span style={{ color: '#ccc' }}>Encryption</span>
                        <span style={{ color: '#a78bfa', fontWeight: 'bold' }}>Client-Side</span>
                    </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}>Zero Trust Network</div>
                <div className="flex-col gap-2">
                    <div className="flex-row gap-2" style={{ fontSize: '0.8rem', color: '#9ca3af', alignItems: 'center' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 5px #10b981' }}></div>
                        OTP (Quantum Safe)
                    </div>
                    <div className="flex-row gap-2" style={{ fontSize: '0.8rem', color: '#9ca3af', alignItems: 'center' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#7c3aed' }}></div>
                        AES-256 GCM
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;

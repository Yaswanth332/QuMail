import React, { useState, useEffect } from 'react';

const KeyManagerPanel = () => {
    // Mock simulation data
    const [keysAvailable, setKeysAvailable] = useState(128);
    const [sessionID, setSessionID] = useState('QKD-SIM-001');

    useEffect(() => {
        const interval = setInterval(() => {
            // Simulate consumption and replenishment
            setKeysAvailable(prev => {
                if (prev < 50) return prev + 10; // Replenish
                return prev - (Math.random() > 0.7 ? 1 : 0); // Consume occasionally
            });
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div style={{ padding: '20px', background: '#131419', borderRadius: '16px', border: '1px solid #333' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <h3 style={{ margin: 0, color: '#a78bfa', fontSize: '1.2rem' }}>QKD Key Manager</h3>
                <span style={{ fontSize: '0.8rem', color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)', padding: '2px 8px', borderRadius: '4px' }}>BB84 SIMULATION ACTIVE</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '15px' }}>
                <div style={{ background: '#0a0a0a', padding: '10px', borderRadius: '8px', border: '1px solid #333' }}>
                    <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '5px' }}>API STANDARD</div>
                    <div style={{ fontWeight: 'bold', color: '#a78bfa' }}>ETSI GS QKD 014 (Rest API)</div>
                </div>

                <div style={{ display: 'flex', gap: '15px' }}>
                    <div className="flex-col" style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.75rem', color: '#999' }}>SESSION ID</span>
                        <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{sessionID}</span>
                    </div>
                    <div className="flex-col" style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.75rem', color: '#999' }}>KEYS AVAILABLE</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: keysAvailable < 20 ? '#ef4444' : 'white' }}>{keysAvailable}</span>
                    </div>
                    <div className="flex-col" style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.75rem', color: '#999' }}>QBER (AVG)</span>
                        <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981' }}>2.4%</span>
                    </div>
                </div>

                <div className="flex-col">
                    <span style={{ fontSize: '0.75rem', color: '#999' }}>KEY CONSUMPTION</span>
                    <div style={{ width: '100%', height: '6px', background: '#333', borderRadius: '3px', marginTop: '5px' }}>
                        <div style={{ width: '25%', height: '100%', background: '#a78bfa', borderRadius: '3px' }}></div>
                    </div>
                </div>

                <div style={{ fontSize: '0.75rem', color: '#666', borderTop: '1px solid #333', paddingTop: '10px' }}>
                    NOTE: Actual photon exchange is simulated. Keys are generated via QRNG and distributed via simulated secure channel.
                </div>
            </div>
        </div>
    );
};

export default KeyManagerPanel;

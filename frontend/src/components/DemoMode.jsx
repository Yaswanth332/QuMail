import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../api';

const DemoMode = () => {
    const [status, setStatus] = useState('IDLE'); // IDLE, RUNNING, INTERCEPTED, SAFE
    const [eveActive, setEveActive] = useState(false);
    const [logs, setLogs] = useState([]);

    // Key Stats
    const [qber, setQBER] = useState(0);
    const [keyBits, setKeyBits] = useState(0);

    // Initial logs
    useEffect(() => {
        if (status === 'IDLE') {
            setLogs(["> Educational Simulation Ready.", "> Select parameters and click 'Start'"]);
        }
    }, [status]);

    const addLog = (msg) => setLogs(p => [...p.slice(-4), msg]);

    const runEducationalSim = async () => {
        setStatus('RUNNING');
        setLogs(["> Initializing BB84 Protocol..."]);
        setQBER(0);

        // Sim Steps
        await new Promise(r => setTimeout(r, 800));
        addLog("> Alice: Preparing Quantum States...");

        await new Promise(r => setTimeout(r, 800));
        addLog(eveActive ? "> Eve: ATTEMPTING INTERCEPTION..." : "> Channel: Transmitting Photons...");

        await new Promise(r => setTimeout(r, 1000));

        if (eveActive) {
            addLog("> ALERT: Photon polarization disturbed!");
            setQBER(0.26); // High QBER
            setStatus('INTERCEPTED');
            addLog("> Bob: High Error Rate Detected (26%)");
            addLog("> System: ABORT - Eavesdropper Found!");
        } else {
            addLog("> Bob: Measurement Complete.");
            setQBER(0.02);
            setStatus('SAFE');
            addLog("> System: QBER Low (2%). Connection Secure.");
            addLog("> Privacy Amplification Complete.");
        }
    };

    return (
        <div style={{ padding: '40px', color: 'white', maxWidth: '800px', margin: '0 auto' }} className="animate-fade-in">
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Educational Simulation Mode</h1>
                <p className="text-muted">Safe environment to demonstrate Quantum Attack vectors</p>
            </div>

            <div className="glass-panel" style={{ padding: '40px' }}>

                {/* Controls */}
                <div style={{ display: 'flex', gap: '20px', marginBottom: '30px', justifyContent: 'center' }}>
                    <div
                        onClick={() => setEveActive(!eveActive)}
                        style={{
                            padding: '15px 30px', borderRadius: '12px', border: '1px solid',
                            borderColor: eveActive ? '#ef4444' : '#333',
                            background: eveActive ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px'
                        }}
                    >
                        <span style={{ fontSize: '1.5rem' }}>🕵️‍♀️</span>
                        <div>
                            <div style={{ fontWeight: 'bold', color: eveActive ? '#ef4444' : '#ccc' }}>Eve (Attacker)</div>
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>{eveActive ? "ACTIVE" : "INACTIVE"}</div>
                        </div>
                    </div>
                </div>

                {/* Viz Area */}
                <div style={{
                    height: '200px', background: '#000', borderRadius: '16px', marginBottom: '30px',
                    position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{ position: 'absolute', top: '10px', left: '10px', fontSize: '0.8rem', color: '#444' }}>SIMULATION ENV</div>

                    {/* Actors */}
                    <div style={{ width: '80%', height: '2px', background: '#333', position: 'absolute' }}></div>
                    <div style={{ position: 'absolute', left: '10%', background: '#111', padding: '10px', borderRadius: '8px', border: '1px solid #10b981' }}>Alice</div>
                    <div style={{ position: 'absolute', right: '10%', background: '#111', padding: '10px', borderRadius: '8px', border: '1px solid #10b981' }}>Bob</div>

                    {eveActive && (
                        <div className="animate-fade-in" style={{
                            position: 'absolute', left: '50%', transform: 'translateX(-50%)',
                            background: '#111', padding: '10px', borderRadius: '8px', border: '1px solid #ef4444',
                            zIndex: 10
                        }}>
                            <div style={{ textAlign: 'center', fontSize: '1.5rem' }}>🕵️‍♀️</div>
                            <div style={{ fontSize: '0.8rem', color: '#ef4444' }}>MAN-IN-THE-MIDDLE</div>
                        </div>
                    )}

                    {/* Particle */}
                    {status === 'RUNNING' && (
                        <div style={{
                            width: '12px', height: '12px', borderRadius: '50%', background: '#fff',
                            boxShadow: '0 0 10px white', position: 'absolute', left: '15%',
                            animation: 'travel 2.6s linear forwards'
                        }}></div>
                    )}

                    <style>{`
                        @keyframes travel {
                            0% { left: 15%; opacity: 1; }
                            45% { opacity: 1; } 
                            50% { opacity: ${eveActive ? 0.3 : 1}; } /* Dim if intercepted */
                            55% { opacity: ${eveActive ? 0 : 1}; } /* Disappear if intercepted/continue */
                            100% { left: 85%; opacity: ${eveActive ? 0 : 1}; }
                        }
                     `}</style>
                </div>

                {/* Logs & Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>

                    {/* Console */}
                    <div style={{
                        background: '#0f1014', borderRadius: '8px', padding: '15px',
                        fontFamily: 'monospace', fontSize: '0.9rem', color: '#00ff88', height: '120px'
                    }}>
                        {logs.map((l, i) => <div key={i} style={{ marginBottom: '4px' }}>{l}</div>)}
                    </div>

                    {/* Stats */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div className="glass" style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.8rem', color: '#999' }}>QBER (Error Rate)</div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: qber > 0.1 ? '#ef4444' : '#10b981' }}>
                                {(qber * 100).toFixed(1)}%
                            </div>
                        </div>
                        <div className="glass" style={{ flex: 1, padding: '10px', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.8rem', color: '#999' }}>STATUS</div>
                            <div style={{ fontWeight: 'bold', color: status === 'INTERCEPTED' ? '#ef4444' : (status === 'SAFE' ? '#10b981' : '#ccc') }}>
                                {status}
                            </div>
                        </div>
                    </div>

                </div>

                <button
                    className="btn btn-primary"
                    style={{ width: '100%', marginTop: '30px', padding: '15px' }}
                    onClick={runEducationalSim}
                    disabled={status === 'RUNNING'}
                >
                    {status === 'RUNNING' ? 'Running Simulation...' : 'Start Simulation'}
                </button>

            </div>
        </div>
    );
};

export default DemoMode;

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../api';

const QKDStatusPanel = ({ onClose, onKeyEstablished }) => {
    const [status, setStatus] = useState('INIT'); // INIT, PREPARING, TRANSMITTING, SIFTING, COMPLETED, FAILED
    const [metrics, setMetrics] = useState(null);
    const [logs, setLogs] = useState([]);

    // Safety timeout to ensure close button becomes active eventually
    useEffect(() => {
        const timer = setTimeout(() => {
            if (status !== 'COMPLETED' && status !== 'FAILED') {
                // Force enable close if stuck
            }
        }, 10000); // 10s timeout
        return () => clearTimeout(timer);
    }, [status]);

    const addLog = (msg) => setLogs(prev => [...prev, `> ${msg}`]);

    useEffect(() => {
        startSimulation();
    }, []);

    const startSimulation = async () => {
        try {
            setStatus('PREPARING');
            addLog("Alice: Initializing QRNG for State Preparation...");
            await new Promise(r => setTimeout(r, 800));

            setStatus('TRANSMITTING');
            addLog("Channel: Transmitting Photons (Quantum Channel - Simulated)...");
            await new Promise(r => setTimeout(r, 1200));

            setStatus('SIFTING');
            addLog("Bob: Measuring States...");
            addLog("Public Channel: Basis Reconciliation (Sifting)...");
            await new Promise(r => setTimeout(r, 1000));

            // Call Backend
            addLog("System: Calculating QBER & Privacy Amplification...");
            const res = await axios.get(`${API_URL}/qkd/establish_key?key_length=256&eve=false`);

            if (res.data.success) {
                setMetrics(res.data);
                setStatus('COMPLETED');
                addLog(`SUCCESS: Shared Key Established! (${res.data.final_key_length} bits)`);
                addLog(`QBER: ${res.data.qber} (Safe)`);
                if (onKeyEstablished) onKeyEstablished(res.data.key_hex);
            } else {
                setStatus('FAILED');
                addLog(`ABORT: ${res.data.msg}`);
            }

        } catch (e) {
            console.error(e);
            setStatus('FAILED');
            addLog("ERROR: Connection Failed.");
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
            <div className="glass-panel" style={{ width: '600px', padding: '30px', border: '1px solid #333' }}>

                {/* Header */}
                <div className="flex-row justify-between" style={{ marginBottom: '20px' }}>
                    <div className="flex-col">
                        <h2 style={{ margin: 0 }}>Quantum Key Distribution</h2>
                        <span style={{ fontSize: '0.9rem', color: '#10b981' }}>Protocol: BB84 (Simulated)</span>
                    </div>
                    {status === 'COMPLETED' ? (
                        <div style={{ padding: '5px 15px', background: '#10b981', color: 'black', fontWeight: 'bold', borderRadius: '4px' }}>SECURE</div>
                    ) : (
                        <div style={{ padding: '5px 15px', background: '#f59e0b', color: 'black', fontWeight: 'bold', borderRadius: '4px' }}>NEGOTIATING</div>
                    )}
                </div>

                {/* Animation / Viz */}
                <div style={{ height: '150px', background: '#000', borderRadius: '8px', marginBottom: '20px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'absolute', top: '5px', left: '5px', fontSize: '0.7rem', color: '#444' }}>VISUALIZATION ONLY - HARDWARE NOT IMPLEMENTED</div>

                    {/* Alice */}
                    <div style={{ position: 'absolute', left: '20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem' }}>👩‍💻</div>
                        <div style={{ fontSize: '0.8rem', color: '#ccc' }}>Alice</div>
                    </div>

                    {/* Bob */}
                    <div style={{ position: 'absolute', right: '20px', textAlign: 'center' }}>
                        <div style={{ fontSize: '2rem' }}>👨‍💻</div>
                        <div style={{ fontSize: '0.8rem', color: '#ccc' }}>Bob</div>
                    </div>

                    {/* Stream */}
                    {(status === 'TRANSMITTING' || status === 'SIFTING') && (
                        <div className="flex-row gap-2" style={{ animation: 'pulse 1s infinite' }}>
                            {Array(5).fill(0).map((_, i) => (
                                <div key={i} style={{
                                    width: '10px', height: '10px', borderRadius: '50%', background: i % 2 === 0 ? '#7c3aed' : '#10b981',
                                    boxShadow: '0 0 10px currentColor'
                                }}></div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Logs */}
                <div style={{
                    height: '150px', overflowY: 'auto', background: '#0f1014', border: '1px solid #2d2e36', borderRadius: '8px', padding: '15px',
                    fontFamily: '"Fira Code", monospace', fontSize: '0.85rem', color: '#00ff88', marginBottom: '20px'
                }}>
                    {logs.map((l, i) => <div key={i}>{l}</div>)}
                </div>

                {/* Stats Grid */}
                {metrics && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                        <div className="glass" style={{ padding: '10px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.75rem', color: '#999' }}>RAW BITS</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{metrics.raw_bit_count}</div>
                        </div>
                        <div className="glass" style={{ padding: '10px', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.75rem', color: '#999' }}>SIFTED BITS</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{metrics.sifted_bit_count}</div>
                        </div>
                        <div className="glass" style={{ padding: '10px', textAlign: 'center', border: '1px solid #10b981' }}>
                            <div style={{ fontSize: '0.75rem', color: '#10b981' }}>QBER</div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#10b981' }}>{metrics.qber}</div>
                        </div>
                    </div>
                )}

                <div className="flex-row justify-end gap-2">
                    {/* Always allow closing to prevent getting stuck */}
                    <button className="btn btn-ghost" onClick={onClose} style={{ zIndex: 10000 }}>
                        {status === 'COMPLETED' || status === 'FAILED' ? 'Close' : 'Cancel'}
                    </button>

                    {status === 'COMPLETED' && <button className="btn btn-primary" onClick={onClose}>Accept Key</button>}
                </div>

            </div>
        </div>
    );
};

export default QKDStatusPanel;

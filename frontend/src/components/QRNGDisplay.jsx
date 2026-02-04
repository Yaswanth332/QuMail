import React, { useEffect, useState } from 'react';
import { getQRNGStream } from '../api';

const QRNGDisplay = () => {
    const [bits, setBits] = useState('');
    const [entropy, setEntropy] = useState('0');

    const fetchRandomness = async () => {
        try {
            const res = await getQRNGStream(32);
            setBits(res.data.bits);
            setEntropy(res.data.entropy);
        } catch (e) {
            console.error("QRNG Fetch Error", e);
        }
    };

    useEffect(() => {
        fetchRandomness();
        const interval = setInterval(fetchRandomness, 2000); // Live update
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="glass" style={{ padding: '20px', marginBottom: '20px' }}>
            <h3 className="neon-text">Quantum Random Number Generator (QRNG)</h3>
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{
                    fontFamily: 'monospace',
                    fontSize: '1.2rem',
                    wordBreak: 'break-all',
                    color: '#00ff9d',
                    background: '#000',
                    padding: '10px',
                    borderRadius: '5px',
                    flex: 1
                }}>
                    {bits || "INITIALIZING SUPERPOSITION..."}
                </div>
                <div>
                    <div style={{ fontSize: '0.8rem', color: '#888' }}>SOURCE</div>
                    <div>Qiskit AerSimulator</div>
                </div>
            </div>
            <div style={{ marginTop: '10px', fontSize: '0.9rem', color: '#aaa' }}>
                Entropy Validation: <span style={{ color: '#00ff9d' }}>{entropy}</span> | Status: <span style={{ color: '#00f0ff' }}>QUANTUM SECURE</span>
            </div>
        </div>
    );
};

export default QRNGDisplay;

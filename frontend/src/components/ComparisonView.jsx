import React, { useState, useEffect } from 'react';
import axios from 'axios';
import InlineCanvas from './InlineCanvas'; // Import the new component

const EntropyMeter = ({ value, label, color, chiSquare }) => {
    const percentage = Math.min(Math.max(value * 100, 0), 100); // 0 to 100

    return (
        <div style={{ margin: '20px 0', textAlign: 'center' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '5px' }}>{label}</div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: color }}>
                {value.toFixed(4)}
            </div>
            <div style={{
                height: '8px',
                width: '100%',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '4px',
                marginTop: '10px',
                overflow: 'hidden'
            }}>
                <div style={{
                    height: '100%',
                    width: `${percentage}%`,
                    background: color,
                    transition: 'width 1s ease-out',
                    boxShadow: `0 0 10px ${color}`
                }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px', textAlign: 'right' }}>
                Ideal: 1.0000
            </div>

            <div style={{ marginTop: '20px', borderTop: '1px solid var(--glass-border)', paddingTop: '15px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Chi-Square Test (Uniformity)</div>
                <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', color: color, marginTop: '5px' }}>
                    {chiSquare ? chiSquare.toFixed(2) : '0.00'}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Target: Lower is better</div>
            </div>
        </div>
    );
};

const ComparisonView = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            // Request more bits for heatmap! 4096 = 64x64 grid
            const res = await axios.get('http://localhost:8000/api/comparison/live?bits=4096', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setData(res.data);
        } catch (error) {
            console.error("Error fetching comparison data", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
        // Polling every 5 seconds
        const interval = setInterval(fetchData, 8000); // Slower poll for large data
        return () => clearInterval(interval);
    }, []);

    if (!data && loading) return <div style={{ color: 'white', padding: '40px', textAlign: 'center' }}>Initializing Quantum Circuits...</div>;
    if (!data) return <div style={{ color: 'var(--text-muted)', padding: '40px', textAlign: 'center' }}>Waiting for data stream...</div>;

    return (
        <div style={{ padding: '40px', color: 'white', height: '100%', overflowY: 'auto' }} className="animate-fade-in">
            <div style={{ marginBottom: '40px', textAlign: 'center' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Why Quantum Randomness Matters</h1>
                <p className="text-muted">Statistical Evidence: Classical (Math) vs. Quantum (Physics)</p>
            </div>

            <div style={{ display: 'flex', gap: '40px', justifyContent: 'center', flexWrap: 'wrap' }}>

                {/* CLASSICAL CARD */}
                <div className="glass" style={{
                    flex: '1 1 400px',
                    padding: '30px',
                    borderRadius: '16px',
                    border: '1px solid rgba(255, 68, 68, 0.2)'
                }}>
                    <h2 style={{ borderBottom: '1px solid rgba(255, 68, 68, 0.2)', paddingBottom: '15px', marginBottom: '20px', color: '#ff6666' }}>
                        🔴 Classical (PRNG)
                    </h2>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                        Generated via <code>Mersenne Twister</code> (Algorithm).
                    </p>

                    <EntropyMeter
                        value={data.prng.entropy}
                        chiSquare={data.prng.chi_square}
                        label="Shannon Entropy"
                        color="#ff6666"
                    />

                    {/* Interpretation */}
                    <div style={{ margin: '20px 0', padding: '15px', background: 'rgba(255, 68, 68, 0.05)', borderRadius: '8px', fontSize: '0.85rem', lineHeight: '1.6' }}>
                        <div style={{ color: '#ccc' }}>✔ High statistical entropy</div>
                        <div style={{ color: '#ff6666' }}>✖ Deterministic seed</div>
                        <div style={{ color: '#ff6666' }}>✖ Predictable if compromised</div>
                    </div>

                    <div style={{ marginTop: '30px', textAlign: 'center' }}>
                        <div style={{ marginBottom: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bitstream Heatmap (4096 bits)</div>
                        {/* Heatmap Here */}
                        <InlineCanvas bitString={data.prng.bits} color="#ff4444" width={256} height={256} />
                    </div>
                </div>

                {/* QUANTUM CARD */}
                <div className="glass-panel" style={{
                    flex: '1 1 400px',
                    padding: '30px',
                    background: 'linear-gradient(145deg, rgba(0, 255, 136, 0.05) 0%, rgba(0,0,0,0) 100%)',
                    border: '1px solid rgba(0, 255, 136, 0.3)',
                    boxShadow: '0 0 30px rgba(0, 255, 136, 0.1)'
                }}>
                    <h2 style={{ borderBottom: '1px solid rgba(0, 255, 136, 0.3)', paddingBottom: '15px', marginBottom: '20px', color: '#00ff88', textShadow: '0 0 10px rgba(0,255,136,0.3)' }}>
                        🟢 Quantum (QRNG)
                    </h2>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
                        Generated via <code>IBM Qiskit</code> (Superposition Collapse).
                    </p>

                    <EntropyMeter
                        value={data.qrng.entropy}
                        chiSquare={data.qrng.chi_square}
                        label="Shannon Entropy"
                        color="#00ff88"
                    />

                    {/* Interpretation */}
                    <div style={{ margin: '20px 0', padding: '15px', background: 'rgba(0, 255, 136, 0.05)', borderRadius: '8px', fontSize: '0.85rem', lineHeight: '1.6', border: '1px solid rgba(0, 255, 136, 0.1)' }}>
                        <div style={{ color: '#ccc' }}>✔ High statistical entropy</div>
                        <div style={{ color: '#00ff88' }}>✔ Non-deterministic</div>
                        <div style={{ color: '#00ff88' }}>✔ Physics-based randomness</div>
                    </div>

                    <div style={{ marginTop: '30px', textAlign: 'center' }}>
                        <div style={{ marginBottom: '10px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>Bitstream Heatmap (4096 bits)</div>
                        {/* Heatmap Here */}
                        <InlineCanvas bitString={data.qrng.bits} color="#00ff88" width={256} height={256} />
                    </div>
                </div>

            </div>


            <div style={{ textAlign: 'center', marginTop: '40px' }}>
                <button
                    onClick={fetchData}
                    className="btn btn-primary"
                    style={{ padding: '12px 40px', borderRadius: '30px' }}
                >
                    {loading ? 'Running Physics Experiment...' : 'Regenerate Quantum Samples ⟳'}
                </button>
            </div>
        </div>
    );
};


export default ComparisonView;

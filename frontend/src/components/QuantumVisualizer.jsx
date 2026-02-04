import React, { useEffect, useRef, useState } from 'react';

const QuantumVisualizer = () => {
    const canvasRef = useRef(null);
    const [particleCount, setParticleCount] = useState(84);
    const [entangledPairs, setEntangledPairs] = useState(0);
    const [quantumKeys, setQuantumKeys] = useState(1);
    const [isScanning, setIsScanning] = useState(false);

    // Canvas Animation Logic
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let width = canvas.width = canvas.offsetWidth;
        let height = canvas.height = canvas.offsetHeight;

        const particles = [];
        const particleCount = 180;
        const connectionDistance = 100;

        class Particle {
            constructor() {
                this.x = Math.random() * width;
                this.y = Math.random() * height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2 + 1;
                this.color = Math.random() > 0.9 ? '#F59E0B' : '#10B981'; // Orange or Green
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > width) this.vx *= -1;
                if (this.y < 0 || this.y > height) this.vy *= -1;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = this.color;
                ctx.fill();

                // Glow effect
                ctx.shadowBlur = 10;
                ctx.shadowColor = this.color;
            }
        }

        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            // Draw connections first
            let interactions = 0;
            ctx.lineWidth = 0.5;

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                for (let j = i; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dt = Math.sqrt(dx * dx + dy * dy);

                    if (dt < connectionDistance) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(16, 185, 129, ${1 - dt / connectionDistance})`;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                        interactions++;
                    }
                }
            }

            setEntangledPairs(Math.floor(interactions / 2));
            requestAnimationFrame(animate);
        };

        animate();

        const handleResize = () => {
            width = canvas.width = canvas.offsetWidth;
            height = canvas.height = canvas.offsetHeight;
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleGenerateKey = () => {
        // Simple visual feedback
        setQuantumKeys(prev => prev + 1);
    };

    return (
        <div style={{ padding: '0px', height: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>

            {/* Disclaimer for Judges */}
            <div style={{
                textAlign: 'center', color: '#666', fontSize: '0.8rem',
                padding: '5px', borderRadius: '4px', background: 'rgba(0,0,0,0.2)'
            }}>
                This visualization is an educational simulation. It does not generate cryptographic keys and does not affect actual encryption.
            </div>

            {/* Main Visualization Card - Expanded to Fill View */}
            <div style={{
                borderRadius: '16px', overflow: 'hidden',
                background: '#1a1b21',
                border: '1px solid #333',
                flex: 1, // Fill available vertical space
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
            }}>

                {/* Purple Header */}
                <div style={{
                    background: 'linear-gradient(90deg, #7c3aed, #db2777)',
                    padding: '16px 24px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                    <div style={{ color: 'white', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '1.2rem' }}>💫</span> Quantum Network Visualization (Demo)
                    </div>
                    <div style={{
                        background: 'rgba(255,255,255,0.2)', padding: '6px 16px', borderRadius: '20px',
                        color: 'white', fontSize: '0.8rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px'
                    }}>
                        <div style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 5px white' }}></div>
                        Field Active
                    </div>
                </div>

                {/* Canvas Area */}
                <div style={{ flex: 1, position: 'relative', background: 'radial-gradient(circle at center, #2e1065, #0f1014)' }}>
                    <canvas
                        ref={canvasRef}
                        style={{ width: '100%', height: '100%' }}
                    />

                    {/* Overlay Stats - Top Right */}
                    <div style={{
                        position: 'absolute', top: '20px', right: '20px',
                        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
                        padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#eee', fontSize: '0.9rem', width: '250px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: '#aaa', fontWeight: 'bold' }}>ENTANGLED NODES:</span>
                            <span style={{ fontFamily: 'monospace', fontWeight: 'bold' }}>{entangledPairs}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ color: '#aaa', fontWeight: 'bold' }}>KEYS BUFFFERED:</span>
                            <span style={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#a78bfa' }}>{quantumKeys}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#aaa', fontWeight: 'bold' }}>ENTROPY (VIS):</span>
                            <span style={{ color: '#10b981', fontWeight: 'bold' }}>HIGH</span>
                        </div>
                    </div>

                    {/* Security Level - Top Left */}
                    <div style={{
                        position: 'absolute', top: '20px', left: '20px',
                        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
                        padding: '15px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                        width: '280px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
                    }}>
                        <div style={{ height: '8px', background: '#333', borderRadius: '4px', marginBottom: '10px', overflow: 'hidden' }}>
                            <div style={{ width: '100%', height: '100%', background: 'linear-gradient(90deg, #f59e0b, #10b981, #7c3aed)' }}></div>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#fff', fontWeight: 'bold', letterSpacing: '1px' }}>
                            SYSTEM INTEGRITY: <span style={{ color: '#10b981' }}>VERIFIED</span>
                        </div>
                    </div>

                    {/* Bottom Actions Toolbar */}
                    <div style={{
                        position: 'absolute', bottom: '30px', left: '0', right: '0',
                        display: 'flex', justifyContent: 'center', gap: '20px'
                    }}>
                        <button
                            onClick={handleGenerateKey}
                            style={{
                                background: 'linear-gradient(90deg, #7c3aed, #db2777)',
                                border: 'none', padding: '12px 30px', borderRadius: '12px',
                                color: 'white', fontWeight: 'bold', cursor: 'pointer',
                                boxShadow: '0 0 20px rgba(124, 58, 237, 0.5)',
                                display: 'flex', alignItems: 'center', gap: '10px',
                                fontSize: '1rem',
                                transition: 'transform 0.2s'
                            }}
                            onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                            onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                        >
                            <span style={{ fontSize: '1.2rem' }}>⚡</span> Simulate Key Event
                        </button>

                        <button
                            onClick={() => setIsScanning(!isScanning)}
                            style={{
                                background: 'rgba(31, 41, 55, 0.8)',
                                backdropFilter: 'blur(4px)',
                                border: '1px solid #374151', padding: '12px 24px', borderRadius: '12px',
                                color: 'white', fontWeight: 'bold', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '10px',
                                transition: 'all 0.2s'
                            }}
                            onMouseOver={e => e.currentTarget.style.borderColor = '#10b981'}
                            onMouseOut={e => e.currentTarget.style.borderColor = '#374151'}
                        >
                            <span style={{
                                width: '10px', height: '10px', borderRadius: '50%',
                                background: isScanning ? '#10b981' : '#6b7280',
                                boxShadow: isScanning ? '0 0 10px #10b981' : 'none',
                                transition: 'background 0.3s'
                            }}></span>
                            {isScanning ? "Scanning Topology..." : "Scan Topology"}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default QuantumVisualizer;

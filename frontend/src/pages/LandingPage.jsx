import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div style={{ minHeight: '100vh', background: '#0f1014', color: 'white', fontFamily: 'Inter, sans-serif' }}>

            {/* Navbar */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 40px', borderBottom: '1px solid #1a1b21' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                        width: '40px', height: '40px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
                        boxShadow: '0 0 15px rgba(124, 58, 237, 0.5)'
                    }}>🛡️</div>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>QuMail</span>
                </div>
                <div>
                    <button
                        onClick={() => navigate('/login')}
                        className="btn"
                        style={{ background: 'transparent', border: 'none', color: '#ccc', marginRight: '20px', cursor: 'pointer' }}
                    >
                        Sign In
                    </button>
                    <button
                        onClick={() => navigate('/login')}
                        className="btn btn-primary"
                        style={{ padding: '10px 24px', borderRadius: '20px' }}
                    >
                        Get Started
                    </button>
                </div>
            </div>

            {/* Hero Section */}
            <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                textAlign: 'center', padding: '80px 20px', position: 'relative', overflow: 'hidden'
            }}>
                {/* Background Glow */}
                <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: '600px', height: '600px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)',
                    filter: 'blur(100px)', zIndex: 0
                }}></div>

                <div style={{ position: 'relative', zIndex: 1, maxWidth: '800px' }}>
                    <div style={{
                        color: '#10b981', fontWeight: 'bold', letterSpacing: '2px', fontSize: '0.9rem', marginBottom: '20px',
                        background: 'rgba(16, 185, 129, 0.1)', display: 'inline-block', padding: '6px 16px', borderRadius: '20px'
                    }}>
                        QUANTUM-READY SECURITY
                    </div>
                    <h1 style={{ fontSize: '4rem', fontWeight: '800', lineHeight: '1.1', marginBottom: '30px' }}>
                        The Future of Secure <br />
                        <span style={{ background: 'linear-gradient(90deg, #fff, #aaa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Communication</span>
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: '#9ca3af', marginBottom: '40px', lineHeight: '1.6' }}>
                        Experience true privacy with OTP information-theoretic security and simulated Quantum Key Distribution.
                        Your data, protected by the laws of physics.
                    </p>
                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                        <button
                            onClick={() => navigate('/login')}
                            className="btn btn-primary"
                            style={{ padding: '16px 40px', fontSize: '1.1rem', borderRadius: '30px', boxShadow: '0 10px 30px rgba(124, 58, 237, 0.3)' }}
                        >
                            Create Secure Account
                        </button>
                        <button
                            style={{
                                padding: '16px 40px', fontSize: '1.1rem', borderRadius: '30px',
                                background: '#1a1b21', border: '1px solid #333', color: 'white', cursor: 'pointer'
                            }}
                        >
                            Learn Architecture
                        </button>
                    </div>
                </div>
            </div>

            {/* Features Grid */}
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '60px 20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px' }}>
                <FeatureCard
                    icon="🔒"
                    title="Information-Theoretic Security"
                    desc="Utilizing One-Time Pads (OTP) where the key length equals the message length for unbreakable encryption."
                />
                <FeatureCard
                    icon="⚛️"
                    title="Simulated QKD"
                    desc="Demonstrating Quantum Key Distribution protocols (BB84) to securely exchange keys without interception."
                />
                <FeatureCard
                    icon="🛡️"
                    title="Blind Server"
                    desc="Zero-Knowledge architecture. The server never sees your keys or your plaintext messages."
                />
            </div>

            {/* Footer */}
            <div style={{ borderTop: '1px solid #1a1b21', padding: '40px', textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
                &copy; 2026 QuMail Project. Built for Advanced Agentic Coding. <br />
                <span style={{ color: '#444' }}>Simulated Environment for Educational Purposes.</span>
            </div>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <div style={{
        background: '#131419', padding: '30px', borderRadius: '20px', border: '1px solid #2d2e36',
        transition: 'transform 0.2s', cursor: 'default'
    }} className="hover:border-primary">
        <div style={{ fontSize: '2.5rem', marginBottom: '20px' }}>{icon}</div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px' }}>{title}</h3>
        <p style={{ color: '#9ca3af', lineHeight: '1.5' }}>{desc}</p>
    </div>
);

export default LandingPage;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { login, register, googleLogin } from '../api';

const Login = () => {
    const [isRegister, setIsRegister] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Google Login Hook
    const performGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            try {
                // Send Access Token to Backend for Verification
                const res = await googleLogin(tokenResponse.access_token);
                if (res.data.access_token) {
                    localStorage.setItem('token', res.data.access_token);
                    if (res.data.user_email) {
                        localStorage.setItem('user_email', res.data.user_email);
                    }
                    navigate('/dashboard');
                }
            } catch (err) {
                console.error("Google Auth Error:", err);
                const msg = err.response?.data?.detail || "Google Login failed.";
                setError(msg);
            } finally {
                setLoading(false);
            }
        },
        onError: (errorResponse) => {
            console.error(errorResponse);
            setError("Google Popup Closed or Failed.");
        }
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isRegister) {
                await register(email, password);
                alert("Registration successful! Please login.");
                setIsRegister(false);
            } else {
                await login(email, password);
                navigate('/dashboard');
            }
        } catch (err) {
            setError("Authentication failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container" style={{ background: '#0f1014' }}>
            {/* Ambient Effects */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden', pointerEvents: 'none' }}>
                <div style={{
                    position: 'absolute', top: '-10%', left: '-10%', width: '50%', height: '50%',
                    background: 'radial-gradient(circle, rgba(124, 58, 237, 0.2) 0%, transparent 70%)', filter: 'blur(80px)'
                }}></div>
                <div style={{
                    position: 'absolute', bottom: '-10%', right: '-10%', width: '50%', height: '50%',
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%)', filter: 'blur(100px)'
                }}></div>
            </div>

            <div style={{
                position: 'relative', zIndex: 10, display: 'flex', gap: '0',
                background: '#1a1b21', borderRadius: '24px', overflow: 'hidden',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)', maxWidth: '900px', width: '90%', margin: 'auto', border: '1px solid #2d2e36'
            }} className="animate-fade-in">

                {/* Left Side: Visuals */}
                <div style={{
                    flex: '1', background: 'linear-gradient(135deg, #1f1235, #000000)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '40px',
                    position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <div style={{
                            width: '60px', height: '60px', borderRadius: '16px',
                            background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '20px',
                            boxShadow: '0 0 30px rgba(124, 58, 237, 0.5)'
                        }}>🛡️</div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'white', marginBottom: '15px' }}>QuMail</h1>
                        <p style={{ color: '#aaa', lineHeight: '1.6', fontSize: '1.1rem' }}>
                            The world's first <span style={{ color: '#10b981', fontWeight: 'bold' }}>QKD-Ready</span> secure email platform.
                            Protect your communications with the laws of physics.
                        </p>
                        <div style={{ marginTop: '40px', display: 'flex', gap: '20px' }}>
                            <div className="flex-row gap-2" style={{ color: '#fff', fontSize: '0.9rem' }}>
                                <span style={{ color: '#10b981' }}>✓</span> Simulated QKD
                            </div>
                            <div className="flex-row gap-2" style={{ color: '#fff', fontSize: '0.9rem' }}>
                                <span style={{ color: '#10b981' }}>✓</span> Zero Trust
                            </div>
                            <div className="flex-row gap-2" style={{ color: '#fff', fontSize: '0.9rem' }}>
                                <span style={{ color: '#10b981' }}>✓</span> RAM Only
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div style={{ flex: '1', padding: '50px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#131419' }}>
                    <div style={{ marginBottom: '30px' }}>
                        <h2 style={{ fontSize: '1.8rem', color: 'white', fontWeight: 'bold', marginBottom: '10px' }}>
                            {isRegister ? "Create Account" : "Welcome Back"}
                        </h2>
                        <p style={{ color: '#6b7280' }}>
                            {isRegister ? "Start your secure journey today." : "Enter your credentials to access the vault."}
                        </p>
                    </div>

                    {error && (
                        <div style={{
                            background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444',
                            color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex-col gap-4">
                        <div className="flex-col gap-2">
                            <label style={{ fontSize: '0.9rem', color: '#9ca3af', fontWeight: '600' }}>Email Address</label>
                            <input
                                type="email"
                                value={email} onChange={e => setEmail(e.target.value)}
                                style={{ background: '#1a1b21', border: '1px solid #2d2e36', color: 'white' }}
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        <div className="flex-col gap-2">
                            <label style={{ fontSize: '0.9rem', color: '#9ca3af', fontWeight: '600' }}>Password</label>
                            <input
                                type="password"
                                value={password} onChange={e => setPassword(e.target.value)}
                                style={{ background: '#1a1b21', border: '1px solid #2d2e36', color: 'white' }}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary w-full"
                            style={{ marginTop: '10px', padding: '14px', fontSize: '1rem' }}
                            disabled={loading}
                        >
                            {loading ? "Processing..." : (isRegister ? "Create Account" : "Sign In")}
                        </button>
                    </form>

                    {/* Google Auth Divider */}
                    <div style={{ display: 'flex', alignItems: 'center', margin: '30px 0', gap: '10px' }}>
                        <div style={{ height: '1px', flex: 1, background: '#2d2e36' }}></div>
                        <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>OR</span>
                        <div style={{ height: '1px', flex: 1, background: '#2d2e36' }}></div>
                    </div>

                    <button
                        className="btn"
                        style={{
                            background: '#1a1b21', border: '1px solid #2d2e36', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', padding: '14px'
                        }}
                        onClick={() => performGoogleLogin()}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M23.745 12.27c0-.79-.07-1.54-.19-2.27h-11.3v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z" />
                            <path fill="#34A853" d="M12.255 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96h-3.98v3.09C3.515 21.3 7.565 24 12.255 24z" />
                            <path fill="#FBBC05" d="M5.525 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62h-3.98a11.86 11.86 0 000 10.76l3.98-3.09z" />
                            <path fill="#EA4335" d="M12.255 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C18.205 1.19 15.495 0 12.255 0 7.565 0 3.515 2.7 1.545 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z" />
                        </svg>
                        Sign in with Google
                    </button>

                    {/* Toggle */}
                    <div style={{ marginTop: '30px', textAlign: 'center', fontSize: '0.9rem', color: '#9ca3af' }}>
                        {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
                        <span
                            style={{ color: 'var(--primary)', fontWeight: 'bold', cursor: 'pointer' }}
                            onClick={() => { setError(''); setIsRegister(!isRegister); }}
                        >
                            {isRegister ? "Log In" : "Sign Up"}
                        </span>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Login;

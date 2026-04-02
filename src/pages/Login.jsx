import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!form.email || !form.password) { setError('Please fill in all fields.'); return; }
        setLoading(true);
        setTimeout(() => {
            const res = login(form.email, form.password);
            setLoading(false);
            if (res.ok) navigate('/dashboard');
            else setError(res.error);
        }, 400);
    };

    const handleDemo = () => {
        setForm({ email: 'demo@inventory.com', password: 'demo1234' });
        setError('');
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <div className="logo-icon">📦</div>
                    <h1>Welcome back</h1>
                    <p>Sign in to InventoPro</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger">⚠️ {error}</div>}

                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input
                            id="login-email"
                            name="email" type="email" className="form-input"
                            placeholder="you@example.com"
                            value={form.email} onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            id="login-password"
                            name="password" type="password" className="form-input"
                            placeholder="••••••••"
                            value={form.password} onChange={handleChange}
                        />
                    </div>

                    <button id="login-submit" type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
                        {loading ? '⏳ Signing in…' : '🔐 Sign In'}
                    </button>

                    <div className="auth-divider"><span>OR</span></div>

                    <button id="demo-login" type="button" className="btn btn-secondary w-full" onClick={handleDemo}>
                        🎮 Use Demo Account
                    </button>
                </form>

                <div className="auth-link" style={{ marginTop: 20 }}>
                    Don't have an account? <Link to="/signup">Sign up</Link>
                </div>

                <div style={{ marginTop: 20, padding: 12, borderRadius: 8, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                    <p style={{ fontSize: 11.5, color: 'var(--text-muted)', textAlign: 'center' }}>
                        🔑 Demo: <strong style={{ color: 'var(--text-secondary)' }}>demo@inventory.com</strong> / <strong style={{ color: 'var(--text-secondary)' }}>demo1234</strong>
                    </p>
                </div>
            </div>
        </div>
    );
}

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
    const { signup } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        if (!form.name || !form.email || !form.password) { setError('Please fill in all fields.'); return; }
        if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
        if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
        setLoading(true);
        setTimeout(() => {
            const res = signup(form.name, form.email, form.password);
            setLoading(false);
            if (res.ok) navigate('/dashboard');
            else setError(res.error);
        }, 400);
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <div className="logo-icon">📦</div>
                    <h1>Create Account</h1>
                    <p>Join InventoPro today</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    {error && <div className="alert alert-danger">⚠️ {error}</div>}

                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input id="signup-name" name="name" type="text" className="form-input"
                            placeholder="John Doe" value={form.name} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <input id="signup-email" name="email" type="email" className="form-input"
                            placeholder="you@example.com" value={form.email} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input id="signup-password" name="password" type="password" className="form-input"
                            placeholder="Min. 6 characters" value={form.password} onChange={handleChange} />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Confirm Password</label>
                        <input id="signup-confirm" name="confirm" type="password" className="form-input"
                            placeholder="Repeat password" value={form.confirm} onChange={handleChange} />
                    </div>

                    <button id="signup-submit" type="submit" className="btn btn-primary w-full btn-lg" disabled={loading}>
                        {loading ? '⏳ Creating…' : '🚀 Create Account'}
                    </button>
                </form>

                <div className="auth-link" style={{ marginTop: 20 }}>
                    Already have an account? <Link to="/login">Sign in</Link>
                </div>
            </div>
        </div>
    );
}

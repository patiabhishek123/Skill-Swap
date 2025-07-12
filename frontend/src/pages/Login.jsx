import React, { useState } from 'react';
import axios from 'axios';

export const Login = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/login', form);
            alert('Login successful!');
            console.log(res.data); // Optional: Save token or redirect
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="home-wrapper">
            <div className="navbar">
                <div className="logo-head">Skill Swap Platform</div>
            </div>
            <div className="login-form-wrapper">
                <form
                    onSubmit={handleSubmit}
                    className="login-form-box"
                >
                    <h2 className="login-form-heading">Welcome !</h2>
                    {error && <p className="error-text">{error}</p>}
                    <div className="login-input-group">
                        <label htmlFor="email" className="login-input-label">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="login-input-field"
                        />
                    </div>
                    <div className="login-input-group">
                        <label htmlFor="password" className="login-input-label">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            className="login-input-field"
                        />
                    </div>
                    <button
                        type="submit"
                        className="login"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

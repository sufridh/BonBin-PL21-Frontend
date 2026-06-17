import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      login(res.data.token, res.data.user);
      navigate('/picks');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div
        className="absolute inset-0 bg-no-repeat bg-cover pointer-events-none"
        style={{ backgroundImage: "url('/background.png')", backgroundPosition: '70% center', opacity: 0.08 }}
        aria-hidden="true"
      />
      <div className="w-full max-w-sm relative z-10">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">⚽</div>
          <h1 className="font-display text-4xl text-gold-400 tracking-wider">BONBIN PL</h1>
          <p className="text-maroon-300 text-sm mt-1">PICK'EM — WORLD CUP 2026</p>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4 text-cream-100">Masuk</h2>
          {error && <div className="bg-maroon-700/60 border border-maroon-500 text-gold-200 rounded-lg p-3 mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-maroon-300 mb-1">Username</label>
              <input
                className="input"
                type="text"
                placeholder="username"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-maroon-300 mb-1">Password</label>
              <input
                className="input"
                type="password"
                placeholder="••••••"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
              />
            </div>
            <button className="btn-primary w-full" type="submit" disabled={loading}>
              {loading ? 'Masuk...' : 'Masuk'}
            </button>
          </form>
          <p className="text-center text-maroon-300 text-sm mt-4">
            Belum punya akun?{' '}
            <Link to="/register" className="text-gold-400 hover:underline">Daftar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

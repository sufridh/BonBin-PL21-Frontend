import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import api from '../utils/api';

export default function Register() {
  const [form, setForm] = useState({ username: '', display_name: '', password: '', invite_code: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      login(res.data.token, res.data.user);
      navigate('/picks');
    } catch (err) {
      setError(err.response?.data?.error || 'Registrasi gagal');
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
          <h2 className="text-xl font-bold mb-4 text-cream-100">Daftar Akun</h2>
          {error && <div className="bg-maroon-700/60 border border-maroon-500 text-gold-200 rounded-lg p-3 mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-maroon-300 mb-1">Nama Tampil</label>
              <input
                className="input"
                type="text"
                placeholder="Nama lo di leaderboard"
                value={form.display_name}
                onChange={e => setForm(f => ({ ...f, display_name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm text-maroon-300 mb-1">Username</label>
              <input
                className="input"
                type="text"
                placeholder="huruf kecil, tanpa spasi"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value.toLowerCase().replace(/\s/g,'') }))}
                required
                minLength={3}
              />
            </div>
            <div>
              <label className="block text-sm text-maroon-300 mb-1">Password</label>
              <input
                className="input"
                type="password"
                placeholder="min. 6 karakter"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm text-maroon-300 mb-1">Kode Undangan</label>
              <input
                className="input"
                type="text"
                placeholder="Tanya ke admin grup"
                value={form.invite_code}
                onChange={e => setForm(f => ({ ...f, invite_code: e.target.value }))}
                required
              />
              <p className="text-xs text-maroon-300 mt-1">Hanya member Bonbin PL yang bisa daftar</p>
            </div>
            <button className="btn-primary w-full" type="submit" disabled={loading}>
              {loading ? 'Mendaftar...' : 'Daftar'}
            </button>
          </form>
          <p className="text-center text-maroon-300 text-sm mt-4">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-gold-400 hover:underline">Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

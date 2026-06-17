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
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">⚽</div>
          <h1 className="font-display text-4xl text-bonbin-gold tracking-wider">BONBIN PL</h1>
          <p className="text-gray-400 text-sm mt-1">PICK'EM — WORLD CUP 2026</p>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Daftar Akun</h2>
          {error && <div className="bg-red-900/50 border border-red-700 text-red-300 rounded-lg p-3 mb-4 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nama Tampil</label>
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
              <label className="block text-sm text-gray-400 mb-1">Username</label>
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
              <label className="block text-sm text-gray-400 mb-1">Password</label>
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
              <label className="block text-sm text-gray-400 mb-1">Kode Undangan</label>
              <input
                className="input"
                type="text"
                placeholder="Tanya ke admin grup"
                value={form.invite_code}
                onChange={e => setForm(f => ({ ...f, invite_code: e.target.value }))}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Hanya member Bonbin PL yang bisa daftar</p>
            </div>
            <button className="btn-primary w-full" type="submit" disabled={loading}>
              {loading ? 'Mendaftar...' : 'Daftar'}
            </button>
          </form>
          <p className="text-center text-gray-500 text-sm mt-4">
            Sudah punya akun?{' '}
            <Link to="/login" className="text-bonbin-gold hover:underline">Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import api from '../utils/api';

export default function Admin() {
  const [matches, setMatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('matches');
  const [syncMsg, setSyncMsg] = useState('');
  const [addForm, setAddForm] = useState({
    home_team: '', away_team: '', home_flag: '', away_flag: '',
    match_date: '', stage: 'Group Stage', group_name: '', venue: '', city: ''
  });
  const [scoreForm, setScoreForm] = useState({});
  const [loading, setLoading] = useState(false);

  async function loadData() {
    const [mRes, lRes] = await Promise.all([
      api.get('/matches'),
      api.get('/picks/leaderboard')
    ]);
    setMatches(mRes.data);
    setUsers(lRes.data);
  }

  useEffect(() => { loadData(); }, []);

  async function addMatch(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/matches', addForm);
      setAddForm({ home_team: '', away_team: '', home_flag: '', away_flag: '', match_date: '', stage: 'Group Stage', group_name: '', venue: '', city: '' });
      loadData();
      alert('Pertandingan ditambahkan!');
    } catch (err) {
      alert(err.response?.data?.error || 'Error');
    } finally {
      setLoading(false);
    }
  }

  async function updateScore(matchId) {
    const form = scoreForm[matchId];
    if (!form) return;
    try {
      await api.patch(`/matches/${matchId}/score`, {
        home_score: parseInt(form.home),
        away_score: parseInt(form.away),
        status: 'finished'
      });
      loadData();
    } catch (err) {
      alert(err.response?.data?.error || 'Error update skor');
    }
  }

  async function toggleLock(match) {
    await api.patch(`/matches/${match.id}/lock`, { is_locked: !match.is_locked });
    loadData();
  }

  async function deleteMatch(id) {
    if (!confirm('Hapus pertandingan ini?')) return;
    await api.delete(`/matches/${id}`);
    loadData();
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">⚙️</span>
        <h1 className="text-2xl font-bold">Admin Panel</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['matches', 'add', 'users'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === t ? 'bg-bonbin-gold text-bonbin-dark' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
            {t === 'matches' ? '⚽ Pertandingan' : t === 'add' ? '➕ Tambah' : '👥 Member'}
          </button>
        ))}
      </div>

      {/* Match Management */}
      {tab === 'matches' && (
        <div className="space-y-3">
          <p className="text-sm text-gray-500">Kelola skor & status pertandingan</p>
          {matches.map(m => (
            <div key={m.id} className="card p-4">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div className="font-semibold text-sm">
                  {m.home_flag} {m.home_team} vs {m.away_team} {m.away_flag}
                </div>
                <div className="flex gap-2 items-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    m.status === 'finished' ? 'bg-gray-700 text-gray-400' :
                    m.status === 'live' ? 'bg-red-800 text-red-200' :
                    'bg-green-900 text-green-300'
                  }`}>{m.status}</span>
                  {m.home_score != null && (
                    <span className="text-bonbin-gold font-bold text-sm">{m.home_score}–{m.away_score}</span>
                  )}
                </div>
              </div>
              <div className="text-xs text-gray-500 mb-3">
                {new Date(m.match_date).toLocaleString('id-ID')} · {m.group_name || m.stage}
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <input type="number" min="0" max="20" placeholder="H"
                  className="w-12 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-center"
                  value={scoreForm[m.id]?.home ?? ''}
                  onChange={e => setScoreForm(f => ({ ...f, [m.id]: { ...f[m.id], home: e.target.value } }))}
                />
                <span className="text-gray-500">–</span>
                <input type="number" min="0" max="20" placeholder="A"
                  className="w-12 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-center"
                  value={scoreForm[m.id]?.away ?? ''}
                  onChange={e => setScoreForm(f => ({ ...f, [m.id]: { ...f[m.id], away: e.target.value } }))}
                />
                <button onClick={() => updateScore(m.id)}
                  className="btn-primary text-xs py-1 px-3">Simpan Skor</button>
                <button onClick={() => toggleLock(m)}
                  className={`text-xs px-3 py-1 rounded-lg ${m.is_locked ? 'bg-yellow-800 text-yellow-200' : 'bg-gray-700 text-gray-300'}`}>
                  {m.is_locked ? '🔒 Terkunci' : '🔓 Terbuka'}
                </button>
                <button onClick={() => deleteMatch(m.id)}
                  className="text-xs px-3 py-1 rounded-lg bg-red-900/50 text-red-400 hover:bg-red-900">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Match */}
      {tab === 'add' && (
        <div className="card p-5">
          <h2 className="font-bold mb-4">Tambah Pertandingan Manual</h2>
          <form onSubmit={addMatch} className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Tim Kandang</label>
              <input className="input" placeholder="Brazil" value={addForm.home_team}
                onChange={e => setAddForm(f => ({ ...f, home_team: e.target.value }))} required />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Tim Tandang</label>
              <input className="input" placeholder="Argentina" value={addForm.away_team}
                onChange={e => setAddForm(f => ({ ...f, away_team: e.target.value }))} required />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Flag Kandang (emoji)</label>
              <input className="input" placeholder="🇧🇷" value={addForm.home_flag}
                onChange={e => setAddForm(f => ({ ...f, home_flag: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Flag Tandang (emoji)</label>
              <input className="input" placeholder="🇦🇷" value={addForm.away_flag}
                onChange={e => setAddForm(f => ({ ...f, away_flag: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-gray-400 mb-1 block">Tanggal & Waktu (WIB)</label>
              <input className="input" type="datetime-local" value={addForm.match_date}
                onChange={e => setAddForm(f => ({ ...f, match_date: e.target.value }))} required />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Stage</label>
              <select className="input" value={addForm.stage}
                onChange={e => setAddForm(f => ({ ...f, stage: e.target.value }))}>
                <option>Group Stage</option>
                <option>Round of 32</option>
                <option>Round of 16</option>
                <option>Quarter Final</option>
                <option>Semi Final</option>
                <option>Third Place</option>
                <option>Final</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Grup (opsional)</label>
              <input className="input" placeholder="Group A" value={addForm.group_name}
                onChange={e => setAddForm(f => ({ ...f, group_name: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Venue</label>
              <input className="input" placeholder="SoFi Stadium" value={addForm.venue}
                onChange={e => setAddForm(f => ({ ...f, venue: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Kota</label>
              <input className="input" placeholder="Los Angeles" value={addForm.city}
                onChange={e => setAddForm(f => ({ ...f, city: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <button className="btn-primary w-full" type="submit" disabled={loading}>
                {loading ? 'Menambahkan...' : 'Tambah Pertandingan'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-800/50">
              <tr>
                <th className="text-left px-4 py-3 text-gray-400">Nama</th>
                <th className="text-center px-4 py-3 text-gray-400">Poin</th>
                <th className="text-center px-4 py-3 text-gray-400">Tebakan</th>
                <th className="text-center px-4 py-3 text-gray-400">Tepat</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={u.id} className="border-t border-gray-800">
                  <td className="px-4 py-3">
                    <div className="font-medium">{u.display_name}</div>
                    <div className="text-xs text-gray-500">@{u.username}</div>
                  </td>
                  <td className="text-center px-4 py-3 font-bold text-bonbin-gold">{u.total_points}</td>
                  <td className="text-center px-4 py-3 text-gray-400">{u.total_picks}</td>
                  <td className="text-center px-4 py-3 text-green-400">{u.exact_scores}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

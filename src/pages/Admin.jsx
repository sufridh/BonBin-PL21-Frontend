import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Flag from '../components/Flag';

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

  // Admin "view/edit any account's picks" state
  const [selectedUserId, setSelectedUserId] = useState('');
  const [userPicks, setUserPicks] = useState([]);
  const [picksLoading, setPicksLoading] = useState(false);
  const [pickForm, setPickForm] = useState({});
  const [pickSavingId, setPickSavingId] = useState(null);

  async function loadData() {
    const [mRes, lRes] = await Promise.all([
      api.get('/matches'),
      api.get('/picks/leaderboard')
    ]);
    setMatches(mRes.data);
    setUsers(lRes.data);
  }

  useEffect(() => { loadData(); }, []);

  async function loadUserPicks(userId) {
    if (!userId) { setUserPicks([]); return; }
    setPicksLoading(true);
    try {
      const res = await api.get(`/picks/admin/user/${userId}`);
      setUserPicks(res.data);
      // Pre-fill the edit form with existing picks
      const form = {};
      res.data.forEach(row => {
        form[row.match_id] = {
          home: row.home_score_pick ?? '',
          away: row.away_score_pick ?? ''
        };
      });
      setPickForm(form);
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal memuat tebakan member');
    } finally {
      setPicksLoading(false);
    }
  }

  function selectUser(userId) {
    setSelectedUserId(userId);
    loadUserPicks(userId);
  }

  async function savePick(matchId) {
    const form = pickForm[matchId];
    if (!form || form.home === '' || form.away === '') {
      alert('Isi skor kandang & tandang terlebih dahulu');
      return;
    }
    setPickSavingId(matchId);
    try {
      await api.put('/picks/admin', {
        user_id: selectedUserId,
        match_id: matchId,
        home_score_pick: parseInt(form.home),
        away_score_pick: parseInt(form.away)
      });
      await loadUserPicks(selectedUserId);
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menyimpan tebakan');
    } finally {
      setPickSavingId(null);
    }
  }

  async function clearPick(pickId, matchId) {
    if (!confirm('Hapus tebakan ini untuk member ini?')) return;
    setPickSavingId(matchId);
    try {
      await api.delete(`/picks/admin/${pickId}`);
      await loadUserPicks(selectedUserId);
    } catch (err) {
      alert(err.response?.data?.error || 'Gagal menghapus tebakan');
    } finally {
      setPickSavingId(null);
    }
  }

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
        <h1 className="text-2xl font-bold text-cream-100">Admin Panel</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
        {['matches', 'add', 'picks', 'users'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-shrink-0 whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium ${tab === t ? 'bg-gold-400 text-maroon-950' : 'bg-maroon-800 text-maroon-300 hover:bg-maroon-700'}`}>
            {t === 'matches' ? '⚽ Pertandingan' : t === 'add' ? '➕ Tambah' : t === 'picks' ? '🎯 Tebakan' : '👥 Member'}
          </button>
        ))}
      </div>

      {/* Match Management */}
      {tab === 'matches' && (
        <div className="space-y-3">
          <p className="text-sm text-maroon-300">Kelola skor & status pertandingan</p>
          {matches.map(m => (
            <div key={m.id} className="card p-4">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div className="font-semibold text-sm flex items-center gap-1.5 text-cream-100">
                  <Flag team={m.home_team} className="w-5 h-3.5" /> {m.home_team} vs {m.away_team} <Flag team={m.away_team} className="w-5 h-3.5" />
                </div>
                <div className="flex gap-2 items-center">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    m.status === 'finished' ? 'bg-maroon-700 text-maroon-300' :
                    m.status === 'live' ? 'bg-maroon-600 text-gold-200' :
                    'bg-gold-400/20 text-gold-300'
                  }`}>{m.status}</span>
                  {m.home_score != null && (
                    <span className="text-gold-400 font-bold text-sm">{m.home_score}–{m.away_score}</span>
                  )}
                </div>
              </div>
              <div className="text-xs text-maroon-300 mb-3">
                {new Date(m.match_date).toLocaleString('id-ID')} · {m.group_name || m.stage}
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <input type="number" min="0" max="20" placeholder="H"
                  className="w-12 bg-maroon-800 border border-maroon-600 rounded px-2 py-1 text-sm text-center"
                  value={scoreForm[m.id]?.home ?? ''}
                  onChange={e => setScoreForm(f => ({ ...f, [m.id]: { ...f[m.id], home: e.target.value } }))}
                />
                <span className="text-maroon-300">–</span>
                <input type="number" min="0" max="20" placeholder="A"
                  className="w-12 bg-maroon-800 border border-maroon-600 rounded px-2 py-1 text-sm text-center"
                  value={scoreForm[m.id]?.away ?? ''}
                  onChange={e => setScoreForm(f => ({ ...f, [m.id]: { ...f[m.id], away: e.target.value } }))}
                />
                <button onClick={() => updateScore(m.id)}
                  className="btn-primary text-xs py-1 px-3">Simpan Skor</button>
                <button onClick={() => toggleLock(m)}
                  className={`text-xs px-3 py-1 rounded-lg ${m.is_locked ? 'bg-gold-400/30 text-gold-200' : 'bg-maroon-700 text-cream-100'}`}>
                  {m.is_locked ? '🔒 Terkunci' : '🔓 Terbuka'}
                </button>
                <button onClick={() => deleteMatch(m.id)}
                  className="text-xs px-3 py-1 rounded-lg bg-maroon-600/60 text-gold-200 hover:bg-maroon-600">Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Match */}
      {tab === 'add' && (
        <div className="card p-5">
          <h2 className="font-bold mb-4 text-cream-100">Tambah Pertandingan Manual</h2>
          <form onSubmit={addMatch} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-maroon-300 mb-1 block">Tim Kandang</label>
              <input className="input" placeholder="Brazil" value={addForm.home_team}
                onChange={e => setAddForm(f => ({ ...f, home_team: e.target.value }))} required />
            </div>
            <div>
              <label className="text-xs text-maroon-300 mb-1 block">Tim Tandang</label>
              <input className="input" placeholder="Argentina" value={addForm.away_team}
                onChange={e => setAddForm(f => ({ ...f, away_team: e.target.value }))} required />
            </div>
            <div>
              <label className="text-xs text-maroon-300 mb-1 block">Flag Kandang (opsional, otomatis dari nama tim)</label>
              <input className="input" placeholder="🇧🇷" value={addForm.home_flag}
                onChange={e => setAddForm(f => ({ ...f, home_flag: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-maroon-300 mb-1 block">Flag Tandang (opsional, otomatis dari nama tim)</label>
              <input className="input" placeholder="🇦🇷" value={addForm.away_flag}
                onChange={e => setAddForm(f => ({ ...f, away_flag: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-maroon-300 mb-1 block">Tanggal & Waktu (WIB)</label>
              <input className="input" type="datetime-local" value={addForm.match_date}
                onChange={e => setAddForm(f => ({ ...f, match_date: e.target.value }))} required />
            </div>
            <div>
              <label className="text-xs text-maroon-300 mb-1 block">Stage</label>
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
              <label className="text-xs text-maroon-300 mb-1 block">Grup (opsional)</label>
              <input className="input" placeholder="Group A" value={addForm.group_name}
                onChange={e => setAddForm(f => ({ ...f, group_name: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-maroon-300 mb-1 block">Venue</label>
              <input className="input" placeholder="SoFi Stadium" value={addForm.venue}
                onChange={e => setAddForm(f => ({ ...f, venue: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-maroon-300 mb-1 block">Kota</label>
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

      {/* Picks — view & edit any member's saved guesses */}
      {tab === 'picks' && (
        <div className="space-y-4">
          <div>
            <label className="text-xs text-maroon-300 mb-1 block">Pilih Member</label>
            <select className="input" value={selectedUserId}
              onChange={e => selectUser(e.target.value)}>
              <option value="">-- Pilih member --</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.display_name} (@{u.username})</option>
              ))}
            </select>
          </div>

          {!selectedUserId && (
            <p className="text-sm text-maroon-300">Pilih member di atas untuk melihat & mengubah tebakan mereka.</p>
          )}

          {selectedUserId && picksLoading && (
            <div className="text-center text-maroon-300 py-8">
              <div className="text-3xl mb-2 animate-spin">⚽</div>
              <p>Memuat tebakan...</p>
            </div>
          )}

          {selectedUserId && !picksLoading && (
            <div className="space-y-3">
              {userPicks.map(row => {
                const form = pickForm[row.match_id] || { home: '', away: '' };
                const hasPick = row.pick_id != null;
                return (
                  <div key={row.match_id} className="card p-4">
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <div className="font-semibold text-sm flex items-center gap-1.5 text-cream-100">
                        <Flag team={row.home_team} className="w-5 h-3.5" /> {row.home_team} vs {row.away_team} <Flag team={row.away_team} className="w-5 h-3.5" />
                      </div>
                      <div className="flex gap-2 items-center">
                        {row.is_locked && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gold-400/20 text-gold-300">🔒 Terkunci</span>
                        )}
                        {row.home_score != null && (
                          <span className="text-gold-400 font-bold text-sm">Hasil: {row.home_score}–{row.away_score}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-maroon-300 mb-3">
                      {new Date(row.match_date).toLocaleString('id-ID')} · {row.group_name || row.stage}
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                      <input type="number" min="0" max="20" placeholder="H"
                        className="w-12 bg-maroon-800 border border-maroon-600 rounded px-2 py-1 text-sm text-center"
                        value={form.home}
                        onChange={e => setPickForm(f => ({ ...f, [row.match_id]: { ...f[row.match_id], home: e.target.value } }))}
                      />
                      <span className="text-maroon-300">–</span>
                      <input type="number" min="0" max="20" placeholder="A"
                        className="w-12 bg-maroon-800 border border-maroon-600 rounded px-2 py-1 text-sm text-center"
                        value={form.away}
                        onChange={e => setPickForm(f => ({ ...f, [row.match_id]: { ...f[row.match_id], away: e.target.value } }))}
                      />
                      <button onClick={() => savePick(row.match_id)} disabled={pickSavingId === row.match_id}
                        className="btn-primary text-xs py-1 px-3">
                        {pickSavingId === row.match_id ? 'Menyimpan...' : hasPick ? 'Update Tebakan' : 'Simpan Tebakan'}
                      </button>
                      {hasPick && (
                        <button onClick={() => clearPick(row.pick_id, row.match_id)} disabled={pickSavingId === row.match_id}
                          className="text-xs px-3 py-1 rounded-lg bg-maroon-600/60 text-gold-200 hover:bg-maroon-600">
                          Hapus
                        </button>
                      )}
                      {!hasPick && (
                        <span className="text-xs text-maroon-400 italic">Belum ditebak</span>
                      )}
                    </div>
                  </div>
                );
              })}
              {userPicks.length === 0 && (
                <p className="text-sm text-maroon-300">Belum ada pertandingan.</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Users */}
      {tab === 'users' && (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-maroon-800/50">
                <tr>
                  <th className="text-left px-4 py-3 text-maroon-300">Nama</th>
                  <th className="text-center px-4 py-3 text-maroon-300">Poin</th>
                  <th className="text-center px-4 py-3 text-maroon-300">Tebakan</th>
                  <th className="text-center px-4 py-3 text-maroon-300">Tepat</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id} className="border-t border-maroon-700">
                    <td className="px-4 py-3">
                      <div className="font-medium text-cream-100">{u.display_name}</div>
                      <div className="text-xs text-maroon-300">@{u.username}</div>
                    </td>
                    <td className="text-center px-4 py-3 font-bold text-gold-400">{u.total_points}</td>
                    <td className="text-center px-4 py-3 text-maroon-300">{u.total_picks}</td>
                    <td className="text-center px-4 py-3 text-gold-300">{u.exact_scores}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
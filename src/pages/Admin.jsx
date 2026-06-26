import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Flag from '../components/Flag';

export default function Admin() {
  const [matches, setMatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('matches');
  const [addForm, setAddForm] = useState({
    home_team: '', away_team: '', home_flag: '', away_flag: '',
    match_date: '', stage: 'Group Stage', group_name: '', venue: '', city: ''
  });
  const [scoreForm, setScoreForm] = useState({});
  const [loading, setLoading] = useState(false);

  // Golden Boot state
  const [scorers, setScorers] = useState([]);
  const [gbWinner, setGbWinner] = useState(null);
  const [gbSearch, setGbSearch] = useState('');
  const [gbAllPicks, setGbAllPicks] = useState([]);
  const [gbLoading, setGbLoading] = useState(false);
  const [gbMsg, setGbMsg] = useState('');
  const [gbLock, setGbLock] = useState({ is_locked: false, locked_at: null });

  async function loadData() {
    const [mRes, lRes] = await Promise.all([
      api.get('/matches'),
      api.get('/picks/leaderboard')
    ]);
    setMatches(mRes.data);
    setUsers(lRes.data);
  }

  async function loadGoldenBoot() {
    setGbLoading(true);
    try {
      const [scorersRes, winnerRes, allPicksRes, lockRes] = await Promise.all([
        api.get('/golden-boot/scorers').catch(() => ({ data: [] })),
        api.get('/golden-boot/winner').catch(() => ({ data: null })),
        api.get('/golden-boot/all').catch(() => ({ data: { picks: [], winner: null } })),
        api.get('/golden-boot/lock').catch(() => ({ data: { is_locked: false, locked_at: null } })),
      ]);
      setScorers(scorersRes.data || []);
      setGbWinner(winnerRes.data || null);
      setGbAllPicks(allPicksRes.data?.picks || []);
      setGbLock(lockRes.data || { is_locked: false, locked_at: null });
    } finally {
      setGbLoading(false);
    }
  }

  async function toggleGoldenBootLock() {
    const next = !gbLock.is_locked;
    if (!confirm(next
      ? 'Kunci pilihan Golden Boot? Member tidak akan bisa submit/ubah pilihan lagi.'
      : 'Buka kunci pilihan Golden Boot? Member akan bisa submit/ubah pilihan lagi.')) return;
    try {
      const res = await api.patch('/golden-boot/lock', { is_locked: next });
      setGbLock(res.data);
      setGbMsg(next ? '🔒 Pilihan Golden Boot dikunci.' : '🔓 Pilihan Golden Boot dibuka kembali.');
    } catch (err) {
      setGbMsg('Error: ' + (err.response?.data?.error || err.message));
    }
  }

  useEffect(() => { loadData(); }, []);
  useEffect(() => { if (tab === 'golden_boot') loadGoldenBoot(); }, [tab]);

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

  async function setGoldenBootWinner(scorer) {
    if (!confirm(`Set ${scorer.player_name} sebagai Golden Boot winner?`)) return;
    try {
      await api.post('/golden-boot/winner', {
        player_id: scorer.player_id,
        player_name: scorer.player_name,
        team_name: scorer.team_name,
        goals: scorer.goals || 0,
      });
      setGbMsg(`✓ ${scorer.player_name} ditetapkan sebagai Golden Boot winner. +5 poin diberikan ke yang benar!`);
      loadGoldenBoot();
    } catch (err) {
      setGbMsg('Error: ' + (err.response?.data?.error || err.message));
    }
  }

  async function clearGoldenBootWinner() {
    if (!confirm('Hapus Golden Boot winner? Picks akan terbuka kembali.')) return;
    try {
      await api.delete('/golden-boot/winner');
      setGbMsg('Winner dihapus. Picks terbuka kembali.');
      loadGoldenBoot();
    } catch (err) {
      setGbMsg('Error: ' + (err.response?.data?.error || err.message));
    }
  }

  const gbFiltered = gbSearch.trim()
    ? scorers.filter(s =>
        s.player_name.toLowerCase().includes(gbSearch.toLowerCase()) ||
        s.team_name.toLowerCase().includes(gbSearch.toLowerCase())
      )
    : scorers;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">⚙️</span>
        <h1 className="text-2xl font-bold text-cream-100">Admin Panel</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
        {[
          { key: 'matches', label: '⚽ Pertandingan' },
          { key: 'add', label: '➕ Tambah' },
          { key: 'users', label: '👥 Member' },
          { key: 'golden_boot', label: '👟 Golden Boot' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setTab(key)}
            className={`flex-shrink-0 whitespace-nowrap px-4 py-2 rounded-lg text-sm font-medium ${tab === key ? 'bg-gold-400 text-maroon-950' : 'bg-maroon-800 text-maroon-300 hover:bg-maroon-700'}`}>
            {label}
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
              <label className="text-xs text-maroon-300 mb-1 block">Flag Kandang (opsional)</label>
              <input className="input" placeholder="🇧🇷" value={addForm.home_flag}
                onChange={e => setAddForm(f => ({ ...f, home_flag: e.target.value }))} />
            </div>
            <div>
              <label className="text-xs text-maroon-300 mb-1 block">Flag Tandang (opsional)</label>
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
                  <th className="text-center px-4 py-3 text-maroon-300">Golden Boot</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} className="border-t border-maroon-700">
                    <td className="px-4 py-3">
                      <div className="font-medium text-cream-100">{u.display_name}</div>
                      <div className="text-xs text-maroon-300">@{u.username}</div>
                    </td>
                    <td className="text-center px-4 py-3 font-bold text-gold-400">{u.total_points}</td>
                    <td className="text-center px-4 py-3 text-maroon-300">{u.total_picks}</td>
                    <td className="text-center px-4 py-3 text-gold-300">{u.exact_scores}</td>
                    <td className="text-center px-4 py-3 text-maroon-300 text-xs">
                      {u.golden_boot_pick
                        ? <span>{u.golden_boot_flag} {u.golden_boot_pick}</span>
                        : <span className="opacity-50">—</span>
                      }
                      {u.golden_boot_bonus > 0 && (
                        <span className="ml-1 text-gold-400 font-bold">+5</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Golden Boot Admin */}
      {tab === 'golden_boot' && (
        <div className="space-y-4">
          <p className="text-sm text-maroon-300">
            Set pemenang Golden Boot setelah turnamen selesai. Semua member yang menebak pemain yang sama akan otomatis mendapat +5 poin.
          </p>

          {gbMsg && (
            <div className="card p-3 text-sm text-gold-400 border-gold-400/30">{gbMsg}</div>
          )}

          {/* Submission lock toggle */}
          <div className={`card p-4 flex items-center justify-between gap-3 flex-wrap ${gbLock.is_locked ? 'border-gold-400/40' : ''}`}>
            <div>
              <div className="font-semibold text-sm text-cream-100">
                {gbLock.is_locked ? '🔒 Pilihan Terkunci' : '🔓 Pilihan Terbuka'}
              </div>
              <div className="text-xs text-maroon-300 mt-0.5">
                {gbLock.is_locked
                  ? `Member tidak bisa submit/ubah pilihan${gbLock.locked_at ? ' · dikunci ' + new Date(gbLock.locked_at).toLocaleString('id-ID') : ''}.`
                  : 'Member masih bisa submit/ubah pilihan Golden Boot mereka.'}
              </div>
            </div>
            <button
              onClick={toggleGoldenBootLock}
              disabled={!!gbWinner}
              title={gbWinner ? 'Winner sudah ditetapkan — picks otomatis terkunci' : ''}
              className={`text-xs py-1.5 px-3 rounded-lg font-medium ${
                gbWinner ? 'bg-maroon-800 text-maroon-400 cursor-not-allowed' :
                gbLock.is_locked ? 'bg-maroon-600/60 text-gold-200 hover:bg-maroon-600' : 'btn-primary'
              }`}
            >
              {gbLock.is_locked ? 'Buka Kunci' : 'Kunci Sekarang'}
            </button>
          </div>

          {/* Current winner */}
          {gbWinner && (
            <div className="card p-4 border-gold-400/40">
              <div className="text-xs text-gold-300 font-bold uppercase tracking-widest mb-2">Winner Saat Ini</div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-gold-400 text-lg">{gbWinner.player_name}</div>
                  <div className="text-sm text-maroon-300">{gbWinner.team_name} · {gbWinner.goals} gol</div>
                </div>
                <button onClick={clearGoldenBootWinner}
                  className="text-xs px-3 py-1.5 rounded-lg bg-maroon-600/60 text-gold-200 hover:bg-maroon-600">
                  Hapus Winner
                </button>
              </div>

              {/* Who got it right */}
              {gbAllPicks.length > 0 && (
                <div className="mt-3 pt-3 border-t border-maroon-700">
                  <div className="text-xs text-maroon-300 mb-2">
                    {gbAllPicks.filter(p => p.correct).length} dari {gbAllPicks.length} member menebak dengan benar
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {gbAllPicks.map(p => (
                      <span key={p.username}
                        className={`text-xs px-2 py-0.5 rounded-full ${p.correct ? 'bg-gold-400/20 text-gold-300' : 'bg-maroon-800 text-maroon-400'}`}>
                        {p.correct ? '✓' : ''} {p.display_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Set winner from scorers list */}
          {!gbWinner && (
            <>
              <div className="card p-4">
                <div className="text-sm font-semibold text-cream-100 mb-3">Pilih Winner dari Daftar Pencetak Gol</div>
                <input
                  type="text"
                  placeholder="Cari nama pemain atau tim..."
                  className="input w-full mb-3"
                  value={gbSearch}
                  onChange={e => setGbSearch(e.target.value)}
                />
                {gbLoading && <p className="text-maroon-300 text-sm">Memuat...</p>}
                {!gbLoading && gbFiltered.length === 0 && (
                  <p className="text-maroon-300 text-sm text-center py-4">
                    {scorers.length === 0
                      ? 'Data pencetak gol belum tersedia (turnamen belum dimulai atau API key tidak dikonfigurasi).'
                      : 'Tidak ada yang cocok.'}
                  </p>
                )}
                <div className="space-y-1.5 max-h-96 overflow-y-auto">
                  {gbFiltered.map(scorer => (
                    <button key={scorer.player_id}
                      onClick={() => setGoldenBootWinner(scorer)}
                      className="w-full flex items-center gap-3 p-2.5 rounded-lg bg-maroon-800 hover:bg-maroon-700 transition-colors text-left">
                      <div className="flex-1">
                        <div className="font-semibold text-cream-100 text-sm">{scorer.player_name}</div>
                        <div className="text-xs text-maroon-300">{scorer.team_name}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-gold-400 text-sm">{scorer.goals}</div>
                        <div className="text-xs text-maroon-300">gol</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Manual entry if scorers API empty */}
              <ManualWinnerForm onSet={(data) => {
                api.post('/golden-boot/winner', data)
                  .then(() => { setGbMsg(`✓ ${data.player_name} ditetapkan.`); loadGoldenBoot(); })
                  .catch(err => setGbMsg('Error: ' + (err.response?.data?.error || err.message)));
              }} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ManualWinnerForm({ onSet }) {
  const [form, setForm] = useState({ player_name: '', team_name: '', goals: '' });
  const [open, setOpen] = useState(false);

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="text-sm text-maroon-400 hover:text-maroon-200 underline">
      Input manual (jika API tidak tersedia)
    </button>
  );

  return (
    <div className="card p-4">
      <div className="text-sm font-semibold text-cream-100 mb-3">Input Manual Winner</div>
      <div className="space-y-2">
        <input className="input" placeholder="Nama pemain" value={form.player_name}
          onChange={e => setForm(f => ({ ...f, player_name: e.target.value }))} />
        <input className="input" placeholder="Nama tim" value={form.team_name}
          onChange={e => setForm(f => ({ ...f, team_name: e.target.value }))} />
        <input className="input" type="number" min="0" placeholder="Jumlah gol" value={form.goals}
          onChange={e => setForm(f => ({ ...f, goals: e.target.value }))} />
        <button
          onClick={() => {
            if (!form.player_name || !form.team_name) return;
            onSet({ player_id: Date.now(), ...form, goals: parseInt(form.goals) || 0 });
          }}
          className="btn-primary w-full text-sm">
          Tetapkan Winner
        </button>
      </div>
    </div>
  );
}

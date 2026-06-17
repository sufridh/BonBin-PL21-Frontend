import React, { useState, useEffect, useMemo } from 'react';
import api from '../utils/api';

const POSITION_ORDER = { 'Offence': 0, 'Midfield': 1, 'Defence': 2, 'Goalkeeper': 3 };

export default function GoldenBoot() {
  const [players, setPlayers] = useState([]);
  const [myPick, setMyPick] = useState(null);
  const [winner, setWinner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/golden-boot/scorers').catch(() => ({ data: [] })),
      api.get('/golden-boot/my').catch(() => ({ data: null })),
      api.get('/golden-boot/winner').catch(() => ({ data: null })),
    ]).then(([playersRes, myPickRes, winnerRes]) => {
      setPlayers(playersRes.data || []);
      setMyPick(myPickRes.data || null);
      setWinner(winnerRes.data || null);
    }).finally(() => setLoading(false));
  }, []);

  const locked = winner !== null;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return players;
    return players.filter(
      p => p.player_name.toLowerCase().includes(q) || p.team_name.toLowerCase().includes(q)
    );
  }, [players, search]);

  // When no search: show scorers (goals > 0) first, hide 0-goal players unless searched
  const displayList = useMemo(() => {
    if (search.trim()) return filtered;
    // Default view: show players with goals first, then hint to search for others
    return filtered.filter(p => p.goals > 0);
  }, [filtered, search]);

  const hasNonScorers = players.some(p => p.goals === 0);

  async function pickPlayer(player) {
    if (locked) return;
    setSaving(true);
    setError('');
    try {
      const res = await api.post('/golden-boot/pick', {
        player_id: player.player_id,
        player_name: player.player_name,
        team_name: player.team_name,
        team_flag: player.team_flag,
      });
      setMyPick(res.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal menyimpan pilihan');
    } finally {
      setSaving(false);
    }
  }

  if (loading) return (
    <div className="text-center text-maroon-300 py-20">
      <div className="text-4xl mb-3 animate-spin">⚽</div>
      <p>Memuat data pemain...</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <span className="text-4xl">👟</span>
        <div>
          <h1 className="text-2xl font-bold text-cream-100">Golden Boot</h1>
          <p className="text-maroon-300 text-sm">Tebak siapa top scorer Piala Dunia 2026 — bonus +5 poin!</p>
        </div>
      </div>

      {/* Bonus banner */}
      <div className="card p-3 mb-5 flex items-center gap-3 border-gold-400/40">
        <span className="text-2xl">🥇</span>
        <p className="text-sm text-cream-100">
          Tebak top scorer dengan benar dan dapatkan <span className="text-gold-400 font-bold">+5 poin</span> tambahan di klasemen akhir turnamen.
        </p>
      </div>

      {/* Winner announcement */}
      {winner && (
        <div className="card p-4 mb-5 border-gold-400 bg-gold-400/5">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🏆</span>
            <div>
              <div className="text-xs text-gold-300 font-bold uppercase tracking-widest mb-0.5">Pemenang Golden Boot</div>
              <div className="text-lg font-bold text-gold-400">{winner.player_name}</div>
              <div className="text-sm text-maroon-300">
                {winner.team_name} · {winner.goals} gol
              </div>
            </div>
            {myPick?.player_id === winner.player_id && (
              <div className="ml-auto text-center">
                <div className="text-2xl font-bold text-gold-400">+5</div>
                <div className="text-xs text-gold-300">poin bonus!</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* My current pick */}
      {myPick && (
        <div className={`card p-4 mb-5 ${locked && myPick.player_id === winner?.player_id ? 'border-gold-400' : ''}`}>
          <div className="text-xs text-maroon-300 uppercase tracking-widest mb-2 font-bold">Pilihan Kamu</div>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{myPick.team_flag}</span>
            <div className="flex-1">
              <div className="font-bold text-cream-100">{myPick.player_name}</div>
              <div className="text-sm text-maroon-300">{myPick.team_name}</div>
            </div>
            {locked && myPick.player_id === winner?.player_id && (
              <span className="text-gold-400 font-bold text-sm">✓ Benar! +5 poin</span>
            )}
            {locked && myPick.player_id !== winner?.player_id && (
              <span className="text-maroon-400 text-sm">✗ Tidak tepat</span>
            )}
            {!locked && (
              <span className="text-xs bg-gold-400/20 text-gold-300 px-2 py-1 rounded-full">Tersimpan</span>
            )}
          </div>
        </div>
      )}

      {/* Locked with no pick */}
      {locked && !myPick && (
        <div className="card p-4 mb-5 text-center text-maroon-300">
          Kamu tidak memasukkan tebakan Golden Boot sebelum pengumuman pemenang.
        </div>
      )}

      {/* Pick form */}
      {!locked && (
        <>
          {/* Search */}
          <div className="mb-3">
            <input
              type="text"
              placeholder="🔍  Cari nama pemain atau tim..."
              className="input w-full"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Hint to search for squad players */}
          {!search.trim() && hasNonScorers && (
            <p className="text-xs text-maroon-300 mb-3 px-1">
              Menampilkan {displayList.length} pemain yang sudah mencetak gol.
              Cari nama pemain lain di seluruh skuad 48 tim untuk memilih mereka.
            </p>
          )}

          {error && (
            <div className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2 mb-3">{error}</div>
          )}
          {saved && (
            <div className="text-sm text-green-400 bg-green-400/10 rounded-lg px-3 py-2 mb-3">
              ✓ Pilihan Golden Boot tersimpan!
            </div>
          )}

          {/* No results */}
          {search.trim() && filtered.length === 0 && (
            <p className="text-center text-maroon-300 py-6 text-sm">
              Tidak ada pemain yang cocok dengan "{search}"
            </p>
          )}

          {/* No data at all */}
          {players.length === 0 && (
            <div className="text-center text-maroon-300 py-12 text-sm">
              <div className="text-4xl mb-3">⚽</div>
              <p>Data pemain belum tersedia — API key mungkin belum dikonfigurasi.</p>
            </div>
          )}

          {/* Player list */}
          <div className="space-y-1.5">
            {displayList.map(player => {
              const isSelected = myPick?.player_id === player.player_id;
              return (
                <button
                  key={player.player_id}
                  onClick={() => pickPlayer(player)}
                  disabled={saving}
                  className={`w-full card p-3 flex items-center gap-3 text-left transition-all active:scale-[0.98] ${
                    isSelected
                      ? 'border-gold-400 ring-1 ring-gold-400/30 bg-gold-400/5'
                      : 'hover:border-maroon-500'
                  }`}
                >
                  {/* Flag from backend — already correct emoji */}
                  <span className="text-xl w-7 text-center flex-shrink-0 leading-none">
                    {player.team_flag}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold truncate ${isSelected ? 'text-gold-400' : 'text-cream-100'}`}>
                      {player.player_name}
                    </div>
                    <div className="text-xs text-maroon-300">
                      {player.team_name}
                      {player.position && (
                        <span className="ml-1.5 opacity-60">· {player.position}</span>
                      )}
                    </div>
                  </div>

                  {/* Goals badge */}
                  {player.goals > 0 && (
                    <div className="text-right flex-shrink-0">
                      <div className={`font-bold tabular-nums ${isSelected ? 'text-gold-400' : 'text-cream-100'}`}>
                        {player.goals}
                      </div>
                      <div className="text-xs text-maroon-300">gol</div>
                    </div>
                  )}

                  {isSelected && (
                    <span className="text-gold-400 text-lg flex-shrink-0">✓</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search prompt when default list is empty (no goals scored yet) */}
          {!search.trim() && displayList.length === 0 && players.length > 0 && (
            <div className="text-center text-maroon-300 py-8 text-sm">
              <div className="text-4xl mb-3">🔍</div>
              <p>Belum ada gol. Cari nama pemain untuk memilih dari seluruh skuad.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

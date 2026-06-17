import React, { useState, useEffect, useMemo } from 'react';
import api from '../utils/api';

const FLAG_MAP = {
  'Argentina': '🇦🇷', 'Brazil': '🇧🇷', 'France': '🇫🇷', 'Germany': '🇩🇪',
  'Spain': '🇪🇸', 'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Portugal': '🇵🇹', 'Netherlands': '🇳🇱',
  'Italy': '🇮🇹', 'Belgium': '🇧🇪', 'Croatia': '🇭🇷', 'Morocco': '🇲🇦',
  'USA': '🇺🇸', 'Mexico': '🇲🇽', 'Canada': '🇨🇦', 'Japan': '🇯🇵',
  'South Korea': '🇰🇷', 'Australia': '🇦🇺', 'Uruguay': '🇺🇾', 'Colombia': '🇨🇴',
  'Switzerland': '🇨🇭', 'Denmark': '🇩🇰', 'Poland': '🇵🇱', 'Serbia': '🇷🇸',
  'Ukraine': '🇺🇦', 'Turkey': '🇹🇷', 'Ghana': '🇬🇭', 'Senegal': '🇸🇳',
  'Cameroon': '🇨🇲', 'Nigeria': '🇳🇬', 'Ecuador': '🇪🇨', 'Saudi Arabia': '🇸🇦',
  'Iran': '🇮🇷', 'Qatar': '🇶🇦', 'Tunisia': '🇹🇳', 'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  'China PR': '🇨🇳', 'Indonesia': '🇮🇩', 'Costa Rica': '🇨🇷', 'Panama': '🇵🇦',
};

function getFlag(teamName) {
  return FLAG_MAP[teamName] || '🏳️';
}

export default function GoldenBoot() {
  const [scorers, setScorers] = useState([]);
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
    ]).then(([scorersRes, myPickRes, winnerRes]) => {
      setScorers(scorersRes.data || []);
      setMyPick(myPickRes.data || null);
      setWinner(winnerRes.data || null);
    }).finally(() => setLoading(false));
  }, []);

  const locked = winner !== null;

  const filtered = useMemo(() => {
    if (!search.trim()) return scorers;
    const q = search.toLowerCase();
    return scorers.filter(
      s => s.player_name.toLowerCase().includes(q) || s.team_name.toLowerCase().includes(q)
    );
  }, [scorers, search]);

  // If no live scorers yet, show fallback popular picks
  const displayList = filtered.length > 0 ? filtered : [];

  async function pickPlayer(scorer) {
    if (locked) return;
    setSaving(true);
    setError('');
    try {
      const res = await api.post('/golden-boot/pick', {
        player_id: scorer.player_id,
        player_name: scorer.player_name,
        team_name: scorer.team_name,
        team_flag: getFlag(scorer.team_name),
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
      <p>Memuat data pencetak gol...</p>
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
                {getFlag(winner.team_name)} {winner.team_name} · {winner.goals} gol
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
            <span className="text-2xl">{myPick.team_flag || getFlag(myPick.team_name)}</span>
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

      {/* Locked state */}
      {locked && !myPick && (
        <div className="card p-4 mb-5 text-center text-maroon-300">
          Kamu tidak memasukkan tebakan Golden Boot sebelum pengumuman pemenang.
        </div>
      )}

      {/* Pick form — only when not locked */}
      {!locked && (
        <>
          {scorers.length === 0 && (
            <div className="card p-4 mb-4 text-center text-maroon-300 text-sm">
              Data pencetak gol belum tersedia — turnamen belum dimulai atau API key belum dikonfigurasi.
              Kamu masih bisa mencari nama pemain secara manual dan memilih nanti.
            </div>
          )}

          <div className="mb-4">
            <input
              type="text"
              placeholder="Cari nama pemain atau tim..."
              className="input w-full"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {error && (
            <div className="text-sm text-red-400 bg-red-400/10 rounded-lg px-3 py-2 mb-3">{error}</div>
          )}
          {saved && (
            <div className="text-sm text-green-400 bg-green-400/10 rounded-lg px-3 py-2 mb-3">
              ✓ Pilihan Golden Boot tersimpan!
            </div>
          )}

          {displayList.length === 0 && search.trim() && (
            <p className="text-center text-maroon-300 py-6 text-sm">Tidak ada pemain yang cocok dengan "{search}"</p>
          )}

          <div className="space-y-2">
            {displayList.map(scorer => {
              const isSelected = myPick?.player_id === scorer.player_id;
              const flag = getFlag(scorer.team_name);
              return (
                <button
                  key={scorer.player_id}
                  onClick={() => pickPlayer(scorer)}
                  disabled={saving}
                  className={`w-full card p-3 flex items-center gap-3 text-left transition-all active:scale-[0.98] ${
                    isSelected
                      ? 'border-gold-400 ring-1 ring-gold-400/30 bg-gold-400/5'
                      : 'hover:border-maroon-500'
                  }`}
                >
                  <span className="text-xl w-7 text-center flex-shrink-0">{flag}</span>
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold truncate ${isSelected ? 'text-gold-400' : 'text-cream-100'}`}>
                      {scorer.player_name}
                    </div>
                    <div className="text-xs text-maroon-300">{scorer.team_name}</div>
                  </div>
                  {scorer.goals > 0 && (
                    <div className="text-right flex-shrink-0">
                      <div className={`font-bold ${isSelected ? 'text-gold-400' : 'text-cream-100'}`}>
                        {scorer.goals}
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

          {displayList.length === 0 && !search.trim() && (
            <div className="text-center text-maroon-300 py-12 text-sm">
              <div className="text-4xl mb-3">⚽</div>
              <p>Data pencetak gol akan muncul setelah pertandingan dimulai.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

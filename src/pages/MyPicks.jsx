import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import MatchCard from '../components/MatchCard';

export default function MyPicks() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  async function loadMatches() {
    try {
      const res = await api.get('/matches');
      setMatches(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMatches();
    const interval = setInterval(loadMatches, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Only matches that already have a saved guess
  const myPicks = matches.filter(m => m.home_score_pick != null);

  const filtered = myPicks.filter(m => {
    if (filter === 'upcoming') return m.status !== 'finished' && m.status !== 'live';
    if (filter === 'live') return m.status === 'live';
    if (filter === 'finished') return m.status === 'finished';
    return true;
  });

  const grouped = filtered.reduce((acc, match) => {
    const date = new Date(match.match_date).toLocaleDateString('id-ID', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(match);
    return acc;
  }, {});

  const totalPoints = myPicks.reduce((sum, m) => sum + (m.points_earned ?? 0), 0);
  const exactScores = myPicks.filter(m => m.points_earned === 3).length;
  const pending = myPicks.filter(m => m.points_earned == null).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-3xl">📝</span>
        <h1 className="text-2xl font-bold text-cream-100">Tebakan Saya</h1>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card p-3 text-center">
          <div className="text-2xl font-bold text-gold-400">{myPicks.length}</div>
          <div className="text-xs text-maroon-300">Total Tebakan</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-2xl font-bold text-cream-100">{totalPoints}</div>
          <div className="text-xs text-maroon-300">Poin Terkumpul</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-2xl font-bold text-gold-300">{exactScores}</div>
          <div className="text-xs text-maroon-300">Skor Tepat</div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
        {[
          { key: 'all', label: 'Semua' },
          { key: 'upcoming', label: '⏳ Belum Main' },
          { key: 'live', label: '🔴 Live' },
          { key: 'finished', label: '✓ Selesai' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === key
                ? 'bg-gold-400 text-maroon-950'
                : 'bg-maroon-800 text-maroon-300 hover:bg-maroon-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-center text-maroon-300 py-12">
          <div className="text-4xl mb-3 animate-spin">⚽</div>
          <p>Memuat tebakan...</p>
        </div>
      )}

      {!loading && pending > 0 && filter === 'all' && (
        <p className="text-xs text-maroon-300 mb-4">
          {pending} tebakan masih menunggu pertandingan dimainkan.
        </p>
      )}

      {!loading && Object.keys(grouped).length === 0 && (
        <div className="text-center text-maroon-300 py-12">
          <div className="text-4xl mb-3">🎯</div>
          <p>
            {myPicks.length === 0
              ? 'Belum ada tebakan yang disimpan. Yuk mulai tebak di halaman Tebak!'
              : 'Tidak ada tebakan di kategori ini.'}
          </p>
        </div>
      )}

      {Object.entries(grouped).map(([date, dayMatches]) => (
        <div key={date} className="mb-6">
          <h3 className="text-xs font-bold text-maroon-300 uppercase tracking-widest mb-3 px-1">{date}</h3>
          <div className="space-y-3">
            {dayMatches.map(match => (
              <MatchCard key={match.id} match={match} onPickSaved={loadMatches} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

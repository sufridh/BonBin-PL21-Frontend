import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import MatchCard from '../components/MatchCard';
import { useAuth } from '../hooks/useAuth';

export default function Picks() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();

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
    // Refresh every 2 minutes
    const interval = setInterval(loadMatches, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Group matches by date
  const filtered = matches.filter(m => {
    if (filter === 'unpicked') return !m.is_locked && m.home_score_pick == null;
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

  const totalPicks = matches.filter(m => m.home_score_pick != null).length;
  const openMatches = matches.filter(m => !m.is_locked && m.home_score_pick == null).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card p-3 text-center">
          <div className="text-2xl font-bold text-bonbin-gold">{totalPicks}</div>
          <div className="text-xs text-gray-500">Tebakan Dibuat</div>
        </div>
        <div className="card p-3 text-center">
          <div className={`text-2xl font-bold ${openMatches > 0 ? 'text-green-400' : 'text-gray-500'}`}>{openMatches}</div>
          <div className="text-xs text-gray-500">Belum Ditebak</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-2xl font-bold text-white">{matches.length}</div>
          <div className="text-xs text-gray-500">Total Pertandingan</div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {[
          { key: 'all', label: 'Semua' },
          { key: 'unpicked', label: '⚠ Belum Ditebak' },
          { key: 'live', label: '🔴 Live' },
          { key: 'finished', label: '✓ Selesai' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              filter === key
                ? 'bg-bonbin-gold text-bonbin-dark'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="text-center text-gray-500 py-12">
          <div className="text-4xl mb-3 animate-spin">⚽</div>
          <p>Memuat pertandingan...</p>
        </div>
      )}

      {!loading && Object.keys(grouped).length === 0 && (
        <div className="text-center text-gray-500 py-12">
          <div className="text-4xl mb-3">🏟️</div>
          <p>{filter === 'unpicked' ? 'Semua sudah ditebak! Keren.' : 'Belum ada pertandingan.'}</p>
        </div>
      )}

      {Object.entries(grouped).map(([date, dayMatches]) => (
        <div key={date} className="mb-6">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 px-1">{date}</h3>
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

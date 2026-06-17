import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const [board, setBoard] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/picks/leaderboard')
      .then(res => setBoard(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="text-center text-gray-500 py-20">
      <div className="text-4xl mb-3 animate-spin">⚽</div>
      <p>Memuat klasemen...</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-4xl">🏆</div>
        <div>
          <h1 className="text-2xl font-bold">Klasemen</h1>
          <p className="text-gray-500 text-sm">Skor tepat = 3 poin · Hasil benar = 1 poin</p>
        </div>
      </div>

      {board.length === 0 && (
        <div className="text-center text-gray-500 py-12">Belum ada data klasemen.</div>
      )}

      <div className="space-y-2">
        {board.map((entry, index) => {
          const isMe = user && entry.username === user.username;
          const rank = index + 1;

          return (
            <div
              key={entry.id}
              className={`card p-4 flex items-center gap-4 transition-all ${
                isMe ? 'border-bonbin-gold ring-1 ring-bonbin-gold/30' : ''
              } ${rank <= 3 ? 'border-gray-700' : ''}`}
            >
              {/* Rank */}
              <div className="w-10 text-center flex-shrink-0">
                {rank <= 3
                  ? <span className="text-2xl">{MEDALS[rank - 1]}</span>
                  : <span className="text-gray-500 font-bold text-lg">{rank}</span>
                }
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-bold truncate ${isMe ? 'text-bonbin-gold' : 'text-white'}`}>
                    {entry.display_name}
                  </span>
                  {isMe && <span className="text-xs bg-bonbin-gold/20 text-bonbin-gold px-2 py-0.5 rounded-full">Kamu</span>}
                </div>
                <div className="flex gap-3 mt-1 text-xs text-gray-500">
                  <span>⚡ {entry.exact_scores} skor tepat</span>
                  <span>✓ {entry.correct_results} hasil benar</span>
                  <span>{entry.total_picks} tebakan</span>
                </div>
              </div>

              {/* Points */}
              <div className="text-right flex-shrink-0">
                <div className={`text-2xl font-bold ${rank === 1 ? 'text-bonbin-gold' : 'text-white'}`}>
                  {entry.total_points}
                </div>
                <div className="text-xs text-gray-500">poin</div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-gray-600 text-xs mt-6">
        Diperbarui otomatis setiap pertandingan selesai
      </p>
    </div>
  );
}

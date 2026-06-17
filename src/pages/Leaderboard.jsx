import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import Avatar from '../components/Avatar';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const [board, setBoard] = useState([]);
  const [winner, setWinner] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    Promise.all([
      api.get('/picks/leaderboard'),
      api.get('/golden-boot/winner').catch(() => ({ data: null })),
    ])
      .then(([boardRes, winnerRes]) => {
        setBoard(boardRes.data);
        setWinner(winnerRes.data || null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="text-center text-maroon-300 py-20">
      <div className="text-4xl mb-3 animate-spin">⚽</div>
      <p>Memuat klasemen...</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-4xl">🏆</div>
        <div>
          <h1 className="text-2xl font-bold text-cream-100">Klasemen</h1>
          <p className="text-maroon-300 text-sm">Skor tepat = 3 poin · Hasil benar = 1–3 poin · Golden Boot = +5 poin</p>
        </div>
      </div>

      {/* Golden Boot winner banner */}
      {winner && (
        <div className="card p-3 mb-5 flex items-center gap-3 border-gold-400/40 bg-gold-400/5">
          <span className="text-2xl">👟</span>
          <div className="flex-1">
            <div className="text-xs text-gold-300 font-bold uppercase tracking-widest">Golden Boot</div>
            <div className="text-sm font-bold text-gold-400">{winner.player_name}</div>
            <div className="text-xs text-maroon-300">{winner.team_name} · {winner.goals} gol</div>
          </div>
          <div className="text-xs text-maroon-300 text-right">+5 poin<br/>bagi yang benar</div>
        </div>
      )}

      {board.length === 0 && (
        <div className="text-center text-maroon-300 py-12">Belum ada data klasemen.</div>
      )}

      <div className="space-y-2">
        {board.map((entry, index) => {
          const isMe = user && entry.username === user.username;
          const rank = index + 1;
          const goldenCorrect = winner && entry.golden_boot_pick &&
            entry.golden_boot_pick === winner.player_name;
          const matchPts = Number(entry.match_points || 0);
          const gbBonus = Number(entry.golden_boot_bonus || 0);
          const totalPts = Number(entry.total_points || 0);

          return (
            <div
              key={entry.id}
              className={`card p-4 flex items-center gap-4 transition-all ${
                isMe ? 'border-gold-400 ring-1 ring-gold-400/30' : ''
              } ${rank <= 3 ? 'border-maroon-600' : ''}`}
            >
              {/* Rank */}
              <div className="w-10 text-center flex-shrink-0">
                {rank <= 3
                  ? <span className="text-2xl">{MEDALS[rank - 1]}</span>
                  : <span className="text-maroon-300 font-bold text-lg">{rank}</span>
                }
              </div>

              {/* Avatar */}
              <Avatar
                src={entry.avatar_base64}
                name={entry.display_name}
                size={40}
                className={isMe ? 'ring-2 ring-gold-400' : ''}
              />

              {/* Name + stats */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`font-bold truncate ${isMe ? 'text-gold-400' : 'text-cream-100'}`}>
                    {entry.display_name}
                  </span>
                  {isMe && <span className="text-xs bg-gold-400/20 text-gold-400 px-2 py-0.5 rounded-full">Kamu</span>}
                </div>
                <div className="flex gap-3 mt-1 text-xs text-maroon-300 flex-wrap">
                  <span>⚡ {entry.exact_scores} tepat</span>
                  <span>✓ {entry.correct_results} benar</span>
                  <span>{entry.total_picks} tebakan</span>
                  {entry.golden_boot_pick && (
                    <span className={`flex items-center gap-1 ${goldenCorrect ? 'text-gold-400' : ''}`}>
                      👟 {entry.golden_boot_pick}
                      {goldenCorrect && ' ✓'}
                    </span>
                  )}
                </div>
              </div>

              {/* Points */}
              <div className="text-right flex-shrink-0">
                <div className={`text-2xl font-bold ${rank === 1 ? 'text-gold-400' : 'text-cream-100'}`}>
                  {Math.round(totalPts * 10) / 10}
                </div>
                {gbBonus > 0 ? (
                  <div className="text-xs text-gold-400">
                    {Math.round(matchPts * 10) / 10} + {gbBonus} 👟
                  </div>
                ) : (
                  <div className="text-xs text-maroon-300">poin</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-center text-maroon-300 text-xs mt-6">
        Diperbarui otomatis setiap pertandingan selesai
      </p>
    </div>
  );
}

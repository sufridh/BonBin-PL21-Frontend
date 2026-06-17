import React, { useState } from 'react';
import api from '../utils/api';

const STATUS_BADGE = {
  scheduled: null,
  live: <span className="bg-red-600 text-white text-xs px-2 py-0.5 rounded-full animate-pulse font-bold">LIVE</span>,
  finished: <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded-full">Selesai</span>,
};

function getResultLabel(points) {
  if (points === 3) return { label: '+3 ✓ Skor Tepat!', cls: 'text-bonbin-gold font-bold' };
  if (points === 1) return { label: '+1 Hasil Benar', cls: 'text-green-400' };
  if (points === 0) return { label: '0 Meleset', cls: 'text-gray-500' };
  return null;
}

export default function MatchCard({ match, onPickSaved }) {
  const [homeInput, setHomeInput] = useState(
    match.home_score_pick != null ? String(match.home_score_pick) : ''
  );
  const [awayInput, setAwayInput] = useState(
    match.away_score_pick != null ? String(match.away_score_pick) : ''
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const locked = match.is_locked || match.status === 'live' || match.status === 'finished';
  const hasPick = match.home_score_pick != null;
  const result = hasPick && match.status === 'finished' ? getResultLabel(match.points_earned) : null;

  const matchDate = new Date(match.match_date);
  const dateStr = matchDate.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
  const timeStr = matchDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }) + ' WIB';

  async function savePick() {
    const h = parseInt(homeInput);
    const a = parseInt(awayInput);
    if (isNaN(h) || isNaN(a)) { setError('Isi kedua skor dulu'); return; }
    if (h < 0 || a < 0) { setError('Skor tidak boleh negatif'); return; }

    setSaving(true);
    setError('');
    try {
      await api.post('/picks', { match_id: match.id, home_score_pick: h, away_score_pick: a });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      if (onPickSaved) onPickSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal simpan');
    } finally {
      setSaving(false);
    }
  }

  const pickChanged = String(match.home_score_pick ?? '') !== homeInput || String(match.away_score_pick ?? '') !== awayInput;

  return (
    <div className={`card p-4 ${match.status === 'live' ? 'border-red-700' : ''}`}>
      {/* Header: stage + date */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500 uppercase tracking-wide">
          {match.group_name || match.stage}
        </span>
        <div className="flex items-center gap-2">
          {STATUS_BADGE[match.status]}
          <span className="text-xs text-gray-500">{dateStr} · {timeStr}</span>
        </div>
      </div>

      {/* Teams + Score */}
      <div className="flex items-center gap-2">
        {/* Home team */}
        <div className="flex-1 flex flex-col items-end">
          <span className="text-2xl">{match.home_flag}</span>
          <span className="text-sm font-semibold text-center leading-tight mt-1">{match.home_team}</span>
        </div>

        {/* Score area */}
        <div className="flex flex-col items-center px-3 min-w-[120px]">
          {match.status === 'finished' || match.status === 'live' ? (
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-bonbin-gold">{match.home_score}</span>
              <span className="text-gray-500">–</span>
              <span className="text-2xl font-bold text-bonbin-gold">{match.away_score}</span>
            </div>
          ) : (
            <div className="text-gray-600 text-lg font-bold">vs</div>
          )}

          {/* Pick input */}
          {!locked ? (
            <div className="flex items-center gap-1 mt-2">
              <input
                type="number"
                min="0" max="20"
                className="w-10 text-center bg-gray-800 border border-gray-600 rounded px-1 py-1 text-sm focus:outline-none focus:border-bonbin-gold"
                value={homeInput}
                onChange={e => setHomeInput(e.target.value)}
                placeholder="0"
              />
              <span className="text-gray-500 text-xs">–</span>
              <input
                type="number"
                min="0" max="20"
                className="w-10 text-center bg-gray-800 border border-gray-600 rounded px-1 py-1 text-sm focus:outline-none focus:border-bonbin-gold"
                value={awayInput}
                onChange={e => setAwayInput(e.target.value)}
                placeholder="0"
              />
            </div>
          ) : hasPick ? (
            <div className="flex items-center gap-1 mt-2 text-gray-400 text-sm">
              <span className="text-white font-bold">{match.home_score_pick}</span>
              <span className="text-gray-600">–</span>
              <span className="text-white font-bold">{match.away_score_pick}</span>
              <span className="text-gray-500 text-xs ml-1">(tebakan)</span>
            </div>
          ) : (
            <p className="text-gray-600 text-xs mt-2">Terkunci</p>
          )}
        </div>

        {/* Away team */}
        <div className="flex-1 flex flex-col items-start">
          <span className="text-2xl">{match.away_flag}</span>
          <span className="text-sm font-semibold leading-tight mt-1">{match.away_team}</span>
        </div>
      </div>

      {/* Save button & result */}
      <div className="mt-3 flex flex-col items-center gap-1">
        {result && <p className={`text-sm ${result.cls}`}>{result.label}</p>}
        {error && <p className="text-red-400 text-xs">{error}</p>}
        {!locked && (
          <button
            className="btn-primary text-sm py-1.5 px-6"
            onClick={savePick}
            disabled={saving || !pickChanged}
          >
            {saving ? 'Menyimpan...' : saved ? '✓ Tersimpan' : hasPick ? 'Update Tebakan' : 'Simpan Tebakan'}
          </button>
        )}
        {match.venue && (
          <p className="text-xs text-gray-600 mt-1">{match.city || match.venue}</p>
        )}
      </div>
    </div>
  );
}

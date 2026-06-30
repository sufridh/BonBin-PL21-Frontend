import React, { useState } from 'react';
import api from '../utils/api';
import Flag from './Flag';

const STATUS_BADGE = {
  scheduled: null,
  live: <span className="bg-gold-400 text-maroon-950 text-xs px-2 py-0.5 rounded-full animate-pulse font-bold">LIVE</span>,
  finished: <span className="bg-maroon-700 text-maroon-300 text-xs px-2 py-0.5 rounded-full">Selesai</span>,
};

function getResultLabel(points) {
  const p = Number(points);
  if (Number.isNaN(p)) return null;
  if (p >= 3) return { label: '+3 ✓ Skor Tepat!', cls: 'text-gold-400 font-bold' };
  if (p > 1) return { label: `+${formatPoints(p)} Hampir Tepat!`, cls: 'text-gold-300 font-bold' };
  if (p === 1) return { label: '+1 Hasil Benar', cls: 'text-gold-200' };
  return { label: '0 Meleset', cls: 'text-maroon-300' };
}

function formatPoints(p) {
  return Number.isInteger(p) ? String(p) : p.toFixed(1);
}

function isKnockoutStage(stage) {
  if (!stage) return false;
  return !stage.toLowerCase().includes('group');
}

export default function MatchCard({ match, onPickSaved }) {
  const [homeInput, setHomeInput] = useState(
    match.home_score_pick != null ? String(match.home_score_pick) : ''
  );
  const [awayInput, setAwayInput] = useState(
    match.away_score_pick != null ? String(match.away_score_pick) : ''
  );
  const [penaltyPick, setPenaltyPick] = useState(match.penalty_pick ?? null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  const locked = match.is_locked || match.status === 'live' || match.status === 'finished';
  const hasPick = match.home_score_pick != null;
  const result = hasPick && match.status === 'finished' ? getResultLabel(match.points_earned) : null;
  const knockout = isKnockoutStage(match.stage);

  const homeVal = parseInt(homeInput);
  const awayVal = parseInt(awayInput);
  const pickIsDraw = !isNaN(homeVal) && !isNaN(awayVal) && homeVal === awayVal;
  const showPenaltyPicker = knockout && !locked && pickIsDraw;

  const matchDate = new Date(match.match_date);
  const dateStr = matchDate.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' });
  const timeStr = matchDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }) + ' WIB';

  async function savePick() {
    const h = parseInt(homeInput);
    const a = parseInt(awayInput);
    if (isNaN(h) || isNaN(a)) { setError('Isi kedua skor dulu'); return; }
    if (h < 0 || a < 0) { setError('Skor tidak boleh negatif'); return; }
    if (knockout && h === a && !penaltyPick) {
      setError('Pilih tim pemenang adu penalti');
      return;
    }

    setSaving(true);
    setError('');
    try {
      await api.post('/picks', {
        match_id: match.id,
        home_score_pick: h,
        away_score_pick: a,
        penalty_pick: (h === a) ? penaltyPick : null,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      if (onPickSaved) onPickSaved();
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal simpan');
    } finally {
      setSaving(false);
    }
  }

  const pickChanged =
    String(match.home_score_pick ?? '') !== homeInput ||
    String(match.away_score_pick ?? '') !== awayInput ||
    (match.penalty_pick ?? null) !== penaltyPick;

  return (
    <div className={`card p-4 ${match.status === 'live' ? 'border-gold-400/70' : ''}`}>
      {/* Header: stage + date */}
      <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
        <span className="text-xs text-maroon-300 uppercase tracking-wide">
          {match.group_name || match.stage}
        </span>
        <div className="flex items-center gap-2 flex-shrink-0">
          {STATUS_BADGE[match.status]}
          <span className="text-xs text-maroon-300">{dateStr} · {timeStr}</span>
        </div>
      </div>

      {/* Teams + Score */}
      <div className="flex items-center gap-2">
        {/* Home team */}
        <div className="flex-1 flex flex-col items-end">
          <Flag team={match.home_team} className="w-8 h-6" />
          <span className="text-sm font-semibold text-center leading-tight mt-1 text-cream-100">{match.home_team}</span>
        </div>

        {/* Score area */}
        <div className="flex flex-col items-center px-2 sm:px-3 min-w-[100px] sm:min-w-[120px] flex-shrink-0">
          {match.status === 'finished' || match.status === 'live' ? (
            <div className="flex flex-col items-center gap-0.5">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-gold-400">{match.home_score}</span>
                <span className="text-maroon-300">–</span>
                <span className="text-2xl font-bold text-gold-400">{match.away_score}</span>
              </div>
              {match.went_to_penalties && (
                <span className="text-xs text-maroon-300 bg-maroon-800 px-2 py-0.5 rounded-full">
                  pen. {match.penalty_winner === 'home' ? match.home_team : match.away_team} ✓
                </span>
              )}
            </div>
          ) : (
            <div className="text-maroon-300 text-lg font-bold">vs</div>
          )}

          {/* Pick input */}
          {!locked ? (
            <div className="flex items-center gap-1 mt-2">
              <input
                type="number"
                min="0" max="20"
                className="w-10 text-center bg-maroon-800 border border-maroon-600 rounded px-1 py-1 text-sm text-cream-100 focus:outline-none focus:border-gold-400"
                value={homeInput}
                onChange={e => setHomeInput(e.target.value)}
                placeholder="0"
              />
              <span className="text-maroon-300 text-xs">–</span>
              <input
                type="number"
                min="0" max="20"
                className="w-10 text-center bg-maroon-800 border border-maroon-600 rounded px-1 py-1 text-sm text-cream-100 focus:outline-none focus:border-gold-400"
                value={awayInput}
                onChange={e => setAwayInput(e.target.value)}
                placeholder="0"
              />
            </div>
          ) : hasPick ? (
            <div className="flex flex-col items-center gap-1 mt-2">
              <div className="flex items-center gap-1 text-sm">
                <span className="text-cream-100 font-bold">{match.home_score_pick}</span>
                <span className="text-maroon-300">–</span>
                <span className="text-cream-100 font-bold">{match.away_score_pick}</span>
                <span className="text-maroon-300 text-xs ml-1">(tebakan)</span>
              </div>
              {/* Show penalty pick on locked cards */}
              {match.penalty_pick && (
                <span className="text-xs text-maroon-300 bg-maroon-800 px-2 py-0.5 rounded-full">
                  🥅 pen: {match.penalty_pick === 'home' ? match.home_team : match.away_team}
                </span>
              )}
            </div>
          ) : (
            <p className="text-maroon-300 text-xs mt-2">Terkunci</p>
          )}
        </div>

        {/* Away team */}
        <div className="flex-1 flex flex-col items-start">
          <Flag team={match.away_team} className="w-8 h-6" />
          <span className="text-sm font-semibold leading-tight mt-1 text-cream-100">{match.away_team}</span>
        </div>
      </div>

      {/* Penalty pick selector (knockout + draw pick only) */}
      {showPenaltyPicker && (
        <div className="mt-3 pt-3 border-t border-maroon-700">
          <p className="text-xs text-maroon-300 text-center mb-2">
            🥅 Seri — siapa menang <span className="text-gold-400 font-medium">adu penalti</span>?
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setPenaltyPick('home')}
              className={`flex-1 max-w-[140px] py-1.5 px-3 rounded-lg text-sm font-medium border transition-colors ${
                penaltyPick === 'home'
                  ? 'bg-gold-400 text-maroon-950 border-gold-400'
                  : 'bg-maroon-800 text-maroon-300 border-maroon-600 hover:border-maroon-500'
              }`}
            >
              {match.home_team}
            </button>
            <button
              onClick={() => setPenaltyPick('away')}
              className={`flex-1 max-w-[140px] py-1.5 px-3 rounded-lg text-sm font-medium border transition-colors ${
                penaltyPick === 'away'
                  ? 'bg-gold-400 text-maroon-950 border-gold-400'
                  : 'bg-maroon-800 text-maroon-300 border-maroon-600 hover:border-maroon-500'
              }`}
            >
              {match.away_team}
            </button>
          </div>
        </div>
      )}

      {/* Save button & result */}
      <div className="mt-3 flex flex-col items-center gap-1">
        {result && <p className={`text-sm ${result.cls}`}>{result.label}</p>}
        {error && <p className="text-gold-200 text-xs">{error}</p>}
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
          <p className="text-xs text-maroon-300 mt-1">{match.city || match.venue}</p>
        )}
      </div>
    </div>
  );
}

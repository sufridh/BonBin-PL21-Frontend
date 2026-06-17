import React, { useState } from 'react';

const EXAMPLES = [
  {
    actual: { home: 2, away: 1 },
    pick:   { home: 2, away: 1 },
    label: 'Skor Tepat',
    points: 3,
    color: 'gold',
    emoji: '🎯',
    note: 'Skor persis cocok',
  },
  {
    actual: { home: 2, away: 1 },
    pick:   { home: 3, away: 1 },
    label: 'Hasil Benar',
    points: 2.5,
    color: 'green',
    emoji: '✅',
    note: 'Menang benar, selisih 1 gol',
  },
  {
    actual: { home: 2, away: 1 },
    pick:   { home: 1, away: 0 },
    label: 'Hasil Benar',
    points: 2,
    color: 'green',
    emoji: '✅',
    note: 'Menang benar, selisih 2 gol',
  },
  {
    actual: { home: 2, away: 1 },
    pick:   { home: 3, away: 2 },
    label: 'Hasil Benar',
    points: 1.5,
    color: 'green',
    emoji: '✅',
    note: 'Menang benar, selisih 3 gol',
  },
  {
    actual: { home: 2, away: 1 },
    pick:   { home: 0, away: 3 },
    label: 'Hasil Salah',
    points: 0,
    color: 'red',
    emoji: '❌',
    note: 'Menebak tim yang salah menang',
  },
];

const BONUS_TABLE = [
  { error: 0, bonus: 2, total: 3, note: '(= Skor Tepat)' },
  { error: 1, bonus: 1.5, total: 2.5, note: '' },
  { error: 2, bonus: 1, total: 2, note: '' },
  { error: 3, bonus: 0.5, total: 1.5, note: '' },
  { error: '4+', bonus: 0, total: 1, note: '' },
];

function ScoreDisplay({ home, away }) {
  return (
    <div className="flex items-center gap-1 font-display text-xl tracking-wider">
      <span className="text-cream-100">{home}</span>
      <span className="text-maroon-300">–</span>
      <span className="text-cream-100">{away}</span>
    </div>
  );
}

function PointBadge({ points, color }) {
  const colors = {
    gold: 'bg-gold-400/20 text-gold-400 border-gold-400/40',
    green: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    red: 'bg-red-500/15 text-red-400 border-red-500/30',
  };
  return (
    <span className={`inline-block border rounded-full px-3 py-0.5 text-sm font-bold ${colors[color]}`}>
      +{points} poin
    </span>
  );
}

export default function HowToScore() {
  const [activeExample, setActiveExample] = useState(null);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="text-4xl">📖</div>
        <div>
          <h1 className="text-2xl font-bold text-cream-100">Cara Hitung Poin</h1>
          <p className="text-maroon-300 text-sm mt-0.5">
            Sistem penilaian pick'em Bonbin PL
          </p>
        </div>
      </div>

      {/* Quick summary */}
      <div className="card p-4">
        <p className="text-maroon-300 text-sm leading-relaxed">
          Setiap pertandingan, kamu menebak skor akhir kedua tim. Poin dihitung berdasarkan
          seberapa akurat tebakanmu — makin dekat ke hasil asli, makin banyak poin yang didapat.
        </p>
      </div>

      {/* Scoring tiers */}
      <div>
        <h2 className="text-sm font-semibold text-maroon-300 uppercase tracking-widest mb-3">Kategori Poin</h2>
        <div className="space-y-3">

          {/* Exact score */}
          <div className="card p-4 border-gold-400/40">
            <div className="flex items-start gap-4">
              <div className="text-3xl flex-shrink-0">🎯</div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-bold text-cream-100 text-base">Skor Tepat</span>
                  <span className="bg-gold-400/20 text-gold-400 border border-gold-400/40 rounded-full px-2.5 py-0.5 text-sm font-bold">
                    3 poin
                  </span>
                </div>
                <p className="text-maroon-300 text-sm">
                  Tebakan <span className="text-cream-100 font-medium">angka skor persis</span> untuk
                  kedua tim.
                </p>
                <div className="mt-2 text-xs text-maroon-300 bg-maroon-800/60 rounded-lg px-3 py-2 inline-block">
                  Contoh: Tebak <span className="text-gold-400 font-bold">2–1</span>, hasil asli <span className="text-gold-400 font-bold">2–1</span> ✓
                </div>
              </div>
            </div>
          </div>

          {/* Correct result */}
          <div className="card p-4">
            <div className="flex items-start gap-4">
              <div className="text-3xl flex-shrink-0">✅</div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-bold text-cream-100 text-base">Hasil Benar</span>
                  <span className="bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-full px-2.5 py-0.5 text-sm font-bold">
                    1 – 3 poin
                  </span>
                </div>
                <p className="text-maroon-300 text-sm">
                  Kamu menebak <span className="text-cream-100 font-medium">tim yang benar menang</span> (atau
                  seri), tapi skornya tidak tepat. Poin yang kamu dapat tergantung seberapa dekat
                  tebakanmu ke skor asli — sistem ini disebut <em className="text-gold-400 not-italic font-medium">distance decay</em>.
                </p>
              </div>
            </div>
          </div>

          {/* Wrong result */}
          <div className="card p-4">
            <div className="flex items-start gap-4">
              <div className="text-3xl flex-shrink-0">❌</div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="font-bold text-cream-100 text-base">Hasil Salah</span>
                  <span className="bg-red-500/15 text-red-400 border border-red-500/30 rounded-full px-2.5 py-0.5 text-sm font-bold">
                    0 poin
                  </span>
                </div>
                <p className="text-maroon-300 text-sm">
                  Kamu menebak <span className="text-cream-100 font-medium">tim yang salah menang</span>, atau
                  menebak seri tapi ternyata ada pemenang (atau sebaliknya).
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Distance decay explained */}
      <div>
        <h2 className="text-sm font-semibold text-maroon-300 uppercase tracking-widest mb-3">
          Detail Poin "Hasil Benar"
        </h2>
        <div className="card p-4">
          <p className="text-maroon-300 text-sm mb-4">
            Kalau kamu benar soal siapa yang menang, poin bonusmu dihitung berdasarkan total
            selisih antara tebakanmu dan skor asli:
          </p>

          {/* Formula */}
          <div className="bg-maroon-800/70 rounded-lg p-3 mb-4 text-center">
            <div className="text-xs text-maroon-300 mb-1">Rumus bonus</div>
            <div className="font-mono text-sm text-cream-100">
              bonus = max(0,  2 − 0.5 × selisih_total)
            </div>
            <div className="text-xs text-maroon-400 mt-1">
              selisih_total = |tebak_home − asli_home| + |tebak_away − asli_away|
            </div>
          </div>

          {/* Bonus table */}
          <div className="overflow-x-auto -mx-1">
            <table className="w-full text-sm min-w-[300px]">
              <thead>
                <tr className="text-maroon-300 text-xs border-b border-maroon-700">
                  <th className="text-left py-2 px-2 font-semibold">Selisih total gol</th>
                  <th className="text-center py-2 px-2 font-semibold">Poin bonus</th>
                  <th className="text-center py-2 px-2 font-semibold">Total poin</th>
                </tr>
              </thead>
              <tbody>
                {BONUS_TABLE.map((row, i) => (
                  <tr
                    key={i}
                    className={`border-b border-maroon-800/60 ${i === 0 ? 'opacity-50' : ''}`}
                  >
                    <td className="py-2 px-2 text-maroon-300">
                      {row.error} gol
                      {row.note && <span className="text-maroon-400 ml-1 text-xs">{row.note}</span>}
                    </td>
                    <td className="py-2 px-2 text-center text-emerald-400 font-medium">+{row.bonus}</td>
                    <td className="py-2 px-2 text-center">
                      <span className={`font-bold ${row.total === 3 ? 'text-gold-400' : row.total >= 2 ? 'text-cream-100' : 'text-maroon-300'}`}>
                        {row.total}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-maroon-400 text-xs mt-3">
            * Baris pertama (selisih 0 gol) hanya mungkin kalau skor tepat — sudah termasuk dalam kategori "Skor Tepat" di atas.
          </p>
        </div>
      </div>

      {/* Examples */}
      <div>
        <h2 className="text-sm font-semibold text-maroon-300 uppercase tracking-widest mb-3">
          Contoh Nyata
        </h2>
        <p className="text-maroon-300 text-xs mb-3">
          Ketuk kartu untuk melihat penjelasannya.
        </p>
        <div className="space-y-2">
          {EXAMPLES.map((ex, i) => {
            const isOpen = activeExample === i;
            const error =
              Math.abs(ex.pick.home - ex.actual.home) +
              Math.abs(ex.pick.away - ex.actual.away);

            return (
              <button
                key={i}
                onClick={() => setActiveExample(isOpen ? null : i)}
                className={`card w-full text-left p-4 transition-all ${isOpen ? 'border-maroon-500' : 'hover:border-maroon-600'}`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-xl flex-shrink-0">{ex.emoji}</div>

                  {/* Pick vs Actual */}
                  <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
                    <div className="text-xs text-maroon-400 w-10 flex-shrink-0">Tebak</div>
                    <ScoreDisplay home={ex.pick.home} away={ex.pick.away} />
                    <span className="text-maroon-500 text-xs mx-1">vs</span>
                    <div className="text-xs text-maroon-400 flex-shrink-0">Asli</div>
                    <ScoreDisplay home={ex.actual.home} away={ex.actual.away} />
                  </div>

                  {/* Points */}
                  <div className="flex-shrink-0">
                    <PointBadge points={ex.points} color={ex.color} />
                  </div>
                </div>

                {/* Expanded detail */}
                {isOpen && (
                  <div className="mt-3 pt-3 border-t border-maroon-700 text-sm text-maroon-300 space-y-1.5">
                    <p className="text-cream-100 font-medium">{ex.label} — {ex.note}</p>
                    {ex.color !== 'red' && ex.color !== 'gold' && (
                      <p>
                        Selisih total: |{ex.pick.home}−{ex.actual.home}| + |{ex.pick.away}−{ex.actual.away}| = <span className="text-cream-100 font-bold">{error} gol</span>
                      </p>
                    )}
                    {ex.color === 'green' && (
                      <p>
                        Bonus: max(0, 2 − 0.5 × {error}) = <span className="text-emerald-400 font-bold">+{Math.max(0, 2 - 0.5 * error)}</span>
                        {' '}→ total <span className="text-cream-100 font-bold">{ex.points} poin</span>
                      </p>
                    )}
                    {ex.color === 'gold' && (
                      <p>Skor persis cocok → <span className="text-gold-400 font-bold">3 poin</span>.</p>
                    )}
                    {ex.color === 'red' && (
                      <p>Hasil salah (tebak menang padahal kalah) → <span className="text-red-400 font-bold">0 poin</span>.</p>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Rules / Notes */}
      <div>
        <h2 className="text-sm font-semibold text-maroon-300 uppercase tracking-widest mb-3">
          Aturan Penting
        </h2>
        <div className="card p-4 space-y-3">
          {[
            {
              icon: '🔒',
              title: 'Tebakan dikunci saat pertandingan mulai',
              desc: 'Tebakan tidak bisa diubah setelah pertandingan dimulai.',
            },
            {
              icon: '✏️',
              title: 'Bisa diubah sebelum dikunci',
              desc: 'Selama pertandingan belum mulai, tebakan masih bisa diperbarui.',
            },
            {
              icon: '📊',
              title: 'Poin masuk setelah pertandingan selesai',
              desc: 'Poin dihitung dan diperbarui di klasemen setelah admin memasukkan skor akhir.',
            },
            {
              icon: '👁️',
              title: 'Tebakan tersembunyi sampai kick-off',
              desc: 'Tebakan peserta lain tidak terlihat sebelum pertandingan dimulai.',
            },
          ].map((rule, i) => (
            <div key={i} className="flex gap-3">
              <div className="text-xl flex-shrink-0 mt-0.5">{rule.icon}</div>
              <div>
                <div className="font-medium text-cream-100 text-sm">{rule.title}</div>
                <div className="text-maroon-300 text-xs mt-0.5 leading-relaxed">{rule.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick reference */}
      <div className="card p-4 bg-maroon-800/50">
        <div className="text-xs font-semibold text-maroon-300 uppercase tracking-widest mb-3">Ringkasan Cepat</div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-gold-400/10 border border-gold-400/30 rounded-xl p-3">
            <div className="text-2xl mb-1">🎯</div>
            <div className="font-display text-2xl text-gold-400">3</div>
            <div className="text-xs text-maroon-300 mt-0.5">Skor Tepat</div>
          </div>
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
            <div className="text-2xl mb-1">✅</div>
            <div className="font-display text-2xl text-emerald-400">1–3</div>
            <div className="text-xs text-maroon-300 mt-0.5">Hasil Benar</div>
          </div>
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
            <div className="text-2xl mb-1">❌</div>
            <div className="font-display text-2xl text-red-400">0</div>
            <div className="text-xs text-maroon-300 mt-0.5">Hasil Salah</div>
          </div>
        </div>
      </div>

    </div>
  );
}

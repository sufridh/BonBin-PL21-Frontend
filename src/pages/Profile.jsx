import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/api';
import MatchCard from '../components/MatchCard';
import Avatar from '../components/Avatar';
import { useAuth } from '../hooks/useAuth';

const MAX_AVATAR_DIMENSION = 320; // resize client-side before upload
const MAX_AVATAR_BYTES = 400 * 1024;

// Resize + compress an image file into a JPEG data URL under the size cap
function fileToAvatarDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('File bukan gambar yang valid'));
      img.onload = () => {
        let { width, height } = img;
        if (width > height) {
          if (width > MAX_AVATAR_DIMENSION) {
            height = Math.round((height * MAX_AVATAR_DIMENSION) / width);
            width = MAX_AVATAR_DIMENSION;
          }
        } else {
          if (height > MAX_AVATAR_DIMENSION) {
            width = Math.round((width * MAX_AVATAR_DIMENSION) / height);
            height = MAX_AVATAR_DIMENSION;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Try decreasing quality until under the size cap
        let quality = 0.85;
        let dataUrl = canvas.toDataURL('image/jpeg', quality);
        while (dataUrl.length * 0.75 > MAX_AVATAR_BYTES && quality > 0.3) {
          quality -= 0.15;
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        if (dataUrl.length * 0.75 > MAX_AVATAR_BYTES) {
          reject(new Error('Gambar masih terlalu besar setelah dikompres'));
          return;
        }
        resolve(dataUrl);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(user?.display_name || '');
  const [nameSaving, setNameSaving] = useState(false);
  const [nameError, setNameError] = useState('');

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

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('Pilih file gambar (PNG, JPG, atau WEBP)');
      return;
    }

    setAvatarError('');
    setAvatarUploading(true);
    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      const res = await api.put('/auth/me', { avatar_base64: dataUrl });
      updateUser({ avatar_base64: res.data.avatar_base64 });
    } catch (err) {
      setAvatarError(err.response?.data?.error || err.message || 'Gagal mengunggah foto');
    } finally {
      setAvatarUploading(false);
    }
  }

  async function handleRemoveAvatar() {
    setAvatarError('');
    setAvatarUploading(true);
    try {
      const res = await api.put('/auth/me', { avatar_base64: null });
      updateUser({ avatar_base64: res.data.avatar_base64 });
    } catch (err) {
      setAvatarError(err.response?.data?.error || 'Gagal menghapus foto');
    } finally {
      setAvatarUploading(false);
    }
  }

  async function saveDisplayName() {
    const trimmed = nameInput.trim();
    if (!trimmed) { setNameError('Nama tidak boleh kosong'); return; }
    setNameSaving(true);
    setNameError('');
    try {
      const res = await api.put('/auth/me', { display_name: trimmed });
      updateUser({ display_name: res.data.display_name });
      setEditingName(false);
    } catch (err) {
      setNameError(err.response?.data?.error || 'Gagal menyimpan nama');
    } finally {
      setNameSaving(false);
    }
  }

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

  const totalPoints = myPicks.reduce((sum, m) => sum + Number(m.points_earned ?? 0), 0);
  const exactScores = myPicks.filter(m => Number(m.points_earned) === 3).length;
  const pending = myPicks.filter(m => m.points_earned == null).length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      {/* Profile header */}
      <div className="card p-5 mb-6 flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <Avatar src={user?.avatar_base64} name={user?.display_name} size={72} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarUploading}
            className="absolute -bottom-1 -right-1 bg-gold-400 text-maroon-950 rounded-full w-7 h-7 flex items-center justify-center text-sm shadow-md hover:bg-gold-300 disabled:opacity-50"
            title="Ganti foto profil"
          >
            {avatarUploading ? '…' : '✎'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        <div className="flex-1 min-w-0">
          {editingName ? (
            <div className="flex items-center gap-2">
              <input
                className="input py-1 text-sm"
                value={nameInput}
                onChange={e => setNameInput(e.target.value)}
                maxLength={100}
                autoFocus
              />
              <button
                onClick={saveDisplayName}
                disabled={nameSaving}
                className="text-xs btn-primary py-1 px-2"
              >
                {nameSaving ? '...' : 'Simpan'}
              </button>
              <button
                onClick={() => { setEditingName(false); setNameInput(user?.display_name || ''); setNameError(''); }}
                className="text-xs text-maroon-300 hover:text-cream-100"
              >
                Batal
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-xl font-bold text-cream-100 truncate">{user?.display_name}</h1>
              <button
                onClick={() => setEditingName(true)}
                className="text-maroon-300 hover:text-gold-400 text-sm flex-shrink-0"
                title="Ubah nama"
              >
                ✎
              </button>
            </div>
          )}
          <p className="text-maroon-300 text-sm">@{user?.username}</p>
          {nameError && <p className="text-gold-200 text-xs mt-1">{nameError}</p>}
          {avatarError && <p className="text-gold-200 text-xs mt-1">{avatarError}</p>}
          {user?.avatar_base64 && !editingName && (
            <button
              onClick={handleRemoveAvatar}
              disabled={avatarUploading}
              className="text-xs text-maroon-300 hover:text-cream-100 mt-1 underline disabled:opacity-50"
            >
              Hapus foto profil
            </button>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="card p-3 text-center">
          <div className="text-2xl font-bold text-gold-400">{myPicks.length}</div>
          <div className="text-xs text-maroon-300">Total Tebakan</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-2xl font-bold text-cream-100">{Math.round(totalPoints * 10) / 10}</div>
          <div className="text-xs text-maroon-300">Poin Terkumpul</div>
        </div>
        <div className="card p-3 text-center">
          <div className="text-2xl font-bold text-gold-300">{exactScores}</div>
          <div className="text-xs text-maroon-300">Skor Tepat</div>
        </div>
      </div>

      <h2 className="text-sm font-bold text-maroon-300 uppercase tracking-widest mb-3">Tebakan Saya</h2>

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

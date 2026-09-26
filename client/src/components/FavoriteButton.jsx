import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function FavoriteButton({ placeId, initialFavorited = false }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    if (!user) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }
    setBusy(true);
    try {
      const { data } = await api.post(`/favorites/${placeId}`);
      setFavorited(data.favorited);
    } catch {
      // Silently ignore — the button just won't toggle if the request fails
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={busy}
      className={`flex items-center gap-1.5 rounded border px-4 py-2 text-sm transition ${
        favorited
          ? 'border-vermilion bg-vermilion/10 text-vermilion'
          : 'border-line text-ink/70 hover:border-ink/30'
      }`}
    >
      <span>{favorited ? '♥' : '♡'}</span>
      {favorited ? 'Liked' : 'Like'}
    </button>
  );
}

import React, { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const TABS = ['Favorites', 'Recently viewed', 'Notifications', 'Profile'];

export default function UserDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('Favorites');
  const [favorites, setFavorites] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([api.get('/favorites'), api.get('/notifications')]).then(
      ([favRes, notifRes]) => {
        if (favRes.status === 'fulfilled') setFavorites(favRes.value.data.data);
        if (notifRes.status === 'fulfilled') setNotifications(notifRes.value.data.data);
        setLoading(false);
      }
    );
  }, []);

  const recentlyViewed = (user?.recentlyViewed || []).filter((r) => r.place);

  if (user?.role === 'admin') return <Navigate to="/admin" replace />;
  if (user?.role === 'business') return <Navigate to="/business/dashboard" replace />;

  return (
    <div className="container-page py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Hi, {user?.name?.split(' ')[0]}</h1>
          <p className="mt-1 text-sm text-ink/55">Your saved places, activity and account settings.</p>
        </div>
        {user?.role === 'business' && (
          <Link to="/business/dashboard" className="rounded border border-line px-4 py-2 text-sm text-ink/70 hover:text-ink">
            Go to business dashboard
          </Link>
        )}
        {user?.role === 'admin' && (
          <Link to="/admin" className="rounded border border-line px-4 py-2 text-sm text-ink/70 hover:text-ink">
            Go to admin dashboard
          </Link>
        )}
      </div>

      <nav className="mt-8 flex gap-1 border-b border-line">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`border-b-2 px-4 py-2.5 text-sm transition ${
              tab === t ? 'border-vermilion font-medium text-ink' : 'border-transparent text-ink/55 hover:text-ink'
            }`}
          >
            {t}
          </button>
        ))}
      </nav>

      <div className="mt-8">
        {loading && <p className="text-sm text-ink/50">Loading…</p>}

        {!loading && tab === 'Favorites' && (
          <>
            {favorites.length === 0 ? (
              <EmptyState text="You haven't favorited anything yet. Look for the heart icon on a listing." />
            ) : (
              <List items={favorites.map((p) => ({ id: p._id, title: p.name, subtitle: p.category?.name }))} />
            )}
          </>
        )}

        {!loading && tab === 'Recently viewed' && (
          <>
            {recentlyViewed.length === 0 ? (
              <EmptyState text="Places you view will show up here." />
            ) : (
              <List
                items={recentlyViewed.map((r) => ({ id: r.place._id, title: r.place.name, subtitle: '' }))}
              />
            )}
          </>
        )}

        {!loading && tab === 'Notifications' && (
          <>
            {notifications.length === 0 ? (
              <EmptyState text="You're all caught up — no notifications yet." />
            ) : (
              <div className="flex flex-col divide-y divide-line rounded border border-line bg-white/40">
                {notifications.map((n) => (
                  <div key={n._id} className={`p-4 ${!n.read ? 'bg-marigold/5' : ''}`}>
                    <div className="text-[15px] font-medium text-ink">{n.title}</div>
                    <div className="mt-0.5 text-sm text-ink/60">{n.message}</div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'Profile' && user && (
          <div className="max-w-sm rounded border border-line bg-white/40 p-5 text-sm">
            <Row label="Name" value={user.name} />
            <Row label="Email" value={user.email} />
            <Row label="Mobile" value={user.mobile} />
            <Row label="Location" value={[user.location?.city, user.location?.district, user.location?.state].filter(Boolean).join(', ')} />
            <Row label="Account type" value={user.role} last />
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value, last }) {
  return (
    <div className={`flex justify-between py-2.5 ${!last ? 'border-b border-line' : ''}`}>
      <span className="text-ink/50">{label}</span>
      <span className="text-ink">{value || '—'}</span>
    </div>
  );
}

function List({ items }) {
  return (
    <div className="flex flex-col divide-y divide-line rounded border border-line bg-white/40">
      {items.map((item) => (
        <Link key={item.id} to={`/place/${item.id}`} className="flex items-center justify-between p-4 hover:bg-white/70">
          <div>
            <div className="font-display text-[15px] font-medium text-ink">{item.title}</div>
            {item.subtitle && <div className="text-xs text-ink/45">{item.subtitle}</div>}
          </div>
          <span className="text-sm text-ink/40">View →</span>
        </Link>
      ))}
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div className="rounded border border-dashed border-line p-10 text-center text-sm text-ink/45">{text}</div>
  );
}

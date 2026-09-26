import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AdminOverview() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/admin/analytics')
      .then(({ data }) => setData(data.data))
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="text-sm text-vermilion">{error}</p>;
  if (!data) return <p className="text-sm text-ink/50">Loading…</p>;

  const cards = [
    { label: 'Total users', value: data.totalUsers },
    { label: 'Business owners', value: data.totalBusinessOwners },
    { label: 'Total listings', value: data.totalPlaces },
    { label: 'Approved listings', value: data.approvedPlaces },
    { label: 'Pending review', value: data.pendingPlaces },
    { label: 'Categories', value: data.totalCategories },
    { label: 'Cities', value: data.totalCities },
    { label: 'Reviews', value: data.totalReviews },
    { label: 'Enquiries', value: data.totalEnquiries },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded border border-line bg-white/50 p-4">
            <div className="font-display text-2xl font-semibold text-ink">{c.value}</div>
            <div className="text-xs text-ink/50">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="font-display text-[15px] font-medium text-ink">Most viewed listings</h3>
          <ul className="mt-3 flex flex-col divide-y divide-line rounded border border-line bg-white/40">
            {data.mostViewed.map((p) => (
              <li key={p._id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="text-ink/80">{p.name}</span>
                <span className="text-ink/45">{p.views} views</span>
              </li>
            ))}
            {data.mostViewed.length === 0 && (
              <li className="px-4 py-3 text-sm text-ink/40">No data yet.</li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="font-display text-[15px] font-medium text-ink">Most searched listings</h3>
          <ul className="mt-3 flex flex-col divide-y divide-line rounded border border-line bg-white/40">
            {data.mostSearchedByAppearance.map((p) => (
              <li key={p._id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <span className="text-ink/80">{p.name}</span>
                <span className="text-ink/45">{p.searchAppearances} appearances</span>
              </li>
            ))}
            {data.mostSearchedByAppearance.length === 0 && (
              <li className="px-4 py-3 text-sm text-ink/40">No data yet.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}

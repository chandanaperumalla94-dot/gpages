import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = () => {
    setLoading(true);
    api
      .get('/admin/users', { params: { search: search || undefined } })
      .then(({ data }) => setUsers(data.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load();
  };

  const toggleStatus = async (user) => {
    const nextStatus = user.status === 'active' ? 'blocked' : 'active';
    await api.put(`/admin/users/${user._id}/status`, { status: nextStatus });
    load();
  };

  const remove = async (user) => {
    if (!window.confirm(`Delete ${user.name}'s account? This cannot be undone.`)) return;
    await api.delete(`/admin/users/${user._id}`);
    load();
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="flex max-w-sm gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or mobile"
          className="flex-1 rounded border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink/40"
        />
        <button className="rounded bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink-light">
          Search
        </button>
      </form>

      {error && <p className="mt-3 text-sm text-vermilion">{error}</p>}
      {loading && <p className="mt-4 text-sm text-ink/50">Loading…</p>}

      <div className="mt-4 overflow-x-auto rounded border border-line bg-white/40">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs text-ink/45">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => (
              <tr key={u._id}>
                <td className="px-4 py-3 text-ink">{u.name}</td>
                <td className="px-4 py-3 text-ink/60">
                  {u.email}
                  <div className="text-xs text-ink/40">{u.mobile}</div>
                </td>
                <td className="px-4 py-3 capitalize text-ink/60">{u.role}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-sm px-2 py-0.5 text-xs ${
                      u.status === 'active' ? 'bg-moss/15 text-moss' : 'bg-vermilion/10 text-vermilion'
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <button onClick={() => toggleStatus(u)} className="text-xs text-ink/60 underline underline-offset-2 hover:text-ink">
                      {u.status === 'active' ? 'Block' : 'Unblock'}
                    </button>
                    <button onClick={() => remove(u)} className="text-xs text-vermilion underline underline-offset-2">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-ink/40">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

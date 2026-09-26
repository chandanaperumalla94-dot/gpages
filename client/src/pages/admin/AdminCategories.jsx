import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const INITIAL_FORM = { name: '', icon: '', description: '', order: '', status: 'active' };

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = () => {
    setLoading(true);
    api
      .get('/categories')
      .then(({ data }) => setCategories(data.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const updateField = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
  };

  const createCategory = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      await api.post('/categories', {
        name: form.name.trim(),
        icon: form.icon.trim() || null,
        description: form.description.trim(),
        order: form.order === '' ? 0 : Number(form.order),
        status: form.status,
      });
      setForm(INITIAL_FORM);
      setMessage('Category added successfully. It is now available on the public Categories page.');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (category) => {
    setError('');
    try {
      await api.put(`/categories/${category._id}`, {
        status: category.status === 'active' ? 'inactive' : 'active',
      });
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  const remove = async (category) => {
    if (!window.confirm(`Delete ${category.name}? This cannot be undone.`)) return;
    setError('');
    try {
      await api.delete(`/categories/${category._id}`);
      load();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <div className="rounded-xl border border-line bg-white/70 p-5 shadow-sm">
        <h2 className="font-display text-lg font-semibold text-ink">Add a category</h2>
        <p className="mt-1 text-sm text-ink/50">New active categories appear automatically in the public Categories page.</p>
        <form onSubmit={createCategory} className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input required value={form.name} onChange={updateField('name')} placeholder="Category name" className="rounded border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink/40" />
          <input value={form.icon} onChange={updateField('icon')} placeholder="Icon, e.g. 🎓" className="rounded border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink/40" />
          <input value={form.description} onChange={updateField('description')} placeholder="Short description" className="rounded border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink/40 lg:col-span-2" />
          <input type="number" min="0" value={form.order} onChange={updateField('order')} placeholder="Display order" className="rounded border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink/40" />
          <select value={form.status} onChange={updateField('status')} className="rounded border border-line bg-white px-3 py-2 text-sm outline-none focus:border-ink/40">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <button disabled={saving} className="rounded bg-ink px-4 py-2 text-sm font-medium text-paper hover:bg-ink-light disabled:opacity-50 sm:w-fit">
            {saving ? 'Adding…' : 'Add category'}
          </button>
        </form>
        {message && <p className="mt-3 text-sm text-moss">{message}</p>}
        {error && <p className="mt-3 text-sm text-vermilion">{error}</p>}
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">Categories</h2>
          <p className="text-sm text-ink/50">{categories.length} categories loaded from MongoDB.</p>
        </div>
        <button onClick={load} className="rounded border border-line bg-white px-3 py-2 text-sm text-ink/70 hover:text-ink">Refresh</button>
      </div>

      {loading ? <p className="mt-4 text-sm text-ink/50">Loading…</p> : (
        <div className="mt-4 overflow-x-auto rounded border border-line bg-white/40">
          <table className="w-full min-w-[650px] text-left text-sm">
            <thead className="border-b border-line text-xs text-ink/45">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Category</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {categories.map((category) => (
                <tr key={category._id}>
                  <td className="px-4 py-3 text-ink/60">{category.order}</td>
                  <td className="px-4 py-3 font-medium text-ink"><span className="mr-2 text-lg">{category.icon || '📌'}</span>{category.name}</td>
                  <td className="max-w-sm px-4 py-3 text-ink/55">{category.description || 'No description'}</td>
                  <td className="px-4 py-3"><span className={`rounded-sm px-2 py-0.5 text-xs ${category.status === 'active' ? 'bg-moss/15 text-moss' : 'bg-ink/10 text-ink/50'}`}>{category.status}</span></td>
                  <td className="px-4 py-3"><div className="flex gap-3"><button onClick={() => toggleStatus(category)} className="text-xs text-ink/60 underline underline-offset-2 hover:text-ink">{category.status === 'active' ? 'Deactivate' : 'Activate'}</button><button onClick={() => remove(category)} className="text-xs text-vermilion underline underline-offset-2">Delete</button></div></td>
                </tr>
              ))}
              {!categories.length && <tr><td colSpan={5} className="px-4 py-6 text-center text-ink/40">No categories found.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

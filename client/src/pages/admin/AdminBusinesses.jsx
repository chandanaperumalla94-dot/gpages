import React, { useEffect, useState } from 'react';
import api from '../../services/api';

const TABS = ['pending', 'approved', 'rejected', 'suspended'];

export default function AdminBusinesses() {
  const [status, setStatus] = useState('pending');
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectingId, setRejectingId] = useState(null);
  const [reason, setReason] = useState('');
  const [actionError, setActionError] = useState('');
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState('');

  const load = () => {
    setLoading(true);
    api
      .get('/admin/businesses', { params: { status } })
      .then(({ data }) => setPlaces(data.data))
      .catch(() => setPlaces([]))
      .finally(() => setLoading(false));
  };

  useEffect(load, [status]);

  const importData = async () => {
    if (!importFile) return;
    setImporting(true);
    setImportMessage('');
    setActionError('');
    try {
      const form = new FormData();
      form.append('file', importFile);
      const { data } = await api.post('/admin/import', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setImportMessage(data.message);
      setImportFile(null);
      load();
    } catch (err) {
      setActionError(err.message);
    } finally {
      setImporting(false);
    }
  };

  const approve = async (id) => {
    setActionError('');
    try {
      await api.put(`/admin/businesses/${id}/approve`);
      load();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const submitReject = async (id) => {
    if (!reason.trim()) {
      setActionError('Please provide a rejection reason.');
      return;
    }
    try {
      await api.put(`/admin/businesses/${id}/reject`, { reason });
      setRejectingId(null);
      setReason('');
      load();
    } catch (err) {
      setActionError(err.message);
    }
  };

  const deleteBusiness = async (place) => {
    if (!window.confirm(`Delete "${place.name}" permanently? This cannot be undone.`)) return;

    setActionError('');
    try {
      await api.delete(`/admin/businesses/${place._id}`);
      load();
    } catch (err) {
      setActionError(err.message);
    }
  };

  return (
    <div>
      <div className="mb-6 rounded-xl border border-line bg-white/70 p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold text-ink">Import places</h2>
            <p className="mt-1 text-xs text-ink/50">Upload JSON or CSV. Required: name, category, state, district, city, address.</p>
          </div>
          <a href="data:text/csv;charset=utf-8,name,category,state,district,city,address,images%0AExample School,schools,Andhra Pradesh,East Godavari,Rajahmundry,Danavaipeta Main Road,%22https://images.unsplash.com/photo-1562774053-701939374585%22" download="google-pages-import-template.csv" className="text-xs text-vermilion underline">Download template</a>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input type="file" accept=".json,.csv,application/json,text/csv" onChange={(e) => setImportFile(e.target.files?.[0] || null)} className="block max-w-full text-sm text-ink/60 file:mr-3 file:rounded file:border-0 file:bg-ink file:px-3 file:py-2 file:text-xs file:font-medium file:text-paper" />
          <button disabled={!importFile || importing} onClick={importData} className="rounded bg-vermilion px-4 py-2 text-sm font-medium text-paper disabled:cursor-not-allowed disabled:opacity-40">{importing ? 'Importing…' : 'Upload to MongoDB'}</button>
        </div>
        {importMessage && <p className="mt-2 text-sm text-moss">{importMessage}</p>}
      </div>
      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setStatus(t)}
            className={`rounded-sm px-3 py-1.5 text-sm capitalize transition ${
              status === t ? 'bg-ink text-paper' : 'bg-white/50 text-ink/60 border border-line hover:text-ink'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {actionError && <p className="mt-3 text-sm text-vermilion">{actionError}</p>}
      {loading && <p className="mt-4 text-sm text-ink/50">Loading…</p>}

      {!loading && places.length === 0 && (
        <p className="mt-6 text-sm text-ink/45">No {status} listings.</p>
      )}

      <div className="mt-4 flex flex-col divide-y divide-line rounded border border-line bg-white/40">
        {places.map((place) => (
          <div key={place._id} className="p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="font-display text-[15px] font-medium text-ink">{place.name}</div>
                <div className="text-xs text-ink/45">
                  {place.category?.name} · {place.location?.city?.name} · owner: {place.owner?.name} ({place.owner?.email})
                </div>
                <p className="mt-1 max-w-lg text-sm text-ink/60">{place.address}</p>
              </div>

              <div className="flex shrink-0 gap-2">
                {status === 'pending' && (
                  <>
                  <button
                    onClick={() => approve(place._id)}
                    className="rounded bg-moss px-3 py-1.5 text-sm font-medium text-paper hover:opacity-90"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setRejectingId(rejectingId === place._id ? null : place._id)}
                    className="rounded border border-vermilion px-3 py-1.5 text-sm font-medium text-vermilion hover:bg-vermilion/5"
                  >
                    Reject
                  </button>
                  </>
                )}
                <button
                  onClick={() => deleteBusiness(place)}
                  className="rounded border border-vermilion px-3 py-1.5 text-sm font-medium text-vermilion hover:bg-vermilion/10"
                >
                  Delete
                </button>
              </div>
            </div>

            {rejectingId === place._id && (
              <div className="mt-3 flex gap-2">
                <input
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Reason for rejection"
                  className="flex-1 rounded border border-line px-3 py-2 text-sm outline-none focus:border-ink/40"
                />
                <button
                  onClick={() => submitReject(place._id)}
                  className="rounded bg-vermilion px-4 py-2 text-sm font-medium text-paper hover:opacity-90"
                >
                  Confirm
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

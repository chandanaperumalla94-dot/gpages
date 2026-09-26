import { useEffect, useState } from 'react';
import api from '../services/api';

/**
 * Resolves the SEO-friendly slugs in the URL (e.g. /andhra-pradesh/east-godavari/rajahmundry)
 * to the underlying Location documents/IDs via GET /api/locations/resolve, so
 * pages can filter Place queries by ObjectId while the URL stays readable.
 */
export default function useResolvedLocation({ state, district, city, area }) {
  const [resolved, setResolved] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!state) return;
    setLoading(true);
    setError('');

    api
      .get('/locations/resolve', { params: { state, district, city, area } })
      .then(({ data }) => setResolved(data.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [state, district, city, area]);

  return { resolved, loading, error };
}

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import PlaceCard from '../components/PlaceCard';
import useDebouncedValue from '../hooks/useDebouncedValue';

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get('q') || '';
  const city = searchParams.get('city') || '';

  const [inputValue, setInputValue] = useState(q);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const debouncedInput = useDebouncedValue(inputValue);

  useEffect(() => {
    if (!q) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const params = { q, limit: 12 };
    if (city) params.city = city;

    api
      .get('/places', { params })
      .then(({ data }) => setPlaces(data.data))
      .catch(() => setPlaces([]))
      .finally(() => setLoading(false));
  }, [q, city]);

  useEffect(() => {
    if (debouncedInput.trim() && debouncedInput.trim() !== q) {
      setSearchParams(city ? { q: debouncedInput.trim(), city } : { q: debouncedInput.trim() });
    }
  }, [debouncedInput]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSearchParams(city ? { q: inputValue, city } : { q: inputValue });
  };

  return (
    <div className="container-page py-10">
      <h1 className="font-display text-2xl font-semibold text-ink">Search</h1>
      <form onSubmit={handleSubmit} className="mt-4 flex max-w-md gap-2">
        <input
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Search hospitals, schools, restaurants…"
          className="flex-1 rounded border border-line bg-white px-3 py-2.5 text-[15px] outline-none focus:border-ink/40"
        />
        <button type="submit" className="rounded bg-ink px-5 py-2.5 text-[15px] font-medium text-paper hover:bg-ink-light">
          Search
        </button>
      </form>

      {q && (
        <p className="mt-6 text-sm text-ink/50">
          {loading ? 'Searching…' : `${places.length} results for "${q}"`}
        </p>
      )}

      {loading ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 animate-pulse rounded border border-line bg-ink/5" />
          ))}
        </div>
      ) : places.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {places.map((place) => (
            <PlaceCard key={place._id} place={place} />
          ))}
        </div>
      ) : q ? (
        <p className="py-14 text-center text-ink/50">No results found. Try a different search term.</p>
      ) : null}
    </div>
  );
}

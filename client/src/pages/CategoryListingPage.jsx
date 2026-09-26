import React, { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useResolvedLocation from '../hooks/useResolvedLocation';
import api from '../services/api';
import PlaceCard from '../components/PlaceCard';
import useDebouncedValue from '../hooks/useDebouncedValue';

export default function CategoryListingPage() {
  const { state, district, city, category: categorySlug } = useParams();
  const { resolved, loading: loadingLocation } = useResolvedLocation({ state, district, city });

  const [category, setCategory] = useState(null);
  const [places, setPlaces] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('rating');
  const [minRating, setMinRating] = useState('');
  const [attrFilters, setAttrFilters] = useState({});
  const [page, setPage] = useState(1);
  const debouncedQuery = useDebouncedValue(query);

  useEffect(() => {
    api
      .get(`/categories/${categorySlug}`)
      .then(({ data }) => setCategory(data.data))
      .catch(() => setCategory(null));
  }, [categorySlug]);

  const cityId = resolved?.city?._id;

  useEffect(() => {
    if (!cityId || !category) return;
    setLoading(true);

    const params = {
      city: cityId,
      category: category._id,
      sort,
      page,
      limit: 24,
    };
    if (debouncedQuery) params.q = debouncedQuery;
    if (minRating) params.rating = minRating;
    Object.entries(attrFilters).forEach(([key, value]) => {
      if (value) params[`attr[${key}]`] = value;
    });

    api
      .get('/places', { params })
      .then(({ data }) => {
        setPlaces(data.data);
        setPagination(data.pagination);
      })
      .catch(() => setPlaces([]))
      .finally(() => setLoading(false));
  }, [cityId, category, sort, minRating, attrFilters, page, debouncedQuery]);

  const cityName = resolved?.city?.name;

  const heading = useMemo(
    () => (category && cityName ? `${category.name} in ${cityName}` : 'Loading…'),
    [category, cityName]
  );

  if (loadingLocation) {
    return <div className="container-page py-20 text-center text-ink/50">Loading…</div>;
  }

  return (
    <div className="container-page py-10">
      <p className="text-sm text-ink/50">
        <Link to={`/${state}/${district}/${city}`} className="hover:text-ink">
          {cityName}
        </Link>{' '}
        › {category?.name}
      </p>
      <h1 className="mt-1 font-display text-3xl font-semibold text-ink">{heading}</h1>

      <div className="mt-6 grid gap-8 lg:grid-cols-[240px_1fr]">
        {/* Filters sidebar — reusable and configurable per category via Category.filters */}
        <aside className="h-fit rounded-xl border border-line bg-white/70 p-4 shadow-sm lg:sticky lg:top-24">
          <div className="mb-4 flex items-center justify-between">
            <span className="font-display text-base font-semibold text-ink">Refine results</span>
            {(minRating || Object.keys(attrFilters).length > 0) && (
              <button onClick={() => { setMinRating(''); setAttrFilters({}); setPage(1); }} className="text-xs text-vermilion">Clear</button>
            )}
          </div>
          <div className="flex flex-col gap-5">
          <div>
            <label className="text-sm text-ink/70">Search</label>
            <input
              value={query}
              onChange={(e) => {
                setPage(1);
                setQuery(e.target.value);
              }}
              placeholder="Name, area, keyword…"
              className="mt-1 w-full rounded border border-line bg-white px-3 py-2 text-[14px] outline-none focus:border-ink/40"
            />
          </div>

          <div>
            <label className="text-sm text-ink/70">Minimum rating</label>
            <select
              value={minRating}
              onChange={(e) => {
                setPage(1);
                setMinRating(e.target.value);
              }}
              className="mt-1 w-full rounded border border-line bg-white px-3 py-2 text-[14px] outline-none focus:border-ink/40"
            >
              <option value="">Any rating</option>
              <option value="4">4+ stars</option>
              <option value="3">3+ stars</option>
            </select>
          </div>

          {category?.filters?.map((f) => (
            <div key={f.key}>
              <label className="text-sm text-ink/70">{f.label}</label>
              {f.type === 'boolean' ? (
                <select
                  value={attrFilters[f.key] || ''}
                  onChange={(e) => {
                    setPage(1);
                    setAttrFilters({ ...attrFilters, [f.key]: e.target.value });
                  }}
                  className="mt-1 w-full rounded border border-line bg-white px-3 py-2 text-[14px] outline-none focus:border-ink/40"
                >
                  <option value="">Any</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              ) : (
                <select
                  value={attrFilters[f.key] || ''}
                  onChange={(e) => {
                    setPage(1);
                    setAttrFilters({ ...attrFilters, [f.key]: e.target.value });
                  }}
                  className="mt-1 w-full rounded border border-line bg-white px-3 py-2 text-[14px] outline-none focus:border-ink/40"
                >
                  <option value="">Any</option>
                  {f.options?.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}
            </div>
          ))}
          </div>
        </aside>

        <div>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
            <span className="text-sm text-ink/50">{loading ? 'Finding places…' : `${pagination.total} complete results`}</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded border border-line bg-white px-3 py-1.5 text-sm outline-none"
            >
              <option value="rating">Highest rated</option>
              <option value="newest">Newest</option>
              <option value="popular">Most popular</option>
            </select>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-56 animate-pulse rounded border border-line bg-ink/5" />
              ))}
            </div>
          ) : places.length === 0 ? (
            <p className="py-14 text-center text-ink/50">
              No listings match your filters yet. Try widening your search.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 pt-6 sm:grid-cols-2 xl:grid-cols-3">
              {places.map((place) => (
                <PlaceCard key={place._id} place={place} />
              ))}
            </div>
          )}

          {pagination.pages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: pagination.pages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`h-8 w-8 rounded text-sm ${
                    page === i + 1 ? 'bg-ink text-paper' : 'border border-line text-ink/60 hover:border-ink/30'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

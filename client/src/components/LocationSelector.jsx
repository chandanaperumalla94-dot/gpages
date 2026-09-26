import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const FIELD_ORDER = ['state', 'district', 'city', 'area'];

/** Helper to safely extract list data regardless of response wrapping */
function extractList(res) {
  const body = res?.data;
  if (Array.isArray(body?.data)) return body.data;
  if (Array.isArray(body)) return body;
  if (Array.isArray(res)) return res;
  return [];
}

function Field({ label, value, onChange, options = [], disabled, placeholder, loading }) {
  return (
    <div className="min-w-0 flex flex-1 flex-col gap-1 px-3 py-2 first:pl-0 sm:px-4 sm:py-2.5 sm:border-l sm:border-line sm:first:border-l-0">
      <label className="text-[11px] tracking-wide text-ink/45">{label}</label>
      <select
        value={value}
        disabled={disabled || loading}
        onChange={(e) => onChange(e.target.value)}
        className="w-full min-w-0 appearance-none bg-transparent font-display text-sm font-medium text-ink outline-none disabled:text-ink/30 cursor-pointer disabled:cursor-not-allowed sm:text-[15px]"
      >
        <option value="">{loading ? `Loading...` : placeholder}</option>
        {(options || []).map((opt) => (
          <option key={opt._id} value={opt._id} data-slug={opt.slug} data-name={opt.name}>
            {opt.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function LocationSelector() {
  const navigate = useNavigate();
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [cities, setCities] = useState([]);
  const [areas, setAreas] = useState([]);

  const [loading, setLoading] = useState({
    state: false,
    district: false,
    city: false,
    area: false,
  });

  const [selected, setSelected] = useState({ state: '', district: '', city: '', area: '' });
  const [slugs, setSlugs] = useState({ state: '', district: '', city: '', area: '' });

  // Fetch active states on mount
  useEffect(() => {
    let isMounted = true;
    setLoading((prev) => ({ ...prev, state: true }));

    api
      .get('/locations/states')
      .then((res) => {
        if (!isMounted) return;
        const list = extractList(res);
        setStates(list);
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('[LocationSelector] Failed to fetch states:', err);
        setStates([]);
      })
      .finally(() => {
        if (isMounted) setLoading((prev) => ({ ...prev, state: false }));
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch districts when state changes
  useEffect(() => {
    if (!selected.state) {
      setDistricts([]);
      return;
    }
    let isMounted = true;
    setLoading((prev) => ({ ...prev, district: true }));

    api
      .get(`/locations/districts/${selected.state}`)
      .then((res) => {
        if (!isMounted) return;
        setDistricts(extractList(res));
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('[LocationSelector] Failed to fetch districts:', err);
        setDistricts([]);
      })
      .finally(() => {
        if (isMounted) setLoading((prev) => ({ ...prev, district: false }));
      });

    return () => {
      isMounted = false;
    };
  }, [selected.state]);

  // Fetch cities when district changes
  useEffect(() => {
    if (!selected.district) {
      setCities([]);
      return;
    }
    let isMounted = true;
    setLoading((prev) => ({ ...prev, city: true }));

    api
      .get(`/locations/cities/${selected.district}`)
      .then((res) => {
        if (!isMounted) return;
        setCities(extractList(res));
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('[LocationSelector] Failed to fetch cities:', err);
        setCities([]);
      })
      .finally(() => {
        if (isMounted) setLoading((prev) => ({ ...prev, city: false }));
      });

    return () => {
      isMounted = false;
    };
  }, [selected.district]);

  // Fetch areas when city changes
  useEffect(() => {
    if (!selected.city) {
      setAreas([]);
      return;
    }
    let isMounted = true;
    setLoading((prev) => ({ ...prev, area: true }));

    api
      .get(`/locations/areas/${selected.city}`)
      .then((res) => {
        if (!isMounted) return;
        setAreas(extractList(res));
      })
      .catch((err) => {
        if (!isMounted) return;
        console.error('[LocationSelector] Failed to fetch areas:', err);
        setAreas([]);
      })
      .finally(() => {
        if (isMounted) setLoading((prev) => ({ ...prev, area: false }));
      });

    return () => {
      isMounted = false;
    };
  }, [selected.city]);

  const handleChange = (level) => (id) => {
    const optionsList = { state: states, district: districts, city: cities, area: areas }[level] || [];
    const match = optionsList.find((o) => o._id === id);

    const resetFrom = FIELD_ORDER.indexOf(level) + 1;
    setSelected((prev) => {
      const next = { ...prev, [level]: id };
      FIELD_ORDER.slice(resetFrom).forEach((f) => (next[f] = ''));
      return next;
    });
    setSlugs((prev) => {
      const next = { ...prev, [level]: match?.slug || '' };
      FIELD_ORDER.slice(resetFrom).forEach((f) => (next[f] = ''));
      return next;
    });
  };

  const canExplore = Boolean(selected.state && selected.district && selected.city);

  const handleExplore = () => {
    if (!canExplore) return;
    const path = `/${slugs.state}/${slugs.district}/${slugs.city}`;
    // Area narrows results on the city page rather than adding a URL segment,
    // since /state/district/city/<category> already occupies that 4th slot.
    navigate(slugs.area ? `${path}?area=${slugs.area}` : path);
  };

  return (
    <div className="rounded-md border border-line bg-white/70 p-2 shadow-[0_1px_0_0_#D9D2C2] sm:p-2">
      <div className="flex flex-col sm:flex-row sm:items-stretch">
        <Field
          label="State"
          value={selected.state}
          onChange={(id) => handleChange('state')(id)}
          options={states}
          loading={loading.state}
          placeholder="Select state"
        />
        <Field
          label="District"
          value={selected.district}
          onChange={(id) => handleChange('district')(id)}
          options={districts}
          disabled={!selected.state}
          loading={loading.district}
          placeholder="Select district"
        />
        <Field
          label="City"
          value={selected.city}
          onChange={(id) => handleChange('city')(id)}
          options={cities}
          disabled={!selected.district}
          loading={loading.city}
          placeholder="Select city"
        />
        <Field
          label="Area (optional)"
          value={selected.area}
          onChange={(id) => handleChange('area')(id)}
          options={areas}
          disabled={!selected.city}
          loading={loading.area}
          placeholder="Select area"
        />
        <div className="flex items-center px-2 pt-2 sm:pt-0">
          <button
            onClick={handleExplore}
            disabled={!canExplore}
            className="w-full whitespace-nowrap rounded bg-vermilion px-4 py-2.5 text-sm font-medium text-paper transition hover:bg-vermilion/90 disabled:cursor-not-allowed disabled:bg-ink/15 disabled:text-ink/40 sm:w-auto sm:px-6 sm:py-3 sm:text-[15px]"
          >
            Explore now
          </button>
        </div>
      </div>
    </div>
  );
}

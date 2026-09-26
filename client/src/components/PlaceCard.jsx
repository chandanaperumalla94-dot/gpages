import React from 'react';
import { Link } from 'react-router-dom';
import { resolveFoodBusinessType } from './public/PublicProfileShared';

const FALLBACK_IMAGES = {
  schools: 'https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=900&q=80',
  hospitals: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&w=900&q=80',
  restaurants: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80',
  default: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80',
};

function Stars({ value }) {
  return (
    <span className="text-marigold-dark" aria-label={`${value} out of 5 stars`}>
      {'★'.repeat(Math.round(value))}
      <span className="text-line">{'★'.repeat(5 - Math.round(value))}</span>
    </span>
  );
}

export default function PlaceCard({ place }) {
  const categoryKey = place.category?.slug || place.category?.name?.toLowerCase();
  const fallbackImage = FALLBACK_IMAGES[categoryKey] || FALLBACK_IMAGES.default;
  const cover = place.coverImage || place.images?.[0] || fallbackImage;
  const profileUrl = resolveFoodBusinessType(place) ? `/business/${place._id}` : `/place/${place._id}`;

  return (
    <Link
      to={profileUrl}
      className="group flex flex-col overflow-hidden rounded-lg border border-line bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
    >
      <div className="relative flex h-36 items-center justify-center overflow-hidden bg-ink/5">
        <img src={cover} alt={`${place.name} image`} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
        {place.verified && (
          <span className="absolute left-2 top-2 rounded bg-moss px-2 py-0.5 text-[11px] font-medium text-paper">
            Verified
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-[15px] font-semibold leading-snug text-ink group-hover:text-blue-700">
            {place.name}
          </h3>
        </div>

        {place.category?.name && (
          <span className="text-xs text-ink/45">{place.category.name}</span>
        )}

        <p className="line-clamp-1 text-[13px] text-ink/55">📍 {place.address}</p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex items-center gap-1.5 text-[13px]">
            <Stars value={place.rating?.average || 0} />
            <span className="text-ink/45">({place.rating?.count || 0})</span>
          </div>
          <span className="text-[12px] font-semibold text-blue-600 group-hover:text-blue-800">
            View details →
          </span>
        </div>
      </div>
    </Link>
  );
}

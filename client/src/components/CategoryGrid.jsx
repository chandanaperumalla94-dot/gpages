import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { CATEGORY_GROUPS, CATEGORY_ICONS, slugifyCategory } from '../data/categoryGroups';
import GroupedCategoryGrid from './GroupedCategoryGrid';

const ICONS = CATEGORY_ICONS;

/**
 * Categories are never hard-coded — they're fetched from MongoDB via
 * /api/categories so admins can add/edit/disable categories without a
 * frontend deploy.
 */
export default function CategoryGrid() {
  const fallbackCategories = useMemo(
    () =>
      CATEGORY_GROUPS.flatMap((group) =>
        group.children.map((name) => ({
          _id: slugifyCategory(name),
          name,
          slug: slugifyCategory(name),
          description: `${name} in our directory.`,
        }))
      ),
    []
  );

  const [categories, setCategories] = useState(fallbackCategories);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/categories')
      .then(({ data }) => {
        const nextCategories = Array.isArray(data?.data) ? data.data : fallbackCategories;
        setCategories(nextCategories);
      })
      .catch(() => setCategories(fallbackCategories))
      .finally(() => setLoading(false));
  }, [fallbackCategories]);

  return (
    <section className="border-b border-line bg-[#f7fbff] py-14 sm:py-16">
      <div className="container-page">
        <div className="flex items-end justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">Explore smarter</p><h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink">What are you looking for?</h2><p className="mt-1 text-sm text-ink/55">Find trusted places in a category that matters to you.</p></div>
          <Link to="/categories" className="hidden rounded-full border border-blue-100 bg-white px-4 py-2 text-sm font-semibold text-blue-600 shadow-sm hover:bg-blue-50 sm:block">
            View all categories →
          </Link>
        </div>

        {loading && <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {loading &&
            Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-28 animate-pulse rounded-2xl border border-line bg-white" />
            ))}
        </div>}

        {!loading && categories.length === 0 &&
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex h-28 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line text-ink/30"
              >
                <span className="text-xs">Add categories in admin</span>
              </div>
            ))}
          </div>}

        {!loading && categories.length > 0 && <GroupedCategoryGrid categories={categories} />}
      </div>
    </section>
  );
}

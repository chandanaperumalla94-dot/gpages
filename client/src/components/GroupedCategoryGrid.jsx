import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORY_GROUPS, CATEGORY_ICONS, slugifyCategory } from '../data/categoryGroups';

export default function GroupedCategoryGrid({ categories, cityPath = '' }) {
  const [openGroup, setOpenGroup] = useState(null);
  const categoriesByName = useMemo(
    () => new Map(categories.map((category) => [category.name.toLowerCase(), category])),
    [categories]
  );

  const visibleGroups = CATEGORY_GROUPS.map((group) => ({
    ...group,
    children: group.children.filter((name) => categoriesByName.has(name.toLowerCase())),
  })).filter((group) => group.children.length > 0);

  const selectedGroup = visibleGroups.find((group) => group.name === openGroup);

  const renderGroup = (group, index) => {
    const isOpen = openGroup === group.name;

    return (
      <div
        key={group.name}
        className={`${
          isOpen
            ? 'border-[#d9e6ef] bg-[#f6fbff] shadow-[0_12px_25px_rgba(16,42,67,0.06)]'
            : 'border-[#dfeaf0] bg-white'
        } rounded-[18px] border p-3 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_22px_rgba(16,42,67,0.08)]`}
      >
        <button type="button" onClick={() => setOpenGroup((current) => (current === group.name ? null : group.name))} className="flex min-h-[76px] w-full items-center justify-between gap-3 text-left">
          <span className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#dcf2f7] text-lg text-[#2d6d7d] shadow-sm">
              {CATEGORY_ICONS[group.children[0]] || '📌'}
            </span>
            <span className="block text-[12px] font-semibold uppercase tracking-[0.12em] text-[#4f6e85]">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span className="block font-display text-[19px] font-semibold leading-tight text-[#17314e]">
              {group.name}
            </span>
          </span>
          <span className="text-[30px] font-light leading-none text-[#1d2d3b]/75" aria-hidden="true">{isOpen ? '−' : '+'}</span>
        </button>

        <div className={`${isOpen ? 'mt-1 max-h-[800px] opacity-100' : 'max-h-0 opacity-0'} overflow-hidden transition-all duration-300`}>
          <div className="border-t border-[#e2edf3] pt-3">
            {group.children.map((child) => {
              const category = categoriesByName.get(child.toLowerCase());
              const categoryPath = category?.slug || slugifyCategory(child);
              const targetPath = cityPath ? `${cityPath}/${categoryPath}` : `/categories/${categoryPath}`;

              return (
                <Link
                  key={child}
                  to={targetPath}
                  className="flex items-center justify-between rounded-xl border border-[#e3edf5] bg-white px-3 py-2.5 text-sm text-ink/70 transition-all hover:text-vermilion"
                >
                  <span><span className="mr-2">{CATEGORY_ICONS[child] || '•'}</span>{child}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`mt-8 grid gap-4 ${selectedGroup ? 'md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
      {selectedGroup ? (
        <>
          <div className="md:row-span-full">{renderGroup(selectedGroup, visibleGroups.indexOf(selectedGroup))}</div>
          <div className="grid gap-4 sm:grid-cols-2">
            {visibleGroups.filter((group) => group.name !== selectedGroup.name).map((group) => renderGroup(group, visibleGroups.indexOf(group)))}
          </div>
        </>
      ) : visibleGroups.map(renderGroup)}
    </div>
  );
}

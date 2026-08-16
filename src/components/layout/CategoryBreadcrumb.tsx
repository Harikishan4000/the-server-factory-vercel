'use client';

import { Fragment, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CategoryNode } from '@/lib/categories';

export type Crumb = {
  label: string;
  /** null = current page, rendered as plain text */
  href: string | null;
  /** sub-categories revealed in the hover flyout */
  children: CategoryNode[];
};

/**
 * Breadcrumb where every crumb with sub-categories opens a two-column flyout on hover:
 * left column lists the direct children, hovering one slides out its own children on the right.
 */
export function CategoryBreadcrumb({ crumbs }: { crumbs: Crumb[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const pathname = usePathname();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setOpenIdx(null); }, [pathname]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenIdx(null);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  // Delayed close — gives the mouse time to travel from crumb to panel
  function cancelClose() {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
  }
  function scheduleClose() {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpenIdx(null), 150);
  }

  const collapses = crumbs.length > 3;

  return (
    <nav className="mb-4 flex flex-wrap items-center gap-1 text-xs text-ink-muted dark:text-gray-400 md:mb-6 md:text-sm">
      {crumbs.map((crumb, idx) => {
        const hasMenu = crumb.children.length > 0;
        const isOpen = openIdx === idx;
        const isLast = idx === crumbs.length - 1;
        // A deep trail wraps onto three lines on a 320px screen — keep Home, the parent
        // category and the current page, and fold the rest away until there's width for them.
        const collapsed = collapses && idx > 0 && idx < crumbs.length - 2;

        return (
          <Fragment key={`${crumb.label}-${idx}`}>
            {idx > 0 && <ChevronRight className={cn('h-3 w-3 flex-shrink-0 opacity-50', collapsed && 'hidden sm:block')} />}
            <div
              className={cn('relative', collapsed && 'hidden sm:block')}
              onMouseEnter={() => { cancelClose(); if (hasMenu) setOpenIdx(idx); }}
              onMouseLeave={scheduleClose}
            >
              <div className="flex items-center gap-0.5">
                {crumb.href ? (
                  <Link
                    href={crumb.href}
                    className={cn('rounded px-1 py-0.5 transition-colors hover:text-brand', isOpen && 'text-brand')}
                  >
                    {crumb.label}
                  </Link>
                ) : (
                  <span className={cn('px-1 py-0.5', isLast && 'text-ink dark:text-gray-200')}>{crumb.label}</span>
                )}
                {hasMenu && (
                  <ChevronDown
                    className={cn('h-3 w-3 flex-shrink-0 opacity-50 transition-transform', isOpen && 'rotate-180 text-brand opacity-100')}
                  />
                )}
              </div>

              {/* Hover-only affordance, so it stays out of the way on touch layouts */}
              {hasMenu && isOpen && (
                <div
                  className="absolute left-0 top-full z-40 hidden lg:block"
                  onMouseEnter={cancelClose}
                  onMouseLeave={scheduleClose}
                >
                  {/* Invisible bridge so the mouse can travel from crumb to panel without hover loss */}
                  <div className="h-2" />
                  <FlyoutPanel nodes={crumb.children} />
                </div>
              )}
            </div>

            {/* Stands in for the middle crumbs folded away on phones */}
            {idx === 0 && collapses && (
              <span className="flex items-center gap-1 sm:hidden">
                <ChevronRight className="h-3 w-3 flex-shrink-0 opacity-50" />
                <span className="select-none">…</span>
              </span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}

function FlyoutPanel({ nodes }: { nodes: CategoryNode[] }) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = nodes.find((n) => n.id === activeId);

  return (
    <div className="flex max-w-[min(28rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900">
      <div className="max-h-[60vh] w-52 flex-shrink-0 overflow-y-auto p-2 xl:w-56">
        {nodes.map((n) => (
          <Link
            key={n.id}
            href={`/category/${n.slug}`}
            onMouseEnter={() => setActiveId(n.id)}
            className={cn(
              'flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              activeId === n.id
                ? 'bg-brand-50 text-brand dark:bg-gray-800'
                : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-800'
            )}
          >
            <span className="truncate">{n.name}</span>
            {n.children.length > 0 && <ChevronRight className="h-3.5 w-3.5 flex-shrink-0 opacity-60" />}
          </Link>
        ))}
      </div>

      {active && active.children.length > 0 && (
        <div className="max-h-[60vh] w-52 flex-shrink-0 overflow-y-auto border-l border-gray-100 p-2 dark:border-gray-800 xl:w-56">
          <p className="px-3 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-muted dark:text-gray-500">
            {active.name}
          </p>
          {active.children.map((c) => (
            <Link
              key={c.id}
              href={`/category/${c.slug}`}
              className="block truncate rounded-lg px-3 py-2 text-sm text-gray-600 transition-colors hover:bg-brand-50 hover:text-brand dark:text-gray-400 dark:hover:bg-gray-800"
            >
              {c.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

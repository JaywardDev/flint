"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Mobile-only primary navigation. Stays fixed to the bottom of the viewport so
 * capture is always one tap away regardless of scroll position. Add is the
 * centre, raised, ember action — visually primary over Records and Search. The
 * desktop header (AppHeader) covers larger screens, so this is hidden at `sm`.
 */
export function BottomNav() {
  const pathname = usePathname();

  // Home is itself a capture surface, so Add reads as active there too.
  const addActive = pathname === "/" || pathname === "/add";
  const recordsActive = pathname === "/records" || pathname.startsWith("/records/");
  const timelineActive = pathname === "/timeline" || pathname.startsWith("/timeline/");
  const sparksActive = pathname === "/sparks" || pathname.startsWith("/sparks/");
  const searchActive = pathname === "/search" || pathname.startsWith("/search/");

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-parchment-border bg-parchment-raised/95 backdrop-blur sm:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto flex max-w-3xl items-end justify-around px-4 pb-2 pt-1.5">
        <SideItem href="/records" label="Records" active={recordsActive}>
          <ListIcon />
        </SideItem>

        <SideItem href="/timeline" label="Timeline" active={timelineActive}>
          <TimelineIcon />
        </SideItem>

        <Link
          href="/add"
          aria-label="Add a record"
          aria-current={addActive ? "page" : undefined}
          className="-mt-6 flex flex-1 flex-col items-center gap-1"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-ember text-obsidian shadow-[0_6px_16px_rgba(26,26,29,0.18)] ring-4 ring-parchment transition active:scale-95">
            <PlusIcon />
          </span>
          <span className="text-xs font-semibold text-obsidian">Add</span>
        </Link>

        <SideItem href="/sparks" label="Sparks" active={sparksActive}>
          <SparkIcon />
        </SideItem>

        <SideItem href="/search" label="Search" active={searchActive}>
          <SearchIcon />
        </SideItem>
      </div>
    </nav>
  );
}

function SideItem({
  href,
  label,
  active,
  children,
}: {
  href: string;
  label: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg py-1 text-xs font-medium transition ${
        active ? "text-obsidian" : "text-stone-warm"
      }`}
    >
      <span aria-hidden className={active ? "text-ember" : "text-stone-warm"}>
        {children}
      </span>
      {label}
    </Link>
  );
}

function ListIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M8 6h12M8 12h12M8 18h12" />
      <path d="M3.5 6h.01M3.5 12h.01M3.5 18h.01" />
    </svg>
  );
}

function TimelineIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M4 21h16" />
      <path d="M7 21v-6" />
      <path d="M12 21v-11" />
      <path d="M17 21v-8" />
    </svg>
  );
}

function SparkIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2.5 13.9 9.3 21 12 13.9 14.7 12 21.5 10.1 14.7 3 12 10.1 9.3z" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

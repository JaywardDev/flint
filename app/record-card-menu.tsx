"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";

import { deleteRecordAction } from "./record-actions";

type RecordCardMenuProps = {
  recordId: string;
};

type RecordMenuOpenEvent = CustomEvent<{ menuId: string }>;

const MENU_OPEN_EVENT = "flint-record-menu-open";

export function RecordCardMenu({ recordId }: RecordCardMenuProps) {
  const router = useRouter();
  const reactId = useId();
  const menuId = `record-menu-${reactId}`;
  const confirmId = `record-delete-${reactId}`;
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [error, setError] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (confirmOpen) {
      requestAnimationFrame(() => cancelRef.current?.focus());
    }
  }, [confirmOpen]);

  useEffect(() => {
    function closeForOutsidePointer(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        closeMenu(false);
      }
    }

    function closeForEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeMenu(true);
      }
    }

    function closeForOtherMenu(event: Event) {
      const openEvent = event as RecordMenuOpenEvent;
      if (openEvent.detail.menuId !== menuId) {
        closeMenu(false);
      }
    }

    document.addEventListener("pointerdown", closeForOutsidePointer);
    document.addEventListener("keydown", closeForEscape);
    document.addEventListener(MENU_OPEN_EVENT, closeForOtherMenu);

    return () => {
      document.removeEventListener("pointerdown", closeForOutsidePointer);
      document.removeEventListener("keydown", closeForEscape);
      document.removeEventListener(MENU_OPEN_EVENT, closeForOtherMenu);
    };
  }, [menuId]);

  function closeMenu(restoreFocus: boolean) {
    setMenuOpen(false);
    setConfirmOpen(false);
    setError(false);

    if (restoreFocus) {
      requestAnimationFrame(() => triggerRef.current?.focus());
    }
  }

  function toggleMenu() {
    setError(false);
    setConfirmOpen(false);
    setMenuOpen((open) => {
      const nextOpen = !open;

      if (nextOpen) {
        document.dispatchEvent(
          new CustomEvent(MENU_OPEN_EVENT, { detail: { menuId } }),
        );
      }

      return nextOpen;
    });
  }

  function showDeleteConfirmation() {
    setMenuOpen(false);
    setConfirmOpen(true);
    setError(false);
  }

  function confirmDelete() {
    setError(false);
    startTransition(async () => {
      const result = await deleteRecordAction(recordId);

      if (result.status === "deleted") {
        closeMenu(false);
        router.refresh();
      } else {
        setError(true);
      }
    });
  }

  return (
    <div ref={rootRef} className="absolute right-3 top-3 z-10">
      <button
        ref={triggerRef}
        type="button"
        aria-label="Record options"
        aria-expanded={menuOpen || confirmOpen}
        aria-controls={menuOpen ? menuId : confirmOpen ? confirmId : undefined}
        onClick={toggleMenu}
        className="px-1.5 py-1 text-lg leading-none text-stone-soft/80 transition hover:text-stone-warm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember focus-visible:ring-offset-2 focus-visible:ring-offset-parchment-raised"
      >
        <span aria-hidden>⋮</span>
      </button>

      {menuOpen ? (
        <div
          id={menuId}
          role="menu"
          aria-label="Record actions"
          className="absolute right-0 mt-1 w-28 rounded-lg border border-parchment-border bg-parchment-raised px-1 py-1 text-sm shadow-sm"
        >
          <Link
            href={`/records/${recordId}/edit`}
            role="menuitem"
            onClick={() => closeMenu(false)}
            className="block rounded-md px-3 py-2 text-stone-warm transition hover:bg-parchment hover:text-obsidian focus:bg-parchment focus:text-obsidian focus:outline-none"
          >
            Edit
          </Link>
          <button
            type="button"
            role="menuitem"
            onClick={showDeleteConfirmation}
            className="block w-full rounded-md px-3 py-2 text-left text-stone-warm transition hover:bg-parchment hover:text-obsidian focus:bg-parchment focus:text-obsidian focus:outline-none"
          >
            Delete
          </button>
        </div>
      ) : null}

      {confirmOpen ? (
        <div
          id={confirmId}
          role="dialog"
          aria-label="Delete record?"
          className="absolute right-0 mt-1 w-56 rounded-xl border border-parchment-border bg-parchment-raised p-3 text-sm shadow-sm"
        >
          <p className="font-medium text-obsidian">Delete record?</p>
          <p className="mt-1 text-stone-warm">This cannot be undone.</p>
          {error ? (
            <p role="alert" className="mt-2 text-stone-warm">
              We couldn’t delete it. Try again.
            </p>
          ) : null}
          <div className="mt-3 flex justify-end gap-2">
            <button
              ref={cancelRef}
              type="button"
              onClick={() => closeMenu(true)}
              className="px-2 py-1 text-stone-warm transition hover:text-obsidian focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isPending}
              onClick={confirmDelete}
              className="px-2 py-1 font-medium text-obsidian transition hover:text-ember focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ember disabled:cursor-not-allowed disabled:text-stone-soft"
            >
              Delete
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

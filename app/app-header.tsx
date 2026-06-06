import Link from "next/link";

import { SignOutButton } from "./sign-out-button";
import { Wordmark } from "./wordmark";

type AppHeaderProps = {
  links: Array<{ href: string; label: string }>;
};

export function AppHeader({ links }: AppHeaderProps) {
  return (
    <header className="mb-8 flex items-center justify-between gap-4">
      <Wordmark className="text-sm" />
      {/* Desktop nav. On mobile the fixed BottomNav is the primary navigation,
          so the link list is hidden here and only Sign out remains. */}
      <div className="flex items-center gap-x-4 gap-y-2 text-sm">
        <nav
          aria-label="Primary"
          className="hidden flex-wrap items-center gap-x-4 gap-y-2 sm:flex"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-medium text-stone-warm transition hover:text-obsidian"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <SignOutButton />
      </div>
    </header>
  );
}

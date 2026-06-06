import Link from "next/link";

import { SignOutButton } from "./sign-out-button";
import { Wordmark } from "./wordmark";

type AppHeaderProps = {
  links: Array<{ href: string; label: string }>;
};

export function AppHeader({ links }: AppHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <Wordmark className="text-sm" />
      <nav
        aria-label="Primary"
        className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm"
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
        <SignOutButton />
      </nav>
    </header>
  );
}

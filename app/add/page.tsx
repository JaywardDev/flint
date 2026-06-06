import { requireUser } from "@/lib/auth/server";

import { AppHeader } from "../app-header";
import { BottomNav } from "../bottom-nav";
import { CaptureBox } from "../capture-box";

export default async function AddPage() {
  await requireUser();

  return (
    <>
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 pb-28 pt-10 sm:pb-10">
      <AppHeader
        links={[
          { href: "/records", label: "Records" },
          { href: "/search", label: "Search" },
        ]}
      />

      <CaptureBox />
    </main>
    <BottomNav />
    </>
  );
}

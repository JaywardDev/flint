import { redirect } from "next/navigation";

import { requireUser } from "@/lib/auth/server";

export default async function HomePage() {
  await requireUser();
  redirect("/records");
}

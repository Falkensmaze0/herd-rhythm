import { redirect } from "next/navigation";

import { ROLE_HOME_ROUTE, getSessionUser } from "@/lib/server-auth";

export default async function HomePage() {
  const user = await getSessionUser();
  if (!user) {
    redirect("/login");
  }

  redirect(ROLE_HOME_ROUTE[user.role] ?? "/login");
}

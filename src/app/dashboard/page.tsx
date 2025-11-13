/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardRouter } from "@/components/dashboards/DashboardRouter";
import { requireSessionUser } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Dashboard | HerdView",
};

const DashboardPage = async () => {
  await requireSessionUser();

  return (
    <AuthGuard requireAuth>
      <DashboardRouter />
    </AuthGuard>
  );
};

export default DashboardPage;

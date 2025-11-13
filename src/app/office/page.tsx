/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardRouter } from "@/components/dashboards/DashboardRouter";
import { requireRole } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Office Dashboard | HerdView",
};

const OfficePage = async () => {
  await requireRole("office");

  return (
    <AuthGuard requiredRole="office">
      <DashboardRouter />
    </AuthGuard>
  );
};

export default OfficePage;

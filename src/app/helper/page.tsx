/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardRouter } from "@/components/dashboards/DashboardRouter";
import { requireRole } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Helper Dashboard | HerdView",
};

const HelperPage = async () => {
  await requireRole("helper");

  return (
    <AuthGuard requiredRole="helper">
      <DashboardRouter />
    </AuthGuard>
  );
};

export default HelperPage;

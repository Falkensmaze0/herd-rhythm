/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardRouter } from "@/components/dashboards/DashboardRouter";
import { requireRole } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Manager Dashboard | HerdView",
};

const ManagerPage = async () => {
  await requireRole("manager");

  return (
    <AuthGuard requiredRole="manager">
      <DashboardRouter />
    </AuthGuard>
  );
};

export default ManagerPage;

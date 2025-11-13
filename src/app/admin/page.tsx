/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardRouter } from "@/components/dashboards/DashboardRouter";
import { requireRole } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Admin Command Center | HerdView",
};

const AdminPage = async () => {
  await requireRole("admin");

  return (
    <AuthGuard requiredRole="admin">
      <DashboardRouter />
    </AuthGuard>
  );
};

export default AdminPage;

/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardRouter } from "@/components/dashboards/DashboardRouter";
import { requireRole } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Technician Dashboard | HerdView",
};

const TechnicianPage = async () => {
  await requireRole("technician");

  return (
    <AuthGuard requiredRole="technician">
      <DashboardRouter />
    </AuthGuard>
  );
};

export default TechnicianPage;

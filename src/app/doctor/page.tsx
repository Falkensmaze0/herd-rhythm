/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { DashboardRouter } from "@/components/dashboards/DashboardRouter";
import { requireRole } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Doctor Dashboard | HerdView",
};

const DoctorPage = async () => {
  await requireRole("doctor");

  return (
    <AuthGuard requiredRole="doctor">
      <DashboardRouter />
    </AuthGuard>
  );
};

export default DoctorPage;

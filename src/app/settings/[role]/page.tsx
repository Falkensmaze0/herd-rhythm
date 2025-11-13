/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { RoleSettingsView } from "@/components/settings/RoleSettingsView";
import { parseRoleParam, requireRoleFromParam } from "@/lib/server-auth";
import { UserRole } from "@/types";

const ROLE_TITLES: Record<UserRole, string> = {
  admin: "Admin",
  manager: "Manager",
  doctor: "Doctor",
  technician: "Technician",
  helper: "Helper",
  office: "Office",
};

interface RoleSettingsPageProps {
  params: { role: string };
}

export const generateMetadata = async ({
  params,
}: RoleSettingsPageProps): Promise<Metadata> => {
  const role = parseRoleParam(params.role);

  return {
    title: `${ROLE_TITLES[role]} Settings | HerdView`,
  };
};

const RoleSettingsPage = async ({ params }: RoleSettingsPageProps) => {
  const { role } = await requireRoleFromParam(params.role);

  return (
    <AuthGuard requiredRole={role}>
      <RoleSettingsView role={role} />
    </AuthGuard>
  );
};

export default RoleSettingsPage;

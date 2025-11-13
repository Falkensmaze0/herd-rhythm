/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { RoleProfileView } from "@/components/profile/RoleProfileView";
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

interface RoleProfilePageProps {
  params: { role: string };
}

export const generateMetadata = async ({
  params,
}: RoleProfilePageProps): Promise<Metadata> => {
  const role = parseRoleParam(params.role);
  return {
    title: `${ROLE_TITLES[role]} Profile | HerdView`,
  };
};

const RoleProfilePage = async ({ params }: RoleProfilePageProps) => {
  const { role } = await requireRoleFromParam(params.role);

  return (
    <AuthGuard requiredRole={role}>
      <RoleProfileView role={role} />
    </AuthGuard>
  );
};

export default RoleProfilePage;

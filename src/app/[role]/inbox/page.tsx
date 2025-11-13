/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";

import { AuthGuard } from "@/components/auth/AuthGuard";
import { RoleInboxView } from "@/components/inbox/RoleInboxView";
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

interface RoleInboxPageProps {
  params: { role: string };
}

export const generateMetadata = async ({
  params,
}: RoleInboxPageProps): Promise<Metadata> => {
  const role = parseRoleParam(params.role);
  return {
    title: `${ROLE_TITLES[role]} Inbox | HerdView`,
  };
};

const RoleInboxPage = async ({ params }: RoleInboxPageProps) => {
  const { role } = await requireRoleFromParam(params.role);

  return (
    <AuthGuard requiredRole={role}>
      <RoleInboxView role={role} />
    </AuthGuard>
  );
};

export default RoleInboxPage;

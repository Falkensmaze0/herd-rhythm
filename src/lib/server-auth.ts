import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { AuthService } from "@/services/AuthService.server";
import { AuthUser, UserRole } from "@/types";

export const ROLE_HOME_ROUTE: Record<UserRole, string> = {
  admin: "/admin",
  manager: "/manager",
  doctor: "/doctor",
  technician: "/technician",
  helper: "/helper",
  office: "/office",
};

export const ALLOWED_ROLES: readonly UserRole[] = [
  "admin",
  "manager",
  "doctor",
  "technician",
  "helper",
  "office",
];

const LOGIN_PATH = "/login";

export const parseRoleParam = (
  value: string | string[] | undefined
): UserRole => {
  if (typeof value === "string" && ALLOWED_ROLES.includes(value as UserRole)) {
    return value as UserRole;
  }

  if (
    Array.isArray(value) &&
    value.length === 1 &&
    ALLOWED_ROLES.includes(value[0] as UserRole)
  ) {
    return value[0] as UserRole;
  }

  notFound();
};

export const getSessionUser = async (): Promise<AuthUser | null> => {
  const sessionToken = cookies().get("sessionToken")?.value;
  if (!sessionToken) {
    return null;
  }

  try {
    return await AuthService.validateSession(sessionToken);
  } catch (error) {
    console.error("Failed to validate session", error);
    return null;
  }
};

export const requireSessionUser = async (): Promise<AuthUser> => {
  const user = await getSessionUser();
  if (!user) {
    redirect(LOGIN_PATH);
  }
  return user;
};

export const requireRole = async (
  roleOrRoles: UserRole | UserRole[]
): Promise<AuthUser> => {
  const user = await requireSessionUser();
  const roles = Array.isArray(roleOrRoles) ? roleOrRoles : [roleOrRoles];
  if (!roles.includes(user.role)) {
    redirect(LOGIN_PATH);
  }
  return user;
};

export const requireRoleFromParam = async (
  param: string | string[] | undefined
) => {
  const role = parseRoleParam(param);
  const user = await requireRole(role);
  return { role, user };
};

/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { ROLE_HOME_ROUTE, getSessionUser } from "@/lib/server-auth";

import LoginPageClient from "./LoginPageClient";

export const metadata: Metadata = {
  title: "Login | HerdView",
};

const sanitizeReturnUrl = (value?: string) => {
  if (!value) {
    return undefined;
  }
  if (!value.startsWith("/") || value.startsWith("//")) {
    return undefined;
  }
  return value;
};

interface LoginPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

const LoginPage = async ({ searchParams }: LoginPageProps) => {
  const user = await getSessionUser();
  const rawReturnUrl =
    typeof searchParams?.returnUrl === "string"
      ? searchParams.returnUrl
      : undefined;
  const returnUrl = sanitizeReturnUrl(rawReturnUrl);

  if (user) {
    redirect(
      returnUrl ??
        ROLE_HOME_ROUTE[user.role] ??
        "/"
    );
  }

  return <LoginPageClient returnUrl={returnUrl} />;
};

export default LoginPage;

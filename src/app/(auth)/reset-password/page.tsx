/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import ResetPasswordPageClient from "./ResetPasswordPageClient";

export const metadata: Metadata = {
  title: "Reset Password | HerdView",
};

interface ResetPasswordPageProps {
  searchParams: Record<string, string | string[] | undefined>;
}

const ResetPasswordPage = ({ searchParams }: ResetPasswordPageProps) => {
  const tokenValue = searchParams?.token;
  const token =
    typeof tokenValue === "string" ? tokenValue : undefined;

  if (!token) {
    redirect("/login");
  }

  return <ResetPasswordPageClient token={token} />;
};

export default ResetPasswordPage;

/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";

import ForgotPasswordPageClient from "./ForgotPasswordPageClient";

export const metadata: Metadata = {
  title: "Forgot Password | HerdView",
};

const ForgotPasswordPage = () => {
  return <ForgotPasswordPageClient />;
};

export default ForgotPasswordPage;

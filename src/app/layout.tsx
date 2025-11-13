/* eslint-disable react-refresh/only-export-components */
import type { Metadata } from "next";
import React from "react";

import "@/styles/globals.css";

import { AppProviders } from "./providers";

export const metadata: Metadata = {
  title: "HerdView",
  description: "Herd Rhythm command center.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

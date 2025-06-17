import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";

import "./globals.css";

const fixedFont = Poppins({
  subsets: ["latin"],
  weight: "500",
});

export const metadata: Metadata = {
  title: "HealthSphere",
  description: "HealthSphere is a user-friendly web application that offers virtual teleconsultations, secure medical IDs, AI-driven health advice, real-time prescription availability checks, and a supportive community.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-title" content="HealthSphere" />
      </head>
      <Analytics />
      <body
        className={fixedFont.className}
      >
        {children}
      </body>
    </html>
  );
}

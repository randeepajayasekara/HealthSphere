import type { Metadata } from "next";
import { Poppins } from "next/font/google";

import "./globals.css";
import { ThemeProvider } from "@/app/components/features/theme-provider";
import { AuthProvider } from "@/app/contexts/auth-context";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "react-hot-toast";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "HealthSphere",
    template: "%s | HealthSphere",
  },
  description:
    "HealthSphere is a user-friendly web application that offers virtual teleconsultations, secure medical IDs, AI-driven health advice, real-time prescription availability checks, and a supportive community.",
  keywords: [
    "healthcare",
    "telemedicine",
    "health app",
    "virtual consultations",
    "medical ID",
  ],
  authors: [{ name: "HealthSphere Team" }],
  creator: "Quarista Team",
  publisher: "Quarista Developers",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={poppins.variable}>
      <head />
      <body className={poppins.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster
              position="top-right"
              gutter={8}
              containerClassName=""
              containerStyle={{}}
              toastOptions={{
                className: "",
                duration: 4000,
                style: {
                  background: "#fff",
                  color: "#363636",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "12px 16px",
                  fontSize: "14px",
                  fontWeight: "500",
                  boxShadow:
                    "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                  backdropFilter: "blur(8px)",
                },
                // Success
                success: {
                  duration: 3000,
                  style: {
                    background: "#f0fdf4",
                    color: "#166534",
                    border: "1px solid #bbf7d0",
                  },
                  iconTheme: {
                    primary: "#16a34a",
                    secondary: "#fff",
                  },
                },

                error: {
                  duration: 5000,
                  style: {
                    background: "#fef2f2",
                    color: "#991b1b",
                    border: "1px solid #fecaca",
                  },
                  iconTheme: {
                    primary: "#dc2626",
                    secondary: "#fff",
                  },
                },

                loading: {
                  style: {
                    background: "#f8fafc",
                    color: "#475569",
                    border: "1px solid #cbd5e1",
                  },
                  iconTheme: {
                    primary: "#3b82f6",
                    secondary: "#fff",
                  },
                },
              }}
              reverseOrder={false}
            />
          </AuthProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

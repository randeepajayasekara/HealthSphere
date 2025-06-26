import { ReactNode } from "react";
import GlobalHeader from "../components/layout/Global/global-header";
import { Toaster } from "react-hot-toast";
import Image from "next/image";
import { SocialLinksProvider } from "../../contexts/social-links-context";
import SocialLinksFooter from "../components/layout/Global/social-links-footer";

interface GlobalLayoutProps {
  children: ReactNode;
}

export default function GlobalLayout({ children }: GlobalLayoutProps) {
  return (
    <SocialLinksProvider>
      <div className="flex min-h-screen flex-col">
        {/* Floating Header */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <GlobalHeader />
        </div>

        {/* Main content with top padding for floating header */}
        <main className="flex-1 pt-16">{children}</main>

        {/* Modern Footer */}
        <footer className="bg-gradient-to-r from-red-50 via-gray-50 to-red-50 dark:from-red-950/30 dark:via-black dark:to-red-950/30 border-t border-gray-200 dark:border-zinc-800">
          <div className="container mx-auto px-4 max-w-6xl py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Left side - Logo/Brand */}
              <div className="flex items-center gap-2">
                <div className="w-10 h-auto mr-2">
                  <Image
                    src="/icon0.svg"
                    alt="HealthSphere"
                    width={500}
                    height={250}
                    priority
                    className="object-contain"
                  />
                </div>
              </div>

              {/* Center - Links */}
              <div className="flex items-center gap-6 text-sm">
                <a
                  href="/privacy"
                  className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  Privacy
                </a>
                <a
                  href="/terms"
                  className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  Terms
                </a>
                <a
                  href="/support"
                  className="text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  Support
                </a>
              </div>

              
              <SocialLinksFooter />
            </div>
          </div>
        </footer>
        <Toaster />
      </div>
    </SocialLinksProvider>
  );
}
  
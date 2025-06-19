import { ReactNode } from "react";
import GlobalHeader from "../components/layout/Global/global-header";
import { Toaster } from 'react-hot-toast';

interface GlobalLayoutProps {
    children: ReactNode;
}

export default function GlobalLayout({ children }: GlobalLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col">
            <GlobalHeader />
            <main className="flex-1">
                {children}
            </main>
            <footer className="py-6 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                <div className="container mx-auto px-4 max-w-6xl text-center text-gray-600 dark:text-gray-400 text-sm">
                    © {new Date().getFullYear()} HealthSphere. All rights reserved.
                </div>
            </footer>
            <Toaster />
        </div>
    );
}
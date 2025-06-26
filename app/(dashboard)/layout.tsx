import React from 'react';
import DashboardSidebar from '../components/layout/Global/dashboard-sidebar';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
            {/* Sidebar */}
            <DashboardSidebar />
            
            {/* Main content area */}
            <div className="md:ml-20 lg:ml-72 transition-all duration-300">
                <main className="p-4 md:p-6 lg:p-8">
                    <div className="max-w-9xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
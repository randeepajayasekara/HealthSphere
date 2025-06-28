"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import DashboardSidebar from '../components/layout/Global/dashboard-sidebar';
import { AccessibilityProvider } from '../contexts/accessibility-context';

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
};

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    useEffect(() => {
        const handleSidebarToggle = (event: CustomEvent) => {
            setIsCollapsed(event.detail.isCollapsed);
        };

        window.addEventListener('sidebarToggle', handleSidebarToggle as EventListener);
        
        return () => {
            window.removeEventListener('sidebarToggle', handleSidebarToggle as EventListener);
        };
    }, []);

    return (
        <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
            <AccessibilityProvider>
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-900 dark:to-zinc-950 transition-colors duration-300">
                    {/* Sidebar */}
                    <DashboardSidebar />
                    
                    {/* Main content area */}
                    <div 
                        className={`transition-all duration-300 ease-in-out ${
                            isCollapsed 
                                ? 'md:ml-20' // Collapsed sidebar width (16 + 4 padding)
                                : 'md:ml-72' // Expanded sidebar width (64 + 8 padding)
                        }`}
                    >
                        <main className="p-4 md:p-6 lg:p-8">
                            <div className="max-w-9xl mx-auto">
                                {children}
                            </div>
                        </main>
                    </div>
                </div>
            </AccessibilityProvider>
        </SidebarContext.Provider>
    );
}
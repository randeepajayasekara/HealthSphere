"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import DashboardSidebar from '../components/layout/Global/dashboard-sidebar';
import UtilityNavigation from '../components/layout/Global/utility-navigation';
import MobileHeader from '../components/layout/Global/mobile-header';
import AccessibilitySheet from '../components/layout/Global/accessibility-sheet';
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
                <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-950 dark:to-zinc-950 transition-colors duration-300">
                    {/* Mobile Header */}
                    <div className="md:hidden">
                        <MobileHeader />
                    </div>

                    {/* Desktop Sidebar */}
                    <div className="hidden md:block">
                        <DashboardSidebar />
                    </div>
                    
                    {/* Desktop Utility Navigation */}
                    <div className="hidden md:block">
                        <UtilityNavigation />
                    </div>
                    
                    {/* Main content area */}
                    <div 
                        className={`transition-all duration-300 ease-in-out ${
                            isCollapsed 
                                ? 'md:ml-20' // Collapsed sidebar width
                                : 'md:ml-72' // Expanded sidebar width
                        } pt-16 md:pt-20 md:pr-4`} // Add top padding for mobile header and desktop utility nav
                    >
                        <main className="p-4 md:p-6 lg:p-8">
                            <div className="max-w-9xl mx-auto">
                                {children}
                            </div>
                        </main>
                    </div>

                    {/* Global Accessibility Sheet */}
                    <AccessibilitySheet />
                </div>
            </AccessibilityProvider>
        </SidebarContext.Provider>
    );
}
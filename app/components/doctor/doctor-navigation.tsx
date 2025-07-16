"use client";

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  Pill,
  FlaskConical,
  FileText,
  Video,
  Clock,
  BarChart3,
  Menu,
  Bell,
  Settings,
  LogOut,
  MessageSquare
} from 'lucide-react';
import { doctorRoutes } from '@/app/types/routes';
import { useAuth } from '@/app/contexts/auth-context';
import { cn } from '@/lib/utils';

interface DoctorSidebarProps {
  className?: string;
}

const iconMap = {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  Pill,
  FlaskConical,
  FileText,
  Video,
  Clock,
  BarChart3,
  MessageSquare
};

export function DoctorSidebar({ className }: DoctorSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const getIconComponent = (iconName?: string) => {
    if (!iconName || !(iconName in iconMap)) return LayoutDashboard;
    return iconMap[iconName as keyof typeof iconMap];
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
            <Stethoscope className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
              HealthSphere
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              Doctor Portal
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {doctorRoutes.map((route) => {
          const IconComponent = getIconComponent(route.icon);
          const isActive = pathname === route.path;
          
          return (
            <Button
              key={route.path}
              variant={isActive ? "default" : "ghost"}
              className={cn(
                "w-full justify-start h-11",
                isActive 
                  ? "bg-red-600 text-white hover:bg-red-700" 
                  : "text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
              onClick={() => router.push(route.path)}
            >
              <IconComponent className="h-4 w-4 mr-3" />
              {route.name}
            </Button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-700 space-y-2">
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={() => router.push('/doctor/settings')}
        >
          <Settings className="h-4 w-4 mr-3" />
          Settings
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className={cn("hidden md:flex w-64 flex-col bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-700", className)}>
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="md:hidden fixed top-4 left-4 z-40"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>
    </>
  );
}

export function DoctorTopBar() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(3); // Mock notification count

  return (
    <div className="h-16 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-4">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
          Doctor Dashboard
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {notifications > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center p-0">
              {notifications}
            </Badge>
          )}
        </Button>

        {/* Messages */}
        <Button variant="ghost" size="icon">
          <MessageSquare className="h-4 w-4" />
        </Button>

        {/* User Info */}
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
              Dr. {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-zinc-600 dark:text-zinc-400">
              {user?.email}
            </p>
          </div>
          <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

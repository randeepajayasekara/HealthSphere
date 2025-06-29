"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, 
  Search, 
  Bell, 
  Accessibility, 
  HelpCircle,
  ExternalLink,
  BookOpen,
  FileText,
  User,
  Calendar,
  Settings,
  Users,
  Activity,
  BarChart,
  MessageSquare,
  Building,
  Pill,
  TestTube,
  CreditCard,
  Clock,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/app/contexts/auth-context';
import { useAccessibility } from '@/app/contexts/accessibility-context';
import { sanitizeInput } from '@/app/utils/sanitizer';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: React.ElementType;
  category: string;
}

const roleBasedSearchResults = {
  patient: [
    { id: 'appointments', title: 'My Appointments', description: 'View and manage your appointments', path: '/dashboard/appointments', icon: Calendar, category: 'Healthcare' },
    { id: 'medical-records', title: 'Medical Records', description: 'Access your medical history', path: '/dashboard/medical-records', icon: FileText, category: 'Healthcare' },
    { id: 'prescriptions', title: 'Prescriptions', description: 'View your prescriptions', path: '/dashboard/prescriptions', icon: Pill, category: 'Healthcare' },
    { id: 'lab-results', title: 'Lab Results', description: 'View your lab test results', path: '/dashboard/lab-results', icon: TestTube, category: 'Healthcare' },
    { id: 'billing', title: 'Billing', description: 'Manage payments and insurance', path: '/dashboard/billing', icon: CreditCard, category: 'Finance' },
    { id: 'messages', title: 'Messages', description: 'Communicate with healthcare providers', path: '/dashboard/messages', icon: MessageSquare, category: 'Communication' },
    { id: 'profile', title: 'Profile', description: 'Manage your profile', path: '/profile', icon: User, category: 'Account' },
  ],
  doctor: [
    { id: 'appointments', title: 'Appointments', description: 'Manage patient appointments', path: '/doctor/appointments', icon: Calendar, category: 'Healthcare' },
    { id: 'patients', title: 'Patients', description: 'Manage your patients', path: '/doctor/patients', icon: Users, category: 'Healthcare' },
    { id: 'prescriptions', title: 'Prescriptions', description: 'Create and manage prescriptions', path: '/doctor/prescriptions', icon: Pill, category: 'Healthcare' },
    { id: 'medical-records', title: 'Medical Records', description: 'Access patient medical records', path: '/doctor/medical-records', icon: FileText, category: 'Healthcare' },
    { id: 'schedule', title: 'Schedule', description: 'Manage your availability', path: '/doctor/schedule', icon: Clock, category: 'Management' },
    { id: 'messages', title: 'Messages', description: 'Communicate with patients and staff', path: '/doctor/messages', icon: MessageSquare, category: 'Communication' },
  ],
  nurse: [
    { id: 'patients', title: 'Patients', description: 'Manage patient care', path: '/nurse/patients', icon: Users, category: 'Healthcare' },
    { id: 'vitals', title: 'Vitals', description: 'Record patient vital signs', path: '/nurse/vitals', icon: Activity, category: 'Healthcare' },
    { id: 'medications', title: 'Medications', description: 'Administer medications', path: '/nurse/medications', icon: Pill, category: 'Healthcare' },
    { id: 'schedule', title: 'Schedule', description: 'View your shift schedule', path: '/nurse/schedule', icon: Clock, category: 'Management' },
    { id: 'messages', title: 'Messages', description: 'Communicate with doctors and staff', path: '/nurse/messages', icon: MessageSquare, category: 'Communication' },
  ],
  admin: [
    { id: 'users', title: 'User Management', description: 'Manage system users', path: '/admin/users', icon: Users, category: 'Administration' },
    { id: 'departments', title: 'Departments', description: 'Manage hospital departments', path: '/admin/departments', icon: Building, category: 'Administration' },
    { id: 'reports', title: 'Reports', description: 'Generate system reports', path: '/admin/reports', icon: BarChart, category: 'Analytics' },
    { id: 'settings', title: 'Settings', description: 'System configuration', path: '/admin/settings', icon: Settings, category: 'Configuration' },
  ],
  receptionist: [
    { id: 'appointments', title: 'Appointments', description: 'Manage patient appointments', path: '/receptionist/appointments', icon: Calendar, category: 'Healthcare' },
    { id: 'patients', title: 'Patients', description: 'Register and manage patients', path: '/receptionist/patients', icon: Users, category: 'Healthcare' },
    { id: 'check-in', title: 'Check-in', description: 'Patient check-in process', path: '/receptionist/check-in', icon: User, category: 'Healthcare' },
    { id: 'billing', title: 'Billing', description: 'Process payments', path: '/receptionist/billing', icon: CreditCard, category: 'Finance' },
  ],
  pharmacist: [
    { id: 'prescriptions', title: 'Prescriptions', description: 'Process prescriptions', path: '/pharmacist/prescriptions', icon: Pill, category: 'Healthcare' },
    { id: 'inventory', title: 'Inventory', description: 'Manage medication inventory', path: '/pharmacist/inventory', icon: Building, category: 'Management' },
    { id: 'patients', title: 'Patients', description: 'View patient medication history', path: '/pharmacist/patients', icon: Users, category: 'Healthcare' },
  ],
  lab_technician: [
    { id: 'test-orders', title: 'Test Orders', description: 'Manage lab test orders', path: '/lab/test-orders', icon: TestTube, category: 'Healthcare' },
    { id: 'results', title: 'Results', description: 'Record and manage test results', path: '/lab/results', icon: FileText, category: 'Healthcare' },
    { id: 'samples', title: 'Samples', description: 'Manage sample collection', path: '/lab/samples', icon: TestTube, category: 'Healthcare' },
  ],
  hospital_management: [
    { id: 'departments', title: 'Departments', description: 'Oversee hospital departments', path: '/management/departments', icon: Building, category: 'Management' },
    { id: 'staff', title: 'Staff Management', description: 'Manage hospital staff', path: '/management/staff', icon: Users, category: 'Management' },
    { id: 'performance', title: 'Performance', description: 'Track department performance', path: '/management/performance', icon: BarChart, category: 'Analytics' },
    { id: 'reports', title: 'Reports', description: 'Generate management reports', path: '/management/reports', icon: FileText, category: 'Analytics' },
  ],
};

const globalSearchResults: SearchResult[] = [
  { id: 'guide', title: 'User Guide', description: 'Learn how to use HealthSphere', path: '/guide', icon: BookOpen, category: 'Help' },
  { id: 'help', title: 'Help Center', description: 'Get help and support', path: '/help', icon: HelpCircle, category: 'Help' },
  { id: 'blog', title: 'Blog', description: 'Read our latest articles', path: '/blog', icon: FileText, category: 'Information' },
];

// Import the SidebarContent component from dashboard-sidebar
import { SidebarContent } from './dashboard-sidebar';

export default function MobileHeader() {
  const { user } = useAuth();
  const { openAccessibilityPanel } = useAccessibility();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [notifications] = useState(3);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle search
  useEffect(() => {
    if (!user) return;

    const roleResults = roleBasedSearchResults[user.role as keyof typeof roleBasedSearchResults] || [];
    const allResults = [...roleResults, ...globalSearchResults];

    if (searchQuery.trim()) {
      const sanitizedQuery = sanitizeInput(searchQuery.toLowerCase());
      const filtered = allResults.filter(result =>
        result.title.toLowerCase().includes(sanitizedQuery) ||
        result.description.toLowerCase().includes(sanitizedQuery) ||
        result.category.toLowerCase().includes(sanitizedQuery)
      );
      setSearchResults(filtered);
    } else {
      const shuffled = [...allResults].sort(() => 0.5 - Math.random());
      setSearchResults(shuffled.slice(0, 4));
    }
  }, [searchQuery, user]);

  // Handle click outside search
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    if (isSearchOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isSearchOpen]);

  const handleSearchResultClick = () => {
    setIsSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left side - Menu and Logo */}
          <div className="flex items-center gap-3">
            {/* Mobile Sidebar */}
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9 rounded-lg"
                >
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="left"
                className="p-0 w-72 border-none bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl"
              >
                <SidebarContent onNavigate={() => setIsSidebarOpen(false)} />
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7">
                <Image
                  src="/icon0.svg"
                  alt="HealthSphere"
                  width={28}
                  height={28}
                  priority
                  className="object-contain"
                />
              </div>
              <h1 className="font-bold text-base bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                HealthSphere
              </h1>
            </div>
          </div>

          {/* Right side - Utilities */}
          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative" ref={searchRef}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsSearchOpen(true);
                  setTimeout(() => inputRef.current?.focus(), 100);
                }}
                className="w-9 h-9 rounded-lg"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>

            {/* Notifications */}
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="w-9 h-9 rounded-lg"
              >
                <Bell className="w-4 h-4" />
              </Button>
              {notifications > 0 && (
                <Badge className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-xs bg-red-500 hover:bg-red-500">
                  {notifications > 9 ? '9+' : notifications}
                </Badge>
              )}
            </div>

            {/* Accessibility */}
            <Button
              variant="ghost"
              size="icon"
              onClick={openAccessibilityPanel}
              className="w-9 h-9 rounded-lg"
            >
                <svg 
                    id="Layer_1" 
                    data-name="Layer 1" 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 122.88 122.88"
                    className="w-4 h-4"
                >
                    <title>accessibility</title>
                    <path d="M61.44,0A61.46,61.46,0,1,1,18,18,61.21,61.21,0,0,1,61.44,0Zm-.39,74.18L52.1,98.91a4.94,4.94,0,0,1-2.58,2.83A5,5,0,0,1,42.7,95.5l6.24-17.28a26.3,26.3,0,0,0,1.17-4,40.64,40.64,0,0,0,.54-4.18c.24-2.53.41-5.27.54-7.9s.22-5.18.29-7.29c.09-2.63-.62-2.8-2.73-3.3l-.44-.1-18-3.39A5,5,0,0,1,27.08,46a5,5,0,0,1,5.05-7.74l19.34,3.63c.77.07,1.52.16,2.31.25a57.64,57.64,0,0,0,7.18.53A81.13,81.13,0,0,0,69.9,42c.9-.1,1.75-.21,2.6-.29l18.25-3.42A5,5,0,0,1,94.5,39a5,5,0,0,1,1.3,7,5,5,0,0,1-3.21,2.09L75.15,51.37c-.58.13-1.1.22-1.56.29-1.82.31-2.72.47-2.61,3.06.08,1.89.31,4.15.61,6.51.35,2.77.81,5.71,1.29,8.4.31,1.77.6,3.19,1,4.55s.79,2.75,1.39,4.42l6.11,16.9a5,5,0,0,1-6.82,6.24,4.94,4.94,0,0,1-2.58-2.83L63,74.23,62,72.4l-1,1.78Zm.39-53.52a8.83,8.83,0,1,1-6.24,2.59,8.79,8.79,0,0,1,6.24-2.59Zm36.35,4.43a51.42,51.42,0,1,0,15,36.35,51.27,51.27,0,0,0-15-36.35Z" fill="currentColor"/>
                </svg>
            </Button>

            {/* Help Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-9 h-9 rounded-lg"
                >
                  <HelpCircle className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-48 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-zinc-200 dark:border-zinc-800"
              >
                <DropdownMenuLabel className="text-xs">Help & Resources</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/guide" className="flex items-center justify-between cursor-pointer text-sm">
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span>Guide</span>
                    </div>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/help" className="flex items-center justify-between cursor-pointer text-sm">
                    <div className="flex items-center gap-2">
                      <HelpCircle className="w-4 h-4" />
                      <span>Help</span>
                    </div>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/blog" className="flex items-center justify-between cursor-pointer text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>Blog</span>
                    </div>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setIsSearchOpen(false)}
            />
            
            {/* Search Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-20 left-4 right-4 bg-white/98 dark:bg-zinc-950/98 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 z-50"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                      ref={inputRef}
                      placeholder="Search anything..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSearchOpen(false)}
                    className="w-9 h-9 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                {searchResults.length > 0 && (
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {searchResults.map((result) => {
                      const Icon = result.icon;
                      return (
                        <Link
                          key={result.id}
                          href={result.path}
                          onClick={handleSearchResultClick}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors group"
                        >
                          <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                            <Icon className="w-4 h-4 text-red-600 dark:text-red-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm text-zinc-900 dark:text-zinc-100 truncate">
                              {result.title}
                            </h4>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                              {result.description}
                            </p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300" />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

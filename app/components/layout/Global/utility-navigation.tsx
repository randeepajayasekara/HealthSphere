"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Bell, 
  PersonStanding, 
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
  Building2,
  Pill,
  TestTube,
  CreditCard,
  Clock,
  Video,
  QrCode,
  AlarmClock,
  ScanLine,
  Stethoscope,
  IdCard,
  Brain,
  Bot,
  Box,
  ShoppingCart,
  History,
  Banknote,
  LineChart,
  ListChecks,
  ClipboardCheck,
  Laptop
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/app/contexts/auth-context';
import { useAccessibility } from '@/app/contexts/accessibility-context';
import { cn } from '@/lib/utils';
import { sanitizeInput } from '@/app/utils/sanitizer';
import { UserRole } from '@/app/types/routes';
import Link from 'next/link';

interface SearchResult {
  id: string;
  title: string;
  description: string;
  path: string;
  icon: React.ElementType;
  category: string;
}

const roleBasedSearchResults: Record<UserRole, SearchResult[]> = {
  patient: [
    { id: 'appointments', title: 'My Appointments', description: 'View and manage your appointments', path: '/dashboard/appointments', icon: Calendar, category: 'Healthcare' },
    { id: 'telemedicine', title: 'Virtual Consultations', description: 'Join and manage virtual appointments', path: '/dashboard/telemedicine', icon: Video, category: 'Healthcare' },
    { id: 'medical-records', title: 'Medical Records', description: 'Access your medical history', path: '/dashboard/medical-records', icon: FileText, category: 'Healthcare' },
    { id: 'prescriptions', title: 'Prescriptions', description: 'View your prescriptions', path: '/dashboard/prescriptions', icon: Pill, category: 'Healthcare' },
    { id: 'lab-results', title: 'Lab Results', description: 'View your lab test results', path: '/dashboard/lab-results', icon: TestTube, category: 'Healthcare' },
    { id: 'billing', title: 'Billing', description: 'Manage payments and insurance', path: '/dashboard/billing', icon: CreditCard, category: 'Finance' },
    { id: 'messages', title: 'Messages', description: 'Communicate with healthcare providers', path: '/dashboard/messages', icon: MessageSquare, category: 'Communication' },
    { id: 'umid', title: 'Universal Medical ID', description: 'Access your Universal Medical ID and QR code', path: '/dashboard/umid', icon: QrCode, category: 'Healthcare' },
    { id: 'medication-schedule', title: 'Medication Schedule', description: 'Manage your medication schedule and reminders', path: '/dashboard/medication-schedule', icon: AlarmClock, category: 'Healthcare' },
    { id: 'health-assistant', title: 'Health Assistant', description: 'AI-powered health inquiry assistant', path: '/dashboard/health-assistant', icon: Bot, category: 'Healthcare' },
    { id: 'profile', title: 'Profile', description: 'Manage your profile', path: '/profile', icon: User, category: 'Account' },
  ],
  doctor: [
    { id: 'appointments', title: 'Appointments', description: 'Manage patient appointments', path: '/doctor/appointments', icon: Calendar, category: 'Healthcare' },
    { id: 'telemedicine', title: 'Virtual Consultations', description: 'Conduct and manage video consultations', path: '/doctor/telemedicine', icon: Video, category: 'Healthcare' },
    { id: 'virtual-waiting-room', title: 'Virtual Waiting Room', description: 'Manage patients waiting for virtual consultations', path: '/doctor/virtual-waiting-room', icon: Users, category: 'Healthcare' },
    { id: 'patients', title: 'Patients', description: 'Manage your patients', path: '/doctor/patients', icon: Users, category: 'Healthcare' },
    { id: 'prescriptions', title: 'Prescriptions', description: 'Create and manage prescriptions', path: '/doctor/prescriptions', icon: Pill, category: 'Healthcare' },
    { id: 'medical-records', title: 'Medical Records', description: 'Access patient medical records', path: '/doctor/medical-records', icon: FileText, category: 'Healthcare' },
    { id: 'schedule', title: 'Schedule', description: 'Manage your availability', path: '/doctor/schedule', icon: Clock, category: 'Management' },
    { id: 'messages', title: 'Messages', description: 'Communicate with patients and staff', path: '/doctor/messages', icon: MessageSquare, category: 'Communication' },
    { id: 'umid-scanner', title: 'UMID Scanner', description: 'Scan and verify Universal Medical IDs', path: '/doctor/umid-scanner', icon: ScanLine, category: 'Healthcare' },
    { id: 'health-assistant', title: 'Health Assistant', description: 'AI-powered medical consultation assistant', path: '/doctor/health-assistant', icon: Stethoscope, category: 'Healthcare' },
    { id: 'chatbot', title: 'Chatbot Management', description: 'Configure medical chatbot responses', path: '/doctor/chatbot', icon: Bot, category: 'Management' },
  ],
  nurse: [
    { id: 'patients', title: 'Patients', description: 'Manage patient care', path: '/nurse/patients', icon: Users, category: 'Healthcare' },
    { id: 'telemedicine-support', title: 'Telemedicine Support', description: 'Assist with virtual consultations', path: '/nurse/telemedicine-support', icon: Video, category: 'Healthcare' },
    { id: 'vitals', title: 'Vitals', description: 'Record patient vital signs', path: '/nurse/vitals', icon: Activity, category: 'Healthcare' },
    { id: 'medications', title: 'Medications', description: 'Administer medications', path: '/nurse/medications', icon: Pill, category: 'Healthcare' },
    { id: 'schedule', title: 'Schedule', description: 'View your shift schedule', path: '/nurse/schedule', icon: Clock, category: 'Management' },
    { id: 'messages', title: 'Messages', description: 'Communicate with doctors and staff', path: '/nurse/messages', icon: MessageSquare, category: 'Communication' },
    { id: 'umid-scanner', title: 'UMID Scanner', description: 'Scan and verify Universal Medical IDs', path: '/nurse/umid-scanner', icon: ScanLine, category: 'Healthcare' },
    { id: 'chatbot', title: 'Chatbot Management', description: 'Update nursing protocols for chatbot', path: '/nurse/chatbot', icon: Bot, category: 'Management' },
  ],
  admin: [
    { id: 'users', title: 'User Management', description: 'Manage system users', path: '/admin/users', icon: Users, category: 'Administration' },
    { id: 'telemedicine', title: 'Telemedicine Settings', description: 'Configure virtual consultation platform', path: '/admin/telemedicine', icon: Video, category: 'Administration' },
    { id: 'departments', title: 'Departments', description: 'Manage hospital departments', path: '/admin/departments', icon: Building, category: 'Administration' },
    { id: 'facilities', title: 'Facilities', description: 'Manage hospital facilities', path: '/admin/facilities', icon: Building2, category: 'Administration' },
    { id: 'reports', title: 'Reports', description: 'Generate system reports', path: '/admin/reports', icon: BarChart, category: 'Analytics' },
    { id: 'settings', title: 'Settings', description: 'System configuration', path: '/admin/settings', icon: Settings, category: 'Configuration' },
    { id: 'audit-logs', title: 'Audit Logs', description: 'View system activity', path: '/admin/audit-logs', icon: History, category: 'Administration' },
    { id: 'blog', title: 'Blog', description: 'Manage blog posts', path: '/admin/blog', icon: FileText, category: 'Content' },
    { id: 'chatbot-statistics', title: 'Chatbot Statistics', description: 'View chatbot usage analytics', path: '/admin/chatbot-statistics', icon: Activity, category: 'Analytics' },
    { id: 'umid-management', title: 'UMID Management', description: 'Manage Universal Medical ID system', path: '/admin/umid-management', icon: IdCard, category: 'Administration' },
    { id: 'health-assistant', title: 'Health Assistant Config', description: 'Configure AI Health Assistant system', path: '/admin/health-assistant', icon: Brain, category: 'Configuration' },
    { id: 'chatbot', title: 'Chatbot Management', description: 'Configure and manage AI chatbot system', path: '/admin/chatbot', icon: Bot, category: 'Administration' },
  ],
  receptionist: [
    { id: 'appointments', title: 'Appointments', description: 'Manage patient appointments', path: '/receptionist/appointments', icon: Calendar, category: 'Healthcare' },
    { id: 'virtual-appointments', title: 'Virtual Appointments', description: 'Schedule and manage telemedicine consultations', path: '/receptionist/virtual-appointments', icon: Video, category: 'Healthcare' },
    { id: 'patients', title: 'Patients', description: 'Register and manage patients', path: '/receptionist/patients', icon: Users, category: 'Healthcare' },
    { id: 'check-in', title: 'Check-in', description: 'Patient check-in process', path: '/receptionist/check-in', icon: ClipboardCheck, category: 'Healthcare' },
    { id: 'virtual-check-in', title: 'Virtual Check-in', description: 'Manage virtual waiting room', path: '/receptionist/virtual-check-in', icon: Laptop, category: 'Healthcare' },
    { id: 'billing', title: 'Billing', description: 'Process payments', path: '/receptionist/billing', icon: CreditCard, category: 'Finance' },
    { id: 'messages', title: 'Messages', description: 'Communicate with staff', path: '/receptionist/messages', icon: MessageSquare, category: 'Communication' },
    { id: 'umid-scanner', title: 'UMID Scanner', description: 'Scan and verify Universal Medical IDs', path: '/receptionist/umid-scanner', icon: ScanLine, category: 'Healthcare' },
    { id: 'chatbot', title: 'Chatbot Management', description: 'Update appointment booking and FAQ responses', path: '/receptionist/chatbot', icon: Bot, category: 'Management' },
  ],
  pharmacist: [
    { id: 'prescriptions', title: 'Prescriptions', description: 'Process prescriptions', path: '/pharmacist/prescriptions', icon: Pill, category: 'Healthcare' },
    { id: 'e-prescriptions', title: 'E-Prescriptions', description: 'Process electronic prescriptions from telemedicine', path: '/pharmacist/e-prescriptions', icon: FileText, category: 'Healthcare' },
    { id: 'inventory', title: 'Inventory', description: 'Manage medication inventory', path: '/pharmacist/inventory', icon: Box, category: 'Management' },
    { id: 'orders', title: 'Orders', description: 'Manage medication orders', path: '/pharmacist/orders', icon: ShoppingCart, category: 'Management' },
    { id: 'patients', title: 'Patients', description: 'View patient medication history', path: '/pharmacist/patients', icon: Users, category: 'Healthcare' },
    { id: 'messages', title: 'Messages', description: 'Communicate with doctors and staff', path: '/pharmacist/messages', icon: MessageSquare, category: 'Communication' },
    { id: 'prescription-analyzer', title: 'Prescription Analyzer', description: 'AI-powered prescription analysis and inventory management', path: '/pharmacist/prescription-analyzer', icon: Search, category: 'Healthcare' },
    { id: 'umid-scanner', title: 'UMID Scanner', description: 'Scan and verify Universal Medical IDs', path: '/pharmacist/umid-scanner', icon: ScanLine, category: 'Healthcare' },
    { id: 'chatbot', title: 'Chatbot Management', description: 'Update medication information and drug interaction database', path: '/pharmacist/chatbot', icon: Bot, category: 'Management' },
  ],
  lab_technician: [
    { id: 'test-orders', title: 'Test Orders', description: 'Manage lab test orders', path: '/lab/test-orders', icon: TestTube, category: 'Healthcare' },
    { id: 'results', title: 'Results', description: 'Record and manage test results', path: '/lab/results', icon: FileText, category: 'Healthcare' },
    { id: 'samples', title: 'Samples', description: 'Manage sample collection', path: '/lab/samples', icon: TestTube, category: 'Healthcare' },
    { id: 'equipment', title: 'Equipment', description: 'Manage lab equipment', path: '/lab/equipment', icon: Laptop, category: 'Management' },
    { id: 'quality-control', title: 'Quality Control', description: 'Monitor quality control procedures', path: '/lab/quality-control', icon: ClipboardCheck, category: 'Healthcare' },
    { id: 'schedule', title: 'Schedule', description: 'View your work schedule', path: '/lab/schedule', icon: Clock, category: 'Management' },
    { id: 'messages', title: 'Messages', description: 'Communicate with doctors and staff', path: '/lab/messages', icon: MessageSquare, category: 'Communication' },
  ],
  hospital_management: [
    { id: 'departments', title: 'Departments', description: 'Oversee hospital departments', path: '/management/departments', icon: Building, category: 'Management' },
    { id: 'telemedicine-analytics', title: 'Telemedicine Analytics', description: 'Virtual consultation metrics and insights', path: '/management/telemedicine-analytics', icon: LineChart, category: 'Analytics' },
    { id: 'staff', title: 'Staff Management', description: 'Manage hospital staff', path: '/management/staff', icon: Users, category: 'Management' },
    { id: 'budget', title: 'Budget', description: 'Manage departmental budgets', path: '/management/budget', icon: Banknote, category: 'Finance' },
    { id: 'performance', title: 'Performance', description: 'Track department performance', path: '/management/performance', icon: BarChart, category: 'Analytics' },
    { id: 'reports', title: 'Reports', description: 'Generate management reports', path: '/management/reports', icon: FileText, category: 'Analytics' },
    { id: 'resources', title: 'Resource Allocation', description: 'Manage hospital resources', path: '/management/resources', icon: ListChecks, category: 'Management' },
    { id: 'chatbot', title: 'Chatbot Management', description: 'Oversee chatbot implementation and policy compliance', path: '/management/chatbot', icon: Bot, category: 'Management' },
  ],
};

const globalSearchResults: SearchResult[] = [
  { id: 'guide', title: 'User Guide', description: 'Learn how to use HealthSphere', path: '/guide', icon: BookOpen, category: 'Help' },
  { id: 'help', title: 'Help Center', description: 'Get help and support', path: '/help', icon: HelpCircle, category: 'Help' },
  { id: 'blog', title: 'Blog', description: 'Read our latest articles', path: '/blog', icon: FileText, category: 'Information' },
];

export default function UtilityNavigation() {
  const { user } = useAuth();
  const { openAccessibilityPanel } = useAccessibility();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [notifications] = useState(3); // Mock notification count
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'f' || event.key === 'F') && !event.ctrlKey && !event.metaKey && !event.altKey) {
        const target = event.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          event.preventDefault();
          inputRef.current?.focus();
        }
      }
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
        setSearchQuery('');
        inputRef.current?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle search
  useEffect(() => {
    if (!user) return;

    const roleResults = roleBasedSearchResults[user.role] || [];
    const allResults = [...roleResults, ...globalSearchResults];

    if (searchQuery.trim()) {
      const sanitizedQuery = sanitizeInput(searchQuery.toLowerCase());
      const filtered = allResults.filter(result =>
        result.title.toLowerCase().includes(sanitizedQuery) ||
        result.description.toLowerCase().includes(sanitizedQuery) ||
        result.category.toLowerCase().includes(sanitizedQuery)
      );
      setSearchResults(filtered);
      setIsSearchOpen(true);
    } else {
      // Show random results when no query
      const shuffled = [...allResults].sort(() => 0.5 - Math.random());
      setSearchResults(shuffled.slice(0, 6));
      setIsSearchOpen(false);
    }
  }, [searchQuery, user]);

  // Handle click outside to close search
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

  const handleSearchResultClick = (result: SearchResult) => {
    setIsSearchOpen(false);
    setSearchQuery('');
    inputRef.current?.blur();
  };

  const handleSearchFocus = () => {
    if (!searchQuery.trim()) {
      setIsSearchOpen(true);
    }
  };

  return (
    <div className="fixed top-4 right-4 z-30 flex items-center gap-2 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm border border-zinc-300 dark:border-zinc-800 rounded-2xl px-3 py-2 shadow-sm">
      {/* Search - Compact width */}
      <div className="flex-1 max-w-xs mr-4" ref={searchRef}>
        <div className="relative">
          <Search className="absolute z-50 left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            ref={inputRef}
            placeholder="Find..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={handleSearchFocus}
            className="pl-10 pr-12 py-2 border-zinc-200 dark:border-zinc-700 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm rounded-xl focus:bg-white dark:focus:bg-zinc-900 transition-all"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
            <kbd className="px-2 py-1 text-xs bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded-lg text-zinc-600 dark:text-zinc-400">
              F
            </kbd>
          </div>
        </div>

        <AnimatePresence>
          {isSearchOpen && searchResults.length > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full mt-2 left-0 right-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-4 z-50"
            >
              <div className="max-h-80 overflow-y-auto space-y-2">
                {searchResults.map((result) => {
                  const Icon = result.icon;
                  return (
                    <Link
                      key={result.id}
                      href={result.path}
                      onClick={() => handleSearchResultClick(result)}
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
                      <ExternalLink className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 opacity-0 group-hover:opacity-100 transition-all" />
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Right side utilities */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="w-10 h-10 rounded-xl hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Bell className="w-5 h-5" />
          </Button>
          {notifications > 0 && (
            <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center text-xs bg-red-500 hover:bg-red-500">
              {notifications}
            </Badge>
          )}
        </div>

        {/* Accessibility */}
        <Button
          variant="ghost"
          size="icon"
          onClick={openAccessibilityPanel}
          className="w-10 h-10 rounded-xl hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
        <svg 
            id="Layer_1" 
            data-name="Layer 1" 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 122.88 122.88"
            className="w-5 h-5"
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
              className="w-10 h-10 rounded-xl hover:text-black dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <HelpCircle className="w-5 h-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-56 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-zinc-200 dark:border-zinc-800"
          >
            <DropdownMenuLabel>Help & Resources</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/guide" className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  <span>User Guide</span>
                </div>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/help" className="flex items-center justify-between cursor-pointer">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4" />
                  <span>Help Center</span>
                </div>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/blog" className="flex items-center justify-between cursor-pointer">
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
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  Calendar,
  Video,
  FileText,
  ClipboardList,
  FlaskConical,
  CreditCard,
  MessageSquare,
  User,
  Users,
  UsersRound,
  Clock,
  HeartPulse,
  Pill,
  Building,
  Building2,
  BarChart,
  Settings,
  History,
  ClipboardCheck,
  Laptop,
  Box,
  ShoppingCart,
  TestTube,
  Banknote,
  LineChart,
  File,
  ListChecks,
  ChevronLeft,
  ChevronRight,
  Menu,
  LoaderCircle,
  X,
  Bot,
  Activity,
  Languages,
  Accessibility,
  LogOut,
  ChevronDown,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Type,
  Contrast,
  Move,
  MousePointer,
  Palette,
  RotateCcw,
  BookOpen,
  Zap,
  Focus,
  Pause,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Minus,
  Plus,
  Moon,
  Sun,
  Monitor,
  QrCode,
  AlarmClock,
  ScanLine,
  Stethoscope,
  Search,
  IdCard,
  Brain,
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  dashboardRoutes,
  RouteWithChildren,
  Route,
  type UserRole,
} from "@/app/types/routes";
import { useAuth } from "@/app/contexts/auth-context";
import { useSidebar } from "@/app/(dashboard)/layout";
import { useAccessibility } from '@/app/contexts/accessibility-context';

// Icon mapping
const iconMap = {
  "layout-dashboard": LayoutDashboard,
  calendar: Calendar,
  video: Video,
  "file-text": FileText,
  "clipboard-list": ClipboardList,
  "flask-conical": FlaskConical,
  "credit-card": CreditCard,
  "message-square": MessageSquare,
  user: User,
  users: Users,
  "users-round": UsersRound,
  clock: Clock,
  "heart-pulse": HeartPulse,
  pill: Pill,
  building: Building,
  "building-2": Building2,
  "bar-chart": BarChart,
  settings: Settings,
  history: History,
  "clipboard-check": ClipboardCheck,
  laptop: Laptop,
  box: Box,
  "shopping-cart": ShoppingCart,
  "test-tube": TestTube,
  banknote: Banknote,
  "line-chart": LineChart,
  file: File,
  "list-checks": ListChecks,
  bot: Bot,
  activity: Activity,
  "qr-code": QrCode,
  "alarm-clock": AlarmClock,
  scan: ScanLine,
  stethoscope: Stethoscope,
  search: Search,
  "id-card": IdCard,
  brain: Brain,
};

interface DashboardSidebarProps {
  className?: string;
}

interface AccessibilitySettings {
  oversizedWidget: boolean;
  screenReader: boolean;
  contrast: boolean;
  smartContrast: boolean;
  highlightLinks: boolean;
  biggerText: boolean;
  textSpacing: boolean;
  pauseAnimations: boolean;
  hideImages: boolean;
  dyslexiaFriendly: boolean;
  cursor: boolean;
  tooltips: boolean;
  pageStructure: boolean;
  lineHeight: number;
  textAlign: 'left' | 'center' | 'right';
  dictionary: boolean;
}

const defaultAccessibilitySettings: AccessibilitySettings = {
  oversizedWidget: false,
  screenReader: false,
  contrast: false,
  smartContrast: false,
  highlightLinks: false,
  biggerText: false,
  textSpacing: false,
  pauseAnimations: false,
  hideImages: false,
  dyslexiaFriendly: false,
  cursor: false,
  tooltips: false,
  pageStructure: false,
  lineHeight: 1.5,
  textAlign: 'left',
  dictionary: false,
};

interface SidebarContentProps {
  isCollapsed?: boolean;
  onNavigate?: () => void;
}

function AccessibilitySheet({ 
  isOpen, 
  onOpenChange, 
  onClose 
}: { 
  isOpen: boolean; 
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
}) {
  const { settings, updateSetting, resetSettings, applyQuickProfile } = useAccessibility();

  const AccessibilityToggle = ({ 
    icon: Icon, 
    title, 
    description, 
    settingKey,
    className 
  }: {
    icon: React.ElementType;
    title: string;
    description: string;
    settingKey: keyof AccessibilitySettings;
    className?: string;
  }) => (
    <div className={cn("flex items-center justify-between p-4 rounded-lg border border-red-200/50 dark:border-red-800/50 bg-red-50/30 dark:bg-red-950/20", className)}>
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
          <Icon className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h4 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{title}</h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{description}</p>
        </div>
      </div>
      <Switch
        checked={settings[settingKey] as boolean}
        onCheckedChange={(checked) => updateSetting(settingKey, checked)}
        className="data-[state=checked]:bg-red-600"
      />
    </div>
  );

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-96 p-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-red-200/50 dark:border-red-800/50"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-red-200/50 dark:border-red-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                <Accessibility className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="font-semibold text-lg text-zinc-900 dark:text-zinc-100">
                  Accessibility Profiles
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  Customize your experience
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Profile Selection */}
            <div className="space-y-3">
              <h3 className="font-medium text-zinc-900 dark:text-zinc-100">Quick Profiles</h3>
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => applyQuickProfile('motor')}
                  className="p-3 rounded-lg border border-red-200/50 dark:border-red-800/50 bg-red-50/30 dark:bg-red-950/20 hover:bg-red-100/50 dark:hover:bg-red-900/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium">Motor Impaired</span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Adjust motor functions</p>
                </button>
                <button 
                  onClick={() => applyQuickProfile('blind')}
                  className="p-3 rounded-lg border border-red-200/50 dark:border-red-800/50 bg-red-50/30 dark:bg-red-950/20 hover:bg-red-100/50 dark:hover:bg-red-900/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <EyeOff className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium">Blind</span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Screen reader friendly</p>
                </button>
                <button 
                  onClick={() => applyQuickProfile('dyslexia')}
                  className="p-3 rounded-lg border border-red-200/50 dark:border-red-800/50 bg-red-50/30 dark:bg-red-950/20 hover:bg-red-100/50 dark:hover:bg-red-900/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <BookOpen className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium">Dyslexia</span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Reading assistance</p>
                </button>
                <button 
                  onClick={() => applyQuickProfile('cognitive')}
                  className="p-3 rounded-lg border border-red-200/50 dark:border-red-800/50 bg-red-50/30 dark:bg-red-950/20 hover:bg-red-100/50 dark:hover:bg-red-900/30 transition-colors text-left"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Focus className="w-4 h-4 text-red-600 dark:text-red-400" />
                    <span className="text-sm font-medium">Cognitive & Learning</span>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Focus assistance</p>
                </button>
              </div>
            </div>

            <Separator className="bg-red-200/50 dark:bg-red-800/50" />

            {/* Oversized Widget Toggle */}
            <div className="flex items-center justify-between p-4 rounded-lg border-2 border-red-300 dark:border-red-700 bg-red-100/50 dark:bg-red-900/30">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-red-200 dark:bg-red-800">
                  <Move className="w-5 h-5 text-red-700 dark:text-red-300" />
                </div>
                <div>
                  <h4 className="font-medium text-red-900 dark:text-red-100">Oversized Widget</h4>
                  <p className="text-sm text-red-700 dark:text-red-300">Make interface elements larger</p>
                </div>
              </div>
              <Switch
                checked={settings.oversizedWidget}
                onCheckedChange={(checked) => updateSetting('oversizedWidget', checked)}
                className="data-[state=checked]:bg-red-600"
              />
            </div>

            {/* Individual Settings */}
            <div className="space-y-4">
              <h3 className="font-medium text-zinc-900 dark:text-zinc-100">Individual Settings</h3>
              
              <div className="grid gap-3">
                <AccessibilityToggle
                  icon={Volume2}
                  title="Screen Reader"
                  description="Enable screen reader support"
                  settingKey="screenReader"
                />
                
                <AccessibilityToggle
                  icon={Palette}
                  title="Contrast +"
                  description="Increase color contrast"
                  settingKey="contrast"
                />
                
                <AccessibilityToggle
                  icon={Contrast}
                  title="Smart Contrast"
                  description="Intelligent contrast adjustment"
                  settingKey="smartContrast"
                />
                
                <AccessibilityToggle
                  icon={LinkIcon}
                  title="Highlight Links"
                  description="Make links more visible"
                  settingKey="highlightLinks"
                />
                
                <AccessibilityToggle
                  icon={Type}
                  title="Bigger Text"
                  description="Increase font size"
                  settingKey="biggerText"
                />
                
                <AccessibilityToggle
                  icon={AlignLeft}
                  title="Text Spacing"
                  description="Improve text readability"
                  settingKey="textSpacing"
                />
                
                <AccessibilityToggle
                  icon={Pause}
                  title="Pause Animations"
                  description="Stop moving elements"
                  settingKey="pauseAnimations"
                />
                
                <AccessibilityToggle
                  icon={EyeOff}
                  title="Hide Images"
                  description="Hide decorative images"
                  settingKey="hideImages"
                />
                
                <AccessibilityToggle
                  icon={BookOpen}
                  title="Dyslexia Friendly"
                  description="Use dyslexia-friendly fonts"
                  settingKey="dyslexiaFriendly"
                />
                
                <AccessibilityToggle
                  icon={MousePointer}
                  title="Cursor"
                  description="Enhanced cursor visibility"
                  settingKey="cursor"
                />
                
                <AccessibilityToggle
                  icon={MessageSquare}
                  title="Tooltips"
                  description="Show helpful tooltips"
                  settingKey="tooltips"
                />
                
                <AccessibilityToggle
                  icon={AlignLeft}
                  title="Page Structure"
                  description="Show page structure"
                  settingKey="pageStructure"
                />
                
                <AccessibilityToggle
                  icon={BookOpen}
                  title="Dictionary"
                  description="Enable word definitions"
                  settingKey="dictionary"
                />
              </div>

              {/* Line Height Control */}
              <div className="p-4 rounded-lg border border-red-200/50 dark:border-red-800/50 bg-red-50/30 dark:bg-red-950/20">
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    Line Height
                  </Label>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {settings.lineHeight}x
                  </span>
                </div>
                <Slider
                  value={[settings.lineHeight]}
                  onValueChange={([value]) => updateSetting('lineHeight', value)}
                  min={1}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>

              {/* Text Alignment */}
              <div className="p-4 rounded-lg border border-red-200/50 dark:border-red-800/50 bg-red-50/30 dark:bg-red-950/20">
                <Label className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3 block">
                  Text Alignment
                </Label>
                <div className="flex gap-2">
                  {[
                    { value: 'left', icon: AlignLeft },
                    { value: 'center', icon: AlignCenter },
                    { value: 'right', icon: AlignRight },
                  ].map(({ value, icon: Icon }) => (
                    <Button
                      key={value}
                      variant={settings.textAlign === value ? "default" : "outline"}
                      size="sm"
                      onClick={() => updateSetting('textAlign', value as 'left' | 'center' | 'right')}
                      className={cn(
                        "flex-1",
                        settings.textAlign === value && "bg-red-600 hover:bg-red-700"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-red-200/50 dark:border-red-800/50">
            <Button
              variant="outline"
              onClick={resetSettings}
              className="w-full border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset All Accessibility Settings
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export function SidebarContent({
  isCollapsed = false,
  onNavigate,
}: SidebarContentProps) {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [accessibilityOpen, setAccessibilityOpen] = React.useState(false);

  // Don't render if user is not authenticated
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-sm text-muted-foreground animate-spin">
          <LoaderCircle />
        </div>
      </div>
    );
  }

  const routes = dashboardRoutes[user.role] || [];

  const isActiveRoute = (routePath: string) => {
    if (routePath === "/dashboard" && pathname === "/dashboard") return true;
    if (routePath === `/${user.role}` && pathname === `/${user.role}`) return true;
    if (routePath !== "/dashboard" && routePath !== `/${user.role}` && pathname.startsWith(routePath))
      return true;
    return false;
  };

  // Function to collect all routes including children for collapsed view
  const getAllRoutes = (routes: RouteWithChildren[]): RouteWithChildren[] => {
    const allRoutes: RouteWithChildren[] = [];
    routes.forEach(route => {
      allRoutes.push(route);
      if (route.children) {
        allRoutes.push(...route.children);
      }
    });
    return allRoutes;
  };

  const renderCollapsedNavItem = (route: RouteWithChildren) => {
    const Icon = route.icon
      ? iconMap[route.icon as keyof typeof iconMap]
      : LayoutDashboard;
    const isActive = isActiveRoute(route.path);

    return (
      <motion.div
        key={route.path}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="relative group"
      >
        <Link
          href={route.path}
          onClick={onNavigate}
          className={cn(
            "flex items-center justify-center w-10 h-10 rounded-xl text-sm font-medium transition-all duration-300",
            "hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50",
            "dark:hover:from-red-950/30 dark:hover:to-rose-950/30",
            "relative overflow-hidden",
            isActive && [
              "bg-gradient-to-r from-red-500/10 to-rose-500/10",
              "dark:from-red-400/10 dark:to-rose-400/10",
              "text-red-600 dark:text-red-400",
              "shadow-sm border border-red-200/50 dark:border-red-800/50",
            ],
            !isActive &&
              "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
          )}
        >
          {/* Glow effect for active items */}
          {isActive && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-rose-500/5 rounded-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}

          <Icon
            className={cn(
              "w-5 h-5 shrink-0 transition-all duration-300",
              isActive
                ? "text-red-600 dark:text-red-400"
                : "text-zinc-500 dark:text-zinc-400"
            )}
          />
        </Link>

        {/* Tooltip */}
        <div className="absolute left-full ml-2 px-2 py-1 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
          {route.name}
        </div>
      </motion.div>
    );
  };

  const renderNavItem = (route: RouteWithChildren, level: number = 0) => {
    const Icon = route.icon
      ? iconMap[route.icon as keyof typeof iconMap]
      : LayoutDashboard;
    const isActive = isActiveRoute(route.path);
    const hasChildren = route.children && route.children.length > 0;

    return (
      <div key={route.path} className={cn("w-full", level > 0 && "ml-4")}>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.2 }}
        >
          <Link
            href={route.path}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
              "hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50",
              "dark:hover:from-red-950/30 dark:hover:to-rose-950/30",
              "group relative overflow-hidden",
              isActive && [
                "bg-gradient-to-r from-red-500/10 to-rose-500/10",
                "dark:from-red-400/10 dark:to-rose-400/10",
                "text-red-600 dark:text-red-400",
                "shadow-sm border border-red-200/50 dark:border-red-800/50",
              ],
              !isActive &&
                "text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100"
            )}
          >
            {/* Glow effect for active items */}
            {isActive && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-rose-500/5 rounded-xl"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}

            <Icon
              className={cn(
                "shrink-0 transition-all duration-300",
                isActive
                  ? "text-red-600 dark:text-red-400"
                  : "text-zinc-500 dark:text-zinc-400",
                "w-4 h-4"
              )}
            />

            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="truncate"
            >
              {route.name}
            </motion.span>

            {/* Active indicator */}
            {isActive && (
              <motion.div
                className="absolute right-2 w-1.5 h-1.5 bg-red-500 rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1 }}
              />
            )}
          </Link>
        </motion.div>

        {/* Children routes */}
        <AnimatePresence>
          {hasChildren && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-1 space-y-1"
            >
              {route.children?.map((child) => renderNavItem(child, level + 1))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const handleAccessibilityOpen = () => {
    setAccessibilityOpen(true);
  };

  const handleAccessibilityClose = () => {
    setAccessibilityOpen(false);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-6 border-b border-zinc-200 dark:border-zinc-800",
          isCollapsed && "px-2 justify-center"
        )}
      >
        <div className={cn(
          "h-auto bg-transparent rounded-lg flex items-center justify-center",
          isCollapsed ? "w-8" : "w-10"
        )}>
          <Image
            src="/icon0.svg"
            alt="HealthSphere"
            width={500}
            height={500}
            priority
            className="object-contain"
          />
        </div>
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
            >
              <h1 className="font-bold text-lg bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                HealthSphere
              </h1>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-hidden">
        {isCollapsed ? (
          // Collapsed view - show all routes as icons
          <div className="space-y-2">
            {getAllRoutes(routes).map((route) => renderCollapsedNavItem(route))}
          </div>
        ) : (
          // Expanded view - show hierarchical structure
          routes.map((route) => renderNavItem(route))
        )}
      </nav>

      {/* User section */}
      <div
        className={cn(
          "px-4 py-4 border-t border-zinc-200 dark:border-zinc-800",
          isCollapsed && "px-2"
        )}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <div
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors cursor-pointer group",
                isCollapsed && "justify-center px-2"
              )}
            >
              <Avatar
                className={cn(
                  "transition-all duration-300",
                  isCollapsed ? "w-8 h-8" : "w-8 h-8"
                )}
              >
                <AvatarImage
                  src={user.profileImageUrl}
                  alt={`${user.firstName} ${user.lastName}`}
                />
                <AvatarFallback className="bg-gradient-to-br from-red-400 to-rose-500 text-white text-sm font-medium">
                  {user.firstName[0]?.toUpperCase()}
                  {user.lastName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between flex-1 min-w-0"
                  >
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                          {user.firstName} {user.lastName}
                        </span>
                        {user.isActive && (
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                        {user.role
                          .replace("_", " ")
                          .replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                    </div>
                    <ChevronDown className="w-4 h-4 text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors" />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </DropdownMenuTrigger>

          <DropdownMenuContent 
            className="w-72 p-2"
            align={isCollapsed ? "center" : "start"}
            side={isCollapsed ? "right" : "top"}
          >
            {/* User Profile Section */}
            <div className="flex items-center gap-3 p-3 mb-2 rounded-lg bg-gray-100 dark:bg-zinc-800">
              <Avatar className="w-12 h-12">
                <AvatarImage
                  src={user.profileImageUrl}
                  alt={`${user.firstName} ${user.lastName}`}
                />
                <AvatarFallback className="bg-gray-200 dark:bg-gray-700 text-white font-medium">
                  {user.firstName[0]?.toUpperCase()}
                  {user.lastName[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                    {user.firstName} {user.lastName}
                  </h3>
                  {user.isActive && (
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0" />
                  )}
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 truncate">
                  {user.role.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">
                  {user.email}
                </p>
              </div>
            </div>

            <DropdownMenuSeparator />

            {/* Theme Toggle */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex items-center gap-2">
                {theme === 'dark' ? (
                  <Moon className="w-4 h-4 text-zinc-900 hover:text-zinc-100 dark:text-zinc-100" />
                ) : theme === 'light' ? (
                  <Sun className="w-4 h-4 text-zinc-900 hover:text-zinc-100 dark:text-zinc-100" />
                ) : (
                  <Monitor className="w-4 h-4 text-zinc-900 hover:text-zinc-100 dark:text-zinc-100" />
                )}
                <span>Theme</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-40">
                <DropdownMenuLabel>Select Theme</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setTheme('light')}>
                  <Sun className="w-4 h-4 mr-2" />
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('dark')}>
                  <Moon className="w-4 h-4 mr-2" />
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme('system')}>
                  <Monitor className="w-4 h-4 mr-2" />
                  System
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            {/* Language Picker */}
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="flex items-center gap-2">
                <Languages className="w-4 h-4 text-zinc-900 dark:text-zinc-100" />
                <span>Language</span>
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent 
                className="w-48"
                avoidCollisions={true}
                collisionPadding={8}
              >
                <DropdownMenuLabel>Select Language</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span className="mr-2">🇺🇸</span>
                  English (US)
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span className="mr-2">🇬🇧</span>
                  English (UK)
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span className="mr-2">🇪🇸</span>
                  Español
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span className="mr-2">🇫🇷</span>
                  Français
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span className="mr-2">🇩🇪</span>
                  Deutsch
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span className="mr-2">🇯🇵</span>
                  日本語
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span className="mr-2">🇨🇳</span>
                  中文
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>

            <DropdownMenuSeparator />

            {/* Logout */}
            <DropdownMenuItem
              className="flex items-center gap-2 cursor-pointer focus:text-red-700 dark:focus:text-red-300"
              onClick={logout}
            >
              <LogOut className="w-4 h-4 text-red-600 dark:text-red-400 hover:text-white dark:hover:text-white" />
              <span className="text-red-600 dark:text-red-400 hover:text-red-100 dark:hover:text-red-100">Logout</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Accessibility Sheet */}
      <AccessibilitySheet
        isOpen={accessibilityOpen}
        onOpenChange={setAccessibilityOpen}
        onClose={handleAccessibilityClose}
      />
    </div>
  );
}

// Desktop Sidebar Component
function DesktopSidebar() {
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  // Notify parent component about collapse state changes
  React.useEffect(() => {
    const event = new CustomEvent('sidebarToggle', { detail: { isCollapsed } });
    window.dispatchEvent(event);
  }, [isCollapsed]);

  return (
    <motion.div
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "fixed left-4 top-4 bottom-4 z-40 transition-all duration-300 ease-in-out",
        "bg-white dark:bg-zinc-900",
        "border border-zinc-200 dark:border-zinc-800",
        "rounded-2xl shadow-xl",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Toggle button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          "absolute -right-4 top-6 z-50 w-6 h-6 rounded-full",
          "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700",
          "shadow-lg hover:shadow-xl transition-all duration-200",
          "hover:scale-110"
        )}
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </Button>

      <SidebarContent isCollapsed={isCollapsed} />
    </motion.div>
  );
}

// Mobile Sidebar Component
function MobileSidebar() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      {/* Mobile trigger button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed top-4 left-4 z-50 md:hidden",
          "w-10 h-10 rounded-xl",
          "bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl",
          "border border-zinc-200 dark:border-zinc-800",
          "shadow-lg hover:shadow-xl transition-all duration-200"
        )}
      >
        <Menu className="w-5 h-5" />
      </Button>

      {/* Mobile Sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent
          side="left"
          className={cn(
            "p-0 w-72 border-none",
            "bg-white/95 dark:bg-black/95 backdrop-blur-xl",
            "shadow-2xl"
          )}
        >
          <SidebarContent onNavigate={() => setIsOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  );
}

// Main Dashboard Sidebar Component
export default function DashboardSidebar({ className }: DashboardSidebarProps) {
  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <DesktopSidebar />
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar />
    </>
  );
}
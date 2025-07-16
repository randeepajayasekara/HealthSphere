"use client";

import React from "react";
import { UserRole } from "@/app/types";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Heart, 
  Shield, 
  Settings, 
  Activity, 
  Phone,
  Accessibility
} from "lucide-react";
import { cn } from "@/lib/utils";

type ProfileSection = 
  | "personal" 
  | "contact" 
  | "medical" 
  | "security" 
  | "accessibility" 
  | "preferences" 
  | "activity";

interface ProfileNavigationProps {
  activeSection: ProfileSection;
  onSectionChange: (section: ProfileSection) => void;
  userRole: UserRole;
}

interface NavigationItem {
  id: ProfileSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  roles: UserRole[]; // Which roles can access this section
}

const navigationItems: NavigationItem[] = [
  {
    id: "personal",
    label: "Personal",
    icon: User,
    description: "Basic information",
    roles: ["patient", "doctor", "nurse", "admin", "receptionist", "pharmacist", "lab_technician", "hospital_management"]
  },
  {
    id: "contact",
    label: "Contact",
    icon: Phone,
    description: "Contact details",
    roles: ["patient", "doctor", "nurse", "admin", "receptionist", "pharmacist", "lab_technician", "hospital_management"]
  },
  {
    id: "medical",
    label: "Medical",
    icon: Heart,
    description: "Health information",
    roles: ["patient", "doctor", "nurse"] // Medical info mainly for patients, with limited access for medical staff
  },
  {
    id: "security",
    label: "Security",
    icon: Shield,
    description: "Account security",
    roles: ["patient", "doctor", "nurse", "admin", "receptionist", "pharmacist", "lab_technician", "hospital_management"]
  },
  {
    id: "accessibility",
    label: "Accessibility",
    icon: Accessibility,
    description: "Accessibility features",
    roles: ["patient", "doctor", "nurse", "admin", "receptionist", "pharmacist", "lab_technician", "hospital_management"]
  },
  {
    id: "preferences",
    label: "Preferences",
    icon: Settings,
    description: "App preferences",
    roles: ["patient", "doctor", "nurse", "admin", "receptionist", "pharmacist", "lab_technician", "hospital_management"]
  },
  {
    id: "activity",
    label: "Activity",
    icon: Activity,
    description: "Account activity",
    roles: ["patient", "doctor", "nurse", "admin", "receptionist", "pharmacist", "lab_technician", "hospital_management"]
  }
];

export function ProfileNavigation({ 
  activeSection, 
  onSectionChange, 
  userRole 
}: ProfileNavigationProps) {
  // Filter navigation items based on user role
  const availableItems = navigationItems.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <nav className="space-y-2">
      <h3 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">
        Profile Sections
      </h3>
      
      <div className="space-y-1">
        {availableItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <div key={item.id}>
              <Button
                variant="ghost"
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  "w-full justify-start h-auto p-3 text-left transition-all duration-200",
                  "hover:bg-emerald-50 dark:hover:bg-emerald-950/30",
                  isActive && [
                    "bg-emerald-100 dark:bg-emerald-950/50",
                    "text-emerald-700 dark:text-emerald-300",
                    "border-r-2 border-emerald-500 dark:border-emerald-400",
                    "font-medium"
                  ],
                  !isActive && "text-zinc-600 dark:text-zinc-400"
                )}
              >
                <div className="flex items-center space-x-3 w-full">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    isActive 
                      ? "bg-emerald-200 dark:bg-emerald-900/50" 
                      : "bg-zinc-100 dark:bg-zinc-800"
                  )}>
                    <Icon className={cn(
                      "w-4 h-4",
                      isActive 
                        ? "text-emerald-600 dark:text-emerald-400" 
                        : "text-zinc-500 dark:text-zinc-400"
                    )} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">
                      {item.label}
                    </div>
                    <div className={cn(
                      "text-xs mt-0.5",
                      isActive 
                        ? "text-emerald-600 dark:text-emerald-400" 
                        : "text-zinc-500 dark:text-zinc-400"
                    )}>
                      {item.description}
                    </div>
                  </div>
                </div>
              </Button>
              
              {/* Add separator between sections, but not after the last item */}
              {index < availableItems.length - 1 && (
                <Separator className="my-2 bg-zinc-200 dark:bg-zinc-800" />
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="pt-6">
        <Separator className="mb-4 bg-zinc-200 dark:bg-zinc-800" />
        <h4 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-3">
          Quick Actions
        </h4>
        
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs text-zinc-600 dark:text-zinc-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
          >
            <Shield className="w-3 h-3 mr-2" />
            Change Password
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-xs text-zinc-600 dark:text-zinc-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
          >
            <Settings className="w-3 h-3 mr-2" />
            Privacy Settings
          </Button>
        </div>
      </div>
    </nav>
  );
}

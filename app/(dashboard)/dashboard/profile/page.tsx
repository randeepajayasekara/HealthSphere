"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/auth-context";
import { ProfileHeader } from "@/app/components/dashboard/profile/profile-header";
import { PersonalInfoSection } from "@/app/components/dashboard/profile/personal-info-section";
import { ContactInfoSection } from "@/app/components/dashboard/profile/contact-info-section";
import { SecuritySection } from "@/app/components/dashboard/profile/security-section";
import { AccessibilitySection } from "@/app/components/dashboard/profile/accessibility-section";
import { MedicalInfoSection } from "@/app/components/dashboard/profile/medical-info-section";
import { PreferencesSection } from "@/app/components/dashboard/profile/preferences-section";
import { ActivitySection } from "@/app/components/dashboard/profile/activity-section";
import { ProfileNavigation } from "@/app/components/dashboard/profile/profile-navigation";
import { ProfileSkeleton } from "@/app/components/dashboard/profile/profile-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AlertTriangle, Shield, Heart, Settings, Activity, User } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProfileProvider } from "@/app/contexts/profile-context";
import { cn } from "@/lib/utils";

type ProfileSection = 
  | "personal" 
  | "contact" 
  | "medical" 
  | "security" 
  | "accessibility" 
  | "preferences" 
  | "activity";

export default function ProfilePage() {
  const { user, isLoading, error } = useAuth();
  const [activeSection, setActiveSection] = useState<ProfileSection>("personal");
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      setIsProfileLoading(false);
    }
  }, [isLoading]);

  if (isLoading || isProfileLoading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Unable to load profile information. Please try refreshing the page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Please sign in to view your profile.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const sectionComponents = {
    personal: PersonalInfoSection,
    contact: ContactInfoSection,
    medical: MedicalInfoSection,
    security: SecuritySection,
    accessibility: AccessibilitySection,
    preferences: PreferencesSection,
    activity: ActivitySection,
  };

  const ActiveComponent = sectionComponents[activeSection];

  return (
    <ProfileProvider>
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-emerald-50/30 dark:from-black dark:via-zinc-950 dark:to-emerald-950/10">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Profile Header */}
          <ProfileHeader user={user} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
            {/* Navigation Sidebar */}
            <div className="lg:col-span-3">
              <Card className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-zinc-200/60 dark:border-zinc-800/60 shadow-lg">
                <CardContent className="p-6">
                  <ProfileNavigation
                    activeSection={activeSection}
                    onSectionChange={setActiveSection}
                    userRole={user.role}
                  />
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-9">
              <Card className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm border-zinc-200/60 dark:border-zinc-800/60 shadow-lg">
                <CardContent className="p-8">
                  <ScrollArea className="h-[calc(100vh-12rem)]">
                    <div className="space-y-8">
                      {/* Section Header */}
                      <div className="flex items-center space-x-3">
                        {getSectionIcon(activeSection)}
                        <div>
                          <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                            {getSectionTitle(activeSection)}
                          </h2>
                          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                            {getSectionDescription(activeSection)}
                          </p>
                        </div>
                      </div>

                      <Separator className="bg-zinc-200 dark:bg-zinc-800" />

                      {/* Active Section Content */}
                      <div className="animate-in fade-in-50 duration-300">
                        <ActiveComponent user={user} />
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </ProfileProvider>
  );
}

function getSectionIcon(section: ProfileSection) {
  const iconClass = "h-6 w-6 text-emerald-600 dark:text-emerald-400";
  
  switch (section) {
    case "personal":
      return <User className={iconClass} />;
    case "contact":
      return <User className={iconClass} />;
    case "medical":
      return <Heart className={iconClass} />;
    case "security":
      return <Shield className={iconClass} />;
    case "accessibility":
      return <Settings className={iconClass} />;
    case "preferences":
      return <Settings className={iconClass} />;
    case "activity":
      return <Activity className={iconClass} />;
    default:
      return <User className={iconClass} />;
  }
}

function getSectionTitle(section: ProfileSection) {
  const titles = {
    personal: "Personal Information",
    contact: "Contact Details",
    medical: "Medical Information",
    security: "Security & Privacy",
    accessibility: "Accessibility",
    preferences: "Preferences",
    activity: "Activity & History",
  };
  
  return titles[section];
}

function getSectionDescription(section: ProfileSection) {
  const descriptions = {
    personal: "Manage your basic profile information and personal details",
    contact: "Update your contact information and emergency contacts",
    medical: "View and manage your medical information and history",
    security: "Configure security settings and manage account access",
    accessibility: "Customize accessibility features for better experience",
    preferences: "Set your notification and application preferences",
    activity: "View your account activity and usage history",
  };
  
  return descriptions[section];
}

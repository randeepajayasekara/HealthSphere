"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/app/contexts/auth-context";
import { ProfileHeader } from "@/app/components/dashboard/profile/profile-header";
import { PersonalInfoSection } from "@/app/components/dashboard/profile/personal-info-section";
import { ContactInfoSection } from "@/app/components/dashboard/profile/contact-info-section";
import { SecuritySection } from "@/app/components/dashboard/profile/security-section";
import { AccessibilitySection } from "@/app/components/dashboard/profile/accessibility-section";
import { PreferencesSection } from "@/app/components/dashboard/profile/preferences-section";
import { ActivitySection } from "@/app/components/dashboard/profile/activity-section";
import { ProfileNavigation } from "@/app/components/dashboard/profile/profile-navigation";
import { ProfileSkeleton } from "@/app/components/dashboard/profile/profile-skeleton";
import { DoctorProfessionalSection } from "@/app/components/doctor/doctor-professional-section";
import { DoctorScheduleSection } from "@/app/components/doctor/doctor-schedule-section";
import { DoctorAnalyticsSection } from "@/app/components/doctor/doctor-analytics-section";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProfileProvider } from "@/app/contexts/profile-context";
import { 
  AlertTriangle, 
  Shield, 
  Heart, 
  Settings, 
  Activity, 
  User, 
  Stethoscope, 
  Calendar, 
  BarChart3 
} from "lucide-react";

type DoctorProfileSection = 
  | "personal" 
  | "contact" 
  | "professional"
  | "schedule"
  | "analytics"
  | "security" 
  | "accessibility" 
  | "preferences" 
  | "activity";

export default function DoctorProfilePage() {
  const { user, isLoading, error } = useAuth();
  const [activeSection, setActiveSection] = useState<DoctorProfileSection>("personal");
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
            Error loading profile: {error}
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
            Please log in to view your profile.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (user.role !== "doctor") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Access denied. This page is only available to doctors.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const renderSection = () => {
    switch (activeSection) {
      case "personal":
        return <PersonalInfoSection user={user} />;
      case "contact":
        return <ContactInfoSection user={user} />;
      case "professional":
        return <DoctorProfessionalSection user={user} />;
      case "schedule":
        return <DoctorScheduleSection user={user} />;
      case "analytics":
        return <DoctorAnalyticsSection user={user} />;
      case "security":
        return <SecuritySection user={user} />;
      case "accessibility":
        return <AccessibilitySection user={user} />;
      case "preferences":
        return <PreferencesSection user={user} />;
      case "activity":
        return <ActivitySection user={user} />;
      default:
        return <PersonalInfoSection user={user} />;
    }
  };

  const getSectionIcon = (section: DoctorProfileSection) => {
    switch (section) {
      case "personal":
        return <User className="h-4 w-4" />;
      case "contact":
        return <Heart className="h-4 w-4" />;
      case "professional":
        return <Stethoscope className="h-4 w-4" />;
      case "schedule":
        return <Calendar className="h-4 w-4" />;
      case "analytics":
        return <BarChart3 className="h-4 w-4" />;
      case "security":
        return <Shield className="h-4 w-4" />;
      case "accessibility":
        return <Settings className="h-4 w-4" />;
      case "preferences":
        return <Settings className="h-4 w-4" />;
      case "activity":
        return <Activity className="h-4 w-4" />;
      default:
        return <User className="h-4 w-4" />;
    }
  };

  return (
    <ProfileProvider>
      <div className="min-h-screen bg-zinc-50 dark:bg-black">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Sidebar Navigation */}
            <div className="xl:col-span-3">
              <Card className="sticky top-8 border-zinc-200 dark:border-zinc-800">
                <div className="p-4">
                  <ProfileHeader user={user} />
                  <Separator className="my-4" />
                  
                  {/* Doctor-specific Navigation */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
                      Profile Sections
                    </h3>
                    
                    {/* Basic Information */}
                    <div className="space-y-1">
                      <button
                        onClick={() => setActiveSection("personal")}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "personal"
                            ? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        {getSectionIcon("personal")}
                        <span>Personal Information</span>
                      </button>
                      
                      <button
                        onClick={() => setActiveSection("contact")}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "contact"
                            ? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        {getSectionIcon("contact")}
                        <span>Contact Information</span>
                      </button>
                    </div>

                    <Separator className="my-4" />

                    {/* Professional Information */}
                    <div className="space-y-1">
                      <h4 className="text-xs font-medium text-zinc-500 dark:text-zinc-500 mb-2">
                        Professional
                      </h4>
                      
                      <button
                        onClick={() => setActiveSection("professional")}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "professional"
                            ? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        {getSectionIcon("professional")}
                        <span>Professional Details</span>
                      </button>
                      
                      <button
                        onClick={() => setActiveSection("schedule")}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "schedule"
                            ? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        {getSectionIcon("schedule")}
                        <span>Schedule & Availability</span>
                      </button>
                      
                      <button
                        onClick={() => setActiveSection("analytics")}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "analytics"
                            ? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        {getSectionIcon("analytics")}
                        <span>Performance Analytics</span>
                      </button>
                    </div>

                    <Separator className="my-4" />

                    {/* System Settings */}
                    <div className="space-y-1">
                      <h4 className="text-xs font-medium text-zinc-500 dark:text-zinc-500 mb-2">
                        System Settings
                      </h4>
                      
                      <button
                        onClick={() => setActiveSection("security")}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "security"
                            ? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        {getSectionIcon("security")}
                        <span>Security</span>
                      </button>
                      
                      <button
                        onClick={() => setActiveSection("accessibility")}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "accessibility"
                            ? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        {getSectionIcon("accessibility")}
                        <span>Accessibility</span>
                      </button>
                      
                      <button
                        onClick={() => setActiveSection("preferences")}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "preferences"
                            ? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        {getSectionIcon("preferences")}
                        <span>Preferences</span>
                      </button>
                      
                      <button
                        onClick={() => setActiveSection("activity")}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                          activeSection === "activity"
                            ? "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
                            : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                        }`}
                      >
                        {getSectionIcon("activity")}
                        <span>Activity Log</span>
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Main Content */}
            <div className="xl:col-span-9">
              <div className="max-w-full overflow-hidden">
                <div className="space-y-6">
                  {renderSection()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProfileProvider>
  );
}

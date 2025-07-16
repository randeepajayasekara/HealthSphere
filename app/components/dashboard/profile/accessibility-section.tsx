"use client";

import React, { useState } from "react";
import { User, AccessibilitySettings } from "@/app/types";
import { useProfile } from "@/app/contexts/profile-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Accessibility, 
  Eye, 
  Volume2, 
  Contrast, 
  Type, 
  Mouse, 
  Pause,
  ImageOff,
  BookOpen,
  HelpCircle,
  Settings,
  RotateCcw
} from "lucide-react";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

interface AccessibilitySectionProps {
  user: User;
}

export function AccessibilitySection({ user }: AccessibilitySectionProps) {
  const { updateAccessibilitySettings, isLoading, profileData } = useProfile();
  const [settings, setSettings] = useState<AccessibilitySettings>(
    profileData?.accessibility || {
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
      textAlign: "left",
      dictionary: false,
    }
  );

  const handleSettingChange = async (setting: keyof AccessibilitySettings, value: any) => {
    const newSettings = { ...settings, [setting]: value };
    setSettings(newSettings);
    
    try {
      await updateAccessibilitySettings({ [setting]: value });
    } catch (error) {
      // Revert on error
      setSettings(settings);
      toast.error("Failed to update accessibility setting");
    }
  };

  const handleQuickProfile = async (profile: string) => {
    let profileSettings: Partial<AccessibilitySettings> = {};
    
    switch (profile) {
      case "visual":
        profileSettings = {
          screenReader: true,
          contrast: true,
          biggerText: true,
          highlightLinks: true,
          pauseAnimations: true,
          tooltips: true,
        };
        break;
      case "motor":
        profileSettings = {
          oversizedWidget: true,
          cursor: true,
          pauseAnimations: true,
          biggerText: true,
        };
        break;
      case "cognitive":
        profileSettings = {
          dyslexiaFriendly: true,
          biggerText: true,
          textSpacing: true,
          pauseAnimations: true,
          pageStructure: true,
          tooltips: true,
          dictionary: true,
        };
        break;
      default:
        return;
    }

    const newSettings = { ...settings, ...profileSettings };
    setSettings(newSettings);
    
    try {
      await updateAccessibilitySettings(profileSettings);
      toast.success(`${profile.charAt(0).toUpperCase() + profile.slice(1)} accessibility profile applied`);
    } catch (error) {
      setSettings(settings);
      toast.error("Failed to apply accessibility profile");
    }
  };

  const resetSettings = async () => {
    const defaultSettings: AccessibilitySettings = {
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
      textAlign: "left",
      dictionary: false,
    };

    setSettings(defaultSettings);
    
    try {
      await updateAccessibilitySettings(defaultSettings);
      toast.success("Accessibility settings reset to default");
    } catch (error) {
      toast.error("Failed to reset accessibility settings");
    }
  };

  const accessibilityFeatures = [
    {
      category: "Visual",
      icon: Eye,
      features: [
        {
          key: "screenReader" as keyof AccessibilitySettings,
          label: "Screen Reader Support",
          description: "Optimize content for screen readers",
          icon: Volume2,
        },
        {
          key: "contrast" as keyof AccessibilitySettings,
          label: "High Contrast",
          description: "Increase contrast for better visibility",
          icon: Contrast,
        },
        {
          key: "smartContrast" as keyof AccessibilitySettings,
          label: "Smart Contrast",
          description: "Intelligent contrast adjustment",
          icon: Contrast,
        },
        {
          key: "highlightLinks" as keyof AccessibilitySettings,
          label: "Highlight Links",
          description: "Make links more visible",
          icon: Eye,
        },
        {
          key: "hideImages" as keyof AccessibilitySettings,
          label: "Hide Images",
          description: "Hide images to reduce distractions",
          icon: ImageOff,
        },
      ],
    },
    {
      category: "Text & Reading",
      icon: Type,
      features: [
        {
          key: "biggerText" as keyof AccessibilitySettings,
          label: "Bigger Text",
          description: "Increase text size for better readability",
          icon: Type,
        },
        {
          key: "textSpacing" as keyof AccessibilitySettings,
          label: "Text Spacing",
          description: "Add extra spacing between letters and words",
          icon: Type,
        },
        {
          key: "dyslexiaFriendly" as keyof AccessibilitySettings,
          label: "Dyslexia Friendly",
          description: "Use dyslexia-friendly fonts and formatting",
          icon: BookOpen,
        },
        {
          key: "dictionary" as keyof AccessibilitySettings,
          label: "Dictionary",
          description: "Enable dictionary tooltips for complex words",
          icon: BookOpen,
        },
      ],
    },
    {
      category: "Motor & Navigation",
      icon: Mouse,
      features: [
        {
          key: "oversizedWidget" as keyof AccessibilitySettings,
          label: "Oversized Widgets",
          description: "Make buttons and controls larger",
          icon: Mouse,
        },
        {
          key: "cursor" as keyof AccessibilitySettings,
          label: "Big Cursor",
          description: "Use a larger cursor for easier tracking",
          icon: Mouse,
        },
        {
          key: "pauseAnimations" as keyof AccessibilitySettings,
          label: "Pause Animations",
          description: "Reduce motion and animations",
          icon: Pause,
        },
      ],
    },
    {
      category: "Content Structure",
      icon: Settings,
      features: [
        {
          key: "tooltips" as keyof AccessibilitySettings,
          label: "Tooltips",
          description: "Show helpful tooltips throughout the interface",
          icon: HelpCircle,
        },
        {
          key: "pageStructure" as keyof AccessibilitySettings,
          label: "Page Structure",
          description: "Highlight page structure and navigation",
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick Accessibility Profiles */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Accessibility className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-lg">Quick Setup Profiles</CardTitle>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Apply pre-configured accessibility settings based on your needs
          </p>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => handleQuickProfile("visual")}
              className="h-auto p-4 flex flex-col items-center space-y-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300"
            >
              <Eye className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">Visual Impairments</div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                  High contrast, screen reader support
                </div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleQuickProfile("motor")}
              className="h-auto p-4 flex flex-col items-center space-y-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300"
            >
              <Mouse className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">Motor Difficulties</div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                  Larger controls, reduced motion
                </div>
              </div>
            </Button>
            
            <Button
              variant="outline"
              onClick={() => handleQuickProfile("cognitive")}
              className="h-auto p-4 flex flex-col items-center space-y-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300"
            >
              <BookOpen className="w-6 h-6" />
              <div className="text-center">
                <div className="font-medium">Cognitive Support</div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
                  Dyslexia friendly, extra spacing
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Settings */}
      {accessibilityFeatures.map((category) => {
        const CategoryIcon = category.icon;
        
        return (
          <Card key={category.category} className="border-zinc-200 dark:border-zinc-800">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <CategoryIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <CardTitle className="text-lg">{category.category}</CardTitle>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {category.features.map((feature, index) => {
                const FeatureIcon = feature.icon;
                const isEnabled = settings[feature.key] as boolean;
                
                return (
                  <div key={feature.key}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          isEnabled 
                            ? "bg-emerald-100 dark:bg-emerald-900/20" 
                            : "bg-zinc-100 dark:bg-zinc-800"
                        )}>
                          <FeatureIcon className={cn(
                            "w-4 h-4",
                            isEnabled 
                              ? "text-emerald-600 dark:text-emerald-400" 
                              : "text-zinc-500 dark:text-zinc-400"
                          )} />
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
                            {feature.label}
                          </h4>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {isEnabled && (
                          <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
                            Active
                          </Badge>
                        )}
                        
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={(checked) => handleSettingChange(feature.key, checked)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                    
                    {index < category.features.length - 1 && (
                      <Separator className="mt-4 bg-zinc-200 dark:bg-zinc-800" />
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        );
      })}

      {/* Advanced Text Settings */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Type className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-lg">Advanced Text Settings</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Line Height */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Line Height
              </Label>
              <span className="text-sm text-zinc-600 dark:text-zinc-400">
                {settings.lineHeight}x
              </span>
            </div>
            <Slider
              value={[settings.lineHeight]}
              onValueChange={([value]) => handleSettingChange("lineHeight", value)}
              min={1}
              max={3}
              step={0.1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
              <span>Compact</span>
              <span>Normal</span>
              <span>Spacious</span>
            </div>
          </div>

          <Separator className="bg-zinc-200 dark:bg-zinc-800" />

          {/* Text Alignment */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Text Alignment
            </Label>
            <Select
              value={settings.textAlign}
              onValueChange={(value) => handleSettingChange("textAlign", value)}
            >
              <SelectTrigger className="border-zinc-200 dark:border-zinc-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left Aligned</SelectItem>
                <SelectItem value="center">Center Aligned</SelectItem>
                <SelectItem value="right">Right Aligned</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reset Settings */}
      <Card className="border-zinc-200 dark:border-zinc-800">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-zinc-900 dark:text-zinc-100">
                Reset All Settings
              </h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Return all accessibility settings to their default values
              </p>
            </div>
            
            <Button
              variant="outline"
              onClick={resetSettings}
              disabled={isLoading}
              className="border-zinc-200 text-zinc-700 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-300"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Helper component for Label
function Label({ children, className, ...props }: { children: React.ReactNode; className?: string; [key: string]: any }) {
  return (
    <label className={cn("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70", className)} {...props}>
      {children}
    </label>
  );
}

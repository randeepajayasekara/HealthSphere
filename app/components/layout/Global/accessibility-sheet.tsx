"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Accessibility,
  Eye,
  EyeOff,
  BookOpen,
  Focus,
  Volume2,
  Palette,
  Contrast,
  Link as LinkIcon,
  Type,
  AlignLeft,
  Pause,
  MousePointer,
  MessageSquare,
  Move,
  AlignCenter,
  AlignRight,
  RotateCcw,
} from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useAccessibility } from '@/app/contexts/accessibility-context';
import { cn } from '@/lib/utils';

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

const AccessibilityToggle = ({ 
  icon: Icon, 
  title, 
  description, 
  settingKey,
  settings,
  updateSetting,
  className 
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  settingKey: keyof AccessibilitySettings;
  settings: AccessibilitySettings;
  updateSetting: (key: keyof AccessibilitySettings, value: any) => void;
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

export default function AccessibilitySheet() {
  const { 
    settings, 
    updateSetting, 
    resetSettings, 
    applyQuickProfile,
    isAccessibilityPanelOpen,
    closeAccessibilityPanel
  } = useAccessibility();

  return (
    <Sheet open={isAccessibilityPanelOpen} onOpenChange={closeAccessibilityPanel}>
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
                  settings={settings}
                  updateSetting={updateSetting}
                />
                
                <AccessibilityToggle
                  icon={Palette}
                  title="Contrast +"
                  description="Increase color contrast"
                  settingKey="contrast"
                  settings={settings}
                  updateSetting={updateSetting}
                />
                
                <AccessibilityToggle
                  icon={Contrast}
                  title="Smart Contrast"
                  description="Intelligent contrast adjustment"
                  settingKey="smartContrast"
                  settings={settings}
                  updateSetting={updateSetting}
                />
                
                <AccessibilityToggle
                  icon={LinkIcon}
                  title="Highlight Links"
                  description="Make links more visible"
                  settingKey="highlightLinks"
                  settings={settings}
                  updateSetting={updateSetting}
                />
                
                <AccessibilityToggle
                  icon={Type}
                  title="Bigger Text"
                  description="Increase font size"
                  settingKey="biggerText"
                  settings={settings}
                  updateSetting={updateSetting}
                />
                
                <AccessibilityToggle
                  icon={AlignLeft}
                  title="Text Spacing"
                  description="Improve text readability"
                  settingKey="textSpacing"
                  settings={settings}
                  updateSetting={updateSetting}
                />
                
                <AccessibilityToggle
                  icon={Pause}
                  title="Pause Animations"
                  description="Stop moving elements"
                  settingKey="pauseAnimations"
                  settings={settings}
                  updateSetting={updateSetting}
                />
                
                <AccessibilityToggle
                  icon={EyeOff}
                  title="Hide Images"
                  description="Hide decorative images"
                  settingKey="hideImages"
                  settings={settings}
                  updateSetting={updateSetting}
                />
                
                <AccessibilityToggle
                  icon={BookOpen}
                  title="Dyslexia Friendly"
                  description="Use dyslexia-friendly fonts"
                  settingKey="dyslexiaFriendly"
                  settings={settings}
                  updateSetting={updateSetting}
                />
                
                <AccessibilityToggle
                  icon={MousePointer}
                  title="Cursor"
                  description="Enhanced cursor visibility"
                  settingKey="cursor"
                  settings={settings}
                  updateSetting={updateSetting}
                />
                
                <AccessibilityToggle
                  icon={MessageSquare}
                  title="Tooltips"
                  description="Show helpful tooltips"
                  settingKey="tooltips"
                  settings={settings}
                  updateSetting={updateSetting}
                />
                
                <AccessibilityToggle
                  icon={AlignLeft}
                  title="Page Structure"
                  description="Show page structure"
                  settingKey="pageStructure"
                  settings={settings}
                  updateSetting={updateSetting}
                />
                
                <AccessibilityToggle
                  icon={BookOpen}
                  title="Dictionary"
                  description="Enable word definitions"
                  settingKey="dictionary"
                  settings={settings}
                  updateSetting={updateSetting}
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

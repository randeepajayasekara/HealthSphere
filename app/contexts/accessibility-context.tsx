"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

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

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: (key: keyof AccessibilitySettings, value: any) => void;
  resetSettings: () => void;
  applyQuickProfile: (profileType: 'motor' | 'blind' | 'dyslexia' | 'cognitive') => void;
  openAccessibilityPanel: () => void;
  closeAccessibilityPanel: () => void;
  isAccessibilityPanelOpen: boolean;
}

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
  textAlign: 'left',
  dictionary: false,
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultSettings);
  const [isAccessibilityPanelOpen, setIsAccessibilityPanelOpen] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load accessibility settings:', error);
      }
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = (key: keyof AccessibilitySettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    localStorage.removeItem('accessibility-settings');
  };

  const applyQuickProfile = (profileType: 'motor' | 'blind' | 'dyslexia' | 'cognitive') => {
    let newSettings = { ...defaultSettings };

    switch (profileType) {
      case 'motor':
        newSettings = {
          ...newSettings,
          oversizedWidget: true,
          biggerText: true,
          cursor: true,
          pauseAnimations: true,
        };
        break;
      case 'blind':
        newSettings = {
          ...newSettings,
          screenReader: true,
          contrast: true,
          biggerText: true,
          hideImages: true,
        };
        break;
      case 'dyslexia':
        newSettings = {
          ...newSettings,
          dyslexiaFriendly: true,
          textSpacing: true,
          lineHeight: 1.8,
          dictionary: true,
        };
        break;
      case 'cognitive':
        newSettings = {
          ...newSettings,
          pauseAnimations: true,
          tooltips: true,
          pageStructure: true,
          textSpacing: true,
        };
        break;
    }

    setSettings(newSettings);
  };

  const openAccessibilityPanel = () => {
    setIsAccessibilityPanelOpen(true);
  };

  const closeAccessibilityPanel = () => {
    setIsAccessibilityPanelOpen(false);
  };

  return (
    <AccessibilityContext.Provider
      value={{
        settings,
        updateSetting,
        resetSettings,
        applyQuickProfile,
        openAccessibilityPanel,
        closeAccessibilityPanel,
        isAccessibilityPanelOpen,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
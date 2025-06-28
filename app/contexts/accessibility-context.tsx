"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/backend/config';
import { useAuth } from './auth-context';

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

interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSetting: <K extends keyof AccessibilitySettings>(key: K, value: AccessibilitySettings[K]) => Promise<void>;
  resetSettings: () => Promise<void>;
  applyQuickProfile: (profile: 'motor' | 'blind' | 'dyslexia' | 'cognitive') => Promise<void>;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<AccessibilitySettings>(defaultAccessibilitySettings);

  // Apply CSS styles based on settings
  useEffect(() => {
    const applyStyles = () => {
      const root = document.documentElement;
      
      // Remove existing accessibility classes
      document.body.classList.remove(
        'accessibility-bigger-text',
        'accessibility-text-spacing',
        'accessibility-hide-images',
        'accessibility-dyslexia-friendly',
        'accessibility-cursor',
        'accessibility-pause-animations',
        'accessibility-contrast',
        'accessibility-smart-contrast',
        'accessibility-highlight-links',
        'accessibility-oversized-widget'
      );

      // Apply settings
      if (settings.biggerText) {
        document.body.classList.add('accessibility-bigger-text');
      }
      
      if (settings.textSpacing) {
        document.body.classList.add('accessibility-text-spacing');
      }
      
      if (settings.hideImages) {
        document.body.classList.add('accessibility-hide-images');
      }
      
      if (settings.dyslexiaFriendly) {
        document.body.classList.add('accessibility-dyslexia-friendly');
      }
      
      if (settings.cursor) {
        document.body.classList.add('accessibility-cursor');
      }
      
      if (settings.pauseAnimations) {
        document.body.classList.add('accessibility-pause-animations');
      }
      
      if (settings.contrast) {
        document.body.classList.add('accessibility-contrast');
      }
      
      if (settings.smartContrast) {
        document.body.classList.add('accessibility-smart-contrast');
      }
      
      if (settings.highlightLinks) {
        document.body.classList.add('accessibility-highlight-links');
      }
      
      if (settings.oversizedWidget) {
        document.body.classList.add('accessibility-oversized-widget');
      }

      // Set line height
      root.style.setProperty('--accessibility-line-height', settings.lineHeight.toString());
      
      // Set text alignment
      root.style.setProperty('--accessibility-text-align', settings.textAlign);
    };

    applyStyles();
  }, [settings]);

  // Listen to Firestore changes
  useEffect(() => {
    if (!user?.id) return;

    const userDocRef = doc(db, 'users', user.id);
    const unsubscribe = onSnapshot(userDocRef, (doc) => {
      if (doc.exists()) {
        const userData = doc.data();
        if (userData.accessibilitySettings) {
          setSettings({ ...defaultAccessibilitySettings, ...userData.accessibilitySettings });
        }
      }
    });

    return () => unsubscribe();
  }, [user?.id]);

  const updateSetting = async <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    if (!user?.id) return;

    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    try {
      const userDocRef = doc(db, 'users', user.id);
      await updateDoc(userDocRef, {
        accessibilitySettings: newSettings
      });
    } catch (error) {
      console.error('Error updating accessibility settings:', error);
    }
  };

  const resetSettings = async () => {
    if (!user?.id) return;

    setSettings(defaultAccessibilitySettings);

    try {
      const userDocRef = doc(db, 'users', user.id);
      await updateDoc(userDocRef, {
        accessibilitySettings: defaultAccessibilitySettings
      });
    } catch (error) {
      console.error('Error resetting accessibility settings:', error);
    }
  };

  const applyQuickProfile = async (profile: 'motor' | 'blind' | 'dyslexia' | 'cognitive') => {
    let profileSettings: Partial<AccessibilitySettings> = {};

    switch (profile) {
      case 'motor':
        profileSettings = {
          oversizedWidget: true,
          biggerText: true,
          cursor: true,
          pauseAnimations: true,
        };
        break;
      case 'blind':
        profileSettings = {
          screenReader: true,
          hideImages: true,
          contrast: true,
          pauseAnimations: true,
        };
        break;
      case 'dyslexia':
        profileSettings = {
          dyslexiaFriendly: true,
          textSpacing: true,
          lineHeight: 2.0,
          biggerText: true,
        };
        break;
      case 'cognitive':
        profileSettings = {
          pauseAnimations: true,
          tooltips: true,
          pageStructure: true,
          dictionary: true,
        };
        break;
    }

    const newSettings = { ...settings, ...profileSettings };
    setSettings(newSettings);

    if (user?.id) {
      try {
        const userDocRef = doc(db, 'users', user.id);
        await updateDoc(userDocRef, {
          accessibilitySettings: newSettings
        });
      } catch (error) {
        console.error('Error applying quick profile:', error);
      }
    }
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSetting, resetSettings, applyQuickProfile }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

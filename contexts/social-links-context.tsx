'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { SocialLink, getSocialLinks } from '../lib/firestore/social-links';

interface SocialLinksContextType {
  socialLinks: SocialLink[];
  loading: boolean;
  error: string | null;
}

const SocialLinksContext = createContext<SocialLinksContextType | undefined>(undefined);

export function SocialLinksProvider({ children }: { children: ReactNode }) {
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSocialLinks = async () => {
      try {
        setLoading(true);
        const links = await getSocialLinks();
        setSocialLinks(links);
        setError(null);
      } catch (err) {
        setError('Failed to load social links');
        console.error('Error loading social links:', err);
      } finally {
        setLoading(false);
      }
    };

    loadSocialLinks();
  }, []);

  return (
    <SocialLinksContext.Provider value={{ socialLinks, loading, error }}>
      {children}
    </SocialLinksContext.Provider>
  );
}

export function useSocialLinks() {
  const context = useContext(SocialLinksContext);
  if (context === undefined) {
    throw new Error('useSocialLinks must be used within a SocialLinksProvider');
  }
  return context;
}

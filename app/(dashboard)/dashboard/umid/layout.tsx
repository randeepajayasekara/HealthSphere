/**
 * HealthSphere - UMID Layout
 * Layout wrapper for UMID pages
 */

import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Universal Medical ID - HealthSphere',
  description: 'Secure medical information access system',
  keywords: ['medical ID', 'healthcare', 'emergency access', 'QR code', 'patient data'],
};

interface UMIDLayoutProps {
  children: React.ReactNode;
}

export default function UMIDLayout({ children }: UMIDLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <div className="container mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  );
}

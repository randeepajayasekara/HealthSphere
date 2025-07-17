"use client";

import { DoctorSidebar, DoctorTopBar } from '@/app/components/doctor/doctor-navigation';

interface DoctorLayoutProps {
  children: React.ReactNode;
}

export default function DoctorLayout({ children }: DoctorLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      <div className="flex">
        <div className="flex-1 flex flex-col min-h-screen">
          <main className="flex-1 p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

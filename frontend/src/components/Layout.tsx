import React from 'react';
import { PublicNavbar } from './PublicNavbar';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 pb-16 lg:pb-0">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
    </div>
  );
}

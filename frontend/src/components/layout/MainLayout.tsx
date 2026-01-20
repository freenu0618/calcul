/**
 * MainLayout 레이아웃 컴포넌트
 */

import React from 'react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {children}
      </div>
    </div>
  );
}

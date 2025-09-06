'use client';

import { useEffect } from "react";

export function TransparentWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Apply transparent styles to html and body for OBS
    document.documentElement.className = 'obs-transparent';
    document.documentElement.style.background = 'transparent';
    document.body.className = 'obs-transparent antialiased';
    document.body.style.background = 'transparent';
    document.body.style.backgroundColor = 'transparent';
    document.body.style.backgroundImage = 'none';
    
    return () => {
      // Cleanup on unmount
      document.documentElement.className = '';
      document.documentElement.style.background = '';
      document.body.className = 'antialiased';
      document.body.style.background = '';
      document.body.style.backgroundColor = '';
      document.body.style.backgroundImage = '';
    };
  }, []);

  return <>{children}</>;
}
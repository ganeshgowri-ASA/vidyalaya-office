'use client';

import { useState, useEffect } from 'react';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Trigger on the next paint so the initial opacity-0 / translateY state
    // is actually rendered before we flip to the visible state.
    const frame = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className={className}
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(8px)',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
        // Ensure the wrapper fills whatever space the parent grants it
        width: '100%',
        height: '100%',
      }}
    >
      {children}
    </div>
  );
}

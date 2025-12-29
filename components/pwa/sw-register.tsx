"use client";
import { useEffect } from 'react';

export default function SwRegister() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if ('serviceWorker' in navigator) {
      const register = () => {
        navigator.serviceWorker.register('/sw.js').catch(err => {
          console.warn('SW registration failed', err);
        });
      };
      
      if (document.readyState === 'complete') {
        register();
      } else {
        window.addEventListener('load', register, { once: true });
      }
    }
  }, []);
  
  return null;
}


"use client";
import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>; 
}

export default function InstallPrompt() {
  const [deferredEvent, setDeferredEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredEvent(e as BeforeInstallPromptEvent);
      // Show prompt after delay (10 seconds)
      setTimeout(() => setVisible(true), 10000);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Hide if already installed
  useEffect(() => {
    const mq = window.matchMedia('(display-mode: standalone)');
    if (mq.matches) setVisible(false);
  }, []);

  if (!visible || !deferredEvent || dismissed) return null;

  const onInstall = async () => {
    try {
      await deferredEvent.prompt();
      const choice = await deferredEvent.userChoice;
      if (choice.outcome === 'accepted') {
        setVisible(false);
      } else {
        setDismissed(true);
      }
    } catch {
      setDismissed(true);
    }
  };

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-slate-900 text-white p-4 rounded-2xl shadow-lg z-50 w-[90vw] max-w-md">
      <p className="font-semibold mb-1">Install App?</p>
      <p className="text-sm opacity-85 mb-3">Get faster access and offline support.</p>
      <div className="flex gap-2 justify-end">
        <button onClick={() => setDismissed(true)} className="px-3 py-1.5 border border-slate-600 rounded-full text-sm">Later</button>
        <button onClick={onInstall} className="px-3 py-1.5 bg-blue-500 rounded-full text-sm">Install</button>
      </div>
    </div>
  );
}


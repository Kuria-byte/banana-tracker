"use client";
import React, { useEffect, useState, useCallback } from "react";

interface PWAInstallPromptProps {
  className?: string;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ className }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  }, [deferredPrompt]);

  const handleClose = useCallback(() => {
    setVisible(false);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className={`bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center ${className}`}
        role="dialog" aria-modal="true" aria-labelledby="pwa-install-title">
        <img src="/android/android-launchericon-48-48.png" alt="Banana Tracker logo" className="mx-auto mb-4 w-16 h-16 rounded-full border border-green-300" />
        <h2 id="pwa-install-title" className="text-lg font-bold text-green-600 mb-2">Install Banana Tracker</h2>
        <p className="text-gray-700 mb-4">Add Banana Tracker to your phone for quick access and offline use.</p>
        <div className="flex gap-2 justify-center">
          <button
            onClick={handleInstall}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-green-400"
            autoFocus
          >
            Install
          </button>
          <button
            onClick={handleClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}; 
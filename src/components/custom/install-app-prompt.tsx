"use client";

import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { Download, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

export function InstallAppPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false); // Back to false for production
  const [isInstalled, setIsInstalled] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    // Check if app is already installed
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isIOSStandalone =
      isIOS && (navigator as NavigatorWithStandalone).standalone === true;

    if (isStandalone || isIOSStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if user has already dismissed the prompt for this session
    const dismissed = localStorage.getItem("pwa-install-dismissed");
    const sessionDismissed = sessionStorage.getItem(
      "pwa-install-session-dismissed",
    );

    if (dismissed === "true" || sessionDismissed === "true") {
      return;
    }

    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);

      // Show prompt after a delay on mobile devices
      if (isMobile) {
          setShowPrompt(true);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
      toast.success("App installed successfully!");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isMobile]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        toast.success("App installation started!");
      } else {
        toast.info("Installation cancelled");
      }

      setShowPrompt(false);
      setDeferredPrompt(null);
    } catch (error) {
      console.error("Error during installation:", error);
      toast.error("Installation failed");
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Set session storage so it doesn't show again in this session
    sessionStorage.setItem("pwa-install-session-dismissed", "true");
    toast.info("You can install the app later from your browser menu");
  };

  // Don't show prompt if not mobile, already installed, or no deferred prompt
  if (!isMobile || isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="pointer-events-none fixed top-4 right-4 left-4 z-50">
      <div className="animate-in slide-in-from-top-2 pointer-events-auto duration-300 ease-out">
        <div className="bg-background border-border mx-auto max-w-sm rounded-xl border p-4 shadow-lg backdrop-blur-sm h-fit">
          <div className="flex items-start gap-3">
            <div className=" ">
              <div className="flex aspect-square h-20  rounded-md">
                <Image src="/icon-192x192.svg" alt="AI Chat App icon" className="rounded-md " width={80} height={80}/>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-foreground text-sm font-semibold">
                    z1 AI App
                  </h3>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    Install app for better experience
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground h-6 w-6 p-0"
                  onClick={handleDismiss}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleInstallClick}
                  className=""
                >
                  <Download className="mr-1.5 h-3 w-3" />
                  Install App
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

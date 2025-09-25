import { AppSidebar } from "@/components/custom/app-sidebar";
import Header from "@/components/custom/header";
import { InstallAppPrompt } from "@/components/custom/install-app-prompt";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/sonner";
import { ProviderProvider } from "@/contexts/provider-context";
import "@/styles/globals.css";

import { type Metadata } from "next";
import { Geist } from "next/font/google";

export const metadata: Metadata = {
  title: "AI Chat",
  description: "AI Chat Application",
  manifest: "/manifest.json",
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "apple-touch-icon", url: "/apple-touch-icon.svg" },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AI Chat",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#000000",
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable}`} suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="#000000" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AI Chat" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.svg" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >

        <ProviderProvider>
          <SidebarProvider>
            <div className="flex min-h-screen w-full">
              <AppSidebar />

              <div className="flex flex-1 flex-col">
                <Header />
                <main className="flex-1">{children}</main>
              </div>
            </div>
          </SidebarProvider>
        </ProviderProvider>
          </ThemeProvider>
          <InstallAppPrompt />
          <Toaster closeButton position="top-center"/>
      </body>
    </html>
  );
}

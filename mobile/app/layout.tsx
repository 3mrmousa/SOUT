import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import AppShell from "@/components/AppShell";
import { Toaster } from "react-hot-toast";
import QueryProvider from "@/providers/QueryProvider";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

const fkRaster = localFont({
  src: [
    {
      path: "../public/fonts/FKRasterRomanCompact-Smooth.ttf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-raster",
});

const khInterference = localFont({
  src: [
    {
      path: "../public/fonts/KHInterference-Regular.otf",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-interference",
});

const khTeka = localFont({
  src: [
    {
      path: "../public/fonts/KHTeka-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/KHTeka-Medium.otf",
      weight: "500",
      style: "normal",
    },
  ],
  variable: "--font-teka",
});

export const metadata: Metadata = {
  title: "SOUT",
  description: "Real-time communication app",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: "/logo-icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", "font-sans", geist.variable)}>
      <body
        className={`${fkRaster.variable} ${khInterference.variable} ${khTeka.variable} font-sans antialiased`}
      >
        <QueryProvider>
          <AppShell>
            {children}
          </AppShell>
        </QueryProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#0b0d12",
              color: "#e5e7eb",
              border: "1px solid #1f2937",
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#1f2937",
              },
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#1f2937",
              },
            },
          }}
        />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PwaRegister from "@/components/PwaRegister";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AttendLink — Smart Wireless & Location-Aware Attendance System",
  description: "AttendLink combines digital attendance with wireless and location-aware verification to prevent proxy attendance and streamline classroom management.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "AttendLink",
  },
  icons: {
    apple: '/apple-touch-icon.png'
  }
};

export const viewport: Viewport = {
  themeColor: "#06b6d4",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0B1121] text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-white`}
      >
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}

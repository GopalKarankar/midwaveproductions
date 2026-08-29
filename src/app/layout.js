import { Bebas_Neue, DM_Sans, Space_Mono } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { LoadingScreen } from "@/components/layout/LoadingScreen";
import { Navbar } from "@/components/layout/Navbar";
import { BlockedNotice } from "@/components/layout/BlockedNotice";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display-raw",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body-raw",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono-raw",
});

export const metadata = {
  title: "Midwave Productions — Artist Management & Promotion",
  description:
    "Artist run — management, promotion, bookings and media production.",
  icons: {
    icon: "/images/Midwave productions logo (without caption).png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${dmSans.variable} ${spaceMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <Suspense fallback={null}>
          <BlockedNotice />
        </Suspense>
        <LoadingScreen />
        <Navbar />
        {children}
      </body>
    </html>
  );
}

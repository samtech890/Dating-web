import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HeartLink — Real connections. Shared moments.",
  description:
    "A more considered kind of dating. Discover shared values, thoughtful introductions, and meaningful conversations with HeartLink.",
  openGraph: {
    title: "HeartLink — Real connections. Shared moments.",
    description:
      "Some connections just feel different. Discover the HeartLink concept for more meaningful connections.",
    siteName: "HeartLink",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HeartLink — Real connections. Shared moments.",
    description: "A more considered kind of dating. A concept preview for adults 18+.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head><meta name="theme-color" content="#0b0a10" /></head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

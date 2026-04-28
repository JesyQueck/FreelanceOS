import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Freelance Workspace",
  description: "A premium client management platform for freelancers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`antialiased bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-50 min-h-screen flex flex-col`}>
        {children}
      </body>
    </html>
  );
}

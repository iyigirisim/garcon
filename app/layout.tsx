import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { NowBar } from "@/components/dashboard/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Garçon",
  description: "Created by iyigirisim",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex h-dvh flex-col">
          <NowBar />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <div className="flex-1 overflow-hidden">
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}

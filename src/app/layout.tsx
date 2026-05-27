import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import LayoutWrapper from "@/components/layout/LayoutWrapper";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "造境 AI - 智能图像创作平台",
  description: "AI创作平台。文生图、AI修图、电商作图、海报设计，一站式创作与管理。",
  keywords: "造境 AI,AI创作,文生图,AI修图,电商作图",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#f4f7ff] text-slate-800">
        <TooltipProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
          <Toaster richColors theme="light" position="top-center" />
        </TooltipProvider>
      </body>
    </html>
  );
}

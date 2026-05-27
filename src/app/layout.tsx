import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import LayoutWrapper from "@/components/layout/LayoutWrapper";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "椒图AI - 中文AI修图神器",
  description: "免费在线AI修图工具。电商设计、虚拟试衣、照片修复、抠图扩图、AI视频生成。",
  keywords: "椒图AI,AI修图,电商套图,AI抠图,AI视频",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#f8fafc] text-slate-800">
        <TooltipProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
          <Toaster richColors theme="light" position="top-center" />
        </TooltipProvider>
      </body>
    </html>
  );
}

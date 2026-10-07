import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/header";
import { DashboardProvider } from "@/components/dashboard-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DataCo Supply Chain Dashboard",
  description: "Enterprise Logistics & Supply Chain Control Tower",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-50 text-slate-900 overflow-hidden`} suppressHydrationWarning>
          <DashboardProvider>
            <div className="flex flex-col h-screen w-full relative">
              <Header />
              <main className="flex flex-1 flex-col gap-4 md:gap-6 px-4 md:px-8 py-4 md:py-6 pb-24 md:pb-6 overflow-auto scrollbar-hide">
                {children}
                <footer className="mt-8 border-t border-slate-200 pt-6 pb-2 text-center shrink-0">
                  <p className="text-[13px] text-slate-400 max-w-5xl mx-auto leading-relaxed">
                    © 2026 Sulistyowati Munawaroh Data Analytics. All rights reserved.
                  </p>
                </footer>
              </main>
            </div>
          </DashboardProvider>
      </body>
    </html>
  );
}

"use client";

import React, { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { usePathname } from "next/navigation";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Navbar } from "../components/layout/Navbar";
import { Sidebar } from "../components/layout/Sidebar";
import { ToastContainer } from "../components/ui/ToastContainer";
import { ModalContainer } from "../components/ui/ModalContainer";
import { useUIStore } from "../store";

// フォントの設定
const notoSansJP = Noto_Sans_JP({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

// React Query クライアントの設定
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5分
      retry: 2,
    },
    mutations: {
      retry: 1,
    },
  },
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='ja'>
      <head>
        <title>鶴舞こあらWiki</title>
        <meta name='description' content='みんなで作る鶴舞こあらの情報Wiki' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <link rel='icon' href='/favicon.ico' />
      </head>
      <body className={`min-h-screen bg-white ${notoSansJP.className}`}>
        <QueryClientProvider client={queryClient}>
          <AppLayout>{children}</AppLayout>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </body>
    </html>
  );
}

function AppLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, showNavbar, setShowNavbar } = useUIStore();
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  // ホームページ以外では常にナビゲーションバーを表示
  useEffect(() => {
    if (!isHomePage) {
      setShowNavbar(true);
    }
  }, [isHomePage, setShowNavbar]);

  // ホームページの場合はshowNavbarの状態に従い、それ以外は常に表示
  const shouldShowNavbar = !isHomePage || showNavbar;

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      <div className='flex'>
        {shouldShowNavbar && <Sidebar />}
        <main
          className={`flex-1 transition-all duration-300 ${
            shouldShowNavbar && sidebarOpen ? "ml-64" : "ml-0"
          } ${shouldShowNavbar ? "pt-16" : "pt-0"}`}
        >
          <div className='min-h-screen'>{children}</div>
        </main>
      </div>
      <ToastContainer />
      <ModalContainer />
    </>
  );
}

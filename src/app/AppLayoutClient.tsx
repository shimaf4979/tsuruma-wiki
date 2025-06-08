"use client";

import React, { useEffect } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "../components/layout/Navbar";
import { Sidebar } from "../components/layout/Sidebar";
import { ToastContainer } from "../components/ui/ToastContainer";
import { ModalContainer } from "../components/ui/ModalContainer";
import { useUIStore } from "../store";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { sidebarOpen, showNavbar, setShowNavbar } = useUIStore();
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  // ページ遷移時にスクロール位置をトップに設定
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

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

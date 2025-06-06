"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  Search,
  User,
  LogOut,
  Settings,
  PlusCircle,
  Bell,
} from "lucide-react";
import { useAuthStore, useUIStore } from "../../store";
import { SearchModal } from "../ui/SearchModal";

export function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { toggleSidebar, addToast } = useUIStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // スクロール検知
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    addToast({
      type: "success",
      title: "ログアウトしました",
    });
    router.push("/");
  };

  const navItems = [
    { href: "/about", label: "こあらについて" },
    { href: "/pages", label: "ページ一覧" },
    { href: "/contact", label: "お問い合わせ" },
    { href: "/editor", label: "新規作成", icon: PlusCircle },
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 backdrop-blur-sm shadow-sm border-b border-koala-200"
            : "bg-white border-b border-koala-100"
        }`}
      >
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center justify-between h-16'>
            {/* 左側: ロゴとハンバーガーメニュー */}
            <div className='flex items-center space-x-4'>
              <button
                onClick={toggleSidebar}
                className='p-2 rounded-lg text-koala-600 hover:bg-koala-100 transition-colors'
                aria-label='メニューを開く'
              >
                <Menu className='w-5 h-5' />
              </button>

              <Link
                href='/'
                className='flex items-center space-x-2 hover:opacity-80 transition-opacity'
              >
                <img
                  src='/home.png'
                  alt='鶴舞こあら Wiki'
                  className='w-32 sm:w-36 md:w-40 h-auto'
                />
              </Link>
            </div>

            {/* 中央: ナビゲーションメニュー（デスクトップ） */}
            <div className='hidden md:flex items-center space-x-1'>
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className='px-3 py-2 rounded-lg text-sm font-medium text-koala-700 hover:bg-koala-100 hover:text-koala-900 transition-colors flex items-center space-x-1'
                >
                  {item.icon && <item.icon className='w-4 h-4' />}
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>

            {/* 右側: 検索、通知、ユーザーメニュー */}
            <div className='flex items-center space-x-2'>
              {/* 検索ボタン */}
              <button
                onClick={() => setShowSearchModal(true)}
                className='p-2 rounded-lg text-koala-600 hover:bg-koala-100 transition-colors'
                aria-label='検索'
              >
                <Search className='w-5 h-5' />
              </button>

              {isAuthenticated ? (
                <>
                  {/* 通知ボタン（将来実装） */}
                  <button
                    className='p-2 rounded-lg text-koala-600 hover:bg-koala-100 transition-colors relative'
                    aria-label='通知'
                  >
                    <Bell className='w-5 h-5' />
                    {/* 未読通知があれば表示 */}
                    {/* <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span> */}
                  </button>

                  {/* ユーザーメニュー */}
                  <div className='relative'>
                    <button
                      onClick={() => setShowUserMenu(!showUserMenu)}
                      className='flex items-center space-x-2 p-2 rounded-lg hover:bg-koala-100 transition-colors'
                    >
                      {user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.nickname}
                          className='w-6 h-6 rounded-full object-cover'
                        />
                      ) : (
                        <div className='w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center'>
                          <User className='w-4 h-4 text-primary-600' />
                        </div>
                      )}
                      <span className='hidden sm:block text-sm font-medium text-koala-700'>
                        {user?.nickname}
                      </span>
                    </button>

                    <AnimatePresence>
                      {showUserMenu && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-koala-200 py-1 z-50'
                        >
                          <Link
                            href='/profile'
                            className='flex items-center space-x-2 px-4 py-2 text-sm text-koala-700 hover:bg-koala-50'
                            onClick={() => setShowUserMenu(false)}
                          >
                            <User className='w-4 h-4' />
                            <span>プロフィール</span>
                          </Link>

                          <Link
                            href='/settings'
                            className='flex items-center space-x-2 px-4 py-2 text-sm text-koala-700 hover:bg-koala-50'
                            onClick={() => setShowUserMenu(false)}
                          >
                            <Settings className='w-4 h-4' />
                            <span>設定</span>
                          </Link>

                          {user?.role === "admin" && (
                            <Link
                              href='/admin'
                              className='flex items-center space-x-2 px-4 py-2 text-sm text-koala-700 hover:bg-koala-50'
                              onClick={() => setShowUserMenu(false)}
                            >
                              <Settings className='w-4 h-4' />
                              <span>管理者設定</span>
                            </Link>
                          )}

                          <div className='border-t border-koala-200 my-1'></div>

                          <button
                            onClick={handleLogout}
                            className='flex items-center space-x-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50'
                          >
                            <LogOut className='w-4 h-4' />
                            <span>ログアウト</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className='flex items-center space-x-2'>
                  <Link
                    href='/login'
                    className='px-3 py-2 text-sm font-medium text-koala-700 hover:text-koala-900 transition-colors'
                  >
                    ログイン
                  </Link>
                  <Link
                    href='/register'
                    className='px-3 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors'
                  >
                    登録
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* 検索モーダル */}
      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
      />

      {/* メニュー外クリックでユーザーメニューを閉じる */}
      {showUserMenu && (
        <div
          className='fixed inset-0 z-40'
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
}

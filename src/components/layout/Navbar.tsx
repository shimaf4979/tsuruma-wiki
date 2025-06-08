"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Search, User, LogOut, Settings, Bell } from "lucide-react";
import { useAuthStore, useUIStore } from "../../store";
import { SearchModal } from "../ui/SearchModal";

export function Navbar() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { toggleSidebar, addToast } = useUIStore();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNotification, setShowNotification] = useState(false);

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
    { href: "/about", label: "鶴舞こあらとは" },
    { href: "/stream", label: "最新の配信" },
    { href: "/pages", label: "ページ一覧" },
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
                  src='/b2.webp'
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
                  <div className='relative'>
                    <button
                      onClick={() => setShowNotification(!showNotification)}
                      className='p-2 rounded-lg text-koala-600 hover:bg-koala-100 transition-colors relative'
                      aria-label='通知'
                    >
                      <Bell className='w-5 h-5' />
                    </button>

                    <AnimatePresence>
                      {showNotification && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className='absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-koala-200 overflow-hidden z-50'
                        >
                          <div className='p-4 text-center text-koala-600'>
                            お知らせはありません
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

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
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          transition={{ duration: 0.2 }}
                          className='absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-koala-200 overflow-hidden z-50'
                        >
                          {/* ユーザー情報ヘッダー */}
                          <div className='p-4 bg-primary-50 border-b border-primary-100'>
                            <div className='flex items-center space-x-3'>
                              {user?.avatarUrl ? (
                                <img
                                  src={user.avatarUrl}
                                  alt={user.nickname}
                                  className='w-12 h-12 rounded-full object-cover ring-2 ring-white'
                                />
                              ) : (
                                <div className='w-12 h-12 rounded-full bg-primary-50 flex items-center justify-center ring-2 ring-white'>
                                  <User className='w-6 h-6 text-black' />
                                </div>
                              )}
                              <div>
                                <p className='font-medium text-black'>
                                  {user?.nickname}
                                </p>
                                <p className='text-sm text-gray-700'>
                                  {user?.email}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* メニュー項目 */}
                          <div className='py-2'>
                            <Link
                              href='/profile'
                              className='flex items-center space-x-3 px-4 py-3 text-sm text-black hover:bg-primary-50 transition-colors group'
                              onClick={() => setShowUserMenu(false)}
                            >
                              <div className='p-2 rounded-lg bg-primary-50 group-hover:bg-primary-100 transition-colors'>
                                <User className='w-4 h-4 text-black' />
                              </div>
                              <span>プロフィール</span>
                            </Link>

                            <Link
                              href='/settings'
                              className='flex items-center space-x-3 px-4 py-3 text-sm text-black hover:bg-primary-50 transition-colors group'
                              onClick={() => setShowUserMenu(false)}
                            >
                              <div className='p-2 rounded-lg bg-primary-50 group-hover:bg-primary-100 transition-colors'>
                                <Settings className='w-4 h-4 text-black' />
                              </div>
                              <span>設定</span>
                            </Link>

                            {user?.role === "admin" && (
                              <Link
                                href='/admin'
                                className='flex items-center space-x-3 px-4 py-3 text-sm text-black hover:bg-primary-50 transition-colors group'
                                onClick={() => setShowUserMenu(false)}
                              >
                                <div className='p-2 rounded-lg bg-primary-50 group-hover:bg-primary-100 transition-colors'>
                                  <Settings className='w-4 h-4 text-black' />
                                </div>
                                <span>管理者設定</span>
                              </Link>
                            )}
                          </div>

                          <div className='border-t border-primary-100'></div>

                          <button
                            onClick={handleLogout}
                            className='flex items-center space-x-3 w-full px-4 py-3 text-sm text-black hover:bg-primary-50 transition-colors group'
                          >
                            <div className='p-2 rounded-lg bg-primary-50 group-hover:bg-primary-100 transition-colors'>
                              <LogOut className='w-4 h-4 text-black' />
                            </div>
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
                  {/* <Link
                    href='/register'
                    className='px-3 py-2 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors'
                  >
                    登録
                  </Link> */}
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

      {/* 通知メニュー外クリックで通知を閉じる */}
      {showNotification && (
        <div
          className='fixed inset-0 z-40'
          onClick={() => setShowNotification(false)}
        />
      )}
    </>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Edit,
  TrendingUp,
  Clock,
  Tag,
  Users,
  X,
  MessageCircle,
  PlusCircle,
  Video,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useUIStore } from "../../store";
import { wikiAPI, searchAPI } from "../../lib/api";

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  // 人気ページを取得
  const { data: popularPages } = useQuery({
    queryKey: ["popularPages"],
    queryFn: () => wikiAPI.getPopularPages(5),
    staleTime: 10 * 60 * 1000, // 10分
  });

  // 最新ページを取得
  const { data: recentPages } = useQuery({
    queryKey: ["recentPages"],
    queryFn: () => wikiAPI.getPages({ limit: 5, offset: 0 }),
    staleTime: 5 * 60 * 1000, // 5分
  });

  // 人気タグを取得
  const { data: popularTags } = useQuery({
    queryKey: ["popularTags"],
    queryFn: () => searchAPI.getTags(10),
    staleTime: 15 * 60 * 1000, // 15分
  });

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
    closed: {
      x: -320,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 40,
      },
    },
  };

  const menuItems = [
    { icon: Users, label: "鶴舞こあらとは", href: "/about" },
    { icon: Edit, label: "編集するには", href: "/toedit" },
    { icon: Video, label: "最新の配信", href: "/stream" },
    { icon: TrendingUp, label: "ページ一覧へ", href: "/pages?sort=popular" },
    // { icon: Users, label: "編集者一覧", href: "/contributors" },
    { icon: MessageCircle, label: "お問い合わせ", href: "/contact" },
  ];

  return (
    <>
      {/* オーバーレイ（モバイル時） */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden'
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* サイドバー本体 */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            variants={sidebarVariants}
            initial='closed'
            animate='open'
            exit='closed'
            className='fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-koala-200 z-50 overflow-y-auto custom-scrollbar'
          >
            <div className='p-4'>
              {/* 閉じるボタン（モバイル時のみ） */}
              <div className='flex justify-end mb-4 lg:hidden'>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className='p-2 rounded-lg text-koala-500 hover:bg-koala-100 transition-colors'
                  aria-label='サイドバーを閉じる'
                >
                  <X className='w-5 h-5' />
                </button>
              </div>

              {/* 新規作成ボタン */}
              <Link
                href='/editor'
                className='flex items-center space-x-2 w-full px-3 py-2 mb-6 rounded-lg bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors'
                onClick={() => {
                  if (window.innerWidth < 1024) {
                    setSidebarOpen(false);
                  }
                }}
                aria-label='新規ページを作成'
              >
                <PlusCircle className='w-5 h-5' />
                <span>新規ページを作成</span>
              </Link>

              {/* メインメニュー */}
              <nav className='space-y-1 mb-8'>
                <h3 className='text-xs font-medium text-koala-500 uppercase tracking-wide mb-3'>
                  メニュー
                </h3>
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className='flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-koala-700 hover:bg-koala-100 hover:text-koala-900 transition-colors'
                    onClick={() => {
                      // モバイルでは選択後にサイドバーを閉じる
                      if (window.innerWidth < 1024) {
                        setSidebarOpen(false);
                      }
                    }}
                  >
                    <item.icon className='w-5 h-5' />
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>

              {/* 人気ページ */}
              <div className='mb-8'>
                <h3 className='text-xs font-medium text-koala-500 uppercase tracking-wide mb-3 flex items-center'>
                  <TrendingUp className='w-4 h-4 mr-1' />
                  人気ページ
                </h3>
                <div className='space-y-2'>
                  {popularPages?.map((page, index) => (
                    <Link
                      key={page.id}
                      href={`/wiki/${page.id}`}
                      className='block p-2 rounded-lg hover:bg-koala-50 transition-colors group'
                      onClick={() => {
                        if (window.innerWidth < 1024) {
                          setSidebarOpen(false);
                        }
                      }}
                    >
                      <div className='flex items-start space-x-2'>
                        <span className='flex-shrink-0 w-5 h-5 bg-primary-100 text-primary-600 rounded text-xs font-medium flex items-center justify-center mt-0.5'>
                          {index + 1}
                        </span>
                        <div className='min-w-0 flex-1'>
                          <p className='text-sm font-medium text-koala-900 group-hover:text-primary-600 transition-colors truncate'>
                            {page.title}
                          </p>
                          <p className='text-xs text-koala-500 mt-1'>
                            {page.viewCount}回閲覧
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                  {(!popularPages || popularPages.length === 0) && (
                    <p className='text-sm text-koala-500 text-center py-4'>
                      ページがありません
                    </p>
                  )}
                </div>
              </div>

              {/* 最新ページ */}
              <div className='mb-8'>
                <h3 className='text-xs font-medium text-koala-500 uppercase tracking-wide mb-3 flex items-center'>
                  <Clock className='w-4 h-4 mr-1' />
                  最新ページ
                </h3>
                <div className='space-y-2'>
                  {recentPages?.pages?.slice(0, 5).map((page) => (
                    <Link
                      key={page.id}
                      href={`/wiki/${page.id}`}
                      className='block p-2 rounded-lg hover:bg-koala-50 transition-colors group'
                      onClick={() => {
                        if (window.innerWidth < 1024) {
                          setSidebarOpen(false);
                        }
                      }}
                    >
                      <p className='text-sm font-medium text-koala-900 group-hover:text-primary-600 transition-colors truncate'>
                        {page.title}
                      </p>
                      <div className='flex items-center space-x-2 mt-1'>
                        <span className='text-xs text-koala-500'>
                          {page.author.nickname}
                        </span>
                        <span className='text-xs text-koala-400'>
                          {new Date(page.createdAt).toLocaleDateString("ja-JP")}
                        </span>
                      </div>
                    </Link>
                  ))}
                  {(!recentPages?.pages || recentPages.pages.length === 0) && (
                    <p className='text-sm text-koala-500 text-center py-4'>
                      ページがありません
                    </p>
                  )}
                </div>
              </div>

              {/* 人気タグ */}
              <div>
                <h3 className='text-xs font-medium text-koala-500 uppercase tracking-wide mb-3 flex items-center'>
                  <Tag className='w-4 h-4 mr-1' />
                  人気タグ
                </h3>
                <div className='flex flex-wrap gap-2'>
                  {popularTags?.map((tag) => (
                    <Link
                      key={tag.tag}
                      href={`/pages?tag=${encodeURIComponent(tag.tag)}`}
                      className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-koala-100 text-koala-700 hover:bg-koala-200 transition-colors'
                      onClick={() => {
                        if (window.innerWidth < 1024) {
                          setSidebarOpen(false);
                        }
                      }}
                    >
                      {tag.tag}
                      <span className='ml-1 text-koala-500'>({tag.count})</span>
                    </Link>
                  ))}
                  {(!popularTags || popularTags.length === 0) && (
                    <p className='text-sm text-koala-500 text-center py-4 w-full'>
                      タグがありません
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

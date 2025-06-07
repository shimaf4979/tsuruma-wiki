"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { User, Calendar, BookOpen, ArrowLeft, Tag, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { userAPI, wikiAPI } from "../../../lib/api";

interface UserPageClientProps {
  userId: string;
}

export function UserPageClient({ userId }: UserPageClientProps) {
  // ユーザー情報を取得
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => userAPI.getUser(userId),
  });

  // ユーザーのページを取得
  const { data: userPages, isLoading: pagesLoading } = useQuery({
    queryKey: ["userPages", userId],
    queryFn: () =>
      wikiAPI.getPages({
        author: userId,
        limit: 10,
        offset: 0,
      }),
    enabled: !!userId,
  });

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "管理者";
      case "moderator":
        return "モデレーター";
      case "editor":
        return "エディター";
      case "contributor":
        return "コントリビューター";
      default:
        return "ユーザー";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "moderator":
        return "bg-purple-100 text-purple-800";
      case "editor":
        return "bg-blue-100 text-blue-800";
      case "contributor":
        return "bg-green-100 text-green-800";
      default:
        return "bg-koala-100 text-koala-800";
    }
  };

  if (userLoading) {
    return (
      <div className='min-h-screen bg-white'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='animate-pulse'>
            <div className='h-8 bg-koala-200 rounded mb-8 w-1/3'></div>
            <div className='flex items-start space-x-6'>
              <div className='w-24 h-24 bg-koala-200 rounded-full'></div>
              <div className='flex-1'>
                <div className='h-6 bg-koala-200 rounded mb-2 w-1/2'></div>
                <div className='h-4 bg-koala-200 rounded mb-4 w-1/3'></div>
                <div className='h-16 bg-koala-200 rounded'></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className='min-h-screen bg-white flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-koala-900 mb-4'>
            ユーザーが見つかりません
          </h1>
          <p className='text-koala-600 mb-8'>
            お探しのユーザーは存在しないか、削除された可能性があります。
          </p>
          <Link href='/pages' className='btn-primary'>
            ページ一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
        {/* ナビゲーション */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.1 }}
          className='mb-6 sm:mb-8'
        >
          <Link
            href='/pages'
            className='inline-flex items-center text-sm sm:text-base text-koala-600 hover:text-koala-900 transition-colors'
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            ページ一覧に戻る
          </Link>
        </motion.div>

        {/* ユーザープロフィール */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.1, delay: 0.01 }}
          className='card mb-6 sm:mb-8 bg-white/50 backdrop-blur-sm border border-koala-100 rounded-2xl p-4 sm:p-6'
        >
          <div className='flex flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-6'>
            {/* アバター */}
            <div className='flex-shrink-0 flex justify-center sm:justify-start'>
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.nickname}
                  className='w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover ring-2 ring-white shadow-sm'
                />
              ) : (
                <div className='w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-primary-100 flex items-center justify-center ring-2 ring-white shadow-sm'>
                  <User className='w-10 h-10 sm:w-12 sm:h-12 text-primary-600' />
                </div>
              )}
            </div>

            {/* プロフィール情報 */}
            <div className='flex-1 text-center sm:text-left'>
              <div className='flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 mb-2'>
                <h1 className='text-xl sm:text-2xl font-bold text-koala-900'>
                  {user.nickname}
                </h1>
                <span
                  className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${getRoleColor(
                    user.role
                  )}`}
                >
                  {getRoleLabel(user.role)}
                </span>
              </div>

              <div className='flex justify-center sm:justify-start items-center space-x-4 text-xs sm:text-sm text-koala-500 mb-3 sm:mb-4'>
                <div className='flex items-center space-x-1'>
                  <Calendar className='w-3 h-3 sm:w-4 sm:h-4' />
                  <span>
                    {new Date(user.createdAt).toLocaleDateString("ja-JP")}
                    から参加
                  </span>
                </div>
              </div>

              {user.bio && (
                <div className='mb-3 sm:mb-4'>
                  <p className='text-sm sm:text-base text-koala-700 leading-relaxed'>
                    {user.bio}
                  </p>
                </div>
              )}

              {/* 統計 */}
              <div className='flex justify-center sm:justify-start items-center space-x-6 text-xs sm:text-sm'>
                <div className='flex items-center space-x-1'>
                  <BookOpen className='w-3 h-3 sm:w-4 sm:h-4 text-koala-400' />
                  <span className='text-koala-600'>
                    {userPages?.pages?.length || 0}件のページ
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ユーザーのページ一覧 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.1, delay: 0.02 }}
        >
          <h2 className='text-lg sm:text-xl font-semibold text-koala-900 mb-4 sm:mb-6'>
            投稿したページ
          </h2>

          {pagesLoading ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'>
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className='card animate-pulse bg-white/50 backdrop-blur-sm border border-koala-100 rounded-xl p-3 sm:p-4'
                >
                  <div className='h-4 bg-koala-200 rounded mb-2 w-3/4'></div>
                  <div className='h-3 bg-koala-200 rounded mb-2 w-1/2'></div>
                  <div className='h-2 bg-koala-200 rounded w-1/3'></div>
                </div>
              ))}
            </div>
          ) : userPages?.pages && userPages.pages.length > 0 ? (
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4'>
              {userPages.pages.map((page) => (
                <Link
                  key={page.id}
                  href={`/wiki/${page.id}`}
                  className='block card hover:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm border border-koala-100 rounded-xl p-3 sm:p-4 group'
                >
                  <h3 className='text-sm sm:text-base font-medium text-koala-900 mb-2 group-hover:text-primary-600 transition-colors line-clamp-2'>
                    {page.title}
                  </h3>
                  <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-koala-500 space-y-1 sm:space-y-0'>
                    <span>
                      {new Date(page.createdAt).toLocaleDateString("ja-JP", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <div className='flex items-center gap-1'>
                      <Eye className='w-3 h-3' />
                      <span>{page.viewCount || 0}回閲覧</span>
                    </div>
                  </div>
                  {page.tags && page.tags.length > 0 && (
                    <div className='flex flex-wrap gap-1 mt-2'>
                      {page.tags.slice(0, 2).map((tag: string) => (
                        <span
                          key={tag}
                          className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-600'
                        >
                          <Tag className='w-2.5 h-2.5 mr-1' />
                          {tag}
                        </span>
                      ))}
                      {page.tags.length > 2 && (
                        <span className='inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-koala-50 text-koala-600'>
                          +{page.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className='text-center py-8 sm:py-12'>
              <BookOpen className='w-12 h-12 sm:w-16 sm:h-16 text-koala-300 mx-auto mb-3 sm:mb-4' />
              <h3 className='text-base sm:text-lg font-medium text-koala-700 mb-2'>
                まだページがありません
              </h3>
              <p className='text-sm sm:text-base text-koala-500'>
                {user.nickname}さんはまだページを投稿していません
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

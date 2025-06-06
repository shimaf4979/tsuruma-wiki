"use client";

import React from "react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import Link from "next/link";
import { User, Calendar, BookOpen, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { userAPI } from "../../../lib/api";

export default function UserProfilePage() {
  const params = useParams();
  const userId = params.id as string;

  // ユーザー情報を取得
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => userAPI.getUser(userId),
  });

  // ユーザーの記事を取得
  const { data: userPages, isLoading: pagesLoading } = useQuery({
    queryKey: ["userPages", userId],
    queryFn: () => userAPI.getUserPages(userId, 10, 0),
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
            記事一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* ナビゲーション */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='mb-8'
        >
          <Link
            href='/pages'
            className='inline-flex items-center text-koala-600 hover:text-koala-900 transition-colors'
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            記事一覧に戻る
          </Link>
        </motion.div>

        {/* ユーザープロフィール */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className='card mb-8'
        >
          <div className='flex items-start space-x-6'>
            {/* アバター */}
            <div className='flex-shrink-0'>
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.nickname}
                  className='w-24 h-24 rounded-full object-cover'
                />
              ) : (
                <div className='w-24 h-24 rounded-full bg-primary-100 flex items-center justify-center'>
                  <User className='w-12 h-12 text-primary-600' />
                </div>
              )}
            </div>

            {/* プロフィール情報 */}
            <div className='flex-1'>
              <div className='flex items-center space-x-3 mb-2'>
                <h1 className='text-2xl font-bold text-koala-900'>
                  {user.nickname}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(
                    user.role
                  )}`}
                >
                  {getRoleLabel(user.role)}
                </span>
              </div>

              <div className='flex items-center space-x-4 text-sm text-koala-500 mb-4'>
                <div className='flex items-center space-x-1'>
                  <Calendar className='w-4 h-4' />
                  <span>
                    {new Date(user.createdAt).toLocaleDateString("ja-JP")}
                    から参加
                  </span>
                </div>
              </div>

              {user.bio && (
                <div className='mb-4'>
                  <p className='text-koala-700 leading-relaxed'>{user.bio}</p>
                </div>
              )}

              {/* 統計 */}
              <div className='flex items-center space-x-6 text-sm'>
                <div className='flex items-center space-x-1'>
                  <BookOpen className='w-4 h-4 text-koala-400' />
                  <span className='text-koala-600'>
                    {userPages?.length || 0}件の記事
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ユーザーの記事一覧 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className='text-xl font-semibold text-koala-900 mb-6'>
            投稿した記事
          </h2>

          {pagesLoading ? (
            <div className='space-y-4'>
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className='card animate-pulse'>
                  <div className='h-5 bg-koala-200 rounded mb-2 w-3/4'></div>
                  <div className='h-4 bg-koala-200 rounded mb-2 w-1/2'></div>
                  <div className='h-3 bg-koala-200 rounded w-1/3'></div>
                </div>
              ))}
            </div>
          ) : userPages && userPages.length > 0 ? (
            <div className='space-y-4'>
              {userPages.map((page) => (
                <Link
                  key={page.id}
                  href={`/wiki/${page.id}`}
                  className='block card hover:shadow-md transition-shadow'
                >
                  <h3 className='text-lg font-medium text-koala-900 mb-2'>
                    {page.title}
                  </h3>
                  <div className='flex items-center justify-between text-sm text-koala-500'>
                    <span>
                      {new Date(page.createdAt).toLocaleDateString("ja-JP")}
                    </span>
                    <span>{page.viewCount}回閲覧</span>
                  </div>
                  {page.tags.length > 0 && (
                    <div className='flex flex-wrap gap-1 mt-3'>
                      {page.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className='badge-secondary text-xs'>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className='text-center py-12'>
              <BookOpen className='w-16 h-16 text-koala-300 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-koala-700 mb-2'>
                まだ記事がありません
              </h3>
              <p className='text-koala-500'>
                {user.nickname}さんはまだ記事を投稿していません
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

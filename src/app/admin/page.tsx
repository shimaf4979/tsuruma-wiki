"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Users,
  FileText,
  MessageCircle,
  TrendingUp,
  AlertTriangle,
  Settings,
  BarChart3,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "../../lib/api";
import { useAuthStore } from "../../store";

export default function AdminPage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useAuthStore();

  // 権限チェック - 初期化完了後に実行
  React.useEffect(() => {
    // 初期化が完了していない場合は待機
    if (!isInitialized) {
      return;
    }

    // 初期化完了後、認証または権限チェック
    if (
      !isAuthenticated ||
      (user?.role !== "admin" && user?.role !== "moderator")
    ) {
      router.push("/");
      return;
    }
  }, [isAuthenticated, isInitialized, user, router]);

  // 統計データを取得
  const { data: stats, isLoading } = useQuery({
    queryKey: ["adminStats"],
    queryFn: adminAPI.getStats,
    enabled:
      isAuthenticated && (user?.role === "admin" || user?.role === "moderator"),
    staleTime: 5 * 60 * 1000,
  });

  // 承認待ちページを取得
  const { data: pendingPages } = useQuery({
    queryKey: ["pendingPages"],
    queryFn: () => adminAPI.getPendingPages(5, 0),
    enabled:
      isAuthenticated && (user?.role === "admin" || user?.role === "moderator"),
    staleTime: 2 * 60 * 1000,
  });

  // 初期化中の場合はローディング表示
  if (!isInitialized) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-muted-foreground'>読み込み中...</p>
        </div>
      </div>
    );
  }

  if (
    !isAuthenticated ||
    (user?.role !== "admin" && user?.role !== "moderator")
  ) {
    return null;
  }

  const statCards = [
    {
      title: "総ユーザー数",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "bg-blue-500",
      change: stats?.newUsersThisMonth || 0,
      changeLabel: "今月の新規",
    },
    {
      title: "公開ページ数",
      value: stats?.totalPages || 0,
      icon: FileText,
      color: "bg-green-500",
      change: stats?.newPagesThisMonth || 0,
      changeLabel: "今月の新規",
    },
    {
      title: "総コメント数",
      value: stats?.totalComments || 0,
      icon: MessageCircle,
      color: "bg-purple-500",
      change: stats?.commentsThisWeek || 0,
      changeLabel: "今週のコメント",
    },
    {
      title: "総閲覧数",
      value: stats?.totalViews || 0,
      icon: TrendingUp,
      color: "bg-orange-500",
      change: stats?.viewsThisWeek || 0,
      changeLabel: "今週の閲覧",
    },
  ];

  const quickActions = [
    {
      title: "ユーザー管理",
      description: "ユーザーの権限変更や管理",
      icon: Users,
      href: "/admin/users",
      color: "bg-blue-500",
    },
    {
      title: "ページ管理",
      description: "承認待ちページの確認",
      icon: FileText,
      href: "/admin/pages",
      color: "bg-green-500",
      badge: pendingPages?.length || 0,
    },
    {
      title: "システム設定",
      description: "サイト全体の設定管理",
      icon: Settings,
      href: "/admin/settings",
      color: "bg-gray-500",
      adminOnly: true,
    },
    {
      title: "アクティビティログ",
      description: "管理者操作の履歴確認",
      icon: BarChart3,
      href: "/admin/logs",
      color: "bg-purple-500",
      adminOnly: true,
    },
  ];

  return (
    <div className='min-h-screen bg-background'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='mb-8'
        >
          <h1 className='text-3xl font-bold text-foreground mb-2'>
            管理者ダッシュボード
          </h1>
          <p className='text-muted-foreground'>
            サイト全体の統計情報と管理機能
          </p>
        </motion.div>

        {/* 統計カード */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'
        >
          {statCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className='card'
              >
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-sm font-medium text-muted-foreground'>
                      {stat.title}
                    </p>
                    <p className='text-2xl font-bold text-foreground'>
                      {isLoading ? "..." : stat.value.toLocaleString()}
                    </p>
                    <p className='text-xs text-muted-foreground mt-1'>
                      {stat.changeLabel}: {stat.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className='w-6 h-6 text-white' />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
          {/* クイックアクション */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <h2 className='text-xl font-semibold text-foreground mb-4'>
              クイックアクション
            </h2>
            <div className='space-y-4'>
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                const isVisible = !action.adminOnly || user?.role === "admin";

                if (!isVisible) return null;

                return (
                  <motion.div
                    key={action.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  >
                    <a
                      href={action.href}
                      className='card hover:shadow-md transition-all cursor-pointer hover:border-border block'
                    >
                      <div className='flex items-center space-x-4'>
                        <div className={`p-3 rounded-lg ${action.color}`}>
                          <Icon className='w-6 h-6 text-white' />
                        </div>
                        <div className='flex-1'>
                          <div className='flex items-center space-x-2'>
                            <h3 className='font-medium text-foreground'>
                              {action.title}
                            </h3>
                            {action.badge && action.badge > 0 && (
                              <span className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-destructive text-destructive-foreground'>
                                {action.badge}
                              </span>
                            )}
                          </div>
                          <p className='text-sm text-muted-foreground'>
                            {action.description}
                          </p>
                        </div>
                      </div>
                    </a>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* 承認待ちページ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <h2 className='text-xl font-semibold text-foreground mb-4 flex items-center'>
              承認待ちページ
              {pendingPages && pendingPages.length > 0 && (
                <span className='ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-destructive text-destructive-foreground'>
                  {pendingPages.length}
                </span>
              )}
            </h2>
            <div className='space-y-4'>
              {pendingPages && pendingPages.length > 0 ? (
                pendingPages.slice(0, 5).map(
                  (
                    page: {
                      id: string;
                      title: string;
                      author: { nickname: string };
                      createdAt: string;
                    },
                    index: number
                  ) => (
                    <motion.div
                      key={page.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                      className='card hover:shadow-md transition-shadow'
                    >
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <h3 className='font-medium text-foreground line-clamp-2'>
                            {page.title}
                          </h3>
                          <div className='flex items-center space-x-2 mt-2 text-sm text-muted-foreground'>
                            <span>by {page.author.nickname}</span>
                            <span>•</span>
                            <span>
                              {new Date(page.createdAt).toLocaleDateString(
                                "ja-JP"
                              )}
                            </span>
                          </div>
                        </div>
                        <div className='flex items-center space-x-2 ml-4'>
                          <a
                            href={`/wiki/${page.id}`}
                            className='btn-outline btn-sm'
                          >
                            確認
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  )
                )
              ) : (
                <div className='card text-center py-8'>
                  <AlertTriangle className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
                  <h3 className='font-medium text-foreground mb-2'>
                    承認待ちのページはありません
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    新しいページが投稿されるとここに表示されます
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* 人気ページ */}
        {stats?.topPages && stats.topPages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className='mt-8'
          >
            <h2 className='text-xl font-semibold text-foreground mb-4'>
              人気ページ Top 5
            </h2>
            <div className='card'>
              <div className='space-y-4'>
                {stats.topPages.map((page, index) => (
                  <div
                    key={page.id}
                    className='flex items-center justify-between py-2'
                  >
                    <div className='flex items-center space-x-3'>
                      <span className='flex-shrink-0 w-6 h-6 bg-primary/10 text-primary rounded text-sm font-medium flex items-center justify-center'>
                        {index + 1}
                      </span>
                      <a
                        href={`/wiki/${page.id}`}
                        className='font-medium text-foreground hover:text-primary transition-colors line-clamp-1'
                      >
                        {page.title}
                      </a>
                    </div>
                    <span className='text-sm text-muted-foreground'>
                      {page.viewCount}回閲覧
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

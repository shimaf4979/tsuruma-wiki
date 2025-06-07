// app/settings/page.tsx - 設定ページ
"use client";

import React from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Bell,
  Shield,
  Palette,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "../../store";

export default function SettingsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useAuthStore();

  // 認証チェック - 初期化完了後に実行
  React.useEffect(() => {
    // 初期化が完了していない場合は待機
    if (!isInitialized) {
      return;
    }

    // 初期化完了後、認証されていない場合はログイン画面へ
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
  }, [isAuthenticated, isInitialized, router]);

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

  if (!isAuthenticated) {
    return null;
  }

  const settingsMenu = [
    {
      icon: User,
      title: "プロフィール",
      description: "ニックネーム、アバター、自己紹介を編集",
      href: "/profile",
    },
    {
      icon: Bell,
      title: "通知設定",
      description: "コメントや返信の通知設定",
      href: "/settings/notifications",
      disabled: true,
    },
    {
      icon: Shield,
      title: "プライバシー",
      description: "アカウントのプライバシー設定",
      href: "/settings/privacy",
      disabled: true,
    },
    {
      icon: Palette,
      title: "テーマ設定",
      description: "ダークモード・ライトモードの切り替え",
      href: "/settings/theme",
      disabled: true,
    },
    {
      icon: HelpCircle,
      title: "ヘルプ・サポート",
      description: "よくある質問とお問い合わせ",
      href: "/contact",
    },
  ];

  return (
    <div className='min-h-screen bg-background'>
      <div className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* ナビゲーション */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.1 }}
          className='mb-8'
        >
          <button
            onClick={() => router.back()}
            className='inline-flex items-center text-muted-foreground hover:text-foreground transition-colors'
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            戻る
          </button>
        </motion.div>

        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.1, delay: 0.01 }}
          className='mb-8'
        >
          <h1 className='text-3xl font-bold text-foreground mb-2'>設定</h1>
          <p className='text-muted-foreground'>アカウントと環境設定を管理</p>
        </motion.div>

        {/* 設定メニュー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.1, delay: 0.02 }}
          className='space-y-4'
        >
          {settingsMenu.map((item, index) => {
            const Icon = item.icon;
            const isDisabled = item.disabled;

            const content = (
              <div
                className={`card hover:shadow-md transition-all ${
                  isDisabled
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer hover:border-border"
                }`}
              >
                <div className='flex items-center space-x-4'>
                  <div
                    className={`p-3 rounded-lg ${
                      isDisabled ? "bg-muted/50" : "bg-primary/10"
                    }`}
                  >
                    <Icon
                      className={`w-6 h-6 ${
                        isDisabled ? "text-muted-foreground" : "text-primary"
                      }`}
                    />
                  </div>
                  <div className='flex-1'>
                    <h3 className='font-medium text-foreground flex items-center'>
                      {item.title}
                      {isDisabled && (
                        <span className='ml-2 text-xs text-muted-foreground'>
                          (準備中)
                        </span>
                      )}
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            );

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.1, delay: 0.03 + index * 0.01 }}
              >
                {isDisabled ? content : <Link href={item.href}>{content}</Link>}
              </motion.div>
            );
          })}
        </motion.div>

        {/* アカウント情報 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.1, delay: 0.04 }}
          className='mt-12 card'
        >
          <h3 className='font-medium text-foreground mb-4'>アカウント情報</h3>
          <div className='space-y-3 text-sm'>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>ニックネーム</span>
              <span className='text-foreground'>{user?.nickname}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>メールアドレス</span>
              <span className='text-foreground'>{user?.email}</span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>権限</span>
              <span className='text-foreground'>
                {user?.role === "admin" && "管理者"}
                {user?.role === "moderator" && "モデレーター"}
                {user?.role === "editor" && "エディター"}
                {user?.role === "contributor" && "コントリビューター"}
              </span>
            </div>
            <div className='flex justify-between'>
              <span className='text-muted-foreground'>参加日</span>
              <span className='text-foreground'>
                {user?.createdAt &&
                  new Date(user.createdAt).toLocaleDateString("ja-JP")}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

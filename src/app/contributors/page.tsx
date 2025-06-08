"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Users,
  Crown,
  Shield,
  Edit,
  UserPlus,
  Search,
  BookOpen,
  MessageCircle,
  Award,
  Star,
  TrendingUp,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

// 権限レベルの表示設定
const roleConfig = {
  admin: {
    label: "管理者",
    icon: Crown,
    color: "bg-red-100 text-red-800 border-red-200",
    bgColor: "bg-red-50",
    description: "サイト全体の管理・運営",
  },
  moderator: {
    label: "モデレーター",
    icon: Shield,
    color: "bg-purple-100 text-purple-800 border-purple-200",
    bgColor: "bg-purple-50",
    description: "ページ承認・ユーザー管理",
  },
  editor: {
    label: "エディター",
    icon: Edit,
    color: "bg-blue-100 text-blue-800 border-blue-200",
    bgColor: "bg-blue-50",
    description: "ページ作成・編集・即時公開",
  },
  contributor: {
    label: "コントリビューター",
    icon: UserPlus,
    color: "bg-green-100 text-green-800 border-green-200",
    bgColor: "bg-green-50",
    description: "ページ作成・コメント投稿",
  },
};

// ユーザー詳細表示用の型
interface ContributorWithStats {
  id: string;
  nickname: string;
  role: "contributor" | "editor" | "moderator" | "admin";
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
  pageCount: number;
  commentCount: number;
  totalViews: number;
  lastActive: string;
}

export default function ContributorsPage() {
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"recent" | "contributions" | "views">(
    "contributions"
  );

  // 編集者一覧を取得（管理者APIを模擬）
  const { data: contributors, isLoading } = useQuery({
    queryKey: ["contributors", selectedRole, searchQuery, sortBy],
    queryFn: async () => {
      // 実際のAPIコール（管理者権限が必要な場合は適切なエンドポイントを使用）
      // ここでは模擬データを返す
      const mockData: ContributorWithStats[] = [
        {
          id: "user-001",
          nickname: "鶴舞太郎",
          role: "admin",
          avatarUrl: "/avatars/taro.jpg",
          bio: "鶴舞こあらWikiの管理者です。地域の魅力を発信していきましょう！",
          createdAt: "2024-01-15T09:00:00Z",
          pageCount: 25,
          commentCount: 120,
          totalViews: 5800,
          lastActive: "2024-06-07T10:30:00Z",
        },
        {
          id: "user-002",
          nickname: "地域愛好家",
          role: "moderator",
          avatarUrl: "/avatars/local.jpg",
          bio: "鶴舞地域の隠れスポットを紹介しています",
          createdAt: "2024-02-01T14:20:00Z",
          pageCount: 18,
          commentCount: 85,
          totalViews: 3200,
          lastActive: "2024-06-06T16:45:00Z",
        },
        {
          id: "user-003",
          nickname: "カフェ巡り好き",
          role: "editor",
          avatarUrl: "/avatars/cafe.jpg",
          bio: "鶴舞周辺のカフェ情報をお届け♪",
          createdAt: "2024-02-20T11:15:00Z",
          pageCount: 32,
          commentCount: 156,
          totalViews: 7500,
          lastActive: "2024-06-07T08:20:00Z",
        },
        {
          id: "user-004",
          nickname: "イベント情報局",
          role: "editor",
          avatarUrl: "/avatars/event.jpg",
          bio: "地域イベントの最新情報をシェアします",
          createdAt: "2024-03-01T16:30:00Z",
          pageCount: 28,
          commentCount: 92,
          totalViews: 4800,
          lastActive: "2024-06-06T20:10:00Z",
        },
        {
          id: "user-005",
          nickname: "学生記者",
          role: "contributor",
          avatarUrl: "/avatars/student.jpg",
          bio: "大学生目線での鶴舞情報をお届け",
          createdAt: "2024-03-15T13:45:00Z",
          pageCount: 12,
          commentCount: 48,
          totalViews: 1800,
          lastActive: "2024-06-07T12:00:00Z",
        },
        {
          id: "user-006",
          nickname: "グルメレポーター",
          role: "contributor",
          avatarUrl: "/avatars/gourmet.jpg",
          bio: "美味しいお店を見つけるのが得意です",
          createdAt: "2024-04-01T10:00:00Z",
          pageCount: 20,
          commentCount: 73,
          totalViews: 3500,
          lastActive: "2024-06-05T19:30:00Z",
        },
      ];

      // フィルタリング
      let filtered = mockData;

      if (selectedRole !== "all") {
        filtered = filtered.filter((user) => user.role === selectedRole);
      }

      if (searchQuery) {
        filtered = filtered.filter(
          (user) =>
            user.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (user.bio &&
              user.bio.toLowerCase().includes(searchQuery.toLowerCase()))
        );
      }

      // ソート
      switch (sortBy) {
        case "contributions":
          filtered.sort((a, b) => b.pageCount - a.pageCount);
          break;
        case "views":
          filtered.sort((a, b) => b.totalViews - a.totalViews);
          break;
        case "recent":
          filtered.sort(
            (a, b) =>
              new Date(b.lastActive).getTime() -
              new Date(a.lastActive).getTime()
          );
          break;
      }

      return filtered;
    },
    staleTime: 5 * 60 * 1000,
  });

  const roleStats = {
    all: contributors?.length || 0,
    admin: contributors?.filter((u) => u.role === "admin").length || 0,
    moderator: contributors?.filter((u) => u.role === "moderator").length || 0,
    editor: contributors?.filter((u) => u.role === "editor").length || 0,
    contributor:
      contributors?.filter((u) => u.role === "contributor").length || 0,
  };

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='mb-8'
        >
          <div className='text-center mb-8'>
            <h1 className='text-4xl font-bold text-koala-900 mb-4'>
              🐨 編集者一覧
            </h1>
            <p className='text-xl text-koala-600'>
              鶴舞こあらWikiを支える素晴らしいメンバーたち
            </p>
          </div>

          {/* 統計カード */}
          <div className='grid grid-cols-2 md:grid-cols-5 gap-4 mb-8'>
            {Object.entries(roleStats).map(([role, count]) => {
              const config =
                role === "all"
                  ? {
                      label: "全メンバー",
                      icon: Users,
                      color: "bg-koala-100 text-koala-800",
                    }
                  : roleConfig[role as keyof typeof roleConfig];
              const Icon = config.icon;

              return (
                <motion.button
                  key={role}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  onClick={() => setSelectedRole(role)}
                  className={`p-4 rounded-lg border transition-all ${
                    selectedRole === role
                      ? config.color + " shadow-md"
                      : "bg-white border-koala-200 hover:border-koala-300"
                  }`}
                >
                  <div className='flex items-center justify-center mb-2'>
                    <Icon className='w-6 h-6' />
                  </div>
                  <div className='text-2xl font-bold'>{count}</div>
                  <div className='text-sm'>{config.label}</div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* 検索・フィルター */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className='card mb-8'
        >
          <div className='flex flex-col lg:flex-row lg:items-center gap-4'>
            {/* 検索 */}
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-koala-400 w-5 h-5' />
                <input
                  type='text'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder='メンバーを検索...'
                  className='input pl-10 w-full'
                />
              </div>
            </div>

            {/* ソート */}
            <div className='flex items-center space-x-2'>
              <label className='text-sm font-medium text-koala-700'>
                並び順:
              </label>
              <select
                title='並び順'
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value as "recent" | "contributions" | "views"
                  )
                }
                className='input w-auto'
              >
                <option value='contributions'>投稿数順</option>
                <option value='views'>閲覧数順</option>
                <option value='recent'>最終活動順</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* メンバー一覧 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {isLoading ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className='card animate-pulse'>
                  <div className='flex items-start space-x-4'>
                    <div className='w-16 h-16 bg-koala-200 rounded-full'></div>
                    <div className='flex-1'>
                      <div className='h-4 bg-koala-200 rounded mb-2'></div>
                      <div className='h-3 bg-koala-200 rounded mb-2 w-2/3'></div>
                      <div className='h-3 bg-koala-200 rounded w-1/2'></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : contributors && contributors.length > 0 ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {contributors.map((contributor, index) => {
                const config = roleConfig[contributor.role];
                const Icon = config.icon;

                return (
                  <motion.div
                    key={contributor.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Link href={`/users/${contributor.id}`} className='block'>
                      <div
                        className={`card hover:shadow-lg transition-all border-l-4 ${
                          config.color.split(" ")[2]
                        } ${config.bgColor}`}
                      >
                        {/* ヘッダー */}
                        <div className='flex items-start space-x-4 mb-4'>
                          {/* アバター */}
                          <div className='relative'>
                            {contributor.avatarUrl ? (
                              <img
                                src={contributor.avatarUrl}
                                alt={contributor.nickname}
                                className='w-16 h-16 rounded-full object-cover'
                              />
                            ) : (
                              <div className='w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center'>
                                <Icon className='w-8 h-8 text-primary-600' />
                              </div>
                            )}
                            {/* オンライン表示（最終活動が24時間以内） */}
                            {new Date(contributor.lastActive).getTime() >
                              Date.now() - 24 * 60 * 60 * 1000 && (
                              <div className='absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-white rounded-full'></div>
                            )}
                          </div>

                          {/* 基本情報 */}
                          <div className='flex-1 min-w-0'>
                            <div className='flex items-center space-x-2 mb-1'>
                              <h3 className='font-medium text-koala-900 truncate'>
                                {contributor.nickname}
                              </h3>
                              {contributor.role === "admin" && (
                                <Star className='w-4 h-4 text-yellow-500' />
                              )}
                            </div>

                            <div
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${config.color}`}
                            >
                              <Icon className='w-3 h-3 mr-1' />
                              {config.label}
                            </div>

                            <div className='mt-2 text-xs text-koala-500'>
                              参加:{" "}
                              {new Date(
                                contributor.createdAt
                              ).toLocaleDateString("ja-JP")}
                            </div>
                          </div>
                        </div>

                        {/* 自己紹介 */}
                        {contributor.bio && (
                          <p className='text-sm text-koala-600 mb-4 line-clamp-2'>
                            {contributor.bio}
                          </p>
                        )}

                        {/* 活動統計 */}
                        <div className='grid grid-cols-3 gap-4 text-center'>
                          <div>
                            <div className='flex items-center justify-center mb-1'>
                              <BookOpen className='w-4 h-4 text-koala-400 mr-1' />
                            </div>
                            <div className='text-lg font-medium text-koala-900'>
                              {contributor.pageCount}
                            </div>
                            <div className='text-xs text-koala-500'>ページ</div>
                          </div>

                          <div>
                            <div className='flex items-center justify-center mb-1'>
                              <MessageCircle className='w-4 h-4 text-koala-400 mr-1' />
                            </div>
                            <div className='text-lg font-medium text-koala-900'>
                              {contributor.commentCount}
                            </div>
                            <div className='text-xs text-koala-500'>
                              コメント
                            </div>
                          </div>

                          <div>
                            <div className='flex items-center justify-center mb-1'>
                              <TrendingUp className='w-4 h-4 text-koala-400 mr-1' />
                            </div>
                            <div className='text-lg font-medium text-koala-900'>
                              {contributor.totalViews.toLocaleString()}
                            </div>
                            <div className='text-xs text-koala-500'>閲覧</div>
                          </div>
                        </div>

                        {/* 最終活動 */}
                        <div className='mt-4 pt-3 border-t border-koala-200'>
                          <div className='flex items-center justify-between text-xs text-koala-500'>
                            <span>最終活動</span>
                            <span>
                              {new Date(
                                contributor.lastActive
                              ).toLocaleDateString("ja-JP")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className='text-center py-12'>
              <Users className='w-16 h-16 text-koala-300 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-koala-700 mb-2'>
                メンバーが見つかりませんでした
              </h3>
              <p className='text-koala-500'>検索条件を変更してお試しください</p>
            </div>
          )}
        </motion.div>

        {/* 参加促進セクション */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className='mt-16'
        >
          <div className='card text-center bg-gradient-to-r from-primary-50 to-blue-50'>
            <Award className='w-12 h-12 text-primary-600 mx-auto mb-4' />
            <h3 className='text-2xl font-bold text-koala-900 mb-4'>
              あなたも編集者になりませんか？
            </h3>
            <p className='text-koala-600 mb-6 max-w-2xl mx-auto'>
              鶴舞こあらWikiでは、地域を愛する皆さんの参加をお待ちしています。
              ページを投稿して、地域の魅力を一緒に発信しましょう！
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              <Link href='/register' className='btn-primary'>
                <UserPlus className='w-5 h-5 mr-2' />
                今すぐ参加
              </Link>
              <Link href='/about' className='btn-outline'>
                詳しく見る
              </Link>
            </div>
          </div>
        </motion.div>

        {/* 権限説明セクション */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className='mt-12'
        >
          <h3 className='text-xl font-medium text-koala-900 mb-6 text-center'>
            編集者の役割について
          </h3>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
            {Object.entries(roleConfig).map(([role, config]) => {
              const Icon = config.icon;
              return (
                <div
                  key={role}
                  className={`card ${config.bgColor} border-l-4 ${
                    config.color.split(" ")[2]
                  }`}
                >
                  <div className='flex items-center space-x-3 mb-3'>
                    <div
                      className={`p-2 rounded-lg ${config.color
                        .split(" ")
                        .slice(0, 2)
                        .join(" ")}`}
                    >
                      <Icon className='w-5 h-5' />
                    </div>
                    <h4 className='font-medium text-koala-900'>
                      {config.label}
                    </h4>
                  </div>
                  <p className='text-sm text-koala-600'>{config.description}</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Users,
  Search,
  MoreVertical,
  ArrowLeft,
  Shield,
  Mail,
  Calendar,
  FileText,
  MessageCircle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI } from "../../../lib/api";
import { useAuthStore, useUIStore } from "../../../store";
import { User } from "../../../types";

export default function AdminUsersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const { addToast, openModal } = useUIStore();

  const [filters, setFilters] = useState({
    search: "",
    role: "",
    limit: 50,
    offset: 0,
  });
  const [selectedUser, setSelectedUser] = useState<string | null>(null);

  // 権限チェック
  React.useEffect(() => {
    if (
      !isAuthenticated ||
      (user?.role !== "admin" && user?.role !== "moderator")
    ) {
      router.push("/");
      return;
    }
  }, [isAuthenticated, user, router]);

  // ユーザー一覧を取得
  const { data: usersData, isLoading } = useQuery({
    queryKey: ["adminUsers", filters],
    queryFn: () =>
      adminAPI.getUsers({
        search: filters.search || undefined,
        role: filters.role || undefined,
        limit: filters.limit,
        offset: filters.offset,
      }),
    enabled:
      isAuthenticated && (user?.role === "admin" || user?.role === "moderator"),
    staleTime: 2 * 60 * 1000,
  });

  // 権限変更
  const changeRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      adminAPI.changeUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      addToast({
        type: "success",
        title: "権限を変更しました",
      });
      setSelectedUser(null);
    },
    onError: (error: { response?: { data?: { error?: string } } }) => {
      addToast({
        type: "error",
        title: "権限変更に失敗しました",
        description: error.response?.data?.error || "エラーが発生しました",
      });
    },
  });

  const handleRoleChange = (
    userId: string,
    newRole: string,
    userName: string
  ) => {
    openModal({
      type: "confirm",
      title: "権限を変更しますか？",
      content: (
        <div>
          <p className='text-koala-600 mb-4'>
            {userName}さんの権限を{getRoleLabel(newRole)}に変更しますか？
          </p>
          <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-3'>
            <p className='text-sm text-yellow-800'>
              権限変更は即座に適用され、ユーザーの利用可能な機能が変わります。
            </p>
          </div>
        </div>
      ),
      onConfirm: () => changeRoleMutation.mutate({ userId, role: newRole }),
    });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, offset: 0 }));
  };

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

  const roleOptions = [
    { value: "", label: "全ての権限" },
    { value: "contributor", label: "コントリビューター" },
    { value: "editor", label: "エディター" },
    { value: "moderator", label: "モデレーター" },
    { value: "admin", label: "管理者" },
  ];

  if (
    !isAuthenticated ||
    (user?.role !== "admin" && user?.role !== "moderator")
  ) {
    return null;
  }

  return (
    <div className='min-h-screen bg-background'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* ナビゲーション */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='mb-8'
        >
          <button
            onClick={() => router.push("/admin")}
            className='inline-flex items-center text-muted-foreground hover:text-foreground transition-colors'
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            管理者ダッシュボードに戻る
          </button>
        </motion.div>

        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className='mb-8'
        >
          <h1 className='text-3xl font-bold text-foreground mb-2 flex items-center'>
            <Users className='w-8 h-8 mr-3 text-primary' />
            ユーザー管理
          </h1>
          <p className='text-muted-foreground'>
            ユーザーの権限管理と活動状況を確認
          </p>
        </motion.div>

        {/* フィルター・検索バー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className='card mb-6'
        >
          <div className='flex flex-col lg:flex-row lg:items-center gap-4'>
            {/* 検索 */}
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5' />
                <input
                  type='text'
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder='ニックネーム・メールアドレスで検索...'
                  className='input pl-10 w-full'
                />
              </div>
            </div>

            {/* 権限フィルター */}
            <div className='flex items-center space-x-2'>
              <label className='text-sm font-medium text-foreground'>
                権限:
              </label>
              <select
                title='権限'
                value={filters.role}
                onChange={(e) => handleFilterChange("role", e.target.value)}
                className='input w-auto'
              >
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 表示件数 */}
            <div className='flex items-center space-x-2'>
              <label className='text-sm font-medium text-foreground'>
                表示:
              </label>
              <select
                title='表示件数'
                value={filters.limit}
                onChange={(e) => handleFilterChange("limit", e.target.value)}
                className='input w-auto'
              >
                <option value={25}>25件</option>
                <option value={50}>50件</option>
                <option value={100}>100件</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* ユーザー一覧 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {isLoading ? (
            <div className='space-y-4'>
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className='card animate-pulse'>
                  <div className='flex items-center space-x-4'>
                    <div className='w-12 h-12 bg-muted rounded-full'></div>
                    <div className='flex-1'>
                      <div className='h-4 bg-muted rounded mb-2 w-1/3'></div>
                      <div className='h-3 bg-muted rounded w-1/2'></div>
                    </div>
                    <div className='h-6 bg-muted rounded w-20'></div>
                  </div>
                </div>
              ))}
            </div>
          ) : usersData?.users && usersData.users.length > 0 ? (
            <>
              {/* 結果数表示 */}
              <div className='mb-6'>
                <p className='text-sm text-muted-foreground'>
                  {usersData.total}人のユーザーが見つかりました
                </p>
              </div>

              {/* ユーザーカード */}
              <div className='space-y-4'>
                {usersData.users.map((userData: User) => (
                  <div key={userData.id} className='card'>
                    <div className='flex items-start justify-between'>
                      <div className='flex items-start space-x-4 flex-1'>
                        {/* アバター */}
                        <div className='flex-shrink-0'>
                          {userData.avatarUrl ? (
                            <img
                              src={userData.avatarUrl}
                              alt={userData.nickname}
                              className='w-12 h-12 rounded-full object-cover'
                            />
                          ) : (
                            <div className='w-12 h-12 rounded-full bg-muted flex items-center justify-center'>
                              <Users className='w-6 h-6 text-muted-foreground' />
                            </div>
                          )}
                        </div>

                        {/* ユーザー情報 */}
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-center space-x-3 mb-2'>
                            <h3 className='font-medium text-foreground'>
                              {userData.nickname}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(
                                userData.role
                              )}`}
                            >
                              {getRoleLabel(userData.role)}
                            </span>
                          </div>

                          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground'>
                            <div className='flex items-center space-x-2'>
                              <Mail className='w-4 h-4' />
                              <span className='truncate'>{userData.email}</span>
                            </div>
                            <div className='flex items-center space-x-2'>
                              <Calendar className='w-4 h-4' />
                              <span>
                                {new Date(
                                  userData.createdAt
                                ).toLocaleDateString("ja-JP")}
                              </span>
                            </div>
                            <div className='flex items-center space-x-2'>
                              <FileText className='w-4 h-4' />
                              <span>{userData.pageCount || 0}記事</span>
                            </div>
                            <div className='flex items-center space-x-2'>
                              <MessageCircle className='w-4 h-4' />
                              <span>{userData.commentCount || 0}コメント</span>
                            </div>
                          </div>

                          {userData.bio && (
                            <p className='text-sm text-muted-foreground mt-2 line-clamp-2'>
                              {userData.bio}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* アクションメニュー */}
                      {user?.role === "admin" && userData.id !== user.id && (
                        <div className='relative'>
                          <button
                            title='権限変更'
                            onClick={() =>
                              setSelectedUser(
                                selectedUser === userData.id
                                  ? null
                                  : userData.id
                              )
                            }
                            className='p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors'
                          >
                            <MoreVertical className='w-5 h-5' />
                          </button>

                          {selectedUser === userData.id && (
                            <div className='absolute right-0 mt-2 w-48 bg-background rounded-lg shadow-lg border border-border py-1 z-10'>
                              <div className='px-4 py-2 border-b border-border'>
                                <p className='text-sm font-medium text-foreground'>
                                  権限変更
                                </p>
                              </div>
                              {roleOptions
                                .filter(
                                  (option) =>
                                    option.value &&
                                    option.value !== userData.role
                                )
                                .map((option) => (
                                  <button
                                    key={option.value}
                                    onClick={() =>
                                      handleRoleChange(
                                        userData.id,
                                        option.value,
                                        userData.nickname
                                      )
                                    }
                                    className='w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted transition-colors flex items-center space-x-2'
                                  >
                                    <Shield className='w-4 h-4' />
                                    <span>{option.label}に変更</span>
                                  </button>
                                ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* ページネーション */}
              {usersData.hasMore && (
                <div className='text-center mt-8'>
                  <button
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        offset: prev.offset + prev.limit,
                      }))
                    }
                    className='btn-outline'
                  >
                    もっと読み込む
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className='text-center py-12'>
              <Users className='w-16 h-16 text-muted-foreground mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-foreground mb-2'>
                ユーザーが見つかりませんでした
              </h3>
              <p className='text-muted-foreground mb-4'>
                検索条件を変更してみてください
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* メニューの背景クリック */}
      {selectedUser && (
        <div
          className='fixed inset-0 z-5'
          onClick={() => setSelectedUser(null)}
        />
      )}
    </div>
  );
}

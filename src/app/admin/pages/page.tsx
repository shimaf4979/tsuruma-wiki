"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  FileText,
  Search,
  Eye,
  Check,
  Trash2,
  ArrowLeft,
  Calendar,
  User,
  BarChart3,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminAPI, wikiAPI } from "../../../lib/api";
import { useAuthStore, useUIStore } from "../../../store";
import { WikiPage } from "../../../types";

export default function AdminPagesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const { addToast, openModal } = useUIStore();

  const [filters, setFilters] = useState({
    status: "draft",
    search: "",
    limit: 20,
    offset: 0,
  });

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

  // 記事一覧を取得
  const { data: pagesData, isLoading } = useQuery({
    queryKey: ["adminPages", filters],
    queryFn: () => {
      if (filters.status === "draft") {
        return adminAPI.getPendingPages(filters.limit, filters.offset);
      } else {
        return wikiAPI.getPages({
          status: filters.status as "published" | "draft",
          search: filters.search || undefined,
          limit: filters.limit,
          offset: filters.offset,
        });
      }
    },
    enabled:
      isAuthenticated && (user?.role === "admin" || user?.role === "moderator"),
    staleTime: 1 * 60 * 1000,
  });

  // 記事承認
  const approvePageMutation = useMutation({
    mutationFn: (pageId: string) => wikiAPI.approvePage(pageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPages"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      addToast({
        type: "success",
        title: "記事を承認しました",
      });
    },
    onError: (error: { response?: { data?: { error?: string } } }) => {
      addToast({
        type: "error",
        title: "記事の承認に失敗しました",
        description: error.response?.data?.error || "エラーが発生しました",
      });
    },
  });

  // 記事削除
  const deletePageMutation = useMutation({
    mutationFn: (pageId: string) => wikiAPI.deletePage(pageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminPages"] });
      queryClient.invalidateQueries({ queryKey: ["adminStats"] });
      addToast({
        type: "success",
        title: "記事を削除しました",
      });
    },
    onError: (error: { response?: { data?: { error?: string } } }) => {
      addToast({
        type: "error",
        title: "記事の削除に失敗しました",
        description: error.response?.data?.error || "エラーが発生しました",
      });
    },
  });

  const handleApprove = (pageId: string, title: string) => {
    openModal({
      type: "confirm",
      title: "記事を承認しますか？",
      content: (
        <div>
          <p className='text-muted-foreground mb-4'>
            「{title}」を承認して公開しますか？
          </p>
          <div className='bg-green-50 border border-green-200 rounded-lg p-3'>
            <p className='text-sm text-green-800'>
              承認後は一般ユーザーに公開され、検索結果にも表示されます。
            </p>
          </div>
        </div>
      ),
      onConfirm: () => approvePageMutation.mutate(pageId),
    });
  };

  const handleDelete = (pageId: string, title: string) => {
    openModal({
      type: "confirm",
      title: "記事を削除しますか？",
      content: (
        <div>
          <p className='text-muted-foreground mb-4'>
            「{title}」を削除しますか？
          </p>
          <div className='bg-red-50 border border-red-200 rounded-lg p-3'>
            <p className='text-sm text-red-800'>
              この操作は取り消すことができません。記事のコメントも同時に削除されます。
            </p>
          </div>
        </div>
      ),
      onConfirm: () => deletePageMutation.mutate(pageId),
    });
  };

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value, offset: 0 }));
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "draft":
        return "承認待ち";
      case "published":
        return "公開中";
      case "archived":
        return "アーカイブ";
      default:
        return "不明";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      case "published":
        return "bg-green-100 text-green-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const statusOptions = [
    { value: "draft", label: "承認待ち", icon: Clock },
    { value: "published", label: "公開中", icon: Check },
    { value: "archived", label: "アーカイブ", icon: FileText },
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
            <FileText className='w-8 h-8 mr-3 text-primary' />
            記事管理
          </h1>
          <p className='text-muted-foreground'>
            記事の承認・管理と公開状況を確認
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
            {/* ステータス切替 */}
            <div className='flex items-center space-x-1 bg-muted rounded-lg p-1'>
              {statusOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button
                    key={option.value}
                    onClick={() => handleFilterChange("status", option.value)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      filters.status === option.value
                        ? "bg-background text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className='w-4 h-4' />
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>

            {/* 検索 */}
            {filters.status !== "draft" && (
              <div className='flex-1'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5' />
                  <input
                    type='text'
                    value={filters.search}
                    onChange={(e) =>
                      handleFilterChange("search", e.target.value)
                    }
                    placeholder='記事タイトルで検索...'
                    className='input pl-10 w-full'
                  />
                </div>
              </div>
            )}

            {/* 表示件数 */}
            <div className='flex items-center space-x-2'>
              <label className='text-sm font-medium text-foreground'>
                表示:
              </label>
              <select
                title='表示件数'
                value={filters.limit}
                onChange={(e) =>
                  handleFilterChange("limit", Number(e.target.value))
                }
                className='input w-auto'
              >
                <option value={10}>10件</option>
                <option value={20}>20件</option>
                <option value={50}>50件</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* 記事一覧 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {isLoading ? (
            <div className='space-y-4'>
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className='card animate-pulse'>
                  <div className='flex items-start justify-between'>
                    <div className='flex-1'>
                      <div className='h-5 bg-muted rounded mb-2 w-3/4'></div>
                      <div className='h-4 bg-muted rounded mb-2 w-1/2'></div>
                      <div className='h-3 bg-muted rounded w-1/3'></div>
                    </div>
                    <div className='flex space-x-2'>
                      <div className='h-8 bg-muted rounded w-20'></div>
                      <div className='h-8 bg-muted rounded w-20'></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : pagesData && pagesData.length > 0 ? (
            <>
              {/* 結果数表示 */}
              <div className='mb-6'>
                <p className='text-sm text-muted-foreground'>
                  {Array.isArray(pagesData)
                    ? pagesData.length
                    : pagesData.total}
                  件の記事が見つかりました
                </p>
              </div>

              {/* 記事カード */}
              <div className='space-y-4'>
                {(Array.isArray(pagesData)
                  ? pagesData
                  : pagesData.pages || []
                ).map((page: WikiPage) => (
                  <div key={page.id} className='card'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1 min-w-0'>
                        {/* タイトルと状態 */}
                        <div className='flex items-start space-x-3 mb-3'>
                          <div className='flex-1 min-w-0'>
                            <h3 className='text-lg font-medium text-foreground line-clamp-2 mb-2'>
                              {page.title}
                            </h3>
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                                page.status
                              )}`}
                            >
                              {getStatusLabel(page.status)}
                            </span>
                          </div>
                        </div>

                        {/* メタ情報 */}
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground mb-3'>
                          <div className='flex items-center space-x-2'>
                            <User className='w-4 h-4' />
                            <span>{page.author.nickname}</span>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <Calendar className='w-4 h-4' />
                            <span>
                              {new Date(page.createdAt).toLocaleDateString(
                                "ja-JP"
                              )}
                            </span>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <BarChart3 className='w-4 h-4' />
                            <span>{page.viewCount}回閲覧</span>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <Clock className='w-4 h-4' />
                            <span>
                              {new Date(page.updatedAt).toLocaleDateString(
                                "ja-JP"
                              )}
                            </span>
                          </div>
                        </div>

                        {/* タグ */}
                        {page.tags.length > 0 && (
                          <div className='flex flex-wrap gap-1'>
                            {page.tags.slice(0, 5).map((tag: string) => (
                              <span
                                key={tag}
                                className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground'
                              >
                                {tag}
                              </span>
                            ))}
                            {page.tags.length > 5 && (
                              <span className='text-xs text-muted-foreground'>
                                +{page.tags.length - 5}個
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* アクションボタン */}
                      <div className='flex items-center space-x-2 ml-4'>
                        {/* プレビュー */}
                        <button
                          onClick={() => router.push(`/wiki/${page.id}`)}
                          className='p-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors'
                          title='プレビュー'
                        >
                          <Eye className='w-5 h-5' />
                        </button>

                        {/* 承認（承認待ちの場合のみ） */}
                        {page.status === "draft" && (
                          <button
                            onClick={() => handleApprove(page.id, page.title)}
                            disabled={approvePageMutation.isPending}
                            className='p-2 rounded-lg text-green-600 hover:bg-green-50 transition-colors'
                            title='承認'
                          >
                            <Check className='w-5 h-5' />
                          </button>
                        )}

                        {/* 削除 */}
                        <button
                          onClick={() => handleDelete(page.id, page.title)}
                          disabled={deletePageMutation.isPending}
                          className='p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors'
                          title='削除'
                        >
                          <Trash2 className='w-5 h-5' />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* ページネーション */}
              {!Array.isArray(pagesData) && pagesData.hasMore && (
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
              <AlertCircle className='w-16 h-16 text-muted-foreground mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-foreground mb-2'>
                {filters.status === "draft"
                  ? "承認待ちの記事はありません"
                  : "記事が見つかりませんでした"}
              </h3>
              <p className='text-muted-foreground mb-4'>
                {filters.status === "draft"
                  ? "新しい記事が投稿されるとここに表示されます"
                  : "検索条件を変更してみてください"}
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Search,
  ArrowLeft,
  User,
  Activity,
  Shield,
  FileText,
  Trash2,
  Download,
  RefreshCw,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { adminAPI } from "../../../lib/api";
import { useAuthStore, useUIStore } from "../../../store";
import { Log } from "../../../types";
export default function AdminLogsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { addToast } = useUIStore();

  const [filters, setFilters] = useState({
    action: "",
    adminId: "",
    search: "",
    limit: 50,
    offset: 0,
  });

  // 権限チェック
  React.useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/");
      return;
    }
  }, [isAuthenticated, user, router]);

  // ログ一覧を取得
  const {
    data: logsData,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["adminLogs", filters],
    queryFn: () =>
      adminAPI.getLogs({
        action: filters.action || undefined,
        limit: filters.limit,
        offset: filters.offset,
      }),
    enabled: isAuthenticated && user?.role === "admin",
    staleTime: 30 * 1000, // 30秒
  });

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value, offset: 0 }));
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case "role_change":
        return "権限変更";
      case "page_approve":
        return "記事承認";
      case "page_delete":
        return "記事削除";
      case "user_suspend":
        return "ユーザー停止";
      case "user_activate":
        return "ユーザー復活";
      case "comment_delete":
        return "コメント削除";
      case "settings_update":
        return "設定更新";
      case "system_maintenance":
        return "システムメンテナンス";
      default:
        return action;
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case "role_change":
        return Shield;
      case "page_approve":
      case "page_delete":
        return FileText;
      case "user_suspend":
      case "user_activate":
        return User;
      case "comment_delete":
        return Trash2;
      case "settings_update":
        return Activity;
      default:
        return Activity;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "role_change":
        return "bg-blue-100 text-blue-800";
      case "page_approve":
        return "bg-green-100 text-green-800";
      case "page_delete":
      case "comment_delete":
        return "bg-red-100 text-red-800";
      case "user_suspend":
        return "bg-orange-100 text-orange-800";
      case "user_activate":
        return "bg-green-100 text-green-800";
      case "settings_update":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes}分前`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}時間前`;
    } else {
      return date.toLocaleDateString("ja-JP", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const actionOptions = [
    { value: "", label: "全てのアクション" },
    { value: "role_change", label: "権限変更" },
    { value: "page_approve", label: "記事承認" },
    { value: "page_delete", label: "記事削除" },
    { value: "user_suspend", label: "ユーザー停止" },
    { value: "user_activate", label: "ユーザー復活" },
    { value: "comment_delete", label: "コメント削除" },
    { value: "settings_update", label: "設定更新" },
  ];

  const handleExport = () => {
    // ログのエクスポート機能（実装例）
    const csvContent = logsData?.logs
      ?.map((log: Log) => [
        log.createdAt,
        log.adminNickname,
        getActionLabel(log.action),
        log.targetType,
        log.targetId,
        log.oldValue || "",
        log.newValue || "",
      ])
      .map((row: string[]) => row.join(","))
      .join("\n");

    if (csvContent) {
      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `admin_logs_${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);

      addToast({
        type: "success",
        title: "ログをエクスポートしました",
      });
    }
  };

  if (!isAuthenticated || user?.role !== "admin") {
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
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='text-3xl font-bold text-foreground mb-2 flex items-center'>
                <BarChart3 className='w-8 h-8 mr-3 text-primary' />
                管理ログ
              </h1>
              <p className='text-muted-foreground'>
                管理者の操作履歴とシステムアクティビティ
              </p>
            </div>
            <div className='flex items-center space-x-3'>
              <button
                onClick={() => refetch()}
                disabled={isRefetching}
                className='btn-outline'
                title='更新'
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${
                    isRefetching ? "animate-spin" : ""
                  }`}
                />
                更新
              </button>
              <button onClick={handleExport} className='btn-outline'>
                <Download className='w-4 h-4 mr-2' />
                エクスポート
              </button>
            </div>
          </div>
        </motion.div>

        {/* フィルター・検索バー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className='card mb-6'
        >
          <div className='flex flex-col lg:flex-row lg:items-center gap-4'>
            {/* アクションフィルター */}
            <div className='flex items-center space-x-2'>
              <label className='text-sm font-medium text-foreground'>
                アクション:
              </label>
              <select
                title='アクション'
                value={filters.action}
                onChange={(e) => handleFilterChange("action", e.target.value)}
                className='input w-auto'
              >
                {actionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* 検索 */}
            <div className='flex-1'>
              <div className='relative'>
                <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5' />
                <input
                  type='text'
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder='管理者名・対象IDで検索...'
                  className='input pl-10 w-full'
                />
              </div>
            </div>

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
                <option value={25}>25件</option>
                <option value={50}>50件</option>
                <option value={100}>100件</option>
                <option value={200}>200件</option>
              </select>
            </div>
          </div>
        </motion.div>

        {/* ログ一覧 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {isLoading ? (
            <div className='space-y-4'>
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className='card animate-pulse'>
                  <div className='flex items-start space-x-4'>
                    <div className='w-10 h-10 bg-muted rounded-full'></div>
                    <div className='flex-1'>
                      <div className='h-4 bg-muted rounded mb-2 w-3/4'></div>
                      <div className='h-3 bg-muted rounded mb-2 w-1/2'></div>
                      <div className='h-3 bg-muted rounded w-1/3'></div>
                    </div>
                    <div className='h-3 bg-muted rounded w-20'></div>
                  </div>
                </div>
              ))}
            </div>
          ) : logsData?.logs && logsData.logs.length > 0 ? (
            <>
              {/* 結果数表示 */}
              <div className='mb-6'>
                <p className='text-sm text-muted-foreground'>
                  {logsData.logs.length}件のログエントリ
                </p>
              </div>

              {/* ログエントリ */}
              <div className='space-y-4'>
                {logsData.logs.map((log: Log) => {
                  const ActionIcon = getActionIcon(log.action);
                  return (
                    <div key={log.id} className='card'>
                      <div className='flex items-start space-x-4'>
                        {/* アクションアイコン */}
                        <div className='flex-shrink-0'>
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${getActionColor(
                              log.action
                            )}`}
                          >
                            <ActionIcon className='w-5 h-5' />
                          </div>
                        </div>

                        {/* ログ詳細 */}
                        <div className='flex-1 min-w-0'>
                          <div className='flex items-start justify-between mb-2'>
                            <div className='flex-1'>
                              <h3 className='text-sm font-medium text-foreground'>
                                {getActionLabel(log.action)}
                              </h3>
                              <p className='text-sm text-muted-foreground'>
                                管理者: {log.adminNickname}
                              </p>
                            </div>
                            <div className='text-sm text-muted-foreground'>
                              {formatTimestamp(log.createdAt)}
                            </div>
                          </div>

                          {/* 詳細情報 */}
                          <div className='space-y-2 text-sm'>
                            {log.targetType && log.targetId && (
                              <div className='flex items-center space-x-2 text-muted-foreground'>
                                <span className='font-medium'>対象:</span>
                                <span>
                                  {log.targetType} ({log.targetId})
                                </span>
                              </div>
                            )}

                            {(log.oldValue || log.newValue) && (
                              <div className='bg-muted/50 rounded-lg p-3'>
                                {log.oldValue && (
                                  <div className='mb-1'>
                                    <span className='text-red-600 font-medium'>
                                      変更前:
                                    </span>{" "}
                                    <span className='font-mono text-sm'>
                                      {log.oldValue}
                                    </span>
                                  </div>
                                )}
                                {log.newValue && (
                                  <div>
                                    <span className='text-green-600 font-medium'>
                                      変更後:
                                    </span>{" "}
                                    <span className='font-mono text-sm'>
                                      {log.newValue}
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ページネーション */}
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
            </>
          ) : (
            <div className='text-center py-12'>
              <BarChart3 className='w-16 h-16 text-muted-foreground mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-foreground mb-2'>
                ログエントリが見つかりませんでした
              </h3>
              <p className='text-muted-foreground mb-4'>
                指定した条件に一致するログがありません
              </p>
              <button
                onClick={() =>
                  setFilters({
                    action: "",
                    adminId: "",
                    search: "",
                    limit: 50,
                    offset: 0,
                  })
                }
                className='btn-outline'
              >
                フィルターをリセット
              </button>
            </div>
          )}
        </motion.div>

        {/* ログ統計 */}
        {logsData?.logs && logsData.logs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className='mt-8'
          >
            <div className='card'>
              <h3 className='text-lg font-semibold text-foreground mb-4'>
                直近のアクティビティ統計
              </h3>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-primary'>
                    {
                      logsData.logs.filter(
                        (log: Log) =>
                          new Date(log.createdAt) >
                          new Date(Date.now() - 24 * 60 * 60 * 1000)
                      ).length
                    }
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    24時間以内
                  </div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-primary'>
                    {
                      logsData.logs.filter(
                        (log: Log) =>
                          new Date(log.createdAt) >
                          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                      ).length
                    }
                  </div>
                  <div className='text-sm text-muted-foreground'>7日間</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-primary'>
                    {new Set(logsData.logs.map((log: Log) => log.adminId)).size}
                  </div>
                  <div className='text-sm text-muted-foreground'>
                    アクティブ管理者
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

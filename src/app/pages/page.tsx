"use client";

import React, { useState, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  BookOpen,
  TrendingUp,
  Clock,
  User,
  Tag,
  Search,
  Grid,
  List,
  ChevronDown,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { wikiAPI } from "../../lib/api";

function PagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [localFilters, setLocalFilters] = useState({
    search: searchParams.get("search") || "",
    tag: searchParams.get("tag") || "",
    sort: searchParams.get("sort") || "recent",
  });

  // ページ一覧を取得
  const { data: pagesData, isLoading } = useQuery({
    queryKey: ["pages", localFilters],
    queryFn: () =>
      wikiAPI.getPages({
        search: localFilters.search || undefined,
        tag: localFilters.tag || undefined,
        limit: 20,
        offset: 0,
      }),
    staleTime: 2 * 60 * 1000,
  });

  // 人気タグを取得
  // const { data: popularTags } = useQuery({
  //   queryKey: ["popularTags"],
  //   queryFn: () => searchAPI.getTags(20),
  //   staleTime: 15 * 60 * 1000,
  // });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);

    // URLパラメータを更新
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([k, v]) => {
      if (v) params.set(k, v);
    });

    const newUrl = `/pages${params.toString() ? `?${params.toString()}` : ""}`;
    router.push(newUrl);
  };

  // const clearFilters = () => {
  //   setLocalFilters({ search: "", tag: "", sort: "recent" });
  //   router.push("/pages");
  // };

  const sortOptions = [
    { value: "recent", label: "最新順", icon: Clock },
    { value: "popular", label: "人気順", icon: TrendingUp },
    { value: "title", label: "タイトル順", icon: BookOpen },
  ];

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
          <p className='text-koala-600'>鶴舞こあらに関する情報はこちら！</p>
        </motion.div>

        {/* フィルター・検索バー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className='mb-8'
        >
          {showFilterBar && (
            <div className='bg-white/50 backdrop-blur-sm border border-koala-100 rounded-2xl p-6 shadow-sm mb-6'>
              <div className='flex justify-between items-center mb-6'>
                <div className='flex items-center gap-2'>
                  <h2 className='text-md font-medium text-koala-700'>
                    ページを絞り込む
                  </h2>
                </div>
                <button
                  onClick={() => setShowFilterBar(false)}
                  className='text-koala-400 hover:text-koala-600 transition-colors'
                  title='フィルターを非表示'
                >
                  <ChevronDown className='w-5 h-5 rotate-180 transition-all duration-200' />
                </button>
              </div>

              <div className='flex flex-col lg:flex-row lg:items-center gap-6'>
                {/* 検索ボタン */}
                <div className='flex-1'>
                  <div className='relative'>
                    <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-koala-400 w-5 h-5' />
                    <input
                      type='text'
                      value={localFilters.search}
                      onChange={(e) =>
                        handleFilterChange("search", e.target.value)
                      }
                      placeholder='ページを検索...'
                      className='input pl-10 w-full text-left text-koala-500 hover:text-koala-700 bg-white/50 backdrop-blur-sm border-koala-100 rounded-xl transition-all duration-200 hover:border-koala-200'
                    />
                  </div>
                </div>

                {/* ソート */}
                <div className='flex items-center space-x-2'>
                  <label className='text-sm font-medium text-koala-500'>
                    並び順:
                  </label>
                  <select
                    title='並び順'
                    value={localFilters.sort}
                    onChange={(e) => handleFilterChange("sort", e.target.value)}
                    className='input w-auto bg-white/50 backdrop-blur-sm border-koala-100 rounded-xl text-koala-600 hover:border-koala-200 transition-all duration-200'
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 表示切替 */}
                <div className='flex items-center space-x-1 bg-white/50 backdrop-blur-sm border border-koala-100 rounded-xl p-1'>
                  <button
                    onClick={() => setViewMode("grid")}
                    aria-label='グリッド表示'
                    title='グリッド表示'
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === "grid"
                        ? "bg-primary-50 text-primary-600"
                        : "text-koala-400 hover:text-koala-600"
                    }`}
                  >
                    <Grid className='w-4 h-4' />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    aria-label='リスト表示'
                    title='リスト表示'
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      viewMode === "list"
                        ? "bg-primary-50 text-primary-600"
                        : "text-koala-400 hover:text-koala-600"
                    }`}
                  >
                    <List className='w-4 h-4' />
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        {/* ページ一覧 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {isLoading ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className='card animate-pulse'>
                  <div className='h-4 bg-koala-200 rounded mb-3'></div>
                  <div className='h-3 bg-koala-200 rounded mb-2'></div>
                  <div className='h-3 bg-koala-200 rounded w-2/3 mb-4'></div>
                  <div className='flex justify-between items-center'>
                    <div className='h-3 bg-koala-200 rounded w-1/3'></div>
                    <div className='h-3 bg-koala-200 rounded w-1/4'></div>
                  </div>
                </div>
              ))}
            </div>
          ) : pagesData?.pages && pagesData.pages.length > 0 ? (
            <>
              {/* 結果数表示 */}
              <div className='mb-6 flex justify-between items-center'>
                <p className='text-sm text-koala-600'>
                  {pagesData.total}件のページが見つかりました
                </p>
                {!showFilterBar && (
                  <button
                    onClick={() => setShowFilterBar(true)}
                    className='flex items-center gap-2 px-4 py-2 text-koala-400 hover:text-koala-600 transition-colors bg-white/50 backdrop-blur-sm border border-koala-100 rounded-xl'
                    title='フィルターを表示'
                  >
                    <span>絞り込み</span>
                    <ChevronDown className='w-5 h-5' />
                  </button>
                )}
              </div>

              {/* グリッド表示 */}
              {viewMode === "grid" && (
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                  {pagesData.pages.map((page, index) => (
                    <motion.div
                      key={page.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                    >
                      <Link href={`/wiki/${page.id}`} className='block'>
                        <div className='card hover:shadow-lg transition-all duration-300 h-full bg-white/50 backdrop-blur-sm border border-koala-100 rounded-2xl p-6 group'>
                          <h3 className='text-lg font-semibold text-koala-900 mb-4 line-clamp-2 group-hover:text-primary-600 transition-colors'>
                            {page.title}
                          </h3>

                          <div className='flex items-center justify-between mb-4'>
                            <div className='flex items-center space-x-2'>
                              {page.author.avatarUrl ? (
                                <img
                                  src={page.author.avatarUrl}
                                  alt={page.author.nickname}
                                  className='w-6 h-6 rounded-full object-cover ring-2 ring-white'
                                />
                              ) : (
                                <div className='w-6 h-6 rounded-full bg-primary-50 flex items-center justify-center ring-2 ring-white'>
                                  <User className='w-4 h-4 text-primary-500' />
                                </div>
                              )}
                              <span className='text-sm text-koala-600'>
                                {page.author.nickname}
                              </span>
                            </div>
                            <span className='text-sm text-koala-400 flex items-center gap-1'>
                              <TrendingUp className='w-4 h-4' />
                              {page.viewCount}
                            </span>
                          </div>

                          <div className='flex items-center justify-between mb-4'>
                            <span className='text-sm text-koala-400 flex items-center gap-1'>
                              <Clock className='w-4 h-4' />
                              {new Date(page.createdAt).toLocaleDateString(
                                "ja-JP"
                              )}
                            </span>
                          </div>

                          {page.tags.length > 0 && (
                            <div className='flex flex-wrap gap-2'>
                              {page.tags.slice(0, 3).map((tag) => (
                                <span
                                  key={tag}
                                  className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-600'
                                >
                                  <Tag className='w-3 h-3 mr-1' />
                                  {tag}
                                </span>
                              ))}
                              {page.tags.length > 3 && (
                                <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-koala-50 text-koala-600'>
                                  +{page.tags.length - 3}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* リスト表示 */}
              {viewMode === "list" && (
                <div className='space-y-4'>
                  {pagesData.pages.map((page, index) => (
                    <motion.div
                      key={page.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                    >
                      <Link href={`/wiki/${page.id}`} className='block'>
                        <div className='card hover:shadow-lg transition-all duration-300 bg-white/50 backdrop-blur-sm border border-koala-100 rounded-2xl p-6 group'>
                          <div className='flex items-start justify-between'>
                            <div className='flex-1 min-w-0'>
                              <h3 className='text-lg font-semibold text-koala-900 mb-4 group-hover:text-primary-600 transition-colors'>
                                {page.title}
                              </h3>

                              <div className='flex items-center space-x-4 mb-4'>
                                <div className='flex items-center space-x-2'>
                                  {page.author.avatarUrl ? (
                                    <img
                                      src={page.author.avatarUrl}
                                      alt={page.author.nickname}
                                      className='w-5 h-5 rounded-full object-cover ring-2 ring-white'
                                    />
                                  ) : (
                                    <div className='w-5 h-5 rounded-full bg-primary-50 flex items-center justify-center ring-2 ring-white'>
                                      <User className='w-3 h-3 text-primary-500' />
                                    </div>
                                  )}
                                  <span className='text-sm text-koala-600'>
                                    {page.author.nickname}
                                  </span>
                                </div>

                                <span className='text-sm text-koala-400 flex items-center gap-1'>
                                  <Clock className='w-4 h-4' />
                                  {new Date(page.createdAt).toLocaleDateString(
                                    "ja-JP"
                                  )}
                                </span>

                                <span className='text-sm text-koala-400 flex items-center gap-1'>
                                  <TrendingUp className='w-4 h-4' />
                                  {page.viewCount}
                                </span>
                              </div>

                              {page.tags.length > 0 && (
                                <div className='flex flex-wrap gap-2'>
                                  {page.tags.slice(0, 5).map((tag) => (
                                    <span
                                      key={tag}
                                      className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-50 text-primary-600'
                                    >
                                      <Tag className='w-3 h-3 mr-1' />
                                      {tag}
                                    </span>
                                  ))}
                                  {page.tags.length > 5 && (
                                    <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-koala-50 text-koala-600'>
                                      +{page.tags.length - 5}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* ページネーション（簡易版） */}
              {pagesData.hasMore && (
                <div className='text-center mt-8'>
                  <button className='btn-outline'>もっと読み込む</button>
                </div>
              )}
            </>
          ) : (
            <div className='text-center py-12'>
              <BookOpen className='w-16 h-16 text-koala-300 mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-koala-700 mb-2'>
                ページが見つかりませんでした
              </h3>
              <p className='text-koala-500 mb-4'>
                検索条件を変更するか、新しいページを作成してみてください
              </p>
              <Link href='/editor' className='btn-primary'>
                ページを作成
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default function PagesPage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <PagesContent />
    </Suspense>
  );
}

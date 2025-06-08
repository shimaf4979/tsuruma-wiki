"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion } from "framer-motion";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, FileText, User, Tag, ArrowLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { searchAPI } from "../../lib/api";
import { useSearchStore } from "../../store";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addRecentSearch } = useSearchStore();

  const query = searchParams.get("q") || "";
  const type = (searchParams.get("type") as "all" | "pages" | "users") || "all";

  const [searchType, setSearchType] = useState(type);

  // 検索クエリをrecent searchesに追加
  useEffect(() => {
    if (query) {
      addRecentSearch(query);
    }
  }, [query, addRecentSearch]);

  // 検索実行
  const {
    data: searchResults,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["search", query, searchType],
    queryFn: () => searchAPI.search(query, searchType),
    enabled: query.length > 0,
    staleTime: 2 * 60 * 1000,
  });

  const handleTypeChange = (newType: "all" | "pages" | "users") => {
    setSearchType(newType);
    const params = new URLSearchParams(searchParams.toString());
    params.set("type", newType);
    router.push(`/search?${params.toString()}`);
  };

  if (!query) {
    router.push("/");
    return null;
  }

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* ナビゲーション */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='mb-6'
        >
          <Link
            href='/'
            className='inline-flex items-center text-koala-600 hover:text-koala-900 transition-colors'
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            ホームに戻る
          </Link>
        </motion.div>

        {/* 検索ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className='mb-8'
        >
          <h1 className='text-3xl font-bold text-koala-900 mb-2'>検索結果</h1>
          <p className='text-koala-600'>
            「<span className='font-medium'>{query}</span>」の検索結果
          </p>
        </motion.div>

        {/* フィルター */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className='mb-6'
        >
          <div className='flex items-center space-x-1 bg-koala-100 rounded-lg p-1'>
            {[
              { value: "all", label: "全て", icon: Search },
              { value: "pages", label: "ページ", icon: FileText },
              { value: "users", label: "ユーザー", icon: User },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.value}
                  onClick={() =>
                    handleTypeChange(item.value as "all" | "pages" | "users")
                  }
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    searchType === item.value
                      ? "bg-white text-koala-900 shadow-sm"
                      : "text-koala-600 hover:text-koala-900"
                  }`}
                >
                  <Icon className='w-4 h-4' />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* 検索結果 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {isLoading ? (
            <div className='space-y-4'>
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className='card animate-pulse'>
                  <div className='flex items-start space-x-3'>
                    <div className='w-12 h-12 bg-koala-200 rounded-full'></div>
                    <div className='flex-1'>
                      <div className='h-4 bg-koala-200 rounded mb-2 w-3/4'></div>
                      <div className='h-3 bg-koala-200 rounded mb-1 w-1/2'></div>
                      <div className='h-3 bg-koala-200 rounded w-1/3'></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className='text-center py-12'>
              <Search className='w-16 h-16 text-koala-300 mx-auto mb-4' />
              <h3 className='text-lg font-medium text-koala-700 mb-2'>
                検索エラー
              </h3>
              <p className='text-koala-500'>
                検索中にエラーが発生しました。もう一度お試しください。
              </p>
            </div>
          ) : searchResults ? (
            <div className='space-y-6'>
              {/* ページ結果 */}
              {(searchType === "all" || searchType === "pages") &&
                searchResults.pages &&
                searchResults.pages.length > 0 && (
                  <div>
                    <h2 className='text-xl font-medium text-koala-900 mb-4 flex items-center'>
                      <FileText className='w-5 h-5 mr-2' />
                      ページ ({searchResults.pages.length}件)
                    </h2>
                    <div className='space-y-4'>
                      {searchResults.pages.map((page) => (
                        <Link
                          key={page.id}
                          href={`/wiki/${page.id}`}
                          className='block card hover:shadow-md transition-shadow'
                        >
                          <div className='flex items-start space-x-3'>
                            <div className='flex-shrink-0 w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center'>
                              <FileText className='w-5 h-5 text-primary-600' />
                            </div>
                            <div className='flex-1 min-w-0'>
                              <h3 className='text-lg font-medium text-koala-900 mb-1'>
                                {page.title}
                              </h3>
                              <div className='flex items-center space-x-4 text-sm text-koala-500 mb-2'>
                                <span>by {page.author.nickname}</span>
                                <span>{page.viewCount}回閲覧</span>
                                <span>
                                  {new Date(page.createdAt).toLocaleDateString(
                                    "ja-JP"
                                  )}
                                </span>
                              </div>
                              {page.tags.length > 0 && (
                                <div className='flex flex-wrap gap-1'>
                                  {page.tags.slice(0, 3).map((tag) => (
                                    <span
                                      key={tag}
                                      className='inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-koala-100 text-koala-700'
                                    >
                                      <Tag className='w-3 h-3 mr-1' />
                                      {tag}
                                    </span>
                                  ))}
                                  {page.tags.length > 3 && (
                                    <span className='text-xs text-koala-500'>
                                      +{page.tags.length - 3}個
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

              {/* ユーザー結果 */}
              {(searchType === "all" || searchType === "users") &&
                searchResults.users &&
                searchResults.users.length > 0 && (
                  <div>
                    <h2 className='text-xl font-medium text-koala-900 mb-4 flex items-center'>
                      <User className='w-5 h-5 mr-2' />
                      ユーザー ({searchResults.users.length}件)
                    </h2>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      {searchResults.users.map((user) => (
                        <Link
                          key={user.id}
                          href={`/users/${user.id}`}
                          className='block card hover:shadow-md transition-shadow'
                        >
                          <div className='flex items-center space-x-3'>
                            {user.avatarUrl ? (
                              <img
                                src={user.avatarUrl}
                                alt={user.nickname}
                                className='w-12 h-12 rounded-full object-cover'
                              />
                            ) : (
                              <div className='w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center'>
                                <User className='w-6 h-6 text-primary-600' />
                              </div>
                            )}
                            <div className='flex-1 min-w-0'>
                              <h3 className='font-medium text-koala-900'>
                                {user.nickname}
                              </h3>
                              <p className='text-sm text-koala-500'>
                                {user.role === "admin" && "管理者"}
                                {user.role === "moderator" && "モデレーター"}
                                {user.role === "editor" && "エディター"}
                                {user.role === "contributor" &&
                                  "コントリビューター"}
                              </p>
                              {user.bio && (
                                <p className='text-sm text-koala-600 mt-1 truncate'>
                                  {user.bio}
                                </p>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

              {/* 結果なし */}
              {(!searchResults.pages || searchResults.pages.length === 0) &&
                (!searchResults.users || searchResults.users.length === 0) && (
                  <div className='text-center py-12'>
                    <Search className='w-16 h-16 text-koala-300 mx-auto mb-4' />
                    <h3 className='text-lg font-medium text-koala-700 mb-2'>
                      検索結果が見つかりませんでした
                    </h3>
                    <p className='text-koala-500 mb-4'>
                      「{query}」に一致する結果がありません
                    </p>
                    <div className='text-sm text-koala-500'>
                      <p>検索のヒント:</p>
                      <ul className='mt-2 space-y-1'>
                        <li>• キーワードを変更してみてください</li>
                        <li>• より一般的な用語を使ってみてください</li>
                        <li>• スペルを確認してください</li>
                      </ul>
                    </div>
                  </div>
                )}
            </div>
          ) : null}
        </motion.div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>読み込み中...</div>}>
      <SearchContent />
    </Suspense>
  );
}

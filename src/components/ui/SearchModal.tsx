"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Search,
  Clock,
  TrendingUp,
  User,
  FileText,
  Tag,
  X,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { searchAPI } from "../../lib/api";
import { useSearchStore } from "../../store";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { recentSearches, addRecentSearch } = useSearchStore();

  // 検索候補を取得
  const { data: suggestions } = useQuery({
    queryKey: ["searchSuggestions", query],
    queryFn: () => searchAPI.getSuggestions(query),
    enabled: query.length > 0 && showSuggestions,
    staleTime: 5 * 60 * 1000,
  });

  // 検索結果を取得
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["searchResults", query],
    queryFn: () => searchAPI.search(query),
    enabled: query.length > 2,
    staleTime: 2 * 60 * 1000,
  });

  // モーダルが開いたときにフォーカス
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // ESCキーでモーダルを閉じる
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery.trim());
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      onClose();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className='fixed inset-0 z-50 flex items-start justify-center pt-16'
      >
        <div
          className='absolute inset-0 bg-black/20 backdrop-blur-sm'
          onClick={onClose}
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: -20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: -20 }}
          className='relative bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden'
        >
          {/* 検索フォーム */}
          <form
            onSubmit={handleSubmit}
            className='p-4 border-b border-koala-200'
          >
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-koala-400 w-5 h-5' />
              <input
                ref={inputRef}
                type='text'
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setShowSuggestions(true);
                }}
                placeholder='ページやユーザーを検索...'
                className='w-full pl-10 pr-10 py-3 border border-koala-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm'
              />
              <button
                title='閉じる'
                type='button'
                onClick={onClose}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-koala-400 hover:text-koala-600'
              >
                <X className='w-5 h-5' />
              </button>
            </div>
          </form>

          {/* 検索結果エリア */}
          <div className='max-h-96 overflow-y-auto custom-scrollbar'>
            {query.length === 0 && (
              <div className='p-4'>
                {/* 最近の検索 */}
                {recentSearches.length > 0 && (
                  <div className='mb-6'>
                    <h3 className='text-sm font-semibold text-koala-700 mb-3 flex items-center'>
                      <Clock className='w-4 h-4 mr-2' />
                      最近の検索
                    </h3>
                    <div className='space-y-2'>
                      {recentSearches.slice(0, 5).map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleSearch(search)}
                          className='flex items-center w-full px-3 py-2 text-left text-sm text-koala-700 hover:bg-koala-50 rounded-lg transition-colors'
                        >
                          <Search className='w-4 h-4 mr-3 text-koala-400' />
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 検索のヒント */}
                <div>
                  <h3 className='text-sm font-semibold text-koala-700 mb-3 flex items-center'>
                    <TrendingUp className='w-4 h-4 mr-2' />
                    検索のヒント
                  </h3>
                  <div className='space-y-2 text-sm text-koala-600'>
                    <p>• ページタイトルや内容で検索できます</p>
                    <p>• ユーザー名でも検索可能です</p>
                    <p>• タグで絞り込み検索もできます</p>
                  </div>
                </div>
              </div>
            )}

            {query.length > 0 && query.length <= 2 && (
              <div className='p-4 text-center text-sm text-koala-500'>
                3文字以上入力してください
              </div>
            )}

            {/* 検索候補 */}
            {showSuggestions &&
              suggestions &&
              suggestions.length > 0 &&
              query.length > 0 && (
                <div className='p-4 border-b border-koala-200'>
                  <h3 className='text-sm font-semibold text-koala-700 mb-3'>
                    検索候補
                  </h3>
                  <div className='space-y-1'>
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => handleSearch(suggestion)}
                        className='flex items-center w-full px-3 py-2 text-left text-sm text-koala-700 hover:bg-koala-50 rounded-lg transition-colors'
                      >
                        <Search className='w-4 h-4 mr-3 text-koala-400' />
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            {/* 検索結果 */}
            {query.length > 2 && (
              <div className='p-4'>
                {isLoading ? (
                  <div className='text-center py-8'>
                    <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto'></div>
                    <p className='text-sm text-koala-500 mt-2'>検索中...</p>
                  </div>
                ) : searchResults ? (
                  <div className='space-y-4'>
                    {/* ページ結果 */}
                    {searchResults.pages && searchResults.pages.length > 0 && (
                      <div>
                        <h3 className='text-sm font-semibold text-koala-700 mb-3 flex items-center'>
                          <FileText className='w-4 h-4 mr-2' />
                          ページ ({searchResults.pages.length}件)
                        </h3>
                        <div className='space-y-2'>
                          {searchResults.pages.slice(0, 5).map((page) => (
                            <button
                              key={page.id}
                              onClick={() => {
                                router.push(`/wiki/${page.id}`);
                                onClose();
                              }}
                              className='block w-full text-left p-3 hover:bg-koala-50 rounded-lg transition-colors'
                            >
                              <div className='flex items-start space-x-3'>
                                <FileText className='w-4 h-4 mt-1 text-koala-400 flex-shrink-0' />
                                <div className='min-w-0 flex-1'>
                                  <p className='text-sm font-medium text-koala-900 truncate'>
                                    {page.title}
                                  </p>
                                  <div className='flex items-center space-x-2 mt-1'>
                                    <span className='text-xs text-koala-500'>
                                      {page.author.nickname}
                                    </span>
                                    <span className='text-xs text-koala-400'>
                                      {page.viewCount}回閲覧
                                    </span>
                                  </div>
                                  {page.tags.length > 0 && (
                                    <div className='flex flex-wrap gap-1 mt-2'>
                                      {page.tags.slice(0, 3).map((tag) => (
                                        <span
                                          key={tag}
                                          className='inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-koala-100 text-koala-700'
                                        >
                                          <Tag className='w-3 h-3 mr-1' />
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ユーザー結果 */}
                    {searchResults.users && searchResults.users.length > 0 && (
                      <div>
                        <h3 className='text-sm font-semibold text-koala-700 mb-3 flex items-center'>
                          <User className='w-4 h-4 mr-2' />
                          ユーザー ({searchResults.users.length}件)
                        </h3>
                        <div className='space-y-2'>
                          {searchResults.users.slice(0, 3).map((user) => (
                            <button
                              key={user.id}
                              onClick={() => {
                                router.push(`/users/${user.id}`);
                                onClose();
                              }}
                              className='block w-full text-left p-3 hover:bg-koala-50 rounded-lg transition-colors'
                            >
                              <div className='flex items-center space-x-3'>
                                {user.avatarUrl ? (
                                  <img
                                    src={user.avatarUrl}
                                    alt={user.nickname}
                                    className='w-8 h-8 rounded-full object-cover'
                                  />
                                ) : (
                                  <div className='w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center'>
                                    <User className='w-4 h-4 text-primary-600' />
                                  </div>
                                )}
                                <div>
                                  <p className='text-sm font-medium text-koala-900'>
                                    {user.nickname}
                                  </p>
                                  <p className='text-xs text-koala-500'>
                                    {user.role === "admin" && "管理者"}
                                    {user.role === "moderator" &&
                                      "モデレーター"}
                                    {user.role === "editor" && "エディター"}
                                    {user.role === "contributor" &&
                                      "コントリビューター"}
                                  </p>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 結果なし */}
                    {(!searchResults.pages ||
                      searchResults.pages.length === 0) &&
                      (!searchResults.users ||
                        searchResults.users.length === 0) && (
                        <div className='text-center py-8'>
                          <Search className='w-12 h-12 text-koala-300 mx-auto mb-4' />
                          <p className='text-sm text-koala-500'>
                            検索結果が見つかりませんでした
                          </p>
                          <p className='text-xs text-koala-400 mt-1'>
                            別のキーワードで試してみてください
                          </p>
                        </div>
                      )}
                  </div>
                ) : null}
              </div>
            )}
          </div>

          {/* フッター */}
          <div className='p-3 border-t border-koala-200 bg-koala-50'>
            <div className='flex items-center justify-between text-xs text-koala-500'>
              <span>Enter で検索</span>
              <span>ESC で閉じる</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

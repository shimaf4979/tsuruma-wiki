"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  Clock,
  User,
  Tag,
  Edit,
  Trash2,
  Share2,
  Flag,
  ArrowLeft,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { wikiAPI } from "../../../lib/api";
import { useAuthStore, useUIStore } from "../../../store";
import { CommentSection } from "../../../components/wiki/CommentSection";

export default function WikiPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { addToast, openModal } = useUIStore();
  const [showShareMenu, setShowShareMenu] = useState(false);

  const pageId = params.id as string;

  // 記事詳細を取得
  const {
    data: page,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["page", pageId],
    queryFn: () => wikiAPI.getPage(pageId),
    retry: 1,
  });

  // 記事削除
  const deletePageMutation = useMutation({
    mutationFn: () => wikiAPI.deletePage(pageId),
    onSuccess: () => {
      addToast({
        type: "success",
        title: "記事を削除しました",
      });
      router.push("/pages");
    },
    onError: (error: { response?: { data?: { error?: string } } }) => {
      addToast({
        type: "error",
        title: "記事の削除に失敗しました",
        description: error.response?.data?.error || "エラーが発生しました",
      });
    },
  });

  const handleDelete = () => {
    openModal({
      type: "confirm",
      title: "記事を削除しますか？",
      content: (
        <p className='text-koala-600'>
          この操作は取り消すことができません。本当に削除しますか？
        </p>
      ),
      onConfirm: () => deletePageMutation.mutate(),
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: page?.title,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      addToast({
        type: "success",
        title: "URLをコピーしました",
      });
    }
    setShowShareMenu(false);
  };

  const canEdit =
    isAuthenticated &&
    (user?.id === page?.authorId ||
      user?.role === "admin" ||
      user?.role === "moderator" ||
      user?.role === "editor");

  const canDelete =
    isAuthenticated &&
    (user?.id === page?.authorId ||
      user?.role === "admin" ||
      user?.role === "moderator");

  if (isLoading) {
    return (
      <div className='min-h-screen bg-white'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='animate-pulse'>
            <div className='h-8 bg-koala-200 rounded mb-4'></div>
            <div className='h-4 bg-koala-200 rounded mb-2'></div>
            <div className='h-4 bg-koala-200 rounded w-3/4 mb-8'></div>
            <div className='space-y-4'>
              <div className='h-4 bg-koala-200 rounded'></div>
              <div className='h-4 bg-koala-200 rounded'></div>
              <div className='h-4 bg-koala-200 rounded w-5/6'></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !page) {
    return (
      <div className='min-h-screen bg-white flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-koala-900 mb-4'>
            ページが見つかりません
          </h1>
          <p className='text-koala-600 mb-8'>
            お探しのページは存在しないか、削除された可能性があります。
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

        {/* 記事ヘッダー */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className='mb-8'
        >
          <div className='flex items-start justify-between mb-6'>
            <div className='flex-1 min-w-0'>
              <h1 className='text-3xl md:text-4xl font-bold text-koala-900 mb-4'>
                {page.title}
              </h1>

              <div className='flex flex-wrap items-center gap-4 text-sm text-koala-600'>
                <div className='flex items-center space-x-2'>
                  {page.author.avatarUrl ? (
                    <img
                      src={page.author.avatarUrl}
                      alt={page.author.nickname}
                      className='w-6 h-6 rounded-full object-cover'
                    />
                  ) : (
                    <div className='w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center'>
                      <User className='w-4 h-4 text-primary-600' />
                    </div>
                  )}
                  <Link
                    href={`/users/${page.author.id}`}
                    className='font-medium hover:text-primary-600 transition-colors'
                  >
                    {page.author.nickname}
                  </Link>
                </div>

                <div className='flex items-center space-x-1'>
                  <Clock className='w-4 h-4' />
                  <span>
                    {new Date(page.createdAt).toLocaleDateString("ja-JP")}
                  </span>
                </div>

                <div className='flex items-center space-x-1'>
                  <Eye className='w-4 h-4' />
                  <span>{page.viewCount}回閲覧</span>
                </div>
              </div>
            </div>

            {/* アクションボタン */}
            <div className='flex items-center space-x-2 ml-4'>
              {/* 共有 */}
              <div className='relative'>
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className='p-2 rounded-lg text-koala-600 hover:bg-koala-100 transition-colors'
                  title='共有'
                >
                  <Share2 className='w-5 h-5' />
                </button>

                {showShareMenu && (
                  <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-koala-200 py-1 z-10'>
                    <button
                      onClick={handleShare}
                      className='w-full px-4 py-2 text-left text-sm text-koala-700 hover:bg-koala-50'
                    >
                      URLをコピー
                    </button>
                  </div>
                )}
              </div>

              {/* 編集 */}
              {canEdit && (
                <Link
                  href={`/editor/${pageId}`}
                  className='p-2 rounded-lg text-koala-600 hover:bg-koala-100 transition-colors'
                  title='編集'
                >
                  <Edit className='w-5 h-5' />
                </Link>
              )}

              {/* 削除 */}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  className='p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors'
                  title='削除'
                >
                  <Trash2 className='w-5 h-5' />
                </button>
              )}
            </div>
          </div>

          {/* タグ */}
          {page.tags.length > 0 && (
            <div className='flex flex-wrap gap-2'>
              {page.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/pages?tag=${encodeURIComponent(tag)}`}
                  className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 hover:bg-primary-200 transition-colors'
                >
                  <Tag className='w-3 h-3 mr-1' />
                  {tag}
                </Link>
              ))}
            </div>
          )}
        </motion.header>

        {/* 記事本文 */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className='prose prose-lg max-w-none mb-12'
        >
          <div
            dangerouslySetInnerHTML={{ __html: page.content }}
            className='text-koala-800 leading-relaxed'
          />
        </motion.article>

        {/* 記事フッター */}
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className='border-t border-koala-200 pt-8 mb-12'
        >
          <div className='flex items-center justify-between'>
            <div className='text-sm text-koala-500'>
              最終更新: {new Date(page.updatedAt).toLocaleDateString("ja-JP")}
            </div>

            <div className='flex items-center space-x-4'>
              {isAuthenticated && (
                <button className='btn-ghost text-sm'>
                  <Flag className='w-4 h-4 mr-1' />
                  報告
                </button>
              )}
            </div>
          </div>
        </motion.footer>

        {/* コメントセクション */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <CommentSection pageId={pageId} />
        </motion.div>
      </div>

      {/* 共有メニューの背景クリック */}
      {showShareMenu && (
        <div
          className='fixed inset-0 z-5'
          onClick={() => setShowShareMenu(false)}
        />
      )}
    </div>
  );
}

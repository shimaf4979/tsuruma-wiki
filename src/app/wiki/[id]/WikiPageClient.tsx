"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  Clock,
  User,
  Tag,
  Edit,
  Trash2,
  Share2,
  ArrowLeft,
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { wikiAPI } from "../../../lib/api";
import { useAuthStore, useUIStore } from "../../../store";
import { CommentSection } from "../../../components/wiki/CommentSection";

interface WikiPageClientProps {
  pageId: string;
}

export function WikiPageClient({ pageId }: WikiPageClientProps) {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const { addToast, openModal } = useUIStore();
  const [showShareMenu, setShowShareMenu] = useState(false);

  // ページ詳細を取得
  const {
    data: page,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["page", pageId],
    queryFn: () => wikiAPI.getPage(pageId),
    retry: 1,
  });

  // ページ削除
  const deletePageMutation = useMutation({
    mutationFn: () => wikiAPI.deletePage(pageId),
    onSuccess: () => {
      addToast({
        type: "success",
        title: "ページを削除しました",
      });
      router.push("/pages");
    },
    onError: (error: { response?: { data?: { error?: string } } }) => {
      addToast({
        type: "error",
        title: "ページの削除に失敗しました",
        description: error.response?.data?.error || "エラーが発生しました",
      });
    },
  });

  const handleDelete = () => {
    openModal({
      type: "confirm",
      title: "ページを削除しますか？",
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
            ページ一覧に戻る
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
          transition={{ duration: 0.1 }}
          className='mb-8'
        >
          <Link
            href='/pages'
            className='inline-flex items-center text-koala-600 hover:text-koala-900 transition-colors'
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            ページ一覧に戻る
          </Link>
        </motion.div>

        {/* ページヘッダー */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.1, delay: 0.01 }}
          className='mb-8'
        >
          <div className='flex items-start justify-between mb-6'>
            <div className='flex-1 min-w-0'>
              <h1 className='text-2xl md:text-3xl  font-bold text-koala-900 mb-4'>
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

        {/* ページ本文 */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.1, delay: 0.02 }}
          className='prose prose-sm sm:prose-base md:prose-lg max-w-none mb-12 
          [&_h1]:text-2xl sm:[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-8 sm:[&_h1]:mt-12 [&_h1]:mb-6 sm:[&_h1]:mb-8 [&_h1]:bg-gradient-to-r [&_h1]:from-primary-50 [&_h1]:to-transparent [&_h1]:text-primary-900 [&_h1]:px-4 sm:[&_h1]:px-6 [&_h1]:py-3 sm:[&_h1]:py-4 [&_h1]:rounded-r-lg [&_h1]:border-l-6 sm:[&_h1]:border-l-8 [&_h1]:border-primary-500 [&_h1]:w-full [&_h1]:shadow-sm
          [&_h2]:text-xl sm:[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-8 sm:[&_h2]:mt-10 [&_h2]:mb-4 sm:[&_h2]:mb-6 [&_h2]:bg-gradient-to-r [&_h2]:from-koala-50 [&_h2]:to-transparent [&_h2]:text-koala-900 [&_h2]:px-3 sm:[&_h2]:px-5 [&_h2]:py-2 sm:[&_h2]:py-3 [&_h2]:rounded-r-md [&_h2]:border-l-4 sm:[&_h2]:border-l-6 [&_h2]:border-koala-400 [&_h2]:w-full [&_h2]:shadow-sm
          [&_h3]:text-lg sm:[&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-6 sm:[&_h3]:mt-8 [&_h3]:mb-3 sm:[&_h3]:mb-4 [&_h3]:text-koala-800 [&_h3]:border-b-2 [&_h3]:border-koala-200 [&_h3]:pb-2 [&_h3]:w-full [&_h3]:bg-gradient-to-r [&_h3]:from-koala-50/30 [&_h3]:to-transparent
          [&_p]:mb-3 sm:[&_p]:mb-4 [&_p]:leading-6 sm:[&_p]:leading-7
          [&_ul]:list-disc [&_ul]:pl-4 sm:[&_ul]:pl-6 [&_ul]:mb-3 sm:[&_ul]:mb-4 [&_ul>li]:mb-1 sm:[&_ul>li]:mb-2
          [&_ol]:list-decimal [&_ol]:pl-4 sm:[&_ol]:pl-6 [&_ol]:mb-3 sm:[&_ol]:mb-4 [&_ol>li]:mb-1 sm:[&_ol>li]:mb-2
          [&_blockquote]:border-l-3 sm:[&_blockquote]:border-l-4 [&_blockquote]:pl-3 sm:[&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-koala-600 [&_blockquote]:my-3 sm:[&_blockquote]:my-4 [&_blockquote]:bg-primary-50/50 [&_blockquote]:rounded-r-lg [&_blockquote]:py-1 sm:[&_blockquote]:py-2
          [&_pre]:bg-koala-900 [&_pre]:text-white [&_pre]:p-3 sm:[&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:my-2 sm:[&_pre]:my-3 [&_pre]:overflow-x-auto
          [&_code]:bg-koala-100 [&_code]:px-1 sm:[&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs sm:[&_code]:text-sm [&_code]:font-mono [&_code]:text-koala-900
          [&_a]:text-primary-600 [&_a]:hover:text-primary-700 [&_a]:underline [&_a]:decoration-primary-300 [&_a]:hover:decoration-primary-500 [&_a]:transition-colors [&_a]:duration-200
          [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-3 sm:[&_img]:my-4 [&_img]:shadow-md [&_img]:hover:shadow-lg [&_img]:transition-shadow [&_img]:duration-200
          [&_hr]:my-6 sm:[&_hr]:my-8 [&_hr]:border-koala-200
          [&_table]:w-full [&_table]:border-collapse [&_table]:my-3 sm:[&_table]:my-4 [&_table]:rounded-lg [&_table]:overflow-hidden [&_table]:shadow-sm
          [&_thead]:bg-primary-50
          [&_th]:border [&_th]:border-koala-300 [&_th]:px-2 sm:[&_th]:px-4 [&_th]:py-1 sm:[&_th]:py-2 [&_th]:text-left [&_th]:bg-primary-50/50 [&_th]:text-primary-900 [&_th]:font-medium [&_th]:text-sm sm:[&_th]:text-base
          [&_td]:border [&_td]:border-koala-300 [&_td]:px-2 sm:[&_td]:px-4 [&_td]:py-1 sm:[&_td]:py-2 [&_td]:text-sm sm:[&_td]:text-base
          [&_div]:mb-3 sm:[&_div]:mb-4
          [&_ul>li::marker]:text-primary-500
          [&_ol>li::marker]:text-primary-500 [&_ol>li::marker]:font-medium
          [&_pre_code]:bg-transparent [&_pre_code]:text-white [&_pre_code]:p-0
          [&_tbody_tr:hover]:bg-koala-50/50'
        >
          <div dangerouslySetInnerHTML={{ __html: page.content }} />
        </motion.article>

        {/* ページフッター */}
        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.1, delay: 0.03 }}
          className='border-t border-koala-200 pt-8 mb-12'
        >
          <div className='flex items-center justify-between'>
            <div className='text-sm text-koala-500'>
              最終更新: {new Date(page.updatedAt).toLocaleDateString("ja-JP")}
            </div>
            {/* 
            <div className='flex items-center space-x-4'>
              {isAuthenticated && (
                <button className='btn-ghost text-sm'>
                  <Flag className='w-4 h-4 mr-1' />
                  報告
                </button>
              )}
            </div> */}
          </div>
        </motion.footer>

        {/* コメントセクション */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.1, delay: 0.04 }}
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

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, Send, Edit, Trash2, User } from "lucide-react";
import { commentAPI } from "../../lib/api";
import { useAuthStore, useUIStore } from "../../store";
import { Comment } from "../../types";
import Link from "next/link";

interface CommentSectionProps {
  pageId: string;
}

export function CommentSection({ pageId }: CommentSectionProps) {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const { addToast } = useUIStore();
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  console.log("CommentSection rendered with pageId:", pageId); // デバッグログ

  // コメント取得
  const {
    data: comments = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["comments", pageId],
    queryFn: () => commentAPI.getPageComments(pageId),
    enabled: !!pageId,
  });

  console.log("Comments loaded:", comments.length, "comments"); // デバッグログ

  // コメント投稿
  const createCommentMutation = useMutation({
    mutationFn: (content: string) => {
      console.log("Creating comment with data:", { pageId, content }); // デバッグログ

      // バリデーション確認
      if (!pageId || !content.trim()) {
        throw new Error("Invalid comment data");
      }

      return commentAPI.createComment({
        pageId: pageId.toString(), // 文字列として明示的に変換
        content: content.trim(),
      });
    },
    onSuccess: () => {
      console.log("Comment created successfully"); // デバッグログ
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["comments", pageId] });
      addToast({
        type: "success",
        title: "コメントを投稿しました",
      });
    },
    onError: (error: { response?: { data?: { error?: string } } }) => {
      console.error("Comment creation failed:", error); // デバッグログ
      console.error("Error response:", error.response?.data); // APIエラーの詳細

      const errorMessage =
        error.response?.data?.error || "コメントの投稿に失敗しました";
      const errorDetails = error.response?.data?.error;

      addToast({
        type: "error",
        title: "コメントの投稿に失敗しました",
        description: errorDetails
          ? `${errorMessage}: ${JSON.stringify(errorDetails)}`
          : errorMessage,
      });
    },
  });

  // コメント更新
  const updateCommentMutation = useMutation({
    mutationFn: ({
      commentId,
      content,
    }: {
      commentId: string;
      content: string;
    }) => commentAPI.updateComment(commentId, content),
    onSuccess: () => {
      setEditingId(null);
      setEditContent("");
      queryClient.invalidateQueries({ queryKey: ["comments", pageId] });
      addToast({
        type: "success",
        title: "コメントを更新しました",
      });
    },
    onError: (error: { response?: { data?: { error?: string } } }) => {
      addToast({
        type: "error",
        title: "コメントの更新に失敗しました",
        description: error.response?.data?.error || "エラーが発生しました",
      });
    },
  });

  // コメント削除
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => commentAPI.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", pageId] });
      addToast({
        type: "success",
        title: "コメントを削除しました",
      });
    },
    onError: (error: { response?: { data?: { error?: string } } }) => {
      addToast({
        type: "error",
        title: "コメントの削除に失敗しました",
        description: error.response?.data?.error || "エラーが発生しました",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Comment submit triggered:", { pageId, newComment }); // デバッグログ

    if (!newComment.trim()) {
      addToast({
        type: "error",
        title: "コメントを入力してください",
      });
      return;
    }

    if (newComment.length > 1000) {
      addToast({
        type: "error",
        title: "コメントは1000文字以内で入力してください",
      });
      return;
    }

    createCommentMutation.mutate(newComment);
  };

  const handleEdit = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  const handleUpdate = (commentId: string) => {
    if (!editContent.trim()) {
      addToast({
        type: "error",
        title: "コメントを入力してください",
      });
      return;
    }

    updateCommentMutation.mutate({ commentId, content: editContent });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditContent("");
  };

  const canEditComment = (comment: Comment) => {
    return (
      user?.id === comment.authorId ||
      user?.role === "admin" ||
      user?.role === "moderator"
    );
  };

  if (error) {
    console.error("Error loading comments:", error); // デバッグログ
    return (
      <div className='mt-12 p-4 bg-red-50 border border-red-200 rounded-lg'>
        <p className='text-red-600'>コメントの読み込みに失敗しました。</p>
      </div>
    );
  }

  return (
    <section className='mt-12'>
      <div className='flex items-center space-x-2 mb-4 sm:mb-8'>
        <MessageCircle className='w-5 h-5 sm:w-6 sm:h-6 text-koala-600' />
        <h2 className='text-xl sm:text-2xl font-bold text-koala-900'>
          コメント ({comments.length})
        </h2>
      </div>

      {/* コメント投稿フォーム */}
      {isAuthenticated ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-6 sm:mb-8 p-4 sm:p-6 bg-koala-50 border border-koala-200 rounded-lg'
        >
          <form onSubmit={handleSubmit} className='space-y-3 sm:space-y-4'>
            <div>
              <label className='block text-sm font-medium text-koala-700 mb-2'>
                コメントを投稿
              </label>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder='コメントを入力してください...'
                className='w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-koala-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none'
                rows={3}
                maxLength={1000}
                disabled={createCommentMutation.isPending}
              />
              <div className='text-right text-xs text-koala-500 mt-1'>
                {newComment.length}/1000
                <button
                  type='submit'
                  disabled={
                    createCommentMutation.isPending || !newComment.trim()
                  }
                  className='btn-primary text-sm sm:text-base px-3 sm:px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  {createCommentMutation.isPending ? (
                    <div className='flex items-center space-x-2'>
                      <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                      <span>投稿中...</span>
                    </div>
                  ) : (
                    <div className='flex items-center space-x-2'>
                      <Send className='w-4 h-4' />
                      <span>投稿</span>
                    </div>
                  )}
                </button>
              </div>
            </div>
            <div className='flex justify-end'></div>
          </form>
        </motion.div>
      ) : (
        <div className='mb-6 sm:mb-8 p-4 sm:p-6 bg-gray-50 border border-gray-200 rounded-lg text-center'>
          <p className='text-sm sm:text-base text-gray-600'>
            コメントを投稿するには
            <a
              href='/login'
              className='text-primary-600 hover:text-primary-700 ml-1'
            >
              ログイン
            </a>
            してください
          </p>
        </div>
      )}

      {/* コメント一覧 */}
      <div className='space-y-6'>
        {isLoading ? (
          <div className='space-y-3 sm:space-y-4'>
            {[...Array(3)].map((_, i) => (
              <div key={i} className='animate-pulse'>
                <div className='flex space-x-3 sm:space-x-4'>
                  <div className='w-8 h-8 sm:w-10 sm:h-10 bg-koala-200 rounded-full' />
                  <div className='flex-1 space-y-2'>
                    <div className='h-3 sm:h-4 bg-koala-200 rounded w-1/4' />
                    <div className='h-12 sm:h-16 bg-koala-200 rounded' />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence>
            {comments.map((comment) => (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className='p-4 sm:p-6 bg-white border border-koala-200 rounded-lg'
              >
                <div className='flex items-start justify-between flex-col sm:flex-row'>
                  <div className='flex space-x-3 sm:space-x-4 flex-1 w-full'>
                    {/* ユーザーアバター */}
                    <div className='flex-shrink-0'>
                      <Link
                        href={`/users/${comment.author.id}`}
                        className='block'
                      >
                        {comment.author.avatarUrl ? (
                          <img
                            src={comment.author.avatarUrl}
                            alt={comment.author.nickname}
                            className='w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover hover:opacity-80 transition-opacity'
                          />
                        ) : (
                          <div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary-100 flex items-center justify-center hover:bg-primary-200 transition-colors'>
                            <User className='w-5 h-5 sm:w-6 sm:h-6 text-primary-600' />
                          </div>
                        )}
                      </Link>
                    </div>

                    {/* コメント内容 */}
                    <div className='flex-1 min-w-0'>
                      <div className='flex flex-wrap items-center gap-2 mb-2'>
                        <Link
                          href={`/users/${comment.author.id}`}
                          className='font-medium text-koala-900 text-sm sm:text-base hover:text-primary-600 transition-colors'
                        >
                          {comment.author.nickname}
                        </Link>
                        <span className='px-2 py-0.5 text-xs font-medium bg-koala-100 text-koala-700 rounded-full'>
                          {comment.author.role}
                        </span>
                        <span className='text-xs sm:text-sm text-koala-500'>
                          {new Date(comment.createdAt).toLocaleDateString(
                            "ja-JP",
                            {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </span>
                        {comment.updatedAt && (
                          <span className='text-xs text-koala-400'>
                            (編集済み)
                          </span>
                        )}
                      </div>

                      {editingId === comment.id ? (
                        <div className='space-y-3'>
                          <textarea
                            title='コメントを編集'
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className='w-full px-3 py-2 text-sm sm:text-base border border-koala-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none'
                            rows={3}
                            maxLength={1000}
                          />
                          <div className='flex space-x-2'>
                            <button
                              onClick={() => handleUpdate(comment.id)}
                              disabled={updateCommentMutation.isPending}
                              className='px-3 py-1 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50'
                            >
                              更新
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className='px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400'
                            >
                              キャンセル
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className='text-sm sm:text-base text-koala-700 whitespace-pre-wrap'>
                          {comment.content}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* アクションボタン */}
                  {canEditComment(comment) && editingId !== comment.id && (
                    <div className='flex space-x-2 mt-3 sm:mt-0 sm:ml-4'>
                      <button
                        onClick={() => handleEdit(comment)}
                        className='p-1.5 sm:p-2 text-koala-600 hover:bg-koala-100 rounded'
                        title='編集'
                      >
                        <Edit className='w-4 h-4' />
                      </button>
                      <button
                        onClick={() => deleteCommentMutation.mutate(comment.id)}
                        disabled={deleteCommentMutation.isPending}
                        className='p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded disabled:opacity-50'
                        title='削除'
                      >
                        <Trash2 className='w-4 h-4' />
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        {comments.length === 0 && !isLoading && (
          <div className='text-center py-8 sm:py-12'>
            <MessageCircle className='w-12 h-12 sm:w-16 sm:h-16 text-koala-300 mx-auto mb-3 sm:mb-4' />
            <p className='text-base sm:text-lg text-koala-500'>
              まだコメントがありません
            </p>
            <p className='text-xs sm:text-sm text-koala-400 mt-1 sm:mt-2'>
              最初のコメントを投稿してみませんか？
            </p>
          </div>
        )}
      </div>

      {/* デバッグ情報（開発環境のみ） */}
      {/* {process.env.NODE_ENV === "development" && (
        <div className='mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg'>
          <h3 className='font-medium text-yellow-800 mb-2'>Debug Info:</h3>
          <pre className='text-xs text-yellow-700 whitespace-pre-wrap'>
            {JSON.stringify(
              {
                pageId,
                commentsCount: comments.length,
                isAuthenticated,
                userId: user?.id,
                userRole: user?.role,
              },
              null,
              2
            )}
          </pre>
        </div>
      )} */}
    </section>
  );
}

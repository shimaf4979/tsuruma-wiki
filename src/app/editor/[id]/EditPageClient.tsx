"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Save, Eye, Tag, X, ArrowLeft } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TiptapEditor } from "../../../components/editor/TiptapEditor";
import { wikiAPI } from "../../../lib/api";
import { useAuthStore, useUIStore, useEditorStore } from "../../../store";

interface EditPageClientProps {
  pageId: string;
}

export function EditPageClient({ pageId }: EditPageClientProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  const { addToast } = useUIStore();
  const { currentDraft, saveDraft, clearCurrentDraft } = useEditorStore();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // 編集対象のページを取得
  const { data: page, isLoading } = useQuery({
    queryKey: ["page", pageId],
    queryFn: () => wikiAPI.getPage(pageId),
    enabled: !!pageId,
  });

  // 認証・権限チェック
  useEffect(() => {
    // 初期化が完了していない場合は待機
    if (!isInitialized) {
      return;
    }

    // 初期化完了後、認証されていない場合はログイン画面へ
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (page && user) {
      const canEdit =
        user.id === page.authorId ||
        user.role === "admin" ||
        user.role === "moderator" ||
        user.role === "editor";

      if (!canEdit) {
        addToast({
          type: "error",
          title: "編集権限がありません",
          description: "このページを編集する権限がありません",
        });
        router.push(`/wiki/${pageId}`);
        return;
      }

      // 初期値設定
      setTitle(page.title);
      setContent(page.content);
      setTags(page.tags);
    }
  }, [isAuthenticated, isInitialized, page, user, router, pageId, addToast]);

  // 下書きの読み込み
  useEffect(() => {
    if (currentDraft && currentDraft.title && pageId === currentDraft.title) {
      setTitle(currentDraft.title);
      setContent(currentDraft.content);
      setTags(currentDraft.tags);
    }
  }, [currentDraft, pageId]);

  // 変更検知
  useEffect(() => {
    if (page) {
      const hasContentChanges =
        title !== page.title ||
        content !== page.content ||
        JSON.stringify(tags) !== JSON.stringify(page.tags);
      setHasChanges(hasContentChanges);
    }
  }, [title, content, tags, page]);

  // 自動保存（5秒ごと）
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasChanges && (title.trim() || content.trim())) {
        saveDraft("auto", title, content, tags);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [title, content, tags, hasChanges, saveDraft]);

  // ページ更新
  const updatePageMutation = useMutation({
    mutationFn: (data: { title: string; content: string; tags: string[] }) =>
      wikiAPI.updatePage(pageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page", pageId] });
      addToast({
        type: "success",
        title: "ページを更新しました",
      });
      clearCurrentDraft();
      router.push(`/wiki/${pageId}`);
    },
    onError: (error: { response?: { data?: { error?: string } } }) => {
      addToast({
        type: "error",
        title: "ページの更新に失敗しました",
        description: error.response?.data?.error || "エラーが発生しました",
      });
    },
  });

  const handleSubmit = () => {
    if (!title.trim()) {
      addToast({
        type: "error",
        title: "タイトルを入力してください",
      });
      return;
    }

    if (!content.trim()) {
      addToast({
        type: "error",
        title: "本文を入力してください",
      });
      return;
    }

    updatePageMutation.mutate({
      title: title.trim(),
      content,
      tags,
    });
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault();
      if (!tags.includes(newTag.trim()) && tags.length < 10) {
        setTags([...tags, newTag.trim()]);
        setNewTag("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleBeforeUnload = useCallback(
    (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    },
    [hasChanges]
  );

  useEffect(() => {
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [handleBeforeUnload]);

  // 初期化中または認証されていない場合はローディング表示
  if (!isInitialized) {
    return (
      <div className='min-h-screen bg-background flex items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-muted-foreground'>読み込み中...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className='min-h-screen bg-white'>
        <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          <div className='animate-pulse'>
            <div className='h-8 bg-koala-200 rounded mb-4'></div>
            <div className='h-4 bg-koala-200 rounded mb-2'></div>
            <div className='h-96 bg-koala-200 rounded'></div>
          </div>
        </div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className='min-h-screen bg-white flex items-center justify-center'>
        <div className='text-center'>
          <h1 className='text-2xl font-bold text-koala-900 mb-4'>
            ページが見つかりません
          </h1>
          <p className='text-koala-600 mb-8'>
            お探しのページは存在しないか、削除された可能性があります。
          </p>
          <button onClick={() => router.back()} className='btn-primary'>
            戻る
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='space-y-8'
        >
          {/* ナビゲーション */}
          <div className='mb-6'>
            <button
              onClick={() => router.back()}
              className='inline-flex items-center text-koala-600 hover:text-koala-900 transition-colors'
            >
              <ArrowLeft className='w-4 h-4 mr-2' />
              戻る
            </button>
          </div>

          {/* ヘッダー */}
          <div className='flex items-center justify-between mb-8'>
            <div>
              <h1 className='text-3xl font-bold text-koala-900'>
                ページを編集
              </h1>
              {hasChanges && (
                <p className='text-sm text-orange-600 mt-2 flex items-center'>
                  <span className='inline-block w-2 h-2 bg-orange-400 rounded-full mr-2'></span>
                  未保存の変更があります
                </p>
              )}
            </div>
            <div className='flex items-center space-x-3'>
              <button
                onClick={() => setIsPreview(!isPreview)}
                className='btn-outline hover:bg-koala-50 transition-all duration-200 flex items-center space-x-2 px-4 py-2 rounded-lg border border-koala-200 text-koala-700 hover:text-koala-900 hover:border-koala-300'
              >
                <Eye className='w-4 h-4' />
                <span>{isPreview ? "編集" : "プレビュー"}</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={updatePageMutation.isPending || !hasChanges}
                className='btn-primary bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {updatePageMutation.isPending ? (
                  <div className='flex items-center'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                    更新中...
                  </div>
                ) : (
                  <>
                    <Save className='w-4 h-4' />
                    <span>更新</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* タイトル入力 */}
          <div className='mb-8'>
            <label className='block text-sm font-medium text-koala-700 mb-3'>
              タイトル
            </label>
            <div className='border border-koala-200 rounded-lg p-4 bg-white'>
              <input
                type='text'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='ページのタイトルを入力してください'
                className='input w-full text-lg border-0 focus:ring-0 focus:outline-none bg-transparent'
                maxLength={200}
              />
              <p className='text-xs text-koala-500 mt-3 flex items-center'>
                <span className='inline-block w-2 h-2 bg-primary-400 rounded-full mr-2'></span>
                {title.length}/200文字
              </p>
            </div>
          </div>

          {/* タグ入力 */}
          <div className='mb-8'>
            <label className='block text-sm font-medium text-koala-700 mb-3'>
              タグ
            </label>
            <div className='border border-koala-200 rounded-lg p-4 bg-white'>
              <div className='flex flex-wrap gap-2 mb-4'>
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className='inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-primary-100 text-primary-800 border border-primary-200'
                  >
                    <Tag className='w-3.5 h-3.5 mr-1.5' />
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className='ml-2 text-primary-600 hover:text-primary-800 transition-colors duration-200'
                      aria-label={`${tag}タグを削除`}
                    >
                      <X className='w-3.5 h-3.5' />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type='text'
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder='タグを入力してEnterで追加（最大10個）'
                className='input w-full border-0 focus:ring-0 focus:outline-none bg-transparent'
                maxLength={20}
                disabled={tags.length >= 10}
              />
              <p className='text-xs text-koala-500 mt-3 flex items-center'>
                <span className='inline-block w-2 h-2 bg-primary-400 rounded-full mr-2'></span>
                Enterキーでタグを追加できます（最大10個）
              </p>
            </div>
          </div>

          {/* エディター/プレビュー */}
          <div className='mb-6'>
            <label className='block text-sm font-medium text-koala-700 mb-2'>
              本文
            </label>
            {isPreview ? (
              <div className='border border-koala-300 rounded-lg p-8 min-h-[400px] bg-white'>
                <div className='prose prose-lg mx-auto focus:outline-none [&_h1]:text-3xl [&_h1]:font-medium [&_h1]:mt-12 [&_h1]:mb-8 [&_h1]:bg-gradient-to-r [&_h1]:from-primary-50 [&_h1]:to-transparent [&_h1]:text-primary-900 [&_h1]:px-6 [&_h1]:py-4 [&_h1]:rounded-r-lg [&_h1]:border-l-8 [&_h1]:border-primary-500 [&_h1]:w-full [&_h1]:shadow-sm [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:mt-10 [&_h2]:mb-6 [&_h2]:bg-gradient-to-r [&_h2]:from-koala-50 [&_h2]:to-transparent [&_h2]:text-koala-900 [&_h2]:px-5 [&_h2]:py-3 [&_h2]:rounded-r-md [&_h2]:border-l-6 [&_h2]:border-koala-400 [&_h2]:w-full [&_h2]:shadow-sm [&_h3]:text-xl [&_h3]:font-medium [&_h3]:mt-8 [&_h3]:mb-4 [&_h3]:text-koala-800 [&_h3]:border-b-2 [&_h3]:border-koala-200 [&_h3]:pb-2 [&_h3]:w-full [&_h3]:bg-gradient-to-r [&_h3]:from-koala-50/30 [&_h3]:to-transparent [&_p]:mb-4 [&_p]:leading-7 [&_p]:font-normal [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul>li]:mb-2 [&_ul>li]:font-normal [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol>li]:mb-2 [&_ol>li]:font-normal [&_blockquote]:border-l-4 [&_blockquote]:border-primary-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-koala-600 [&_blockquote]:my-4 [&_blockquote]:bg-primary-50/50 [&_blockquote]:rounded-r-lg [&_blockquote]:py-2 [&_blockquote]:font-normal [&_pre]:bg-koala-900 [&_pre]:text-white [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:my-3 [&_pre]:overflow-x-auto [&_code]:bg-koala-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_code]:text-koala-900 [&_a]:text-primary-600 [&_a]:hover:text-primary-700 [&_a]:underline [&_a]:decoration-primary-300 [&_a]:hover:decoration-primary-500 [&_a]:transition-colors [&_a]:duration-200 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4 [&_img]:shadow-md [&_img]:hover:shadow-lg [&_img]:transition-shadow [&_img]:duration-200 [&_hr]:my-8 [&_hr]:border-koala-200 [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_table]:rounded-lg [&_table]:overflow-hidden [&_table]:shadow-sm [&_thead]:bg-primary-50 [&_th]:border [&_th]:border-koala-300 [&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_th]:bg-primary-50/50 [&_th]:text-primary-900 [&_th]:font-medium [&_td]:border [&_td]:border-koala-300 [&_td]:px-4 [&_td]:py-2 [&_td]:font-normal [&_div]:mb-4 [&_ul>li::marker]:text-primary-500 [&_ol>li::marker]:text-primary-500 [&_ol>li::marker]:font-normal [&_pre_code]:bg-transparent [&_pre_code]:text-white [&_pre_code]:p-0 [&_tbody_tr:hover]:bg-koala-50/50 [&_table]:border [&_table]:border-koala-300 [&_table]:bg-white [&_table]:shadow-md [&_table]:hover:shadow-lg [&_table]:transition-shadow [&_table]:duration-200 [&_th]:bg-primary-50 [&_th]:text-primary-900 [&_th]:font-medium [&_th]:border-b-2 [&_th]:border-primary-300 [&_td]:bg-white [&_td]:text-koala-900 [&_td]:border-b [&_td]:border-koala-200 [&_td]:hover:bg-koala-50/30 [&_td]:transition-colors [&_td]:duration-150 [&_tr:last-child_td]:border-b-0 [&_tr:last-child_th]:border-b-0 [&_table_resize-handle]:bg-primary-500 [&_table_resize-handle]:w-1 [&_table_resize-handle]:h-full [&_table_resize-handle]:absolute [&_table_resize-handle]:right-0 [&_table_resize-handle]:top-0 [&_table_resize-handle]:cursor-col-resize [&_table_resize-handle]:opacity-0 [&_table_resize-handle]:hover:opacity-100 [&_table_resize-handle]:transition-opacity [&_table_resize-handle]:duration-150'>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: content || "<p>本文が入力されていません</p>",
                    }}
                  />
                </div>
              </div>
            ) : (
              <TiptapEditor
                content={content}
                onContentChange={setContent}
                placeholder='ページの本文を入力してください...'
                className='min-h-[400px] p-4 focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2'
              />
            )}
          </div>

          {/* ページ情報 */}
          <div className='bg-koala-50 border border-koala-200 rounded-lg p-4'>
            <h3 className='font-medium text-koala-900 mb-4 flex items-center'>
              <span className='inline-block w-2 h-2 bg-primary-400 rounded-full mr-2'></span>
              ページ情報
            </h3>
            <div className='text-sm text-koala-700 space-y-2'>
              <p className='flex items-center'>
                <span className='inline-block w-1.5 h-1.5 bg-primary-300 rounded-full mr-2'></span>
                作成者: {page.author.nickname}
              </p>
              <p className='flex items-center'>
                <span className='inline-block w-1.5 h-1.5 bg-primary-300 rounded-full mr-2'></span>
                作成日: {new Date(page.createdAt).toLocaleDateString("ja-JP")}
              </p>
              <p className='flex items-center'>
                <span className='inline-block w-1.5 h-1.5 bg-primary-300 rounded-full mr-2'></span>
                最終更新: {new Date(page.updatedAt).toLocaleDateString("ja-JP")}
              </p>
              <p className='flex items-center'>
                <span className='inline-block w-1.5 h-1.5 bg-primary-300 rounded-full mr-2'></span>
                閲覧数: {page.viewCount}回
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { Save, Eye, Tag, X, ArrowLeft } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TiptapEditor } from "../../../components/editor/TiptapEditor";
import { wikiAPI } from "../../../lib/api";
import { useAuthStore, useUIStore, useEditorStore } from "../../../store";

export default function EditPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();
  const { addToast } = useUIStore();
  const { currentDraft, saveDraft, clearCurrentDraft } = useEditorStore();

  const pageId = params.id as string;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isPreview, setIsPreview] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // 編集対象の記事を取得
  const { data: page, isLoading } = useQuery({
    queryKey: ["page", pageId],
    queryFn: () => wikiAPI.getPage(pageId),
    enabled: !!pageId,
  });

  // 認証・権限チェック
  useEffect(() => {
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
          description: "この記事を編集する権限がありません",
        });
        router.push(`/wiki/${pageId}`);
        return;
      }

      // 初期値設定
      setTitle(page.title);
      setContent(page.content);
      setTags(page.tags);
    }
  }, [isAuthenticated, page, user, router, pageId, addToast]);

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

  // 記事更新
  const updatePageMutation = useMutation({
    mutationFn: (data: { title: string; content: string; tags: string[] }) =>
      wikiAPI.updatePage(pageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["page", pageId] });
      addToast({
        type: "success",
        title: "記事を更新しました",
      });
      clearCurrentDraft();
      router.push(`/wiki/${pageId}`);
    },
    onError: (error: { response?: { data?: { error?: string } } }) => {
      addToast({
        type: "error",
        title: "記事の更新に失敗しました",
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
            記事が見つかりません
          </h1>
          <p className='text-koala-600 mb-8'>
            お探しの記事は存在しないか、削除された可能性があります。
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
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
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
              <h1 className='text-3xl font-bold text-koala-900'>記事を編集</h1>
              {hasChanges && (
                <p className='text-sm text-orange-600 mt-1'>
                  未保存の変更があります
                </p>
              )}
            </div>
            <div className='flex items-center space-x-3'>
              <button
                onClick={() => setIsPreview(!isPreview)}
                className='btn-outline'
              >
                <Eye className='w-4 h-4 mr-2' />
                {isPreview ? "編集" : "プレビュー"}
              </button>
              <button
                onClick={handleSubmit}
                disabled={updatePageMutation.isPending || !hasChanges}
                className='btn-primary'
              >
                {updatePageMutation.isPending ? (
                  <div className='flex items-center'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                    更新中...
                  </div>
                ) : (
                  <>
                    <Save className='w-4 h-4 mr-2' />
                    更新
                  </>
                )}
              </button>
            </div>
          </div>

          {/* タイトル入力 */}
          <div className='mb-6'>
            <label className='block text-sm font-medium text-koala-700 mb-2'>
              タイトル
            </label>
            <input
              type='text'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder='記事のタイトルを入力してください'
              className='input w-full text-lg'
              maxLength={200}
            />
            <p className='text-xs text-koala-500 mt-1'>
              {title.length}/200文字
            </p>
          </div>

          {/* タグ入力 */}
          <div className='mb-6'>
            <label className='block text-sm font-medium text-koala-700 mb-2'>
              タグ
            </label>
            <div className='flex flex-wrap gap-2 mb-2'>
              {tags.map((tag) => (
                <span
                  key={tag}
                  className='inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800'
                >
                  <Tag className='w-3 h-3 mr-1' />
                  {tag}
                  <button
                    title='タグを削除'
                    onClick={() => handleRemoveTag(tag)}
                    className='ml-2 text-primary-600 hover:text-primary-800'
                  >
                    <X className='w-3 h-3' />
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
              className='input w-full'
              maxLength={20}
              disabled={tags.length >= 10}
            />
            <p className='text-xs text-koala-500 mt-1'>
              Enterキーでタグを追加できます（最大10個）
            </p>
          </div>

          {/* エディター/プレビュー */}
          <div className='mb-6'>
            <label className='block text-sm font-medium text-koala-700 mb-2'>
              本文
            </label>
            {isPreview ? (
              <div className='border border-koala-300 rounded-lg p-6 min-h-[400px] bg-koala-50'>
                <div className='prose max-w-none'>
                  <h1 className='text-3xl font-bold text-koala-900 mb-4'>
                    {title || "タイトル未設定"}
                  </h1>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: content || "<p>本文が入力されていません</p>",
                    }}
                    className='text-koala-800'
                  />
                </div>
              </div>
            ) : (
              <TiptapEditor
                content={content}
                onContentChange={setContent}
                placeholder='記事の本文を入力してください...'
              />
            )}
          </div>

          {/* 記事情報 */}
          <div className='bg-koala-50 border border-koala-200 rounded-lg p-4'>
            <h3 className='font-medium text-koala-900 mb-2'>記事情報</h3>
            <div className='text-sm text-koala-600 space-y-1'>
              <p>作成者: {page.author.nickname}</p>
              <p>
                作成日: {new Date(page.createdAt).toLocaleDateString("ja-JP")}
              </p>
              <p>
                最終更新: {new Date(page.updatedAt).toLocaleDateString("ja-JP")}
              </p>
              <p>閲覧数: {page.viewCount}回</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

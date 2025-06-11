"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Save, Eye, Tag, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { TiptapEditor } from "../../components/editor/TiptapEditor";
import { wikiAPI } from "../../lib/api";
import { useAuthStore, useUIStore, useEditorStore } from "../../store";

const LOCAL_STORAGE_KEY = "tsuruma-wiki-draft";

export default function EditorPage() {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useAuthStore();
  const { addToast } = useUIStore();
  const { currentDraft, saveDraft, clearCurrentDraft } = useEditorStore();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isPreview, setIsPreview] = useState(false);

  // ローカルストレージから下書きを読み込む
  useEffect(() => {
    const savedDraft = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedDraft) {
      try {
        const {
          title: savedTitle,
          content: savedContent,
          tags: savedTags,
        } = JSON.parse(savedDraft);
        setTitle(savedTitle || "");
        setContent(savedContent || "");
        setTags(savedTags || []);
        addToast({
          type: "success",
          title: "下書きを復元しました",
        });
      } catch (error) {
        console.error("下書きの読み込みに失敗しました:", error);
        addToast({
          type: "error",
          title: "下書きの復元に失敗しました",
        });
      }
    }
  }, [addToast]);

  // 下書きをローカルストレージに保存
  const saveToLocalStorage = () => {
    const draft = {
      title,
      content,
      tags,
    };
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(draft));
  };

  // 下書きをクリア
  const clearLocalStorage = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  };

  // 認証チェック - 初期化完了後に実行
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
  }, [isAuthenticated, isInitialized, router]);

  // 下書きの読み込み
  useEffect(() => {
    if (currentDraft) {
      setTitle(currentDraft.title);
      setContent(currentDraft.content);
      setTags(currentDraft.tags);
    }
  }, [currentDraft]);

  // 自動保存（5秒ごと）
  useEffect(() => {
    const interval = setInterval(() => {
      if (title.trim() || content.trim()) {
        saveDraft("auto", title, content, tags);
        saveToLocalStorage(); // ローカルストレージにも保存
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [title, content, tags, saveDraft]);

  const createPageMutation = useMutation({
    mutationFn: wikiAPI.createPage,
    onSuccess: (data) => {
      addToast({
        type: "success",
        title: "ページを作成しました",
        description:
          data.status === "published"
            ? "ページが公開されました"
            : "承認待ちです",
      });
      clearCurrentDraft();
      clearLocalStorage(); // ローカルストレージもクリア
      router.push(data.status === "published" ? `/wiki/${data.id}` : "/");
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      addToast({
        type: "error",
        title: "ページの作成に失敗しました",
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

    createPageMutation.mutate({
      title: title.trim(),
      content,
      tags,
    });
  };

  // 手動保存ボタンのハンドラー
  const handleSave = () => {
    saveToLocalStorage();
    addToast({
      type: "success",
      title: "下書きを保存しました",
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

  // 初期化中の場合はローディング表示
  if (!isInitialized) {
    return (
      <div className='min-h-screen bg-white flex items-center justify-center'>
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

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-12'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='space-y-4 sm:space-y-8'
        >
          {/* ヘッダー */}
          <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-4 sm:mb-8'>
            <h1 className='text-2xl sm:text-3xl font-bold text-koala-900'>
              ページを作成
            </h1>
            <div className='flex items-center space-x-2 sm:space-x-3'>
              <button
                onClick={handleSave}
                className='btn-outline hover:bg-koala-50 transition-all duration-200 flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg border border-koala-200 text-koala-700 hover:text-koala-900 hover:border-koala-300 text-sm sm:text-base'
              >
                <Save className='w-4 h-4' />
                <span>保存</span>
              </button>
              <button
                onClick={() => setIsPreview(!isPreview)}
                className='btn-outline hover:bg-koala-50 transition-all duration-200 flex items-center space-x-2 px-3 sm:px-4 py-2 rounded-lg border border-koala-200 text-koala-700 hover:text-koala-900 hover:border-koala-300 text-sm sm:text-base'
              >
                <Eye className='w-4 h-4' />
                <span>{isPreview ? "編集" : "プレビュー"}</span>
              </button>
              <button
                onClick={handleSubmit}
                disabled={createPageMutation.isPending}
                className='btn-primary bg-primary-600 hover:bg-primary-700 text-white px-4 sm:px-6 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base'
              >
                {createPageMutation.isPending ? (
                  <div className='flex items-center'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                    作成中...
                  </div>
                ) : (
                  <>
                    <Save className='w-4 h-4' />
                    <span>作成</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* タイトル入力 */}
          <div className='mb-4 sm:mb-8'>
            <label className='block text-sm font-medium text-koala-700 mb-2 sm:mb-3'>
              タイトル
            </label>
            <div className='border border-koala-200 rounded-lg p-3 sm:p-4 bg-white'>
              <input
                type='text'
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder='ページのタイトルを入力してください'
                className='input w-full text-base sm:text-lg border-0 focus:ring-0 focus:outline-none bg-transparent'
                maxLength={200}
              />
              <p className='text-xs text-koala-500 mt-3 flex items-center'>
                <span className='inline-block w-2 h-2 bg-primary-400 rounded-full mr-2'></span>
                {title.length}/200文字
              </p>
            </div>
          </div>

          {/* タグ入力 */}
          <div className='mb-4 sm:mb-8'>
            <label className='block text-sm font-medium text-koala-700 mb-2 sm:mb-3'>
              タグ
            </label>
            <div className='border border-koala-200 rounded-lg p-3 sm:p-4 bg-white'>
              <div className='flex flex-wrap gap-2 mb-3 sm:mb-4'>
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className='inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium bg-primary-100 text-primary-800 border border-primary-200'
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
                className='input w-full text-sm sm:text-base border-0 focus:ring-0 focus:outline-none bg-transparent'
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
          <div className='mb-4 sm:mb-6'>
            <label className='block text-sm font-medium text-koala-700 mb-2'>
              本文
            </label>
            {isPreview ? (
              <div className='border border-koala-300 rounded-lg p-4 sm:p-8 min-h-[300px] sm:min-h-[400px] bg-white'>
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

          {/* 権限に応じたメッセージ */}
          <div className='bg-koala-50 border border-koala-200 rounded-lg p-4'>
            <p className='text-sm text-koala-700 flex items-center'>
              <span className='inline-block w-2 h-2 bg-primary-400 rounded-full mr-2'></span>
              {user?.role === "contributor"
                ? "ページは作成後、モデレーターの承認を受けてから公開されます。"
                : "ページは作成後すぐに公開されます。"}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

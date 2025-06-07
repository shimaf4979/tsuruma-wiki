"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Save, Eye, Tag, X } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { TiptapEditor } from "../../components/editor/TiptapEditor";
import { wikiAPI } from "../../lib/api";
import { useAuthStore, useUIStore, useEditorStore } from "../../store";

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
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* ヘッダー */}
          <div className='flex items-center justify-between mb-8'>
            <h1 className='text-3xl font-bold text-koala-900'>ページを作成</h1>
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
                disabled={createPageMutation.isPending}
                className='btn-primary'
              >
                {createPageMutation.isPending ? (
                  <div className='flex items-center'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                    作成中...
                  </div>
                ) : (
                  <>
                    <Save className='w-4 h-4 mr-2' />
                    作成
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
              placeholder='ページのタイトルを入力してください'
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
                    onClick={() => handleRemoveTag(tag)}
                    className='ml-2 text-primary-600 hover:text-primary-800'
                    aria-label={`${tag}タグを削除`}
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
                <div className='prose max-w-none [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mt-12 [&_h1]:mb-8 [&_h1]:bg-gradient-to-r [&_h1]:from-primary-50 [&_h1]:to-transparent [&_h1]:text-primary-900 [&_h1]:px-6 [&_h1]:py-4 [&_h1]:rounded-r-lg [&_h1]:border-l-8 [&_h1]:border-primary-500 [&_h1]:w-full [&_h1]:shadow-sm [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-10 [&_h2]:mb-6 [&_h2]:bg-gradient-to-r [&_h2]:from-koala-50 [&_h2]:to-transparent [&_h2]:text-koala-900 [&_h2]:px-5 [&_h2]:py-3 [&_h2]:rounded-r-md [&_h2]:border-l-6 [&_h2]:border-koala-400 [&_h2]:w-full [&_h2]:shadow-sm [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-8 [&_h3]:mb-4 [&_h3]:text-koala-800 [&_h3]:border-b-2 [&_h3]:border-koala-200 [&_h3]:pb-2 [&_h3]:w-full [&_h3]:bg-gradient-to-r [&_h3]:from-koala-50/30 [&_h3]:to-transparent [&_p]:mb-4 [&_p]:leading-7 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ul>li]:mb-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_ol>li]:mb-2 [&_blockquote]:border-l-4 [&_blockquote]:border-primary-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-koala-600 [&_blockquote]:my-4 [&_blockquote]:bg-primary-50/50 [&_blockquote]:rounded-r-lg [&_blockquote]:py-2 [&_pre]:bg-koala-900 [&_pre]:text-white [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:my-3 [&_pre]:overflow-x-auto [&_code]:bg-koala-100 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono [&_code]:text-koala-900 [&_a]:text-primary-600 [&_a]:hover:text-primary-700 [&_a]:underline [&_a]:decoration-primary-300 [&_a]:hover:decoration-primary-500 [&_a]:transition-colors [&_a]:duration-200 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4 [&_img]:shadow-md [&_img]:hover:shadow-lg [&_img]:transition-shadow [&_img]:duration-200 [&_hr]:my-8 [&_hr]:border-koala-200 [&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_table]:rounded-lg [&_table]:overflow-hidden [&_table]:shadow-sm [&_thead]:bg-primary-50 [&_th]:border [&_th]:border-koala-300 [&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_th]:bg-primary-50/50 [&_th]:text-primary-900 [&_th]:font-semibold [&_td]:border [&_td]:border-koala-300 [&_td]:px-4 [&_td]:py-2 [&_div]:mb-4 [&_ul>li::marker]:text-primary-500 [&_ol>li::marker]:text-primary-500 [&_ol>li::marker]:font-medium [&_pre_code]:bg-transparent [&_pre_code]:text-white [&_pre_code]:p-0 [&_tbody_tr:hover]:bg-koala-50/50'>
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
                placeholder='ページの本文を入力してください...'
              />
            )}
          </div>

          {/* 権限に応じたメッセージ */}
          <div className='bg-koala-50 border border-koala-200 rounded-lg p-4'>
            <p className='text-sm text-koala-600'>
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

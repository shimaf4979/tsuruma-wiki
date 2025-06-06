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
        title: "記事を作成しました",
        description:
          data.status === "published" ? "記事が公開されました" : "承認待ちです",
      });
      clearCurrentDraft();
      router.push(data.status === "published" ? `/wiki/${data.id}` : "/");
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      addToast({
        type: "error",
        title: "記事の作成に失敗しました",
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
            <h1 className='text-3xl font-bold text-koala-900'>記事を作成</h1>
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

          {/* 権限に応じたメッセージ */}
          <div className='bg-koala-50 border border-koala-200 rounded-lg p-4'>
            <p className='text-sm text-koala-600'>
              {user?.role === "contributor"
                ? "記事は作成後、モデレーターの承認を受けてから公開されます。"
                : "記事は作成後すぐに公開されます。"}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

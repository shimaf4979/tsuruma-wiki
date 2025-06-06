// app/profile/page.tsx - プロフィール設定ページ（完成版）
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { User, Mail, Save, Upload, ArrowLeft } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { userAPI, uploadAPI } from "../../lib/api";
import { useAuthStore, useUIStore } from "../../store";

export default function ProfilePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isInitialized, updateUser } = useAuthStore();
  console.log(user);
  const { addToast } = useUIStore();

  const [formData, setFormData] = useState({
    nickname: "",
    bio: "",
    avatarUrl: "",
  });
  const [previewUrl, setPreviewUrl] = useState<string>("");

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

    // ユーザー情報をフォームに設定
    if (user) {
      setFormData({
        nickname: user.nickname || "",
        bio: user.bio || "",
        avatarUrl: user.avatarUrl || "",
      });
      setPreviewUrl(user.avatarUrl || "");
      console.log(user.avatarUrl);
    }
  }, [isAuthenticated, isInitialized, user, router]);

  // プロフィール更新
  const updateProfileMutation = useMutation({
    mutationFn: userAPI.updateMe,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      updateUser(variables);
      addToast({
        type: "success",
        title: "プロフィールを更新しました",
      });
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      addToast({
        type: "error",
        title: "プロフィールの更新に失敗しました",
        description: error.response?.data?.error || "エラーが発生しました",
      });
    },
  });

  // アバター画像アップロード
  const uploadAvatarMutation = useMutation({
    mutationFn: uploadAPI.uploadImage,
    onSuccess: (data) => {
      setFormData((prev) => ({ ...prev, avatarUrl: data.url }));
      setPreviewUrl(data.url);
      addToast({
        type: "success",
        title: "アバター画像をアップロードしました",
      });
    },
    onError: (error: Error & { response?: { data?: { error?: string } } }) => {
      addToast({
        type: "error",
        title: "アバター画像のアップロードに失敗しました",
        description: error.response?.data?.error || "エラーが発生しました",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nickname.trim()) {
      addToast({
        type: "error",
        title: "ニックネームを入力してください",
      });
      return;
    }

    updateProfileMutation.mutate(formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addToast({
          type: "error",
          title: "ファイルサイズが大きすぎます",
          description: "5MB以下の画像を選択してください",
        });
        return;
      }

      setPreviewUrl(URL.createObjectURL(file));
      uploadAvatarMutation.mutate(file);
    }
  };

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

  return (
    <div className='min-h-screen bg-background'>
      <div className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* ナビゲーション */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='mb-8'
        >
          <button
            onClick={() => router.back()}
            className='inline-flex items-center text-muted-foreground hover:text-foreground transition-colors'
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            戻る
          </button>
        </motion.div>

        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className='mb-8'
        >
          <h1 className='text-3xl font-bold text-foreground mb-2'>
            プロフィール設定
          </h1>
          <p className='text-muted-foreground'>
            あなたのプロフィール情報を更新できます
          </p>
        </motion.div>

        {/* フォーム */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className='card space-y-6'>
            {/* アバター */}
            <div>
              <label className='block text-sm font-medium text-foreground mb-4'>
                アバター画像
              </label>
              <div className='flex items-center space-x-4'>
                <div className='relative'>
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt='アバター'
                      className='w-20 h-20 rounded-full object-cover'
                    />
                  ) : (
                    <div className='w-20 h-20 rounded-full bg-muted flex items-center justify-center'>
                      <User className='w-8 h-8 text-muted-foreground' />
                    </div>
                  )}
                  {uploadAvatarMutation.isPending && (
                    <div className='absolute inset-0 bg-background/80 rounded-full flex items-center justify-center'>
                      <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary'></div>
                    </div>
                  )}
                </div>
                <div>
                  <label className='btn-outline cursor-pointer'>
                    <Upload className='w-4 h-4 mr-2' />
                    画像を選択
                    <input
                      type='file'
                      accept='image/*'
                      onChange={handleAvatarChange}
                      className='hidden'
                    />
                  </label>
                  <p className='text-xs text-muted-foreground mt-1'>
                    最大5MB（JPEG, PNG, WebP）
                  </p>
                </div>
              </div>
            </div>

            {/* ニックネーム */}
            <div>
              <label
                htmlFor='nickname'
                className='block text-sm font-medium text-foreground mb-2'
              >
                ニックネーム <span className='text-destructive'>*</span>
              </label>
              <input
                id='nickname'
                name='nickname'
                type='text'
                required
                value={formData.nickname}
                onChange={handleChange}
                className='input'
                placeholder='こあらちゃん'
                maxLength={20}
              />
              <p className='text-xs text-muted-foreground mt-1'>
                {formData.nickname.length}/20文字
              </p>
            </div>

            {/* メールアドレス（読み取り専用） */}
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-foreground mb-2'
              >
                メールアドレス
              </label>
              <div className='relative'>
                <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
                <input
                  id='email'
                  type='email'
                  value={user?.email || ""}
                  disabled
                  className='input pl-10 bg-muted'
                />
              </div>
              <p className='text-xs text-muted-foreground mt-1'>
                メールアドレスは変更できません
              </p>
            </div>

            {/* 自己紹介 */}
            <div>
              <label
                htmlFor='bio'
                className='block text-sm font-medium text-foreground mb-2'
              >
                自己紹介
              </label>
              <textarea
                id='bio'
                name='bio'
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                className='textarea'
                placeholder='あなたについて教えてください...'
                maxLength={200}
              />
              <p className='text-xs text-muted-foreground mt-1'>
                {formData.bio.length}/200文字
              </p>
            </div>

            {/* 権限表示 */}
            <div>
              <label className='block text-sm font-medium text-foreground mb-2'>
                権限
              </label>
              <div className='flex items-center space-x-2'>
                <span className={`badge-default`}>
                  {user?.role === "admin" && "管理者"}
                  {user?.role === "moderator" && "モデレーター"}
                  {user?.role === "editor" && "エディター"}
                  {user?.role === "contributor" && "コントリビューター"}
                </span>
                <span className='text-sm text-muted-foreground'>
                  権限の変更は管理者にお問い合わせください
                </span>
              </div>
            </div>

            {/* 保存ボタン */}
            <div className='flex justify-end'>
              <button
                type='submit'
                disabled={updateProfileMutation.isPending}
                className='btn-primary'
              >
                {updateProfileMutation.isPending ? (
                  <div className='flex items-center'>
                    <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2'></div>
                    保存中...
                  </div>
                ) : (
                  <>
                    <Save className='w-4 h-4 mr-2' />
                    保存
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

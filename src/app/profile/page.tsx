// app/profile/page.tsx - プロフィール設定ページ（完成版）
"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { User, Mail, Save, Upload } from "lucide-react";
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
  const [hasChanges, setHasChanges] = useState(false);

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

  // 変更検知
  useEffect(() => {
    if (user) {
      const hasContentChanges =
        formData.nickname !== (user.nickname || "") ||
        formData.bio !== (user.bio || "") ||
        formData.avatarUrl !== (user.avatarUrl || "");
      setHasChanges(hasContentChanges);
    }
  }, [formData, user]);

  // ページ離脱時の警告
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasChanges]);

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
    <div className='min-h-screen bg-gradient-to-b from-background to-background/95'>
      <div className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-2'>
        {/* ナビゲーション */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.1 }}
          className='mb-8'
        >
          {/* <div className='flex items-center justify-between'>
            <button
              onClick={() => router.back()}
              className='inline-flex items-center text-muted-foreground hover:text-foreground transition-colors duration-200 hover:scale-105'
            >
              <ArrowLeft className='w-4 h-4 mr-2' />
              戻る
            </button>
            <button
              type='submit'
              onClick={handleSubmit}
              disabled={updateProfileMutation.isPending}
              className='inline-flex items-center justify-center px-6 py-2.5 bg-primary-600 text-white font-medium rounded-lg shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md active:scale-95'
            >
              {updateProfileMutation.isPending ? (
                <div className='flex items-center'>
                  <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
                  保存中...
                </div>
              ) : (
                <>
                  <Save className='w-4 h-4 mr-2' />
                  保存
                </>
              )}
            </button>
          </div> */}
          {hasChanges && (
            <p className='text-sm text-orange-600 mt-2 flex items-center'>
              <span className='inline-block w-2 h-2 bg-orange-400 rounded-full mr-2'></span>
              未保存の変更があります
            </p>
          )}
        </motion.div>
        {/* ヘッダー */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className='mb-12 text-center'
        >
          <h1 className='text-4xl font-bold text-foreground mb-3 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/80'>
            プロフィール設定
          </h1>
          <p className='text-muted-foreground text-lg'>
            あなたのプロフィール情報を更新できます
          </p>
        </motion.div> */}
        {/* フォーム */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.1, delay: 0.01 }}
        >
          <form
            onSubmit={handleSubmit}
            className='card space-y-8 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300'
          >
            {/* アバター */}
            <div>
              <label className='block text-sm font-medium text-foreground mb-4'>
                アバター画像
              </label>
              <div className='flex items-center space-x-6'>
                <div className='relative group'>
                  <label className='cursor-pointer'>
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt='アバター'
                        className='w-28 h-28 rounded-full object-cover ring-4 ring-primary/20 transition-all duration-300 group-hover:ring-primary/40'
                      />
                    ) : (
                      <div className='w-28 h-28 rounded-full bg-muted flex items-center justify-center ring-4 ring-primary/20 transition-all duration-300 group-hover:ring-primary/40'>
                        <User className='w-12 h-12 text-muted-foreground' />
                      </div>
                    )}
                    <input
                      type='file'
                      accept='image/*'
                      onChange={handleAvatarChange}
                      className='hidden'
                    />
                  </label>
                  {uploadAvatarMutation.isPending && (
                    <div className='absolute inset-0 bg-background/80 rounded-full flex items-center justify-center backdrop-blur-sm'>
                      <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
                    </div>
                  )}
                </div>
                <div className='flex-1'>
                  <label className='btn-outline cursor-pointer hover:bg-primary/10 transition-colors duration-200 w-full sm:w-auto'>
                    <Upload className='w-4 h-4 mr-2' />
                    画像を選択
                    <input
                      type='file'
                      accept='image/*'
                      onChange={handleAvatarChange}
                      className='hidden'
                    />
                  </label>
                  <p className='text-xs text-muted-foreground mt-2'>
                    最大5MB
                    <br />
                    (JPEG, PNG, WebP)
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
              <div className='border border-koala-200 rounded-lg p-4 bg-white'>
                <input
                  id='nickname'
                  name='nickname'
                  type='text'
                  required
                  value={formData.nickname}
                  onChange={handleChange}
                  className='input w-full border-0 focus:ring-0 focus:outline-none bg-transparent'
                  placeholder='こあらちゃん'
                  maxLength={20}
                />
                <p className='text-xs text-muted-foreground mt-2'>
                  {formData.nickname.length}/20文字
                </p>
              </div>
            </div>

            {/* メールアドレス（読み取り専用） */}
            <div>
              <label
                htmlFor='email'
                className='block text-sm font-medium text-foreground mb-2'
              >
                メールアドレス
              </label>
              <div className='border border-koala-200 rounded-lg p-4 bg-white'>
                <div className='relative'>
                  <Mail className='absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4' />
                  <input
                    id='email'
                    type='email'
                    value={user?.email || ""}
                    disabled
                    className='input w-full pl-12 pr-4 py-3 border-0 focus:ring-0 focus:outline-none bg-transparent'
                  />
                </div>
                <p className='text-xs text-muted-foreground mt-2'>
                  メールアドレスは変更できません
                </p>
              </div>
            </div>

            {/* 自己紹介 */}
            <div>
              <label
                htmlFor='bio'
                className='block text-sm font-medium text-foreground mb-2'
              >
                自己紹介
              </label>
              <div className='border border-koala-200 rounded-lg p-4 bg-white'>
                <textarea
                  id='bio'
                  name='bio'
                  rows={4}
                  value={formData.bio}
                  onChange={handleChange}
                  className='textarea w-full border-0 focus:ring-0 focus:outline-none bg-transparent'
                  placeholder='あなたについて教えてください...'
                  maxLength={200}
                />
                <p className='text-xs text-muted-foreground mt-2'>
                  {formData.bio.length}/200文字
                </p>
              </div>
            </div>

            {/* 権限表示 */}
            <div>
              <label className='block text-sm font-medium text-foreground mb-2'>
                権限
              </label>
              <div className='flex items-center justify-between space-x-3'>
                <span
                  className={`badge-default px-6 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary`}
                >
                  {user?.role === "admin" && "管理者"}
                  {user?.role === "moderator" && "モデレーター"}
                  {user?.role === "editor" && "エディター"}
                  {user?.role === "contributor" && "コントリビューター"}
                </span>
                {/* 保存ボタン */}
                <button
                  type='submit'
                  disabled={updateProfileMutation.isPending}
                  className='inline-flex items-center justify-center px-6 py-2 bg-primary-600 text-white text-sm font-medium rounded-full shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-md active:scale-95'
                >
                  {updateProfileMutation.isPending ? (
                    <div className='flex items-center'>
                      <div className='animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2'></div>
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
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

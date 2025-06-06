// app/register/page.tsx
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Mail,
  User,
  UserPlus,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { authAPI } from "../../lib/api";
import { useAuthStore, useUIStore } from "../../store";

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const { addToast } = useUIStore();
  const [formData, setFormData] = useState({
    nickname: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const registerMutation = useMutation({
    mutationFn: authAPI.register,
    onSuccess: (data) => {
      login(data.token, data.user);
      addToast({
        type: "success",
        title: "アカウントを作成しました",
        description: `ようこそ、${data.user.nickname}さん！`,
      });
      router.push("/");
    },
    onError: (error: {
      response?: {
        data?: {
          code?: string;
          details?: { errors?: { field: string; message: string }[] };
        };
      };
    }) => {
      console.error("Register error:", error);
      const errorData = error.response?.data;

      if (
        errorData?.code === "VALIDATION_ERROR" &&
        errorData?.details?.errors
      ) {
        // バリデーションエラーの詳細表示
        const errors = errorData.details.errors.map(
          (err: { field: string; message: string }) =>
            `${err.field}: ${err.message}`
        );
        setValidationErrors(errors);
        addToast({
          type: "error",
          title: "入力内容に問題があります",
          description: "各項目を確認してください",
        });
      } else {
        const errorMessage =
          errorData?.details?.errors?.[0]?.message || "登録に失敗しました";
        const errorCode = errorData?.code;

        let description = "";
        switch (errorCode) {
          case "USER_EXISTS":
            description = "このメールアドレスは既に使用されています";
            break;
          case "MISSING_FIELDS":
            description = "すべての項目を入力してください";
            break;
          case "WEAK_PASSWORD":
            description = "パスワードは6文字以上で入力してください";
            break;
          case "INVALID_EMAIL":
            description = "有効なメールアドレスを入力してください";
            break;
          case "NICKNAME_TOO_LONG":
            description = "ニックネームは20文字以下で入力してください";
            break;
          default:
            description = errorMessage;
        }

        addToast({
          type: "error",
          title: "登録に失敗しました",
          description,
        });
      }
    },
  });

  const validateForm = () => {
    const errors: string[] = [];

    // ニックネームバリデーション
    if (!formData.nickname.trim()) {
      errors.push("ニックネームは必須です");
    } else if (formData.nickname.length > 20) {
      errors.push("ニックネームは20文字以下で入力してください");
    } else if (
      !/^[a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s]+$/.test(
        formData.nickname
      )
    ) {
      errors.push("ニックネームに使用できない文字が含まれています");
    }

    // メールバリデーション
    if (!formData.email.trim()) {
      errors.push("メールアドレスは必須です");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.push("有効なメールアドレスを入力してください");
    } else if (formData.email.length > 100) {
      errors.push("メールアドレスは100文字以下で入力してください");
    }

    // パスワードバリデーション
    if (!formData.password.trim()) {
      errors.push("パスワードは必須です");
    } else if (formData.password.length < 6) {
      errors.push("パスワードは6文字以上で入力してください");
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    registerMutation.mutate({
      nickname: formData.nickname.trim(),
      email: formData.email.trim(),
      password: formData.password.trim(),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    // リアルタイムバリデーション（エラーがある場合のみ）
    if (validationErrors.length > 0) {
      setTimeout(validateForm, 300);
    }
  };

  return (
    <div className='min-h-screen bg-koala-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='max-w-md w-full space-y-8'
      >
        <div>
          <div className='text-center'>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className='mx-auto h-12 w-12 bg-primary-100 rounded-full flex items-center justify-center'
            >
              <UserPlus className='h-6 w-6 text-primary-600' />
            </motion.div>
            <h2 className='mt-6 text-center text-3xl font-bold text-koala-900'>
              新しいアカウントを作成
            </h2>
            <p className='mt-2 text-center text-sm text-koala-600'>
              または{" "}
              <Link
                href='/login'
                className='font-medium text-primary-600 hover:text-primary-500'
              >
                既存のアカウントでログイン
              </Link>
            </p>
          </div>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className='mt-8 space-y-6'
          onSubmit={handleSubmit}
        >
          <div className='card'>
            {/* バリデーションエラー表示 */}
            {validationErrors.length > 0 && (
              <div className='mb-4 p-3 bg-red-50 border border-red-200 rounded-lg'>
                <div className='flex items-start'>
                  <AlertCircle className='w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0' />
                  <div>
                    <h4 className='text-sm font-medium text-red-800 mb-1'>
                      入力内容を確認してください
                    </h4>
                    <ul className='text-sm text-red-700 space-y-1'>
                      {validationErrors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className='space-y-4'>
              <div>
                <label
                  htmlFor='nickname'
                  className='block text-sm font-medium text-koala-700 mb-1'
                >
                  ニックネーム <span className='text-red-500'>*</span>
                </label>
                <div className='relative'>
                  <User className='absolute left-3 top-1/2 transform -translate-y-1/2 text-koala-400 w-5 h-5' />
                  <input
                    id='nickname'
                    name='nickname'
                    type='text'
                    required
                    value={formData.nickname}
                    onChange={handleChange}
                    className='input pl-10'
                    placeholder='こあらちゃん'
                    maxLength={20}
                  />
                </div>
                <p className='text-xs text-koala-500 mt-1'>
                  日本語、英数字、スペースのみ使用可能（20文字以内）
                </p>
              </div>

              <div>
                <label
                  htmlFor='email'
                  className='block text-sm font-medium text-koala-700 mb-1'
                >
                  メールアドレス <span className='text-red-500'>*</span>
                </label>
                <div className='relative'>
                  <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 text-koala-400 w-5 h-5' />
                  <input
                    id='email'
                    name='email'
                    type='email'
                    autoComplete='email'
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className='input pl-10'
                    placeholder='koala@example.com'
                    maxLength={100}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor='password'
                  className='block text-sm font-medium text-koala-700 mb-1'
                >
                  パスワード <span className='text-red-500'>*</span>
                </label>
                <div className='relative'>
                  <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-koala-400 w-5 h-5' />
                  <input
                    id='password'
                    name='password'
                    type={showPassword ? "text" : "password"}
                    autoComplete='new-password'
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className='input pl-10 pr-10'
                    placeholder='••••••••'
                    minLength={6}
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-koala-400 hover:text-koala-600'
                  >
                    {showPassword ? (
                      <EyeOff className='w-5 h-5' />
                    ) : (
                      <Eye className='w-5 h-5' />
                    )}
                  </button>
                </div>
                <p className='text-xs text-koala-500 mt-1'>
                  6文字以上で入力してください
                </p>
              </div>
            </div>

            <div className='mt-6'>
              <button
                type='submit'
                disabled={registerMutation.isPending}
                className='w-full btn-primary py-3 text-base'
              >
                {registerMutation.isPending ? (
                  <div className='flex items-center justify-center'>
                    <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
                    作成中...
                  </div>
                ) : (
                  <>
                    <UserPlus className='w-5 h-5 mr-2' />
                    アカウント作成
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className='text-center'
        >
          <p className='text-sm text-koala-500'>
            アカウントを作成することで、
            <Link
              href='/terms'
              className='text-primary-600 hover:text-primary-700 underline mx-1'
            >
              利用規約
            </Link>
            と
            <Link
              href='/privacy'
              className='text-primary-600 hover:text-primary-700 underline mx-1'
            >
              プライバシーポリシー
            </Link>
            に同意したものとみなされます。
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

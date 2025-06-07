// app/login/page.tsx
"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, LogIn, Lock, Eye, EyeOff } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { authAPI } from "../../lib/api";
import { useAuthStore, useUIStore } from "../../store";
import { AxiosError } from "axios";

interface ErrorResponse {
  error: string;
  code?: string;
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();
  const { addToast } = useUIStore();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      login(data.token, data.user);
      addToast({
        type: "success",
        title: "ログインしました",
        description: `ようこそ、${data.user.nickname}さん！`,
      });
      router.push("/");
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      console.error("Login error:", error);
      const errorMessage =
        error.response?.data?.error || "ログインに失敗しました";
      const errorCode = error.response?.data?.code;

      let description = "";
      switch (errorCode) {
        case "INVALID_CREDENTIALS":
          description = "メールアドレスまたはパスワードが正しくありません";
          break;
        case "USER_NOT_FOUND":
          description =
            "このメールアドレスで登録されたアカウントが見つかりません";
          break;
        case "MISSING_CREDENTIALS":
          description = "メールアドレスとパスワードを入力してください";
          break;
        default:
          description = errorMessage;
      }

      addToast({
        type: "error",
        title: "ログインに失敗しました",
        description,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      addToast({
        type: "error",
        title: "メールアドレスとパスワードを入力してください",
      });
      return;
    }

    // OpenAPI仕様に合わせてpasswordフィールドを追加
    loginMutation.mutate({
      email: formData.email.trim(),
      password: formData.password.trim(),
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-koala-50 to-koala-100 flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='max-w-md w-full space-y-10'
      >
        <div>
          <div className='text-center'>
            {/* <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className='mx-auto h-20 w-20 bg-primary-100 rounded-full flex items-center justify-center shadow-md'
            >
              <LogIn className='h-10 w-10 text-primary-600' />
            </motion.div> */}
            <h2 className='mt-8 text-center text-3xl font-bold text-koala-900 tracking-tight'>
              アカウントにログイン
            </h2>
            <p className='mt-3 text-center text-sm text-koala-600'>
              または{" "}
              <Link
                href='/register'
                className='font-medium text-primary-600 hover:text-primary-500 transition-colors duration-200'
              >
                新しいアカウントを作成
              </Link>
            </p>
          </div>
        </div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className='mt-10 space-y-6'
          onSubmit={handleSubmit}
        >
          <div className='bg-white shadow-lg rounded-2xl p-8 border border-koala-100'>
            <div className='space-y-6'>
              <div>
                <label
                  htmlFor='email'
                  className='block text-sm font-medium text-koala-700 mb-2'
                >
                  メールアドレス
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
                    className='w-full pl-10 pr-4 py-3 rounded-xl border border-koala-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 bg-white'
                    placeholder='koala@example.com'
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor='password'
                  className='block text-sm font-medium text-koala-700 mb-2'
                >
                  パスワード
                </label>
                <div className='relative'>
                  <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 text-koala-400 w-5 h-5' />
                  <input
                    id='password'
                    name='password'
                    type={showPassword ? "text" : "password"}
                    autoComplete='current-password'
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className='w-full pl-10 pr-10 py-3 rounded-xl border border-koala-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 transition-all duration-200 bg-white'
                    placeholder='••••••••'
                  />
                  <button
                    type='button'
                    onClick={() => setShowPassword(!showPassword)}
                    className='absolute right-3 top-1/2 transform -translate-y-1/2 text-koala-400 hover:text-koala-600 transition-colors duration-200'
                  >
                    {showPassword ? (
                      <EyeOff className='w-5 h-5' />
                    ) : (
                      <Eye className='w-5 h-5' />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className='mt-8'>
              <button
                type='submit'
                disabled={loginMutation.isPending}
                className='w-full bg-primary-500 text-white py-3 px-4 rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {loginMutation.isPending ? (
                  <div className='flex items-center justify-center'>
                    <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
                    ログイン中...
                  </div>
                ) : (
                  <div className='flex items-center justify-center'>
                    <LogIn className='w-5 h-5 mr-2' />
                    ログイン
                  </div>
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
            パスワードを忘れた場合は、お問い合わせからご連絡ください
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

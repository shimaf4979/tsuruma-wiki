"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Mail } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // ここで実際の送信処理を行う
    // 現在はダミー処理
    await new Promise((resolve) => setTimeout(resolve, 1000));

    alert("お問い合わせを送信しました。ありがとうございます。");
    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  const subjects = [
    "一般的な質問",
    "機能に関する要望",
    "不具合の報告",
    "記事の削除依頼",
    "その他",
  ];

  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='text-center mb-8'
        >
          <h1 className='text-3xl font-bold text-koala-900 mb-4'>
            お問い合わせ
          </h1>
          <p className='text-koala-600'>
            ご質問やご要望がございましたら、お気軽にお問い合わせください
          </p>
        </motion.div>

        {/* フォーム */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <form onSubmit={handleSubmit} className='card space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <label
                  htmlFor='name'
                  className='block text-sm font-medium text-koala-700 mb-1'
                >
                  お名前 <span className='text-red-500'>*</span>
                </label>
                <input
                  type='text'
                  id='name'
                  name='name'
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className='input w-full'
                  placeholder='山田太郎'
                />
              </div>

              <div>
                <label
                  htmlFor='email'
                  className='block text-sm font-medium text-koala-700 mb-1'
                >
                  メールアドレス <span className='text-red-500'>*</span>
                </label>
                <input
                  type='email'
                  id='email'
                  name='email'
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className='input w-full'
                  placeholder='example@email.com'
                />
              </div>
            </div>

            <div>
              <label
                htmlFor='subject'
                className='block text-sm font-medium text-koala-700 mb-1'
              >
                お問い合わせ種別 <span className='text-red-500'>*</span>
              </label>
              <select
                id='subject'
                name='subject'
                required
                value={formData.subject}
                onChange={handleChange}
                className='input w-full'
              >
                <option value=''>選択してください</option>
                {subjects.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor='message'
                className='block text-sm font-medium text-koala-700 mb-1'
              >
                お問い合わせ内容 <span className='text-red-500'>*</span>
              </label>
              <textarea
                id='message'
                name='message'
                required
                rows={6}
                value={formData.message}
                onChange={handleChange}
                className='textarea w-full'
                placeholder='お問い合わせ内容をできるだけ詳しくご記入ください'
                maxLength={2000}
              />
              <p className='text-sm text-koala-500 mt-1'>
                {formData.message.length}/2000文字
              </p>
            </div>

            <div className='bg-koala-50 p-4 rounded-lg'>
              <p className='text-sm text-koala-600'>
                <strong>注意事項:</strong>
                <br />
                • お返事には数日お時間をいただく場合があります
                <br />
                • 内容によってはお返事できない場合があります
                <br />• 緊急性の高い不具合等は、できるだけ詳細をお教えください
              </p>
            </div>

            <div className='text-center'>
              <button
                type='submit'
                disabled={isSubmitting}
                className='btn-primary w-full md:w-auto px-8 py-3'
              >
                {isSubmitting ? (
                  <div className='flex items-center justify-center'>
                    <div className='animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2'></div>
                    送信中...
                  </div>
                ) : (
                  <>
                    <Mail className='w-5 h-5 mr-2' />
                    送信する
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* 追加情報 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className='mt-8 text-center'
        >
          <p className='text-sm text-koala-500'>
            よくある質問については、
            <Link
              href='/about'
              className='text-primary-600 hover:text-primary-700 underline'
            >
              About ページ
            </Link>
            もご確認ください
          </p>
        </motion.div>
      </div>
    </div>
  );
}

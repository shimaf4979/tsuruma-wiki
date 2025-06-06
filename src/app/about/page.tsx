"use client";

import React from "react";
import { motion } from "framer-motion";
import { BookOpen, Users, Heart, Target, Shield, Mail } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
  return (
    <div className='min-h-screen bg-white'>
      <div className='max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
        {/* ヘッダー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className='text-center mb-12'
        >
          <h1 className='text-4xl font-bold text-koala-900 mb-4'>
            鶴舞こあら Wiki について
          </h1>
          <p className='text-xl text-koala-600'>
            みんなで作る鶴舞こあらの情報サイト
          </p>
        </motion.div>

        {/* ミッション */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className='mb-12'
        >
          <div className='card'>
            <div className='flex items-center mb-4'>
              <Target className='w-6 h-6 text-primary-600 mr-3' />
              <h2 className='text-2xl font-semibold text-koala-900'>
                私たちのミッション
              </h2>
            </div>
            <p className='text-koala-700 leading-relaxed'>
              鶴舞こあら Wiki
              は、鶴舞こあらに関する情報を集約し、ファンの皆さんが情報を共有・発見できるプラットフォームを提供することを目的としています。
              誰でも編集に参加でき、みんなで作り上げる Wiki を目指しています。
            </p>
          </div>
        </motion.section>

        {/* 特徴 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className='mb-12'
        >
          <h2 className='text-2xl font-semibold text-koala-900 mb-6 text-center'>
            Wiki の特徴
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <div className='card text-center'>
              <BookOpen className='w-8 h-8 text-primary-600 mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-koala-900 mb-2'>
                豊富な情報
              </h3>
              <p className='text-koala-600 text-sm'>
                プロフィール、活動履歴、楽曲情報など、鶴舞こあらに関する様々な情報を網羅
              </p>
            </div>

            <div className='card text-center'>
              <Users className='w-8 h-8 text-primary-600 mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-koala-900 mb-2'>
                コミュニティ主導
              </h3>
              <p className='text-koala-600 text-sm'>
                ファンの皆さんによる情報提供と編集で、常に最新で正確な情報を維持
              </p>
            </div>

            <div className='card text-center'>
              <Heart className='w-8 h-8 text-primary-600 mx-auto mb-4' />
              <h3 className='text-lg font-semibold text-koala-900 mb-2'>
                愛情たっぷり
              </h3>
              <p className='text-koala-600 text-sm'>
                鶴舞こあらへの愛と敬意を込めて、丁寧に情報をまとめています
              </p>
            </div>
          </div>
        </motion.section>

        {/* 参加方法 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className='mb-12'
        >
          <div className='card'>
            <h2 className='text-2xl font-semibold text-koala-900 mb-4'>
              参加方法
            </h2>
            <div className='space-y-4'>
              <div className='flex items-start space-x-3'>
                <div className='flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold'>
                  1
                </div>
                <div>
                  <h3 className='font-medium text-koala-900'>アカウント作成</h3>
                  <p className='text-koala-600 text-sm'>
                    メールアドレスとニックネームでアカウントを作成
                  </p>
                </div>
              </div>

              <div className='flex items-start space-x-3'>
                <div className='flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold'>
                  2
                </div>
                <div>
                  <h3 className='font-medium text-koala-900'>記事作成・編集</h3>
                  <p className='text-koala-600 text-sm'>
                    知っている情報を記事として投稿したり、既存記事を改善
                  </p>
                </div>
              </div>

              <div className='flex items-start space-x-3'>
                <div className='flex-shrink-0 w-6 h-6 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold'>
                  3
                </div>
                <div>
                  <h3 className='font-medium text-koala-900'>
                    コミュニティ参加
                  </h3>
                  <p className='text-koala-600 text-sm'>
                    コメントでの情報交換や他のユーザーとの交流
                  </p>
                </div>
              </div>
            </div>

            <div className='mt-6'>
              <Link href='/register' className='btn-primary'>
                今すぐ参加する
              </Link>
            </div>
          </div>
        </motion.section>

        {/* ガイドライン */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className='mb-12'
        >
          <div className='card'>
            <div className='flex items-center mb-4'>
              <Shield className='w-6 h-6 text-primary-600 mr-3' />
              <h2 className='text-2xl font-semibold text-koala-900'>
                コミュニティガイドライン
              </h2>
            </div>
            <div className='space-y-3 text-koala-700'>
              <p>• 正確で信頼できる情報の提供を心がけてください</p>
              <p>• 他のユーザーを尊重し、礼儀正しいコミュニケーションを</p>
              <p>• 著作権や肖像権を尊重し、適切な引用・出典を明記</p>
              <p>• 個人的な憶測や未確認情報は避けてください</p>
              <p>• 荒らしやスパム行為は禁止です</p>
            </div>
          </div>
        </motion.section>

        {/* お問い合わせ */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className='card text-center'>
            <Mail className='w-8 h-8 text-primary-600 mx-auto mb-4' />
            <h2 className='text-2xl font-semibold text-koala-900 mb-4'>
              お問い合わせ
            </h2>
            <p className='text-koala-600 mb-6'>
              ご質問・ご要望・不具合報告などがございましたら、お気軽にお問い合わせください。
            </p>
            <Link href='/contact' className='btn-primary'>
              お問い合わせフォーム
            </Link>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

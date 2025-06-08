"use client";

import React from "react";
import { motion } from "framer-motion";

const ToEditPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.1 }}
      className='max-w-7xl text-center mx-auto my-2 p-6 rounded-2xl font-sans'
    >
      <h2 className='text-center font-medium text-2xl mb-4 tracking-wide'>
        <span role='img' aria-label='rank'>
          🏆 編集権限 について{" "}
        </span>{" "}
        🏆
      </h2>
      <p className='text-center text-gray-500 mb-8 text-base'>
        鶴舞こあらwikiでは、みんなの活躍に合わせて4つの可愛いランクがあるよ！
      </p>
      <div className='flex justify-center mb-4'>
        <img
          src='/editRank.png'
          alt='ランク説明'
          className='w-full max-w-4xl rounded-xl shadow-md object-contain bg-white p-2'
        />
      </div>
      <p className='text-center text-gray-500 mb-8 text-base'>
        鶴舞こあらwikiでは、みんなの活躍に合わせて4つの可愛いランクがあるよ！
        <br />
        どの役割も大切な仲間です✨
      </p>
      <div className='overflow-x-auto mb-12'>
        <h3 className='font-semibold text-lg mb-3 tracking-wide'>
          独自CMSでページ編集も楽々♪
        </h3>
        <div className='flex justify-center mb-3'>
          <img
            src='/cmsUI.png'
            alt='独自CMS UI'
            className='w-full max-w-4xl rounded-xl shadow-md object-contain bg-white p-2'
          />
        </div>
        <p className='text-base text-gray-700'>
          <b className='font-semibold'>オリジナルCMS</b>で、
          <br />
          作成・編集・タグ付けも直感的にできて
          <br />
          初めての人でも安心して使えるよ！
        </p>
      </div>
      <div className='mb-12'>
        <h3 className='font-semibold text-lg mb-3 tracking-wide'>
          管理者ダッシュボードも可愛い！
        </h3>
        <div className='flex justify-center mb-3'>
          <img
            src='/dashboard.png'
            alt='管理者ダッシュボード'
            className='w-full max-w-4xl rounded-xl shadow-md object-contain bg-white p-2'
          />
        </div>
        <p className='mb-6 text-base text-gray-700'>
          <b className='font-semibold'>管理者だけが見れるダッシュボード</b>
          で、
          <br />
          サイト全体の統計やユーザー管理が可能に！
        </p>
      </div>
      <div className='bg-pink-100 rounded-xl py-6 px-4 text-center mb-4'>
        <span className='text-lg font-semibold'>🌸 ランク承認のご案内 🌸</span>
        <p className='mt-3 text-base'>
          ランクアップや編集権限の申請は、
          <br />
          <b className='font-semibold'>お問い合わせフォーム</b>または
          <a
            href='https://twitter.com/nitech_citizen'
            target='_blank'
            rel='noopener noreferrer'
            className='text-sky-500 font-semibold ml-1 hover:underline'
          >
            Twitter（@nitech_citizen）
          </a>
          までお気軽に！
          <br />
          みんなの参加をお待ちしてます✨
        </p>
      </div>
    </motion.div>
  );
};

export default ToEditPage;

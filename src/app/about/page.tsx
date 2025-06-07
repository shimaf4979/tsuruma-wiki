"use client";

import React from "react";
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <div className='min-h-screen bg-gradient-to-b from-white to-gray-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
        <div className='text-center'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.1, delay: 0.2 }}
            className='mb-12'
          >
            {/* <h1 className='text-4xl md:text-6xl font-bold text-koala-900 mb-6 tracking-tight'>
              鶴舞こあらとは
            </h1> */}
            <img
              src='/tsuruma.webp'
              alt='鶴舞こあら'
              className='h-100 block mx-auto rounded-lg mb-8 transform hover:scale-105 transition-transform duration-300'
            />
            <div className='prose prose-lg mx-auto text-koala-600'>
              <p className='text-xl md:text-2xl mb-8 font-medium'>
                このサイトについて
              </p>
              <p className='text-lg leading-relaxed max-w-3xl mx-auto'>
                鶴舞こあらの非公式Wikiサイトです。ファンの皆様と一緒に、鶴舞こあらの情報を集め、共有していくことを目的としています。
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

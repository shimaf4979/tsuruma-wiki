"use client";

import React, { Suspense } from "react";
import { YouTubeVideos } from "@/components/YouTubeVideos";
import { Video } from "lucide-react";
import { motion } from "framer-motion";
import { LoadingImages } from "@/components/ui/LoadingImages";

export default function StreamPage() {
  return (
    <div className='min-h-screen bg-white py-12'>
      <div className='max-w-5xl mx-auto px-4'>
        <h2 className='text-3xl font-bold text-gray-900 flex items-center justify-center gap-3 mb-8'>
          <Video className='w-8 h-8 text-primary-500' />

          <div className='relative text-primary-600 text-xl tracking-wider cursor-pointer inline-block'>
            最新の配信
            <motion.div
              className='absolute -bottom-2 left-0 w-full h-1 bg-primary-500 rounded-full'
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </div>
        </h2>
        <Suspense fallback={<LoadingImages />}>
          <YouTubeVideos />
        </Suspense>
      </div>
    </div>
  );
}

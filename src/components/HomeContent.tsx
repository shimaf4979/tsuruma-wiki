import React, { Suspense, useState } from "react";
import { motion } from "framer-motion";
import { Video } from "lucide-react";
import { YouTubeVideos } from "./YouTubeVideos";
import Link from "next/link";
import { LoadingImages } from "./ui/LoadingImages";

export function HomeContent() {
  const [isWiggle, setIsWiggle] = useState(false);

  return (
    <motion.div
      key='home'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.1 }}
      className='min-h-screen bg-gradient-to-b from-white to-gray-50 '
    >
      {/* ヒーローセクション */}
      <section className='relative pt-4 '>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.1, delay: 0.2 }}
              className=''
            >
              <div
                className='relative h-60 md:h-80 block mx-auto rounded-lg  overflow-hidden'
                style={{
                  backgroundImage: "url('/coala-only.jpg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <motion.img
                  src='/tsuruma.webp'
                  alt='鶴舞こあら'
                  className='h-full w-auto mx-auto relative z-10 cursor-pointer'
                  style={{ display: "block", margin: "0 auto" }}
                  animate={
                    isWiggle
                      ? {
                          y: [0, -18, 18, -12, 12, -6, 6, 0],
                        }
                      : { y: 0 }
                  }
                  transition={{
                    duration: 1.2,
                    times: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1],
                    ease: "easeInOut",
                  }}
                  onClick={() => {
                    setIsWiggle(true);
                    setTimeout(() => setIsWiggle(false), 1200);
                  }}
                />
              </div>
              <p className='text-xl md:text-2xl text-koala-600 mb-8 font-medium mt-6'>
                みんなで作る鶴舞こあらの非公式wiki
              </p>
              <div className='flex flex-col sm:flex-row gap-4 justify-center'></div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* YouTube動画セクション */}
      <section className='py-4 '>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-4'>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className='inline-block'
            >
              <Link href='/stream'>
                <h2 className='text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3'>
                  <Video className='w-8 h-8 text-primary-500' />
                  <div className='relative text-primary-600 text-xl tracking-wider cursor-pointer inline-block'>
                    最新の配信へ
                    <motion.div
                      className='absolute -bottom-2 left-0 w-full h-1 bg-primary-500 rounded-full'
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                    />
                  </div>
                </h2>
              </Link>
            </motion.div>
          </div>
          <Suspense fallback={<LoadingImages />}>
            <YouTubeVideos />
          </Suspense>
        </div>
      </section>
    </motion.div>
  );
}

import React from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
}

export const StreamList: React.FC<{ videos: Video[] }> = ({ videos }) => {
  if (videos.length === 0) {
    return (
      <div className='text-center text-gray-500 p-4'>
        動画が見つかりませんでした
      </div>
    );
  }

  return (
    <div className='relative'>
      {/* スマートフォン表示用の横スクロール */}
      <div className='md:hidden relative'>
        <div className='absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none -translate-x-4'></div>
        <div className='absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none translate-x-4'></div>
        <div className='overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide'>
          <div className='flex gap-4 w-[calc(100vw-2rem)]'>
            {videos.map((video) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                whileHover={{
                  y: -8,
                  transition: { duration: 0.2 },
                }}
                className='group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 flex-shrink-0'
                style={{ width: "280px" }}
              >
                <a
                  href={`https://www.youtube.com/watch?v=${video.id}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='block relative'
                >
                  <div className='relative pb-[56.25%] overflow-hidden'>
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title}
                      className='absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
                    />
                    <div className='absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
                      <div className='w-12 h-12 rounded-full bg-white/90 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300'>
                        <Play
                          className='w-6 h-6 text-primary-500'
                          fill='currentColor'
                        />
                      </div>
                    </div>
                  </div>
                  <div className='p-4'>
                    <h3 className='text-base font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors duration-300'>
                      {video.title}
                    </h3>
                    <p className='text-xs text-gray-500 flex items-center'>
                      <span className='inline-block w-1.5 h-1.5 bg-primary-500 rounded-full mr-1.5'></span>
                      {new Date(video.publishedAt).toLocaleDateString("ja-JP", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* タブレット・デスクトップ表示用のグリッド */}
      <div className='hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {videos.map((video) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.05 }}
            whileHover={{
              y: -8,
              transition: { duration: 0.05 },
            }}
            className='group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300'
          >
            <a
              href={`https://www.youtube.com/watch?v=${video.id}`}
              target='_blank'
              rel='noopener noreferrer'
              className='block relative'
            >
              <div className='relative pb-[56.25%] overflow-hidden'>
                <img
                  src={video.thumbnailUrl}
                  alt={video.title}
                  className='absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105'
                />
                <div className='absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center'>
                  <div className='w-16 h-16 rounded-full bg-white/90 flex items-center justify-center transform scale-0 group-hover:scale-100 transition-transform duration-300'>
                    <Play
                      className='w-8 h-8 text-primary-500'
                      fill='currentColor'
                    />
                  </div>
                </div>
              </div>
              <div className='p-5'>
                <h3 className='text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors duration-300'>
                  {video.title}
                </h3>
                <p className='text-sm text-gray-500 flex items-center'>
                  <span className='inline-block w-2 h-2 bg-primary-500 rounded-full mr-2'></span>
                  {new Date(video.publishedAt).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </a>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

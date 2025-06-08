import React, { useEffect, useState } from "react";
import { StreamList } from "@/components/StreamList";
import { motion } from "framer-motion";

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
}

const LoadingImages = () => {
  const images = [
    { letter: "D", image: "/g108.png" },
    { letter: "R", image: "/g109.png" },
    { letter: "E", image: "/g110.png" },
    { letter: "A", image: "/g111.png" },
    { letter: "M", image: "/g112.png" },
  ];

  return (
    <div className='flex justify-center items-center min-h-[200px] gap-2'>
      {images.map((item, index) => (
        <motion.div
          key={item.letter}
          animate={{
            y: [0, -20, 0],
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            delay: index * 0.1,
            ease: "easeInOut",
          }}
        >
          <img
            src={item.image}
            alt={item.letter}
            className='w-12 h-12 object-contain'
          />
        </motion.div>
      ))}
      <span className='ml-4 text-gray-500'>読み込み中...</span>
    </div>
  );
};

export function YouTubeVideos() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch("/api/youtube");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.error) {
          throw new Error(data.error);
        }
        if (!data.videos || !Array.isArray(data.videos)) {
          throw new Error("Invalid response format");
        }
        setVideos(data.videos);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "動画の取得に失敗しました";
        setError(errorMessage);
        console.error("Error fetching videos:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return <LoadingImages />;
  }

  if (error) {
    return (
      <div className='text-center text-red-500 p-4'>
        <p className='font-semibold mb-2'>エラーが発生しました</p>
        <p className='text-sm'>{error}</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className='text-center text-gray-500 p-4'>
        動画が見つかりませんでした
      </div>
    );
  }

  return <StreamList videos={videos} />;
}

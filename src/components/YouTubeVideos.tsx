import React, { useEffect, useState } from "react";
import { StreamList } from "@/components/StreamList";
import { LoadingImages } from "./ui/LoadingImages";

interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
}

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
        <p className='font-medium mb-2'>エラーが発生しました</p>
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

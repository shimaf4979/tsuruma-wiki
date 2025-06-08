import { google } from "googleapis";
import { NextResponse } from "next/server";

const youtube = google.youtube("v3");

// キャッシュの設定
export const revalidate = 3600; // 1時間に延長

export async function GET() {
  try {
    const response = await youtube.search.list({
      key: process.env.YOUTUBE_API_KEY,
      channelId: "UCK87kJ7mnqAjVZGPMx_xHsw", // 鶴舞こあらのチャンネルID
      part: ["snippet"],
      order: "date",
      maxResults: 20,
      type: ["video"],
    });

    if (!response.data.items) {
      return NextResponse.json({ videos: [] });
    }

    const videos = response.data.items.map((item) => ({
      id: item.id?.videoId,
      title: item.snippet?.title,
      description: item.snippet?.description,
      thumbnailUrl: item.snippet?.thumbnails?.high?.url,
      publishedAt: item.snippet?.publishedAt,
    }));

    return NextResponse.json({ videos });
  } catch (error: unknown) {
    const errorObject = error as { code?: number; message?: string };
    console.error("YouTube API Error:", error);

    // クォータ制限エラーの場合
    if (errorObject.code === 403 && errorObject.message?.includes("quota")) {
      return NextResponse.json(
        {
          error:
            "YouTube APIのクォータ制限に達しました。しばらく時間をおいて再度お試しください。",
        },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "動画の取得に失敗しました" },
      { status: 500 }
    );
  }
}

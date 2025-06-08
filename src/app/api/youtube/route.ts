import { google } from "googleapis";
import { NextResponse } from "next/server";

const youtube = google.youtube("v3");

export async function GET() {
  try {
    const response = await youtube.search.list({
      key: process.env.YOUTUBE_API_KEY,
      channelId: "UCK87kJ7mnqAjVZGPMx_xHsw", // 鶴舞こあらのチャンネルID
      part: ["snippet"],
      order: "date",
      maxResults: 50,
      type: ["video"],
    });

    const videos = response.data.items?.map((item) => ({
      id: item.id?.videoId,
      title: item.snippet?.title,
      description: item.snippet?.description,
      thumbnailUrl: item.snippet?.thumbnails?.high?.url,
      publishedAt: item.snippet?.publishedAt,
    }));

    return NextResponse.json({ videos });
  } catch (error) {
    console.error("YouTube API Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch videos" },
      { status: 500 }
    );
  }
}

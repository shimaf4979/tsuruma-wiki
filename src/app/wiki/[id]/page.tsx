import { wikiAPI } from "../../../lib/api";
import { WikiPageClient } from "./WikiPageClient";
import { Metadata } from "next";

export const revalidate = 3600; // 1時間ごとに再生成

export async function generateStaticParams() {
  try {
    const { pages } = await wikiAPI.getPages({
      status: "published",
      limit: 1000,
    });
    return pages.map((page) => ({
      id: page.id.toString(),
    }));
  } catch (error) {
    console.error("Failed to generate static params:", error);
    return [];
  }
}

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const pageId = resolvedParams.id;
  try {
    const page = await wikiAPI.getPage(pageId);
    return {
      title: `${page.title} - TsurumaKoala Wiki`,
      description: page.content.replace(/<[^>]+>/g, "").slice(0, 150) + "...",
      openGraph: {
        title: page.title,
        description: page.content.replace(/<[^>]+>/g, "").slice(0, 150) + "...",
        type: "article",
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/wiki/${page.id}`,
        images: [
          {
            url: page.thumbnailUrl || "/home.png",
            width: 1200,
            height: 630,
            alt: page.title,
          },
        ],
      },
    };
  } catch (error) {
    console.error(`Failed to generate metadata for page ${pageId}:`, error);
    return {
      title: "ページが見つかりません",
    };
  }
}

export default async function WikiPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <WikiPageClient pageId={resolvedParams.id} />;
}

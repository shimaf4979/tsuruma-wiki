import { wikiAPI } from "../../../lib/api";
import { EditPageClient } from "./EditPageClient";
import { Metadata } from "next";

export async function generateStaticParams() {
  try {
    const { pages } = await wikiAPI.getPages({ limit: 1000 });
    return pages.map((page) => ({
      id: page.id.toString(),
    }));
  } catch (error) {
    console.error("Failed to generate static params for editor:", error);
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
      title: `編集中: ${page.title} - TsurumaKoala Wiki`,
      description: `「${page.title}」を編集中です。`,
      robots: {
        index: false,
        follow: false,
      },
    };
  } catch (error) {
    console.error(
      `Failed to generate metadata for editor page ${pageId}:`,
      error
    );
    return {
      title: "記事の編集",
    };
  }
}

export default async function EditPage({ params }: PageProps) {
  const resolvedParams = await params;
  return <EditPageClient pageId={resolvedParams.id} />;
}

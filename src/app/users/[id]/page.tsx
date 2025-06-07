import { adminAPI, userAPI } from "../../../lib/api";
import { UserPageClient } from "./UserPageClient";
import { Metadata } from "next";

export const revalidate = 3600;

type UserForStaticGen = {
  id: string;
};

// 必要なパスを事前に定義
const REQUIRED_PATHS = [{ id: "admin-001" }, { id: "contributor-001" }];

export async function generateStaticParams() {
  try {
    const { users } = await adminAPI.getUsers({ limit: 1000 });
    const apiPaths = (users as UserForStaticGen[]).map((user) => ({
      id: user.id.toString(),
    }));
    // 必要なパスとAPIから取得したパスを結合
    return [...REQUIRED_PATHS, ...apiPaths];
  } catch (error) {
    console.error("Failed to generate static params for users:", error);
    // APIからの取得に失敗した場合は、必要なパスのみを返す
    return REQUIRED_PATHS;
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
  const userId = resolvedParams.id;
  try {
    const user = await userAPI.getUser(userId);
    return {
      title: `${user.nickname}のプロフィール - TsurumaKoala Wiki`,
      description: `${user.nickname}さんのプロフィールページです。投稿したページ一覧などを確認できます。`,
      openGraph: {
        title: `${user.nickname}のプロフィール`,
        description:
          user.bio || `${user.nickname}さんのプロフィールページです。`,
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/users/${user.id}`,
        images: [
          {
            url: user.avatarUrl || "/g112.png",
            width: 1200,
            height: 630,
            alt: user.nickname,
          },
        ],
      },
    };
  } catch (error) {
    console.error(`Failed to generate metadata for user ${userId}:`, error);
    return {
      title: "ユーザーが見つかりません",
    };
  }
}

export default async function UserProfilePage({ params }: PageProps) {
  const resolvedParams = await params;
  return <UserPageClient userId={resolvedParams.id} />;
}

/** @type {import('next').NextConfig} */
import { NextConfig } from "next";
import { Configuration as WebpackConfiguration } from "webpack";

const nextConfig: NextConfig = {
  // Cloudflare Pages用の設定
  output: "export",
  trailingSlash: true,
  skipTrailingSlashRedirect: true,
  distDir: "out",

  // 画像最適化をCloudflareに委任
  images: {
    unoptimized: true,
  },

  // 静的ファイルの設定
  assetPrefix: process.env.NODE_ENV === "production" ? "/" : "",

  // 環境変数の設定
  env: {
    NEXT_PUBLIC_API_URL:
      process.env.NEXT_PUBLIC_API_URL ||
      "https://tsuruma-koala-wiki.shimayuu3412.workers.dev",
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL || "https://tsuruma-coala-wiki.com",
  },

  // ESLint設定
  eslint: {
    ignoreDuringBuilds: false,
  },

  // TypeScript設定
  typescript: {
    ignoreBuildErrors: false,
  },

  // 実験的機能
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },
};

// ビルド時にのみWebpackの設定を適用する
if (process.env.npm_lifecycle_event === "build") {
  nextConfig.webpack = (config: WebpackConfiguration) => {
    // パフォーマンス最適化
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
        },
      },
    };

    return config;
  };
}

module.exports = nextConfig;

#!/bin/bash

# Cloudflare Pages用ビルドスクリプト

echo "🚀 Starting build for Cloudflare Pages..."

# Node.jsバージョンの確認
echo "📋 Node.js version: $(node --version)"
echo "📋 npm version: $(npm --version)"

# 依存関係のインストール
echo "📦 Installing dependencies..."
npm ci

# 環境変数の確認
echo "🔧 Environment variables:"
echo "NODE_ENV: $NODE_ENV"
echo "CF_PAGES: $CF_PAGES"
echo "CF_PAGES_COMMIT_SHA: $CF_PAGES_COMMIT_SHA"
echo "CF_PAGES_BRANCH: $CF_PAGES_BRANCH"

# 本番環境変数の設定
if [ "$CF_PAGES_BRANCH" = "main" ]; then
  echo "🌟 Production build"
  export NEXT_PUBLIC_API_URL="https://tsuruma-koala-wiki.shimayuu3412.workers.dev"
  export NEXT_PUBLIC_APP_URL="https://tsuruma-coala-wiki.dev"
else
  echo "🧪 Preview build"
  export NEXT_PUBLIC_API_URL="https://tsuruma-koala-wiki.shimayuu3412.workers.dev"
  export NEXT_PUBLIC_APP_URL="https://tsuruma-coala-wiki.dev"
fi

# リントチェック
echo "🔍 Running ESLint..."
npm run lint

# ビルド実行
echo "🏗️ Building Next.js application..."
npm run build

# ビルド結果の確認
if [ -d "out" ]; then
  echo "✅ Build successful! Output directory 'out' created."
  echo "📊 Build statistics:"
  du -sh out/
  find out -name "*.html" | wc -l | xargs echo "HTML files:"
  find out -name "*.js" | wc -l | xargs echo "JS files:"
  find out -name "*.css" | wc -l | xargs echo "CSS files:"
else
  echo "❌ Build failed! Output directory 'out' not found."
  exit 1
fi

echo "🎉 Build completed successfully!"
#!/bin/bash

# プロジェクトルート


# public
mkdir -p public
touch public/favicon.ico
touch public/g108.png
touch public/g109.png
touch public/g110.png
touch public/g111.png
touch public/g112.png
touch public/o.png

# config and metadata files
touch tailwind.config.js
touch .env.example

cd src

# app ディレクトリとファイル
mkdir -p app/{login,register,pages,editor,about,contact,wiki/[id]}
touch app/layout.tsx
touch app/page.tsx
touch app/globals.css
touch app/login/page.tsx
touch app/register/page.tsx
touch app/pages/page.tsx
touch app/wiki/[id]/page.tsx
touch app/editor/page.tsx
touch app/about/page.tsx
touch app/contact/page.tsx

# components
mkdir -p components/{layout,ui,editor,wiki}
touch components/layout/Navbar.tsx
touch components/layout/Sidebar.tsx
touch components/ui/ToastContainer.tsx
touch components/ui/ModalContainer.tsx
touch components/ui/SearchModal.tsx
touch components/editor/TiptapEditor.tsx
touch components/wiki/CommentSection.tsx

# hooks
mkdir -p hooks
touch hooks/useQueries.ts

# lib
mkdir -p lib
touch lib/api.ts

# store
mkdir -p store
touch store/index.ts

# types
mkdir -p types
touch types/index.ts

# utils
mkdir -p utils
touch utils/index.ts


echo "tsuruma-koala-wiki プロジェクト構造を作成しました。"

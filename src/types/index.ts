// ユーザー関連の型
export interface User {
  id: string;
  nickname: string;
  email: string;
  role: "contributor" | "editor" | "moderator" | "admin";
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
  updatedAt?: string;
  pageCount?: number;
  commentCount?: number;
}

export interface PublicUser {
  id: string;
  nickname: string;
  role: "contributor" | "editor" | "moderator" | "admin";
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
}

// 認証関連の型
export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
}

export interface RegisterRequest {
  nickname: string;
  email: string;
}

// Wiki記事関連の型
export interface WikiPage {
  id: string;
  title: string;
  content: string;
  authorId: string;
  author: PublicUser;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  status: "published" | "draft" | "archived";
  viewCount: number;
  thumbnailUrl?: string;
}

export interface WikiPageCreate {
  title: string;
  content: string;
  tags?: string[];
}

export interface WikiPageUpdate {
  title?: string;
  content?: string;
  tags?: string[];
}

// コメント関連の型
export interface Comment {
  id: string;
  pageId: string;
  authorId: string;
  author: PublicUser;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CommentCreate {
  pageId: string;
  content: string;
}

// 編集履歴の型
export interface EditHistory {
  id: string;
  pageId: string;
  editorId: string;
  editor: PublicUser;
  titleBefore?: string;
  titleAfter?: string;
  contentBefore?: string;
  contentAfter?: string;
  editedAt: string;
}

// 検索関連の型
export interface SearchResult {
  pages?: WikiPage[];
  users?: PublicUser[];
}

export interface Tag {
  tag: string;
  count: number;
}

// アップロード関連の型
export interface UploadResponse {
  message: string;
  url: string;
  fileName: string;
  size: number;
}

export interface UploadHistory {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedAt: string;
}

// 管理者関連の型
export interface AdminStats {
  totalUsers: number;
  totalPages: number;
  totalComments: number;
  totalViews: number;
  newUsersThisMonth: number;
  newPagesThisMonth: number;
  viewsThisWeek: number;
  commentsThisWeek: number;
  topPages: Array<{
    id: string;
    title: string;
    viewCount: number;
  }>;
}

export interface AdminLog {
  id: string;
  adminId: string;
  adminNickname: string;
  action: string;
  targetType: string;
  targetId: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
}

export interface Log {
  id: string;
  action: string;
  adminId: string;
  adminNickname: string;
  targetId: string;
  targetType: string;
  oldValue?: string;
  newValue?: string;
  createdAt: string;
}

// API レスポンス関連の型
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  code?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  hasMore: boolean;
}

// UI状態関連の型
export interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
  duration?: number;
}

export interface Modal {
  id: string;
  type: "confirm" | "form" | "info";
  title: string;
  content: React.ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface RegisterRequest {
  nickname: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

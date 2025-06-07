import axios from "axios";
import {
  AuthResponse,
  User,
  WikiPage,
  WikiPageCreate,
  WikiPageUpdate,
  Comment,
  CommentCreate,
  SearchResult,
  Tag,
  UploadResponse,
  AdminStats,
} from "../types";

// API ベースURL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://tsuruma-koala-wiki.shimayuu3412.workers.dev";

// Axios インスタンスの作成
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// リクエストインターセプター（認証トークンの自動付与）
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth-storage");
    if (token) {
      try {
        const parsed = JSON.parse(token);
        if (parsed.state?.token) {
          config.headers.Authorization = `Bearer ${parsed.state.token}`;
        }
      } catch (error) {
        console.error("Token parsing error:", error);
      }
    }
  }
  return config;
});

// レスポンスインターセプター（エラーハンドリング）
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // エラーをそのまま返す（リダイレクトを削除）
    return Promise.reject(error);
  }
);

// サーバーサイドでのビルド時など、特殊な状況で使用する管理者用APIクライアント
// 環境変数 `ADMIN_API_TOKEN` に設定されたトークンを使用します。
const serverAdminApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.ADMIN_API_TOKEN}`,
  },
});

// APIクライアント関数群

// ユーザー関連
export const userAPI = {
  getMe: async (): Promise<User> => {
    const response = await api.get<{ user: User }>("/api/users/me");
    const userData = response.data.user;
    return {
      id: userData.id,
      nickname: userData.nickname,
      email: userData.email,
      role: userData.role,
      avatarUrl: userData.avatarUrl,
      bio: userData.bio,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
    };
  },

  updateMe: async (data: Partial<User>): Promise<void> => {
    await api.put("/api/users/me", data);
  },

  getUser: async (userId: string): Promise<User> => {
    const response = await api.get<{ user: User }>(`/api/users/${userId}`);
    return response.data.user;
  },

  getUserPages: async (
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<WikiPage[]> => {
    const response = await api.get<{ pages: WikiPage[] }>(
      `/api/users/${userId}/pages`,
      {
        params: { limit, offset },
      }
    );
    return response.data.pages;
  },
};

// Wikiページ関連
export const wikiAPI = {
  getPages: async (params?: {
    status?: "published" | "draft";
    search?: string;
    tag?: string;
    author?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ pages: WikiPage[]; total: number; hasMore: boolean }> => {
    const response = await api.get("/api/wiki", { params });
    return response.data;
  },

  getPopularPages: async (limit = 10): Promise<WikiPage[]> => {
    const response = await api.get<{ pages: WikiPage[] }>("/api/wiki/popular", {
      params: { limit },
    });
    return response.data.pages;
  },

  getPage: async (pageId: string): Promise<WikiPage> => {
    const response = await api.get<{ page: WikiPage }>(`/api/wiki/${pageId}`);
    return response.data.page;
  },

  createPage: async (
    data: WikiPageCreate
  ): Promise<{ id: string; status: string }> => {
    const response = await api.post("/api/wiki", data);
    return response.data;
  },

  updatePage: async (pageId: string, data: WikiPageUpdate): Promise<void> => {
    await api.put(`/api/wiki/${pageId}`, data);
  },

  deletePage: async (pageId: string): Promise<void> => {
    await api.delete(`/api/wiki/${pageId}`);
  },

  approvePage: async (pageId: string): Promise<void> => {
    await api.post(`/api/wiki/${pageId}/approve`);
  },

  getPageHistory: async (pageId: string) => {
    const response = await api.get(`/api/wiki/${pageId}/history`);
    return response.data.history;
  },
};

// コメント関連
export const commentAPI = {
  createComment: async (data: CommentCreate): Promise<{ id: string }> => {
    const response = await api.post("/api/comments", data);
    return response.data;
  },

  getPageComments: async (pageId: string): Promise<Comment[]> => {
    const response = await api.get<{ comments: Comment[] }>(
      `/api/comments/page/${pageId}`
    );
    return response.data.comments;
  },

  updateComment: async (commentId: string, content: string): Promise<void> => {
    await api.put(`/api/comments/${commentId}`, { content });
  },

  deleteComment: async (commentId: string): Promise<void> => {
    await api.delete(`/api/comments/${commentId}`);
  },

  getUserComments: async (userId: string, limit = 20, offset = 0) => {
    const response = await api.get(`/api/comments/user/${userId}`, {
      params: { limit, offset },
    });
    return response.data.comments;
  },
};

// 検索関連
export const searchAPI = {
  search: async (
    query: string,
    type: "all" | "pages" | "users" = "all",
    limit = 20
  ): Promise<SearchResult> => {
    const response = await api.get<SearchResult>("/api/search", {
      params: { q: query, type, limit },
    });
    return response.data;
  },

  getTags: async (limit = 20): Promise<Tag[]> => {
    const response = await api.get<{ tags: Tag[] }>("/api/search/tags", {
      params: { limit },
    });
    return response.data.tags;
  },

  getSuggestions: async (query: string, limit = 5): Promise<string[]> => {
    const response = await api.get<{ suggestions: string[] }>(
      "/api/search/suggestions",
      {
        params: { q: query, limit },
      }
    );
    return response.data.suggestions;
  },
};

// アップロード関連
export const uploadAPI = {
  uploadImage: async (file: File): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await api.post<UploadResponse>(
      "/api/upload/image",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  getUploadHistory: async (limit = 20, offset = 0) => {
    const response = await api.get("/api/upload/history", {
      params: { limit, offset },
    });
    return response.data.uploads;
  },

  deleteFile: async (fileName: string): Promise<void> => {
    await api.delete(`/api/upload/${fileName}`);
  },
};

// 管理者関連
export const adminAPI = {
  getUsers: async (params?: {
    role?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) => {
    // サーバーサイドでのビルド時には ADMIN_API_TOKEN を使用する
    const client =
      typeof window === "undefined" && process.env.ADMIN_API_TOKEN
        ? serverAdminApi
        : api;
    const response = await client.get("/api/admin/users", { params });
    return response.data;
  },

  changeUserRole: async (userId: string, role: string): Promise<void> => {
    await api.put(`/api/admin/users/${userId}/role`, { role });
  },

  getPendingPages: async (limit = 20, offset = 0) => {
    const response = await api.get("/api/admin/pages/pending", {
      params: { limit, offset },
    });
    return response.data.pages;
  },

  getStats: async (): Promise<AdminStats> => {
    const response = await api.get<AdminStats>("/api/admin/stats");
    return response.data;
  },

  getSettings: async () => {
    const response = await api.get("/api/admin/settings");
    return response.data.settings;
  },

  updateSettings: async (settings: Record<string, string>): Promise<void> => {
    await api.put("/api/admin/settings", settings);
  },

  getLogs: async (params?: {
    action?: string;
    limit?: number;
    offset?: number;
  }) => {
    const response = await api.get("/api/admin/logs", { params });
    return response.data.logs;
  },
};

export default api;

export const authAPI = {
  register: async (data: {
    nickname: string;
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/api/auth/register", data);
    return response.data;
  },

  login: async (data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>("/api/auth/login", data);
    return response.data;
  },

  verify: async (): Promise<{ valid: boolean; user?: User }> => {
    const response = await api.get("/api/auth/verify");
    return response.data;
  },
};

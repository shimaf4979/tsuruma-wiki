"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { wikiAPI, userAPI, commentAPI, searchAPI, authAPI } from "../lib/api";
import { useAuthStore, useUIStore } from "../store";

// 認証関連のフック
export function useAuth() {
  const { user, isAuthenticated, login, logout } = useAuthStore();
  const { addToast } = useUIStore();

  const loginMutation = useMutation({
    mutationFn: authAPI.login,
    onSuccess: (data) => {
      login(data.token, data.user);
      addToast({
        type: "success",
        title: "ログインしました",
        description: `ようこそ、${data.user.nickname}さん！`,
      });
    },
    onError: (error: { response?: { data?: { error?: string } } }) => {
      addToast({
        type: "error",
        title: "ログインに失敗しました",
        description: error.response?.data?.error || "エラーが発生しました",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: authAPI.register,
    onSuccess: (data) => {
      login(data.token, data.user);
      addToast({
        type: "success",
        title: "アカウントを作成しました",
        description: `ようこそ、${data.user.nickname}さん！`,
      });
    },
    onError: (error: any) => {
      addToast({
        type: "error",
        title: "登録に失敗しました",
        description: error.response?.data?.error || "エラーが発生しました",
      });
    },
  });

  return {
    user,
    isAuthenticated,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout,
    isLoginLoading: loginMutation.isPending,
    isRegisterLoading: registerMutation.isPending,
  };
}

// Wiki記事関連のフック
export function useWikiPages(params?: {
  search?: string;
  tag?: string;
  author?: string;
  limit?: number;
  offset?: number;
}) {
  return useQuery({
    queryKey: ["wikiPages", params],
    queryFn: () => wikiAPI.getPages(params),
    staleTime: 5 * 60 * 1000, // 5分
  });
}

export function useWikiPage(pageId: string) {
  return useQuery({
    queryKey: ["wikiPage", pageId],
    queryFn: () => wikiAPI.getPage(pageId),
    enabled: !!pageId,
    retry: 1,
  });
}

export function usePopularPages(limit = 10) {
  return useQuery({
    queryKey: ["popularPages", limit],
    queryFn: () => wikiAPI.getPopularPages(limit),
    staleTime: 10 * 60 * 1000, // 10分
  });
}

export function useCreatePage() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: wikiAPI.createPage,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["wikiPages"] });
      addToast({
        type: "success",
        title: "記事を作成しました",
        description:
          data.status === "published" ? "記事が公開されました" : "承認待ちです",
      });
    },
    onError: (error: any) => {
      addToast({
        type: "error",
        title: "記事の作成に失敗しました",
        description: error.response?.data?.error || "エラーが発生しました",
      });
    },
  });
}

export function useUpdatePage(pageId: string) {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: (data: any) => wikiAPI.updatePage(pageId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wikiPage", pageId] });
      queryClient.invalidateQueries({ queryKey: ["wikiPages"] });
      addToast({
        type: "success",
        title: "記事を更新しました",
      });
    },
    onError: (error: any) => {
      addToast({
        type: "error",
        title: "記事の更新に失敗しました",
        description: error.response?.data?.error || "エラーが発生しました",
      });
    },
  });
}

export function useDeletePage(pageId: string) {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: () => wikiAPI.deletePage(pageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wikiPages"] });
      queryClient.removeQueries({ queryKey: ["wikiPage", pageId] });
      addToast({
        type: "success",
        title: "記事を削除しました",
      });
    },
    onError: (error: any) => {
      addToast({
        type: "error",
        title: "記事の削除に失敗しました",
        description: error.response?.data?.error || "エラーが発生しました",
      });
    },
  });
}

// コメント関連のフック
export function usePageComments(pageId: string) {
  return useQuery({
    queryKey: ["comments", pageId],
    queryFn: () => commentAPI.getPageComments(pageId),
    enabled: !!pageId,
    staleTime: 2 * 60 * 1000, // 2分
  });
}

export function useCreateComment() {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: commentAPI.createComment,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["comments", variables.pageId],
      });
      addToast({
        type: "success",
        title: "コメントを投稿しました",
      });
    },
    onError: (error: any) => {
      addToast({
        type: "error",
        title: "コメントの投稿に失敗しました",
        description: error.response?.data?.error || "エラーが発生しました",
      });
    },
  });
}

export function useUpdateComment(pageId: string) {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: ({
      commentId,
      content,
    }: {
      commentId: string;
      content: string;
    }) => commentAPI.updateComment(commentId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", pageId] });
      addToast({
        type: "success",
        title: "コメントを更新しました",
      });
    },
    onError: (error: any) => {
      addToast({
        type: "error",
        title: "コメントの更新に失敗しました",
        description: error.response?.data?.error || "エラーが発生しました",
      });
    },
  });
}

export function useDeleteComment(pageId: string) {
  const queryClient = useQueryClient();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: commentAPI.deleteComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", pageId] });
      addToast({
        type: "success",
        title: "コメントを削除しました",
      });
    },
    onError: (error: any) => {
      addToast({
        type: "error",
        title: "コメントの削除に失敗しました",
        description: error.response?.data?.error || "エラーが発生しました",
      });
    },
  });
}

// ユーザー関連のフック
export function useUser(userId: string) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => userAPI.getUser(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5分
  });
}

export function useUserPages(userId: string, limit = 20, offset = 0) {
  return useQuery({
    queryKey: ["userPages", userId, limit, offset],
    queryFn: () => userAPI.getUserPages(userId, limit, offset),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5分
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { updateUser } = useAuthStore();
  const { addToast } = useUIStore();

  return useMutation({
    mutationFn: userAPI.updateMe,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
      updateUser(variables);
      addToast({
        type: "success",
        title: "プロフィールを更新しました",
      });
    },
    onError: (error: any) => {
      addToast({
        type: "error",
        title: "プロフィールの更新に失敗しました",
        description: error.response?.data?.error || "エラーが発生しました",
      });
    },
  });
}

// 検索関連のフック
export function useSearch(
  query: string,
  type: "all" | "pages" | "users" = "all"
) {
  return useQuery({
    queryKey: ["search", query, type],
    queryFn: () => searchAPI.search(query, type),
    enabled: query.length > 2,
    staleTime: 2 * 60 * 1000, // 2分
  });
}

export function useSearchSuggestions(query: string) {
  return useQuery({
    queryKey: ["searchSuggestions", query],
    queryFn: () => searchAPI.getSuggestions(query),
    enabled: query.length > 0,
    staleTime: 5 * 60 * 1000, // 5分
  });
}

export function usePopularTags(limit = 20) {
  return useQuery({
    queryKey: ["popularTags", limit],
    queryFn: () => searchAPI.getTags(limit),
    staleTime: 15 * 60 * 1000, // 15分
  });
}

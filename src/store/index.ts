import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, ToastMessage, Modal } from "../types";

// 認証ストア
interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setInitialized: (initialized: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (token, user) =>
        set({
          token,
          user,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        }),
      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },
      setInitialized: (initialized) => set({ isInitialized: initialized }),
      isInitialized: false,
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isInitialized: state.isInitialized,
      }),
      onRehydrateStorage: () => (state) => {
        // ストレージからの復元完了時に初期化フラグを設定
        if (state) {
          state.setInitialized(true);
        }
      },
    }
  )
);

// UI ストア
interface UIStore {
  sidebarOpen: boolean;
  theme: "light" | "dark";
  showNavbar: boolean;
  toasts: ToastMessage[];
  modals: Modal[];
  loading: Record<string, boolean>;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setTheme: (theme: "light" | "dark") => void;
  setShowNavbar: (show: boolean) => void;
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
  openModal: (modal: Omit<Modal, "id">) => void;
  closeModal: (id: string) => void;
  closeAllModals: () => void;
  setLoading: (key: string, loading: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set, get) => ({
      sidebarOpen: false,
      theme: "light",
      showNavbar: false,
      toasts: [],
      modals: [],
      loading: {},
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () =>
        set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setTheme: (theme) => set({ theme }),
      setShowNavbar: (show) => set({ showNavbar: show }),
      addToast: (toast) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newToast = { ...toast, id };
        set((state) => ({ toasts: [...state.toasts, newToast] }));

        // 自動削除
        setTimeout(() => {
          get().removeToast(id);
        }, toast.duration || 5000);
      },
      removeToast: (id) =>
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        })),
      openModal: (modal) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newModal = { ...modal, id };
        set((state) => ({ modals: [...state.modals, newModal] }));
      },
      closeModal: (id) =>
        set((state) => ({
          modals: state.modals.filter((m) => m.id !== id),
        })),
      closeAllModals: () => set({ modals: [] }),
      setLoading: (key, loading) =>
        set((state) => ({
          loading: { ...state.loading, [key]: loading },
        })),
    }),
    {
      name: "ui-storage",
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);

// エディターストア（下書き保存用）
interface EditorStore {
  drafts: Record<
    string,
    { title: string; content: string; tags: string[]; updatedAt: string }
  >;
  currentDraft: { title: string; content: string; tags: string[] } | null;
  saveDraft: (
    key: string,
    title: string,
    content: string,
    tags: string[]
  ) => void;
  loadDraft: (key: string) => void;
  deleteDraft: (key: string) => void;
  clearCurrentDraft: () => void;
  setCurrentDraft: (draft: {
    title: string;
    content: string;
    tags: string[];
  }) => void;
}

export const useEditorStore = create<EditorStore>()(
  persist(
    (set, get) => ({
      drafts: {},
      currentDraft: null,
      saveDraft: (key, title, content, tags) => {
        const draft = {
          title,
          content,
          tags,
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          drafts: { ...state.drafts, [key]: draft },
        }));
      },
      loadDraft: (key) => {
        const draft = get().drafts[key];
        if (draft) {
          set({ currentDraft: draft });
        }
      },
      deleteDraft: (key) => {
        set((state) => {
          const newDrafts = { ...state.drafts };
          delete newDrafts[key];
          return { drafts: newDrafts };
        });
      },
      clearCurrentDraft: () => set({ currentDraft: null }),
      setCurrentDraft: (draft) => set({ currentDraft: draft }),
    }),
    {
      name: "editor-storage",
    }
  )
);

// 検索ストア
interface SearchStore {
  recentSearches: string[];
  searchFilters: {
    tags: string[];
    author: string | null;
    status: "all" | "published" | "draft";
  };
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  setSearchFilters: (filters: Partial<SearchStore["searchFilters"]>) => void;
  resetSearchFilters: () => void;
}

export const useSearchStore = create<SearchStore>()(
  persist(
    (set) => ({
      recentSearches: [],
      searchFilters: {
        tags: [],
        author: null,
        status: "published",
      },
      addRecentSearch: (query) => {
        set((state) => {
          const filtered = state.recentSearches.filter((s) => s !== query);
          return {
            recentSearches: [query, ...filtered].slice(0, 10), // 最大10件
          };
        });
      },
      clearRecentSearches: () => set({ recentSearches: [] }),
      setSearchFilters: (filters) =>
        set((state) => ({
          searchFilters: { ...state.searchFilters, ...filters },
        })),
      resetSearchFilters: () =>
        set({
          searchFilters: {
            tags: [],
            author: null,
            status: "published",
          },
        }),
    }),
    {
      name: "search-storage",
    }
  )
);

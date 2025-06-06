import { clsx, type ClassValue } from "clsx";

// クラス名の結合
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

// 日付フォーマット
export function formatDate(date: string | Date, locale = "ja-JP"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale);
}

export function formatDateTime(date: string | Date, locale = "ja-JP"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString(locale);
}

export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "今すぐ";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}分前`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}時間前`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}日前`;
  } else {
    return formatDate(d);
  }
}

// 文字列操作
export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function extractPlainText(html: string): string {
  // HTMLタグを除去してプレーンテキストを抽出
  return html.replace(/<[^>]*>/g, "").trim();
}

export function highlightSearchTerm(text: string, searchTerm: string): string {
  if (!searchTerm) return text;

  const regex = new RegExp(`(${searchTerm})`, "gi");
  return text.replace(regex, "<mark>$1</mark>");
}

// バリデーション
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidNickname(nickname: string): boolean {
  // 1-20文字、日本語・英数字・スペースのみ
  const nicknameRegex =
    /^[a-zA-Z0-9\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\s]{1,20}$/;
  return nicknameRegex.test(nickname);
}

export function isValidTag(tag: string): boolean {
  // 1-20文字、空白の先頭末尾なし
  return (
    tag.trim().length >= 1 && tag.trim().length <= 20 && tag === tag.trim()
  );
}

// ファイル操作
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export function getFileExtension(filename: string): string {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2);
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith("image/");
}

export function validateImageFile(
  file: File,
  maxSize = 5 * 1024 * 1024
): {
  valid: boolean;
  error?: string;
} {
  if (!isImageFile(file)) {
    return {
      valid: false,
      error: "画像ファイルを選択してください",
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `ファイルサイズは${formatFileSize(maxSize)}以下にしてください`,
    };
  }

  return { valid: true };
}

// URL操作
export function buildUrl(
  base: string,
  params: Record<string, string | number | boolean | undefined>
): string {
  const url = new URL(base, window.location.origin);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

export function parseQueryParams(search: string): Record<string, string> {
  const params = new URLSearchParams(search);
  const result: Record<string, string> = {};

  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
}

// 配列操作
export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

export function groupBy<T, K extends keyof T>(
  array: T[],
  key: (item: T) => K
): Record<K, T[]> {
  return array.reduce((groups, item) => {
    const group = key(item);
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {} as Record<K, T[]>);
}

export function sortBy<T>(
  array: T[],
  key: keyof T,
  direction: "asc" | "desc" = "asc"
): T[] {
  return [...array].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];

    if (aValue < bValue) return direction === "asc" ? -1 : 1;
    if (aValue > bValue) return direction === "asc" ? 1 : -1;
    return 0;
  });
}

// デバウンス・スロットル
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// エラーハンドリング
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  if (error && typeof error === "object" && "message" in error) {
    return String(error.message);
  }
  return "不明なエラーが発生しました";
}

export function isNetworkError(error: unknown): boolean {
  return (
    error instanceof Error &&
    (error.message.includes("Network Error") || error.message.includes("fetch"))
  );
}

// ローカルストレージ
export function safeLocalStorage() {
  const isClient = typeof window !== "undefined";

  return {
    getItem: (key: string) => {
      if (!isClient) return null;
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem: (key: string, value: string) => {
      if (!isClient) return;
      try {
        localStorage.setItem(key, value);
      } catch {
        // ストレージが無効な場合は何もしない
      }
    },
    removeItem: (key: string) => {
      if (!isClient) return;
      try {
        localStorage.removeItem(key);
      } catch {
        // ストレージが無効な場合は何もしない
      }
    },
  };
}

// 色関連
export function getRandomColor(): string {
  const colors = [
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#eab308",
    "#84cc16",
    "#22c55e",
    "#10b981",
    "#14b8a6",
    "#06b6d4",
    "#0ea5e9",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#d946ef",
    "#ec4899",
    "#f43f5e",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function hexToRgb(
  hex: string
): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// デバイス検出
export function isMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth < 768;
}

export function isTablet(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= 768 && window.innerWidth < 1024;
}

export function isDesktop(): boolean {
  if (typeof window === "undefined") return false;
  return window.innerWidth >= 1024;
}

// パフォーマンス
export function requestIdleCallback(callback: () => void): void {
  if (typeof window !== "undefined" && "requestIdleCallback" in window) {
    window.requestIdleCallback(callback);
  } else {
    setTimeout(callback, 1);
  }
}

// 数値フォーマット
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

export function formatViewCount(count: number): string {
  return `${formatNumber(count)}回閲覧`;
}

// コピー機能
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!navigator.clipboard) {
    // フォールバック
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    const successful = document.execCommand("copy");
    document.body.removeChild(textArea);
    return successful;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

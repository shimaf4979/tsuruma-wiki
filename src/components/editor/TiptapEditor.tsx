"use client";

import React, { useCallback, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight, common } from "lowlight";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  ImageIcon,
  Link as LinkIcon,
  Unlink,
} from "lucide-react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { uploadAPI } from "../../lib/api";
import { useUIStore } from "../../store";

interface TiptapEditorProps {
  content: string;
  onContentChange: (content: string) => void;
  placeholder?: string;
}

const lowlight = createLowlight(common);

export function TiptapEditor({
  content,
  onContentChange,
  placeholder = "ここに記事の内容を入力してください...",
}: TiptapEditorProps) {
  const { addToast } = useUIStore();
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const uploadMutation = useMutation({
    mutationFn: uploadAPI.uploadImage,
    onSuccess: (data) => {
      editor?.chain().focus().setImage({ src: data.url }).run();
      addToast({
        type: "success",
        title: "画像をアップロードしました",
      });
    },
    onError: (error: unknown) => {
      let errorMessage = "エラーが発生しました";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const response = (error as { response?: { data?: { error?: string } } })
          .response;
        errorMessage = response?.data?.error || "エラーが発生しました";
      }

      addToast({
        type: "error",
        title: "画像のアップロードに失敗しました",
        description: errorMessage,
      });
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        inline: false,
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-lg",
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary-600 hover:text-primary-700 underline",
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: "bg-koala-900 text-white p-4 rounded-lg my-3 overflow-x-auto",
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onContentChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none",
      },
    },
  });

  const handleImageUpload = useCallback(() => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          // 5MB制限
          addToast({
            type: "error",
            title: "ファイルサイズが大きすぎます",
            description: "5MB以下の画像を選択してください",
          });
          return;
        }
        uploadMutation.mutate(file);
      }
    };
    input.click();
  }, [uploadMutation, addToast]);

  const handleSetLink = useCallback(() => {
    if (linkUrl) {
      editor?.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl("");
      setIsLinkDialogOpen(false);
    }
  }, [editor, linkUrl]);

  const handleUnsetLink = useCallback(() => {
    editor?.chain().focus().unsetLink().run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  const toolbarButtons = [
    {
      label: "太字",
      icon: Bold,
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: editor.isActive("bold"),
    },
    {
      label: "斜体",
      icon: Italic,
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: editor.isActive("italic"),
    },
    {
      label: "取り消し線",
      icon: Strikethrough,
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: editor.isActive("strike"),
    },
    {
      label: "インラインコード",
      icon: Code,
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: editor.isActive("code"),
    },
    { type: "divider" },
    {
      label: "見出し1",
      icon: Heading1,
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: editor.isActive("heading", { level: 1 }),
    },
    {
      label: "見出し2",
      icon: Heading2,
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: editor.isActive("heading", { level: 2 }),
    },
    {
      label: "見出し3",
      icon: Heading3,
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: editor.isActive("heading", { level: 3 }),
    },
    { type: "divider" },
    {
      label: "箇条書き",
      icon: List,
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: editor.isActive("bulletList"),
    },
    {
      label: "番号付きリスト",
      icon: ListOrdered,
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: editor.isActive("orderedList"),
    },
    {
      label: "引用",
      icon: Quote,
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: editor.isActive("blockquote"),
    },
    { type: "divider" },
    {
      label: "画像",
      icon: ImageIcon,
      action: handleImageUpload,
      isActive: false,
      disabled: uploadMutation.isPending,
    },
    {
      label: "リンク",
      icon: LinkIcon,
      action: () => setIsLinkDialogOpen(true),
      isActive: editor.isActive("link"),
    },
    {
      label: "リンク解除",
      icon: Unlink,
      action: handleUnsetLink,
      isActive: false,
      disabled: !editor.isActive("link"),
    },
    { type: "divider" },
    {
      label: "元に戻す",
      icon: Undo,
      action: () => editor.chain().focus().undo().run(),
      isActive: false,
      disabled: !editor.can().undo(),
    },
    {
      label: "やり直し",
      icon: Redo,
      action: () => editor.chain().focus().redo().run(),
      isActive: false,
      disabled: !editor.can().redo(),
    },
  ];

  return (
    <div className='border border-koala-300 rounded-lg overflow-hidden'>
      {/* ツールバー */}
      <div className='bg-koala-50 border-b border-koala-300 p-2'>
        <div className='flex flex-wrap items-center gap-1'>
          {toolbarButtons.map((button, index) => {
            if (button.type === "divider") {
              return <div key={index} className='w-px h-6 bg-koala-300 mx-1' />;
            }

            const Icon = button.icon;
            if (!Icon) return null;

            return (
              <motion.button
                key={button.label}
                type='button'
                onClick={button.action}
                disabled={button.disabled}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-md text-sm font-medium transition-colors ${
                  button.isActive
                    ? "bg-primary-100 text-primary-700 border border-primary-200"
                    : "text-koala-600 hover:bg-koala-100 hover:text-koala-900"
                } ${
                  button.disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
                title={button.label}
              >
                <Icon className='w-4 h-4' />
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* エディター本体 */}
      <div className='relative'>
        <EditorContent
          editor={editor}
          className='min-h-[400px] p-4 focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2'
        />

        {/* プレースホルダー */}
        {editor.isEmpty && (
          <div className='absolute top-4 left-4 text-koala-400 pointer-events-none'>
            {placeholder}
          </div>
        )}

        {/* アップロード中のローディング */}
        {uploadMutation.isPending && (
          <div className='absolute inset-0 bg-white/80 flex items-center justify-center'>
            <div className='flex items-center space-x-2'>
              <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600'></div>
              <span className='text-sm text-koala-600'>
                画像をアップロード中...
              </span>
            </div>
          </div>
        )}
      </div>

      {/* リンクダイアログ */}
      {isLinkDialogOpen && (
        <div className='absolute inset-0 bg-black/20 flex items-center justify-center z-50'>
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className='bg-white rounded-lg p-6 w-96 shadow-xl'
          >
            <h3 className='text-lg font-semibold text-koala-900 mb-4'>
              リンクを追加
            </h3>
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-koala-700 mb-1'>
                  URL
                </label>
                <input
                  type='url'
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder='https://example.com'
                  className='input w-full'
                  autoFocus
                />
              </div>
              <div className='flex justify-end space-x-3'>
                <button
                  onClick={() => {
                    setIsLinkDialogOpen(false);
                    setLinkUrl("");
                  }}
                  className='btn-outline'
                >
                  キャンセル
                </button>
                <button
                  onClick={handleSetLink}
                  disabled={!linkUrl.trim()}
                  className='btn-primary'
                >
                  追加
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

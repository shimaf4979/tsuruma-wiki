// components/ui/ModalContainer.tsx - 完全版
"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Info, CheckCircle } from "lucide-react";
import { useUIStore } from "../../store";

export function ModalContainer() {
  const { modals, closeModal } = useUIStore();

  const getIcon = (type: string) => {
    switch (type) {
      case "confirm":
        return <AlertTriangle className='w-6 h-6 text-yellow-600' />;
      case "info":
        return <Info className='w-6 h-6 text-blue-600' />;
      case "success":
        return <CheckCircle className='w-6 h-6 text-green-600' />;
      default:
        return <Info className='w-6 h-6 text-koala-600' />;
    }
  };

  return (
    <AnimatePresence>
      {modals.map((modal) => (
        <motion.div
          key={modal.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 z-50 flex items-center justify-center p-4'
        >
          {/* オーバーレイ */}
          <div
            className='absolute inset-0 bg-black/50 backdrop-blur-sm'
            onClick={() => closeModal(modal.id)}
          />

          {/* モーダル本体 */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className='relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden'
          >
            {/* ヘッダー */}
            <div className='flex items-center justify-between p-4 border-b border-koala-200'>
              <div className='flex items-center space-x-3'>
                {getIcon(modal.type)}
                <h3 className='text-lg font-semibold text-koala-900'>
                  {modal.title}
                </h3>
              </div>
              <button
                title='閉じる'
                onClick={() => closeModal(modal.id)}
                className='p-1 rounded-md text-koala-400 hover:text-koala-600 hover:bg-koala-100 transition-colors'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            {/* コンテンツ */}
            <div className='p-4'>{modal.content}</div>

            {/* フッター */}
            <div className='flex justify-end space-x-3 p-4 bg-koala-50 border-t border-koala-200'>
              <button
                onClick={() => closeModal(modal.id)}
                className='btn-outline'
              >
                {modal.type === "confirm" ? "キャンセル" : "閉じる"}
              </button>
              {modal.onConfirm && (
                <button
                  onClick={() => {
                    modal.onConfirm?.();
                    closeModal(modal.id);
                  }}
                  className={`btn ${
                    modal.type === "confirm"
                      ? "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                      : "btn-primary"
                  }`}
                >
                  {modal.type === "confirm" ? "削除" : "確認"}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

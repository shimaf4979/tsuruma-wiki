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
            className='relative bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border border-koala-200'
          >
            {/* ヘッダー */}
            <div className='flex items-center justify-between p-4 sm:p-5 border-b border-koala-200 bg-koala-50'>
              <div className='flex items-center space-x-3'>
                {getIcon(modal.type)}
                <h3 className='text-lg font-semibold text-koala-900'>
                  {modal.title}
                </h3>
              </div>
              <button
                title='閉じる'
                onClick={() => closeModal(modal.id)}
                className='p-1.5 rounded-lg text-koala-400 hover:text-koala-600 hover:bg-koala-100 transition-colors'
              >
                <X className='w-5 h-5' />
              </button>
            </div>

            {/* コンテンツ */}
            <div className='p-4 sm:p-6'>{modal.content}</div>

            {/* フッター */}
            <div className='flex justify-end space-x-3 p-4 sm:p-5 bg-koala-50 border-t border-koala-200'>
              <button
                onClick={() => closeModal(modal.id)}
                className='px-4 py-2 text-sm font-medium text-koala-700 bg-white border border-koala-300 rounded-lg hover:bg-koala-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-koala-500 transition-colors'
              >
                {modal.type === "confirm" ? "キャンセル" : "閉じる"}
              </button>
              {modal.onConfirm && (
                <button
                  onClick={() => {
                    modal.onConfirm?.();
                    closeModal(modal.id);
                  }}
                  className={`px-4 py-2 text-sm font-medium text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                    modal.type === "confirm"
                      ? "bg-green-600 hover:bg-green-700 focus:ring-green-500"
                      : "bg-primary-600 hover:bg-primary-700 focus:ring-primary-500"
                  }`}
                >
                  {modal.type === "confirm" ? "完了" : "確認"}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

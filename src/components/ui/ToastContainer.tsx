"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { useUIStore } from "../../store";

export function ToastContainer() {
  const { toasts, removeToast } = useUIStore();

  const getIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className='w-5 h-5 text-green-600' />;
      case "error":
        return <AlertCircle className='w-5 h-5 text-red-600' />;
      case "warning":
        return <AlertTriangle className='w-5 h-5 text-yellow-600' />;
      default:
        return <Info className='w-5 h-5 text-blue-600' />;
    }
  };

  const getColors = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  return (
    <div className='fixed top-20 right-4 z-50 space-y-2'>
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.9 }}
            className={`max-w-sm w-full shadow-lg rounded-lg border p-4 ${getColors(
              toast.type
            )}`}
          >
            <div className='flex items-start'>
              <div className='flex-shrink-0'>{getIcon(toast.type)}</div>
              <div className='ml-3 flex-1'>
                <p className='text-sm font-medium'>{toast.title}</p>
                {toast.description && (
                  <p className='mt-1 text-sm opacity-90'>{toast.description}</p>
                )}
              </div>
              <button
                title='閉じる'
                onClick={() => removeToast(toast.id)}
                className='ml-4 flex-shrink-0 text-current hover:opacity-70 transition-opacity'
              >
                <X className='w-4 h-4' />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ModalContainer.tsx
export function ModalContainer() {
  const { modals, closeModal } = useUIStore();

  return (
    <AnimatePresence>
      {modals.map((modal) => (
        <motion.div
          key={modal.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className='fixed inset-0 z-50 flex items-center justify-center'
        >
          <div
            className='absolute inset-0 bg-black/50 backdrop-blur-sm'
            onClick={() => closeModal(modal.id)}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className='relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6'
          >
            <h3 className='text-lg font-semibold text-koala-900 mb-4'>
              {modal.title}
            </h3>
            <div className='mb-6'>{modal.content}</div>
            <div className='flex justify-end space-x-3'>
              <button
                onClick={() => closeModal(modal.id)}
                className='btn-outline'
              >
                キャンセル
              </button>
              {modal.onConfirm && (
                <button
                  onClick={() => {
                    modal.onConfirm?.();
                    closeModal(modal.id);
                  }}
                  className='btn-primary'
                >
                  確認
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

import { useEffect } from 'react';

export interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  isVisible: boolean;
  onDismiss: () => void;
}

export function Toast({ message, type = 'success', isVisible, onDismiss }: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onDismiss]);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl text-sm font-medium text-white shadow-lg transition-opacity duration-300 ${
        type === 'error' ? 'bg-red-600' : 'bg-emerald-600'
      }`}
    >
      {message}
    </div>
  );
}

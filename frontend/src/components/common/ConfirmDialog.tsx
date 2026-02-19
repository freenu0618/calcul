/**
 * 삭제/확인 다이얼로그 - confirm() 대체
 */

import { useEffect, useRef } from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

const VARIANT_STYLES = {
  danger: { icon: 'delete_forever', iconBg: 'bg-red-100 text-red-600', btn: 'bg-red-600 hover:bg-red-700' },
  warning: { icon: 'warning', iconBg: 'bg-amber-100 text-amber-600', btn: 'bg-amber-600 hover:bg-amber-700' },
  info: { icon: 'info', iconBg: 'bg-blue-100 text-blue-600', btn: 'bg-blue-600 hover:bg-blue-700' },
};

export default function ConfirmDialog({
  isOpen, title, message, confirmLabel = '확인', cancelLabel = '취소',
  variant = 'danger', onConfirm, onCancel,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);
  const style = VARIANT_STYLES[variant];

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', handler);
    confirmRef.current?.focus();
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onCancel}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${style.iconBg}`}>
            <span className="material-symbols-outlined text-xl">{style.icon}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm">
            {cancelLabel}
          </button>
          <button ref={confirmRef} onClick={onConfirm} className={`flex-1 px-4 py-2.5 text-white rounded-lg font-medium text-sm ${style.btn}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

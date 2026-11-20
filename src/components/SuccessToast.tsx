import React, { useEffect } from 'react';
import { CheckCircle2, X } from 'lucide-react';

export interface SuccessToastProps {
  title?: string;
  message: string | null;
  onClose: () => void;
  durationMs?: number;
}

/**
 * Notifikasi toast mengambang untuk umpan balik aksi yang berhasil (mis. reset soal).
 */
export const SuccessToast: React.FC<SuccessToastProps> = ({
  title = 'Berhasil',
  message,
  onClose,
  durationMs = 5500,
}) => {
  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(onClose, durationMs);
    return () => window.clearTimeout(timer);
  }, [message, durationMs, onClose]);

  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 max-w-sm w-[calc(100%-2.5rem)] bg-emerald-600 text-white rounded-xl shadow-lg border border-emerald-500 px-4 py-3 flex items-start gap-3"
    >
      <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-emerald-100" />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-bold">{title}</div>
        <p className="text-xs text-emerald-50 mt-0.5 leading-relaxed">{message}</p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup notifikasi"
        className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-700/60 shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

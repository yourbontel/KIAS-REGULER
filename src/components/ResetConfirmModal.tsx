import React, { useEffect } from 'react';
import { AlertTriangle, RotateCcw, X } from 'lucide-react';

export interface ResetConfirmModalProps {
  isOpen: boolean;
  title: string;
  subtitle?: string;
  targetLabel: string;
  detailText: string;
  warningText: string;
  confirmLabel?: string;
  confirmDisabled?: boolean;
  loading?: boolean;
  error?: string | null;
  children?: React.ReactNode;
  onCancel: () => void;
  onConfirm: () => void;
}

/**
 * Modal konfirmasi reset pengerjaan soal untuk Superadmin sebelum data riwayat dihapus.
 */
export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  title,
  subtitle = 'Konfirmasi sebelum mereset pengerjaan soal siswa',
  targetLabel,
  detailText,
  warningText,
  confirmLabel = 'Ya, Reset Soal',
  confirmDisabled = false,
  loading = false,
  error = null,
  children,
  onCancel,
  onConfirm,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !loading) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-[1px] flex items-center justify-center p-4"
      onClick={() => {
        if (!loading) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reset-confirm-modal-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden text-left"
      >
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-rose-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h2
                id="reset-confirm-modal-title"
                className="text-sm font-bold text-slate-900"
              >
                {title}
              </h2>
              <p className="text-[11px] text-slate-500">{subtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            aria-label="Tutup popup konfirmasi reset"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-slate-200 space-y-1">
            <div className="text-[11px] font-semibold text-rose-700">
              Target Reset
            </div>
            <div className="text-sm font-bold text-slate-900">{targetLabel}</div>
            <div className="text-xs text-slate-600">{detailText}</div>
          </div>

          {children}

          <div className="text-xs text-rose-900 bg-rose-50 border border-rose-200 rounded-lg px-3.5 py-2.5 leading-relaxed">
            <strong>Perhatian:</strong> {warningText}
          </div>

          {error && (
            <div className="text-xs text-rose-800 bg-rose-50 border border-rose-300 rounded-lg px-3.5 py-2.5">
              {error}
            </div>
          )}

          <div className="flex items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="flex-1 py-2.5 px-4 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-50"
            >
              Tidak, Batal
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading || confirmDisabled}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 disabled:opacity-50 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {loading ? 'Mereset...' : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

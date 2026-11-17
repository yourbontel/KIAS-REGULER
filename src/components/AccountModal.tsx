import React, { useState } from 'react';
import { X, KeyRound, AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountTitle: string;
  accountSubtitle: string;
  onChangePassword: (oldPassword: string, newPassword: string) => string | null;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  accountTitle,
  accountSubtitle,
  onChangePassword,
}) => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!oldPassword) {
      setError('Masukkan password saat ini.');
      return;
    }
    if (newPassword.length < 4) {
      setError('Password baru minimal 4 karakter.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password baru tidak cocok.');
      return;
    }

    const err = onChangePassword(oldPassword, newPassword);
    if (err) {
      setError(err);
      return;
    }

    setSuccess(true);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-emerald-700" />
            <h3 className="text-base font-bold text-slate-900">Ganti Password Akun</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-xs font-bold text-slate-900">{accountTitle}</div>
            <div className="text-[11px] text-slate-500 mt-0.5">{accountSubtitle}</div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password Saat Ini
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Masukkan password lama..."
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password Baru
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 4 karakter..."
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ulangi Password Baru
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ketik ulang password baru..."
              className="w-full px-3.5 py-2 text-xs sm:text-sm bg-[#F8FAFC] border border-slate-200 rounded-lg focus:outline-none focus:border-emerald-600"
            />
          </div>

          <button
            type="button"
            onClick={() => setShowPasswords((v) => !v)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900"
          >
            {showPasswords ? (
              <>
                <EyeOff className="w-3.5 h-3.5" /> Sembunyikan password
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" /> Tampilkan password
              </>
            )}
          </button>

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Password berhasil diperbarui!</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            >
              Tutup
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg transition-colors"
            >
              Simpan Password
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

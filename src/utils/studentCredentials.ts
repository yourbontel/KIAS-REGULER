export async function requestStudentCredential(
  action: 'register' | 'login' | 'change' | 'reset' | 'change-admin-password',
  studentId: string,
  values: { password?: string; newPassword?: string; adminUsername?: string; adminToken?: string } = {}
): Promise<string | null> {
  try {
    const response = await fetch('/api/student-auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(values.adminToken ? { Authorization: `Bearer ${values.adminToken}` } : {}),
      },
      body: JSON.stringify({ action, studentId, ...values }),
    });
    if (response.ok) return null;
    const result = await response.json().catch(() => null);
    return result?.error || 'Layanan akun siswa sedang bermasalah. Silakan coba lagi.';
  } catch {
    return 'Tidak dapat terhubung ke server. Periksa koneksi internet lalu coba lagi.';
  }
}

export async function verifySuperadmin(username: string, password: string): Promise<{ error: string | null; token: string | null }> {
  try {
    const response = await fetch('/api/student-auth?action=admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (response.ok) {
      const result = await response.json();
      return { error: null, token: result.token };
    }
    const result = await response.json().catch(() => null);
    return { error: result?.error || 'Username atau password superadmin salah.', token: null };
  } catch {
    return { error: 'Tidak dapat terhubung ke server. Periksa koneksi internet lalu coba lagi.', token: null };
  }
}

export async function loadStudentCredentialStatus(): Promise<Record<string, boolean>> {
  const response = await fetch('/api/student-auth', { cache: 'no-store' });
  if (!response.ok) throw new Error('Gagal memuat status akun siswa.');
  const result = await response.json();
  return Object.fromEntries(result.activeStudentIds.map((id: string) => [id, true]));
}

export async function loadSuperadminUsername(): Promise<string> {
  const response = await fetch('/api/student-auth?action=admin', { cache: 'no-store' });
  if (!response.ok) throw new Error('Gagal memuat akun superadmin.');
  const result = await response.json();
  return result.username;
}

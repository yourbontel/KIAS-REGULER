export type UserRole = 'superadmin' | 'student';

export type AuthSession =
  | {
      role: 'superadmin';
      username: string;
      displayName: string;
      loggedInAt: string;
    }
  | {
      role: 'student';
      studentId: string;
      loggedInAt: string;
    };

export interface SuperadminConfig {
  username: string;
  passwordHash: string;
  displayName: string;
}

export type StudentPasswordMap = Record<string, boolean>;

export const AUTH_STORAGE_KEYS = {
  SESSION: 'albarkah_shorof_session_v1',
  STUDENT_PASSWORDS: 'albarkah_shorof_student_passwords_v1',
  SUPERADMIN: 'albarkah_shorof_superadmin_v1',
};

export const DEFAULT_SUPERADMIN_CREDENTIALS = {
  username: 'superadmin',
  password: 'albarkah2026',
  displayName: 'Superadmin Al-Barkah',
};

/**
 * Synchronous salted hash helper that works reliably in both localhost
 * and non-HTTPS local network origins (where crypto.subtle may be unavailable).
 */
export function hashPassword(rawPassword: string, salt = 'albarkah_shorof_2026'): string {
  const input = `${salt}:${rawPassword}`;
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const part1 = (h2 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h1 >>> 0).toString(16).padStart(8, '0');
  return `v1_${part1}${part2}`;
}

export function getInitialSuperadminConfig(): SuperadminConfig {
  try {
    const saved = localStorage.getItem(AUTH_STORAGE_KEYS.SUPERADMIN);
    if (saved) {
      const parsed = JSON.parse(saved) as SuperadminConfig;
      if (parsed?.username && parsed?.passwordHash) {
        return parsed;
      }
    }
  } catch {
    // fallback to default
  }
  return {
    username: DEFAULT_SUPERADMIN_CREDENTIALS.username,
    passwordHash: hashPassword(
      DEFAULT_SUPERADMIN_CREDENTIALS.password,
      DEFAULT_SUPERADMIN_CREDENTIALS.username
    ),
    displayName: DEFAULT_SUPERADMIN_CREDENTIALS.displayName,
  };
}

export function getInitialSession(): AuthSession | null {
  try {
    const saved = localStorage.getItem(AUTH_STORAGE_KEYS.SESSION);
    if (saved) {
      const parsed = JSON.parse(saved) as AuthSession;
      if (parsed?.role === 'superadmin' || parsed?.role === 'student') {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

export interface ExamAccessConfig {
  /** Map of babId -> boolean (false = ditutup/terkunci, selain false = terbuka) */
  babs: Record<string, boolean>;
  /** Map of `${babId}:${sectionNumber}` -> boolean (false = ditutup/terkunci) */
  sections: Record<string, boolean>;
}

export const DEFAULT_EXAM_ACCESS: ExamAccessConfig = {
  babs: {},
  sections: {},
};

export function sectionAccessKey(babId: string, sectionNumber: number): string {
  return `${babId}:${sectionNumber}`;
}

export function isBabOpen(config: ExamAccessConfig, babId: string): boolean {
  return config.babs[babId] !== false;
}

export function isSectionOpen(
  config: ExamAccessConfig,
  babId: string,
  sectionNumber?: number | null
): boolean {
  if (!isBabOpen(config, babId)) return false;
  if (!sectionNumber) return true;
  return config.sections[sectionAccessKey(babId, sectionNumber)] !== false;
}

export function sanitizeExamAccessConfig(raw: unknown): ExamAccessConfig {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { babs: {}, sections: {} };
  }
  const obj = raw as Record<string, unknown>;
  const babs: Record<string, boolean> = {};
  const sections: Record<string, boolean> = {};

  if (obj.babs && typeof obj.babs === 'object' && !Array.isArray(obj.babs)) {
    for (const [key, val] of Object.entries(obj.babs)) {
      if (typeof key === 'string' && key.length <= 128 && typeof val === 'boolean') {
        babs[key] = val;
      }
    }
  }
  if (obj.sections && typeof obj.sections === 'object' && !Array.isArray(obj.sections)) {
    for (const [key, val] of Object.entries(obj.sections)) {
      if (typeof key === 'string' && key.length <= 140 && typeof val === 'boolean') {
        sections[key] = val;
      }
    }
  }
  return { babs, sections };
}

import type { StudentClass } from '../data/students';
import { getBabsForClass } from '../data/shorofData';

export interface ExamAccessConfig {
  /** Map of babId -> boolean (false = ditutup/terkunci, selain false = terbuka) */
  babs: Record<string, boolean>;
  /** Map of `${babId}:${sectionNumber}` -> boolean (false = ditutup/terkunci) */
  sections: Record<string, boolean>;
  /** Map of `${kelas}:${tashrifType}` -> boolean (false = ditutup) */
  tashrifTypes: Record<string, boolean>;
  /** Optional last Reguler 1 bab included in Semester 1 exams. */
  semester1EndBabId?: string;
}

export const DEFAULT_EXAM_ACCESS: ExamAccessConfig = {
  babs: {},
  sections: {},
  tashrifTypes: {},
};

export type TashrifType = 'istilahi' | 'lughawi';

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

export function isBabWithinSemester1(config: ExamAccessConfig, kelas: StudentClass, babId: string): boolean {
  if (kelas !== 'Reguler 1' || !config.semester1EndBabId) return true;
  const babs = getBabsForClass(kelas);
  const endIndex = babs.findIndex((bab) => bab.id === config.semester1EndBabId);
  const babIndex = babs.findIndex((bab) => bab.id === babId);
  return endIndex < 0 || (babIndex >= 0 && babIndex <= endIndex);
}

export function tashrifAccessKey(kelas: StudentClass, type: TashrifType): string {
  return `${kelas}:${type}`;
}

export function isTashrifTypeOpen(
  config: ExamAccessConfig,
  kelas: StudentClass,
  sectionNumber: number
): boolean {
  if (sectionNumber < 1 || sectionNumber > 12) return true;
  const type: TashrifType = sectionNumber <= 6 ? 'istilahi' : 'lughawi';
  return config.tashrifTypes[tashrifAccessKey(kelas, type)] !== false;
}

export function isExamSectionOpen(
  config: ExamAccessConfig,
  kelas: StudentClass,
  babId: string,
  sectionNumber?: number | null
): boolean {
  if (!isSectionOpen(config, babId, sectionNumber)) return false;
  if (sectionNumber && !isTashrifTypeOpen(config, kelas, sectionNumber)) return false;
  return true;
}

export function sanitizeExamAccessConfig(raw: unknown): ExamAccessConfig {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { babs: {}, sections: {}, tashrifTypes: {} };
  }
  const obj = raw as Record<string, unknown>;
  const babs: Record<string, boolean> = {};
  const sections: Record<string, boolean> = {};
  const tashrifTypes: Record<string, boolean> = {};

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
  if (obj.tashrifTypes && typeof obj.tashrifTypes === 'object' && !Array.isArray(obj.tashrifTypes)) {
    for (const [key, val] of Object.entries(obj.tashrifTypes)) {
      if (
        (key === 'Reguler 1:istilahi' || key === 'Reguler 1:lughawi' ||
          key === 'Reguler 2:istilahi' || key === 'Reguler 2:lughawi') &&
        typeof val === 'boolean'
      ) {
        tashrifTypes[key] = val;
      }
    }
  }
  const semester1EndBabId = typeof obj.semester1EndBabId === 'string' &&
    getBabsForClass('Reguler 1').some((bab) => bab.id === obj.semester1EndBabId)
    ? obj.semester1EndBabId
    : undefined;
  return { babs, sections, tashrifTypes, semester1EndBabId };
}

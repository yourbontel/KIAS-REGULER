export type { CuratedExamQuestionSpec } from './exams/types';
import type { CuratedExamQuestionSpec } from './exams/types';
import { REGULER2_EXAM_QUESTIONS } from './exams/reguler2';
import { R1_BAB1_EXAM_QUESTIONS } from './exams/r1-bab-1';
import { R1_BAB2_EXAM_QUESTIONS } from './exams/r1-bab-2';
import { R1_BAB3_EXAM_QUESTIONS } from './exams/r1-bab-3';
import { R1_BAB4_EXAM_QUESTIONS } from './exams/r1-bab-4';
import { R1_BAB5_EXAM_QUESTIONS } from './exams/r1-bab-5';
import { R1_BAB6_EXAM_QUESTIONS } from './exams/r1-bab-6';
import { R1_MAZID_EXAM_QUESTIONS } from './exams/r1-mazid';
import { R1_MAZID1_BAB1_EXAM_QUESTIONS } from './exams/r1-mazid1-bab-1';

export const CURATED_EXAM_QUESTIONS: CuratedExamQuestionSpec[] = [
  ...REGULER2_EXAM_QUESTIONS,
  ...R1_BAB1_EXAM_QUESTIONS,
  ...R1_BAB2_EXAM_QUESTIONS,
  ...R1_BAB3_EXAM_QUESTIONS,
  ...R1_BAB4_EXAM_QUESTIONS,
  ...R1_BAB5_EXAM_QUESTIONS,
  ...R1_BAB6_EXAM_QUESTIONS,
  ...R1_MAZID_EXAM_QUESTIONS,
  ...R1_MAZID1_BAB1_EXAM_QUESTIONS,
];

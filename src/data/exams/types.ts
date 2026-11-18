export interface CuratedExamQuestionSpec {
  id: string;
  babId: string;
  sectionNumber: 4 | 5 | 6;
  promptId: string;
  arabicHighlight: string;
  arabicSubtext: string;
  options: {
    id: string;
    textAr: string;
    textSub?: string;
  }[];
  correctOptionId: string;
  explanation: string;
}

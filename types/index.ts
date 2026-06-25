/// <reference types="react" />

export interface LessonFormData {
  topic: string;
  difficulty: "story" | "standard" | "competition";
  grade: "elementary" | "middle" | "high";
}

export interface SectionCard {
  emoji: string;
  title: string;
  body: string;
}

export interface GeneratedContent {
  title: string;
  sections: SectionCard[];
  exercises: string;
  rawMarkdown: string;
}

export type Difficulty = "story" | "standard" | "competition";
export type GradeLevel = "elementary" | "middle" | "high";

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  story: "故事导入版（低基础）",
  standard: "标准刷题版（中等生）",
  competition: "竞赛拔高版（优等生）",
};

export const GRADE_LABELS: Record<GradeLevel, string> = {
  elementary: "小学生",
  middle: "初中生",
  high: "高中生",
};

export type ViewMode = "standard" | "h5";

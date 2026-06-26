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

/* ─── Core Objectives (教案头部) ─── */

export interface CoreObjectives {
  /** 核心词汇，每项为 { word: string; meaning: string } */
  vocabulary: { word: string; meaning: string }[];
  /** 核心句型 1-2 条 */
  keyStructures: string[];
  /** 教学重点 */
  keyPoints: string;
  /** 教学难点 */
  difficultPoints: string;
}

/* ─── Quiz & Layered Homework (教案尾部) ─── */

export interface QuizData {
  /** 随堂测验 — 学生卷（3 单选 + 1 填空，无答案） */
  studentPaper: string;
}

export interface LayeredHomework {
  /** 基础巩固题（必做） */
  basic: string;
  /** 拓展拔高题（选做） */
  advanced: string;
}

export interface AnswerKey {
  /** 答案页：包含测验答案 + 作业答案 + 核心解析 */
  content: string;
}

/* ─── Full Generated Content ─── */

export interface GeneratedContent {
  title: string;
  /** 教案头部：核心词汇 / 句型 / 重难点 */
  coreObjectives: CoreObjectives;
  /** 教学环节 */
  sections: SectionCard[];
  /** 课后练习（简要） */
  exercises: string;
  /** 随堂测验 */
  quiz: QuizData;
  /** 分层课后作业 */
  layeredHomework: LayeredHomework;
  /** 教师答案页 */
  answerKey: AnswerKey;
  /** 完整 Markdown（用于一键复制） */
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

export type GenerateAction = "generate" | "simplify" | "advance";

export interface ChatRequest {
  topic: string;
  difficulty: Difficulty;
  grade: GradeLevel;
  action: GenerateAction;
  previousContent?: string;
}

export interface SSEChatEvent {
  type: "progress" | "done" | "error";
  content?: string;
  message?: string;
}

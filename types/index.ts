/// <reference types="react" />

// ============================================================
// Subjects & Question Types
// ============================================================

export type Subject =
  | "english" | "math" | "chinese"
  | "physics" | "chemistry" | "biology"
  | "history" | "geography" | "politics";

export const SUBJECT_LABELS: Record<Subject, string> = {
  english: "英语",
  math: "数学",
  chinese: "语文",
  physics: "物理",
  chemistry: "化学",
  biology: "生物",
  history: "历史",
  geography: "地理",
  politics: "政治",
};

export const SUBJECT_EMOJIS: Record<Subject, string> = {
  english: "🇬🇧",
  math: "📐",
  chinese: "📜",
  physics: "⚛️",
  chemistry: "🧪",
  biology: "🧬",
  history: "📜",
  geography: "🌍",
  politics: "⚖️",
};

/** 每个科目对应的可用题型列表 */
export const SUBJECT_QUESTION_TYPES: Record<Subject, { value: string; label: string }[]> = {
  english: [
    { value: "multiple_choice", label: "单项选择" },
    { value: "cloze", label: "完形填空" },
    { value: "reading", label: "阅读理解" },
    { value: "spelling", label: "单词拼写" },
    { value: "writing", label: "书面表达" },
  ],
  math: [
    { value: "multiple_choice", label: "选择题" },
    { value: "fill_blank", label: "填空题" },
    { value: "calculation", label: "计算题" },
    { value: "application", label: "应用题" },
    { value: "proof", label: "证明题" },
  ],
  chinese: [
    { value: "basic_words", label: "基础字词" },
    { value: "poem_dictation", label: "古诗文默写" },
    { value: "modern_reading", label: "现代文阅读" },
    { value: "essay", label: "作文" },
  ],
  physics: [
    { value: "single_choice", label: "单项选择题" },
    { value: "multi_choice", label: "多项选择题" },
    { value: "fill_blank_physics", label: "填空题" },
    { value: "experiment_inquiry", label: "实验探究题" },
    { value: "calc_big", label: "计算大题" },
  ],
  chemistry: [
    { value: "single_choice_chem", label: "单项选择题" },
    { value: "fill_brief", label: "填空与简答题" },
    { value: "experiment_steps", label: "实验步骤探究题" },
    { value: "process_analysis", label: "工艺流程分析题" },
    { value: "calc_chem", label: "计算题" },
  ],
  biology: [
    { value: "single_choice_bio", label: "单项选择题" },
    { value: "fill_blank_bio", label: "填空题" },
    { value: "material_chart", label: "材料图表分析题" },
    { value: "experiment_design", label: "实验设计题" },
  ],
  history: [
    { value: "single_choice_hist", label: "单项选择题" },
    { value: "material_analysis", label: "材料解析题" },
    { value: "essay_discourse", label: "论述题（观点阐述）" },
  ],
  geography: [
    { value: "single_choice_geo", label: "单项选择题" },
    { value: "map_comprehensive", label: "读图综合题" },
    { value: "geo_material_analysis", label: "材料分析题" },
  ],
  politics: [
    { value: "single_choice_pol", label: "单项选择题" },
    { value: "judge_brief", label: "判断简答题" },
    { value: "pol_material_analysis", label: "材料分析题" },
    { value: "inquiry_essay", label: "探究论述题" },
  ],
};

// ============================================================
// Module Tabs
// ============================================================

export type ModuleTab = "lesson_plan" | "quiz_homework" | "custom_exam";

export const MODULE_TABS: { value: ModuleTab; emoji: string; label: string; desc: string }[] = [
  { value: "lesson_plan", emoji: "📘", label: "实操讲义教案", desc: "结构化教案，可直接上课" },
  { value: "quiz_homework", emoji: "📝", label: "随堂测试与作业", desc: "基础巩固 + 拓展拔高" },
  { value: "custom_exam", emoji: "🏆", label: "弹性定制试卷", desc: "纯刷题模式，精准生成" },
];

// ============================================================
// Question Config (checked types + count per type)
// ============================================================

export interface QuestionTypeConfig {
  type: string;
  label: string;
  count: number;
}

// ============================================================
// Form Data (sent to API)
// ============================================================

export interface LessonFormData {
  topic: string;
  subject?: Subject;
  module: ModuleTab;
  difficulty: Difficulty;
  grade: GradeLevel;
  questionConfigs: QuestionTypeConfig[];
}

// ============================================================
// Content Types
// ============================================================

export interface SectionCard {
  emoji: string;
  title: string;
  body: string;
}

export interface CoreObjectives {
  vocabulary: { word: string; meaning: string }[];
  keyStructures: string[];
  keyPoints: string;
  difficultPoints: string;
}

export interface QuizData {
  studentPaper: string;
}

export interface LayeredHomework {
  basic: string;
  advanced: string;
}

export interface AnswerKey {
  content: string;
}

export interface GeneratedContent {
  title: string;
  subject?: Subject;
  module: ModuleTab;
  coreObjectives: CoreObjectives;
  sections: SectionCard[];
  exercises: string;
  quiz: QuizData;
  layeredHomework: LayeredHomework;
  answerKey: AnswerKey;
  rawMarkdown: string;
}

// ============================================================
// Shared enums
// ============================================================

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
  subject?: Subject;
  module: ModuleTab;
  difficulty: Difficulty;
  grade: GradeLevel;
  questionConfigs: QuestionTypeConfig[];
  action: GenerateAction;
  previousContent?: string;
}

export interface SSEChatEvent {
  type: "progress" | "done" | "error";
  content?: string;
  message?: string;
}

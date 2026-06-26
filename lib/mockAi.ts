import {
  GeneratedContent,
  CoreObjectives,
  QuizData,
  LayeredHomework,
  AnswerKey,
} from "@/types";
import type { FormSubmitData } from "@/app/components/InputPanel";

// ============================================================
// SSE stream reader
// ============================================================

interface ChatAPIOptions {
  onProgress?: (text: string) => void;
  signal?: AbortSignal;
}

async function callChatAPI(
  data: FormSubmitData & { action?: "generate" | "simplify" | "advance" | "adapt_wrong_question"; previousContent?: string },
  options?: ChatAPIOptions,
): Promise<GeneratedContent> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      topic: data.topic,
      subject: data.subject,
      module: data.module,
      difficulty: data.difficulty,
      grade: data.grade,
      questionConfigs: data.questionConfigs,
      customQuestion: data.customQuestion || undefined,
      action: data.action || "generate",
      previousContent: data.previousContent || undefined,
      adaptWrongQuestion: data.adaptWrongQuestion || undefined,
      adaptCount: data.adaptCount || undefined,
    }),
    signal: options?.signal,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
    throw new Error(err.error || `请求失败 (${response.status})`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("无法读取流式响应");

  const decoder = new TextDecoder();
  let buf = "";
  const onProgress = options?.onProgress;
  let accumulatedText = "";
  let expectDonePayload = false;

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    const lines = buf.split("\n"); buf = lines.pop() || "";
    for (const line of lines) {
      const t = line.trim();
      if (!t.startsWith("data: ")) continue;
      const payload = t.slice(6);

      // ── 心跳信号 ──
      if (payload === "__START__") continue;

      // ── DONE 标记：下一行是结构化元数据 ──
      if (payload === "__DONE__") { expectDonePayload = true; continue; }

      // ── 结构化元数据尾帧 ──
      if (expectDonePayload) {
        expectDonePayload = false;
        try {
          const meta = JSON.parse(payload);
          // 优先使用 meta 中的 rawMarkdown（后端已组装），否则用前端累积的文本
          return {
            ...meta,
            rawMarkdown: meta.rawMarkdown || accumulatedText,
          } as GeneratedContent;
        } catch {
          throw new Error("无法解析服务器返回的结构化结果");
        }
      }

      // ── 普通文本 delta → 累加 + 追加到前端 ──
      accumulatedText += payload;
      if (onProgress) onProgress(payload);
    }
  }
  throw new Error("流式响应意外结束");
}

// ============================================================
// Mock (shared across subjects)
// ============================================================

const MOCK_CORE: CoreObjectives = {
  vocabulary: [{ word: "core concept", meaning: "核心概念" }, { word: "apply", meaning: "应用" }, { word: "solution", meaning: "解答" }],
  keyStructures: ["It is important to understand...（重要的是理解……）"],
  keyPoints: "掌握核心概念的定义与适用场景",
  difficultPoints: "抽象概念的理解和相似概念的区分",
};

const MOCK_QUIZ: QuizData = { studentPaper: "## 📝 随堂测验\n\n### 一、单选题\n\n1. 题干内容...\n   A. 选项A\n   B. 选项B\n   C. 选项C\n   D. 选项D\n\n2. ...\n3. ...\n\n### 二、填空题\n\n4. ..." };

const MOCK_HW: LayeredHomework = { basic: "## A. 基础巩固题（必做）\n\n1. 基础练习\n2. 基础练习2", advanced: "## B. 拓展拔高题（选做）\n\n1. 进阶挑战题" };

const MOCK_ANSWER: AnswerKey = { content: "## 🔑 教师参考答案与解析\n\n<hr />\n\n### 一、随堂测验答案\n\n1. B  解析：...\n2. C  解析：...\n\n### 二、作业答案\n\n#### A. 基础巩固\n1. 参考答案：...\n\n#### B. 拓展拔高\n1. 参考答案：..." };

function genMock(data: FormSubmitData): GeneratedContent {
  const s = data.subject; const m = data.module;
  const title = m === "lesson_plan" ? `${data.topic} — 教学设计（${s}）`
    : m === "quiz_homework" ? `${data.topic} — 随堂测试与作业（${s}）`
      : `${data.topic} — 定制试卷（${s}）`;

  const sections = m === "lesson_plan" ? [
    { emoji: "🎯", title: "导入环节", body: `* 回顾上节课内容\n* 引出主题「${data.topic}」\n\n🗣️ Teacher's Script:\n"Good morning! Today we will explore ${data.topic}."` },
    { emoji: "📖", title: "新知讲授", body: `* 知识点一：...\n* 知识点二：...\n\n🗣️ Teacher's Script:\n"Let's look at this example..."` },
    { emoji: "✏️", title: "课堂练习", body: `* 练习1：...\n* 练习2：...\n* 练习3：...` },
    { emoji: "🌟", title: "总结", body: `* 本节课核心收获\n* 下节课预告` },
  ] : [];

  const rawMarkdown = [
    `# ${title}`,
    ...(m === "lesson_plan" ? ["", "### 📚 核心词汇", ...MOCK_CORE.vocabulary.map((v) => `- **${v.word}** — ${v.meaning}`), "", "### 🗣️ 核心句型", ...MOCK_CORE.keyStructures.map((s) => `- ${s}`), `**✅ 重点**：${MOCK_CORE.keyPoints}`, `**⚠️ 难点**：${MOCK_CORE.difficultPoints}`] : []),
    ...(sections.length ? ["", "---", "", ...sections.map((s) => `${s.emoji} **${s.title}**\n\n${s.body}`)] : []),
    ...(m !== "lesson_plan" ? ["", "---", "", MOCK_QUIZ.studentPaper, "", "### 🏡 课后分层作业", "", MOCK_HW.basic, "", MOCK_HW.advanced] : []),
    "", "---", "", MOCK_ANSWER.content,
  ].join("\n");

  return { title, subject: s, module: m, coreObjectives: MOCK_CORE, sections, exercises: "", quiz: MOCK_QUIZ, layeredHomework: MOCK_HW, answerKey: MOCK_ANSWER, rawMarkdown };
}

// ============================================================
// Exports
// ============================================================

interface GenerateOptions {
  onProgress?: (text: string) => void;
  signal?: AbortSignal;
}

export async function generateContent(
  data: FormSubmitData,
  options?: GenerateOptions,
): Promise<GeneratedContent> {
  try { return await callChatAPI(data, options); } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    console.warn("AI API 失败，使用 Mock:", e);
    await new Promise((r) => setTimeout(r, 600));
    return genMock(data);
  }
}

export async function adjustContent(
  direction: "simplify" | "advance",
  current: GeneratedContent,
  options?: GenerateOptions,
): Promise<GeneratedContent> {
  try {
    return await callChatAPI({
      topic: current.title,
      subject: current.subject,
      module: current.module,
      difficulty: "standard", grade: "middle", questionConfigs: [],
      action: direction,
      previousContent: current.rawMarkdown,
    }, options);
  } catch (e) {
    if (e instanceof DOMException && e.name === "AbortError") throw e;
    console.warn("微调 API 失败，使用 Mock:", e);
    await new Promise((r) => setTimeout(r, 500));
    return { ...current, title: `${current.title} (${direction === "simplify" ? "已简化" : "已拔高"})` };
  }
}

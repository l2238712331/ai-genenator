import { NextRequest } from "next/server";
import type { Subject, ModuleTab, Difficulty, GradeLevel, QuestionTypeConfig } from "@/types";

// ════════════════════════════════════════════════════════
// Edge Runtime 强制流式传输 — 绕过云函数超时限制
// ════════════════════════════════════════════════════════
export const runtime = "edge";
export const dynamic = "force-dynamic";

// ============================================================
// Constants
// ============================================================

const GRADE_LABELS: Record<string, string> = { elementary: "小学生", middle: "初中生", high: "高中生" };
const DIFF_LABELS: Record<string, string> = { story: "故事导入版（低基础）", standard: "标准刷题版（中等生）", competition: "竞赛拔高版（优等生）" };
const SUBJECT_LABELS: Record<string, string> = {
  english: "英语", math: "数学", chinese: "语文",
  physics: "物理", chemistry: "化学", biology: "生物",
  history: "历史", geography: "地理", politics: "政治",
};

/** 科目专属 Prompt 提示语 */
const SUBJECT_HINTS: Record<string, string> = {
  english: "注重词汇、语法和语言运用，题干和选项尽量用英文",
  math: "注重公式推导和严谨的逻辑证明，要求写出完整解题步骤",
  chinese: "注重语言文字功底、阅读理解和写作表达能力",
  physics: "注重物理公式推导与实验步骤，结合生活实际场景分析",
  chemistry: "注重化学方程式书写、实验操作流程和工艺流程分析",
  biology: "注重图表数据分析、实验设计和生物学原理解释",
  history: "注重史料解析能力，结合材料与所学知识分析历史事件",
  geography: "注重读图分析能力和地理原理应用，结合材料与所学知识综合分析",
  politics: "注重理论联系实际，结合时政材料进行分析论述",
};

// ============================================================
// Dynamic Prompt Builder
// ============================================================

function buildPrompt(
  topic: string, subject: Subject, module: ModuleTab,
  difficulty: Difficulty, grade: GradeLevel, questionConfigs: QuestionTypeConfig[],
  customQuestion?: { enabled: boolean; description: string; count: number },
): string {
  const subjectName = SUBJECT_LABELS[subject];
  const gradeName = GRADE_LABELS[grade];
  const diffName = DIFF_LABELS[difficulty];
  const subjectHint = SUBJECT_HINTS[subject] || "";

  const qDesc = questionConfigs
    .map((q) => `${q.label} × ${q.count}题`)
    .join("、");
  const totalQ = questionConfigs.reduce((s, q) => s + q.count, 0);

  // ══════════════════════════════════════════════
  // 最高防御指令
  // ══════════════════════════════════════════════
  const antiLazy = `🚨 最高防偷懒指令：
1. 绝对禁止"题干内容""选项A""此处省略""略"等占位符，必须编造真实的、符合${gradeName}水平的题目。
2. 绝对禁止中途截断，必须把全部题目、答案、解析一个字符都不落地输出完毕。
3. 每题解析必须写完整推理过程，禁止"略""同前""参见教材"。
4. 题目必须包含具体数字、具体年份、具体人物或化合物名称，不能是抽象空泛的描述。`;

  // ══════════════════════════════════════════════
  // 模块一：实操讲义教案
  // ══════════════════════════════════════════════
  if (module === "lesson_plan") {
    return `你是资深K12${subjectName}教师。请为"${topic}"生成一份纯文本教案（禁止 JSON），直接输出 Markdown。

${antiLazy}

## 基本信息
- 科目：${subjectName}
- 学段：${gradeName}
- 难度：${diffName}
- 特色要求：${subjectHint}

## 输出格式（严格按以下结构输出纯 Markdown）

# ${topic} — 授课教案

## 🎯 教学目标与核心素养
用 3-4 句话描述：本节课学生将掌握什么知识与能力，培养什么思维或素养。

## 🔑 核心词汇与重难点
（使用 Markdown 表格；如为理科则列术语/公式）

| 词汇/术语 | 释义/公式 | 核心用法/示例 |
|-----------|----------|--------------|
| term1 | 说明 | 例句或应用场景 |
| term2 | 说明 | 例句或应用场景 |

**✅ 教学重点：**（20-30字）
**⚠️ 教学难点：**（20-30字，指出学生易错/困惑之处）

## 💬 逐字稿式授课流程

严格按 [🎯导入 → 📖讲解 → ✋互动 → 🌟总结] 四步展开。

### 🎯 导入环节（5分钟）
**教师行为：**（1-2句描述）
**老师说：** "..."

### 📖 新知讲授（15分钟）
**教师行为：**（1-2句描述）
**老师说：** "..."

### ✋ 互动练习（8分钟）
**教师行为：**（1-2句描述）
**老师说：** "..."

### 🌟 课堂总结（5分钟）
**教师行为：**（1-2句描述）
**老师说：** "..."
`;
  }

  // ══════════════════════════════════════════════
  // 模块二：随堂测试与作业
  // ══════════════════════════════════════════════
  if (module === "quiz_homework") {
    return `你是资深K12${subjectName}出题教师。请为"${topic}"生成${totalQ}道随堂测试题。

${antiLazy}

## 要求
- 题型：${qDesc || "按需出题"}
- 学段：${gradeName} / 难度：${diffName}
- 特色：${subjectHint}

## 输出格式（前后彻底分离，纯 Markdown，禁止 JSON 包装）

# ${topic} — 随堂测试与作业

## 📝 第一部分：学生练习卷

### 一、选择题
（生成真实的${subjectName}试题，选项 A/B/C/D 每行一个，每题注明题号）

**第1题** [题干]
A. [具体选项]
B. [具体选项]
C. [具体选项]
D. [具体选项]

**第2题** ...

### 二、填空题
（如需此题型）

**第3题** [题干] ______

### 三、简答题/计算题
（如需此题型）

**第4题** [题干]
（答题区：________________________）
${customQuestion?.enabled && customQuestion.description
    ? `\n### 四、🎨 自定义附加题\n请按以下个性化需求生成 **${customQuestion.count} 道**真实、完整的题目：\n> ${customQuestion.description}\n\n**第5题** [题干]\nA. [选项]  B. [选项]  C. [选项]  D. [选项]\n\n**第6题** ...`
    : ""}

## 🏡 课后分层作业

### A. 基础巩固（必做）
**第5题** ...

### B. 拓展拔高（选做 ★）
**第6题** ...

---

## ⚠️ 第二部分：教师参考答案（请勿发给学生）

### 一、选择题答案
**第1题** 正确答案：X | 解析：（写清考点与推理过程）
**第2题** 正确答案：X | 解析：...

### 二、填空题答案
**第3题** 正确答案：... | 解析：...

### 三、简答题答案与评分标准
**第4题** 参考答案：... | 评分要点：...
${customQuestion?.enabled && customQuestion.description
    ? `\n### 四、🎨 自定义附加题答案\n**第5题** 正确答案：... | 解析：...\n**第6题** ...`
    : ""}

### 课后作业答案
**第5题** ... | **第6题** ...
`;
  }

  // ══════════════════════════════════════════════
  // 模块三：弹性定制试卷
  // ══════════════════════════════════════════════
  return `你是资深K12${subjectName}命题教师。请为"${topic}"生成一份正式的标准化试卷。

${antiLazy}

## 要求
- 题型：${qDesc || "按需出题"}
- 学段：${gradeName} / 难度：${diffName}
- 特色：${subjectHint}

## 输出格式（正式打印试卷格式，纯 Markdown，禁止 JSON 包装）

# ${subjectName}阶段模拟测试卷

## 📄 试卷信息

> 测试主题：${topic}
> 姓名：________  班级：________  得分：________
> 考试时间：90分钟  满分：100分

---

## 一、单项选择题（每题 X 分，共 Y 分）

**1.** [真实题干内容]
A. [选项]    B. [选项]    C. [选项]    D. [选项]

**2.** [真实题干内容]
A. [选项]    B. [选项]    C. [选项]    D. [选项]

<!-- 按前端要求的数量生成 -->

## 二、填空题（每题 X 分，共 Y 分）

**3.** [题干] ______

## 三、简答/计算题（每题 X 分，共 Y 分）

**4.** [题干]
（答题区：________________________）

## 四、材料分析题（每题 X 分，共 Y 分）

**阅读以下材料：**
[编造不少于 150 字的真实${subjectName}材料文本]

**5.** 根据材料回答：[问题]
（答题区：________________________）
${customQuestion?.enabled && customQuestion.description
    ? `\n## 五、自定义附加题（${customQuestion.description}）\n\n请按以下个性化需求生成 **${customQuestion.count} 道**真实、完整的题目：\n> ${customQuestion.description}\n\n**6.** [题干]\n（答题区：________________________）`
    : ""}

---

# 🏆 试卷标准答案及深度解析册

> ⚠️ 教师专用 · 请勿发给学生

## 一、单项选择题答案

**[第1题]** 正确答案：X
解析：（完整推理：为什么选X，其他选项错误原因，涉及的知识点）

**[第2题]** 正确答案：X
解析：...

## 二、填空题答案

**[第3题]** 正确答案：... | 解析：...

## 三、简答/计算题答案

**[第4题]** 参考答案：... | 评分要点与得分步骤：...

## 四、材料分析题答案

**[第5题]** 参考答案：... | 得分关键点：...
${customQuestion?.enabled && customQuestion.description
    ? `\n## 五、自定义附加题答案\n**[第6题]** 正确答案：... | 解析：...\n\n（按自定义要求生成 ${customQuestion.count} 道题及答案，延续上述题号）`
    : ""}
`;
}

function buildAdjustPrompt(direction: "simplify" | "advance", previousRaw: string): string {
  const adj = direction === "simplify" ? "降低" : "提升";
  const strat = direction === "simplify"
    ? "将词汇替换为更日常的同义词，将复杂句拆为简单句，测试题难度同步降低"
    : "将基础词替换为进阶学术词，增加复合句，测试题难度同步提升";

  return `对以下内容进行平滑难度微调（${adj}约10~15%），保持主题和结构不变。

微调策略：${strat}

原内容：${previousRaw}

请输出更新后的完整 JSON。`;
}

// ============================================================
// POST handler
// ============================================================

export async function POST(request: NextRequest) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const baseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1";

  if (!apiKey) {
    return new Response(JSON.stringify({ error: "未配置 DEEPSEEK_API_KEY" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch {
    return new Response(JSON.stringify({ error: "无效请求体" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  const { topic, subject, module: mod, difficulty, grade, questionConfigs = [], customQuestion, action = "generate", previousContent } = body as Record<string, unknown>;

  if (!topic || !subject || !mod || !difficulty || !grade) {
    return new Response(JSON.stringify({ error: "缺少必要参数" }), { status: 400, headers: { "Content-Type": "application/json" } });
  }

  let systemPrompt: string;
  let userPrompt: string;

  if (action === "simplify" || action === "advance") {
    if (!previousContent) {
      return new Response(JSON.stringify({ error: "微调需要 previousContent" }), { status: 400, headers: { "Content-Type": "application/json" } });
    }
    systemPrompt = buildAdjustPrompt(action as "simplify" | "advance", previousContent as string);
    userPrompt = `请对上述内容进行"${action === "simplify" ? "稍稍简化" : "稍稍拔高"}"处理，输出完整 JSON。`;
  } else {
    systemPrompt = buildPrompt(
      topic as string, subject as Subject, mod as ModuleTab,
      difficulty as Difficulty, grade as GradeLevel,
      (questionConfigs as QuestionTypeConfig[]) || [],
      customQuestion as { enabled: boolean; description: string; count: number } | undefined,
    );
    userPrompt = `请为【${SUBJECT_LABELS[subject as string]}·${topic}】生成内容。按上述格式输出纯 Markdown，不要输出 JSON。`;
  }

  console.log(`[API/chat] subject=${subject} module=${mod} action=${action}`);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      // ═══ 即时心跳：发送连接建立信号，防止浏览器超时 ═══
      controller.enqueue(encoder.encode("data: __START__\n\n"));

      let fullContent = "";

      try {
        const res = await fetch(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }], max_tokens: 8192, temperature: 0.8, stream: true }),
          signal: AbortSignal.timeout(120000),
        });

        if (!res.ok) {
          console.error("[API/chat] DeepSeek error:", res.status);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", message: `DeepSeek 返回错误 (${res.status})` })}\n\n`));
          controller.close(); return;
        }

        const reader = res.body?.getReader();
        if (!reader) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", message: "无法读取流" })}\n\n`));
          controller.close(); return;
        }

        const decoder = new TextDecoder();
        let buf = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });
          const lines = buf.split("\n"); buf = lines.pop() || "";
          for (const line of lines) {
            const t = line.trim();
            if (!t.startsWith("data: ")) continue;
            const d = t.slice(6);
            if (d === "[DONE]") continue;
            try {
              const delta = JSON.parse(d).choices?.[0]?.delta?.content;
              if (delta) {
                fullContent += delta;
                // 原始文本直传：不做 JSON 包装，零额外开销
                controller.enqueue(encoder.encode(`data: ${delta}\n\n`));
              }
            } catch { /* skip malformed chunks */ }
          }
        }

        // ── 完成：所有模块统一 rawMarkdown 直传 ──
        const title = `${topic} — ${SUBJECT_LABELS[subject as string]}`;

        // 教案尝试提取标题和核心目标（可选优化，失败不影响渲染）
        let extractedTitle = title;
        const sections: { emoji: string; title: string; body: string }[] = [];

        if (mod === "lesson_plan") {
          // 从 Markdown 中提取一级标题
          const titleMatch = fullContent.match(/^# (.+)$/m);
          if (titleMatch) extractedTitle = titleMatch[1].trim();

          // 提取四步流程为 sections
          const stepRegex = /### (🎯|📖|✋|🌟) (.+?)（(\d+)分钟\)\n\*\*教师行为：\*\*(.+?)\n\*\*老师说：\*\*\s*"([\s\S]*?)"/g;
          let m: RegExpExecArray | null;
          while ((m = stepRegex.exec(fullContent)) !== null) {
            sections.push({
              emoji: m[1],
              title: `${m[2]}（${m[3]}分钟）`,
              body: `**教师行为：**${m[4].trim()}\n\n**老师说：** "${m[5].trim()}"`,
            });
          }
        }

        const meta = {
          title: extractedTitle,
          subject, module: mod,
          coreObjectives: { vocabulary: [] as { word: string; meaning: string }[], keyStructures: [] as string[], keyPoints: "", difficultPoints: "" },
          sections,
          exercises: "",
          quiz: { studentPaper: mod === "lesson_plan" ? "" : fullContent },
          layeredHomework: { basic: "", advanced: "" },
          answerKey: { content: "" },
          rawMarkdown: fullContent,
        };

        console.log(`[API/chat] OK — module=${mod} len=${fullContent.length} sections=${sections.length}`);
        controller.enqueue(encoder.encode(`data: __DONE__\n\n`));
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(meta)}\n\n`));
      } catch (e) {
        console.error("[API/chat] Stream error:", e);
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "error", message: e instanceof Error ? e.message : "服务器错误" })}\n\n`));
      } finally { controller.close(); }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform, max-age=0",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

import { NextRequest } from "next/server";

const GRADE_LABELS: Record<string, string> = {
  elementary: "小学生",
  middle: "初中生",
  high: "高中生",
};

const DIFF_LABELS: Record<string, string> = {
  story: "故事导入版（低基础）",
  standard: "标准刷题版（中等生）",
  competition: "竞赛拔高版（优等生）",
};

// ============================================================
// SSE helper
// ============================================================
function sendSSE(
  controller: ReadableStreamDefaultController,
  data: Record<string, unknown>,
): void {
  controller.enqueue(
    new TextEncoder().encode(`data: ${JSON.stringify(data)}\n\n`),
  );
}

// ============================================================
// Prompt: 初始生成 — 实操讲义格式（拒绝描述，突出内容本身）
// ============================================================
const SYSTEM_PROMPT_GENERATE = `你是一位资深K12教案设计师。你必须生成一份【老师能直接拿上讲台】的实操教案。

【核心排版原则 — 极其重要】
- 严禁连续输出超过 3 行的纯描述性文字。每段 body 必须用 \`*\` 或 \`-\` 或 \`1.\` 进行列表化、结构化断句。
- 教案的 body 应该是【老师要讲什么、学生要练什么】，而不是【老师怎么教、学生怎么想】。
- 不要写"教师可以引导学生思考……"、"通过提问让学生……"这类教学方法描述。改为直接输出教学内容：知识清单、对比表格、例句、练习题。
- 在关键教学环节中，必须加入【🗣️ Teacher's Script】模块——即老师可以直接念出来的课堂用语（英文 + 中文对照）。

【严格 JSON 格式】只输出 JSON，不要 markdown 或额外文字：
{
  "title": "课程标题（含主题·难度·学段）",

  "coreObjectives": {
    "vocabulary": [
      { "word": "English Word/Phrase", "meaning": "中文释义" }
    ],
    "keyStructures": ["句型1（英文 + 中文翻译）", "句型2（英文 + 中文翻译）"],
    "keyPoints": "教学重点：一句话概括本课核心知识点（20-30字）",
    "difficultPoints": "教学难点：学生可能卡住的具体概念或步骤（20-30字）"
  },

  "sections": [
    {
      "emoji": "🎯",
      "title": "教学环节标题",
      "body": "该环节的内容主体。每行以 * 或 - 开头，使用 \\n 分隔。严禁超过3行的长段落。示例：\\n* 知识点A：... \\n* 知识点B：... \\n\\n🗣️ Teacher's Script:\\n\\"Good morning class! Today we are going to learn about...\\"\\n（老师可以这样说：今天我们学习……）"
    }
  ],

  "exercises": "课后练习（以 - 列表形式，50-100字中文）",

  "quiz": {
    "studentPaper": "## 📝 随堂测验（Student Version）\\n\\n### 一、单选题\\n\\n1. 题干（英文）\\n   A. 选项A\\n   B. 选项B\\n   C. 选项C\\n   D. 选项D\\n\\n2. ...\\n3. ...\\n\\n### 二、填空题\\n\\n4. 题干 ..."
  },

  "layeredHomework": {
    "basic": "## A. 基础巩固题（必做）\\n\\n1. 题1\\n2. 题2",
    "advanced": "## B. 拓展拔高题（选做）\\n\\n1. 挑战题"
  },

  "answerKey": {
    "content": "## 🔑 教师参考答案页\\n\\n### 一、随堂测验答案\\n\\n1. 正确答案：X  解析：...\\n\\n### 二、作业答案\\n\\n#### A. 基础巩固题\\n1. 答案：...\\n\\n#### B. 拓展拔高题\\n1. 答案：..."
  }
}

【各模块具体要求】

1. coreObjectives：
   - vocabulary：列出 5-8 个核心英语单词/短语 + 中文释义
   - keyStructures：列出 1-2 条重点句型（英文+中文翻译）
   - keyPoints：一句话，20-30字
   - difficultPoints：一句话，20-30字

2. sections（4-5个教学环节）：
   - body 必须是【列表化】的教学内容清单（知识点、例句、对比表），不是教学方法描述
   - 每个 body 中必须包含至少一个 🗣️ Teacher's Script 模块
   - Script 格式：英文课堂用语 + （中文翻译）
   - 故事导入版：内容简单直观，Script 用简单英文
   - 标准刷题版：知识点系统化，Script 中英对照自然
   - 竞赛拔高版：知识点有深度，Script 用进阶学术表达
   - body 总长度 120-250 字

3. quiz.studentPaper：
   - 3 道英语单选题 + 1 道英语填空题
   - 题号清晰，A/B/C/D 换行对齐，绝无答案

4. layeredHomework：
   - A. 基础巩固题（必做）：1-2 题，全体学生适用
   - B. 拓展拔高题（选做）：1 题，学有余力学生适用

5. answerKey.content：
   - 以 "## 🔑 教师参考答案页" 开头
   - 标明每道题的正确答案与核心解析`;


// ============================================================
// Prompt: 平滑微调（simplify / advance）
// ============================================================
function buildAdjustPrompt(
  direction: "simplify" | "advance",
  previousRawMarkdown: string,
): string {
  const intensity = direction === "simplify" ? "降低" : "提升";
  const range = "约10%~15%";

  const simplifyStrategy = `
简化策略：
- 将进阶词汇替换为更日常、高频的基础同义词
- 将长难句拆分为更短、更易理解的简单句
- 随堂测验的英语题干和选项同步简化
- 分层作业的基础题保持简单，拔高题适当降低思考难度
- 保持所有教学环节结构和标题不变`;

  const advanceStrategy = `
拔高策略：
- 将基础词汇替换为更书面、进阶的同义词
- 适当增加复合句和修饰从句
- 随堂测验的英语题干和选项同步提升（使用更丰富的学术词汇）
- 分层作业的拔高题增加思考深度
- 保持所有教学环节结构和标题不变`;

  const strategy = direction === "simplify" ? simplifyStrategy : advanceStrategy;

  return `你是一位资深教案设计师。请对以下已生成的教案进行"平滑难度微调"。

【核心约束 — 极其重要】
- 保持当前教学主题与核心大纲完全不变
- 保持 coreObjectives.vocabulary 词汇数量不变，仅替换同义词或调整释义难度
- 保持 sections 数组的环节数量与标题结构不变
- 仅在原有内容基础上，将整体词汇和句型难度${intensity}${range}
- 同时，将随堂测验（quiz）、分层作业（layeredHomework）和答案页（answerKey）的难度同步微调
- 绝对不能出现跨学段的难度暴跳
- ${strategy}

【当前教案完整内容（含 JSON 结构）】
${previousRawMarkdown}

【输出格式】
请严格输出一个 JSON 对象，字段结构与原教案完全一致，包含：
title, coreObjectives, sections, exercises, quiz, layeredHomework, answerKey

只输出 JSON，不要输出其他任何内容。`;
}

// ============================================================
// Main handler
// ============================================================
export async function POST(request: NextRequest) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const baseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1";

  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "服务器未配置 DEEPSEEK_API_KEY" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  let body: { topic?: string; difficulty?: string; grade?: string; action?: string; previousContent?: string };
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: "无效的请求体" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const { topic, difficulty, grade, action = "generate", previousContent } = body;

  if (!topic || !difficulty || !grade) {
    return new Response(
      JSON.stringify({ error: "缺少必要参数：topic, difficulty, grade" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    );
  }

  const gradeLabel = GRADE_LABELS[grade] || grade;
  const diffLabel = DIFF_LABELS[difficulty] || difficulty;

  let systemPrompt: string;
  let userPrompt: string;

  if (action === "simplify" || action === "advance") {
    if (!previousContent) {
      return new Response(
        JSON.stringify({ error: "平滑微调需要提供 previousContent" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }
    systemPrompt = buildAdjustPrompt(action, previousContent);
    userPrompt = `请对上述教案进行"${action === "simplify" ? "稍稍简化" : "稍稍拔高"}"处理，输出更新后的完整教案 JSON。`;
  } else {
    systemPrompt = SYSTEM_PROMPT_GENERATE;
    userPrompt = `请为以下课程生成教案：
- 知识点主题：${topic}
- 难度级别：${diffLabel}
- 学段：${gradeLabel}

请直接输出 JSON。`;
  }

  console.log(`[API/chat] Action=${action} | topic=${topic} | diff=${difficulty} | grade=${grade}`);

  const stream = new ReadableStream({
    async start(controller) {
      let fullContent = "";

      try {
        const dsResponse = await fetch(`${baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "deepseek-chat",
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userPrompt },
            ],
            max_tokens: 4096,
            temperature: 0.8,
            stream: true,
          }),
          signal: AbortSignal.timeout(60000),
        });

        if (!dsResponse.ok) {
          console.error("[API/chat] DeepSeek error:", dsResponse.status, await dsResponse.text().catch(() => ""));
          sendSSE(controller, { type: "error", message: `DeepSeek API 返回错误 (${dsResponse.status})` });
          controller.close();
          return;
        }

        const reader = dsResponse.body?.getReader();
        if (!reader) {
          sendSSE(controller, { type: "error", message: "无法读取 AI 响应流" });
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || !trimmed.startsWith("data: ")) continue;

            const dataStr = trimmed.slice(6);
            if (dataStr === "[DONE]") continue;

            try {
              const chunk = JSON.parse(dataStr);
              const delta = chunk.choices?.[0]?.delta?.content;
              if (delta) fullContent += delta;
            } catch { /* skip malformed chunks */ }
          }
        }

        // ── Robust JSON extraction ──
        let jsonStr = fullContent.trim();

        // Strategy 1: markdown code block
        const mdMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (mdMatch) jsonStr = mdMatch[1].trim();

        // Strategy 2: find outermost {}
        if (!jsonStr.startsWith("{")) {
          const braceStart = jsonStr.indexOf("{");
          const braceEnd = jsonStr.lastIndexOf("}");
          if (braceStart !== -1 && braceEnd > braceStart) {
            jsonStr = jsonStr.slice(braceStart, braceEnd + 1);
          }
        }

        // Strategy 3: fix common JSON issues
        jsonStr = jsonStr
          .replace(/,\s*}/g, "}")
          .replace(/,\s*]/g, "]");

        try {
          const parsed = JSON.parse(jsonStr);

          if (!parsed.sections || !Array.isArray(parsed.sections)) {
            throw new Error("Missing sections array");
          }

          // Ensure all new fields have fallbacks
          const coreObjectives = parsed.coreObjectives || {
            vocabulary: [],
            keyStructures: [],
            keyPoints: "",
            difficultPoints: "",
          };
          const quiz = parsed.quiz || { studentPaper: "" };
          const layeredHomework = parsed.layeredHomework || { basic: "", advanced: "" };
          const answerKey = parsed.answerKey || { content: "" };

          // Build rawMarkdown
          const rawMarkdown = [
            `# ${parsed.title}`,
            "",
            "---",
            "",
            "### 📚 核心词汇 (Core Vocabulary)",
            ...(coreObjectives.vocabulary || []).map(
              (v: { word: string; meaning: string }) => `- **${v.word}** — ${v.meaning}`,
            ),
            "",
            "### 🗣️ 核心句型 (Key Structures)",
            ...(coreObjectives.keyStructures || []).map((s: string) => `- ${s}`),
            "",
            "### 🎯 教学重难点 (Teaching Focus)",
            `**重点**：${coreObjectives.keyPoints || "无"}`,
            "",
            `**难点**：${coreObjectives.difficultPoints || "无"}`,
            "",
            "---",
            "",
            ...parsed.sections.map(
              (s: { emoji: string; title: string; body: string }) =>
                `${s.emoji} **${s.title}**\n\n${s.body}`,
            ),
            "",
            parsed.exercises || "",
            "",
            "---",
            "",
            quiz.studentPaper || "",
            "",
            "---",
            "",
            "### 🏡 课后分层作业 (Layered Homework)",
            "",
            layeredHomework.basic || "",
            "",
            layeredHomework.advanced || "",
            "",
            "---",
            "",
            answerKey.content || "",
          ].join("\n");

          const result = {
            title: parsed.title || "未命名教案",
            coreObjectives,
            sections: parsed.sections,
            exercises: parsed.exercises || "",
            quiz,
            layeredHomework,
            answerKey,
            rawMarkdown,
          };

          console.log(`[API/chat] Success. Sections: ${result.sections.length}, Vocab: ${coreObjectives.vocabulary?.length || 0}`);
          sendSSE(controller, { type: "done", content: JSON.stringify(result) });
        } catch (parseErr) {
          console.error("[API/chat] JSON parse failed:", parseErr);
          console.error("[API/chat] Raw:", fullContent.substring(0, 300));
          sendSSE(controller, { type: "error", message: "AI 返回的内容无法解析为 JSON，请重试" });
        }
      } catch (err) {
        console.error("[API/chat] Stream error:", err);
        sendSSE(controller, { type: "error", message: err instanceof Error ? err.message : "服务器内部错误" });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

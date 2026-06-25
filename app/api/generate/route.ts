import { NextRequest, NextResponse } from "next/server";

const SYSTEM_PROMPT = `你是一位资深教案设计师，专门为K12教师生成高质量的教学讲义。

请根据用户提供的课程主题、难度级别和学段，生成一份结构化的教案。

你的输出必须严格是一个 JSON 对象，格式如下（不要输出 markdown 或额外文字）：
{
  "title": "课程标题（包含主题·难度·学段信息）",
  "sections": [
    {
      "emoji": "📖",
      "title": "教学环节标题",
      "body": "该环节的详细教学内容，使用 \\n 分隔段落"
    }
  ],
  "exercises": "课后练习内容，包含3-5道题目，使用 \\n 分隔"
}

要求：
- sections 数组包含 4-5 个教学环节，每个环节有不同的 emoji 和浅色背景风格
- 根据难度调整内容深度：故事导入版（低基础）偏趣味和直观，标准刷题版（中等生）偏系统和规范，竞赛拔高版（优等生）偏深度和技巧
- 根据学段调整语言难度和内容复杂度
- body 和 exercises 中的文字内容要丰富、专业、可落地，每个段至少80-150字
- emoji 必须与环节内容匹配（如：导入用🎯📖、练习用✏️📝、总结用🌟🎓等）
- 只输出 JSON，不要输出其他任何内容`;

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

export async function POST(request: NextRequest) {
  try {
    const { topic, difficulty, grade } = await request.json();

    if (!topic || !difficulty || !grade) {
      return NextResponse.json(
        { error: "缺少必要参数：topic, difficulty, grade" },
        { status: 400 }
      );
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    const baseUrl = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com/v1";

    if (!apiKey) {
      return NextResponse.json(
        { error: "服务器未配置 DEEPSEEK_API_KEY" },
        { status: 500 }
      );
    }

    const gradeLabel = GRADE_LABELS[grade] || grade;
    const diffLabel = DIFF_LABELS[difficulty] || difficulty;

    const userPrompt = `请为以下课程生成教案：
- 知识点主题：${topic}
- 难度级别：${diffLabel}
- 学段：${gradeLabel}

请直接输出 JSON。`;

    console.log("[API] Calling DeepSeek for topic:", topic);

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 4096,
        temperature: 0.8,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[API] DeepSeek error:", response.status, errorText);
      return NextResponse.json(
        { error: `DeepSeek API 返回错误 (${response.status})` },
        { status: 502 }
      );
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || "";

    // 提取 JSON
    let jsonStr = rawContent.trim();
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error("[API] Failed to parse DeepSeek response:", jsonStr.substring(0, 200));
      return NextResponse.json(
        { error: "AI 返回的内容格式无法解析" },
        { status: 502 }
      );
    }

    // 构建 rawMarkdown
    const rawMarkdown = [
      `# ${parsed.title}`,
      "",
      ...(parsed.sections || []).map(
        (s: { emoji: string; title: string; body: string }) =>
          `${s.emoji} **${s.title}**\n\n${s.body}`
      ),
      "",
      parsed.exercises || "",
    ].join("\n");

    console.log("[API] Successfully generated content:", parsed.title);

    return NextResponse.json({
      title: parsed.title,
      sections: parsed.sections,
      exercises: parsed.exercises,
      rawMarkdown,
    });
  } catch (error) {
    console.error("[API] Unexpected error:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}

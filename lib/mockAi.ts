import {
  GeneratedContent,
  Difficulty,
  GradeLevel,
  SectionCard,
  CoreObjectives,
  QuizData,
  LayeredHomework,
  AnswerKey,
} from "@/types";

// ============================================================
// SSE stream reader: call /api/chat with streaming
// ============================================================

interface SSECallParams {
  topic: string;
  difficulty: Difficulty;
  grade: GradeLevel;
  action?: "generate" | "simplify" | "advance";
  previousContent?: string;
}

async function callChatAPI(params: SSECallParams): Promise<GeneratedContent> {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      topic: params.topic,
      difficulty: params.difficulty,
      grade: params.grade,
      action: params.action || "generate",
      previousContent: params.previousContent || undefined,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
    throw new Error(err.error || `API 请求失败 (${response.status})`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("无法读取流式响应");

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
      try {
        const event = JSON.parse(dataStr);
        if (event.type === "done") {
          return JSON.parse(event.content) as GeneratedContent;
        }
        if (event.type === "error") {
          throw new Error(event.message || "服务器返回错误");
        }
      } catch (e) {
        if (e instanceof Error && e.message.includes("服务器返回错误")) throw e;
      }
    }
  }

  throw new Error("流式响应意外结束，未收到完整数据");
}

// ============================================================
// Mock fallback — structured to match new GeneratedContent
// ============================================================

function buildCoreObjectives(): CoreObjectives {
  return {
    vocabulary: [
      { word: "analyze", meaning: "分析" },
      { word: "concept", meaning: "概念" },
      { word: "apply", meaning: "应用；运用" },
      { word: "evaluate", meaning: "评估；评价" },
      { word: "solution", meaning: "解决方案" },
      { word: "approach", meaning: "方法；途径" },
    ],
    keyStructures: [
      "It is important to understand that...（重要的是要理解……）",
      "By applying this concept, we can...（通过应用这个概念，我们可以……）",
    ],
    keyPoints:
      "本节课的教学重点是让学生理解核心概念的定义与适用场景，掌握基本解题步骤，并能够准确运用所学知识解决常规题型。",
    difficultPoints:
      "学生可能在抽象概念的理解上遇到障碍，容易混淆相似概念；在解题过程中容易忽略条件限制或解题步骤的完整性。",
  };
}

function buildSectionCards(topic: string, difficulty: Difficulty, grade: GradeLevel): SectionCard[] {
  const gradeLabel = grade === "elementary" ? "小学生" : grade === "middle" ? "初中生" : "高中生";

  if (difficulty === "story") {
    return [
      {
        emoji: "📖",
        title: "趣味导入",
        body: `同学们好！今天老师要给大家讲一个有趣的故事……\n\n通过这个故事，我们来一起探索「${topic}」的奥秘。请同学们想一想，故事里发生了什么有趣的事情呢？这会帮助我们更好地理解今天要学的内容。\n\n适合${gradeLabel}的认知水平，让我们从故事开始，慢慢进入知识的海洋。`,
      },
      {
        emoji: "💡",
        title: "概念讲解",
        body: `现在让我们正式学习「${topic}」的基本概念。\n\n老师会用最简单易懂的方式，一步一步带领大家理解核心知识点。不用担心基础薄弱，我们会通过大量生活中的例子来帮助理解。\n\n关键点：\n- 概念一：基础定义及生活案例\n- 概念二：直观理解方法\n- 概念三：简单应用场景`,
      },
      {
        emoji: "✏️",
        title: "随堂练习",
        body: `让我们做几道简单的练习题来巩固一下吧！\n\n题目难度较低，主要是帮助大家建立信心。每道题都有详细提示，做错了也没关系，我们一起分析错在哪里。\n\n请同学们独立完成，完成后同桌互相检查。`,
      },
      {
        emoji: "🌟",
        title: "课堂总结",
        body: `今天我们学习了「${topic}」的基础知识。\n\n回顾一下今天的内容：\n1. 我们通过故事引入，理解了基本概念\n2. 学习了核心知识点\n3. 完成了随堂练习\n\n同学们今天表现非常棒！记得复习今天的内容哦。`,
      },
    ];
  }

  if (difficulty === "standard") {
    return [
      {
        emoji: "🎯",
        title: "复习导入",
        body: `上课！请同学们回顾一下上节课我们学过的相关内容。\n\n今天我们要学习「${topic}」，这是在之前知识基础上的深化和拓展。请同学们先独立完成黑板上的复习题，时间为5分钟。\n\n适合${gradeLabel}的标准教学进度。`,
      },
      {
        emoji: "📖",
        title: "新课讲授",
        body: `现在进入今天的核心内容——「${topic}」。\n\n我们将从以下几个方面展开：\n\n**一、知识框架梳理**\n建立完整的知识结构，理清各个概念之间的关系。\n\n**二、核心原理分析**\n深入理解公式/定理的推导过程，做到知其然更知其所以然。\n\n**三、典型例题精讲**\n通过2-3道经典例题，展示标准解题思路和规范答题格式。`,
      },
      {
        emoji: "✏️",
        title: "课堂练习",
        body: `请同学们完成以下练习题，时间为15分钟。\n\n练习题分为三个层次：\n- 基础题（必做）：巩固基本概念\n- 提高题（选做）：锻炼综合运用能力\n- 拓展题（思考）：挑战思维深度\n\n完成后请举手，老师会巡视检查。重点关注解题步骤的规范性。`,
      },
      {
        emoji: "🔍",
        title: "错题分析",
        body: `现在我们一起来分析练习中的典型错误。\n\n常见错误类型：\n1. 概念混淆导致的判断错误\n2. 计算粗心引起的低级错误\n3. 解题步骤不完整导致的丢分\n\n请同学们对照自己的答案，进行订正。`,
      },
      {
        emoji: "🌟",
        title: "课堂总结与作业",
        body: `今天我们系统学习了「${topic}」，重点需要掌握：\n1. 核心概念及其应用\n2. 标准解题流程\n3. 常见易错点\n\n课后作业：完成《同步练习》对应章节，明天上课检查。`,
      },
    ];
  }

  return [
    {
      emoji: "🏆",
      title: "竞赛视角引入",
      body: `同学们，今天我们从竞赛的角度来重新审视「${topic}」。\n\n这个问题在近年各类竞赛中频繁出现，考察的不只是基础知识，更是思维的深度和解题的灵活性。\n\n让我们先看一道经典竞赛题，感受一下竞赛题的出题风格和难度层级。适合${gradeLabel}中的优秀学生。`,
    },
    {
      emoji: "📖",
      title: "高阶理论深化",
      body: `在掌握了基础内容后，我们进一步探索「${topic}」的深层理论。\n\n**一、定理的推广与变形**\n从课本定理出发，推广到更一般的情形，理解其数学本质。\n\n**二、技巧与方法论**\n竞赛中常用的特殊技巧：\n- 构造法：巧设辅助元素\n- 极端原理：考虑边界情况\n- 不变量思想：寻找过程中的不变量`,
    },
    {
      emoji: "🧩",
      title: "竞赛真题精讲",
      body: `让我们来精讲3道经典竞赛真题。\n\n每道题从以下角度分析：\n1. 题目背景与考察意图\n2. 切入点与破题思路\n3. 完整解答过程\n4. 多种解法对比\n5. 题目变式与拓展\n\n注意体会竞赛题中隐藏的"题眼"和关键条件。`,
    },
    {
      emoji: "📝",
      title: "限时挑战训练",
      body: `现在进入限时训练环节！\n\n请在30分钟内完成以下3道题目。难度接近真实竞赛水平，重点考察独立思考能力和解题速度。\n\n建议策略：\n- 先浏览全部题目，从最有把握的开始\n- 合理分配时间，避免在一道题上卡太久\n- 写出关键步骤即可`,
    },
    {
      emoji: "🎓",
      title: "总结与竞赛策略",
      body: `今天我们围绕「${topic}」进行了竞赛级别的深度学习。\n\n核心收获：\n1. 掌握了竞赛中常见的考点和题型\n2. 学会了多种高阶解题技巧\n3. 通过限时训练提升了应试能力\n\n竞赛建议：平常多积累、多总结，建立"解题方法库"。善用错题本，定期复盘。`,
    },
  ];
}

function buildExercises(topic: string): string {
  return `**课后练习**

1. 请简述「${topic}」的核心概念，并举例说明。
2. 完成以下计算题（共5小题），要求写出完整的解题步骤。
3. 思考题：尝试将今天所学内容与之前学过的知识进行关联，绘制思维导图。
4. 选做题：查找一道与「${topic}」相关的实际应用题，并分析其解题思路。`;
}

const MOCK_QUIZ: QuizData = {
  studentPaper: `## 📝 随堂测验（Student Version）

### 一、单选题（Choose the best answer）

1. What is the main purpose of today's lesson?
   A. To memorize formulas without understanding
   B. To understand core concepts and their applications
   C. To finish homework as fast as possible
   D. To skip difficult problems

2. Which of the following correctly describes the key concept?
   A. It only works in specific situations
   B. It is a universal principle with wide applications
   C. It has no real-world relevance
   D. It is too complex to understand

3. What should you do when you encounter a difficult problem?
   A. Give up immediately
   B. Copy from a classmate
   C. Break it down step by step and think carefully
   D. Skip to the next chapter

### 二、填空题（Fill in the blanks）

4. The key to mastering this topic is to understand the \_\_\_\_\_\_\_\_ and apply it to different \_\_\_\_\_\_\_\_.`,
};

const MOCK_HOMEWORK: LayeredHomework = {
  basic: `## A. 基础巩固题（必做）

1. 请独立完成课本 P45 的练习题 1-3，要求步骤完整、格式规范。
2. 用自己的话复述今天所学的核心概念（不少于 50 字）。`,
  advanced: `## B. 拓展拔高题（选做）

1. 请设计一道与本节课知识点相关的原创应用题，并给出完整的解答过程。`,
};

const MOCK_ANSWER_KEY: AnswerKey = {
  content: `## 🔑 教师参考答案页（Teacher Only）

### 一、随堂测验答案

1. **正确答案：B**
   解析：本课的核心目标是理解概念并学会应用，而非死记硬背。

2. **正确答案：B**
   解析：核心知识是具有广泛适用性的基本原理。

3. **正确答案：C**
   解析：面对难题的正确方法是分步思考、逐步解决。

4. **正确答案：core concept / situations**
   解析：掌握核心概念并应用于不同场景是学习的关键。

### 二、课后作业答案

#### A. 基础巩固题
1. 参考答案：见教师用书 P45 详细解答。
2. 示例：本课核心概念……（教师根据课堂实际情况评估）。

#### B. 拓展拔高题
1. 鼓励学生将知识点与实际生活场景结合，自编题目需包含：问题描述、解题步骤、最终答案。`,
};

function generateMockContent(
  topic: string,
  difficulty: Difficulty,
  grade: GradeLevel,
): GeneratedContent {
  const gradeLabel = grade === "elementary" ? "小学生" : grade === "middle" ? "初中生" : "高中生";
  const diffLabel =
    difficulty === "story" ? "故事导入版" : difficulty === "standard" ? "标准刷题版" : "竞赛拔高版";

  const title = `${topic} — 教学设计（${gradeLabel} · ${diffLabel}）`;
  const coreObjectives = buildCoreObjectives();
  const sections = buildSectionCards(topic, difficulty, grade);
  const exercises = buildExercises(topic);

  const rawMarkdown = [
    `# ${title}`,
    "",
    "---",
    "",
    "### 📚 核心词汇 (Core Vocabulary)",
    ...coreObjectives.vocabulary.map((v) => `- **${v.word}** — ${v.meaning}`),
    "",
    "### 🗣️ 核心句型 (Key Structures)",
    ...coreObjectives.keyStructures.map((s) => `- ${s}`),
    "",
    "### 🎯 教学重难点 (Teaching Focus)",
    `**重点**：${coreObjectives.keyPoints}`,
    "",
    `**难点**：${coreObjectives.difficultPoints}`,
    "",
    "---",
    "",
    ...sections.map((s) => `${s.emoji} **${s.title}**\n\n${s.body}`),
    "",
    exercises,
    "",
    "---",
    "",
    MOCK_QUIZ.studentPaper,
    "",
    "---",
    "",
    "### 🏡 课后分层作业 (Layered Homework)",
    "",
    MOCK_HOMEWORK.basic,
    "",
    MOCK_HOMEWORK.advanced,
    "",
    "---",
    "",
    MOCK_ANSWER_KEY.content,
  ].join("\n");

  return {
    title,
    coreObjectives,
    sections,
    exercises,
    quiz: MOCK_QUIZ,
    layeredHomework: MOCK_HOMEWORK,
    answerKey: MOCK_ANSWER_KEY,
    rawMarkdown,
  };
}

// ============================================================
// Main exports
// ============================================================

export async function generateContent(
  topic: string,
  difficulty: Difficulty,
  grade: GradeLevel,
): Promise<GeneratedContent> {
  try {
    return await callChatAPI({ topic, difficulty, grade, action: "generate" });
  } catch (error) {
    console.warn("AI API 调用失败，使用 Mock 数据降级:", error);
    await new Promise((resolve) => setTimeout(resolve, 800));
    return generateMockContent(topic, difficulty, grade);
  }
}

export async function adjustContent(
  direction: "simplify" | "advance",
  currentContent: GeneratedContent,
): Promise<GeneratedContent> {
  try {
    return await callChatAPI({
      topic: currentContent.title,
      difficulty: "standard",
      grade: "middle",
      action: direction,
      previousContent: currentContent.rawMarkdown,
    });
  } catch (error) {
    console.warn("平滑微调 API 调用失败，使用 Mock 数据降级:", error);
    await new Promise((resolve) => setTimeout(resolve, 600));
    const adjusted = generateMockContent("调整后的内容", "standard", "middle");
    adjusted.title = `${currentContent.title} (${direction === "simplify" ? "已简化" : "已拔高"})`;
    return adjusted;
  }
}

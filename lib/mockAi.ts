import { GeneratedContent, Difficulty, GradeLevel, SectionCard } from "@/types";

// ============================================================
// Call our own server-side API route (which proxies to DeepSeek)
// ============================================================

async function callGenerateAPI(topic: string, difficulty: Difficulty, grade: GradeLevel): Promise<GeneratedContent> {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ topic, difficulty, grade }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || `API 请求失败 (${response.status})`);
  }

  return await response.json();
}

// ============================================================
// Mock fallback (offline / API failure backup)
// ============================================================

function buildSectionCards(topic: string, difficulty: Difficulty, grade: GradeLevel): SectionCard[] {
  const gradeLabel = grade === "elementary" ? "小学生" : grade === "middle" ? "初中生" : "高中生";

  if (difficulty === "story") {
    return [
      {
        emoji: "📖",
        title: "趣味导入",
        body: `同学们好！今天老师要给大家讲一个有趣的故事……\n\n通过这个故事，我们来一起探索「${topic}」的奥秘。请同学们想一想，故事里发生了什么有趣的事情呢？这会帮助我们更好地理解今天要学的内容。\n\n适合${gradeLabel}的认知水平，让我们从故事开始，慢慢进入数学的世界。`,
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
        body: `今天我们学习了「${topic}」的基础知识。\n\n回顾一下今天的内容：\n1. 我们通过故事引入，理解了基本概念\n2. 学习了核心知识点\n3. 完成了随堂练习\n\n同学们今天表现非常棒！记得回家后复习今天的内容哦。`,
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
        body: `今天我们系统学习了「${topic}」，重点需要掌握：\n1. 核心概念及其应用\n2. 标准解题流程\n3. 常见易错点\n\n课后作业：完成《同步练习》P42-44，明天上课检查。`,
      },
    ];
  }

  return [
    {
      emoji: "🏆",
      title: "竞赛视角引入",
      body: `同学们，今天我们从竞赛的角度来重新审视「${topic}」。\n\n这个问题在近年各类竞赛中频繁出现，考察的不仅是基础知识，更是思维的深度和解题的灵活性。\n\n让我们先看一道经典竞赛题，感受一下竞赛题的出题风格和难度层级。适合${gradeLabel}中的优秀学生。`,
    },
    {
      emoji: "📖",
      title: "高阶理论深化",
      body: `在掌握了基础内容后，我们进一步探索「${topic}」的深层理论。\n\n**一、定理的推广与变形**\n从课本定理出发，推广到更一般的情形，理解其数学本质。\n\n**二、技巧与方法论**\n竞赛中常用的特殊技巧：\n- 构造法：巧设辅助元素\n- 极端原理：考虑边界情况\n- 不变量思想：寻找过程中的不变量`,
    },
    {
      emoji: "🧩",
      title: "竞赛真题精讲",
      body: `让我们来精讲3道经典竞赛真题。\n\n每道题我们会从以下角度分析：\n1. 题目背景与考察意图\n2. 切入点与破题思路\n3. 完整解答过程\n4. 多种解法对比\n5. 题目变式与拓展\n\n注意体会竞赛题中隐藏的"题眼"和关键条件。`,
    },
    {
      emoji: "📝",
      title: "限时挑战训练",
      body: `现在进入限时训练环节！\n\n请在30分钟内完成以下3道题目。这些题目难度接近真实竞赛水平，重点考察你们的独立思考能力和解题速度。\n\n建议策略：\n- 先浏览全部题目，从最有把握的开始\n- 合理分配时间，避免在一道题上卡太久\n- 写出关键步骤即可，不必过度追求卷面完美`,
    },
    {
      emoji: "🎓",
      title: "总结与竞赛策略",
      body: `今天我们围绕「${topic}」进行了竞赛级别的深度学习。\n\n核心收获：\n1. 掌握了竞赛中常见的考点和题型\n2. 学会了多种高阶解题技巧\n3. 通过限时训练提升了应试能力\n\n竞赛建议：平常多积累、多总结，建立自己的"解题方法库"。善用错题本，定期复盘。`,
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

function generateMockContent(
  topic: string,
  difficulty: Difficulty,
  grade: GradeLevel,
): GeneratedContent {
  const gradeLabel = grade === "elementary" ? "小学生" : grade === "middle" ? "初中生" : "高中生";
  const diffLabel =
    difficulty === "story" ? "故事导入版" : difficulty === "standard" ? "标准刷题版" : "竞赛拔高版";

  const title = `${topic} — 教学设计（${gradeLabel} · ${diffLabel}）`;

  const sections = buildSectionCards(topic, difficulty, grade);
  const exercises = buildExercises(topic);

  const rawMarkdown = [
    `# ${title}`,
    "",
    ...sections.map((s) => `${s.emoji} **${s.title}**\n\n${s.body}`),
    "",
    exercises,
  ].join("\n");

  return { title, sections, exercises, rawMarkdown };
}

// ============================================================
// Main export: try real API first, fallback to mock
// ============================================================

export async function generateContent(
  topic: string,
  difficulty: Difficulty,
  grade: GradeLevel,
): Promise<GeneratedContent> {
  try {
    return await callGenerateAPI(topic, difficulty, grade);
  } catch (error) {
    console.warn("API 调用失败，使用 Mock 数据降级:", error);
    await new Promise((resolve) => setTimeout(resolve, 800));
    return generateMockContent(topic, difficulty, grade);
  }
}

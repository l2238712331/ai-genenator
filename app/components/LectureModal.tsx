"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { cn } from "@/lib/utils";

interface Slide {
  question: string;
  answer: string;
}

interface Props {
  rawMarkdown: string;
  title: string;
  onClose: () => void;
}

export function LectureModal({ rawMarkdown, title, onClose }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // ── 解析 rawMarkdown 为 slides ──
  const slides = useMemo(() => parseSlides(rawMarkdown), [rawMarkdown]);

  // 切换题目时重置答案显示
  const goTo = useCallback((i: number) => {
    const clamped = Math.max(0, Math.min(i, slides.length - 1));
    setCurrentIndex(clamped);
    setShowAnswer(false);
  }, [slides.length]);

  const next = useCallback(() => goTo(currentIndex + 1), [currentIndex, goTo]);
  const prev = useCallback(() => goTo(currentIndex - 1), [currentIndex, goTo]);

  // 键盘监听
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") { e.preventDefault(); prev(); }
      if (e.key === "Escape") { e.preventDefault(); onClose(); }
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); setShowAnswer((v) => !v); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev, onClose]);

  if (slides.length === 0) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center" onClick={onClose}>
        <p className="text-white text-xl">无法解析题目，请返回</p>
      </div>
    );
  }

  const slide = slides[currentIndex];

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col select-none">
      {/* ── Top Bar ── */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-300 text-sm font-medium hover:bg-red-500/30 transition-all"
        >
          <span className="text-lg">❌</span> 退出投屏
        </button>
        <span className="text-gray-400 text-sm hidden md:block">{title}</span>
        <span className="text-gray-500 text-sm">
          {currentIndex + 1} / {slides.length}
        </span>
      </div>

      {/* ── Slide Area ── */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 overflow-hidden">
        <div
          className="w-full max-w-4xl bg-gray-900 rounded-3xl border border-gray-800 shadow-2xl p-8 md:p-12 space-y-8 transition-all duration-300"
          style={{ minHeight: "60vh" }}
        >
          {/* Question */}
          <div className="text-white text-xl md:text-3xl font-medium leading-relaxed whitespace-pre-wrap">
            {slide.question}
          </div>

          {/* Answer Toggle */}
          <div className="pt-4 border-t border-gray-800 space-y-4">
            {!showAnswer ? (
              <button
                onClick={() => setShowAnswer(true)}
                className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-blue-600/20 border border-blue-500/40 text-blue-300 text-lg font-semibold hover:bg-blue-600/30 transition-all mx-auto"
              >
                <span className="text-2xl">👁️</span>
                显示答案与解析
              </button>
            ) : (
              <div className="animate-in fade-in duration-300 space-y-3">
                <div className="text-emerald-400 text-lg md:text-2xl font-semibold">
                  💡 答案与解析
                </div>
                <div className="text-gray-200 text-base md:text-xl leading-relaxed whitespace-pre-wrap bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
                  {slide.answer}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom Nav ── */}
      <div className="flex items-center justify-center gap-4 px-6 py-4 border-t border-gray-800 bg-gray-900/50">
        <button
          onClick={prev}
          disabled={currentIndex === 0}
          className={cn(
            "px-6 py-3 rounded-xl text-lg font-semibold transition-all flex items-center gap-2",
            currentIndex === 0
              ? "text-gray-700 cursor-not-allowed"
              : "text-white bg-gray-800 hover:bg-gray-700 border border-gray-600",
          )}
        >
          ← 上一题
        </button>
        <span className="text-gray-600 text-sm min-w-[60px] text-center">
          {currentIndex + 1}/{slides.length}
        </span>
        <button
          onClick={next}
          disabled={currentIndex === slides.length - 1}
          className={cn(
            "px-6 py-3 rounded-xl text-lg font-semibold transition-all flex items-center gap-2",
            currentIndex === slides.length - 1
              ? "text-gray-700 cursor-not-allowed"
              : "text-white bg-gray-800 hover:bg-gray-700 border border-gray-600",
          )}
        >
          下一题 →
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════
// 双层清洗过滤算法：三步解析
// ══════════════════════════════════════════════

function parseSlides(raw: string): Slide[] {
  // ── 第一步：用 --- 做物理隔离 ──
  const sepIdx = findSeparatorIndex(raw);
  const questionPart = sepIdx >= 0 ? raw.slice(0, sepIdx) : raw;
  const answerPart = sepIdx >= 0 ? raw.slice(sepIdx) : "";

  // ── 第二步：精准正则切分 ──
  const qBlocks = splitQuestions(questionPart);
  const aBlocks = splitAnswers(answerPart);

  // ── 第三步：题号索引键强制对齐 ──
  const answerMap = new Map<string, string>();
  for (const a of aBlocks) {
    const num = extractPrimaryNumber(a);
    if (num) answerMap.set(num, cleanBlock(a));
  }

  const slides: Slide[] = [];
  for (const q of qBlocks) {
    const num = extractPrimaryNumber(q);
    const question = cleanBlock(q);
    if (!question || question.length < 5) continue;
    const answer = num ? (answerMap.get(num) || "（暂无解析）") : "（暂无解析）";
    slides.push({ question, answer });
  }

  return slides;
}

// ── 寻找第一条 --- 分隔线（整行只有 --- 或前面有换行） ──
function findSeparatorIndex(raw: string): number {
  // 优先找答案册标题特征
  const answerTitle = raw.search(/\n#+\s*🏆\s*试卷标准答案/);
  if (answerTitle >= 0) return answerTitle;
  const answerTitle2 = raw.search(/\n#+\s*🔑\s*参考答案/);
  if (answerTitle2 >= 0) return answerTitle2;
  const answerTitle3 = raw.search(/\n##\s*⚠️\s*第二部分/);
  if (answerTitle3 >= 0) return answerTitle3;
  // 退而找 ---
  const hrMatch = raw.match(/\n---\n/);
  if (hrMatch && hrMatch.index !== undefined) return hrMatch.index;
  return -1;
}

// ── 精准切分题目：只在新题号/大题类标题出现时才切分 ──
function splitQuestions(text: string): string[] {
  // 清洗前导无用内容（试卷抬头、大题类标题不切分）
  const cleaned = text
    .replace(/^#\s+.+/gm, "")        // 去除一级标题行
    .replace(/^>\s+.+/gm, "")         // 去除引用行
    .replace(/^姓名.*$/gm, "")        // 去除抬头信息行
    .replace(/^班级.*$/gm, "")
    .replace(/^得分.*$/gm, "")
    .replace(/^考试时间.*$/gm, "")
    .replace(/^满分.*$/gm, "")
    .replace(/^测试主题.*$/gm, "")
    .trim();

  // 正则：匹配题号起点 — **第X题** 或 **X.** 或 **X** 后跟题干
  // 使用 lookahead 确保不破坏题号本身
  const qRegex = /\n(?:\*\*\[?第\d+题\]?\*\*|\*\*\d+\.\*\*|\*\*\d+\*\*|###\s*变式题\s*\d+|\[第\d+题\])\s*/g;

  const blocks: string[] = [];
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = qRegex.exec(cleaned)) !== null) {
    if (last < m.index) {
      const chunk = cleaned.slice(last, m.index).trim();
      // 跳过标题类 chunk（短且无题干内容）
      if (chunk.length > 10 && !/^[#*\s]*(一|二|三|四|五|六|七|八|九|十)、/.test(chunk)) {
        blocks.push(chunk);
      }
    }
    last = m.index + m[0].length;
  }

  // 最后一块
  const tail = cleaned.slice(last).trim();
  if (tail.length > 10) blocks.push(tail);

  // 如果没匹配到任何题号，按空行分块兜底
  if (blocks.length === 0 && cleaned.length > 10) {
    const fallback = cleaned.split(/\n\n+/).filter((b) => b.trim().length > 15);
    if (fallback.length > 0) return fallback;
  }

  return blocks;
}

// ── 精准切分答案：以 [第X题] / 正确答案 / 解析 等特征为界 ──
function splitAnswers(text: string): string[] {
  // 清洗标题行
  const cleaned = text
    .replace(/^#\s+.+/gm, "")
    .replace(/^##\s+.+/gm, "")
    .replace(/^>\s+.+/gm, "")
    .replace(/^⚠️.*$/gm, "")
    .replace(/^---\s*$/gm, "")
    .trim();

  // 答案区的题号标记
  const aRegex = /\n(?:\[第\d+题\]|(?:\*\*)?\d+\.\s*(?:正确答案|答案|答)\s*[:：]|###\s*(?:变式题\s*\d+|一|二|三|四|五)\s*答案)/g;

  const blocks: string[] = [];
  let last = 0;
  let m: RegExpExecArray | null;

  while ((m = aRegex.exec(cleaned)) !== null) {
    if (last < m.index) {
      const chunk = cleaned.slice(last, m.index).trim();
      if (chunk.length > 5) blocks.push(chunk);
    }
    last = m.index + m[0].length;
  }

  const tail = cleaned.slice(last).trim();
  if (tail.length > 5) blocks.push(tail);

  // 兜底：尝试按 **[第 匹配
  if (blocks.length === 0 && cleaned.length > 5) {
    const fallback = cleaned.split(/\n(?=\*\*\[?第\d+题\]?\*\*)/);
    if (fallback.length > 1) return fallback.filter((b) => b.trim().length > 5);
  }

  return blocks;
}

// ── 提取文本中的主题干号 ──
function extractPrimaryNumber(text: string): string | null {
  // 优先 [第1题] 格式
  const m1 = text.match(/\[?第(\d+)题\]?/);
  if (m1) return m1[1];

  // **1.** 格式
  const m2 = text.match(/\*\*(\d+)\.\*\*/);
  if (m2) return m2[1];

  // ### 变式题 1 格式
  const m3 = text.match(/变式题\s*(\d+)/);
  if (m3) return m3[1];

  // 题号写在最开头：**1** 或 1.
  const m4 = text.match(/^\s*\**\s*(\d+)\s*[\.、)\s]/);
  if (m4) return m4[1];

  return null;
}

function cleanBlock(text: string): string {
  return text
    .replace(/^###\s+(一、|二、|三、|四、|五、|六、|七、|八、|九、|十).+/gm, "")
    .replace(/^##\s+.+/gm, "")
    .replace(/^#\s+.+/gm, "")
    .replace(/^>\s+.+/gm, "")
    .replace(/^姓名.*$/gm, "")
    .replace(/^班级.*$/gm, "")
    .replace(/^得分.*$/gm, "")
    .trim();
}

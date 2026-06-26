"use client";

import { GeneratedContent } from "@/types";
import { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface Props {
  content: GeneratedContent;
  onStartLecture?: (c: GeneratedContent) => void;
}

export function StandardMode({ content, onStartLecture }: Props) {
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleCopyPlain = async () => {
    try {
      // 复制渲染后的纯文本 — KaTeX 公式用 textContent 避免换行
      const text = contentRef.current ? extractPlainText(contentRef.current) : content.rawMarkdown;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showToast("复制成功！您可以直接粘贴到微信、备忘录或班级群中。");
    } catch {
      showToast("复制失败，请尝试手动选择文本后复制。");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportWord = () => {
    const wordHtml = buildWordHtml(content);
    const blob = new Blob(["\\ufeff" + wordHtml], {
      type: "application/msword;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${content.title.replace(/[\\/:*?"<>|]/g, "_")}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/50">
        <span className="text-sm font-medium text-gray-500">
          Markdown 排版预览 · 适合打印
        </span>
        <div className="flex items-center gap-2">
          {/* Word Export */}
          <button
            onClick={handleExportWord}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeWidth="2" />
              <polyline points="14,2 14,8 20,8" strokeWidth="2" />
              <line x1="16" y1="13" x2="8" y2="13" strokeWidth="2" />
              <line x1="16" y1="17" x2="8" y2="17" strokeWidth="2" />
            </svg>
            <span className="hidden sm:inline">📄 导出为 Word</span>
            <span className="sm:hidden">Word</span>
          </button>
          {/* Lecture Mode — 非教案模块才显示 */}
          {content.module !== "lesson_plan" && onStartLecture && (
            <button
              onClick={() => onStartLecture(content)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 transition-all"
            >
              <span className="text-sm">📺</span>
              <span className="hidden sm:inline">投屏讲评课件</span>
              <span className="sm:hidden">投屏</span>
            </button>
          )}
          {/* Copy Plain Text */}
          <button
            onClick={handleCopyPlain}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
              copied
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200",
            )}
          >
            {copied ? (
              <>✓ 已复制</>
            ) : (
              <>
                <span className="text-sm">📋</span>
                <span className="hidden sm:inline">复制题目文本</span>
                <span className="sm:hidden">复制</span>
              </>
            )}
          </button>
          {/* Print / Save PDF */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 transition-all"
          >
            <span className="text-sm">📥</span>
            <span className="hidden sm:inline">保存 PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div ref={contentRef} className="p-6 md:p-8 space-y-6 print-content">
        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug">
          {content.title}
        </h1>

        {content.module === "lesson_plan" && (content.sections.length > 0 || (content.coreObjectives && (content.coreObjectives.vocabulary?.length || content.coreObjectives.keyStructures?.length || content.coreObjectives.keyPoints || content.coreObjectives.difficultPoints))) ? (
          /* ═══ 教案模块（旧格式兼容）：结构化组件渲染 ═══ */
          <>
            {/* Core Objectives */}
            {content.coreObjectives && (content.coreObjectives.vocabulary?.length || content.coreObjectives.keyStructures?.length || content.coreObjectives.keyPoints || content.coreObjectives.difficultPoints) && (
              <CoreObjectivesSection obj={content.coreObjectives} />
            )}

            {/* Teaching Sections */}
            {content.sections.length > 0 && (
              <div className="space-y-5">
                {content.sections.map((section, index) => (
                  <div key={index} className="space-y-2">
                    <h2 className="text-lg md:text-xl font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2">
                      <span>{section.emoji}</span>
                      {section.title}
                    </h2>
                    <div className="text-gray-700 leading-loose whitespace-pre-wrap pl-1">
                      {section.body}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Exercises */}
            {content.exercises && (
              <div className="space-y-2 border-t border-dashed border-gray-200 pt-5">
                <h2 className="text-lg md:text-xl font-semibold text-amber-700 flex items-center gap-2">
                  📝 课后练习
                </h2>
                <div className="text-gray-700 leading-loose whitespace-pre-wrap bg-amber-50 rounded-xl p-4 border border-amber-100">
                  {content.exercises}
                </div>
              </div>
            )}
          </>
        ) : (
          /* ═══ 测试 / 试卷模块：rawMarkdown 直接渲染 ═══ */
          <div className="text-[15px] md:text-[17px] leading-loose prose prose-gray max-w-none
            prose-headings:text-gray-800 prose-headings:font-semibold
            prose-h2:text-xl prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-2 prose-h2:mt-8 prose-h2:mb-4
            prose-h3:text-lg prose-h3:mt-6 prose-h3:mb-3
            prose-p:my-2 prose-p:text-gray-700
            prose-ul:my-2 prose-li:my-1
            prose-strong:text-gray-900
            prose-hr:my-6 prose-hr:border-dashed prose-hr:border-gray-300
            [&_del]:text-gray-400 [&_hr]:border-t-2 [&_hr]:border-gray-300
          ">
            <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{content.rawMarkdown}</ReactMarkdown>
          </div>
        )}
      </div>

      {/* ── Toast 提示 ── */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white text-sm rounded-xl px-5 py-3 shadow-xl animate-in slide-in-from-bottom-4 fade-in duration-300 max-w-xs text-center leading-relaxed">
          {toast}
        </div>
      )}
    </div>
  );
}

// ─── Core Objectives Sub-Components ──────────────────────────

// ══════════════════════════════════════════════
// 复制时提取纯文本：KaTeX 公式用 textContent 避免换行
// ══════════════════════════════════════════════

function extractPlainText(el: HTMLElement): string {
  const parts: string[] = [];
  walkText(el, parts);
  return parts.join("").replace(/\n{3,}/g, "\n\n").trim();
}

function walkText(node: Node, parts: string[]): void {
  if (node.nodeType === Node.TEXT_NODE) {
    parts.push(node.textContent || "");
    return;
  }
  if (!(node instanceof HTMLElement)) return;

  // KaTeX 元素 → 用 textContent 拼合，压缩多余空格
  if (
    node.classList.contains("katex") ||
    node.classList.contains("katex-display") ||
    node.classList.contains("katex-html")
  ) {
    const compact = (node.textContent || "").replace(/\s+/g, " ").trim();
    parts.push(compact);
    return;
  }

  // 块级元素集合
  const blockTags = new Set(["DIV", "P", "LI", "H1", "H2", "H3", "H4", "H5", "H6", "BR", "HR", "PRE", "TABLE", "TR", "BLOCKQUOTE", "SECTION", "ARTICLE", "HEADER", "FOOTER", "UL", "OL"]);
  const isBlock = blockTags.has(node.tagName);

  // 内联元素（非块级非 KaTeX）→ 直接取 textContent，不递归，避免 span 间多余空白
  if (!isBlock) {
    parts.push((node.textContent || "").replace(/\s+/g, " ").replace(/^ /, ""));
    return;
  }

  // 块级元素 → 前后加换行，递归子节点

  if (isBlock && parts.length > 0) parts.push("\n");

  for (const child of node.childNodes) {
    walkText(child, parts);
  }

  if (isBlock) parts.push("\n");
}

function CoreObjectivesSection({
  obj,
}: {
  obj: {
    vocabulary: { word: string; meaning: string }[];
    keyStructures: string[];
    keyPoints: string;
    difficultPoints: string;
  };
}) {
  return (
    <div className="rounded-2xl border-2 border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-blue-50/40 overflow-hidden">
      <div className="bg-indigo-100/60 px-5 py-2.5 border-b border-indigo-100">
        <span className="text-sm font-semibold text-indigo-800 flex items-center gap-2">
          🎯 教学目标 · 核心词汇 & 重难点
        </span>
      </div>
      <div className="p-5 space-y-4">
        {/* Vocabulary table */}
        {obj.vocabulary && obj.vocabulary.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
              <span>📚</span> 核心词汇 (Core Vocabulary)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {obj.vocabulary.map((v, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg border border-gray-200 px-3 py-2 text-center"
                >
                  <div className="font-semibold text-indigo-700">{v.word}</div>
                  <div className="text-xs text-gray-500">{v.meaning}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key structures */}
        {obj.keyStructures && obj.keyStructures.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-1.5">
              <span>🗣️</span> 核心句型 (Key Structures)
            </h3>
            <ul className="space-y-1.5 list-disc list-inside text-gray-700">
              {obj.keyStructures.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Key / Difficult Points */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {obj.keyPoints && (
            <div className="bg-green-50 rounded-xl border border-green-100 p-3">
              <h3 className="font-semibold text-green-800 text-sm mb-1 flex items-center gap-1">
                <span>✅</span> 教学重点
              </h3>
              <p className="text-sm text-green-700 leading-relaxed">{obj.keyPoints}</p>
            </div>
          )}
          {obj.difficultPoints && (
            <div className="bg-orange-50 rounded-xl border border-orange-100 p-3">
              <h3 className="font-semibold text-orange-800 text-sm mb-1 flex items-center gap-1">
                <span>⚠️</span> 教学难点
              </h3>
              <p className="text-sm text-orange-700 leading-relaxed">{obj.difficultPoints}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Word HTML Builder (no external deps) ─────────────────────

function buildWordHtml(content: GeneratedContent): string {
  // Helper to convert markdown-style bold to HTML
  const mdToHtml = (text: string): string => {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
      .replace(/\n/g, "<br>");
  };

  const vocabRows = (content.coreObjectives?.vocabulary || [])
    .map((v) => `<tr><td style="border:1px solid #ccc;padding:6px 10px;"><b>${v.word}</b></td><td style="border:1px solid #ccc;padding:6px 10px;">${v.meaning}</td></tr>`)
    .join("");

  const sectionsHtml = content.sections
    .map((s) => {
      const bodyHtml = mdToHtml(s.body).replace(
        /🗣️ Teacher's Script:/g,
        '<br><b style="color:#2563eb;">🗣️ Teacher\'s Script:</b>'
      );
      return `<div style="margin-bottom:16px;">
        <h3 style="font-size:16px;color:#111827;border-bottom:1px solid #ddd;padding-bottom:6px;margin-bottom:8px;">${s.emoji} ${s.title}</h3>
        <div style="font-size:14px;line-height:1.8;color:#374151;">${bodyHtml}</div>
      </div>`;
    })
    .join("\n");

  const quizHtml = content.quiz?.studentPaper
    ? `<div style="margin-bottom:16px;">
        <h3 style="font-size:16px;color:#374151;background:#f3f4f6;padding:8px 12px;">📝 随堂测验（学生卷）</h3>
        <div style="font-size:14px;line-height:1.8;padding:12px;border:1px solid #ddd;">${mdToHtml(content.quiz.studentPaper)}</div>
      </div>`
    : "";

  const homeworkHtml = content.layeredHomework
    ? `<div style="margin-bottom:16px;">
        <h3 style="font-size:16px;color:#065f46;background:#d1fae5;padding:8px 12px;">🏡 课后分层作业</h3>
        <div style="padding:12px;border:1px solid #a7f3d0;">
          ${content.layeredHomework.basic ? `<div style="margin-bottom:10px;"><b>A. 基础巩固题（必做）</b><div style="font-size:14px;line-height:1.8;">${mdToHtml(content.layeredHomework.basic)}</div></div>` : ""}
          ${content.layeredHomework.advanced ? `<div><b>B. 拓展拔高题（选做）</b><div style="font-size:14px;line-height:1.8;">${mdToHtml(content.layeredHomework.advanced)}</div></div>` : ""}
        </div>
      </div>`
    : "";

  const answerHtml = content.answerKey?.content
    ? `<hr style="border:1px dashed #999;margin:20px 0;" />
      <div style="margin-bottom:16px;">
        <h3 style="font-size:16px;color:#1d4ed8;background:#dbeafe;padding:8px 12px;">🔑 教师参考答案与解析</h3>
        <div style="font-size:14px;line-height:1.8;padding:12px;border:1px solid #bfdbfe;">${mdToHtml(content.answerKey.content)}</div>
      </div>`
    : "";

  // 测试/试卷模块：rawMarkdown 全文用 <pre> 保留 AI 原始排版
  if (content.module !== "lesson_plan" && content.rawMarkdown) {
    return `<html xmlns:o="urn:schemas-microsoft-com:office:office"
              xmlns:w="urn:schemas-microsoft-com:office:word"
              xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->
<style>
  @page { size: A4; margin: 2cm; }
  body { font-family: 'Microsoft YaHei', 'SimSun', sans-serif; font-size: 13px; color: #1f2937; line-height: 1.8; }
  pre { white-space: pre-wrap; word-wrap: break-word; font-family: 'Microsoft YaHei', 'SimSun', monospace; }
  hr { border: none; border-top: 2px dashed #999; margin: 16px 0; }
  @media print { body { background: #fff; } }
</style>
</head>
<body>
<h1 style="font-size:20px;font-weight:bold;color:#111827;margin-bottom:12px;">${content.title}</h1>
<pre>${content.rawMarkdown
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/^---$/gm, "<hr>")
      .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
      .replace(/\n/g, "<br>")}</pre>
<br><p style="color:#9ca3af;font-size:12px;text-align:center;">由 智能教案讲义生成器 生成</p>
</body>
</html>`;
  }

  // 教案模块：结构化 HTML 构建
  return `<html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->
<style>
  @page { size: A4; margin: 2cm; }
  body { font-family: 'Microsoft YaHei', 'SimSun', sans-serif; font-size: 14px; color: #1f2937; line-height: 1.8; }
  h1 { font-size: 22px; font-weight: bold; color: #111827; margin-bottom: 12px; }
  h2 { font-size: 18px; font-weight: bold; color: #1f2937; margin-top: 16px; margin-bottom: 8px; }
  @media print { body { background: #fff; } }
</style>
</head>
<body>
<h1>${content.title}</h1>

${content.coreObjectives ? `
<div style="margin-bottom:16px;padding:12px;background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;">
  <h2>🎯 教学目标 · 核心词汇 & 重难点</h2>
  ${content.coreObjectives.vocabulary && content.coreObjectives.vocabulary.length > 0 ? `
  <p><b>📚 核心词汇</b></p>
  <table style="border-collapse:collapse;margin-bottom:10px;">
    ${vocabRows}
  </table>` : ""}
  ${content.coreObjectives.keyStructures && content.coreObjectives.keyStructures.length > 0 ? `
  <p><b>🗣️ 核心句型</b></p>
  <ul>
    ${content.coreObjectives.keyStructures.map((s) => `<li>${s}</li>`).join("")}
  </ul>` : ""}
  <p><b>✅ 教学重点：</b>${content.coreObjectives.keyPoints || ""}</p>
  <p><b>⚠️ 教学难点：</b>${content.coreObjectives.difficultPoints || ""}</p>
</div>` : ""}

${sectionsHtml}

${content.exercises ? `
<div style="margin-bottom:16px;">
  <h3 style="font-size:16px;color:#92400e;">📝 课后练习</h3>
  <div style="font-size:14px;line-height:1.8;">${mdToHtml(content.exercises)}</div>
</div>` : ""}

${quizHtml}
${homeworkHtml}
${answerHtml}

<br><p style="color:#9ca3af;font-size:12px;text-align:center;">由 智能教案讲义生成器 生成</p>
</body>
</html>`;
}

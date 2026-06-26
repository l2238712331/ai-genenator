"use client";

import { GeneratedContent } from "@/types";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  content: GeneratedContent;
}

export function StandardMode({ content }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content.rawMarkdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
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
          {/* Copy */}
          <button
            onClick={handleCopy}
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
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="9" y="9" width="13" height="13" rx="2" strokeWidth="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2" />
                </svg>
                <span className="hidden sm:inline">一键复制全文</span>
                <span className="sm:hidden">复制</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Content — increased font size + line-height for readability */}
      <div className="p-6 md:p-8 space-y-6 text-[15px] md:text-[17px] leading-loose">
        {/* Title */}
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug">
          {content.title}
        </h1>

        {/* ─── Core Objectives Section ─── */}
        {content.coreObjectives && (
          <CoreObjectivesSection obj={content.coreObjectives} />
        )}

        {/* Teaching Sections */}
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

        {/* Quiz, Layered Homework & Answer Key */}
        {(content.quiz?.studentPaper || content.layeredHomework?.basic || content.answerKey?.content) && (
          <PrintSection
            quiz={content.quiz}
            homework={content.layeredHomework}
            answerKey={content.answerKey}
          />
        )}
      </div>
    </div>
  );
}

// ─── Core Objectives Sub-Components ──────────────────────────

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

// ─── Print Section (Quiz + Homework + Answer Key) ────────────

function PrintSection({
  quiz,
  homework,
  answerKey,
}: {
  quiz: { studentPaper: string };
  homework: { basic: string; advanced: string };
  answerKey: { content: string };
}) {
  return (
    <div id="printable-section" className="space-y-3">
      {/* Quiz — Student Paper */}
      {quiz?.studentPaper && (
        <div className="border-2 border-gray-300 rounded-xl overflow-hidden">
          <div className="bg-gray-100 px-5 py-2.5 border-b border-gray-300 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
              📝 随堂测验（学生卷 · 可打印分发）
            </span>
            <span className="text-xs text-gray-400 hidden sm:inline">
              姓名：________  班级：________
            </span>
          </div>
          <div className="p-5 md:p-6 text-gray-800 leading-loose whitespace-pre-wrap bg-white">
            {quiz.studentPaper}
          </div>
        </div>
      )}

      {/* Layered Homework */}
      {homework && (homework.basic || homework.advanced) && (
        <div className="border-2 border-emerald-200 rounded-xl overflow-hidden bg-emerald-50/40">
          <div className="bg-emerald-100/70 px-5 py-2.5 border-b border-emerald-200">
            <span className="text-sm font-semibold text-emerald-800 flex items-center gap-2">
              🏡 课后分层作业
            </span>
          </div>
          <div className="p-5 md:p-6 space-y-4">
            {homework.basic && (
              <div>
                <h3 className="text-sm font-semibold text-emerald-700 mb-2">A. 基础巩固题（必做 · 全体学生）</h3>
                <div className="text-gray-800 leading-loose whitespace-pre-wrap bg-white rounded-lg p-3 border border-emerald-100">
                  {homework.basic}
                </div>
              </div>
            )}
            {homework.advanced && (
              <div>
                <h3 className="text-sm font-semibold text-emerald-700 mb-2">B. 拓展拔高题（选做 · 学有余力）</h3>
                <div className="text-gray-800 leading-loose whitespace-pre-wrap bg-white rounded-lg p-3 border border-emerald-100">
                  {homework.advanced}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Divider + Answer Key */}
      {answerKey?.content && (
        <>
          <hr className="border-t-2 border-dashed border-gray-400 my-3" />
          <div className="border-2 border-primary-200 rounded-xl overflow-hidden bg-primary-50/30">
            <div className="bg-primary-100 px-5 py-2.5 border-b border-primary-200">
              <span className="text-sm font-semibold text-primary-800 flex items-center gap-2">
                🔑 教师参考答案与解析（仅教师留存 · 勿发给学生）
              </span>
            </div>
            <div className="p-5 md:p-6 text-gray-800 leading-loose whitespace-pre-wrap">
              {answerKey.content}
            </div>
          </div>
        </>
      )}
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

  return `<html xmlns:o="urn:schemas-microsoft-com:office:office"
            xmlns:w="urn:schemas-microsoft-com:office:word"
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

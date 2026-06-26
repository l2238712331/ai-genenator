"use client";

import { GeneratedContent } from "@/types";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface Props {
  content: GeneratedContent;
}

export function MobileBottomBar({ content }: Props) {
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
    const blob = new Blob(["\ufeff" + wordHtml], {
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

  const handleExport = () => {
    const htmlContent = generateH5Html(content);
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${content.title.replace(/[\\/:*?"<>|]/g, "_")}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-200 shadow-lg safe-area-bottom">
      <div className="grid grid-cols-3 gap-2 px-3 py-3">
        <button
          onClick={handleExportWord}
          className="flex items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 transition-all active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeWidth="2" />
            <polyline points="14,2 14,8 20,8" strokeWidth="2" />
            <line x1="16" y1="13" x2="8" y2="13" strokeWidth="2" />
            <line x1="16" y1="17" x2="8" y2="17" strokeWidth="2" />
          </svg>
          Word
        </button>
        <button
          onClick={handleCopy}
          className={cn(
            "flex items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95",
            copied ? "bg-green-500 text-white" : "bg-gray-800 text-white",
          )}
        >
          {copied ? (
            <>✓ 已复制</>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <rect x="9" y="9" width="13" height="13" rx="2" strokeWidth="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" strokeWidth="2" />
              </svg>
              复制
            </>
          )}
        </button>
        <button
          onClick={handleExport}
          className="flex items-center justify-center gap-1 py-2.5 rounded-xl text-xs font-semibold bg-primary-600 text-white transition-all active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeWidth="2" />
            <polyline points="7,10 12,15 17,10" strokeWidth="2" />
            <line x1="12" y1="15" x2="12" y2="3" strokeWidth="2" />
          </svg>
          H5
        </button>
      </div>
    </div>
  );
}

/* Inherit the Word HTML builder from StandardMode — same implementation */
function buildWordHtml(content: GeneratedContent): string {
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
    ? `<div style="margin-bottom:16px;"><h3 style="font-size:16px;color:#374151;background:#f3f4f6;padding:8px 12px;">📝 随堂测验（学生卷）</h3><div style="font-size:14px;line-height:1.8;padding:12px;border:1px solid #ddd;">${mdToHtml(content.quiz.studentPaper)}</div></div>`
    : "";

  const homeworkHtml = content.layeredHomework
    ? `<div style="margin-bottom:16px;"><h3 style="font-size:16px;color:#065f46;background:#d1fae5;padding:8px 12px;">🏡 课后分层作业</h3><div style="padding:12px;border:1px solid #a7f3d0;">${content.layeredHomework.basic ? `<div style="margin-bottom:10px;"><b>A. 基础巩固题（必做）</b><div style="font-size:14px;line-height:1.8;">${mdToHtml(content.layeredHomework.basic)}</div></div>` : ""}${content.layeredHomework.advanced ? `<div><b>B. 拓展拔高题（选做）</b><div style="font-size:14px;line-height:1.8;">${mdToHtml(content.layeredHomework.advanced)}</div></div>` : ""}</div></div>`
    : "";

  const answerHtml = content.answerKey?.content
    ? `<hr style="border:1px dashed #999;margin:20px 0;" /><div style="margin-bottom:16px;"><h3 style="font-size:16px;color:#1d4ed8;background:#dbeafe;padding:8px 12px;">🔑 教师参考答案与解析</h3><div style="font-size:14px;line-height:1.8;padding:12px;border:1px solid #bfdbfe;">${mdToHtml(content.answerKey.content)}</div></div>`
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
${content.coreObjectives ? `<div style="margin-bottom:16px;padding:12px;background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;"><h2>🎯 教学目标 · 核心词汇 & 重难点</h2>${content.coreObjectives.vocabulary && content.coreObjectives.vocabulary.length > 0 ? `<p><b>📚 核心词汇</b></p><table style="border-collapse:collapse;margin-bottom:10px;">${vocabRows}</table>` : ""}${content.coreObjectives.keyStructures && content.coreObjectives.keyStructures.length > 0 ? `<p><b>🗣️ 核心句型</b></p><ul>${content.coreObjectives.keyStructures.map((s) => `<li>${s}</li>`).join("")}</ul>` : ""}<p><b>✅ 教学重点：</b>${content.coreObjectives.keyPoints || ""}</p><p><b>⚠️ 教学难点：</b>${content.coreObjectives.difficultPoints || ""}</p></div>` : ""}
${sectionsHtml}
${content.exercises ? `<div style="margin-bottom:16px;"><h3 style="font-size:16px;color:#92400e;">📝 课后练习</h3><div style="font-size:14px;line-height:1.8;">${mdToHtml(content.exercises)}</div></div>` : ""}
${quizHtml}
${homeworkHtml}
${answerHtml}
<br><p style="color:#9ca3af;font-size:12px;text-align:center;">由 智能教案讲义生成器 生成</p>
</body></html>`;
}

function generateH5Html(content: GeneratedContent): string {
  const vocabChips = (content.coreObjectives?.vocabulary || [])
    .map((v) =>
      `<span style="display:inline-flex;align-items:center;gap:4px;background:#fff;border:1px solid #e5e7eb;border-radius:999px;padding:4px 10px;font-size:12px;margin:2px;"><b style="color:#4f46e5;">${esc(v.word)}</b><span style="color:#9ca3af;">·</span><span style="color:#6b7280;">${esc(v.meaning)}</span></span>`
    )
    .join("");

  const structuresList = (content.coreObjectives?.keyStructures || [])
    .map((s) => `<li style="font-size:14px;color:#374151;margin-bottom:6px;">${esc(s)}</li>`)
    .join("");

  const coreObjHtml = content.coreObjectives
    ? `
    <div style="border:2px solid #c7d2fe;border-radius:16px;overflow:hidden;background:linear-gradient(135deg,#eef2ff,#eff6ff);margin-bottom:12px;">
      <div style="background:#c7d2fe;padding:8px 16px;">
        <span style="font-size:14px;font-weight:600;color:#3730a3;">🎯 核心词汇 & 重难点</span>
      </div>
      <div style="padding:16px;">
        ${vocabChips ? `<div style="margin-bottom:12px;"><div style="font-size:12px;font-weight:600;color:#6b7280;margin-bottom:6px;">📚 核心词汇</div><div style="display:flex;flex-wrap:wrap;gap:4px;">${vocabChips}</div></div>` : ""}
        ${structuresList ? `<div style="margin-bottom:12px;"><div style="font-size:12px;font-weight:600;color:#6b7280;margin-bottom:4px;">🗣️ 核心句型</div><ul style="margin:0;padding-left:16px;">${structuresList}</ul></div>` : ""}
        ${content.coreObjectives.keyPoints ? `<div style="background:#f0fdf4;border-radius:8px;padding:10px;font-size:12px;color:#166534;margin-bottom:6px;"><b>✅ 重点：</b>${esc(content.coreObjectives.keyPoints)}</div>` : ""}
        ${content.coreObjectives.difficultPoints ? `<div style="background:#fff7ed;border-radius:8px;padding:10px;font-size:12px;color:#9a3412;"><b>⚠️ 难点：</b>${esc(content.coreObjectives.difficultPoints)}</div>` : ""}
      </div>
    </div>`
    : "";

  const sectionCards = content.sections
    .map(
      (section, i) => `
    <div style="background:${cardBgHex(i)};border:1px solid ${cardBorderHex(i)};border-radius:16px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
      <h3 style="font-size:16px;font-weight:600;color:#111827;margin-bottom:12px;display:flex;align-items:center;gap:8px;">
        <span style="font-size:20px;">${section.emoji}</span>${esc(section.title)}
      </h3>
      <div style="font-size:16px;line-height:1.6;color:#374151;white-space:pre-wrap;">${esc(section.body)}</div>
    </div>`,
    )
    .join("\n");

  const quizHtml = content.quiz?.studentPaper
    ? `\n  <div style="border:2px solid #d1d5db;border-radius:16px;overflow:hidden;margin-bottom:12px;"><div style="background:#f3f4f6;padding:10px 16px;border-bottom:1px solid #d1d5db;"><span style="font-size:14px;font-weight:600;color:#374151;">📝 随堂测验（学生卷）</span></div><div style="padding:16px;font-size:16px;line-height:1.6;color:#1f2937;white-space:pre-wrap;">${esc(content.quiz.studentPaper)}</div></div>`
    : "";

  const homeworkHtml = content.layeredHomework
    ? `\n  <div style="border:2px solid #a7f3d0;border-radius:16px;overflow:hidden;background:#f0fdf4;margin-bottom:12px;"><div style="background:#a7f3d0;padding:10px 16px;border-bottom:1px solid #a7f3d0;"><span style="font-size:14px;font-weight:600;color:#065f46;">🏡 课后分层作业</span></div><div style="padding:16px;">${content.layeredHomework.basic ? `<div style="margin-bottom:12px;"><div style="font-size:14px;font-weight:600;color:#047857;margin-bottom:6px;">A. 基础巩固题（必做）</div><div style="font-size:15px;line-height:1.6;white-space:pre-wrap;background:#fff;border-radius:8px;padding:12px;border:1px solid #d1fae5;">${esc(content.layeredHomework.basic)}</div></div>` : ""}${content.layeredHomework.advanced ? `<div><div style="font-size:14px;font-weight:600;color:#047857;margin-bottom:6px;">B. 拓展拔高题（选做）</div><div style="font-size:15px;line-height:1.6;white-space:pre-wrap;background:#fff;border-radius:8px;padding:12px;border:1px solid #d1fae5;">${esc(content.layeredHomework.advanced)}</div></div>` : ""}</div></div>`
    : "";

  const answerHtml = content.answerKey?.content
    ? `\n  <hr style="border:1px dashed #9ca3af;margin:12px 0;" /><div style="border:2px solid #bfdbfe;border-radius:16px;overflow:hidden;background:#eff6ff;"><div style="background:#dbeafe;padding:10px 16px;border-bottom:1px solid #bfdbfe;"><span style="font-size:14px;font-weight:600;color:#1d4ed8;">🔑 教师参考答案与解析</span></div><div style="padding:16px;font-size:16px;line-height:1.6;color:#1e3a5f;white-space:pre-wrap;">${esc(content.answerKey.content)}</div></div>`
    : "";

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
<title>${esc(content.title)}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;min-height:100vh}
@media print{body{background:#fff}}
</style>
</head>
<body>
<div style="background:linear-gradient(135deg,#2563eb,#3b82f6);color:#fff;padding:20px 16px;">
  <div style="display:flex;align-items:center;gap:6px;font-size:12px;opacity:0.8;margin-bottom:8px;">
    <span>📚</span> 教案讲义 · H5 阅读版
  </div>
  <h2 style="font-size:18px;font-weight:700;line-height:1.4;">${esc(content.title)}</h2>
</div>
<div style="padding:12px;display:flex;flex-direction:column;gap:12px;padding-bottom:24px;">
  ${coreObjHtml}
  ${sectionCards}
  ${content.exercises ? `<div style="background:#fffbeb;border:1px solid #fde68a;border-radius:16px;padding:16px;"><h3 style="font-size:16px;font-weight:600;color:#92400e;margin-bottom:12px;display:flex;align-items:center;gap:8px;"><span style="font-size:20px;">📝</span>课后练习</h3><div style="font-size:16px;line-height:1.6;color:#78350f;white-space:pre-wrap;">${esc(content.exercises)}</div></div>` : ""}
  ${quizHtml}
  ${homeworkHtml}
  ${answerHtml}
</div>
<div style="text-align:center;padding:16px;color:#9ca3af;font-size:12px;">
  由 智能教案讲义生成器 生成
</div>
</body>
</html>`;
}

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function cardBgHex(index: number): string {
  const colors = ["#eff6ff", "#f5f3ff", "#f0fdf4", "#fff7ed", "#fdf2f8", "#f0fdfa", "#eef2ff", "#fff1f2"];
  return colors[index % colors.length];
}

function cardBorderHex(index: number): string {
  const colors = ["#dbeafe", "#ddd6fe", "#bbf7d0", "#fed7aa", "#fbcfe8", "#99f6e4", "#c7d2fe", "#fecdd3"];
  return colors[index % colors.length];
}

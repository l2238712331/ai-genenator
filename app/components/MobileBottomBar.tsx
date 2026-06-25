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
      <div className="flex items-stretch gap-2 px-4 py-3">
        <button
          onClick={handleCopy}
          className={cn(
            "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold transition-all active:scale-95",
            copied
              ? "bg-green-500 text-white"
              : "bg-gray-800 text-white"
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
              一键复制
            </>
          )}
        </button>
        <button
          onClick={handleExport}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-semibold bg-primary-600 text-white transition-all active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" strokeWidth="2" />
            <polyline points="7,10 12,15 17,10" strokeWidth="2" />
            <line x1="12" y1="15" x2="12" y2="3" strokeWidth="2" />
          </svg>
          导出 H5
        </button>
      </div>
    </div>
  );
}

function generateH5Html(content: GeneratedContent): string {
  const sectionCards = content.sections
    .map(
      (section, i) => `
    <div style="background:${cardBgHex(i)};border:1px solid ${cardBorderHex(i)};border-radius:16px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
      <h3 style="font-size:16px;font-weight:600;color:#111827;margin-bottom:12px;display:flex;align-items:center;gap:8px;">
        <span style="font-size:20px;">${section.emoji}</span>${section.title}
      </h3>
      <div style="font-size:16px;line-height:1.6;color:#374151;white-space:pre-wrap;">${section.body}</div>
    </div>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no">
<title>${content.title}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f9fafb;min-height:100vh}
</style>
</head>
<body>
<div style="background:linear-gradient(135deg,#2563eb,#3b82f6);color:#fff;padding:20px 16px;">
  <div style="display:flex;align-items:center;gap:6px;font-size:12px;opacity:0.8;margin-bottom:8px;">
    <span>📚</span> 教案讲义 · H5 阅读版
  </div>
  <h2 style="font-size:18px;font-weight:700;line-height:1.4;">${content.title}</h2>
  <p style="font-size:12px;opacity:0.7;margin-top:4px;">滑动阅读教学内容卡片</p>
</div>
<div style="padding:12px;display:flex;flex-direction:column;gap:12px;padding-bottom:24px;">
  ${sectionCards}
  <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:16px;padding:16px;">
    <h3 style="font-size:16px;font-weight:600;color:#92400e;margin-bottom:12px;display:flex;align-items:center;gap:8px;">
      <span style="font-size:20px;">📝</span>课后练习
    </h3>
    <div style="font-size:16px;line-height:1.6;color:#78350f;white-space:pre-wrap;">${content.exercises}</div>
  </div>
</div>
<div style="text-align:center;padding:16px;color:#9ca3af;font-size:12px;">
  由 智能教案讲义生成器 生成
</div>
</body>
</html>`;
}

function cardBgHex(index: number): string {
  const colors = ["#eff6ff", "#f5f3ff", "#f0fdf4", "#fff7ed", "#fdf2f8", "#f0fdfa", "#eef2ff", "#fff1f2"];
  return colors[index % colors.length];
}

function cardBorderHex(index: number): string {
  const colors = ["#dbeafe", "#ddd6fe", "#bbf7d0", "#fed7aa", "#fbcfe8", "#99f6e4", "#c7d2fe", "#fecdd3"];
  return colors[index % colors.length];
}

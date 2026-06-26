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

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/50">
        <span className="text-sm font-medium text-gray-500">
          Markdown 排版预览
        </span>
        <button
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
            copied
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          {copied ? (
            <>✓ 已复制</>
          ) : (
            <>
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" strokeWidth="2" />
                <path
                  d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
                  strokeWidth="2"
                />
              </svg>
              一键复制全文
            </>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="p-6 md:p-8 space-y-6">
        {/* Title */}
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug">
          {content.title}
        </h1>

        {/* Sections */}
        <div className="space-y-5">
          {content.sections.map((section, index) => (
            <div key={index} className="space-y-2">
              <h2 className="text-base md:text-lg font-semibold text-gray-800 flex items-center gap-2 border-b border-gray-200 pb-2">
                <span>{section.emoji}</span>
                {section.title}
              </h2>
              <div className="text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-wrap pl-1">
                {section.body}
              </div>
            </div>
          ))}
        </div>

        {/* Exercises */}
        <div className="space-y-2 border-t border-dashed border-gray-200 pt-5">
          <h2 className="text-base md:text-lg font-semibold text-amber-700 flex items-center gap-2">
            📝 课后练习
          </h2>
          <div className="text-sm md:text-base text-gray-700 leading-relaxed whitespace-pre-wrap bg-amber-50 rounded-xl p-4 border border-amber-100">
            {content.exercises}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useCallback } from "react";
import { InputPanel } from "./components/InputPanel";
import { PreviewArea } from "./components/PreviewArea";
import { MobileBottomBar } from "./components/MobileBottomBar";
import { SkeletonLoader } from "./components/SkeletonLoader";
import { generateContent, adjustContent } from "@/lib/mockAi";
import type { GeneratedContent, LessonFormData } from "@/types";

export default function HomePage() {
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [adjustDirection, setAdjustDirection] = useState<"simplify" | "advance" | null>(null);

  const handleGenerate = useCallback(async (data: LessonFormData) => {
    setIsGenerating(true);
    setAdjustDirection(null);
    setContent(null);
    try {
      const result = await generateContent(data.topic, data.difficulty, data.grade);
      setContent(result);
    } catch {
      // ignore
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleAdjust = useCallback(async (direction: "simplify" | "advance") => {
    if (!content) return;
    setIsGenerating(true);
    setAdjustDirection(direction);
    try {
      const result = await adjustContent(direction, content);
      setContent(result);
    } catch {
      // ignore
    } finally {
      setIsGenerating(false);
      setAdjustDirection(null);
    }
  }, [content]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 md:px-6 md:py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <span className="text-2xl">📚</span>
          <div>
            <h1 className="text-lg md:text-xl font-bold text-gray-900">
              智能教案讲义生成器
            </h1>
            <p className="text-xs md:text-sm text-gray-500">
              AI驱动 · 教案撰写 + H5 移动端预览分享
            </p>
          </div>
        </div>
      </header>

      {/* Main Content - Responsive Grid */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 pb-24 md:pb-6">
        {/* Desktop: md:grid-cols-12, Mobile: single column */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
          {/* Left Panel - 4 cols on desktop, full width on mobile */}
          <div className="md:col-span-4">
            <div className="md:sticky md:top-24">
              <InputPanel onGenerate={handleGenerate} isGenerating={isGenerating} />
            </div>
          </div>

          {/* Right Preview Area - 8 cols on desktop, full width on mobile */}
          <div className="md:col-span-8">
            {/* Smooth Difficulty Adjuster Buttons */}
            {content && !isGenerating && (
              <DifficultyAdjuster
                onSimplify={() => handleAdjust("simplify")}
                onAdvance={() => handleAdjust("advance")}
              />
            )}

            {/* Adjust loading label */}
            {isGenerating && adjustDirection && (
              <AdjustLoadingLabel direction={adjustDirection} />
            )}

            {isGenerating && !adjustDirection ? (
              <SkeletonLoader />
            ) : content ? (
              <PreviewArea content={content} />
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </main>

      {/* Mobile Fixed Bottom Bar */}
      {content && !isGenerating && (
        <MobileBottomBar content={content} />
      )}
    </div>
  );
}

// ─── Difficulty Adjuster ──────────────────────────────────────

function DifficultyAdjuster({
  onSimplify,
  onAdvance,
}: {
  onSimplify: () => void;
  onAdvance: () => void;
}) {
  return (
    <div className="flex items-center gap-2 mb-4 md:mb-6">
      <span className="text-xs text-gray-400 hidden sm:inline">难度微调：</span>
      <button
        onClick={onSimplify}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 shadow-sm"
      >
        <span>📉</span> 稍稍简化
      </button>
      <button
        onClick={onAdvance}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 shadow-sm"
      >
        <span>📈</span> 稍稍拔高
      </button>
    </div>
  );
}

function AdjustLoadingLabel({ direction }: { direction: "simplify" | "advance" }) {
  return (
    <div className="mb-4 md:mb-6 flex items-center gap-2 text-sm text-primary-600 font-medium animate-pulse">
      <svg
        className="animate-spin h-4 w-4"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      AI 正在{direction === "simplify" ? "平滑简化" : "平滑拔高"}教案…
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <span className="text-6xl mb-4">📝</span>
      <p className="text-lg font-medium">尚未生成内容</p>
      <p className="text-sm mt-1">请在左侧输入课程主题，然后点击生成按钮</p>
    </div>
  );
}

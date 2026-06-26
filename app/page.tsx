"use client";

import { useState, useCallback } from "react";
import { InputPanel } from "./components/InputPanel";
import { PreviewArea } from "./components/PreviewArea";
import { MobileBottomBar } from "./components/MobileBottomBar";
import { SkeletonLoader } from "./components/SkeletonLoader";
import { generateContent } from "@/lib/mockAi";
import type { GeneratedContent, LessonFormData } from "@/types";

export default function HomePage() {
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = useCallback(async (data: LessonFormData) => {
    setIsGenerating(true);
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
            {isGenerating ? (
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
      {content && (
        <MobileBottomBar content={content} />
      )}
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

"use client";

import { useState, useCallback, useRef } from "react";
import { InputPanel, type FormSubmitData } from "./components/InputPanel";
import { PreviewArea } from "./components/PreviewArea";
import { MobileBottomBar } from "./components/MobileBottomBar";
import { SkeletonLoader } from "./components/SkeletonLoader";
import { generateContent, adjustContent } from "@/lib/mockAi";
import type { GeneratedContent } from "@/types";

export default function HomePage() {
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [adjustDirection, setAdjustDirection] = useState<"simplify" | "advance" | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  // 停止生成
  const handleStop = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
  }, []);

  const handleGenerate = useCallback(async (data: FormSubmitData) => {
    setIsGenerating(true);
    setAdjustDirection(null);
    setContent(null);
    setStreamingText("");

    const abort = new AbortController();
    abortRef.current = abort;

    try {
      const result = await generateContent(data, {
        onProgress: (t) => setStreamingText((prev) => prev + t),
        signal: abort.signal,
      });
      setContent(result);
      setStreamingText("");
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setStreamingText("");
      }
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  }, []);

  const handleAdjust = useCallback(async (direction: "simplify" | "advance") => {
    if (!content) return;
    setIsGenerating(true);
    setAdjustDirection(direction);
    setStreamingText("");

    const abort = new AbortController();
    abortRef.current = abort;

    try {
      const result = await adjustContent(direction, content, {
        onProgress: (t) => setStreamingText((prev) => prev + t),
        signal: abort.signal,
      });
      setContent(result);
      setStreamingText("");
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setStreamingText("");
      }
    } finally {
      setIsGenerating(false);
      setAdjustDirection(null);
      abortRef.current = null;
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
              智能教案讲义生成器 <span className="text-primary-600 text-sm font-normal ml-1">v3.0</span>
            </h1>
            <p className="text-xs md:text-sm text-gray-500">
              全科通用 · 教案撰写 + H5 预览 + 定制试卷
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-6 pb-24 md:pb-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
          {/* Left Panel */}
          <div className="md:col-span-4">
            <div className="md:sticky md:top-24">
              <InputPanel
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                onStop={handleStop}
              />
            </div>
          </div>

          {/* Right Preview */}
          <div className="md:col-span-8">
            {content && !isGenerating && (
              <DifficultyAdjuster
                onSimplify={() => handleAdjust("simplify")}
                onAdvance={() => handleAdjust("advance")}
              />
            )}

            {isGenerating && adjustDirection && (
              <AdjustLoadingLabel direction={adjustDirection} />
            )}

            {isGenerating ? (
              streamingText ? (
                <StreamingPreview text={streamingText} onStop={handleStop} />
              ) : (
                <SkeletonLoader />
              )
            ) : content ? (
              <PreviewArea content={content} />
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </main>

      {content && !isGenerating && <MobileBottomBar content={content} />}
    </div>
  );
}

function StreamingPreview({ text, onStop }: { text: string; onStop: () => void }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-primary-500 rounded-full animate-pulse" />
            <span className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" style={{ animationDelay: "0.15s" }} />
            <span className="w-2 h-2 bg-primary-300 rounded-full animate-pulse" style={{ animationDelay: "0.3s" }} />
          </div>
          <span className="text-sm font-medium text-primary-600">AI 正在实时生成…</span>
        </div>
        <button
          onClick={onStop}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-red-200 bg-red-50 text-red-600 text-sm font-medium hover:bg-red-100 transition-all active:scale-95"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <rect x="4" y="4" width="16" height="16" rx="2" />
          </svg>
          停止生成
        </button>
      </div>
      <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed font-mono text-[13px] bg-gray-50 rounded-xl p-4 max-h-[70vh] overflow-y-auto border border-gray-100">
        {text || <span className="text-gray-400">等待 AI 输出…</span>}
      </div>
    </div>
  );
}

function DifficultyAdjuster({ onSimplify, onAdvance }: { onSimplify: () => void; onAdvance: () => void }) {
  return (
    <div className="flex items-center gap-2 mb-4 md:mb-6">
      <span className="text-xs text-gray-400 hidden sm:inline">难度微调：</span>
      <button onClick={onSimplify} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all active:scale-95 shadow-sm">
        <span>📉</span> 稍稍简化
      </button>
      <button onClick={onAdvance} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all active:scale-95 shadow-sm">
        <span>📈</span> 稍稍拔高
      </button>
    </div>
  );
}

function AdjustLoadingLabel({ direction }: { direction: "simplify" | "advance" }) {
  return (
    <div className="mb-4 md:mb-6 flex items-center gap-2 text-sm text-primary-600 font-medium animate-pulse">
      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      AI 正在{direction === "simplify" ? "平滑简化" : "平滑拔高"}内容…
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <span className="text-6xl mb-4">📝</span>
      <p className="text-lg font-medium">尚未生成内容</p>
      <p className="text-sm mt-1">请在左侧选择科目、模块，输入主题后点击生成</p>
    </div>
  );
}

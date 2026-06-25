"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { DIFFICULTY_LABELS, GRADE_LABELS, type LessonFormData, type Difficulty, type GradeLevel } from "@/types";

interface Props {
  onGenerate: (data: LessonFormData) => void;
  isGenerating: boolean;
}

export function InputPanel({ onGenerate, isGenerating }: Props) {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("standard");
  const [grade, setGrade] = useState<GradeLevel>("middle");

  const canSubmit = topic.trim().length > 0 && !isGenerating;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onGenerate({ topic: topic.trim(), difficulty, grade });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-5">
      <h2 className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
        <span>⚙️</span> 输入控制面板
      </h2>

      {/* Topic Input */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          知识点主题
        </label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="请输入或粘贴课程主题，例如：一次函数与方程、勾股定理、化学反应速率…"
          rows={4}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm resize-none
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     placeholder:text-gray-400 transition-all"
        />
      </div>

      {/* Difficulty Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          难度选择
        </label>
        <div className="grid grid-cols-1 gap-2">
          {(Object.entries(DIFFICULTY_LABELS) as [Difficulty, string][]).map(
            ([key, label]) => (
              <button
                key={key}
                onClick={() => setDifficulty(key)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all duration-200",
                  difficulty === key
                    ? "bg-primary-50 border-primary-500 text-primary-700 ring-1 ring-primary-500"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                <span className="block text-xs text-gray-400 mb-0.5">
                  {key === "story" ? "🎭" : key === "standard" ? "📋" : "🏆"}{" "}
                  {key === "story" ? "适合基础薄弱的学生" : key === "standard" ? "适合大多数学生" : "适合拔尖学生"}
                </span>
                {label}
              </button>
            )
          )}
        </div>
      </div>

      {/* Grade Selection */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          学段选择
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.entries(GRADE_LABELS) as [GradeLevel, string][]).map(
            ([key, label]) => (
              <button
                key={key}
                onClick={() => setGrade(key)}
                className={cn(
                  "px-3 py-2.5 rounded-xl border text-sm font-medium text-center transition-all duration-200",
                  grade === key
                    ? "bg-primary-50 border-primary-500 text-primary-700"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                {label}
              </button>
            )
          )}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className={cn(
          "w-full py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2",
          canSubmit
            ? "bg-primary-600 text-white hover:bg-primary-700 active:scale-[0.98] shadow-sm shadow-primary-200"
            : "bg-gray-200 text-gray-400 cursor-not-allowed"
        )}
      >
        {isGenerating ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            AI 正在生成…
          </>
        ) : (
          <>
            <span>✨</span> 开始生成教案
          </>
        )}
      </button>
    </div>
  );
}

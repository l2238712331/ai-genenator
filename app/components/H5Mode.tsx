"use client";

import { GeneratedContent } from "@/types";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface Props {
  content: GeneratedContent;
}

const SECTION_BG_COLORS = [
  "bg-blue-50/70 border-blue-100",
  "bg-purple-50/70 border-purple-100",
  "bg-green-50/70 border-green-100",
  "bg-orange-50/70 border-orange-100",
  "bg-pink-50/70 border-pink-100",
  "bg-teal-50/70 border-teal-100",
  "bg-indigo-50/70 border-indigo-100",
  "bg-rose-50/70 border-rose-100",
];

export function H5Mode({ content }: Props) {
  return (
    <div>
      {/* Phone frame on desktop, full-width on mobile */}
      <div className="flex justify-center">
        <div className="w-full md:max-w-[390px] md:rounded-[2rem] md:border-[6px] md:border-gray-800 md:shadow-2xl md:overflow-hidden md:bg-white">
          {/* Phone notch */}
          <div className="hidden md:block bg-gray-800 py-2">
            <div className="w-20 h-1.5 bg-gray-500 rounded-full mx-auto" />
          </div>

          {/* Content area */}
          <div className="bg-white md:min-h-[600px] relative">
            {/* H5 Header */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-500 text-white px-5 py-5 md:py-4">
              <div className="flex items-center gap-2 text-xs opacity-80 mb-2">
                <span>📚</span> 教案讲义 · H5 阅读版
              </div>
              <h2 className="text-lg font-bold leading-snug">
                {content.title}
              </h2>
              <p className="text-xs opacity-70 mt-1">
                滑动阅读教学内容卡片
              </p>
            </div>

            {/* Card stack */}
            <div className="p-3 space-y-3 pb-6">

              {content.module === "lesson_plan" ? (
                /* ═══ 教案模块：结构化卡片渲染 ═══ */
                <>
                  {/* Core Objectives Card */}
                  {content.coreObjectives && (content.coreObjectives.vocabulary?.length || content.coreObjectives.keyStructures?.length || content.coreObjectives.keyPoints || content.coreObjectives.difficultPoints) && (
                    <div className="rounded-2xl border-2 border-indigo-150 bg-gradient-to-br from-indigo-50/70 to-blue-50/50 shadow-sm overflow-hidden">
                      <div className="bg-indigo-100/60 px-4 py-2 border-b border-indigo-150 flex items-center gap-2">
                        <span className="text-lg">🎯</span>
                        <span className="text-sm font-semibold text-indigo-800">教学目标 & 核心词汇</span>
                      </div>
                      <div className="p-4 space-y-3">
                        {content.coreObjectives.vocabulary && content.coreObjectives.vocabulary.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-gray-500 mb-2">📚 核心词汇</div>
                            <div className="flex flex-wrap gap-1.5">
                              {content.coreObjectives.vocabulary.map((v, i) => (
                                <span key={i} className="inline-flex items-center gap-1 bg-white border border-gray-200 rounded-full px-2.5 py-1 text-xs">
                                  <span className="font-semibold text-indigo-600">{v.word}</span>
                                  <span className="text-gray-400">·</span>
                                  <span className="text-gray-500">{v.meaning}</span>
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {content.coreObjectives.keyStructures && content.coreObjectives.keyStructures.length > 0 && (
                          <div>
                            <div className="text-xs font-semibold text-gray-500 mb-1.5">🗣️ 核心句型</div>
                            <ul className="space-y-1">
                              {content.coreObjectives.keyStructures.map((s, i) => (
                                <li key={i} className="text-sm text-gray-700 bg-white rounded-lg px-3 py-1.5 border border-gray-100">
                                  {s}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="grid grid-cols-1 gap-2">
                          {content.coreObjectives.keyPoints && (
                            <div className="bg-green-50 rounded-lg p-2.5 border border-green-100">
                              <div className="text-xs font-semibold text-green-700 mb-0.5">✅ 重点</div>
                              <p className="text-xs text-green-600 leading-relaxed">{content.coreObjectives.keyPoints}</p>
                            </div>
                          )}
                          {content.coreObjectives.difficultPoints && (
                            <div className="bg-orange-50 rounded-lg p-2.5 border border-orange-100">
                              <div className="text-xs font-semibold text-orange-700 mb-0.5">⚠️ 难点</div>
                              <p className="text-xs text-orange-600 leading-relaxed">{content.coreObjectives.difficultPoints}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Teaching Sections */}
                  {content.sections.map((section, index) => (
                    <div
                      key={index}
                      className={cn(
                        "rounded-2xl border p-4 shadow-sm",
                        SECTION_BG_COLORS[index % SECTION_BG_COLORS.length],
                      )}
                    >
                      <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <span className="text-xl">{section.emoji}</span>
                        {section.title}
                      </h3>
                      <div className="text-[16px] text-gray-700 leading-[1.8] whitespace-pre-wrap">
                        {section.body}
                      </div>
                    </div>
                  ))}

                  {/* Exercise Card */}
                  {content.exercises && (
                    <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 shadow-sm">
                      <h3 className="text-base font-semibold text-amber-800 mb-3 flex items-center gap-2">
                        <span className="text-xl">📝</span>
                        课后练习
                      </h3>
                      <div className="text-[16px] text-amber-900 leading-[1.8] whitespace-pre-wrap">
                        {content.exercises}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* ═══ 测试 / 试卷模块：Markdown 直接渲染 ═══ */
                <div className="text-[15px] leading-[1.8] prose prose-sm max-w-none
                  prose-headings:text-gray-800 prose-headings:font-semibold
                  prose-h2:text-lg prose-h2:mt-6 prose-h2:mb-3 prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-1.5
                  prose-h3:text-base prose-h3:mt-5 prose-h3:mb-2
                  prose-p:text-gray-700 prose-p:my-2
                  prose-ul:my-1.5 prose-li:my-0.5
                  prose-strong:text-gray-900
                  prose-hr:my-5 prose-hr:border-dashed prose-hr:border-gray-300
                ">
                  <ReactMarkdown>{content.rawMarkdown}</ReactMarkdown>
                </div>
              )}
            </div>

            {/* Bottom padding for fixed bar */}
            <div className="h-20 md:hidden" />
          </div>
        </div>
      </div>
    </div>
  );
}

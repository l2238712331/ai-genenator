"use client";

import { GeneratedContent } from "@/types";
import { cn } from "@/lib/utils";

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

            {/* Section Cards */}
            <div className="p-3 space-y-3 pb-6">
              {content.sections.map((section, index) => (
                <div
                  key={index}
                  className={cn(
                    "rounded-2xl border p-4 shadow-sm",
                    SECTION_BG_COLORS[index % SECTION_BG_COLORS.length]
                  )}
                >
                  <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-xl">{section.emoji}</span>
                    {section.title}
                  </h3>
                  <div className="text-[16px] text-gray-700 leading-[1.6] whitespace-pre-wrap">
                    {section.body}
                  </div>
                </div>
              ))}

              {/* Exercise Card */}
              <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 shadow-sm">
                <h3 className="text-base font-semibold text-amber-800 mb-3 flex items-center gap-2">
                  <span className="text-xl">📝</span>
                  课后练习
                </h3>
                <div className="text-[16px] text-amber-900 leading-[1.6] whitespace-pre-wrap">
                  {content.exercises}
                </div>
              </div>
            </div>

            {/* Mobile bottom padding (for fixed bar) */}
            <div className="h-20 md:hidden" />
          </div>
        </div>
      </div>
    </div>
  );
}

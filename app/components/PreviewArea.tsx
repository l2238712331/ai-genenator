"use client";

import { GeneratedContent, type ViewMode } from "@/types";
import { StandardMode } from "./StandardMode";
import { H5Mode } from "./H5Mode";

interface Props {
  content: GeneratedContent;
}

import { useState } from "react";

export function PreviewArea({ content }: Props) {
  const [mode, setMode] = useState<ViewMode>("standard");

  return (
    <div>
      {/* Tabs */}
      <div className="flex bg-gray-100 rounded-xl p-1 mb-4 md:mb-6">
        <TabButton
          active={mode === "standard"}
          onClick={() => setMode("standard")}
          icon="📄"
          label="标准教案模式"
          subtitle="电脑首选"
        />
        <TabButton
          active={mode === "h5"}
          onClick={() => setMode("h5")}
          icon="📱"
          label="精美 H5 模式"
          subtitle="手机分享首选"
        />
      </div>

      {/* Mode Content */}
      {mode === "standard" ? (
        <StandardMode content={content} />
      ) : (
        <H5Mode content={content} />
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  subtitle: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 ${
        active
          ? "bg-white text-gray-900 shadow-sm"
          : "text-gray-500 hover:text-gray-700"
      }`}
    >
      <span className="text-base">{icon}</span>
      <span className="hidden sm:inline">{label}</span>
      <span className="text-xs opacity-60 hidden sm:inline">· {subtitle}</span>
      <span className="sm:hidden text-xs">{label}</span>
    </button>
  );
}

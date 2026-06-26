"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  type Subject,
  type ModuleTab,
  type Difficulty,
  type GradeLevel,
  type QuestionTypeConfig,
  SUBJECT_LABELS,
  SUBJECT_EMOJIS,
  SUBJECT_QUESTION_TYPES,
  MODULE_TABS,
  DIFFICULTY_LABELS,
  GRADE_LABELS,
} from "@/types";

export interface FormSubmitData {
  topic: string;
  subject: Subject;
  module: ModuleTab;
  difficulty: Difficulty;
  grade: GradeLevel;
  questionConfigs: QuestionTypeConfig[];
  customQuestion?: { enabled: boolean; description: string; count: number };
}

interface Props {
  onGenerate: (data: FormSubmitData) => void;
  isGenerating: boolean;
  onStop?: () => void;
}

export function InputPanel({ onGenerate, isGenerating, onStop }: Props) {
  // ── Subject & Module ──
  const [subject, setSubject] = useState<Subject>("english");
  const [activeModule, setActiveModule] = useState<ModuleTab>("lesson_plan");

  // ── Topic ──
  const [topic, setTopic] = useState("");

  // ── Difficulty & Grade ──
  const [difficulty, setDifficulty] = useState<Difficulty>("standard");
  const [grade, setGrade] = useState<GradeLevel>("middle");

  // ── Question Config ──
  const [questionConfigs, setQuestionConfigs] = useState<QuestionTypeConfig[]>([]);

  // ── Custom Question Type ──
  const [customEnabled, setCustomEnabled] = useState(false);
  const [customDescription, setCustomDescription] = useState("");
  const [customCount, setCustomCount] = useState(1);

  // 切换科目时重置题型
  useEffect(() => {
    const types = SUBJECT_QUESTION_TYPES[subject];
    setQuestionConfigs(
      types.map((t) => ({ type: t.value, label: t.label, count: 3 })),
    );
  }, [subject]);

  // 勾选/取消勾选
  const toggleQuestionType = useCallback((typeValue: string) => {
    setQuestionConfigs((prev) =>
      prev.map((q) =>
        q.type === typeValue ? { ...q, count: q.count > 0 ? 0 : 3 } : q,
      ),
    );
  }, []);

  // 调整数量
  const setCount = useCallback((typeValue: string, count: number) => {
    setQuestionConfigs((prev) =>
      prev.map((q) => (q.type === typeValue ? { ...q, count: Math.max(1, Math.min(count, 20)) } : q)),
    );
  }, []);

  const selectedConfigs = questionConfigs.filter((q) => q.count > 0);
  const showQuestionPanel = activeModule === "quiz_homework" || activeModule === "custom_exam";
  const totalQuestions = selectedConfigs.reduce((sum, q) => sum + q.count, 0);

  const canSubmit = topic.trim().length > 0 && !isGenerating;

  // 20 题软限制弹窗
  const [showLimitModal, setShowLimitModal] = useState(false);

  const handleSubmit = () => {
    if (!canSubmit) return;
    if (showQuestionPanel && totalQuestions > 20) {
      setShowLimitModal(true);
      return;
    }
    onGenerate({
      topic: topic.trim(),
      subject,
      module: activeModule,
      difficulty,
      grade,
      questionConfigs: selectedConfigs,
      ...(customEnabled && customDescription.trim()
        ? { customQuestion: { enabled: true, description: customDescription.trim(), count: customCount } }
        : {}),
    });
  };

  const forceSubmit = () => {
    setShowLimitModal(false);
    onGenerate({
      topic: topic.trim(),
      subject,
      module: activeModule,
      difficulty,
      grade,
      questionConfigs: selectedConfigs,
      ...(customEnabled && customDescription.trim()
        ? { customQuestion: { enabled: true, description: customDescription.trim(), count: customCount } }
        : {}),
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-5">
      <h2 className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
        <span>⚙️</span> 输入控制面板
      </h2>

      {/* ── Subject Tags ── */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">选择科目</label>
        <div className="grid grid-cols-5 gap-1.5 md:gap-2">
          {(Object.entries(SUBJECT_LABELS) as [Subject, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSubject(key)}
              className={cn(
                "px-2 py-2.5 rounded-xl border text-xs font-semibold text-center transition-all active:scale-95",
                subject === key
                  ? "bg-primary-50 border-primary-500 text-primary-700 shadow-sm"
                  : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50",
              )}
            >
              <span className="block text-sm mb-0.5">{SUBJECT_EMOJIS[key]}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Module Tabs ── */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">生成模块</label>
        <div className="grid grid-cols-3 gap-1.5">
          {MODULE_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveModule(tab.value)}
              className={cn(
                "px-2 py-3 rounded-xl border text-xs font-medium text-center transition-all",
                activeModule === tab.value
                  ? "bg-primary-50 border-primary-400 text-primary-700"
                  : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100",
              )}
            >
              <span className="block text-lg mb-0.5">{tab.emoji}</span>
              {tab.label}
              {tab.desc && (
                <span className="block text-[10px] text-gray-400 mt-0.5">{tab.desc}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Topic Input ── */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          知识点 / 主题
        </label>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={`请输入${SUBJECT_LABELS[subject]}知识点主题，例如：一次函数、勾股定理、现在完成时…`}
          rows={3}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm resize-none
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     placeholder:text-gray-400 transition-all"
        />
      </div>

      {/* ── Difficulty ── */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">难度选择</label>
        <div className="grid grid-cols-1 gap-2">
          {(Object.entries(DIFFICULTY_LABELS) as [Difficulty, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setDifficulty(key)}
              className={cn(
                "w-full text-left px-4 py-3 rounded-xl border text-sm font-medium transition-all",
                difficulty === key
                  ? "bg-primary-50 border-primary-500 text-primary-700"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Grade ── */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">学段选择</label>
        <div className="grid grid-cols-3 gap-2">
          {(Object.entries(GRADE_LABELS) as [GradeLevel, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setGrade(key)}
              className={cn(
                "px-3 py-2.5 rounded-xl border text-sm font-medium text-center transition-all",
                grade === key
                  ? "bg-primary-50 border-primary-500 text-primary-700"
                  : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50",
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Dynamic Question Type Panel (quiz_homework / custom_exam only) ── */}
      {showQuestionPanel && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
            <span>题型与数量配置</span>
            <span className="text-[10px] text-gray-400 font-normal">
              （勾选题型，调整数量）
            </span>
          </label>
          <div className="space-y-2 bg-gray-50 rounded-xl p-3">
            {questionConfigs.map((q) => (
              <div
                key={q.type}
                className={cn(
                  "flex items-center justify-between bg-white rounded-lg px-3 py-2 border transition-all",
                  q.count > 0 ? "border-primary-300" : "border-gray-200",
                )}
              >
                <label className="flex items-center gap-2 cursor-pointer select-none flex-1">
                  <input
                    type="checkbox"
                    checked={q.count > 0}
                    onChange={() => toggleQuestionType(q.type)}
                    className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span
                    className={cn(
                      "text-sm font-medium",
                      q.count > 0 ? "text-gray-900" : "text-gray-400",
                    )}
                  >
                    {q.label}
                  </span>
                </label>
                {q.count > 0 && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setCount(q.type, q.count - 1)}
                      className="w-7 h-7 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm font-bold flex items-center justify-center transition-all"
                    >
                      −
                    </button>
                    <input
                      type="number"
                      value={q.count}
                      onChange={(e) => setCount(q.type, parseInt(e.target.value) || 3)}
                      className="w-10 text-center text-sm font-semibold text-primary-700 border border-gray-200 rounded-lg py-0.5 focus:outline-none focus:border-primary-400"
                      min={1}
                      max={20}
                    />
                    <button
                      onClick={() => setCount(q.type, q.count + 1)}
                      className="w-7 h-7 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 text-sm font-bold flex items-center justify-center transition-all"
                    >
                      +
                    </button>
                    <span className="text-xs text-gray-400">题</span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 🎨 自由自定义题型 */}
          <label
            className={cn(
              "flex items-center gap-2 px-3 py-2.5 rounded-xl border cursor-pointer select-none transition-all",
              customEnabled
                ? "bg-indigo-50 border-indigo-400 shadow-sm"
                : "bg-white border-dashed border-gray-300 hover:border-indigo-300",
            )}
          >
            <input
              type="checkbox"
              checked={customEnabled}
              onChange={(e) => setCustomEnabled(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span
              className={cn(
                "text-sm font-medium flex items-center gap-1.5",
                customEnabled ? "text-indigo-700" : "text-gray-400",
              )}
            >
              🎨 自由自定义题型
            </span>
          </label>

          {customEnabled && (
            <div className="space-y-2 bg-indigo-50/50 rounded-xl p-3 border border-indigo-100 animate-in slide-in-from-top-1 duration-200">
              <textarea
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="请输入您需要的个性化题型（例如：结合时政热点的微写作、模仿XX高考真题的压轴几何题...）"
                rows={3}
                className="w-full text-sm border border-indigo-200 rounded-lg p-3 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 resize-none placeholder:text-gray-400"
              />
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">生成数量：</span>
                <button
                  onClick={() => setCustomCount((c) => Math.max(1, c - 1))}
                  className="w-7 h-7 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 text-sm font-bold flex items-center justify-center transition-all"
                >
                  −
                </button>
                <input
                  type="number"
                  value={customCount}
                  onChange={(e) => setCustomCount(parseInt(e.target.value) || 1)}
                  className="w-12 text-center text-sm font-semibold text-indigo-700 border border-indigo-200 rounded-lg py-1 focus:outline-none focus:border-indigo-400"
                  min={1}
                  max={20}
                />
                <button
                  onClick={() => setCustomCount((c) => Math.min(20, c + 1))}
                  className="w-7 h-7 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 text-sm font-bold flex items-center justify-center transition-all"
                >
                  +
                </button>
                <span className="text-xs text-gray-400">题</span>
              </div>
            </div>
          )}

          {/* 安全熔断提示 */}
          {totalQuestions > 0 && (
            <p className="text-[11px] text-amber-600 bg-amber-50 rounded-lg px-3 py-2 leading-relaxed">
              ⚠️ 温馨提示：为确保云端生成质量与速度，单次总题量建议不超过 15 道。
              如需大量题目，可分批生成后一键导出 Word 完美拼接。
            </p>
          )}
        </div>
      )}

      {/* ── Generate / Stop Button ── */}
      <div className="space-y-2">
        {isGenerating && onStop && (
          <button
            onClick={onStop}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 active:scale-[0.98] bg-red-50 border border-red-200 text-red-600 hover:bg-red-100"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
            停止生成
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={cn(
            "w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 active:scale-[0.98]",
            canSubmit
              ? "bg-primary-600 text-white hover:bg-primary-700 shadow-sm shadow-primary-200"
              : "bg-gray-200 text-gray-400 cursor-not-allowed",
            isGenerating && "hidden",
          )}
        >
          <span>✨</span> 开始生成
        </button>
      </div>

      {/* ── 20 题软限制确认弹窗 ── */}
      {showLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm mx-4 space-y-4">
            <div className="text-center">
              <span className="text-4xl">🤗</span>
              <h3 className="text-lg font-semibold text-gray-900 mt-2">建议分批生成，效果更佳哦！</h3>
              <p className="text-sm text-gray-500 mt-2">
                当前选择了 <span className="font-semibold text-amber-600">{totalQuestions} 道题</span>，
                单次题目过多可能导致响应变慢或超时。建议每批不超过 15 道。
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLimitModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
              >
                返回调整
              </button>
              <button
                onClick={forceSubmit}
                className="flex-1 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-all"
              >
                仍然生成
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

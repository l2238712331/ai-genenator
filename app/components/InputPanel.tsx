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
  SUBJECT_QUESTION_TYPES,
  MODULE_TABS,
} from "@/types";

export interface FormSubmitData {
  topic: string;
  subject?: Subject;
  module: ModuleTab;
  difficulty: Difficulty;
  grade: GradeLevel;
  questionConfigs: QuestionTypeConfig[];
  customQuestion?: { enabled: boolean; description: string; count: number };
  // 举一反三改编
  action?: "generate" | "simplify" | "advance" | "adapt_wrong_question";
  adaptWrongQuestion?: string;
  adaptCount?: number;
  // 教材大纲同步
  textbookSubject?: string;
  textbookVersion?: string;
  gradeLevel?: string;
  chapterName?: string;
  // 生成模式
  generateMode?: "knowledge" | "textbook";
  // 额外要求
  extraRequirements?: string;
  // 答案控制
  generateAnswer?: boolean;
  generateExplanation?: boolean;
}

interface Props {
  onGenerate: (data: FormSubmitData) => void;
  isGenerating: boolean;
  onStop?: () => void;
}

export function InputPanel({ onGenerate, isGenerating, onStop }: Props) {
  // ── Generate Mode ──
  const [generateMode, setGenerateMode] = useState<"knowledge" | "textbook">("knowledge");

  // ── Module ──
  const [activeModule, setActiveModule] = useState<ModuleTab>("lesson_plan");

  // ── Topic ──
  const [topic, setTopic] = useState("");

  // ── Difficulty & Grade (defaults, no UI)
  const [difficulty] = useState<Difficulty>("standard" as Difficulty);
  const [grade] = useState<GradeLevel>("middle" as GradeLevel);

  // ── Question Config ──
  const [questionConfigs, setQuestionConfigs] = useState<QuestionTypeConfig[]>([]);

  // ── Custom Question Type ──
  const [customEnabled, setCustomEnabled] = useState(false);
  const [customDescription, setCustomDescription] = useState("");
  const [customCount, setCustomCount] = useState(1);

  // ── Adapt Wrong Question ──
  const [adaptOriginalQuestion, setAdaptOriginalQuestion] = useState("");
  const [adaptCount, setAdaptCount] = useState(1);

  // ── 教材大纲同步 ──
  const [textbookSubject, setTextbookSubject] = useState("");
  const [textbookVersion, setTextbookVersion] = useState("");
  const [textbookGrade, setTextbookGrade] = useState("");
  const [textbookChapter, setTextbookChapter] = useState("");

  // ── 额外要求 ──
  const [extraRequirements, setExtraRequirements] = useState("");

  // ── 答案控制 ──
  const [generateAnswer, setGenerateAnswer] = useState(false);
  const [generateExplanation, setGenerateExplanation] = useState(false);

  // 科目由 AI 自行判断，前端根据教材科目联动题型
  const resolveSubjectFromLabel = (label: string): Subject | undefined =>
    (Object.entries(SUBJECT_LABELS) as [Subject, string][]).find(([, v]) => v === label)?.[0];

  // 教材科目变化 → 同步更新题型
  useEffect(() => {
    if (!textbookSubject) return;
    const s = resolveSubjectFromLabel(textbookSubject);
    if (!s) return;
    const types = SUBJECT_QUESTION_TYPES[s];
    setQuestionConfigs(
      types.map((t) => ({ type: t.value, label: t.label, count: 3 })),
    );
  }, [textbookSubject]);

  // 初始默认题型（通用）
  useEffect(() => {
    const types = SUBJECT_QUESTION_TYPES["english"];
    setQuestionConfigs(
      types.map((t) => ({ type: t.value, label: t.label, count: 3 })),
    );
  }, []);

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

  // 教材章节可替代手填主题
  const effectiveTopic = topic.trim() || textbookChapter.trim();
  const canSubmit = effectiveTopic.length > 0 && !isGenerating;

  // 20 题软限制弹窗
  const [showLimitModal, setShowLimitModal] = useState(false);

  // 知识点模式下不传教材参数，避免锁定学科
  const textbookPayload =
    generateMode === "textbook"
      ? {
          textbookVersion: textbookVersion || undefined,
          gradeLevel: textbookGrade || undefined,
          chapterName: textbookChapter.trim() || undefined,
          textbookSubject: textbookSubject || undefined,
        }
      : {};

  const handleSubmit = () => {
    if (!canSubmit) return;
    if (showQuestionPanel && totalQuestions > 20) {
      setShowLimitModal(true);
      return;
    }
    onGenerate({
      topic: effectiveTopic,
      module: activeModule,
      difficulty,
      grade,
      questionConfigs: selectedConfigs,
      ...(customEnabled && customDescription.trim()
        ? { customQuestion: { enabled: true, description: customDescription.trim(), count: customCount } }
        : {}),
      ...textbookPayload,
      generateMode,
      extraRequirements: extraRequirements.trim() || undefined,
      generateAnswer,
      generateExplanation: generateAnswer ? generateExplanation : undefined,
    });
  };

  const forceSubmit = () => {
    setShowLimitModal(false);
    onGenerate({
      topic: effectiveTopic,
      module: activeModule,
      difficulty,
      grade,
      questionConfigs: selectedConfigs,
      ...(customEnabled && customDescription.trim()
        ? { customQuestion: { enabled: true, description: customDescription.trim(), count: customCount } }
        : {}),
      ...textbookPayload,
      generateMode,
      extraRequirements: extraRequirements.trim() || undefined,
      generateAnswer,
      generateExplanation: generateAnswer ? generateExplanation : undefined,
    });
  };

  // 举一反三改编提交
  const canAdapt = adaptOriginalQuestion.trim().length > 0 && !isGenerating;

  const handleAdaptSubmit = () => {
    if (!canAdapt) return;
    onGenerate({
      topic: adaptOriginalQuestion.trim(),
      module: activeModule,
      difficulty,
      grade,
      questionConfigs: [],
      action: "adapt_wrong_question",
      adaptWrongQuestion: adaptOriginalQuestion.trim(),
      adaptCount,
      ...textbookPayload,
      generateMode,
      extraRequirements: extraRequirements.trim() || undefined,
      generateAnswer,
      generateExplanation: generateAnswer ? generateExplanation : undefined,
    });
  };

  return (
    <>
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 space-y-5">
      <h2 className="text-base md:text-lg font-semibold text-gray-900 flex items-center gap-2">
        <span>⚙️</span> 输入控制面板
      </h2>

      {/* ── Generate Mode Toggle ── */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">生成方式</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setGenerateMode("knowledge")}
            className={cn(
              "px-4 py-3 rounded-xl border text-sm font-semibold text-center transition-all active:scale-95",
              generateMode === "knowledge"
                ? "bg-primary-50 border-primary-500 text-primary-700 shadow-sm"
                : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50",
            )}
          >
            <span className="block text-lg mb-0.5">🧠</span>
            按知识点生成
          </button>
          <button
            onClick={() => setGenerateMode("textbook")}
            className={cn(
              "px-4 py-3 rounded-xl border text-sm font-semibold text-center transition-all active:scale-95",
              generateMode === "textbook"
                ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm"
                : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50",
            )}
          >
            <span className="block text-lg mb-0.5">📚</span>
            按教材生成
          </button>
        </div>
      </div>

      {/* ── 知识点模式：Topic Input ── */}
      {generateMode === "knowledge" && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            知识点 / 主题
          </label>
          <textarea
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="请输入知识点主题，例如：一次函数、勾股定理、现在完成时、光合作用…（AI 将自动识别科目）"
            rows={3}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm resize-none
                       focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                       placeholder:text-gray-400 transition-all"
          />
        </div>
      )}

      {/* ── 教材模式：教材大纲同步 ── */}
      {generateMode === "textbook" && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
            📚 教材大纲同步
          </label>
          <div className="grid grid-cols-3 gap-2">
            <select
              value={textbookSubject}
              onChange={(e) => setTextbookSubject(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 text-gray-700"
            >
              <option value="">科目</option>
              {(Object.entries(SUBJECT_LABELS) as [Subject, string][]).map(([key, label]) => (
                <option key={key} value={label}>{label}</option>
              ))}
            </select>
            <select
              value={textbookVersion}
              onChange={(e) => setTextbookVersion(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 text-gray-700"
            >
              <option value="">教材版本</option>
              <option value="人教版">人教版</option>
              <option value="北师大版">北师大版</option>
              <option value="苏教版">苏教版</option>
              <option value="粤教版">粤教版</option>
              <option value="部编版">部编版</option>
              <option value="沪教版">沪教版</option>
              <option value="浙教版">浙教版</option>
            </select>
            <select
              value={textbookGrade}
              onChange={(e) => setTextbookGrade(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 text-gray-700"
            >
              <option value="">年级</option>
              <option value="一年级上">一年级上</option><option value="一年级下">一年级下</option>
              <option value="二年级上">二年级上</option><option value="二年级下">二年级下</option>
              <option value="三年级上">三年级上</option><option value="三年级下">三年级下</option>
              <option value="四年级上">四年级上</option><option value="四年级下">四年级下</option>
              <option value="五年级上">五年级上</option><option value="五年级下">五年级下</option>
              <option value="六年级上">六年级上</option><option value="六年级下">六年级下</option>
              <option value="七年级上">七年级上</option><option value="七年级下">七年级下</option>
              <option value="八年级上">八年级上</option><option value="八年级下">八年级下</option>
              <option value="九年级上">九年级上</option><option value="九年级下">九年级下</option>
              <option value="高一上">高一上</option><option value="高一下">高一下</option>
              <option value="高二上">高二上</option><option value="高二下">高二下</option>
              <option value="高三上">高三上</option><option value="高三下">高三下</option>
            </select>
          </div>
          <input
            type="text"
            value={textbookChapter}
            onChange={(e) => setTextbookChapter(e.target.value)}
            placeholder="输入具体章节，如：第三章 3.1.1 一元一次方程的概念"
            className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 bg-white focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-400 placeholder:text-gray-400 text-gray-700"
          />
        </div>
      )}

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

      {/* ── 额外要求 ── */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
          ✨ 额外要求
        </label>
        <textarea
          value={extraRequirements}
          onChange={(e) => setExtraRequirements(e.target.value)}
          placeholder="可自由输入额外要求，例如：需要包含3道应用题、出题风格贴近中考真题…（选填）"
          rows={2}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm resize-none
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     placeholder:text-gray-400 transition-all"
        />
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
                onChange={(e) => setCustomDescription(e.target.value.slice(0, 100))}
                placeholder="请输入您需要的个性化题型（例如：结合时政热点的微写作、模仿XX高考真题的压轴几何题...）"
                rows={3}
                maxLength={100}
                className="w-full text-sm border border-indigo-200 rounded-lg p-3 focus:outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-400 resize-none placeholder:text-gray-400"
              />
              <div className="flex items-center justify-between">
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
                <span className="text-[10px] text-gray-400">{customDescription.length}/100</span>
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

      {/* ── 答案控制 + Generate ── */}
      <div className="space-y-3">
        {/* 答案控制勾选项 */}
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={generateAnswer}
              onChange={(e) => {
                setGenerateAnswer(e.target.checked);
                if (!e.target.checked) setGenerateExplanation(false);
              }}
              className="w-3.5 h-3.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span>📝 生成答案</span>
          </label>
          {generateAnswer && (
            <label className="flex items-center gap-1.5 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={generateExplanation}
                onChange={(e) => setGenerateExplanation(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
              />
              <span>🔍 含深度解析</span>
            </label>
          )}
        </div>

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

    {/* ⚡ 举一反三改编 — 独立卡片 */}
    <div className="bg-white rounded-2xl border-2 border-amber-300 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-amber-400 to-orange-400 px-5 py-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
          ⚡ 错题/真题一键改编（举一反三）
        </h3>
      </div>
      <div className="p-4 space-y-3">
        <textarea
          value={adaptOriginalQuestion}
          onChange={(e) => setAdaptOriginalQuestion(e.target.value)}
          placeholder="请将难倒学生的经典错题、期中/期末真题原题粘贴到这里……"
          rows={4}
          className="w-full text-sm border border-gray-200 rounded-lg p-3 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 resize-none placeholder:text-gray-400 bg-gray-50"
        />
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-600 font-medium">变式数量：</span>
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              onClick={() => setAdaptCount(n)}
              className={cn(
                "w-10 h-8 rounded-lg text-sm font-semibold transition-all",
                adaptCount === n
                  ? "bg-amber-500 text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-amber-50",
              )}
            >
              {n}
            </button>
          ))}
          <span className="text-xs text-gray-400 ml-auto">{adaptOriginalQuestion.length} 字</span>
        </div>
        <button
          onClick={handleAdaptSubmit}
          disabled={!canAdapt}
          className={cn(
            "w-full py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]",
            canAdapt
              ? "bg-amber-500 text-white hover:bg-amber-600 shadow-sm shadow-amber-200"
              : "bg-gray-200 text-gray-400 cursor-not-allowed",
            isGenerating && "hidden",
          )}
        >
          <span>✨</span> 开始举一反三变式生成
        </button>
      </div>
    </div>
    </>
  );
}

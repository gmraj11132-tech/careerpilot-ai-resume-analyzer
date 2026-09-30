"use client";

import React, { useState } from "react";
import {
  Sparkles,
  Zap,
  Bot,
  Brain,
  ShieldCheck,
  ChevronDown,
  Key,
  Info,
  Check,
} from "lucide-react";
import { AVAILABLE_MODELS, AIModelOption } from "@/lib/types";

interface ModelSelectorProps {
  selectedModelId: string;
  onSelectModel: (modelId: string, customApiKey?: string) => void;
  disabled?: boolean;
}

export default function ModelSelector({
  selectedModelId,
  onSelectModel,
  disabled = false,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customKey, setCustomKey] = useState("");
  const [showKeyInput, setShowKeyInput] = useState(false);

  const selectedModel =
    AVAILABLE_MODELS.find((m) => m.id === selectedModelId) || AVAILABLE_MODELS[0];

  const getProviderIcon = (provider: string, className = "w-4 h-4") => {
    switch (provider) {
      case "google":
        return <Sparkles className={`${className} text-blue-500`} />;
      case "openai":
        return <Bot className={`${className} text-emerald-500`} />;
      case "anthropic":
        return <Brain className={`${className} text-amber-500`} />;
      case "groq":
        return <Zap className={`${className} text-orange-500`} />;
      default:
        return <ShieldCheck className={`${className} text-indigo-500`} />;
    }
  };

  const handleModelClick = (model: AIModelOption) => {
    onSelectModel(model.id, customKey.trim() || undefined);
    setIsOpen(false);
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomKey(val);
    onSelectModel(selectedModel.id, val.trim() || undefined);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
            AI Engine / Evaluation Model
          </label>
          <div className="flex items-center gap-2">
            {getProviderIcon(selectedModel.provider, "w-5 h-5")}
            <span className="font-semibold text-gray-900 dark:text-white text-base">
              {selectedModel.name}
            </span>
            {selectedModel.badge && (
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-700">
                {selectedModel.badge}
              </span>
            )}
            <span className="text-xs text-gray-400 font-mono hidden md:inline">
              ({selectedModel.speed})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={disabled}
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center justify-between gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700/60 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors disabled:opacity-50"
          >
            <span>Change Model</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </button>

          <button
            type="button"
            disabled={disabled}
            onClick={() => setShowKeyInput(!showKeyInput)}
            title="Configure custom API key"
            className={`p-1.5 text-sm border rounded-lg transition-colors ${
              customKey
                ? "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300"
                : "text-gray-500 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            <Key className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Model Selection Dropdown / Grid */}
      {isOpen && (
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Select an LLM model or the local rule-based heuristic engine:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {AVAILABLE_MODELS.map((m) => {
              const isSelected = m.id === selectedModel.id;
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handleModelClick(m)}
                  className={`text-left p-3 rounded-lg border transition-all flex items-start justify-between gap-2 ${
                    isSelected
                      ? "bg-blue-50/70 border-blue-500 dark:bg-blue-900/20 dark:border-blue-400 ring-1 ring-blue-500"
                      : "bg-white dark:bg-gray-800/80 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      {getProviderIcon(m.provider)}
                      <span className="font-medium text-sm text-gray-900 dark:text-white">
                        {m.name}
                      </span>
                      {m.badge && (
                        <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                          {m.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                      {m.description}
                    </p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Optional Custom API Key Drawer */}
      {showKeyInput && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <Key className="w-3.5 h-3.5 text-amber-500" />
              Optional Custom API Key ({selectedModel.provider.toUpperCase()})
            </span>
            {customKey && (
              <button
                type="button"
                onClick={() => {
                  setCustomKey("");
                  onSelectModel(selectedModel.id, undefined);
                }}
                className="text-[11px] text-red-500 hover:underline"
              >
                Clear Key
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="password"
              value={customKey}
              onChange={handleKeyChange}
              placeholder={`Enter custom ${selectedModel.provider} API key (e.g. AIzaSy... or sk-...)`}
              className="flex-1 text-xs px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 font-mono"
            />
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400 mt-1.5">
            <Info className="w-3.5 h-3.5 flex-shrink-0" />
            <span>
              Left blank? CareerPilot automatically uses configured server keys or seamlessly runs
              the Deterministic Heuristic Engine.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

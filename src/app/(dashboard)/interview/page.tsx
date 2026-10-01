"use client";

import React, { useState } from "react";
import {
  Loader2,
  MessageSquare,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  Cpu,
} from "lucide-react";
import ModelSelector from "@/components/ModelSelector";

interface Question {
  id: string;
  category: "Technical" | "HR" | "Behavioral" | "Project";
  text: string;
  difficulty: string;
  answer: string;
  keyPoints: string[];
}

export default function InterviewPrepPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sessionModelName, setSessionModelName] = useState<string | null>(null);
  const [selectedModelId, setSelectedModelId] = useState("gemini-2.0-flash");
  const [customApiKey, setCustomApiKey] = useState<string | undefined>(undefined);

  const [formData, setFormData] = useState({
    title: "",
    skills: "",
    difficulty: "MEDIUM",
  });

  const getAuthHeaders = (): Record<string, string> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("careerpilot_token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      setError("Job Title is required");
      return;
    }

    setLoading(true);
    setError("");
    setQuestions([]);

    try {
      const skillsArray = formData.skills
        ? formData.skills.split(",").map((s) => s.trim()).filter(Boolean)
        : ["Problem Solving", "Communication", "Data Structures"];

      const res = await fetch("/api/interview/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          jobTitle: formData.title,
          skills: skillsArray.length > 0 ? skillsArray : ["General"],
          difficulty: formData.difficulty,
          modelId: selectedModelId,
          customApiKey,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to generate questions");
      }

      const data = await res.json();
      const rawQuestions = data.session?.questions || [];
      setSessionModelName(data.session?.modelName || selectedModelId);

      const formatted: Question[] = rawQuestions.map((q: any) => ({
        id: q.id,
        category: (q.category.charAt(0) + q.category.slice(1).toLowerCase()) as any,
        difficulty: q.difficulty,
        text: q.question,
        answer: q.suggestedAnswer || "",
        keyPoints: Array.isArray(q.keyPoints) ? q.keyPoints : [],
      }));

      setQuestions(formatted);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to generate questions");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
          AI Interview Preparation & Mock Q&A
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Generate realistic technical, behavioral, and role-specific placement interview questions tailored to any tech stack.
        </p>
      </div>

      {/* Model Selector Card */}
      <ModelSelector
        selectedModelId={selectedModelId}
        onSelectModel={(mId, key) => {
          setSelectedModelId(mId);
          setCustomApiKey(key);
        }}
        disabled={loading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-6">
          <form
            onSubmit={handleGenerate}
            className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-xs p-6 space-y-5"
          >
            {error && (
              <div className="text-red-600 dark:text-red-400 text-xs bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:border-red-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Role / Job Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. SDE-1, Full Stack Developer, Data Analyst"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Key Skills (comma separated)
              </label>
              <input
                type="text"
                placeholder="React, Node.js, SQL, System Design"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Target Difficulty
              </label>
              <div className="flex gap-4">
                {["EASY", "MEDIUM", "HARD"].map((level) => (
                  <label key={level} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="difficulty"
                      value={level}
                      checked={formData.difficulty === level}
                      onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300 capitalize">
                      {level.toLowerCase()}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <BrainCircuit className="w-5 h-5" />
              )}
              {loading ? "Generating Questions..." : "Generate Mock Questions"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-8">
          {!loading && questions.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-gray-50 dark:bg-gray-800/40 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl min-h-[350px]">
              <MessageSquare className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Ready to Practice
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm">
                Enter your target position on the left to generate customized technical and behavioral interview questions with structured STAR answers.
              </p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center p-12 bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-xl min-h-[350px] space-y-3">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Generating Questions...
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Formulating scenario-based placement interview questions and model answers.
              </p>
            </div>
          )}

          {questions.length > 0 && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-yellow-50 dark:bg-amber-950/30 border border-yellow-200 dark:border-amber-800 text-yellow-800 dark:text-amber-300 p-3.5 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>
                    AI answers provide structural frameworks. Adapt them with your authentic project experience.
                  </span>
                </div>
                {sessionModelName && (
                  <span className="inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded bg-yellow-100 dark:bg-amber-900/60 border border-yellow-300 dark:border-amber-700 text-yellow-900 dark:text-amber-200 text-[11px] self-start sm:self-auto">
                    <Cpu className="w-3 h-3" />
                    {sessionModelName}
                  </span>
                )}
              </div>

              {questions.map((q) => (
                <div
                  key={q.id}
                  className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-xs overflow-hidden"
                >
                  <div className="p-5 border-b dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-semibold rounded-full">
                        {q.category}
                      </span>
                      <span className="px-2.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-full">
                        {q.difficulty}
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white leading-snug">
                      {q.text}
                    </h3>
                  </div>

                  <div>
                    <button
                      onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                      className="w-full px-5 py-3 bg-gray-50/80 dark:bg-gray-800/80 text-left flex justify-between items-center text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors"
                    >
                      <span>{expandedId === q.id ? "Hide Suggested Answer" : "View Suggested Answer & Key Points"}</span>
                      {expandedId === q.id ? (
                        <ChevronUp className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      )}
                    </button>

                    {expandedId === q.id && (
                      <div className="p-5 border-t dark:border-gray-700 space-y-4 bg-gray-50/50 dark:bg-gray-900/30">
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1.5">
                            Recommended Answer Structure:
                          </h4>
                          <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                            {q.answer}
                          </p>
                        </div>
                        {q.keyPoints.length > 0 && (
                          <div>
                            <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-1.5">
                              Core Points to Emphasize:
                            </h4>
                            <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-300 space-y-1">
                              {q.keyPoints.map((kp, i) => (
                                <li key={i}>{kp}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

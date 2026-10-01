"use client";

import React, { useState } from "react";
import {
  Search,
  AlertCircle,
  Loader2,
  Target,
  Briefcase,
  ChevronRight,
  Info,
  Cpu,
} from "lucide-react";
import ModelSelector from "@/components/ModelSelector";

export default function JobMatchPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);
  const [selectedModelId, setSelectedModelId] = useState("gemini-2.0-flash");
  const [customApiKey, setCustomApiKey] = useState<string | undefined>(undefined);

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    description: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      setError("Job title and description are required.");
      return;
    }

    setLoading(true);
    setError("");

    const getAuthHeaders = (): Record<string, string> => {
      const token = typeof window !== "undefined" ? localStorage.getItem("careerpilot_token") : null;
      return token ? { Authorization: `Bearer ${token}` } : {};
    };

    try {
      const res = await fetch("/api/jobs/match", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          jobTitle: formData.title,
          companyName: formData.company,
          jobDescription: formData.description,
          modelId: selectedModelId,
          customApiKey,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to match resume with job.");
      }

      const data = await res.json();
      const m = data.match;
      setResult({
        matchPercentage: m.matchPercentage,
        analysisType: m.analysisType === "AI" ? "AI-Powered" : "Rule-Based Engine",
        modelName: m.modelName || selectedModelId,
        matchingSkills: m.matchingSkills || [],
        missingSkills: m.missingSkills || [],
        relevantProjects: m.relevantProjects || [],
        relevantExperience: m.relevantExperience || [],
        suggestedChanges: m.suggestedChanges || [],
        learningTopics: m.suggestedTopics || [],
        keywords: m.keywords || [],
      });
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to match resume with job.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
          Job Description Matcher & Gap Analysis
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Compare your active resume against any placement opening or job description using intelligent AI matching.
        </p>
      </div>

      {/* Model Selector */}
      <ModelSelector
        selectedModelId={selectedModelId}
        onSelectModel={(mId, key) => {
          setSelectedModelId(mId);
          setCustomApiKey(key);
        }}
        disabled={loading}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <form
            onSubmit={handleMatch}
            className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-xs p-6 space-y-5"
          >
            {error && (
              <div className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 p-3 rounded-lg text-sm flex items-center gap-2 border border-red-200 dark:border-red-800">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Job Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Software Engineer / Frontend Developer"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Company Name (Optional)
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="e.g. Google, Microsoft, Infosys"
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Job Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Paste the target job description or requirements here..."
                rows={8}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg p-2.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-1 focus:ring-blue-500 resize-none font-mono text-xs"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Target className="w-5 h-5" />
              )}
              {loading ? "Evaluating Match..." : "Match Resume Against Job"}
            </button>
          </form>
        </div>

        <div className="lg:col-span-7">
          {!result && !loading && (
            <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-gray-50 dark:bg-gray-800/40 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl min-h-[350px]">
              <Briefcase className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Ready for Job Alignment
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                Paste any job opening requirements on the left to extract missing skills, align projects, and receive customized keyword suggestions.
              </p>
            </div>
          )}

          {loading && (
            <div className="h-full flex flex-col items-center justify-center p-12 bg-gray-50 dark:bg-gray-800/40 border border-gray-200 dark:border-gray-700 rounded-xl min-h-[350px] space-y-3">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Computing Alignment Vectors...
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Comparing required tech stack against candidate experiences and projects.
              </p>
            </div>
          )}

          {result && !loading && (
            <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-xs overflow-hidden">
              <div
                className={`p-6 text-white ${
                  result.matchPercentage >= 70
                    ? "bg-emerald-600"
                    : result.matchPercentage >= 40
                    ? "bg-amber-500"
                    : "bg-red-600"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs uppercase tracking-wider font-semibold opacity-90 mb-1">
                      Job Alignment Score
                    </p>
                    <div className="flex items-end gap-2">
                      <span className="text-5xl font-extrabold">{result.matchPercentage}%</span>
                    </div>
                  </div>
                  <span className="bg-white/20 text-white px-3 py-1 rounded-full text-xs font-medium backdrop-blur-xs flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" />
                    {result.modelName || result.analysisType}
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
                      Matching Skills ({result.matchingSkills.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {result.matchingSkills.map((skill: string) => (
                        <span
                          key={skill}
                          className="bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-md text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
                      Missing / Required Skills ({result.missingSkills.length})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {result.missingSkills.map((skill: string) => (
                        <span
                          key={skill}
                          className="bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-md text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
                    Key ATS Keywords
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {result.keywords.map((kw: string) => (
                      <span
                        key={kw}
                        className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-2.5 py-1 rounded-md text-xs font-mono"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t dark:border-gray-700 pt-6">
                  <div>
                    <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
                      Suggested Resume Edits
                    </h4>
                    <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-300 space-y-1.5">
                      {result.suggestedChanges.map((change: string, idx: number) => (
                        <li key={idx}>{change}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-2">
                      Recommended Learning Topics
                    </h4>
                    <ul className="list-disc list-inside text-xs text-gray-600 dark:text-gray-300 space-y-1.5">
                      {result.learningTopics.map((topic: string, idx: number) => (
                        <li key={idx}>{topic}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-gray-500 dark:text-gray-400">
                  <Info className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                  <span>
                    Match scores are generated algorithmically for preparation and tailored application purposes. They do not constitute guaranteed placement results.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

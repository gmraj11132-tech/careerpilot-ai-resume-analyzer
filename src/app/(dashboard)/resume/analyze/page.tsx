"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  AlertCircle,
  Loader2,
  CheckCircle,
  Info,
  ChevronRight,
  RefreshCw,
  Cpu,
} from "lucide-react";
import { useRouter } from "next/navigation";
import ModelSelector from "@/components/ModelSelector";

export default function ResumeAnalyzePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [selectedModelId, setSelectedModelId] = useState("gemini-2.0-flash");
  const [customApiKey, setCustomApiKey] = useState<string | undefined>(undefined);
  const [error, setError] = useState("");

  const getAuthHeaders = (): Record<string, string> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("careerpilot_token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    try {
      const res = await fetch("/api/resume/upload", { headers: getAuthHeaders() });
      if (!res.ok) throw new Error("Failed to fetch resume");
      const data = await res.json();
      if (data.resumes && data.resumes.length > 0) {
        const latest = data.resumes[0];
        setResumeData(latest);

        // Also load latest analysis if available
        const anRes = await fetch("/api/resume/analyze", { headers: getAuthHeaders() });
        if (anRes.ok) {
          const anData = await anRes.json();
          if (anData.analyses && anData.analyses.length > 0) {
            const a = anData.analyses[0];
            setAnalysisResult({
              score: a.overallScore,
              type: a.analysisType === "AI" ? "AI-Powered" : "Rule-Based Engine",
              modelName: a.modelName || (a.analysisType === "AI" ? "Gemini 2.0 Flash" : "Deterministic Engine"),
              provider: a.provider || "google",
              breakdown: {
                ats: a.atsScore,
                skills: a.skillsScore,
                experience: a.experienceScore,
                education: a.educationScore,
                formatting: a.formattingScore,
              },
              missingSections: a.missingSections || [],
              detectedSkills: a.detectedSkills || [],
              suggestions: a.suggestions || [],
            });
          }
        }
      } else {
        setResumeData(null);
      }
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to fetch resume status.");
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!resumeData?.id) return;
    setAnalyzing(true);
    setError("");
    try {
      const res = await fetch("/api/resume/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify({
          resumeId: resumeData.id,
          modelId: selectedModelId,
          customApiKey,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Analysis failed.");
      }
      const data = await res.json();
      const a = data.analysis;
      setAnalysisResult({
        score: a.overall,
        type: a.analysisType === "AI" ? "AI-Powered" : "Rule-Based Engine",
        modelName: a.modelName || selectedModelId,
        provider: a.provider,
        breakdown: {
          ats: a.ats,
          skills: a.skills,
          experience: a.experience,
          education: a.education,
          formatting: a.formatting,
        },
        missingSections: a.missingSections || [],
        detectedSkills: a.detectedSkills || [],
        suggestions: a.suggestions || [],
      });
      setAnalyzing(false);
    } catch (err: any) {
      setError(err.message || "Analysis failed. Please try again.");
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!resumeData) {
    return (
      <div className="max-w-4xl mx-auto p-6 mt-10">
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-xs p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">No Resume Found</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            Please upload a resume first to evaluate ATS compatibility and skill gaps.
          </p>
          <button
            onClick={() => router.push("/resume/upload")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
          >
            Upload Resume <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
            Resume Analysis & Multi-Model Evaluation
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Active Resume: <span className="font-semibold text-gray-900 dark:text-white">{resumeData.fileName || "Uploaded Resume"}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium disabled:opacity-50 flex items-center gap-2 transition-colors shadow-xs"
          >
            {analyzing ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : analysisResult ? (
              <RefreshCw className="w-5 h-5" />
            ) : (
              <FileText className="w-5 h-5" />
            )}
            {analyzing
              ? "Evaluating..."
              : analysisResult
              ? "Re-Analyze with Model"
              : "Analyze Resume"}
          </button>
        </div>
      </div>

      {/* Model Selector Card */}
      <ModelSelector
        selectedModelId={selectedModelId}
        onSelectModel={(mId, key) => {
          setSelectedModelId(mId);
          setCustomApiKey(key);
        }}
        disabled={analyzing}
      />

      {error && (
        <div className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-800 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {analyzing && (
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-xs p-12 text-center space-y-3">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
            Running Analysis Workflow...
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
            Reviewing formatting, calculating keyword density, validating section structures, and generating tailored placement recommendations.
          </p>
        </div>
      )}

      {/* Results View */}
      {analysisResult && !analyzing && (
        <div className="space-y-6">
          {/* Main Score & Breakdown Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-xs p-8 text-center flex flex-col items-center justify-center">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3">
                CareerPilot Resume Score
              </h3>
              <div
                className={`relative w-36 h-36 flex items-center justify-center rounded-full border-8 mb-4 ${
                  analysisResult.score >= 75
                    ? "border-emerald-500 text-emerald-600"
                    : analysisResult.score >= 55
                    ? "border-amber-500 text-amber-600"
                    : "border-red-500 text-red-600"
                }`}
              >
                <span className="text-4xl font-extrabold text-gray-900 dark:text-white">
                  {analysisResult.score}
                </span>
                <span className="text-xs text-gray-400 absolute bottom-5">/100</span>
              </div>
              <div className="flex flex-col items-center gap-1.5">
                <span className="bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-xs font-semibold px-3 py-1 rounded-full border border-blue-200 dark:border-blue-800 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  {analysisResult.modelName || analysisResult.type}
                </span>
              </div>
            </div>

            <div className="md:col-span-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-xs p-6 space-y-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white border-b dark:border-gray-700 pb-2">
                Score Breakdown
              </h3>
              {Object.entries(analysisResult.breakdown).map(([key, value]: [string, any]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm font-medium mb-1 capitalize">
                    <span className="text-gray-700 dark:text-gray-300">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </span>
                    <span className="text-gray-900 dark:text-white font-semibold">
                      {value}/100
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full transition-all duration-500 ${
                        value >= 80
                          ? "bg-emerald-500"
                          : value >= 60
                          ? "bg-amber-400"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detected Skills & Missing Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-xs p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                Detected Skills ({analysisResult.detectedSkills.length})
              </h3>
              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-1">
                {analysisResult.detectedSkills.map((skill: string) => (
                  <span
                    key={skill}
                    className="bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 px-2.5 py-1 rounded-md text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-xs p-6">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                Missing Sections / Improvement Areas
              </h3>
              {analysisResult.missingSections.length > 0 ? (
                <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                  {analysisResult.missingSections.map((section: string) => (
                    <li key={section}>{section}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> All critical placement resume sections detected!
                </p>
              )}
            </div>
          </div>

          {/* Actionable Suggestions */}
          <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-xs p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">
              Actionable Recommendations
            </h3>
            <ul className="space-y-3">
              {analysisResult.suggestions.map((sug: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-700 dark:text-gray-300">
                  <span className="bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-300 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span>{sug}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Official Disclaimer */}
          <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              <strong>Disclaimer:</strong> CareerPilot Resume Score is an internal heuristic and AI-assisted guideline designed to optimize student resumes for on-campus placements and technical screenings. It is not an official trademarked ATS score and does not guarantee job offers.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

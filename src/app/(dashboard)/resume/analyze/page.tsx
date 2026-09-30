"use client";

import React, { useState, useEffect } from "react";
import { FileText, AlertCircle, Loader2, CheckCircle, Info, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ResumeAnalyzePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [resumeData, setResumeData] = useState<any>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchResume();
  }, []);

  const fetchResume = async () => {
    try {
      const res = await fetch("/api/resume/upload");
      if (!res.ok) throw new Error("Failed to fetch resume");
      const data = await res.json();
      if (data.resumes && data.resumes.length > 0) {
        const latest = data.resumes[0];
        setResumeData(latest);
        
        // Also load latest analysis if available
        const anRes = await fetch("/api/resume/analyze");
        if (anRes.ok) {
          const anData = await anRes.json();
          if (anData.analyses && anData.analyses.length > 0) {
            const a = anData.analyses[0];
            setAnalysisResult({
              score: a.overallScore,
              type: a.analysisType === "AI" ? "AI-Powered" : "Rule-Based Engine",
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId: resumeData.id }),
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
        <div className="bg-white border rounded-xl shadow-sm p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Resume Found</h2>
          <p className="text-gray-600 mb-8">Please upload a resume first to get an analysis.</p>
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Analysis</h1>
          <p className="text-gray-600">Get insights and improvements for your current resume.</p>
        </div>
        {!analysisResult && (
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium disabled:opacity-50 flex items-center gap-2 transition-colors"
          >
            {analyzing ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileText className="w-5 h-5" />}
            {analyzing ? "Analyzing..." : "Analyze Latest Resume"}
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {analyzing && (
        <div className="bg-white border rounded-xl shadow-sm p-12 text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-900">Analyzing your resume...</h3>
          <p className="text-gray-500 mt-2">Our AI is reviewing your format, skills, and experience.</p>
        </div>
      )}

      {analysisResult && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border rounded-xl shadow-sm p-8 text-center flex flex-col items-center justify-center">
              <h3 className="text-lg font-medium text-gray-700 mb-4">CareerPilot Score</h3>
              <div className="relative w-40 h-40 flex items-center justify-center rounded-full border-8 border-green-500 mb-4">
                <span className="text-5xl font-bold text-gray-900">{analysisResult.score}</span>
              </div>
              <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase">
                {analysisResult.type}
              </span>
            </div>
            
            <div className="md:col-span-2 bg-white border rounded-xl shadow-sm p-6 space-y-5">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">Score Breakdown</h3>
              {Object.entries(analysisResult.breakdown).map(([key, value]: [string, any]) => (
                <div key={key}>
                  <div className="flex justify-between text-sm font-medium mb-1 capitalize">
                    <span className="text-gray-700">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    <span className="text-gray-900">{value}/100</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-yellow-400' : 'bg-red-500'}`}
                      style={{ width: `${value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" /> Detected Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {analysisResult.detectedSkills.map((skill: string) => (
                  <span key={skill} className="bg-blue-50 border border-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-white border rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" /> Missing Sections
              </h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                {analysisResult.missingSections.map((section: string) => (
                  <li key={section}>{section}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-white border rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Actionable Suggestions</h3>
            <ul className="space-y-3">
              {analysisResult.suggestions.map((sug: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-gray-700">
                  <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm flex-shrink-0 mt-0.5">{i + 1}</span>
                  {sug}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600">
              Disclaimer: This is a CareerPilot internal analysis score intended to provide general guidance and suggestions. It is not an official ATS (Applicant Tracking System) score and does not guarantee job search outcomes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

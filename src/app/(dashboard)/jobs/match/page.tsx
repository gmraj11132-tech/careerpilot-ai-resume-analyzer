"use client";

import React, { useState } from "react";
import { Search, AlertCircle, Loader2, Target, Briefcase, ChevronRight, Info } from "lucide-react";

export default function JobMatchPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: "",
    company: "",
    description: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description) {
      setError("Job title and description are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/jobs/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: formData.title,
          companyName: formData.company,
          jobDescription: formData.description,
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
    <div className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-5 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Match</h1>
          <p className="text-gray-600">See how well your resume matches a specific job description.</p>
        </div>

        <form onSubmit={handleMatch} className="bg-white border rounded-xl shadow-sm p-6 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Senior Frontend Engineer"
              className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name (Optional)</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              placeholder="e.g. Acme Corp"
              className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Job Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Paste the full job description here..."
              rows={8}
              className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-blue-500 focus:border-blue-500 resize-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Target className="w-5 h-5" />}
            {loading ? "Analyzing Match..." : "Match Resume"}
          </button>
        </form>
      </div>

      <div className="lg:col-span-7">
        {!result && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-gray-50 border border-dashed border-gray-300 rounded-xl">
            <Briefcase className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Ready to match</h3>
            <p className="text-gray-500 max-w-md">Paste a job description on the left to see how well your resume matches and get tailored suggestions to improve your chances.</p>
          </div>
        )}

        {loading && (
          <div className="h-full flex flex-col items-center justify-center p-12 bg-gray-50 border rounded-xl">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Calculating match score...</h3>
          </div>
        )}

        {result && (
          <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
            <div className={`p-6 text-white ${result.matchPercentage >= 70 ? 'bg-green-600' : result.matchPercentage >= 40 ? 'bg-yellow-500' : 'bg-red-600'}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm opacity-90 uppercase tracking-wider font-semibold mb-1">Match Score</p>
                  <div className="flex items-end gap-2">
                    <span className="text-5xl font-bold">{result.matchPercentage}%</span>
                  </div>
                </div>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                  {result.analysisType}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Matching Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.matchingSkills.map((skill: string) => (
                      <span key={skill} className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-md text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Missing Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.missingSkills.map((skill: string) => (
                      <span key={skill} className="bg-orange-50 text-orange-700 border border-orange-200 px-3 py-1 rounded-md text-sm">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Important Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {result.keywords.map((kw: string) => (
                    <span key={kw} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-md text-sm">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Relevant Experience</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
                    {result.relevantExperience.map((exp: string, i: number) => <li key={i}>{exp}</li>)}
                  </ul>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Relevant Projects</h4>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-2">
                    {result.relevantProjects.map((proj: string, i: number) => <li key={i}>{proj}</li>)}
                  </ul>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Suggested Resume Tweaks</h4>
                <ul className="space-y-3">
                  {result.suggestedChanges.map((change: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <ChevronRight className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      {change}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-start gap-3 mt-4">
                <Info className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-600">
                  Disclaimer: Match results are for guidance only and do not guarantee employment outcomes. Adjust your resume responsibly.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

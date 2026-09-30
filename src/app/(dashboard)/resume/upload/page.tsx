"use client";

import React, { useState, useCallback } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader2,
  Clipboard,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function ResumeUploadPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"file" | "paste">("file");
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);

  const sampleResume = `Alex Demo
alex.demo@example.com
+91-9876543210

Professional Summary
Passionate Full-Stack Developer and B.Tech CSE student skilled in modern web development, React, Next.js, TypeScript, Python, and database systems. Experienced in building responsive SaaS web applications and REST APIs.

Education
B.Tech in Computer Science and Engineering
ABC University, 2021 - 2025
CGPA: 8.8 / 10

Technical Skills
Programming: Python, JavaScript, TypeScript, Java, C++, SQL
Web Development: React, Next.js, Node.js, Express.js, Tailwind CSS, HTML5, CSS3
Databases: PostgreSQL, MySQL, MongoDB, Prisma ORM
Tools & Cloud: Git, GitHub, Docker, Postman, Linux, Vercel

Projects
CareerPilot - AI Placement & Resume Analyzer
- Full-stack web application designed for engineering students during campus placements.
- Features multi-model AI resume analysis, ATS scoring heuristics, and job description matching.
- Technologies: Next.js 16, TypeScript, Tailwind CSS, Prisma, SQLite.

E-Commerce Storefront
- Built a scalable e-commerce application with product catalog, cart, and stripe payments.
- Technologies: React, Node.js, Express, MongoDB.

Work Experience
Full Stack Web Developer Intern
TechCorp Solutions
June 2024 - August 2024
- Developed responsive client components in React and optimized REST API endpoints with Express.
- Collaborated in an agile scrum team and enhanced test coverage.

Certifications
- AWS Certified Cloud Practitioner
- Meta Front-End Developer Certificate`;

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = (selectedFile: File) => {
    const ext = selectedFile.name.toLowerCase();
    const valid = ext.endsWith(".pdf") || ext.endsWith(".docx") || ext.endsWith(".txt");
    if (!valid) {
      setError("Supported file types are PDF (.pdf), Word (.docx), or Text (.txt).");
      return false;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be under 10MB.");
      return false;
    }
    return true;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setError("");
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && validateFile(droppedFile)) {
      setFile(droppedFile);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError("");
    const selectedFile = e.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile);
    }
  };

  const getAuthHeaders = (): Record<string, string> => {
    const token = typeof window !== "undefined" ? localStorage.getItem("careerpilot_token") : null;
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleUploadFile = async () => {
    if (!file) {
      setError("Please select a resume file first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("resume", file);

      const res = await fetch("/api/resume/upload", {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to upload and parse resume.");
      }

      setParsedData(data.resume?.parsed || data.parsedData);
    } catch (err: any) {
      setError(err.message || "An error occurred during resume upload.");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPasted = async () => {
    if (!pastedText.trim() || pastedText.trim().length < 30) {
      setError("Please paste your resume text (at least 30 characters).");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/resume/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          rawText: pastedText,
          fileName: "Pasted_Resume.txt",
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Failed to parse pasted resume text.");
      }

      setParsedData(data.resume?.parsed || data.parsedData);
    } catch (err: any) {
      setError(err.message || "An error occurred during parsing.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
          Upload or Paste Your Resume
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          CareerPilot extracts your skills, academic history, projects, and work experience to run ATS checks and job matches.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 p-4 rounded-xl border border-red-200 dark:border-red-800 flex items-start gap-3 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Upload Issue:</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {!parsedData ? (
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-xs overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b dark:border-gray-700">
            <button
              type="button"
              onClick={() => {
                setActiveTab("file");
                setError("");
              }}
              className={`flex-1 py-3.5 px-4 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeTab === "file"
                  ? "border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-950/20"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Document (PDF / DOCX / TXT)</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("paste");
                setError("");
              }}
              className={`flex-1 py-3.5 px-4 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-colors ${
                activeTab === "paste"
                  ? "border-blue-600 text-blue-600 bg-blue-50/50 dark:bg-blue-950/20"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400"
              }`}
            >
              <Clipboard className="w-4 h-4" />
              <span>Paste Resume Text (Direct)</span>
            </button>
          </div>

          <div className="p-8">
            {activeTab === "file" ? (
              <div className="space-y-6">
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-10 text-center transition-colors ${
                    isDragging
                      ? "border-blue-500 bg-blue-50/60 dark:bg-blue-950/20"
                      : "border-gray-300 dark:border-gray-600 hover:bg-gray-50/50 dark:hover:bg-gray-750"
                  }`}
                >
                  <UploadCloud className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                  <p className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">
                    Drag and drop your resume file here
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
                    Supports PDF (.pdf), Word (.docx), or Text (.txt) up to 10MB
                  </p>
                  <div>
                    <input
                      type="file"
                      id="resume-upload"
                      className="hidden"
                      accept=".pdf,.docx,.txt"
                      onChange={handleFileChange}
                    />
                    <label
                      htmlFor="resume-upload"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg cursor-pointer transition-colors inline-block text-sm shadow-xs"
                    >
                      Browse Files from Device
                    </label>
                  </div>
                </div>

                {file && (
                  <div className="flex items-center justify-between bg-blue-50/60 dark:bg-blue-950/30 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-3">
                      <FileText className="w-7 h-7 text-blue-600 flex-shrink-0" />
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">
                          {file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={handleUploadFile}
                      disabled={loading}
                      className="bg-gray-900 hover:bg-black dark:bg-blue-600 dark:hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50 flex items-center gap-2 transition-colors shadow-xs"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <UploadCloud className="w-4 h-4" />
                      )}
                      {loading ? "Extracting & Parsing..." : "Upload & Parse Resume"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Paste Resume Content (Plain Text):
                  </label>
                  <button
                    type="button"
                    onClick={() => setPastedText(sampleResume)}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Load Sample Resume
                  </button>
                </div>

                <textarea
                  rows={10}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste your education, skills, projects, and work experience text here..."
                  className="w-full border border-gray-300 dark:border-gray-600 rounded-xl p-3 bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-xs focus:ring-1 focus:ring-blue-500 resize-none leading-relaxed"
                />

                <button
                  onClick={handleUploadPasted}
                  disabled={loading || pastedText.trim().length < 20}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  {loading ? "Parsing Resume Sections..." : "Parse & Save Resume"}
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Parsed Resume Confirmation Card */
        <div className="bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b dark:border-gray-700 pb-4">
            <h2 className="text-lg font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-6 h-6" />
              Resume Parsed & Saved Successfully!
            </h2>
            <button
              onClick={() => router.push("/resume/analyze")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Go to AI Analysis</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Candidate Name
                </label>
                <div className="p-2.5 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-lg text-sm font-medium">
                  {parsedData.name || user?.name || "Candidate"}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Email
                </label>
                <div className="p-2.5 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-lg text-sm font-medium">
                  {parsedData.email || user?.email}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Phone
                </label>
                <div className="p-2.5 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-lg text-sm font-medium">
                  {parsedData.phone || "Not specified in resume"}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                  Extracted Skills ({parsedData.skills?.length || 0})
                </label>
                <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2.5 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-lg">
                  {parsedData.skills && parsedData.skills.length > 0 ? (
                    parsedData.skills.map((skill: string) => (
                      <span
                        key={skill}
                        className="bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 text-xs px-2.5 py-0.5 rounded-full font-medium"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">No skills parsed</span>
                  )}
                </div>
              </div>

              {parsedData.summary && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    Summary / Profile
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-300 p-2.5 bg-gray-50 dark:bg-gray-900 border dark:border-gray-700 rounded-lg max-h-24 overflow-y-auto">
                    {parsedData.summary}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

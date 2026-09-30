"use client";

import React, { useState, useCallback } from "react";
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

export default function ResumeUploadPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsedData, setParsedData] = useState<any>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const validateFile = (file: File) => {
    const validTypes = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    if (!validTypes.includes(file.type)) {
      setError("Only PDF and DOCX files are supported.");
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB.");
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

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("resume", file);
      
      const res = await fetch("/api/resume/upload", {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) throw new Error("Failed to upload resume.");
      
      const data = await res.json();
      // Simulate parsed data or use real response if available
      setParsedData(data.parsedData || {
        name: user?.name || "John Doe",
        email: user?.email || "john@example.com",
        phone: "+1 234 567 890",
        skills: ["JavaScript", "React", "Next.js"],
        summary: "Experienced software developer.",
        experience: [{ title: "Frontend Developer", company: "Tech Corp", years: "2020-2023" }],
        education: [{ degree: "BSc Computer Science", university: "State University", year: "2019" }]
      });
    } catch (err: any) {
      setError(err.message || "An error occurred during upload.");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = () => {
    router.push("/resume/analyze");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Upload</h1>
        <p className="text-gray-600">Upload your latest resume to start matching with jobs and getting insights.</p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded-md flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      {!parsedData ? (
        <div className="bg-white border rounded-xl shadow-sm p-8">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            <UploadCloud className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-700 mb-2">
              Drag and drop your resume here
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Supported formats: PDF, DOCX (Max 5MB)
            </p>
            <div>
              <input
                type="file"
                id="resume-upload"
                className="hidden"
                accept=".pdf,.docx"
                onChange={handleFileChange}
              />
              <label
                htmlFor="resume-upload"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg cursor-pointer transition-colors"
              >
                Browse Files
              </label>
            </div>
          </div>

          {file && (
            <div className="mt-6 flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
              <div className="flex items-center gap-3">
                <FileText className="w-6 h-6 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
              <button
                onClick={handleUpload}
                disabled={loading}
                className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-md font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                {loading ? "Uploading..." : "Upload"}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white border rounded-xl shadow-sm p-6 space-y-6">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-xl font-bold flex items-center gap-2 text-green-600">
              <CheckCircle className="w-6 h-6" />
              Resume Parsed Successfully
            </h2>
            <button
              onClick={handleAnalyze}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
            >
              Analyze Resume
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input type="text" defaultValue={parsedData.name} className="w-full border rounded-md p-2 bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" defaultValue={parsedData.email} className="w-full border rounded-md p-2 bg-gray-50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input type="text" defaultValue={parsedData.phone} className="w-full border rounded-md p-2 bg-gray-50" />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                <div className="flex flex-wrap gap-2">
                  {parsedData.skills.map((skill: string) => (
                    <span key={skill} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Summary</label>
                <textarea defaultValue={parsedData.summary} rows={4} className="w-full border rounded-md p-2 bg-gray-50" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

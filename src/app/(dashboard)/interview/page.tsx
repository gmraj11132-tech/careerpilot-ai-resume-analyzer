"use client";

import React, { useState } from "react";
import { Loader2, MessageSquare, AlertCircle, ChevronDown, ChevronUp, BrainCircuit } from "lucide-react";

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

  const [formData, setFormData] = useState({
    title: "",
    skills: "",
    difficulty: "MEDIUM"
  });

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
      // Simulate API
      setTimeout(() => {
        setQuestions([
          {
            id: "1",
            category: "Behavioral",
            difficulty: "MEDIUM",
            text: "Tell me about a time you had to work with a difficult team member. How did you handle it?",
            answer: "In a previous project, a team member consistently missed deadlines, affecting our sprint goals. I scheduled a private 1-on-1 to understand their situation instead of confronting them publicly. I discovered they were blocked on a specific technology we were using. I offered to pair program for an hour a day, and we adjusted their task load in the next sprint planning.",
            keyPoints: ["Empathy and active listening", "Private conflict resolution", "Actionable solutions (pair programming)", "Process improvement"]
          },
          {
            id: "2",
            category: "Technical",
            difficulty: "HARD",
            text: `How would you optimize a React application that is experiencing slow re-renders?`,
            answer: "First, I would use React Profiler to identify which components are re-rendering unnecessarily. Based on the findings, I'd implement several strategies: 1) Memoize expensive calculations with useMemo. 2) Wrap pure functional components in React.memo. 3) Use useCallback for passing function references down to child components. 4) Optimize context usage by splitting contexts or using selectors to prevent cascading renders.",
            keyPoints: ["Use React DevTools Profiler", "useMemo & useCallback", "React.memo", "Context optimization", "Component splitting"]
          }
        ]);
        setLoading(false);
      }, 2000);
    } catch (err) {
      setError("Failed to generate questions");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
      <div className="lg:col-span-4 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Prep</h1>
          <p className="text-gray-600">Generate AI mock questions tailored to your target role.</p>
        </div>

        <form onSubmit={handleGenerate} className="bg-white border rounded-xl shadow-sm p-6 space-y-5">
          {error && <div className="text-red-600 text-sm">{error}</div>}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Target Job Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Full Stack Developer"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full border rounded-md p-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Key Skills (comma separated)</label>
            <input
              type="text"
              placeholder="React, Node.js, System Design"
              value={formData.skills}
              onChange={e => setFormData({...formData, skills: e.target.value})}
              className="w-full border rounded-md p-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty</label>
            <div className="flex gap-4">
              {["EASY", "MEDIUM", "HARD"].map(level => (
                <label key={level} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="difficulty"
                    value={level}
                    checked={formData.difficulty === level}
                    onChange={e => setFormData({...formData, difficulty: e.target.value})}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 capitalize">{level.toLowerCase()}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <BrainCircuit className="w-5 h-5" />}
            Generate Questions
          </button>
        </form>
      </div>

      <div className="lg:col-span-8">
        {!loading && questions.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-gray-50 border border-dashed rounded-xl">
            <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Ready to practice</h3>
            <p className="text-gray-500 max-w-sm">Fill out the form to generate targeted interview questions with suggested answers.</p>
          </div>
        )}

        {loading && (
          <div className="h-full flex flex-col items-center justify-center p-12 bg-gray-50 border rounded-xl">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Generating customized questions...</h3>
          </div>
        )}

        {questions.length > 0 && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg flex items-start gap-3 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>AI-generated answers are suggestions. Verify accuracy before use and incorporate your own personal experiences.</p>
            </div>
            
            {questions.map(q => (
              <div key={q.id} className="bg-white border rounded-xl shadow-sm overflow-hidden">
                <div className="p-5 border-b">
                  <div className="flex gap-2 mb-3">
                    <span className="px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded">{q.category}</span>
                    <span className="px-2.5 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded">{q.difficulty}</span>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">{q.text}</h3>
                </div>
                
                <div>
                  <button
                    onClick={() => setExpandedId(expandedId === q.id ? null : q.id)}
                    className="w-full px-5 py-3 bg-gray-50 text-left flex justify-between items-center text-sm font-medium text-gray-700 hover:bg-gray-100"
                  >
                    View Suggested Answer
                    {expandedId === q.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                  
                  {expandedId === q.id && (
                    <div className="p-5 border-t space-y-4 bg-gray-50">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Example Answer:</h4>
                        <p className="text-gray-700 text-sm leading-relaxed">{q.answer}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Points to Cover:</h4>
                        <ul className="list-disc list-inside text-sm text-gray-700">
                          {q.keyPoints.map((kp, i) => <li key={i}>{kp}</li>)}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

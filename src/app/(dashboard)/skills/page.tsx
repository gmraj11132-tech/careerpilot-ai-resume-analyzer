"use client";

import React, { useState, useEffect } from "react";
import { Plus, Loader2, BookOpen, CheckCircle, Circle } from "lucide-react";

type SkillStatus = "Identified" | "Learning" | "Completed";

interface Skill {
  id: string;
  name: string;
  category: string;
  status: SkillStatus;
}

const CATEGORIES = ["Frontend", "Backend", "DevOps", "Soft Skills", "Tools"];

const RECOMMENDED = [
  { name: "GraphQL", category: "Backend" },
  { name: "Docker", category: "DevOps" },
  { name: "Figma", category: "Tools" }
];

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState(CATEGORIES[0]);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    // Simulate fetch
    setTimeout(() => {
      setSkills([
        { id: "1", name: "React", category: "Frontend", status: "Completed" },
        { id: "2", name: "TypeScript", category: "Frontend", status: "Completed" },
        { id: "3", name: "Node.js", category: "Backend", status: "Learning" },
        { id: "4", name: "AWS", category: "DevOps", status: "Identified" },
        { id: "5", name: "Communication", category: "Soft Skills", status: "Completed" },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName) return;
    setIsAdding(true);
    
    // Simulate API call
    setTimeout(() => {
      const newSkill: Skill = {
        id: Math.random().toString(),
        name: newSkillName,
        category: newSkillCategory,
        status: "Identified"
      };
      setSkills([...skills, newSkill]);
      setNewSkillName("");
      setIsAdding(false);
    }, 500);
  };

  const cycleStatus = (id: string) => {
    setSkills(skills.map(skill => {
      if (skill.id === id) {
        const nextStatus: Record<SkillStatus, SkillStatus> = {
          "Identified": "Learning",
          "Learning": "Completed",
          "Completed": "Identified"
        };
        return { ...skill, status: nextStatus[skill.status] };
      }
      return skill;
    }));
  };

  const getStatusColor = (status: SkillStatus) => {
    switch (status) {
      case "Identified": return "bg-gray-100 text-gray-700 border-gray-200";
      case "Learning": return "bg-blue-50 text-blue-700 border-blue-200";
      case "Completed": return "bg-green-50 text-green-700 border-green-200";
    }
  };

  const getStatusIcon = (status: SkillStatus) => {
    switch (status) {
      case "Identified": return <Circle className="w-4 h-4" />;
      case "Learning": return <BookOpen className="w-4 h-4" />;
      case "Completed": return <CheckCircle className="w-4 h-4" />;
    }
  };

  const filteredSkills = activeTab === "All" ? skills : skills.filter(s => s.category === activeTab);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Skills</h1>
        <p className="text-gray-600">Track your skill development and identify areas for growth.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border rounded-xl shadow-sm p-4">
            <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
              <button
                onClick={() => setActiveTab("All")}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeTab === "All" ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                All
              </button>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === cat ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Tracked Skills</h2>
            
            {filteredSkills.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No skills found in this category.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredSkills.map(skill => (
                  <div key={skill.id} className="border rounded-lg p-4 flex items-center justify-between hover:border-gray-300 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">{skill.name}</p>
                      <p className="text-xs text-gray-500">{skill.category}</p>
                    </div>
                    <button
                      onClick={() => cycleStatus(skill.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${getStatusColor(skill.status)}`}
                      title="Click to change status"
                    >
                      {getStatusIcon(skill.status)}
                      {skill.status}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <form onSubmit={handleAddSkill} className="bg-white border rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900">Add New Skill</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Skill Name</label>
              <input
                type="text"
                value={newSkillName}
                onChange={e => setNewSkillName(e.target.value)}
                placeholder="e.g. Python"
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={newSkillCategory}
                onChange={e => setNewSkillCategory(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
            <button
              type="submit"
              disabled={isAdding || !newSkillName}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
            >
              {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Add Skill
            </button>
          </form>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
            <h2 className="text-lg font-bold text-blue-900 mb-4">Recommended for You</h2>
            <div className="space-y-3">
              {RECOMMENDED.map((rec, i) => (
                <div key={i} className="flex items-center justify-between bg-white p-3 rounded-lg border border-blue-100">
                  <div>
                    <p className="font-medium text-sm text-gray-900">{rec.name}</p>
                    <p className="text-xs text-gray-500">{rec.category}</p>
                  </div>
                  <button
                    onClick={() => {
                      setNewSkillName(rec.name);
                      setNewSkillCategory(rec.category);
                    }}
                    className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

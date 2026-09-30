"use client";

import React, { useState, useEffect } from "react";
import { Plus, Search, Filter, MoreVertical, Loader2, Building, MapPin, Calendar, ExternalLink } from "lucide-react";

type AppStatus = "Saved" | "Applied" | "Assessment" | "Interview" | "Offer" | "Rejected";

interface Application {
  id: string;
  company: string;
  title: string;
  location: string;
  url: string;
  date: string;
  status: AppStatus;
}

const STATUS_COLORS: Record<AppStatus, string> = {
  Saved: "bg-gray-100 text-gray-700",
  Applied: "bg-blue-100 text-blue-700",
  Assessment: "bg-yellow-100 text-yellow-700",
  Interview: "bg-purple-100 text-purple-700",
  Offer: "bg-green-100 text-green-700",
  Rejected: "bg-red-100 text-red-700"
};

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<AppStatus | "All">("All");
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Application>>({ status: "Applied", date: new Date().toISOString().split('T')[0] });

  useEffect(() => {
    // Simulate fetch
    setTimeout(() => {
      setApplications([
        { id: "1", company: "Google", title: "Frontend Engineer", location: "Remote", url: "#", date: "2023-10-01", status: "Interview" },
        { id: "2", company: "Meta", title: "React Developer", location: "Menlo Park, CA", url: "#", date: "2023-10-05", status: "Applied" },
        { id: "3", company: "Stripe", title: "UI Engineer", location: "San Francisco, CA", url: "#", date: "2023-09-20", status: "Rejected" },
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSaveApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.company || !formData.title) return;
    
    const newApp = {
      id: Math.random().toString(),
      company: formData.company,
      title: formData.title,
      location: formData.location || "",
      url: formData.url || "",
      date: formData.date || new Date().toISOString().split('T')[0],
      status: (formData.status as AppStatus) || "Applied"
    };

    setApplications([newApp, ...applications]);
    setIsModalOpen(false);
    setFormData({ status: "Applied", date: new Date().toISOString().split('T')[0] });
  };

  const filteredApps = applications.filter(app => {
    const matchesSearch = app.company.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    acc.Total = (acc.Total || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Applications</h1>
          <p className="text-gray-600">Track and manage your job hunt.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Application
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <div className="bg-white border rounded-xl p-4 text-center">
          <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Total</p>
          <p className="text-2xl font-bold text-gray-900">{stats.Total || 0}</p>
        </div>
        {Object.keys(STATUS_COLORS).map(status => (
          <div key={status} className="bg-white border rounded-xl p-4 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">{status}</p>
            <p className="text-2xl font-bold text-gray-900">{stats[status] || 0}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b bg-gray-50 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search company or title..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-500" />
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as any)}
              className="border rounded-lg py-2 px-3 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="All">All Statuses</option>
              {Object.keys(STATUS_COLORS).map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        {filteredApps.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <p className="mb-2">No applications found.</p>
            {applications.length === 0 && <p>Start tracking your job applications.</p>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-white border-b">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Company & Title</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900 hidden md:table-cell">Location</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Date Applied</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-4 text-sm font-semibold text-gray-900 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredApps.map(app => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{app.company}</div>
                      <div className="text-sm text-gray-500">{app.title}</div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400" /> {app.location || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4 text-gray-400" /> {app.date}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[app.status]}`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-gray-400 hover:text-gray-700 p-1">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-lg font-bold text-gray-900">Add Application</h2>
            </div>
            <form onSubmit={handleSaveApp} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                <input required type="text" value={formData.company || ""} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full border rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                <input required type="text" value={formData.title || ""} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full border rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as AppStatus})} className="w-full border rounded-md p-2">
                  {Object.keys(STATUS_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

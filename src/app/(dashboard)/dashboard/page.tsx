"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { FileText, BookOpen, ClipboardList, MessageSquare, Upload, FileSearch, Briefcase, ChevronRight } from "lucide-react";
import Link from "next/link";

interface DashboardData {
  resumeScore: number | null;
  skillsDetected: number;
  applicationsCount: number;
  upcomingInterviews: number;
  recentActivity: string | null;
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Normally this would fetch from /api/dashboard
        const res = await fetch("/api/dashboard").catch(() => null);
        
        // Mock data fallback if API doesn't exist yet
        if (!res || !res.ok) {
          setTimeout(() => {
            setData({
              resumeScore: 85,
              skillsDetected: 12,
              applicationsCount: 3,
              upcomingInterviews: 1,
              recentActivity: "Your resume 'Software_Engineer_CV.pdf' scored 85%. Focus on adding more quantifiable achievements."
            });
            setLoading(false);
          }, 1000);
          return;
        }

        const json = await res.json();
        setData({
          resumeScore: json.latestAnalysis?.overallScore ?? null,
          skillsDetected: json.skillCount || 0,
          applicationsCount: json.applicationCount || 0,
          upcomingInterviews: json.upcomingInterviews || 0,
          recentActivity: json.latestAnalysis
            ? `Your resume '${json.latestAnalysis.resumeName || 'Resume'}' scored ${json.latestAnalysis.overallScore}/100.`
            : null,
        });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-secondary rounded w-1/4"></div>
        <div className="h-4 bg-secondary rounded w-1/3"></div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-secondary rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Resume Score",
      value: data?.resumeScore ? `${data.resumeScore}%` : "N/A",
      icon: FileText,
      description: "Latest analysis",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      title: "Skills Detected",
      value: data?.skillsDetected.toString() || "0",
      icon: BookOpen,
      description: "Across all documents",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    {
      title: "Applications",
      value: data?.applicationsCount.toString() || "0",
      icon: ClipboardList,
      description: "Active tracking",
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
    {
      title: "Interviews",
      value: data?.upcomingInterviews.toString() || "0",
      icon: MessageSquare,
      description: "Upcoming this week",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.name || "User"}! 👋</h1>
        <p className="text-muted-foreground mt-2">Here's what's happening with your job search today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <div key={i} className="rounded-xl border border-border bg-card text-card-foreground shadow-sm p-6">
            <div className="flex flex-row items-center justify-between pb-2">
              <h3 className="tracking-tight text-sm font-medium">{stat.title}</h3>
              <div className={`p-2 rounded-full ${stat.bg}`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {stat.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm flex flex-col">
          <div className="p-6 pb-4 border-b border-border">
            <h3 className="font-semibold leading-none tracking-tight">Quick Actions</h3>
          </div>
          <div className="p-6 grid gap-4">
            <Link href="/resume/upload" className="flex items-center p-3 rounded-lg border border-border hover:bg-secondary transition-colors group">
              <div className="p-2 bg-primary/10 rounded-md mr-4 group-hover:bg-primary/20 transition-colors">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">Upload Resume</h4>
                <p className="text-xs text-muted-foreground">Upload a new CV for analysis</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link href="/resume/analyze" className="flex items-center p-3 rounded-lg border border-border hover:bg-secondary transition-colors group">
              <div className="p-2 bg-primary/10 rounded-md mr-4 group-hover:bg-primary/20 transition-colors">
                <FileSearch className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">Analyze Resume</h4>
                <p className="text-xs text-muted-foreground">Get AI feedback on your profile</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
            <Link href="/jobs/match" className="flex items-center p-3 rounded-lg border border-border hover:bg-secondary transition-colors group">
              <div className="p-2 bg-primary/10 rounded-md mr-4 group-hover:bg-primary/20 transition-colors">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm">Match Jobs</h4>
                <p className="text-xs text-muted-foreground">Find roles fitting your skills</p>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm flex flex-col">
          <div className="p-6 pb-4 border-b border-border">
            <h3 className="font-semibold leading-none tracking-tight">Recent Activity</h3>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            {data?.recentActivity ? (
              <div className="relative border-l-2 border-primary/20 pl-4 ml-2 mt-2 space-y-6">
                <div className="relative">
                  <span className="absolute -left-[25px] flex h-3 w-3 rounded-full bg-primary ring-4 ring-background"></span>
                  <p className="text-sm text-foreground">
                    {data.recentActivity}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Today</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-center py-6">
                <div className="p-3 bg-secondary rounded-full mb-3">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <h4 className="text-sm font-medium">No recent activity</h4>
                <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                  Upload a resume or apply for a job to see your activity here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

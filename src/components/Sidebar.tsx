"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  Upload, 
  FileSearch, 
  Briefcase, 
  BookOpen, 
  ClipboardList, 
  MessageSquare, 
  LogOut, 
  Rocket, 
  Menu,
  X
} from "lucide-react";
import { useState, useEffect } from "react";

export function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on route change on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Upload Resume", href: "/resume/upload", icon: Upload },
    { name: "Resume Analysis", href: "/resume/analyze", icon: FileSearch },
    { name: "Job Matching", href: "/jobs/match", icon: Briefcase },
    { name: "Skills", href: "/skills", icon: BookOpen },
    { name: "Applications", href: "/applications", icon: ClipboardList },
    { name: "Interview Prep", href: "/interview", icon: MessageSquare },
  ];

  const handleLogout = async () => {
    await logout();
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-card border border-border rounded-md shadow-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:flex md:flex-col
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/dashboard" className="flex items-center space-x-2">
            <Rocket className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">CareerPilot</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors
                  ${isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }
                `}
              >
                <item.icon className={`mr-3 h-5 w-5 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex w-full items-center px-3 py-2.5 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
}

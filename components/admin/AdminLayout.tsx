"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopNavbar } from "./TopNavbar";

interface AdminLayoutProps {
  children: React.ReactNode;
  onSearch?: (query: string) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children, onSearch }) => {
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [deptName, setDeptName] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const isAdmin = sessionStorage.getItem("isAdmin");
    const adminDeptName = sessionStorage.getItem("adminDeptName") || "";

    if (!isAdmin) {
      router.push("/admin/login");
      return;
    }

    setDeptName(adminDeptName);
    setIsAuthorized(true);
  }, [router]);

  const handleSearch = (query: string) => {
    if (onSearch) {
      onSearch(query);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-secondary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
      
      <div
        className={`transition-all duration-300 ${
          isCollapsed ? "ml-16" : "ml-64"
        }`}
      >
        <TopNavbar deptName={deptName} onSearch={handleSearch} />
        
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

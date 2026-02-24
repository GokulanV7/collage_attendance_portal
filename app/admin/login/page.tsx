"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

export default function AdminLogin() {
  const router = useRouter();
  const [adminCode, setAdminCode] = useState("");
  const [error, setError] = useState("");

  const ADMIN_CODES: Record<string, { deptId: string; deptName: string }> = {
    CSEADMIN: { deptId: "CSE", deptName: "Computer Science Engineering" },
    ITADMIN: { deptId: "IT", deptName: "Information Technology" },
    ECEADMIN: { deptId: "ECE", deptName: "Electronics and Communication Engineering" },
    MEADMIN: { deptId: "ME", deptName: "Mechanical Engineering" },
    AIMLADMIN: { deptId: "AIML", deptName: "Artificial Intelligence & ML" },
  };

  const handleLogin = () => {
    if (!adminCode.trim()) {
      setError("Admin code is required");
      return;
    }

    const normalized = adminCode.trim().toUpperCase();
    const match = ADMIN_CODES[normalized];

    if (!match) {
      setError("Invalid admin code. Try CSEADMIN, ITADMIN, ECEADMIN, MEADMIN, AIMLADMIN.");
      return;
    }

    sessionStorage.setItem("isAdmin", "true");
    sessionStorage.setItem("adminDeptId", match.deptId);
    sessionStorage.setItem("adminDeptName", match.deptName);
    sessionStorage.setItem("adminCode", normalized);
    router.push("/admin/dashboard");
  };

  return (
    <main className="min-h-screen bg-brand-background flex flex-col items-center justify-center px-3 py-4 sm:px-8 sm:py-10">
      <div className="w-full max-w-md space-y-6">
        {/* College Logo & Name */}
        <div className="flex flex-col items-center text-center space-y-2">
          <Image
            src="/College%20Logo.png"
            width={80}
            height={80}
            alt="Sri Shakthi Institute logo"
            className="h-16 w-16 sm:h-20 sm:w-20 object-contain"
            priority
          />
          <div>
            <h1 className="text-sm sm:text-lg font-extrabold text-brand-primary uppercase tracking-wide leading-tight">
              Sri Shakthi Institute of Engineering and Technology
            </h1>
            <p className="text-[11px] sm:text-xs font-semibold text-neutral-secondary mt-0.5">
              Attendance Management System
            </p>
          </div>
        </div>

        <Card>
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-xl font-bold text-neutral-primary">
                Admin Authentication
              </h2>
              <p className="text-sm text-neutral-secondary mt-1">
                Secure access to attendance management system
              </p>
            </div>

            <Input
              label="Admin Code"
              value={adminCode}
              onChange={setAdminCode}
              placeholder="Enter admin code"
              required
              error={error}
              type="text"
            />

            <div className="bg-status-infoSoft border border-status-info p-3 rounded-2xl">
              <p className="text-sm text-status-infoStrong">
                <strong>Demo Codes:</strong> CSEADMIN, ITADMIN, ECEADMIN, MEADMIN, AIMLADMIN
              </p>
            </div>

            <Button onClick={handleLogin} fullWidth>
              Access Admin Panel
            </Button>
          </div>
        </Card>
      </div>
    </main>
  );
}

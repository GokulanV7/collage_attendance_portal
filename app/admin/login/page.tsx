"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { PageLayout } from "@/components/PageLayout";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

export default function AdminLogin() {
  const router = useRouter();
  const [adminCode, setAdminCode] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    if (!adminCode.trim()) {
      setError("Admin code is required");
      return;
    }

    // Simple mock validation
    if (adminCode.trim() === "ADMIN123" || adminCode.trim().toLowerCase() === "admin") {
      sessionStorage.setItem("isAdmin", "true");
      router.push("/admin/view");
    } else {
      setError("Invalid admin code");
    }
  };

  return (
    <PageLayout
      title="Admin Portal"
      subtitle="Enter admin code to access attendance records"
      showBackButton
      backHref="/"
    >
      <Card className="max-w-md mx-auto">
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-900">
              Admin Authentication
            </h2>
            <p className="text-sm text-gray-600 mt-1">
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

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <strong>Demo Code:</strong> ADMIN123 or admin
            </p>
          </div>

          <Button onClick={handleLogin} fullWidth>
            Access Admin Panel
          </Button>
        </div>
      </Card>
    </PageLayout>
  );
}

"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

export default function Home() {
  const formattedDate = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());

  return (
    <main className="min-h-screen bg-brand-background px-4 py-6 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="overflow-hidden rounded-[32px] border border-brand-secondary/30 bg-white shadow-[0_18px_35px_rgba(0,0,0,0.1)]">
          <div className="flex flex-col gap-4 bg-brand-primary px-5 py-4 sm:flex-row sm:items-center">
            <Image
              src="/main%20logo.png"
              width={80}
              height={80}
              alt="Sri Shakthi Institute logo"
              className="h-16 w-16 object-contain"
              priority
            />
            <div className="text-center sm:text-left">
              <p className="text-xl font-extrabold uppercase tracking-wide text-brand-secondary sm:text-2xl">
                Sri Shakthi Institute of Engineering and Technology
              </p>
              <p className="text-xs font-semibold text-brand-secondaryDark/80 sm:text-sm">
                Empowering the Youth • Empowering the Nation
              </p>
            </div>
          </div>
          <div className="bg-brand-secondary px-5 py-2 text-right text-sm font-semibold text-white">
            {formattedDate}
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <Card title="Staff Portal" className="h-full">
            <div className="space-y-3 text-sm text-neutral-secondary">
              <p>Validate your Staff ID, choose batch & department, then mark attendance with real-time summaries.</p>
              <p className="font-semibold text-brand-secondary">
                Steps: Validate → Batch → Department → Class & Period → Mark → Confirm
              </p>
            </div>
            <Link href="/staff/validate" className="mt-6 block">
              <Button variant="outline" fullWidth>
                Continue as Staff
              </Button>
            </Link>
          </Card>

          <Card title="Admin Portal" className="h-full">
            <div className="space-y-3 text-sm text-neutral-secondary">
              <p>Securely review submissions inside an Excel-style table with sticky headers, filters, and quick stats.</p>
              <p className="font-semibold text-brand-secondary">
                Required code: <span className="text-neutral-primary">ADMIN123</span> or <span className="text-neutral-primary">admin</span>
              </p>
            </div>
            <Link href="/admin/login" className="mt-6 block">
              <Button variant="outline" fullWidth>
                Continue as Admin
              </Button>
            </Link>
          </Card>
        </section>

        <Card title="How it works" className="bg-brand-primary-soft border-brand-secondary/20">
          <div className="grid gap-4 text-sm text-neutral-secondary md:grid-cols-2">
            <div>
              <h4 className="font-semibold text-brand-secondary mb-2">Staff Flow</h4>
              <ul className="space-y-1">
                <li>✔ Validate Staff ID with instant feedback</li>
                <li>✔ Auto-suggest batches, departments, and classes</li>
                <li>✔ Smart period detection and multi-period support</li>
                <li>✔ Absent/On-duty tracking with confirmation summary</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-brand-secondary mb-2">Admin View</h4>
              <ul className="space-y-1">
                <li>✔ Quick stats for submissions, attendance states</li>
                <li>✔ Filter by date, period, class, or staff ID</li>
                <li>✔ Sticky headers & horizontal scroll for mobile</li>
                <li>✔ Empty-state guidance when no records exist</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </main>
  );
}

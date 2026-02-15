"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

export default function Home() {
  return (
    <main className="min-h-screen bg-brand-background px-3 py-4 sm:px-8 sm:py-10">
      <div className="mx-auto max-w-5xl space-y-4 sm:space-y-6">
        <section className="overflow-hidden rounded-2xl sm:rounded-[32px] border border-brand-secondary/30 bg-white shadow-[0_18px_35px_rgba(0,0,0,0.1)]">
          <div className="flex flex-row items-center gap-2 sm:gap-4 bg-brand-primary px-3 sm:px-5 py-3 sm:py-4">
            <Image
              src="/College%20Logo.png"
              width={80}
              height={80}
              alt="Sri Shakthi Institute logo"
              className="h-10 w-10 sm:h-16 sm:w-16 object-contain flex-shrink-0"
              priority
            />
            <div className="text-left min-w-0">
              <p className="text-xs sm:text-xl md:text-2xl font-extrabold uppercase tracking-wide text-brand-secondary leading-tight">
                Sri Shakthi Institute of Engineering and Technology
              </p>
              <p className="text-[10px] sm:text-sm font-semibold text-brand-secondaryDark/80 mt-0.5 sm:mt-1">
                Empowering the Youth • Empowering the Nation
              </p>
            </div>
          </div>
        </section>

        {/* Staff Portal - Main Focus */}
        <section>
          <Card className="text-center py-6 sm:py-10">
            <div className="space-y-2 mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-primary">Attendance Portal</h2>
              <p className="text-sm text-neutral-secondary">
                Mark student attendance quickly and easily
              </p>
            </div>
            <Link href="/staff/validate" className="block max-w-md mx-auto">
              <Button fullWidth>
                Start Attendance
              </Button>
            </Link>
          </Card>
        </section>

        {/* Admin - Subtle icon in bottom-right corner */}
        <div className="fixed bottom-4 right-4 z-50">
          <Link
            href="/admin/login"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-neutral-primary/5 hover:bg-neutral-primary/10 border border-neutral-border/40 hover:border-neutral-border transition-all group"
            title="Admin"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-neutral-secondary/40 group-hover:text-neutral-secondary/70 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Link>
        </div>
      </div>
    </main>
  );
}

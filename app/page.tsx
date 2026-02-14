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

        <section className="grid gap-6 md:grid-cols-2">
          <Card title="Staff Portal" className="h-full">
            <div className="space-y-3 text-sm text-neutral-secondary">
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
      </div>
    </main>
  );
}

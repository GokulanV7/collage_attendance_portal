"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// This page is no longer a separate step - Batch & Department are combined in /staff/batch
export default function StaffDepartment() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/staff/batch");
  }, [router]);

  return null;
}

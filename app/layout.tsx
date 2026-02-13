import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AttendanceProvider } from "@/context/AttendanceContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Attendance Portal",
  description: "College Attendance Management System",
  icons: {
    icon: "/College Logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} bg-brand-primaryLight text-neutral-primary min-h-screen`}
      >
        <AttendanceProvider>{children}</AttendanceProvider>
      </body>
    </html>
  );
}

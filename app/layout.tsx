import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { AttendanceProvider } from "@/context/AttendanceContext";
import { StudentsProvider } from "@/context/StudentsContext";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

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
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${manrope.variable} ${spaceGrotesk.variable} min-h-screen bg-brand-background text-neutral-primary`}
        style={{ fontFamily: "var(--font-manrope), sans-serif" }}
      >
        <AttendanceProvider>
          <StudentsProvider>
            <div className="page-enter">{children}</div>
          </StudentsProvider>
        </AttendanceProvider>
      </body>
    </html>
  );
}

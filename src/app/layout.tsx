
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TalentOS — Candidate Pipeline",
  description: "B2B Recruitment SaaS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header }  from "@/components/layout/Header";
import { usePipelineStore } from "@/store/usePipelineStore";
import { CANDIDATES } from "@/lib/data";

export default function Home() {
  const [collapsed, setCollapsed] = useState(false);
  const { initCandidates, setLoading } = usePipelineStore();

  // Simulate loading + seed data
  useEffect(() => {
    const t = setTimeout(() => {
      initCandidates(CANDIDATES);
      setLoading(false);
    }, 1500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header onMobileMenu={() => {}} />

        {/* placeholder — replaced in CP-3 */}
        <main className="flex-1 flex items-center justify-center text-slate-500 text-sm font-mono">
          CP-2 ✓ — sidebar + header working
        </main>
      </div>
    </div>
  );
}
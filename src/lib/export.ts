import type { Candidate } from "@/types";
import { formatDate } from "@/lib/utils";

export function exportCandidatesCSV(
  candidates: Candidate[],
  filename = `talentflow-export-${new Date().toISOString().slice(0, 10)}.csv`,
) {
  const headers = ["Name", "Email", "Role", "Company", "Experience (yrs)", "Match Score", "Stage", "Status", "Tags", "Last Activity", "Skills"];
  const rows = candidates.map((candidate) => [
    candidate.name,
    candidate.email,
    candidate.currentRole,
    candidate.currentCompany,
    candidate.experience,
    candidate.matchScore,
    candidate.stage,
    candidate.status,
    candidate.tags.join("; "),
    formatDate(candidate.lastActivity),
    candidate.skills.map((skill) => skill.label).join("; "),
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, "\"\"")}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

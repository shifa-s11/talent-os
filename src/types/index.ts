

export type Stage =
  | "Applied"
  | "Shortlisted"
  | "Interview"
  | "Offered"
  | "Hired";

export type ExperienceBracket = "0-2" | "3-5" | "5-8" | "8+";

export interface Skill {
  label: string;
  color: string;
}

export interface TimelineEvent {
  id: string;
  stage: Stage;
  date: string;
  note?: string;
  actor: string;
}

export interface Note {
  id: string;
  author: string;
  authorInitials: string;
  content: string;
  createdAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  email: string;
  linkedIn?: string;
  currentRole: string;
  currentCompany: string;
  experience: number;
  experienceBracket: ExperienceBracket;
  matchScore: number;
  stage: Stage;
  status: "Active" | "On Hold" | "Rejected";
  lastActivity: string;
  skills: Skill[];
  education: string;
  location: string;
  summary: string;
  timeline: TimelineEvent[];
  notes: Note[];
}

export interface Job {
  title: string;
  department: string;
  location: string;
  openPositions: number;
  hiringManager: string;
  totalApplicants: number;
}

export interface FilterState {
  search: string;
  stages: Stage[];
  experienceBracket: ExperienceBracket | "Any";
  scoreRange: "Any" | "80-100" | "60-79" | "below-60";
}

export type ViewMode = "board" | "list";
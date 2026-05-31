export type IssueCategory = 'Garbage & Waste' | 'Water & Sanitation' | 'Women Safety & Lights' | 'Roads & Mobility' | 'Other';
export type IssueLevel = 'City' | 'State' | 'National';
export type IssueStatus = 'Pending' | 'Review' | 'Assigned' | 'Resolved';
export type IssuePriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface AIAnalysisResult {
  department: string;
  priorityScore: number; // 1-10
  priorityLevel: IssuePriority;
  resolvedChecklist: string[];
  officialLetterDraft: string;
  authorityContact: string;
  suggestedActionPlan: string;
}

export interface ReportedIssue {
  id: string;
  title: string;
  description: string;
  category: IssueCategory;
  location: string;
  level: IssueLevel;
  lat: number; // Relative map coordinates 0 to 100
  lng: number; // Relative map coordinates 0 to 100
  reporter: string;
  upvotes: number;
  status: IssueStatus;
  priority: IssuePriority;
  priorityScore: number;
  createdAt: string;
  image: string | null;
  aiResponse?: AIAnalysisResult | null;
  hasUpvoted?: boolean;
}

export interface CivicPoll {
  id: string;
  question: string;
  options: {
    id: string;
    text: string;
    votes: number;
  }[];
  totalVotes: number;
  votedOptionId?: string; // Track which option user selected
  level: IssueLevel;
}

export interface LiveAlert {
  id: string;
  message: string;
  timestamp: string;
  type: 'report' | 'resolve' | 'poll' | 'system';
  locationName: string;
  entityId?: string;
}

export interface LocationMarker {
  name: string;
  lat: number; // Relative position %
  lng: number; // Relative position %
  district?: string;
  state?: string;
  description?: string;
}

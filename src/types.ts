export type IssueLevel = 'City' | 'State' | 'National';

// Expand categories to include public utility tracking types
export type IssueCategory = 
  | 'Garbage & Waste' 
  | 'Water & Sanitation' 
  | 'Women Safety & Lights' 
  | 'Roads & Mobility' 
  | 'Public Toilet' 
  | 'Water Point' 
  | 'Commercial Hygiene'
  | 'Other';

export type IssuePriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface AIAnalysisResult {
  department: string;
  priorityScore: number;
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
  lat: number;
  lng: number;
  reporter: string;
  upvotes: number;
  status: 'Pending' | 'Review' | 'Assigned' | 'Resolved';
  priority: IssuePriority;
  priorityScore: number;
  createdAt: string;
  image: string | null;
  aiResponse: AIAnalysisResult | null;
  hasUpvoted?: boolean;
  
  // NEW CROWDSOURCED SAFETY & RATING METRICS
  hygieneRating?: number;     // 1 to 5 stars
  safetyRating?: number;      // 1 to 5 stars
  citizenReviewsCount?: number;
}

export interface LiveAlert {
  id: string;
  message: string;
  timestamp: string;
  type: 'report' | 'resolve' | 'hazard';
  locationName: string;
}

export interface CivicPollOption {
  id: string;
  text: string;
  votes: number;
}

export interface CivicPoll {
  id: string;
  level: IssueLevel;
  question: string;
  options: CivicPollOption[];
  totalVotes: number;
  votedOptionId?: string;
}

export interface LocationMarker {
  name: string;
  description: string;
  lat: number;
  lng: number;
}

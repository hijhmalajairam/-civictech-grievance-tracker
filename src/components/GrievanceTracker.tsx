import React, { useState, useRef } from 'react';
import { ReportedIssue, IssueLevel, IssueCategory, AIAnalysisResult } from '../types';
import { 
  PlusCircle, MapPin, Tag, Flag, AlertTriangle, Sparkles, Upload, 
  Send, ListTodo, Copy, CheckCircle, Clock, Check, RefreshCw, FileText, Megaphone, ShieldCheck, Star, Shield
} from 'lucide-react';

interface GrievanceTrackerProps {
  level: IssueLevel;
  issues: ReportedIssue[];
  onAddIssue: (issue: ReportedIssue) => void;
  onSelectIssue: (id: string | null) => void;
  selectedIssueId: string | null;
  tempPin: { lat: number; lng: number; locationName: string } | null;
  onClearTempPin: () => void;
  onUpvoteIssue?: (issueId: string) => void;
}

const CIVIC_IMAGE_TEMPLATES = [
  { 
    name: 'Urgent Garbage Pile-up', 
    category: 'Garbage & Waste' as IssueCategory,
    url: 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?q=80&w=400&auto=format&fit=crop',
    description: 'Overfilled public bin with loose waste spreading.'
  },
  { 
    name: 'Sewer Drainage Burst', 
    category: 'Water & Sanitation' as IssueCategory,
    url: 'https://images.unsplash.com/photo-1542060748-10c28b629f6f?q=80&w=400&auto=format&fit=crop',
    description: 'Black liquid overflow from standard concrete manhole.'
  },
  { 
    name: 'Broken High Mast Lamp', 
    category: 'Women Safety & Lights' as IssueCategory,
    url: 'https://images.unsplash.com/photo-1509021436665-8f37df706533?q=80&w=400&auto=format&fit=crop',
    description: 'Dark unlit street lamp leaving transit hub in darkness.'
  }
];

export default function GrievanceTracker({
  level,
  issues,
  onAddIssue,
  onSelectIssue,
  selectedIssueId,
  tempPin,
  onClearTempPin,
  onUpvoteIssue
}: GrievanceTrackerProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory>('Garbage & Waste');
  const [locationName, setLocationName] = useState('');
  const [reporterName, setReporterName] = useState('');
  
  // NEW CIVIC TECH FEATURES: Safety and Hygiene stars
  const [hygieneRating, setHygieneRating] = useState<number>(5);
  const [safetyRating, setSafetyRating] = useState<number>(5);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [aiAnalysisResult, setAiAnalysisResult] = useState<AIAnalysisResult | null>(null);
  
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'letter' | 'checklist' | 'campaign'>('letter');
  const [escalatedId, setEscalatedId] = useState<string | null>(null);

  const filteredIssues = issues.filter(i => i.level === level);
  const selectedIssue = issues.find(i => i.id === selectedIssueId);

  const handleMapPinAdopt = () => {
    if (tempPin) {
      setLocationName(tempPin.locationName);
    }
  };

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files[0]);
    }
  };

  const handleCopy = (text: string, type: 'letter' | 'campaign') => {
    navigator.clipboard.writeText(text);
    setCopiedText(type);
    setTimeout(() => setCopiedText(null), 2500);
  };

  const runAiAnalysis = async (issueData: {
    title: string;
    description: string;
    category: IssueCategory;
    location: string;
    level: IssueLevel;
  }) => {
    setIsAnalyzing(true);
    setAiAnalysisResult(null);

    const steps = [
      'Locating geographic coordinates within district wards...',
      'Mapping historical resolution pipelines for category...',
      'Analyzing structural threat factors with Gemini 3.5...',
      'Formulating actionable municipal engineering checklists...',
      'Drafting official department letter correspondence...'
    ];

    let idx = 0;
    setLoadingStep(steps[0]);
    const interval = setInterval(() => {
      idx++;
      if (idx < steps.length) {
        setLoadingStep(steps[idx]);
      } else {
        clearInterval(interval);
      }
    }, 1200);

    try {
      const response = await fetch('/api/analyze-civic-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(issueData),
      });

      const bodyData = await response.json();
      clearInterval(interval);

      if (bodyData.error) {
        throw new Error(bodyData.error);
      }
      
      if (bodyData.result) {
        setAiAnalysisResult(bodyData.result);
      }
    } catch (error) {
      console.error('AI Processing error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !locationName.trim()) return;

    const baseLat = tempPin ? tempPin.lat : 17.34 + Math.random() * 0.18;
    const baseLng = tempPin ? tempPin.lng : 78.32 + Math.random() * 0.20;

    const preSubmitData = {
      title,
      description,
      category,
      location: locationName,
      level
    };

    setIsAnalyzing(true);
    const newIssue: ReportedIssue = {
      id: `issue-${Date.now()}`,
      title,
      description,
      category,
      location: locationName,
      level,
      lat: baseLat,
      lng: baseLng,
      reporter: reporterName.trim() || 'Citizen Volunteer',
      upvotes: 1,
      status: 'Pending',
      priority: 'Medium',
      priorityScore: 5,
      createdAt: new Date().toISOString(),
      image: selectedImage,
      aiResponse: null,
      hygieneRating,
      safetyRating
    };

    await runAiAnalysis(preSubmitData);

    const finalIssuesResult = aiAnalysisResult;
    if (finalIssuesResult) {
      newIssue.priority = finalIssuesResult.priorityLevel;
      newIssue.priorityScore = finalIssuesResult.priorityScore;
      newIssue.aiResponse = finalIssuesResult;
    }

    onAddIssue(newIssue);
    onClearTempPin();

    setTitle('');
    setDescription('');
    setLocationName('');
    setReporterName('');
    setSelectedImage(null);
    setHygieneRating(5);
    setSafetyRating(5);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start font-sans">
      <div id="report-incident-panel" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 text-slate-800">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5 font-sans tracking-tight">
              <PlusCircle className="w-5 h-5 text-blue-600" />
              Lodge New Entry / Log Utilities
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Submit location data, infrastructure categories, safety scores, and cleanliness ratings.
            </p>
          </div>

          {tempPin && (
            <button
              type="button"
              onClick={handleMapPinAdopt}
              className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg flex items-center gap-1 font-mono transition-colors font-bold"
            >
              <MapPin className="w-3.5 h-3.5 animate-bounce" />
              Use Map Pin Coordinates
            </button>
          )}
        </div>

        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-600 font-semibold">Incident/Utility Title</label>
              <input
                type="text"
                required
                placeholder="e.g., Clean Public Toilet Circle, Dry Pyaau Stand"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg p-2.5 text-slate-800 placeholder:text-slate-400 outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-600 font-semibold">Classification Type</label>
              <div className="relative">
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as IssueCategory)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg p-2.5 text-slate-800 focus:ring-0 outline-none appearance-none cursor-pointer transition-colors"
                >
                  <option value="Garbage & Waste">Garbage & Waste Management</option>
                  <option value="Water & Sanitation">Water & Sewerage Grid</option>
                  <option value="Women Safety & Lights">Women's Safety & Lights</option>
                  <option value="Roads & Mobility">Roads & Infrastructure Mobility</option>
                  <option value="Public Toilet">🚾 Public Sanitation Toilet</option>
                  <option value="Water Point">💧 Free Summer Water Point</option>
                  <option value="Commercial Hygiene">🏪 Restaurant/Commercial Hygiene</option>
                  <option value="Other">Other Miscellaneous</option>
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-slate-500 font-mono text-[9px]">▼</div>
              </div>
            </div>
          </div>

          {/* CROWDSOURCING CRITERIA: Hygiene and Safety sliders/stars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 border border-slate-200 rounded-xl">
            <div className="space-y-1.5">
              <label className="text-slate-600 font-semibold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Cleanliness Rating ({hygieneRating}/5)
              </label>
              <div className="flex gap-1.5 items-center pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={`hyg-${star}`}
                    className={`w-5 h-5 cursor-pointer transition-colors ${star <= hygieneRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                    onClick={() => setHygieneRating(star)}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-600 font-semibold flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-blue-600" /> Area Safety Assessment ({safetyRating}/5)
              </label>
              <div className="flex gap-1.5 items-center pt-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star 
                    key={`saf-${star}`}
                    className={`w-5 h-5 cursor-pointer transition-colors ${star <= safetyRating ? 'fill-blue-400 text-blue-400' : 'text-slate-300'}`}
                    onClick={() => setSafetyRating(star)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-600 font-semibold">Specific Location Landmark</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g., Near Cyber Towers, Ward 15"
                  value={locationName}
                  onChange={e => setLocationName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg pl-8 pr-2.5 py-2.5 text-slate-800 placeholder:text-slate-400 outline-none transition-colors"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-600 font-semibold">Volunteer Name (Optional)</label>
              <input
                type="text"
                placeholder="Remains anonymous if left blank"
                value={reporterName}
                onChange={e => setReporterName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg p-2.5 text-slate-800 placeholder:text-slate-400 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-600 font-semibold">Detailed Observations & Public Review Context</label>
            <textarea
              required
              rows={3}
              placeholder="State cleanliness details, plumbing/lighting states, or visibility risks to calibrate calculations."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg p-3 text-slate-800 placeholder:text-slate-400 outline-none resize-none leading-relaxed transition-colors"
            />
          </div>

          <div className="space-y-2">
            <label className="text-slate-600 font-semibold">Evidence Snap (Optional)</label>
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-3 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                isDragOver ? 'border-blue-500 bg-blue-50/50' : 'border-slate-200 hover:border-slate-350 bg-slate-50 hover:bg-slate-100/60'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={e => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                className="hidden" 
                accept="image/*"
              />

              {selectedImage ? (
                <div className="relative w-full max-h-32 flex items-center justify-center overflow-hidden rounded-lg">
                  <img src={selectedImage} alt="Attachment Evidence" className="max-h-24 object-contain rounded" />
                  <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                    className="absolute top-1 right-1 bg-rose-600 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold text-[9px]"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-slate-400" />
                  <span className="text-[10px] font-semibold text-slate-600">Drop verification image here</span>
                </>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={isAnalyzing}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer text-xs"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>AI assessing logs...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Submit Entry to Ward Logs</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* SECTION 2: TRACK LOG LIST */}
      <div id="grievances-feed-panel" className="space-y-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 font-sans tracking-tight mb-4 flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-blue-600" />
            Active Utility & Grievance Logs ({filteredIssues.length})
          </h3>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-2 scrollbar-thin">
            {filteredIssues.map((issue) => {
              const isSelected = selectedIssueId === issue.id;
              return (
                <div 
                  key={issue.id}
                  onClick={() => onSelectIssue(isSelected ? null : issue.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all duration-300 ${
                    isSelected ? 'bg-blue-50/50 border-blue-300 shadow-xs' : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-[9px] text-slate-400 font-bold">
                      {issue.category} • by {issue.reporter}
                    </span>
                    <div className="flex gap-2 text-[10px] font-mono font-bold text-slate-500">
                      <span>⭐ Clean: {issue.hygieneRating || 5}/5</span>
                      <span>🛡️ Safe: {issue.safetyRating || 5}/5</span>
                    </div>
                  </div>

                  <h4 className="text-xs font-semibold text-slate-800 font-sans mt-1">
                    {issue.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{issue.location}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* SELECTED ITEM VIEW DETAILS PANEL */}
        {selectedIssue && (
          <div id="ai-diagnostics-panel" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4 text-slate-800">
            <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
              <div className="flex items-center gap-1.5 font-bold text-xs text-slate-900">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Community Metrics Summary
              </div>
              <button onClick={() => onSelectIssue(null)} className="text-slate-400 hover:text-slate-700 text-xs">✕ Close</button>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs space-y-2.5">
              <p className="font-semibold text-slate-700 leading-relaxed">"{selectedIssue.description}"</p>
              <div className="grid grid-cols-2 gap-3 text-center font-mono pt-1">
                <div className="bg-white p-2 border border-slate-200 rounded-lg">
                  <div className="text-[10px] text-slate-400 font-sans font-bold">CLEANLINESS</div>
                  <div className="text-sm font-extrabold text-amber-500">{selectedIssue.hygieneRating || 5} / 5</div>
                </div>
                <div className="bg-white p-2 border border-slate-200 rounded-lg">
                  <div className="text-[10px] text-slate-400 font-sans font-bold">SAFETY INDEX</div>
                  <div className="text-sm font-extrabold text-blue-600">{selectedIssue.safetyRating || 5} / 5</div>
                </div>
              </div>
            </div>

            {selectedIssue.aiResponse && (
              <div className="space-y-2 text-xs">
                <div className="bg-blue-50/50 border border-blue-200 text-blue-900 rounded-xl p-3">
                  <span className="font-mono text-[9px] block font-bold text-blue-600">AI DELEGATED AGENCY ROUTE</span>
                  <span className="font-bold text-xs">{selectedIssue.aiResponse.department}</span>
                </div>
                <textarea
                  readOnly
                  rows={4}
                  value={selectedIssue.aiResponse.officialLetterDraft}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono text-[10px] leading-relaxed resize-none outline-none"
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

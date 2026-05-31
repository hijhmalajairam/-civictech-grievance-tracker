import React, { useState, useRef } from 'react';
import { ReportedIssue, IssueLevel, IssueCategory, AIAnalysisResult } from '../types';
import { 
  PlusCircle, MapPin, Tag, Flag, AlertTriangle, Sparkles, Upload, 
  Send, ListTodo, Copy, CheckCircle, Clock, Check, RefreshCw, FileText, Megaphone, ShieldCheck
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

// Predefined thumbnail mocks representing civic incidents
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
  // Input form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IssueCategory>('Garbage & Waste');
  const [locationName, setLocationName] = useState('');
  const [reporterName, setReporterName] = useState('');
  
  // Custom file upload states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // AI loading and output states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [aiAnalysisResult, setAiAnalysisResult] = useState<AIAnalysisResult | null>(null);
  
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'letter' | 'checklist' | 'campaign'>('letter');
  const [escalatedId, setEscalatedId] = useState<string | null>(null);

  const filteredIssues = issues.filter(i => i.level === level);
  const selectedIssue = issues.find(i => i.id === selectedIssueId);

  // Handle auto-populating from interactive map tap
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

  // Perform AI analysis
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

    // Cycle through visual step load texts for top-tier visual flow
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
      // Fail safely to standard placeholder client calculations
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Submit complete incident record
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !locationName.trim()) return;

    const baseLat = tempPin ? tempPin.lat : 30 + Math.floor(Math.random() * 40);
    const baseLng = tempPin ? tempPin.lng : 30 + Math.floor(Math.random() * 45);

    const preSubmitData = {
      title,
      description,
      category,
      location: locationName,
      level
    };

    setIsAnalyzing(true);
    // Submit standard placeholder structure with pending state
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
      aiResponse: null
    };

    // Run active API analysis
    await runAiAnalysis(preSubmitData);

    // After analysis finishes or times out, bind result back
    const finalIssuesResult = aiAnalysisResult;
    if (finalIssuesResult) {
      newIssue.priority = finalIssuesResult.priorityLevel;
      newIssue.priorityScore = finalIssuesResult.priorityScore;
      newIssue.aiResponse = finalIssuesResult;
    }

    onAddIssue(newIssue);
    onClearTempPin();

    // Clear inputs
    setTitle('');
    setDescription('');
    setLocationName('');
    setReporterName('');
    setSelectedImage(null);
  };

  const handleIncidentUpvote = (issueId: string) => {
    // handled implicitly in standard state increments
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start font-sans">
      
      {/* SECTION 1: REPORT INCIDENT FORM */}
      <div id="report-incident-panel" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-5 text-slate-800">
        
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5 font-sans tracking-tight">
              <PlusCircle className="w-5 h-5 text-blue-600" />
              Lodge New Grievance
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Submit location, description, and configure AI administrative diagnostics.
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
          
          {/* Row 1: Title & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-600 font-semibold">Incident Title (What is the issue?)</label>
              <input
                type="text"
                required
                placeholder="e.g., Blocked stormwater culvert, Hanging electric wires"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg p-2.5 text-slate-800 placeholder:text-slate-400 outline-none transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-600 font-semibold">Incident Category</label>
              <div className="relative">
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as IssueCategory)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg p-2.5 text-slate-800 focus:ring-0 outline-none appearance-none cursor-pointer transition-colors"
                >
                  <option value="Garbage & Waste">Garbage & Waste Management</option>
                  <option value="Water & Sanitation">Water & Sewerage grid</option>
                  <option value="Women Safety & Lights">Women's Safety & Lights</option>
                  <option value="Roads & Mobility">Roads & Infrastructure Mobility</option>
                  <option value="Other">Other Miscellaneous</option>
                </select>
                <div className="absolute right-3 top-3 pointer-events-none text-slate-500 font-mono text-[9px]">▼</div>
              </div>
            </div>
          </div>

          {/* Row 2: Location & Reporter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-slate-600 font-semibold">Specific Location Landmark</label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder="e.g., Near Cyber Towers / Gachibowli flyover"
                  value={locationName}
                  onChange={e => setLocationName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg pl-8 pr-2.5 py-2.5 text-slate-800 placeholder:text-slate-400 outline-none transition-colors"
                />
                <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-slate-600 font-semibold">Reporter Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g., Sai Kumar K. (Remains anonymous if empty)"
                value={reporterName}
                onChange={e => setReporterName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg p-2.5 text-slate-800 placeholder:text-slate-400 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Row 3: Description */}
          <div className="space-y-1.5">
            <label className="text-slate-600 font-semibold">Detailed Description & Safety Impact Warning</label>
            <textarea
              required
              rows={4}
              placeholder="Provide a detailed description. Mention if this is a high-risk scenario (e.g. risks accidents, children walking around, structural hazard) to help Civic AI score priority accurately."
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 rounded-lg p-3 text-slate-800 placeholder:text-slate-400 outline-none resize-none leading-relaxed transition-colors"
            />
          </div>

          {/* Row 4: Photo attachment (Drag and Drop / templates) */}
          <div className="space-y-2">
            <label className="text-slate-600 font-semibold">Attach Incident Evidence (Optional)</label>
            
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all ${
                isDragOver 
                  ? 'border-blue-500 bg-blue-50/50' 
                  : 'border-slate-200 hover:border-slate-350 bg-slate-50 hover:bg-slate-100/60'
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
                  <img src={selectedImage} alt="Attachment Evidence" className="max-h-28 object-contain rounded" />
                  <button 
                    type="button" 
                    onClick={(e) => { e.stopPropagation(); setSelectedImage(null); }}
                    className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-750 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold text-[10px]"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-slate-400 animate-pulse" />
                  <span className="text-[11px] font-semibold text-slate-600">Drag & Drop photo here, or browse files</span>
                  <span className="text-[10px] text-slate-400 font-mono">PNG, JPEGs accepted up to 8MB</span>
                </>
              )}
            </div>

            {/* Quick Presets Selectors */}
            {!selectedImage && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[10px] font-bold text-slate-500">Quick preset pictures for sandbox simulation:</span>
                <div className="grid grid-cols-3 gap-2">
                  {CIVIC_IMAGE_TEMPLATES.map((tpl, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setSelectedImage(tpl.url);
                        setCategory(tpl.category);
                      }}
                      className="p-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex flex-col items-center gap-1 hover:border-slate-350 group text-left transition-colors"
                    >
                      <img src={tpl.url} alt={tpl.name} className="w-full h-10 object-cover rounded opacity-85 group-hover:opacity-100 transition-opacity" />
                      <span className="text-[9px] text-slate-600 font-sans truncate w-full text-center font-semibold">{tpl.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Submit CTA button */}
          <button
            type="submit"
            disabled={isAnalyzing}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-xl transition-all duration-300 shadow-sm flex items-center justify-center gap-2 cursor-pointer text-xs"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                <span>AI processing core operating...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit Grievance to Public Census</span>
              </>
            )}
          </button>

        </form>

        {/* AI Processing Overlay Loader */}
        {isAnalyzing && (
          <div className="bg-white/95 border border-blue-100 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-center absolute inset-0 z-50 backdrop-blur-xs animate-fade-in">
            <div className="p-4 bg-blue-50 rounded-full text-blue-600 relative">
              <Sparkles className="w-10 h-10 animate-pulse" />
              <div className="absolute inset-0 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-slate-900 font-sans">Deploying Civic AI Redressal Engine</h4>
              <p className="text-xs text-blue-600 font-mono h-4 font-bold">{loadingStep}</p>
            </div>
            <p className="text-[10px] text-slate-500 max-w-[320px] leading-relaxed">
              Gemini is assessing incident risks, identifying responsible government subdivisions, checking checklists, and drafting corresponding formal legal paperwork.
            </p>
          </div>
        )}

      </div>

      {/* SECTION 2: TRACK SENT INCIDENTS FEED */}
      <div id="grievances-feed-panel" className="space-y-5">
        
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-slate-800">
          <h3 className="text-sm font-semibold text-slate-900 font-sans tracking-tight mb-4 flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-blue-600" />
            Active Grievance Log List ({filteredIssues.length})
          </h3>

          <div className="space-y-3 max-h-[460px] overflow-y-auto pr-2 scrollbar-thin">
            {filteredIssues.map((issue) => {
              const isSelected = selectedIssueId === issue.id;

              const statusColor = 
                issue.status === 'Resolved' 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-250' 
                  : issue.status === 'Assigned' 
                    ? 'bg-blue-50 text-blue-700 border-blue-250' 
                    : 'bg-amber-50 text-amber-700 border-amber-250';

              const priorityColor = 
                issue.priority === 'Critical' 
                  ? 'text-rose-600' 
                  : issue.priority === 'High' 
                    ? 'text-orange-600' 
                    : issue.priority === 'Medium' 
                      ? 'text-amber-600' 
                      : 'text-emerald-600';

              return (
                <div 
                  key={issue.id}
                  onClick={() => onSelectIssue(isSelected ? null : issue.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                    isSelected 
                      ? 'bg-blue-50/50 border-blue-300 shadow-xs' 
                      : 'bg-white hover:bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2.5">
                    <span className="font-mono text-[10px] text-slate-500 font-semibold">
                      {new Date(issue.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {issue.reporter}
                    </span>
                    <div className="flex gap-1.5 items-center">
                      <span className={`px-2 py-0.5 text-[9px] font-mono rounded font-bold border ${statusColor}`}>
                        {issue.status}
                      </span>
                      <span className={`text-[10px] font-mono font-bold ${priorityColor}`}>
                        • {issue.priority}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-xs font-semibold text-slate-800 font-sans tracking-tight mt-1.5 leading-relaxed">
                    {issue.title}
                  </h4>

                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                    {issue.description}
                  </p>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-between items-center text-[10px] font-mono text-slate-500">
                    <span className="flex items-center gap-1 truncate max-w-[150px] font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {issue.location}
                    </span>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpvoteIssue && onUpvoteIssue(issue.id);
                      }}
                      disabled={issue.hasUpvoted}
                      className={`flex items-center gap-1 font-bold px-2 py-0.5 rounded border transition-all text-[10px] ${
                        issue.hasUpvoted 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-250' 
                          : 'bg-blue-50 hover:bg-blue-105 text-blue-600 border-blue-150 cursor-pointer'
                      }`}
                    >
                      ▲ {issue.upvotes} {issue.hasUpvoted ? 'Upvoted' : 'Upvote'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ACTIVE DETAIL DISPLAY & ADVANCED AI ACTION DRAWER */}
        {selectedIssue && (
          <div id="ai-diagnostics-panel" className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm animate-fade-in space-y-4 text-slate-800">
            
            <div className="flex justify-between items-start pt-1 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-50 rounded text-blue-600">
                  <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 font-sans">Active AI Governance Diagnostics</h4>
                  <p className="text-[10px] text-slate-500">Department Escalation & Remediation plans</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400 font-bold">ID: #{selectedIssue.id.slice(-6)}</span>
            </div>

            {selectedIssue.aiResponse ? (
              <div className="space-y-4 text-xs">
                
                {/* Meta block department & contacts */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 border border-slate-200 rounded-xl relative overflow-hidden">
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-slate-500">DESIGNATED AGENCY</span>
                    <div className="font-bold text-slate-800">{selectedIssue.aiResponse.department}</div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-slate-500">OFFICIAL CONTACT ESCALATOR</span>
                    <div className="font-mono text-blue-600 select-all font-bold break-all leading-snug">
                      {selectedIssue.aiResponse.authorityContact}
                    </div>
                  </div>
                </div>

                {/* Priority Gauge metrics */}
                <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-slate-500">INCIDENT ACTION PRIORITY</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-mono font-bold text-rose-600">{selectedIssue.aiResponse.priorityScore} / 10</span>
                      <span className="text-slate-350">•</span>
                      <span className="text-slate-700 font-sans text-xs font-semibold">{selectedIssue.aiResponse.priorityLevel} Action Queue</span>
                    </div>
                  </div>
                  {/* Visual gauge circle */}
                  <div className="w-12 h-12 rounded-full border-4 border-slate-200 bg-white flex items-center justify-center font-mono font-bold text-slate-700 relative overflow-hidden">
                    <div 
                      className="absolute inset-0 bg-blue-500/10 animate-pulse" 
                      style={{ height: `${selectedIssue.aiResponse.priorityScore * 10}%`, bottom: 0, top: 'auto' }}
                    ></div>
                    <span className="z-10">{selectedIssue.aiResponse.priorityScore}</span>
                  </div>
                </div>

                {/* TABS SWITCH: Letter vs Checklist vs Campaign */}
                <div className="flex border-b border-slate-200">
                  <button
                    onClick={() => setActiveTab('letter')}
                    className={`flex-1 py-2 text-center border-b-2 font-mono text-[10px] font-bold transition-all ${
                      activeTab === 'letter' 
                        ? 'border-blue-600 text-blue-600 font-bold' 
                        : 'border-transparent text-slate-400 hover:text-slate-650'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 inline mr-1" />
                    Official Letter Draft
                  </button>
                  <button
                    onClick={() => setActiveTab('checklist')}
                    className={`flex-1 py-2 text-center border-b-2 font-mono text-[10px] font-bold transition-all ${
                      activeTab === 'checklist' 
                        ? 'border-blue-600 text-blue-600 font-bold' 
                        : 'border-transparent text-slate-400 hover:text-slate-650'
                    }`}
                  >
                    <ListTodo className="w-3.5 h-3.5 inline mr-1" />
                    Remediation Checklist
                  </button>
                  <button
                    onClick={() => setActiveTab('campaign')}
                    className={`flex-1 py-2 text-center border-b-2 font-mono text-[10px] font-bold transition-all ${
                      activeTab === 'campaign' 
                        ? 'border-blue-600 text-blue-600 font-bold' 
                        : 'border-transparent text-slate-400 hover:text-slate-650'
                    }`}
                  >
                    <Megaphone className="w-3.5 h-3.5 inline mr-1" />
                    Resident Action Plan
                  </button>
                </div>

                {/* TAB 1: OFFICIAL REDRESSAL LETTER */}
                {activeTab === 'letter' && (
                  <div className="space-y-2 animate-fade-in">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-semibold text-slate-500">PRINTED FORM LETTER</span>
                      <button
                        onClick={() => handleCopy(selectedIssue.aiResponse?.officialLetterDraft || '', 'letter')}
                        className="text-[10px] bg-slate-50 p-1.5 rounded text-blue-600 border border-slate-200 hover:bg-slate-100 font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        {copiedText === 'letter' ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            Copy Complaint Text
                          </>
                        )}
                      </button>
                    </div>
                    <textarea
                      readOnly
                      rows={8}
                      value={selectedIssue.aiResponse.officialLetterDraft}
                      className="w-full bg-slate-50 border border-slate-200 p-4 rounded-xl font-mono text-[11px] text-slate-700 leading-relaxed outline-none resize-none select-all focus:border-blue-300"
                    />
                  </div>
                )}

                {/* TAB 2: REMEDIATION CHECKLIST */}
                {activeTab === 'checklist' && (
                  <div className="space-y-2.5 animate-fade-in">
                    <span className="text-[10px] font-semibold text-slate-500">MUNICIPAL ENGINEERING TO-DO TASKS</span>
                    <div className="space-y-2">
                       {selectedIssue.aiResponse.resolvedChecklist.map((task, i) => (
                        <div key={i} className="flex items-center gap-3 bg-slate-50 p-2.5 border border-slate-200 rounded-lg">
                          <div className="w-5 h-5 rounded bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 font-mono font-bold text-[10px]">
                            {i + 1}
                          </div>
                          <span className="text-xs text-slate-700 font-semibold">{task}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 3: RESIDENT MOBILIZATION CAMPAIGN */}
                {activeTab === 'campaign' && (
                  <div className="space-y-3.5 animate-fade-in">
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold text-slate-500 block">LOCAL COALITON GUIDE</span>
                      <p className="text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-200 leading-relaxed">
                        {selectedIssue.aiResponse.suggestedActionPlan}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-semibold text-slate-500 font-mono">WHATSAPP / TWITTER CAMPAIGN SNIPPET</span>
                        <button
                          onClick={() => handleCopy(`⚠️ CITIZEN ALERT: Reported high-priority ${selectedIssue.category} issue "${selectedIssue.title}" at ${selectedIssue.location} on CivicTech portal. Urgent help needed from department! #CivicTrack`, 'campaign')}
                          className="text-[10px] bg-slate-50 p-1.5 rounded text-blue-600 border border-slate-200 hover:bg-slate-100 font-mono font-bold flex items-center gap-1.5 cursor-pointer"
                        >
                          {copiedText === 'campaign' ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              Copied Snippet
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Copy Social Text
                            </>
                          )}
                        </button>
                      </div>
                      <div className="font-mono text-[10px] bg-slate-50 p-3 rounded-lg text-slate-600 border border-slate-200 border-l-4 border-l-blue-500 italic">
                        "⚠️ CITIZEN ALERT: Reported high-priority {selectedIssue.category} issue "{selectedIssue.title}" at {selectedIssue.location} on CivicTech portal. Urgent help needed from department! #CivicTrack"
                      </div>
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-slate-50 p-5 border border-slate-200 rounded-xl text-center space-y-3 text-xs leading-relaxed">
                <Clock className="w-7 h-7 text-amber-500 mx-auto animate-pulse" />
                <p className="text-slate-600 max-w-[340px] mx-auto font-medium">
                  This issue was submitted without complete AI diagnostics. Run diagnostic evaluation now to draft let-files.
                </p>
                <button
                  type="button"
                  onClick={() => runAiAnalysis({
                    title: selectedIssue.title,
                    description: selectedIssue.description,
                    category: selectedIssue.category,
                    location: selectedIssue.location,
                    level: selectedIssue.level
                  }).then(res => {
                    if (aiAnalysisResult) {
                      selectedIssue.aiResponse = aiAnalysisResult;
                    }
                  })}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:opacity-90 font-bold rounded-lg border border-blue-400 font-mono tracking-tight shadow-md flex items-center gap-1.5 mx-auto transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 animate-bounce" />
                  Trigger Gemini 3.5 AI Redressal Plan
                </button>
              </div>
            )}

            {/* Escalate success banner instead of standard window.alert dialog */}
            {escalatedId === selectedIssue.id && (
              <div className="bg-emerald-50 border border-emerald-250 p-3 rounded-xl flex items-start gap-2 text-emerald-800 text-xs animate-fade-in font-medium">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Complaint Escalated Successfully!</p>
                  <p className="text-[11px] text-emerald-600">Official dispatch completed. Record sent to Department Wards under Ticket ID #{selectedIssue.id.slice(-6)}.</p>
                </div>
              </div>
            )}

            {/* Escalate to department button */}
            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => {
                  selectedIssue.status = 'Assigned';
                  setEscalatedId(selectedIssue.id);
                  // Auto-timeout banner if appropriate
                  setTimeout(() => setEscalatedId(null), 5000);
                }}
                className="px-4 py-2 bg-blue-650 hover:bg-blue-700 font-mono tracking-tight font-bold text-white text-[11px] rounded-lg shadow-sm flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                Escalate Complaint Now
              </button>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}

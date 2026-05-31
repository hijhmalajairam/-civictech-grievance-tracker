import React, { useState, useEffect } from 'react';
import { ReportedIssue, LocationMarker, IssueLevel } from '../types';
import { MapPin, Compass, ShieldAlert, Sparkles, ToggleLeft, ToggleRight, Droplet, Store } from 'lucide-react';
import { HYDERABAD_ZONES, TELANGANA_DISTRICTS, INDIA_REGIONS } from '../data/mockData';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';

// (Keeping your exact same convertToRealLatLng logic and styles)
const CYBER_STYLE = [
  { "elementType": "geometry", "stylers": [{ "color": "#0f172a" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#94a3b8" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#0f172a" }] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#1e293b" }] },
  { "featureType": "landscape", "stylers": [{ "color": "#080b11" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#1e293b" }] },
  { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#334155" }] },
  { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#0f172a" }] },
  { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#22d3ee" }] },
  { "featureType": "water", "stylers": [{ "color": "#1e1b4b" }] },
  { "featureType": "poi", "stylers": [{ "visibility": "off" }] }
];

const SLATE_STYLE = [
  { "elementType": "geometry", "stylers": [{ "color": "#f1f5f9" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#475569" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#ffffff" }] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#cbd5e1" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
  { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#e2e8f0" }] },
  { "featureType": "water", "stylers": [{ "color": "#bfdbfe" }] }
];

const FOREST_STYLE = [
  { "elementType": "geometry", "stylers": [{ "color": "#FAF9F5" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#064e3b" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#f5f5f4" }] },
  { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#e2e8f0" }] },
  { "featureType": "landscape", "stylers": [{ "color": "#ecfdf5" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#ffffff" }] },
  { "featureType": "road", "elementType": "geometry.stroke", "stylers": [{ "color": "#d1fae5" }] },
  { "featureType": "water", "stylers": [{ "color": "#a7f3d0" }] },
  { "featureType": "poi", "stylers": [{ "color": "#dcfce7" }] }
];

export const convertToRealLatLng = (lat: number, lng: number, level: IssueLevel, locationName?: string) => {
  if (lat > 8 && lat < 38 && lng > 68 && lng < 98) return { lat, lng };
  const nameLower = (locationName || '').toLowerCase();
  
  if (nameLower.includes('madhapur') || nameLower.includes('hitec')) return { lat: 17.4483, lng: 78.3741 };
  if (nameLower.includes('charminar') || nameLower.includes('old city')) return { lat: 17.3616, lng: 78.4747 };
  if (nameLower.includes('gachibowli')) return { lat: 17.4401, lng: 78.3489 };
  if (nameLower.includes('secunderabad')) return { lat: 17.4399, lng: 78.4983 };
  if (nameLower.includes('begumpet')) return { lat: 17.4447, lng: 78.4664 };
  if (nameLower.includes('kukatpally')) return { lat: 17.4855, lng: 78.4101 };
  if (nameLower.includes('banjara')) return { lat: 17.4156, lng: 78.4347 };

  if (level === 'City') {
    return { lat: 17.34 + (lat / 100) * (17.52 - 17.34), lng: 78.32 + (lng / 100) * (78.52 - 78.32) };
  } else if (level === 'State') {
    return { lat: 16.3 + (lat / 100) * (18.8 - 16.3), lng: 77.2 + (lng / 100) * (80.8 - 77.2) };
  } else {
    return { lat: 8.4 + (lat / 100) * (35.5 - 8.4), lng: 68.7 + (lng / 100) * (97.2 - 68.7) };
  }
};

function MapCenterController({ center, zoom }: { center: { lat: number; lng: number }; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (map) { map.setZoom(zoom); map.panTo(center); }
  }, [map, center, zoom]);
  return null;
}

export default function CivicMap({
  level, issues, selectedIssueId, onSelectIssue, onMapClick, tempPin, onUpvoteIssue, onResolveIssue, theme = 'slate'
}: any) {
  const [hoveredNode, setHoveredNode] = useState<LocationMarker | null>(null);
  const [useSimulationMode, setUseSimulationMode] = useState<boolean>(true);

  const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';
  const hasValidKey = Boolean(API_KEY) && API_KEY.length > 10;

  const markers: LocationMarker[] = level === 'City' ? HYDERABAD_ZONES : level === 'State' ? TELANGANA_DISTRICTS : INDIA_REGIONS;
  const levelIssues = issues.filter((issue: any) => issue.level === level);

  const getMapDefaults = () => {
    if (level === 'City') return { center: { lat: 17.4150, lng: 78.4300 }, zoom: 12 };
    if (level === 'State') return { center: { lat: 17.9000, lng: 79.1500 }, zoom: 7.8 };
    return { center: { lat: 21.0000, lng: 78.9600 }, zoom: 4.6 };
  };

  const { center: initialCenter, zoom: initialZoom } = getMapDefaults();

  const handleSvgCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onMapClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const lngCoord = Math.round((x / rect.width) * 100);
    const latCoord = Math.round((y / rect.height) * 100);

    let nearestMarker = markers[0];
    let minDistance = parseFloat('Infinity');
    markers.forEach(m => {
      const dist = Math.sqrt(Math.pow(m.lat - latCoord, 2) + Math.pow(m.lng - lngCoord, 2));
      if (dist < minDistance) { minDistance = dist; nearestMarker = m; }
    });

    onMapClick(latCoord, lngCoord, `${nearestMarker.name} (Near Pinpoint)`);
  };

  const currentSelectedIssue = levelIssues.find((i: any) => i.id === selectedIssueId);

  // DYNAMIC COLOR LOGIC FOR NEW FEATURES
  const getPinColor = (issue: any) => {
    if (issue.category === 'Water Point') return '#3b82f6'; // Blue
    if (issue.category === 'Public Toilet') return '#0ea5e9'; // Teal/Cyan
    if (issue.category === 'Commercial Hygiene') return '#a855f7'; // Purple
    if (issue.status === 'Resolved') return '#10b981'; // Green
    if (issue.priority === 'Critical') return '#f43f5e'; // Red
    if (issue.priority === 'High') return '#f97316'; // Orange
    return '#eab308'; // Yellow for Medium/Low
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col h-[520px]">
      
      <div className="flex justify-between items-center mb-4 z-10 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg text-blue-600 border border-blue-200/40">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 tracking-tight">Civic Coordinates Grid</h3>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Click the map surface to drop a grievance or utility pin
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 relative bg-slate-50 rounded-2xl overflow-hidden border border-slate-200/80 flex items-center justify-center">
          <>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />
            <svg 
              onClick={handleSvgCanvasClick}
              className="w-full h-full cursor-crosshair select-none relative z-10"
              viewBox="0 0 100 100" 
              preserveAspectRatio="none"
            >
              {markers.map((marker, index) => {
                const isHovered = hoveredNode?.name === marker.name;
                return (
                  <g key={`svg-marker-${index}`} onMouseEnter={() => setHoveredNode(marker)} onMouseLeave={() => setHoveredNode(null)}>
                    <circle cx={marker.lng} cy={marker.lat} r={isHovered ? 4.5 : 2.5} fill="rgba(37, 99, 235, 0.25)" className="transition-all duration-300" />
                    <circle cx={marker.lng} cy={marker.lat} r={1.2} fill="#2563eb" />
                  </g>
                );
              })}

              {levelIssues.map((issue: any) => {
                const isSelected = selectedIssueId === issue.id;
                const pinColor = getPinColor(issue);

                return (
                  <g key={`svg-issue-${issue.id}`} onClick={(e) => { e.stopPropagation(); onSelectIssue(isSelected ? null : issue.id); }} className="cursor-pointer group">
                    <circle cx={issue.lng} cy={issue.lat} r={isSelected ? 8 : 4.5} fill="none" stroke={pinColor} strokeWidth="0.7" className="animate-ping origin-center" />
                    <circle cx={issue.lng} cy={issue.lat} r={isSelected ? 3.5 : 2.2} fill={pinColor} className="transition-all duration-300" />
                    <circle cx={issue.lng} cy={issue.lat} r={0.8} fill="#ffffff" />
                  </g>
                );
              })}

              {tempPin && (
                <g className="animate-bounce">
                  <circle cx={tempPin.lng} cy={tempPin.lat} r={5.5} fill="none" stroke="#10b981" strokeWidth="0.7" />
                  <circle cx={tempPin.lng} cy={tempPin.lat} r={2.5} fill="#10b981" />
                </g>
              )}
            </svg>
          </>

        {selectedIssueId && currentSelectedIssue && (
          <div className="absolute top-4 right-4 md:w-80 bg-white/95 border border-slate-200 p-4 rounded-2xl shadow-xl z-20 backdrop-blur animate-fade-in text-slate-800 text-left">
            <div className="flex justify-between items-start gap-2">
              <span className="px-2.5 py-0.5 text-[9px] font-mono rounded-full font-bold uppercase bg-slate-100 text-slate-700 border border-slate-200">
                {currentSelectedIssue.category}
              </span>
              <button onClick={() => onSelectIssue(null)} className="text-slate-400 hover:text-slate-800 text-xs transition-colors cursor-pointer">✕ Close</button>
            </div>
            <h4 className="text-slate-900 font-extrabold text-sm mt-2">{currentSelectedIssue.title}</h4>
            <p className="text-slate-600 text-xs mt-1.5 line-clamp-3">{currentSelectedIssue.description}</p>
            
            <div className="mt-3 flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200/60">
                <div className="text-[10px] text-slate-400 font-bold font-mono">Clean: {currentSelectedIssue.hygieneRating || 5}/5</div>
                <div className="text-[10px] text-slate-400 font-bold font-mono">Safe: {currentSelectedIssue.safetyRating || 5}/5</div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 items-center text-[10px] font-mono text-slate-500 border-t border-slate-200 pt-3 z-10 font-bold uppercase tracking-wider">
        <span className="text-slate-400 font-extrabold">Legend:</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Water Point</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span> Public Toilet</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span> Hygiene Rating</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Hazard/Grievance</span>
      </div>
    </div>
  );
}

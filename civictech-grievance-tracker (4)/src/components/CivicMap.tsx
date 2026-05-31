import React, { useState, useEffect } from 'react';
import { ReportedIssue, LocationMarker, IssueLevel } from '../types';
import { MapPin, Compass, ShieldAlert, Sparkles, AlertTriangle, AlertCircle, Info, ToggleLeft, ToggleRight } from 'lucide-react';
import { HYDERABAD_ZONES, TELANGANA_DISTRICTS, INDIA_REGIONS } from '../data/mockData';
import { APIProvider, Map, AdvancedMarker, Pin, useMap } from '@vis.gl/react-google-maps';

interface CivicMapProps {
  level: IssueLevel;
  issues: ReportedIssue[];
  selectedIssueId: string | null;
  onSelectIssue: (id: string | null) => void;
  onMapClick?: (lat: number, lng: number, locationName: string) => void;
  tempPin: { lat: number; lng: number; locationName: string } | null;
  onUpvoteIssue?: (issueId: string) => void;
  onResolveIssue?: (issueId: string) => void;
  theme?: 'slate' | 'cyber' | 'forest';
}

// Map Styles for Custom Skins to match the chosen Applet themes
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

// Coordinate Mapper: Safely converts abstract SVG percentage (0-100) coordinates 
// used by predefined/system database fields to real-world GPS coordinates
export const convertToRealLatLng = (lat: number, lng: number, level: IssueLevel, locationName?: string) => {
  // If the coordinates are already real-world GPS (lat is near Hyderabad/India, e.g. between 8 and 38, lng between 68 and 98)
  if (lat > 8 && lat < 38 && lng > 68 && lng < 98) {
    return { lat, lng };
  }

  const nameLower = (locationName || '').toLowerCase();
  
  // High precision presets for our primary Hyderabad locations
  if (nameLower.includes('madhapur') || nameLower.includes('hitec city')) {
    return { lat: 17.4483, lng: 78.3741 };
  }
  if (nameLower.includes('charminar') || nameLower.includes('old city')) {
    return { lat: 17.3616, lng: 78.4747 };
  }
  if (nameLower.includes('gachibowli')) {
    return { lat: 17.4401, lng: 78.3489 };
  }
  if (nameLower.includes('secunderabad')) {
    return { lat: 17.4399, lng: 78.4983 };
  }
  if (nameLower.includes('begumpet')) {
    return { lat: 17.4447, lng: 78.4664 };
  }
  if (nameLower.includes('kukatpally')) {
    return { lat: 17.4855, lng: 78.4101 };
  }
  if (nameLower.includes('banjara hills') || nameLower.includes('banjara')) {
    return { lat: 17.4156, lng: 78.4347 };
  }
  if (nameLower.includes('warangal')) {
    return { lat: 17.9689, lng: 79.5941 };
  }
  if (nameLower.includes('karimnagar')) {
    return { lat: 18.4386, lng: 79.1288 };
  }
  if (nameLower.includes('nizamabad')) {
    return { lat: 18.6725, lng: 78.0941 };
  }
  if (nameLower.includes('khammam')) {
    return { lat: 17.2473, lng: 80.1514 };
  }
  if (nameLower.includes('mahabubnagar')) {
    return { lat: 16.7367, lng: 77.9889 };
  }
  if (nameLower.includes('medak')) {
    return { lat: 18.0380, lng: 78.2618 };
  }
  if (nameLower.includes('delhi') || nameLower.includes('national capital') || nameLower.includes('northern india')) {
    return { lat: 28.6139, lng: 77.2090 };
  }
  if (nameLower.includes('west bengal') || nameLower.includes('eastern india') || nameLower.includes('kolkata')) {
    return { lat: 22.5726, lng: 88.3639 };
  }
  if (nameLower.includes('maharashtra') || nameLower.includes('western india') || nameLower.includes('mumbai')) {
    return { lat: 19.0760, lng: 72.8777 };
  }
  if (nameLower.includes('assam') || nameLower.includes('northeastern')) {
    return { lat: 26.1158, lng: 91.7086 };
  }
  if (nameLower.includes('southern india') || nameLower.includes('tamil') || nameLower.includes('bengaluru')) {
    return { lat: 13.0827, lng: 80.2707 };
  }

  // Linear mathematical translation into the exact geographical bounds based on filter tier
  if (level === 'City') {
    // Greater Hyderabad bounds: Lat 17.34 - 17.52, Lng 78.32 - 78.52
    const mappedLat = 17.34 + (lat / 100) * (17.52 - 17.34);
    const mappedLng = 78.32 + (lng / 100) * (78.52 - 78.32);
    return { lat: mappedLat, lng: mappedLng };
  } else if (level === 'State') {
    // Telangana state bounds: Lat 16.30 - 18.80, Lng 77.20 - 80.80
    const mappedLat = 16.3 + (lat / 100) * (18.8 - 16.3);
    const mappedLng = 77.2 + (lng / 100) * (80.8 - 77.2);
    return { lat: mappedLat, lng: mappedLng };
  } else {
    // India national bounds: Lat 8.40 - 35.50, Lng 68.70 - 97.20
    const mappedLat = 8.4 + (lat / 100) * (35.5 - 8.4);
    const mappedLng = 68.7 + (lng / 100) * (97.2 - 68.7);
    return { lat: mappedLat, lng: mappedLng };
  }
};

// Side effect component designed to dynamically center the Google Map on focus/view switches
function MapCenterController({ center, zoom }: { center: { lat: number; lng: number }; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.setZoom(zoom);
      map.panTo(center);
    }
  }, [map, center, zoom]);
  return null;
}

export default function CivicMap({
  level,
  issues,
  selectedIssueId,
  onSelectIssue,
  onMapClick,
  tempPin,
  onUpvoteIssue,
  onResolveIssue,
  theme = 'slate'
}: CivicMapProps) {
  const [hoveredNode, setHoveredNode] = useState<LocationMarker | null>(null);
  
  // Keyless Fallback State: Permits manual testing on simulation canvas if key is missing 
  const [useSimulationMode, setUseSimulationMode] = useState<boolean>(false);

  // Expose key and check presence
  const API_KEY =
    process.env.GOOGLE_MAPS_PLATFORM_KEY ||
    (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
    (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
    '';
  const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY' && API_KEY.length > 10;

  // Static target landmarks depending on view tier (mapped to Hyderabad, Telangana, or India)
  const markers: LocationMarker[] = 
    level === 'City' 
      ? HYDERABAD_ZONES 
      : level === 'State' 
        ? TELANGANA_DISTRICTS 
        : INDIA_REGIONS;

  // Filter issues for current level
  const levelIssues = issues.filter(issue => issue.level === level);

  // Calculate dynamic default maps parameters based on chosen coverage
  const getMapDefaults = () => {
    if (level === 'City') {
      return { center: { lat: 17.4150, lng: 78.4300 }, zoom: 12 };
    } else if (level === 'State') {
      return { center: { lat: 17.9000, lng: 79.1500 }, zoom: 7.8 };
    } else {
      return { center: { lat: 21.0000, lng: 78.9600 }, zoom: 4.6 };
    }
  };

  const { center: initialCenter, zoom: initialZoom } = getMapDefaults();

  // Handle click on native Google Maps canvas
  const handleGoogleMapClick = (e: any) => {
    if (!onMapClick) return;
    
    let clickLat = 0;
    let clickLng = 0;
    
    if (e.detail?.latLng) {
      clickLat = e.detail.latLng.lat;
      clickLng = e.detail.latLng.lng;
    } else if (e.latLng?.lat) {
      clickLat = typeof e.latLng.lat === 'function' ? e.latLng.lat() : e.latLng.lat;
      clickLng = typeof e.latLng.lng === 'function' ? e.latLng.lng() : e.latLng.lng;
    } else {
      return;
    }

    // Find nearest preset district landmark name to guide high-fidelity description logging
    let nearestMarker = markers[0];
    let minDistance = Number.MAX_VALUE;
    
    markers.forEach(m => {
      const realM = convertToRealLatLng(m.lat, m.lng, level, m.name);
      const dist = Math.sqrt(Math.pow(realM.lat - clickLat, 2) + Math.pow(realM.lng - clickLng, 2));
      if (dist < minDistance) {
        minDistance = dist;
        nearestMarker = m;
      }
    });

    const locationName = `${nearestMarker.name} (Dropped Pin)`;
    onMapClick(clickLat, clickLng, locationName);
  };

  // Click handler fallback for simulated SVG vector grid
  const handleSvgCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!onMapClick) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Percentage coordinates (0-100)
    const lngCoord = Math.round((x / rect.width) * 100);
    const latCoord = Math.round((y / rect.height) * 100);

    let nearestMarker = markers[0];
    let minDistance = parseFloat('Infinity');
    
    markers.forEach(m => {
      const dist = Math.sqrt(Math.pow(m.lat - latCoord, 2) + Math.pow(m.lng - lngCoord, 2));
      if (dist < minDistance) {
        minDistance = dist;
        nearestMarker = m;
      }
    });

    const locationName = `${nearestMarker.name} (Near Pinpoint)`;
    onMapClick(latCoord, lngCoord, locationName);
  };

  // Fetch styled JSON elements corresponding to our selected color schemes
  const stylesForTheme = 
    theme === 'cyber' 
      ? CYBER_STYLE 
      : theme === 'forest' 
        ? FOREST_STYLE 
        : SLATE_STYLE;

  const currentSelectedIssue = levelIssues.find(i => i.id === selectedIssueId);

  // If specific issue is selected, center the map exactly on it
  const mapCenterOffset = currentSelectedIssue 
    ? convertToRealLatLng(currentSelectedIssue.lat, currentSelectedIssue.lng, level, currentSelectedIssue.location)
    : initialCenter;
  
  const mapZoomLevel = currentSelectedIssue ? 14 : initialZoom;

  return (
    <div id="civic-map-viewport" className="bg-white border border-slate-205 rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col h-[520px]">
      
      {/* Map Control Header with Real Google Maps indicator */}
      <div className="flex justify-between items-center mb-4 z-10 flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg text-blue-600 border border-blue-200/40">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-slate-800 font-sans tracking-tight flex items-center gap-2">
              <span>{hasValidKey && !useSimulationMode ? "Live Google Map View" : "Civic Coordinates Grid"}</span>
              <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${hasValidKey && !useSimulationMode ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                {hasValidKey && !useSimulationMode ? "Google Maps Platform Active" : "Fallback Simulation"}
              </span>
            </h3>
            <p className="text-xs text-slate-500 font-semibold leading-none mt-1">
              {onMapClick ? 'Click directly on the map surface to drop a grievance pin' : 'Select pins to view active reported records'}
            </p>
          </div>
        </div>

        {/* Dynamic Mode Switcher for ease of testing */}
        {hasValidKey && (
          <button 
            type="button"
            onClick={() => setUseSimulationMode(!useSimulationMode)}
            className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 transition-all cursor-pointer"
          >
            <span>Simulator Grid:</span>
            {useSimulationMode ? (
              <ToggleRight className="w-5 h-5 text-emerald-600" />
            ) : (
              <ToggleLeft className="w-5 h-5 text-slate-400" />
            )}
          </button>
        )}
      </div>

      {/* Main Map Viewer Compartment */}
      <div className="flex-1 relative bg-slate-50 rounded-2xl overflow-hidden border border-slate-200/80 flex items-center justify-center">
        
        {hasValidKey && !useSimulationMode ? (
          /* NATIVE LIVE GOOGLE MAPS PLATFORM MODE */
          <APIProvider apiKey={API_KEY} version="weekly">
            <Map
              defaultCenter={initialCenter}
              defaultZoom={initialZoom}
              styles={stylesForTheme}
              mapId="CIVIC_PULSE_MAP"
              internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
              style={{ width: '100%', height: '100%' }}
              onClick={handleGoogleMapClick}
              className="outline-none"
            >
              {/* Dynamic Center/Zoom controller */}
              <MapCenterController center={mapCenterOffset} zoom={mapZoomLevel} />

              {/* Landmark Reference Areas on Interactive Map */}
              {markers.map((marker, index) => {
                const realCoord = convertToRealLatLng(marker.lat, marker.lng, level, marker.name);
                return (
                  <AdvancedMarker 
                    key={`ref-${index}`}
                    position={realCoord}
                    onMouseEnter={() => setHoveredNode(marker)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    <div className="w-3.5 h-3.5 bg-blue-500/20 border-2 border-blue-500 rounded-full animate-pulse transition-all duration-300 hover:scale-125" />
                  </AdvancedMarker>
                );
              })}

              {/* Active Grievances / Issues on Map */}
              {levelIssues.map((issue) => {
                const isSelected = selectedIssueId === issue.id;
                const realCoord = convertToRealLatLng(issue.lat, issue.lng, level, issue.location);
                
                // Color mapping matching Legends
                const priorityPinColor = 
                  issue.priority === 'Critical' 
                    ? '#f43f5e' 
                    : issue.priority === 'High' 
                      ? '#f97316' 
                      : issue.priority === 'Medium' 
                        ? '#eab308' 
                        : '#10b981';

                return (
                  <AdvancedMarker
                    key={issue.id}
                    position={realCoord}
                    onClick={() => onSelectIssue(isSelected ? null : issue.id)}
                  >
                    <Pin 
                      background={priorityPinColor} 
                      borderColor="#ffffff" 
                      glyphColor="#ffffff" 
                      scale={isSelected ? 1.25 : 0.9}
                    />
                  </AdvancedMarker>
                );
              })}

              {/* User Temporary coordinate dropper pin */}
              {tempPin && (
                <AdvancedMarker 
                  position={convertToRealLatLng(tempPin.lat, tempPin.lng, level, tempPin.locationName)}
                >
                  <Pin 
                    background="#10b981" 
                    borderColor="#ffffff" 
                    glyphColor="#ffffff" 
                    scale={1.2}
                  />
                </AdvancedMarker>
              )}
            </Map>
          </APIProvider>
        ) : !hasValidKey && !useSimulationMode ? (
          /* CONSTITUTION COMPLIANT SECURITY CREDENTIALS SPLASH PANEL */
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col items-center justify-center p-6 text-center animate-fade-in text-white z-20">
            <div className="max-w-md space-y-5 px-3 text-left">
              <div className="flex items-center gap-3 justify-center mb-1">
                <div className="p-2.5 bg-blue-500/15 text-blue-400 border border-blue-500/20 rounded-2xl animate-pulse">
                  <MapPin className="w-7 h-7" />
                </div>
                <h3 className="text-base font-extrabold text-white tracking-tight">Interactive Google Map Key Activation</h3>
              </div>
              
              <div className="bg-slate-900/60 border border-slate-800 p-4.5 rounded-2xl text-xs space-y-3 font-sans leading-relaxed text-slate-300">
                <p>
                  To convert this static visual dashboard into a high-precision, fully interactive real-world Google Map with geocoding, please link your project credentials:
                </p>
                <div className="space-y-2 pt-1">
                  <p className="flex items-start gap-2">
                    <span className="bg-blue-500/20 text-blue-300 font-mono text-[10px] w-5 h-5 rounded-full flex items-center justify-center shrink-0">1</span>
                    <span>
                      Get an API key: <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline font-semibold hover:text-blue-300">Google Cloud Console Registry</a>
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="bg-blue-500/20 text-blue-300 font-mono text-[10px] w-5 h-5 rounded-full flex items-center justify-center shrink-0">2</span>
                    <span>
                      Open <strong>Settings</strong> (⚙️ gear icon, top-right panel corner)
                    </span>
                  </p>
                  <p className="flex items-start gap-2">
                    <span className="bg-blue-500/20 text-blue-300 font-mono text-[10px] w-5 h-5 rounded-full flex items-center justify-center shrink-0">3</span>
                    <span>
                      Click **Secrets** → Type <code>GOOGLE_MAPS_PLATFORM_KEY</code> → paste key → Enter.
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setUseSimulationMode(true)}
                  className="flex-1 py-2.5 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 text-center cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  Activate Keyless Simulator Grid
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* MOCK INTERACTIVE SVG CANVAS MODE (Simulator) */
          <>
            <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.03)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none z-0" />
            <svg 
              onClick={handleSvgCanvasClick}
              className="w-full h-full cursor-crosshair select-none relative z-10"
              viewBox="0 0 100 100" 
              preserveAspectRatio="none"
            >
              {/* حسين ساجار ليك كلاسيك اندستريز (Center Landmark) */}
              {level === 'City' && (
                <>
                  <path 
                    d="M 45 42 Q 52 40 54 48 Q 50 56 44 50 Z" 
                    fill="rgba(59, 130, 246, 0.15)" 
                    stroke="rgba(59, 130, 246, 0.4)" 
                    strokeWidth="0.5" 
                    className="animate-pulse"
                  />
                  <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(15, 23, 42, 0.04)" strokeWidth="0.8" strokeDasharray="3 3" />
                  <circle cx="50" cy="50" r="44" fill="none" stroke="rgba(37, 99, 235, 0.04)" strokeWidth="1" />
                  <line x1="15" y1="50" x2="85" y2="50" stroke="rgba(15, 23, 42, 0.02)" strokeWidth="0.5" />
                  <line x1="50" y1="15" x2="50" y2="85" stroke="rgba(15, 23, 42, 0.02)" strokeWidth="0.5" />
                </>
              )}

              {/* Reference Grid elements */}
              {markers.map((marker, index) => {
                const isHovered = hoveredNode?.name === marker.name;
                return (
                  <g 
                    key={`svg-marker-${index}`}
                    onMouseEnter={() => setHoveredNode(marker)}
                    onMouseLeave={() => setHoveredNode(null)}
                    className="cursor-pointer"
                  >
                    <circle 
                      cx={marker.lng} 
                      cy={marker.lat} 
                      r={isHovered ? 4.5 : 2.5} 
                      fill="rgba(37, 99, 235, 0.25)" 
                      className="transition-all duration-300"
                    />
                    <circle 
                      cx={marker.lng} 
                      cy={marker.lat} 
                      r={1.2} 
                      fill="#2563eb" 
                    />
                  </g>
                );
              })}

              {/* Active reported list */}
              {levelIssues.map((issue) => {
                const isSelected = selectedIssueId === issue.id;
                const priorityColor = 
                  issue.priority === 'Critical' 
                    ? '#f43f5e' 
                    : issue.priority === 'High' 
                      ? '#f97316' 
                      : issue.priority === 'Medium' 
                        ? '#eab308' 
                        : '#10b981';

                return (
                  <g 
                    key={`svg-issue-${issue.id}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectIssue(isSelected ? null : issue.id);
                    }}
                    className="cursor-pointer group"
                  >
                    <circle 
                      cx={issue.lng} 
                      cy={issue.lat} 
                      r={isSelected ? 8 : 4.5} 
                      fill="none" 
                      stroke={priorityColor} 
                      strokeWidth="0.7"
                      className="animate-ping origin-center"
                    />
                    <circle 
                      cx={issue.lng} 
                      cy={issue.lat} 
                      r={isSelected ? 3.5 : 2.2} 
                      fill={priorityColor} 
                      className="transition-all duration-300"
                    />
                    <circle 
                      cx={issue.lng} 
                      cy={issue.lat} 
                      r={0.8} 
                      fill="#ffffff" 
                    />
                  </g>
                );
              })}

              {/* Temp Pin */}
              {tempPin && (
                <g className="animate-bounce">
                  <circle 
                    cx={tempPin.lng} 
                    cy={tempPin.lat} 
                    r={5.5} 
                    fill="none" 
                    stroke="#10b981" 
                    strokeWidth="0.7"
                  />
                  <circle 
                    cx={tempPin.lng} 
                    cy={tempPin.lat} 
                    r={2.5} 
                    fill="#10b981" 
                  />
                </g>
              )}
            </svg>
          </>
        )}

        {/* Floating details overlay for hovering landmark reference nodes */}
        {hoveredNode && (
          <div className="absolute bottom-4 left-4 bg-white/95 border border-slate-200 p-3.5 rounded-xl max-w-[240px] text-xs font-sans pointer-events-none shadow-lg z-20 backdrop-blur text-slate-800 animate-fade-in text-left">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></span>
              {hoveredNode.name}
            </div>
            <p className="text-slate-500 mt-1 font-medium leading-relaxed">{hoveredNode.description}</p>
          </div>
        )}

        {/* Selected Issue Info Overlay Drawer */}
        {selectedIssueId && (() => {
          if (!currentSelectedIssue) return null;
          return (
            <div className="absolute top-4 right-4 left-4 md:left-auto md:w-80 bg-white/95 border border-slate-200 p-4 rounded-2xl shadow-xl z-20 backdrop-blur animate-fade-in text-sans text-slate-800 text-left">
              <div className="flex justify-between items-start gap-2">
                <span className={`px-2.5 py-0.5 text-[9px] font-mono rounded-full font-bold uppercase tracking-wider ${
                  currentSelectedIssue.priority === 'Critical' 
                    ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                    : currentSelectedIssue.priority === 'High' 
                      ? 'bg-orange-50 text-orange-700 border border-orange-200' 
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {currentSelectedIssue.priority} Priority
                </span>
                <button 
                  onClick={() => onSelectIssue(null)}
                  className="text-slate-400 hover:text-slate-800 font-extrabold text-xs transition-colors cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>
              <h4 className="text-slate-900 font-extrabold text-sm mt-2 line-clamp-1">
                {currentSelectedIssue.title}
              </h4>
              <p className="text-slate-600 text-xs mt-1.5 line-clamp-3 leading-relaxed font-semibold">
                {currentSelectedIssue.description}
              </p>
              
              <div className="mt-3.5 pt-3 border-t border-slate-100 flex justify-between items-center text-[10px] font-mono text-slate-500">
                <span className="flex items-center gap-1 font-bold">
                  <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  {currentSelectedIssue.location.split(',')[0]}
                </span>
                
                <button
                  onClick={() => onUpvoteIssue && onUpvoteIssue(currentSelectedIssue.id)}
                  disabled={currentSelectedIssue.hasUpvoted}
                  className={`px-2.5 py-1 rounded-xl transition-all flex items-center gap-1 border text-[10px] font-extrabold ${
                    currentSelectedIssue.hasUpvoted 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-250' 
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 cursor-pointer'
                  }`}
                >
                  ▲ {currentSelectedIssue.upvotes} {currentSelectedIssue.hasUpvoted ? 'Upvoted' : 'Upvote'}
                </button>
              </div>

              {/* Status workflow info bar */}
              <div className="mt-3 flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-200/60">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Consensus:</div>
                <div className="flex items-center gap-1 text-[11px]">
                  <span className={`w-2 h-2 rounded-full ${
                    currentSelectedIssue.status === 'Resolved' 
                      ? 'bg-emerald-500' 
                      : currentSelectedIssue.status === 'Assigned' 
                        ? 'bg-blue-600' 
                        : 'bg-amber-500'
                  }`}></span>
                  <span className="font-bold text-slate-700">{currentSelectedIssue.status}</span>
                </div>
              </div>

              {currentSelectedIssue.status !== 'Resolved' && onResolveIssue && (
                <button
                  onClick={() => onResolveIssue(currentSelectedIssue.id)}
                  className="w-full mt-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer text-center select-none"
                >
                  Mark Resolved (Dispatch Crew)
                </button>
              )}
            </div>
          );
        })()}
      </div>

      {/* Map Legend */}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 items-center text-xs font-mono text-slate-500 border-t border-slate-200 pt-3 z-10 font-bold uppercase tracking-wider">
        <span className="text-xs text-slate-400 font-extrabold">Legend:</span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
          Critical Risk
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
          High Priority
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
          Medium Alert
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          Resolved
        </span>
      </div>
    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Tenant, UserProfile, Job, ServiceListing, JobApplication, Review } from '../types';
import { ALL_CATEGORIES, DIGITAL_CATEGORIES, LOCAL_CATEGORIES, CITIES, calculateDistance } from '../data';
import { Search, MapPin, Grid, List, Phone, MessageSquare, Star, ArrowUpDown, Compass, CheckCircle2, SlidersHorizontal, AlertCircle, Map, Info, UserCheck, ShieldCheck } from 'lucide-react';

interface MarketplaceDirectoryProps {
  currentUser: UserProfile;
  currentTenant: Tenant;
  allProfiles: UserProfile[];
  allJobs: Job[];
  allListings: ServiceListing[];
  allApplications: JobApplication[];
  allReviews: Review[];
  onAddApplication: (app: JobApplication) => void;
  onInitiateChat: (recipientId: string, relatedJobId?: string, relatedListingId?: string) => void;
}

export default function MarketplaceDirectory({
  currentUser,
  currentTenant,
  allProfiles,
  allJobs,
  allListings,
  allApplications,
  allReviews,
  onAddApplication,
  onInitiateChat,
}: MarketplaceDirectoryProps) {
  
  // Navigation: Marketplace Mode (Jobs Board) vs Service Directory Mode (Contractors Board)
  const [exploreMode, setExploreMode] = useState<'marketplace' | 'directory'>('directory');
  
  // Layout Toggle: List View vs Map View (for Nearby local services)
  const [layoutStyle, setLayoutStyle] = useState<'list' | 'map'>('list');

  // Search & Filters state
  const [keyword, setKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [serviceTypeFilter, setServiceTypeFilter] = useState<'all' | 'digital' | 'local'>('all');
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | 'Local' | 'Global'>('all');
  const [minRating, setMinRating] = useState<number>(0);
  const [maxBudget, setMaxBudget] = useState<number>(500);
  const [sortBy, setSortBy] = useState<'newest' | 'rating' | 'proximity'>('newest');

  // Location / Coordinate simulation (crucial for local proximity sorting in iframe)
  const [simulatedCity, setSimulatedCity] = useState(currentUser.location.city);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number }>({
    lat: currentUser.location.latitude,
    lng: currentUser.location.longitude,
  });

  // Application Modal state
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [applyCoverMessage, setApplyCoverMessage] = useState('');

  // Update userCoords whenever simulatedCity changes
  useEffect(() => {
    const matchedCity = CITIES.find((c) => c.name === simulatedCity);
    if (matchedCity) {
      setUserCoords({ lat: matchedCity.lat, lng: matchedCity.lng });
    }
  }, [simulatedCity]);

  // Request real geolocation if desired
  const handleRequestRealLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setSimulatedCity('My Location (GPS)');
          alert(`Successfully mapped GPS coordinates: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}! Gigs sorted by proximity.`);
        },
        (error) => {
          alert('GPS access blocked or unsupported in iframe context. Simulated city coordinates applied.');
        }
      );
    }
  };

  // Helper to extract average rating for a provider
  const getProviderRating = (providerId: string) => {
    const provider = allProfiles.find((p) => p.id === providerId);
    return provider?.providerProfile?.rating || 5.0;
  };

  // 1. FILTERING & SORTING LISTINGS (Directory Mode)
  const filteredListings = allListings
    .filter((l) => {
      if (l.tenantId !== currentTenant.id) return false;
      if (l.status !== 'Active') return false;

      // Keyword match
      const titleMatch = l.title.toLowerCase().includes(keyword.toLowerCase());
      const descMatch = l.description.toLowerCase().includes(keyword.toLowerCase());
      const catMatch = l.category.toLowerCase().includes(keyword.toLowerCase());
      if (keyword && !titleMatch && !descMatch && !catMatch) return false;

      // Category filter
      if (selectedCategory !== 'All' && l.category !== selectedCategory) return false;

      // Service type
      if (serviceTypeFilter !== 'all' && l.serviceType !== serviceTypeFilter) return false;

      // Visibility filter
      if (visibilityFilter !== 'all' && l.visibility !== visibilityFilter) return false;

      // Price filter
      if (l.price > maxBudget) return false;

      // Rating filter
      const providerRating = getProviderRating(l.providerId);
      if (providerRating < minRating) return false;

      return true;
    })
    .map((l) => {
      // Calculate distances using the Haversine formula based on simulated coordinates
      const distance = calculateDistance(userCoords.lat, userCoords.lng, l.latitude, l.longitude);
      return { ...l, distance };
    });

  // Sorting Listings
  const sortedListings = [...filteredListings].sort((a, b) => {
    if (sortBy === 'rating') {
      return getProviderRating(b.providerId) - getProviderRating(a.providerId);
    }
    if (sortBy === 'proximity') {
      return a.distance - b.distance;
    }
    // Default newest
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // 2. FILTERING & SORTING JOBS (Marketplace Mode)
  const filteredJobs = allJobs
    .filter((j) => {
      if (j.tenantId !== currentTenant.id) return false;
      if (j.status !== 'Open') return false;

      // Keyword match
      const titleMatch = j.title.toLowerCase().includes(keyword.toLowerCase());
      const descMatch = j.description.toLowerCase().includes(keyword.toLowerCase());
      const catMatch = j.category.toLowerCase().includes(keyword.toLowerCase());
      if (keyword && !titleMatch && !descMatch && !catMatch) return false;

      // Category filter
      if (selectedCategory !== 'All' && j.category !== selectedCategory) return false;

      // Service type
      if (serviceTypeFilter !== 'all' && j.serviceType !== serviceTypeFilter) return false;

      // Visibility filter
      if (visibilityFilter !== 'all' && j.visibility !== visibilityFilter) return false;

      // Budget filter
      if (j.budget > maxBudget) return false;

      return true;
    })
    .map((j) => {
      const distance = calculateDistance(userCoords.lat, userCoords.lng, j.latitude, j.longitude);
      return { ...j, distance };
    });

  // Sorting Jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortBy === 'proximity') {
      return a.distance - b.distance;
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Handlers
  const handleInitiateApply = (jobId: string) => {
    if (currentUser.role !== 'provider') {
      alert('Only registered Service Provider profiles can submit bids and apply to client requirements.');
      return;
    }
    setApplyingJobId(jobId);
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingJobId || !applyCoverMessage.trim()) return;

    const newApp: JobApplication = {
      id: `app-${Date.now()}`,
      tenantId: currentTenant.id,
      jobId: applyingJobId,
      providerId: currentUser.id,
      coverMessage: applyCoverMessage,
      status: 'Pending',
      createdAt: new Date().toISOString(),
    };

    onAddApplication(newApp);
    setApplyingJobId(null);
    setApplyCoverMessage('');
    alert('Your professional bid has been locked onto the sub-marketplace node. The client has been notified!');
  };

  const handleCallProvider = (providerName: string, phone: string) => {
    const confirmCall = window.confirm(`Platform confirmation:\nAre you sure you want to trigger your device's native dialer to call local provider "${providerName}" at ${phone}?`);
    if (confirmCall) {
      window.location.href = `tel:${phone}`;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Search & Location Bar Section */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
        
        {/* Keyword Search & Core Mode switch */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-gray-400 absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder={
                exploreMode === 'directory'
                  ? 'Search contractor titles, specialties, keywords...'
                  : 'Search client job requirements, skills, milestones...'
              }
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 focus:outline-none rounded-xl text-xs bg-gray-50/50"
            />
          </div>

          <div className="flex bg-gray-100 p-1.5 rounded-xl text-xs font-semibold shrink-0">
            <button
              onClick={() => setExploreMode('directory')}
              className={`px-4 py-2 rounded-lg transition-all ${
                exploreMode === 'directory'
                  ? 'bg-white text-gray-950 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              🛠️ Service Directory Mode
            </button>
            <button
              onClick={() => setExploreMode('marketplace')}
              className={`px-4 py-2 rounded-lg transition-all ${
                exploreMode === 'marketplace'
                  ? 'bg-white text-gray-950 shadow-sm'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              💼 Marketplace Mode (Jobs)
            </button>
          </div>
        </div>

        {/* Location Simulation Toolbar */}
        <div className="bg-[#FAF5FF] border border-[#F3E8FF] rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-purple-600 animate-spin-slow shrink-0" />
            <span className="font-semibold text-gray-800">Geographic Proximity Coordinates:</span>
            <select
              value={simulatedCity}
              onChange={(e) => setSimulatedCity(e.target.value)}
              className="bg-white border border-gray-200 px-2 py-1 rounded-lg text-xs focus:outline-none"
            >
              {CITIES.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name} ({c.state})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-gray-400 font-mono text-[11px]">
              Active: Lat {userCoords.lat.toFixed(4)}, Lng {userCoords.lng.toFixed(4)}
            </span>
            <button
              onClick={handleRequestRealLocation}
              className="px-3 py-1 bg-[#4A1D96] text-white hover:bg-[#3B1578] font-bold text-[10px] rounded-lg transition-all uppercase"
            >
              🛰️ Query Real GPS
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 pt-2">
          
          {/* Category selection */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Category</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none"
            >
              <option value="All">All Categories</option>
              {ALL_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Service Type selection */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Service Range</span>
            <select
              value={serviceTypeFilter}
              onChange={(e) => setServiceTypeFilter(e.target.value as any)}
              className="w-full px-2 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none"
            >
              <option value="all">All Gigs</option>
              <option value="digital">Digital Freelancing</option>
              <option value="local">Local Handyman</option>
            </select>
          </div>

          {/* Visibility selection */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Visibility Scope</span>
            <select
              value={visibilityFilter}
              onChange={(e) => setVisibilityFilter(e.target.value as any)}
              className="w-full px-2 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none"
            >
              <option value="all">All Visibility</option>
              <option value="Global">Global Listings</option>
              <option value="Local">Local City Listings</option>
            </select>
          </div>

          {/* Budget Limit range slider */}
          <div className="flex flex-col gap-1 col-span-2 sm:col-span-1">
            <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase">
              <span>Max Price</span>
              <span className="text-indigo-600 font-black">{maxBudget} Pi</span>
            </div>
            <input
              type="range"
              min="1"
              max="500"
              value={maxBudget}
              onChange={(e) => setMaxBudget(parseInt(e.target.value))}
              className="h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#4F46E5] mt-2.5"
            />
          </div>

          {/* Sorting */}
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Sorting</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-2 py-2 border border-gray-200 rounded-lg text-xs bg-white focus:outline-none"
            >
              <option value="newest">Newest Upload</option>
              {exploreMode === 'directory' && <option value="rating">Top Rated (Stars)</option>}
              <option value="proximity">Proximity (Distance)</option>
            </select>
          </div>

        </div>

      </div>

      {/* Grid view layout layout list toggle */}
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500">
          Showing {exploreMode === 'directory' ? sortedListings.length : sortedJobs.length} active listings on node
        </p>

        {exploreMode === 'directory' && (
          <div className="flex bg-gray-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setLayoutStyle('list')}
              className={`p-1.5 rounded-lg transition-all ${
                layoutStyle === 'list' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-400 hover:text-gray-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setLayoutStyle('map')}
              className={`p-1.5 rounded-lg transition-all ${
                layoutStyle === 'map' ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-400 hover:text-gray-900'
              }`}
            >
              <Map className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Directory Mode Listings Block */}
      {exploreMode === 'directory' && (
        <>
          {layoutStyle === 'list' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedListings.length === 0 ? (
                <div className="col-span-full bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
                  <AlertCircle className="w-10 h-10 mx-auto mb-2 text-gray-300 stroke-[1.5]" />
                  <p className="text-sm font-semibold text-gray-700">No Service Providers Found</p>
                  <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                    Try adjusting your category filter, sorting preferences, or typing different search keywords.
                  </p>
                </div>
              ) : (
                sortedListings.map((l) => {
                  const contractor = allProfiles.find((p) => p.id === l.providerId);
                  const providerRating = contractor?.providerProfile?.rating || 5.0;

                  return (
                    <div
                      key={l.id}
                      className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={contractor?.photoUrl}
                              alt={contractor?.displayName}
                              className="w-9 h-9 rounded-full bg-gray-50 border border-gray-100"
                            />
                            <div>
                              <span className="text-xs font-bold text-gray-900 block">{contractor?.displayName}</span>
                              <div className="flex items-center gap-1.5">
                                <span className="flex items-center text-[10px] text-yellow-500 fill-current font-bold gap-0.5">
                                  ★ {providerRating.toFixed(1)}
                                </span>
                                <span className="text-[10px] text-gray-400 font-semibold">• {l.category}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-xs font-black text-emerald-600 block">{l.price} Pi / hr</span>
                            <span className={`inline-block px-1.5 py-0.2 rounded text-[8px] font-bold tracking-wide uppercase ${
                              l.visibility === 'Global' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                            }`}>
                              {l.visibility}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-xs text-gray-950 leading-snug">{l.title}</h4>
                          <p className="text-[11px] text-gray-500 leading-relaxed mt-1.5 line-clamp-3">{l.description}</p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-50 flex items-center justify-between flex-wrap gap-2">
                        
                        {/* Geographic Distance Indicator */}
                        <div className="flex items-center gap-1 text-[10px] text-purple-600 font-semibold">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>
                            {l.city} • {l.distance} km away
                          </span>
                        </div>

                        {/* Direct Contact buttons (Call & Chat) */}
                        <div className="flex gap-1.5">
                          {contractor?.phone && l.serviceType === 'local' && (
                            <button
                              onClick={() => handleCallProvider(contractor.displayName, contractor.phone)}
                              className="flex items-center gap-1 px-3 py-1.5 border border-emerald-200 hover:bg-emerald-50 text-emerald-700 font-bold text-[10px] rounded-lg uppercase transition-all"
                              title="Tap to verify and dial their phone number directly"
                            >
                              <Phone className="w-3 h-3" />
                              Call Contractor
                            </button>
                          )}
                          <button
                            onClick={() => {
                              onInitiateChat(l.providerId, undefined, l.id);
                              alert(`Secure negotiation session opened with ${contractor?.displayName || 'contractor'}. Check your Chat tab!`);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-[#4F46E5] hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg uppercase transition-all shadow-xs"
                          >
                            <MessageSquare className="w-3 h-3" />
                            Send Message
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* Visual Simulated Map view radar loop */
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
              <div className="bg-slate-950 rounded-xl relative p-8 h-[380px] overflow-hidden flex flex-col justify-between border-2 border-slate-900">
                
                {/* Simulated Radar Circular grids */}
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <div className="w-80 h-80 rounded-full border border-green-500 animate-ping"></div>
                  <div className="absolute w-64 h-64 rounded-full border border-green-500"></div>
                  <div className="absolute w-44 h-44 rounded-full border border-green-500"></div>
                  <div className="absolute w-24 h-24 rounded-full border border-green-500"></div>
                </div>

                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-xs px-2.5 py-1 rounded text-[10px] font-mono text-green-400 flex items-center gap-1.5">
                  <Compass className="w-3 h-3 animate-spin" />
                  <span>PROXIMITY SEARCH ACTIVE: Austin Grid</span>
                </div>

                {/* Simulated coordinate Nodes placement */}
                <div className="relative flex-1">
                  {/* Center Node (User) */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10">
                    <span className="relative flex h-3.5 w-3.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-500"></span>
                    </span>
                    <span className="bg-blue-900/90 text-white font-bold text-[9px] px-1.5 py-0.5 rounded shadow mt-1">
                      You (SF/Austin Core)
                    </span>
                  </div>

                  {/* Contractor Node Markers */}
                  {sortedListings.slice(0, 5).map((l, index) => {
                    const angles = [45, 135, 225, 315, 90];
                    const angle = angles[index % angles.length] * (Math.PI / 180);
                    const baseRadius = 50 + (index * 40); // px radius
                    const x = Math.cos(angle) * baseRadius;
                    const y = Math.sin(angle) * baseRadius;

                    return (
                      <div
                        key={l.id}
                        className="absolute flex flex-col items-center transition-all duration-300 cursor-pointer"
                        style={{
                          left: `calc(50% + ${x}px - 20px)`,
                          top: `calc(50% + ${y}px - 20px)`,
                        }}
                        onClick={() => {
                          const contractorName = allProfiles.find((p) => p.id === l.providerId)?.displayName;
                          alert(`Clicked Node: "${l.title}" by ${contractorName}.\nDistance: ${l.distance}km away. Contact them via standard List View.`);
                        }}
                      >
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                        </span>
                        <div className="bg-slate-900 text-[9px] text-emerald-400 font-mono px-1.5 py-0.5 rounded border border-emerald-500/20 shadow mt-1 whitespace-nowrap">
                          {l.distance}km • {l.category}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-slate-900/80 backdrop-blur-xs p-3 rounded-lg border border-slate-800 text-[10px] text-slate-400 font-mono flex items-center gap-2">
                  <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Nodes correspond to licensed service providers within a 15km search radius of your selected Simulated City coordinates. Click node dots to view basic contract parameters.
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Marketplace Mode Jobs Board Block */}
      {exploreMode === 'marketplace' && (
        <div className="space-y-4">
          {sortedJobs.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400">
              <AlertCircle className="w-10 h-10 mx-auto mb-2 text-gray-300 stroke-[1.5]" />
              <p className="text-sm font-semibold text-gray-700">No Open Job Requirements Found</p>
              <p className="text-xs text-gray-400 mt-1 max-w-md mx-auto">
                No clients are currently seeking specialists in this category. Be the first to list a service in Directory Mode!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {sortedJobs.map((j) => {
                const client = allProfiles.find((p) => p.id === j.clientId);
                // Check if already applied
                const alreadyApplied = allApplications.some(
                  (a) => a.jobId === j.id && a.providerId === currentUser.id
                );

                return (
                  <div
                    key={j.id}
                    className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                  >
                    <div className="space-y-3">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={client?.photoUrl}
                            alt={client?.displayName}
                            className="w-9 h-9 rounded-full bg-gray-50 border border-gray-100"
                          />
                          <div>
                            <span className="text-xs font-bold text-gray-900 block">{client?.displayName}</span>
                            <span className="text-[10px] text-gray-400 font-mono">@{client?.username}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-black text-indigo-600 block">{j.budget} Pi</span>
                          <span className="text-[9px] bg-indigo-50 text-indigo-700 font-bold px-1.5 py-0.2 rounded border border-indigo-100 uppercase mt-1">
                            {j.category}
                          </span>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-bold text-xs text-gray-950 leading-snug">{j.title}</h4>
                        <p className="text-[11px] text-gray-600 leading-relaxed mt-1.5">{j.description}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-gray-50 flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-3 text-[10px] text-gray-400 font-semibold">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {j.city} • {j.distance} km away
                        </span>
                        <span>•</span>
                        <span>Published {new Date(j.createdAt).toLocaleDateString()}</span>
                      </div>

                      {alreadyApplied ? (
                        <span className="px-3 py-1.5 bg-gray-100 text-gray-400 font-bold text-[10px] rounded-lg uppercase flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-gray-400" />
                          Already Submitted Bid
                        </span>
                      ) : (
                        <button
                          onClick={() => handleInitiateApply(j.id)}
                          className="px-3.5 py-1.5 bg-[#4F46E5] hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg uppercase transition-all shadow-xs"
                        >
                          Submit Bid / Proposal
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Application Cover Message Modal Simulation */}
      {applyingJobId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full p-6 space-y-4">
            <h3 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
              Lock Bid Proposal Details
            </h3>

            <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-1">Cover Message / Pitch</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Explain why your experience, tools, and availability make you the ideal choice for this requirement..."
                  value={applyCoverMessage}
                  onChange={(e) => setApplyCoverMessage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-xl p-3 text-[11px] leading-relaxed">
                <span className="font-semibold">Pi Escrow Safety Notice:</span> When client accepts your bid, your milestones will automatically initialize a secure conversation thread.
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setApplyingJobId(null)}
                  className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold"
                >
                  Confirm Bid Lock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

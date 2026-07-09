/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Tenant, UserProfile, Job, ServiceListing, JobApplication, Review, ChatMessage, Conversation, Notification } from './types';
import {
  INITIAL_TENANTS,
  INITIAL_PROFILES,
  INITIAL_JOBS,
  INITIAL_LISTINGS,
  INITIAL_REVIEWS,
  INITIAL_NOTIFICATIONS,
  ALL_CATEGORIES,
} from './data';
import AuthModal from './components/AuthModal';
import { piSdkService, PiUser } from './services/piSdkService';
import ChatMessenger from './components/ChatMessenger';
import ProfileManagement from './components/ProfileManagement';
import MarketplaceDirectory from './components/MarketplaceDirectory';
import RoleDashboards from './components/RoleDashboards';
import { safeStorage } from './utils/storage';
import {
  MessageSquare,
  Briefcase,
  User,
  LayoutDashboard,
  LogOut,
  Bell,
  Sparkles,
  Layers,
  Settings,
  HelpCircle,
  TrendingUp,
  MapPin,
  ChevronDown,
  Info
} from 'lucide-react';

export default function App() {
  // --- Persistent LocalStorage Database Initialization ---
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const saved = safeStorage.getItem('whp_tenants');
    return saved ? JSON.parse(saved) : INITIAL_TENANTS;
  });

  const [profiles, setProfiles] = useState<UserProfile[]>(() => {
    const saved = safeStorage.getItem('whp_profiles');
    return saved ? JSON.parse(saved) : INITIAL_PROFILES;
  });

  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = safeStorage.getItem('whp_jobs');
    return saved ? JSON.parse(saved) : INITIAL_JOBS;
  });

  const [listings, setListings] = useState<ServiceListing[]>(() => {
    const saved = safeStorage.getItem('whp_listings');
    return saved ? JSON.parse(saved) : INITIAL_LISTINGS;
  });

  const [applications, setApplications] = useState<JobApplication[]>(() => {
    const saved = safeStorage.getItem('whp_applications');
    return saved ? JSON.parse(saved) : [];
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = safeStorage.getItem('whp_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = safeStorage.getItem('whp_messages');
    return saved ? JSON.parse(saved) : [];
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const saved = safeStorage.getItem('whp_conversations');
    return saved ? JSON.parse(saved) : [];
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const saved = safeStorage.getItem('whp_notifications');
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  // --- Active Session States ---
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = safeStorage.getItem('whp_current_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [piUser, setPiUser] = useState<PiUser | null>(() => {
    const saved = safeStorage.getItem('whp_pi_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTenantId, setActiveTenantId] = useState<string>('tenant-pigigs');
  const [activeTab, setActiveTab] = useState<'explore' | 'dashboard' | 'chat' | 'profile'>('explore');
  const [selectedConversationId, setSelectedConversationId] = useState<string | undefined>(undefined);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);

  // Sync session profiles to safeStorage
  useEffect(() => {
    if (currentUser) {
      safeStorage.setItem('whp_current_user', JSON.stringify(currentUser));
    } else {
      safeStorage.removeItem('whp_current_user');
    }
  }, [currentUser]);

  useEffect(() => {
    if (piUser) {
      safeStorage.setItem('whp_pi_user', JSON.stringify(piUser));
    } else {
      safeStorage.removeItem('whp_pi_user');
    }
  }, [piUser]);

  // Sync to localStorage whenever changes occur
  useEffect(() => {
    safeStorage.setItem('whp_tenants', JSON.stringify(tenants));
  }, [tenants]);

  useEffect(() => {
    safeStorage.setItem('whp_profiles', JSON.stringify(profiles));
  }, [profiles]);

  useEffect(() => {
    safeStorage.setItem('whp_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    safeStorage.setItem('whp_listings', JSON.stringify(listings));
  }, [listings]);

  useEffect(() => {
    safeStorage.setItem('whp_applications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    safeStorage.setItem('whp_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    safeStorage.setItem('whp_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    safeStorage.setItem('whp_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    safeStorage.setItem('whp_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Find active Tenant details
  const activeTenant = tenants.find((t) => t.id === activeTenantId) || tenants[0];

  // Automatically initialize Pi SDK and auto-login if running in Pi Browser
  useEffect(() => {
    console.log('[App] Initializing Pi SDK and detecting environment...');
    piSdkService.initialize();

    // If running in Pi Browser and not logged in, we automatically authenticate the user
    if (piSdkService.isPiBrowser() && !currentUser) {
      console.log('[App] Running inside Pi Browser without active session. Auto-initiating authentication...');
      piSdkService.authenticateUser()
        .then((pUser) => {
          setPiUser(pUser);
          const existingProfile = profiles.find((p) => p.id === pUser.uid || p.username === pUser.username);
          if (existingProfile) {
            setCurrentUser(existingProfile);
          } else {
            // Provision new profile
            const newProfile: UserProfile = {
              id: pUser.uid,
              tenantId: activeTenantId,
              role: 'client',
              username: pUser.username,
              displayName: `Pioneer (${pUser.username})`,
              photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${pUser.username}`,
              bio: 'Authenticated Pi Network Pioneer.',
              phone: '',
              email: `${pUser.username}@pinetwork.com`,
              location: {
                country: 'United States',
                state: 'California',
                district: 'SF Bay Area',
                city: 'San Francisco',
                latitude: 37.7749,
                longitude: -122.4194,
              },
              createdAt: new Date().toISOString(),
              clientProfile: {
                savedProviderIds: [],
              },
            };
            setProfiles((prev) => [...prev, newProfile]);
            setCurrentUser(newProfile);
          }
        })
        .catch((err) => {
          console.error('[App] Auto Pi authentication on mount failed:', err);
        });
    }
  }, []);

  // If the active tenant changes and currentUser belongs to a different tenant,
  // we automatically re-bind the currentUser to matching role within new tenant
  // to prevent cross-tenant UI confusion! Incredibly helpful for sandboxed iframe reviews.
  const handleTenantChange = (tenantId: string) => {
    setActiveTenantId(tenantId);
    if (currentUser && currentUser.role !== 'super_admin') {
      const matchingUser = profiles.find((p) => p.tenantId === tenantId && p.role === currentUser.role);
      if (matchingUser) {
        setCurrentUser(matchingUser);
      } else {
        // Find any user in that tenant
        const tenantUser = profiles.find((p) => p.tenantId === tenantId);
        if (tenantUser) {
          setCurrentUser(tenantUser);
        } else {
          // If none exist, prompt AuthModal
          setCurrentUser(null);
        }
      }
    }
    setActiveTab('explore');
  };

  // --- Dynamic Action Handlers ---
  const handleSendMessage = (
    receiverId: string,
    text: string,
    relatedJobId?: string,
    relatedListingId?: string
  ) => {
    if (!currentUser) return;

    // 1. Generate or fetch Conversation ID
    let conv = conversations.find(
      (c) =>
        c.tenantId === activeTenantId &&
        ((c.clientId === currentUser.id && c.providerId === receiverId) ||
          (c.clientId === receiverId && c.providerId === currentUser.id))
    );

    let convId = conv?.id;

    if (!conv) {
      convId = `conv-${Date.now()}`;
      const newConv: Conversation = {
        id: convId,
        tenantId: activeTenantId,
        clientId: currentUser.role === 'client' ? currentUser.id : receiverId,
        providerId: currentUser.role === 'provider' ? currentUser.id : receiverId,
        relatedJobId,
        relatedListingId,
        lastMessageText: text,
        lastMessageTimestamp: new Date().toISOString(),
      };
      setConversations((prev) => [newConv, ...prev]);
    } else {
      // Update existing conversation details
      setConversations((prev) =>
        prev.map((c) =>
          c.id === convId
            ? { ...c, lastMessageText: text, lastMessageTimestamp: new Date().toISOString() }
            : c
        )
      );
    }

    // 2. Post new Message
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      tenantId: activeTenantId,
      conversationId: convId!,
      senderId: currentUser.id,
      receiverId,
      text,
      timestamp: new Date().toISOString(),
      read: false,
    };

    setMessages((prev) => [...prev, newMsg]);

    // 3. Post Notification to receiver
    const newNotif: Notification = {
      id: `not-${Date.now()}`,
      tenantId: activeTenantId,
      userId: receiverId,
      title: `New Message from ${currentUser.displayName}`,
      message: text.length > 50 ? `${text.slice(0, 47)}...` : text,
      read: false,
      type: 'message',
      createdAt: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
  };

  const handleInitiateChat = (recipientId: string, relatedJobId?: string, relatedListingId?: string) => {
    if (!currentUser) return;

    let conv = conversations.find(
      (c) =>
        c.tenantId === activeTenantId &&
        ((c.clientId === currentUser.id && c.providerId === recipientId) ||
          (c.clientId === recipientId && c.providerId === currentUser.id))
    );

    if (!conv) {
      const convId = `conv-${Date.now()}`;
      const newConv: Conversation = {
        id: convId,
        tenantId: activeTenantId,
        clientId: currentUser.role === 'client' ? currentUser.id : recipientId,
        providerId: currentUser.role === 'provider' ? currentUser.id : recipientId,
        relatedJobId,
        relatedListingId,
        lastMessageText: 'Negotiation thread initiated.',
        lastMessageTimestamp: new Date().toISOString(),
      };
      setConversations((prev) => [newConv, ...prev]);
      setSelectedConversationId(convId);
    } else {
      setSelectedConversationId(conv.id);
    }
    setActiveTab('chat');
  };

  const handleUpdateProfile = (updated: UserProfile) => {
    setProfiles((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setCurrentUser(updated);
  };

  const handleUpdateTenant = (updated: Tenant) => {
    setTenants((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleAddJob = (job: Job) => {
    setJobs((prev) => [job, ...prev]);

    // Broadcast notification to all Providers in matching category
    const matches = profiles.filter(
      (p) => p.tenantId === activeTenantId && p.role === 'provider' && p.providerProfile?.categories.includes(job.category)
    );

    matches.forEach((prov) => {
      const newNotif: Notification = {
        id: `not-match-${Date.now()}-${prov.id}`,
        tenantId: activeTenantId,
        userId: prov.id,
        title: 'New Job posted in your field!',
        message: `"${job.title}" has been posted matching your specialty. Apply today!`,
        read: false,
        type: 'job_match',
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotif, ...prev]);
    });
  };

  const handleAddListing = (listing: ServiceListing) => {
    setListings((prev) => [listing, ...prev]);
  };

  const handleUpdateJobStatus = (jobId: string, status: 'Open' | 'InProgress' | 'Completed' | 'Closed') => {
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status } : j)));
  };

  const handleAddApplication = (app: JobApplication) => {
    setApplications((prev) => [app, ...prev]);

    // Notify client
    const targetJob = jobs.find((j) => j.id === app.jobId);
    if (targetJob) {
      const newNotif: Notification = {
        id: `not-app-${Date.now()}`,
        tenantId: activeTenantId,
        userId: targetJob.clientId,
        title: 'New Proposal Proposal Received',
        message: `${currentUser?.displayName || 'A contractor'} applied to "${targetJob.title}".`,
        read: false,
        type: 'application',
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  const handleRespondToApplication = (appId: string, status: 'Accepted' | 'Rejected') => {
    setApplications((prev) => prev.map((a) => (a.id === appId ? { ...a, status } : a)));

    const matchedApp = applications.find((a) => a.id === appId);
    if (matchedApp) {
      const targetJob = jobs.find((j) => j.id === matchedApp.jobId);
      if (status === 'Accepted' && targetJob) {
        handleUpdateJobStatus(targetJob.id, 'InProgress');
      }

      // Notify provider
      const newNotif: Notification = {
        id: `not-respond-${Date.now()}`,
        tenantId: activeTenantId,
        userId: matchedApp.providerId,
        title: `Proposal ${status}!`,
        message: `Your bid proposal for "${targetJob?.title || 'gigs'}" was ${status.toLowerCase()}.`,
        read: false,
        type: 'application',
        createdAt: new Date().toISOString(),
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  const handleAddReview = (review: Review) => {
    setReviews((prev) => [review, ...prev]);

    // Recompute provider's average ratings
    const provReviews = [...reviews, review].filter((r) => r.revieweeId === review.revieweeId);
    const sum = provReviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = parseFloat((sum / provReviews.length).toFixed(1));

    setProfiles((prev) =>
      prev.map((p) => {
        if (p.id === review.revieweeId && p.providerProfile) {
          return {
            ...p,
            providerProfile: {
              ...p.providerProfile,
              rating: avg,
              reviewCount: provReviews.length,
            },
          };
        }
        return p;
      })
    );
  };

  const handleToggleTenantStatus = (tenantId: string) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === tenantId ? { ...t, isActive: !t.isActive } : t))
    );
  };

  const handleAddGlobalCategory = (cat: string) => {
    // Adding category updates global list
    ALL_CATEGORIES.push(cat);
  };

  const handleAddTenant = (newT: Tenant) => {
    setTenants((prev) => [...prev, newT]);
  };

  const handleLogout = () => {
    console.log('[App] Logging out active session...');
    setCurrentUser(null);
    setPiUser(null);
    safeStorage.removeItem('whp_current_user');
    safeStorage.removeItem('whp_pi_user');
    setActiveTab('explore');
  };

  // Helper metrics for badge
  const unreadCount = currentUser
    ? notifications.filter((n) => n.userId === currentUser.id && !n.read).length
    : 0;

  const markAllNotificationsAsRead = () => {
    if (!currentUser) return;
    setNotifications((prev) =>
      prev.map((n) => (n.userId === currentUser.id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-gray-900 font-sans flex flex-col">
      
      {/* 1. TOP DEVELOPMENT & SAAS TESTING SANDBOX RAIL */}
      <div className="bg-slate-900 text-slate-100 px-4 py-2 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 z-40 text-xs">
        <div className="flex items-center gap-2">
          <span className="bg-yellow-400 text-slate-950 px-2 py-0.5 rounded text-[10px] uppercase font-black tracking-wider">
            SaaS Simulator Sandbox
          </span>
          <span className="text-slate-400 font-medium">Verify multi-tenant architecture:</span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          
          {/* Tenant Skin Selector */}
          <div className="flex items-center gap-1.5 bg-slate-850 px-2.5 py-1 rounded-lg border border-slate-800">
            <span className="text-slate-400 font-medium font-mono text-[11px]">Select Node Tenant:</span>
            <select
              value={activeTenantId}
              onChange={(e) => handleTenantChange(e.target.value)}
              className="bg-transparent text-white font-bold focus:outline-none border-none text-[11px] cursor-pointer"
            >
              {tenants.map((t) => (
                <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                  {t.logo} {t.name} {!t.isActive && '(SUSPENDED)'}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Role Sandbox Switcher */}
          {currentUser && (
            <div className="flex items-center gap-1.5 bg-slate-850 px-2.5 py-1 rounded-lg border border-slate-800">
              <span className="text-slate-400 font-medium font-mono text-[11px]">Active Persona:</span>
              <select
                value={currentUser.id}
                onChange={(e) => {
                  const selected = profiles.find((p) => p.id === e.target.value);
                  if (selected) {
                    setCurrentUser(selected);
                    setActiveTab('explore');
                  }
                }}
                className="bg-transparent text-yellow-300 font-bold focus:outline-none border-none text-[11px] cursor-pointer"
              >
                {profiles
                  .filter((p) => p.role === 'super_admin' || p.tenantId === activeTenantId || !p.tenantId)
                  .map((p) => (
                    <option key={p.id} value={p.id} className="bg-slate-900 text-white">
                      {p.displayName} ({p.role.replace('_', ' ')})
                    </option>
                  ))}
              </select>
            </div>
          )}

          {currentUser && (
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 hover:text-white text-slate-400 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          )}
        </div>
      </div>

      {currentUser ? (
        <>
          {/* 2. DYNAMIC WHITE-LABEL BRAND NAV */}
          <nav
            className="bg-white border-b border-gray-100 shadow-xs sticky top-0 z-30 transition-all duration-300"
            style={{ borderTop: `4px solid ${activeTenant.themeColor}` }}
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                
                {/* Custom Brand Logo */}
                <div className="flex items-center gap-2">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl shadow-sm border border-gray-100"
                    style={{ backgroundColor: `${activeTenant.themeColor}12` }}
                  >
                    {activeTenant.logo}
                  </div>
                  <div>
                    <h1 className="font-extrabold text-sm text-gray-950 tracking-tight flex items-center gap-1.5">
                      {activeTenant.name}
                      <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.2 rounded border border-gray-100">
                        {activeTenant.subdomain.split('.')[0]}
                      </span>
                    </h1>
                    <p className="text-[10px] text-gray-400 leading-none truncate max-w-[200px] sm:max-w-xs mt-0.5">
                      {activeTenant.tagline}
                    </p>
                  </div>
                </div>

                {/* Primary Nav Navigation Menus */}
                <div className="hidden md:flex items-center space-x-1 text-xs font-semibold">
                  <button
                    onClick={() => setActiveTab('explore')}
                    className={`px-4 py-2 rounded-xl transition-all ${
                      activeTab === 'explore'
                        ? 'text-gray-950 bg-gray-50'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    💼 Browse Market
                  </button>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`px-4 py-2 rounded-xl transition-all ${
                      activeTab === 'dashboard'
                        ? 'text-gray-950 bg-gray-50'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <span className="flex items-center gap-1">
                      <LayoutDashboard className="w-3.5 h-3.5" />
                      {currentUser.role.replace('_', ' ').toUpperCase()} Panel
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('chat');
                      setSelectedConversationId(undefined);
                    }}
                    className={`px-4 py-2 rounded-xl transition-all relative ${
                      activeTab === 'chat'
                        ? 'text-gray-950 bg-gray-50'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    💬 Secure Chats
                  </button>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-4 py-2 rounded-xl transition-all ${
                      activeTab === 'profile'
                        ? 'text-gray-950 bg-gray-50'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    👤 My Profile
                  </button>
                </div>

                {/* Profile Controls & Notifications dropdown */}
                <div className="flex items-center gap-4">
                  
                  {/* Notifications Alert Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => {
                        setShowNotificationsDropdown(!showNotificationsDropdown);
                        if (!showNotificationsDropdown) {
                          markAllNotificationsAsRead();
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-gray-600 rounded-full bg-gray-50 hover:bg-gray-100 transition-all relative"
                    >
                      <Bell className="w-4 h-4" />
                      {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white animate-pulse" />
                      )}
                    </button>

                    {showNotificationsDropdown && (
                      <div className="absolute right-0 mt-2.5 w-72 bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden z-40 text-xs">
                        <div className="p-3 border-b border-gray-100 bg-gray-50 font-bold text-gray-900">
                          Platform Notifications ({unreadCount} unread)
                        </div>
                        <div className="max-h-[260px] overflow-y-auto divide-y divide-gray-50">
                          {notifications.filter((n) => n.userId === currentUser.id).length === 0 ? (
                            <p className="p-4 text-center text-gray-400 italic">No historical notifications</p>
                          ) : (
                            notifications
                              .filter((n) => n.userId === currentUser.id)
                              .map((n) => (
                                <div key={n.id} className="p-3 hover:bg-gray-50/50 space-y-0.5">
                                  <div className="font-semibold text-gray-900 flex justify-between">
                                    <span>{n.title}</span>
                                    {!n.read && <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full shrink-0" />}
                                  </div>
                                  <p className="text-gray-500 text-[11px] leading-snug">{n.message}</p>
                                  <span className="text-[9px] text-gray-300 block">
                                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Active user info & Logout */}
                  <div className="flex items-center gap-2.5 bg-gray-50/70 hover:bg-gray-100/50 p-1.5 rounded-2xl border border-gray-100 transition-all">
                    <img
                      src={currentUser.photoUrl}
                      alt={currentUser.displayName}
                      className="w-8 h-8 rounded-full border border-white shadow-xs bg-white shrink-0"
                    />
                    <div className="hidden sm:block text-left max-w-[120px]">
                      <span className="text-xs font-bold text-gray-950 block leading-tight truncate">
                        {currentUser.displayName}
                      </span>
                      <span className="text-[9px] text-indigo-600 font-semibold block leading-none capitalize mt-0.5">
                        {currentUser.role.replace('_', ' ')}
                      </span>
                    </div>
                    
                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      title="Logout Session"
                      className="text-gray-400 hover:text-red-600 p-1 rounded-lg hover:bg-red-50/60 transition-colors ml-1 cursor-pointer shrink-0"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              </div>
            </div>
          </nav>

          {/* 3. WHITE-LABEL BANNER COVER HERO */}
          {activeTab === 'explore' && (
            <div className="relative bg-slate-900 text-white overflow-hidden py-14 px-4 sm:px-6 lg:px-8 border-b border-gray-100">
              {/* Custom Banner background overlay from White-Label Settings */}
              <div className="absolute inset-0 opacity-20">
                <img
                  src={activeTenant.bannerUrl}
                  alt={activeTenant.name}
                  className="w-full h-full object-cover filter blur-xs"
                />
              </div>

              <div className="relative max-w-4xl mx-auto text-center space-y-3.5">
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border text-white"
                  style={{ borderColor: activeTenant.themeColor }}
                >
                  <Sparkles className="w-3 h-3 text-yellow-300" />
                  Pi Mainnet Secure Sub-marketplace
                </span>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                  {activeTenant.seoTitle}
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm max-w-xl mx-auto leading-relaxed">
                  {activeTenant.seoDescription}
                </p>
                
                {/* Quick Directory Mode vs Marketplace Mode Indicator cards */}
                <div className="flex justify-center gap-4 pt-4 text-xs">
                  <div className="bg-black/50 backdrop-blur-xs px-4 py-2.5 rounded-xl border border-white/5 flex items-center gap-2 text-left">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    <div>
                      <span className="font-bold block text-white text-[10px]">Directory mode enabled</span>
                      <span className="text-slate-400 text-[9px]">Discover and call contractors</span>
                    </div>
                  </div>
                  <div className="bg-black/50 backdrop-blur-xs px-4 py-2.5 rounded-xl border border-white/5 flex items-center gap-2 text-left">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    <div>
                      <span className="font-bold block text-white text-[10px]">Marketplace mode enabled</span>
                      <span className="text-slate-400 text-[9px]">Post jobs & manage milestone proposals</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MOBILE NAVIGATION BAR (Shown only on small screens) */}
          <div className="md:hidden bg-white border-t border-gray-100 flex justify-around py-2.5 text-[10px] font-bold text-gray-500 sticky bottom-0 z-30 shadow-md">
            <button
              onClick={() => setActiveTab('explore')}
              className={`flex flex-col items-center gap-1 ${activeTab === 'explore' ? 'text-gray-900' : ''}`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Explore</span>
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-gray-900' : ''}`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('chat');
                setSelectedConversationId(undefined);
              }}
              className={`flex flex-col items-center gap-1 relative ${activeTab === 'chat' ? 'text-gray-900' : ''}`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Chats</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-gray-900' : ''}`}
            >
              <User className="w-4 h-4" />
              <span>Profile</span>
            </button>
          </div>

          {/* 4. MAIN WORKSPACE CHASSIS */}
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {activeTab === 'explore' && (
              <MarketplaceDirectory
                currentUser={currentUser}
                currentTenant={activeTenant}
                allProfiles={profiles}
                allJobs={jobs}
                allListings={listings}
                allApplications={applications}
                allReviews={reviews}
                onAddApplication={handleAddApplication}
                onInitiateChat={handleInitiateChat}
              />
            )}

            {activeTab === 'dashboard' && (
              <RoleDashboards
                currentUser={currentUser}
                currentTenant={activeTenant}
                allTenants={tenants}
                onUpdateTenant={handleUpdateTenant} // partner updating tenant brand
                onAddTenant={handleAddTenant}
                allJobs={jobs}
                allListings={listings}
                allApplications={applications}
                allReviews={reviews}
                allProfiles={profiles}
                onAddJob={handleAddJob}
                onAddListing={handleAddListing}
                onUpdateJobStatus={handleUpdateJobStatus}
                onRespondToApplication={handleRespondToApplication}
                onAddReview={handleAddReview}
                onToggleTenantStatus={handleToggleTenantStatus}
                onAddGlobalCategory={handleAddGlobalCategory}
                onInitiateChat={handleInitiateChat}
              />
            )}

            {activeTab === 'chat' && (
              <ChatMessenger
                currentUser={currentUser}
                currentTenantId={activeTenantId}
                conversations={conversations}
                messages={messages}
                profiles={profiles}
                onSendMessage={handleSendMessage}
                selectedConversationId={selectedConversationId}
                onSelectConversation={setSelectedConversationId}
                allJobs={jobs}
                allListings={listings}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileManagement
                profile={currentUser}
                allReviews={reviews}
                allProfiles={profiles}
                onUpdateProfile={handleUpdateProfile}
                isOwnProfile={true}
              />
            )}
          </main>
        </>
      ) : (
        <AuthModal
          onLogin={(user) => {
            // Persist registered custom profile to App profiles database
            const exists = profiles.some((p) => p.id === user.id || p.username === user.username);
            if (!exists) {
              setProfiles((prev) => [...prev, user]);
            }
            setCurrentUser(user);
          }}
          onPiLogin={(pUser) => {
            setPiUser(pUser);
            // Check if there is an existing profile for this Pioneer
            const existingProfile = profiles.find(
              (p) => p.id === pUser.uid || p.username === pUser.username
            );
            if (existingProfile) {
              setCurrentUser(existingProfile);
            } else {
              // Create a brand new Pioneer profile
              const newProfile: UserProfile = {
                id: pUser.uid,
                tenantId: activeTenantId,
                role: 'client', // Default role for newly authenticated Pioneers
                username: pUser.username,
                displayName: `Pioneer (${pUser.username})`,
                photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${pUser.username}`,
                bio: 'Authenticated Pi Network Pioneer.',
                phone: '',
                email: `${pUser.username}@pinetwork.com`,
                location: {
                  country: 'United States',
                  state: 'California',
                  district: 'SF Bay Area',
                  city: 'San Francisco',
                  latitude: 37.7749,
                  longitude: -122.4194,
                },
                createdAt: new Date().toISOString(),
                clientProfile: {
                  savedProviderIds: [],
                },
              };
              setProfiles((prev) => [...prev, newProfile]);
              setCurrentUser(newProfile);
            }
          }}
          currentTenantId={activeTenantId}
          onAddTenant={handleAddTenant}
        />
      )}

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-100 py-6 mt-12 text-center text-xs text-gray-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-1">
          <p className="font-semibold text-gray-500">
            © {new Date().getFullYear()} Work Hub Pi • SaaS Decentralized Platform
          </p>
          <p className="max-w-md mx-auto leading-relaxed">
            All white-label nodes operate secure sandboxed multi-tenant databases. Future updates can link real Pi Mainnet blockchain wallets seamlessly.
          </p>
        </div>
      </footer>

    </div>
  );
}

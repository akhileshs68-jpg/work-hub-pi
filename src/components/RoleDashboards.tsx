/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Tenant, UserProfile, Job, ServiceListing, JobApplication, Review, Notification } from '../types';
import { ALL_CATEGORIES, DIGITAL_CATEGORIES, LOCAL_CATEGORIES } from '../data';
import { BarChart3, Users, Briefcase, FileSpreadsheet, Settings, Palette, Eye, CheckCircle2, ShieldAlert, PlusCircle, Star, ThumbsUp, Send, Trash2, Edit2, Volume2, ShieldCheck, Check, X, FileText, Globe } from 'lucide-react';
import IntegrationsDashboard from './IntegrationsDashboard';

interface RoleDashboardsProps {
  currentUser: UserProfile;
  currentTenant: Tenant;
  allTenants: Tenant[];
  onUpdateTenant: (updated: Tenant) => void;
  onAddTenant: (newTenant: Tenant) => void;
  allJobs: Job[];
  allListings: ServiceListing[];
  allApplications: JobApplication[];
  allReviews: Review[];
  allProfiles: UserProfile[];
  onAddJob: (job: Job) => void;
  onAddListing: (listing: ServiceListing) => void;
  onUpdateJobStatus: (jobId: string, status: 'Open' | 'InProgress' | 'Completed' | 'Closed') => void;
  onRespondToApplication: (appId: string, status: 'Accepted' | 'Rejected') => void;
  onAddReview: (review: Review) => void;
  onToggleTenantStatus: (tenantId: string) => void;
  onAddGlobalCategory: (cat: string) => void;
  onInitiateChat: (recipientId: string, relatedJobId?: string) => void;
}

export default function RoleDashboards({
  currentUser,
  currentTenant,
  allTenants,
  onUpdateTenant,
  onAddTenant,
  allJobs,
  allListings,
  allApplications,
  allReviews,
  allProfiles,
  onAddJob,
  onAddListing,
  onUpdateJobStatus,
  onRespondToApplication,
  onAddReview,
  onToggleTenantStatus,
  onAddGlobalCategory,
  onInitiateChat,
}: RoleDashboardsProps) {
  
  // Tab states for different dashboards
  const [activeAdminTab, setActiveAdminTab] = useState<'analytics' | 'tenants' | 'categories' | 'integrations'>('analytics');
  const [activePartnerTab, setActivePartnerTab] = useState<'analytics' | 'white-label' | 'moderation' | 'integrations'>('analytics');
  
  // Forms & Modal states
  const [newTenantName, setNewTenantName] = useState('');
  const [newTenantTagline, setNewTenantTagline] = useState('');
  const [newTenantColor, setNewTenantColor] = useState('#6366F1');
  const [newCategoryName, setNewCategoryName] = useState('');

  // Brand Edit States (Partner Admin)
  const [brandLogo, setBrandLogo] = useState(currentTenant.logo);
  const [brandTagline, setBrandTagline] = useState(currentTenant.tagline);
  const [brandColor, setBrandColor] = useState(currentTenant.themeColor);
  const [brandBanner, setBrandBanner] = useState(currentTenant.bannerUrl);
  const [brandSeoTitle, setBrandSeoTitle] = useState(currentTenant.seoTitle);
  const [brandSeoDesc, setBrandSeoDesc] = useState(currentTenant.seoDescription);
  const [brandEmail, setBrandEmail] = useState(currentTenant.contactEmail);
  const [brandPhone, setBrandPhone] = useState(currentTenant.contactPhone);
  const [brandAddress, setBrandAddress] = useState(currentTenant.contactAddress);

  // Client Post Job Form
  const [showPostJob, setShowPostJob] = useState(false);
  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [jobCat, setJobCat] = useState(ALL_CATEGORIES[0]);
  const [jobType, setJobType] = useState<'digital' | 'local'>('digital');
  const [jobCity, setJobCity] = useState(currentUser.location.city);
  const [jobBudget, setJobBudget] = useState(25);
  const [jobVisibility, setJobVisibility] = useState<'Local' | 'Global'>('Global');

  // Provider Post Listing Form
  const [showPostListing, setShowPostListing] = useState(false);
  const [listTitle, setListTitle] = useState('');
  const [listDesc, setListDesc] = useState('');
  const [listCat, setListCat] = useState(ALL_CATEGORIES[0]);
  const [listType, setListType] = useState<'digital' | 'local'>('digital');
  const [listPrice, setListPrice] = useState(15);
  const [listVisibility, setListVisibility] = useState<'Local' | 'Global'>('Global');

  // Client Review Modal
  const [activeReviewJobId, setActiveReviewJobId] = useState<string | null>(null);
  const [activeReviewProviderId, setActiveReviewProviderId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Stats selectors
  const tenantJobs = allJobs.filter((j) => j.tenantId === currentTenant.id);
  const tenantListings = allListings.filter((l) => l.tenantId === currentTenant.id);
  const tenantUsers = allProfiles.filter((p) => p.tenantId === currentTenant.id);

  // ---------------------------------------------------------------------------
  // SUPER ADMIN DASHBOARD
  // ---------------------------------------------------------------------------
  const renderSuperAdmin = () => {
    const handleCreateTenant = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newTenantName || !newTenantTagline) return;
      const id = `tenant-${newTenantName.toLowerCase().trim().replace(/\s+/g, '-')}`;
      const newT: Tenant = {
        id,
        name: newTenantName,
        subdomain: `${newTenantName.toLowerCase().trim().replace(/\s+/g, '')}.workhubpi.com`,
        logo: '💼',
        tagline: newTenantTagline,
        themeColor: newTenantColor,
        bannerUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80',
        seoTitle: `${newTenantName} Marketplace`,
        seoDescription: `SaaS Marketplace powered by Work Hub Pi.`,
        contactEmail: `admin@${newTenantName.toLowerCase().trim().replace(/\s+/g, '')}.com`,
        contactPhone: '+1 (555) 012-3456',
        contactAddress: '100 Blockchain Blvd, Austin, TX',
        socials: {},
        isActive: true,
      };
      onAddTenant(newT);
      setNewTenantName('');
      setNewTenantTagline('');
      alert(`Successfully provisioned new white-label tenant: "${newTenantName}"!`);
    };

    const handleCreateCategory = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newCategoryName.trim()) return;
      onAddGlobalCategory(newCategoryName.trim());
      setNewCategoryName('');
      alert(`Added new global category: "${newCategoryName}"`);
    };

    return (
      <div className="space-y-6">
        {/* Top welcome */}
        <div className="bg-[#2E1065] text-white rounded-2xl p-6 shadow-md flex justify-between items-center flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Super Admin Global Control Tower</h2>
            <p className="text-purple-200 text-xs mt-1">
              Oversee multi-tenant network, approve white-label portals, and analyze system performance.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveAdminTab('analytics')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeAdminTab === 'analytics' ? 'bg-yellow-400 text-purple-950 font-bold' : 'hover:bg-white/10 text-white'
              }`}
            >
              📊 Analytics
            </button>
            <button
              onClick={() => setActiveAdminTab('tenants')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeAdminTab === 'tenants' ? 'bg-yellow-400 text-purple-950 font-bold' : 'hover:bg-white/10 text-white'
              }`}
            >
              🏢 Manage Tenants ({allTenants.length})
            </button>
            <button
              onClick={() => setActiveAdminTab('categories')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeAdminTab === 'categories' ? 'bg-yellow-400 text-purple-950 font-bold' : 'hover:bg-white/10 text-white'
              }`}
            >
              📁 Global Categories
            </button>
            <button
              onClick={() => setActiveAdminTab('integrations')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeAdminTab === 'integrations' ? 'bg-yellow-400 text-purple-950 font-bold' : 'hover:bg-white/10 text-white'
              }`}
            >
              🔌 Integrations & SDK
            </button>
          </div>
        </div>

        {activeAdminTab === 'analytics' && (
          <>
            {/* Global system metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total SaaS Tenants</span>
                <div className="text-2xl font-black text-gray-950">{allTenants.length}</div>
                <div className="text-[10px] text-emerald-600 font-semibold">100% cloud availability</div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Total Registered Users</span>
                <div className="text-2xl font-black text-gray-950">{allProfiles.length}</div>
                <div className="text-[10px] text-indigo-600 font-semibold">Active Pi Wallets</div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Active Job Escrows</span>
                <div className="text-2xl font-black text-gray-950">{allJobs.length}</div>
                <div className="text-[10px] text-gray-400">Total jobs across all nodes</div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Mock Pi Vol. Transacted</span>
                <div className="text-2xl font-black text-indigo-600">4,825 π</div>
                <div className="text-[10px] text-indigo-500 font-bold">Future Mainnet Ready</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Provision Tenant Form */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                  <PlusCircle className="w-5 h-5 text-indigo-600" />
                  Instant White-Label SaaS Provisioning
                </h3>
                <p className="text-xs text-gray-500">
                  Instantly launch an isolated, fully branded freelancer or directory sub-marketplace with zero-downtime.
                </p>

                <form onSubmit={handleCreateTenant} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-gray-500 font-bold mb-1">Marketplace / Partner Brand Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pi Cleaners, Austin Freelancers"
                      value={newTenantName}
                      onChange={(e) => setNewTenantName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 font-bold mb-1">Hero Tagline / Purpose</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Find premium local carpenters & roofers"
                      value={newTenantTagline}
                      onChange={(e) => setNewTenantTagline(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-500 font-bold mb-1">Default Accent Branding Color</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={newTenantColor}
                        onChange={(e) => setNewTenantColor(e.target.value)}
                        className="w-10 h-8 rounded border cursor-pointer p-0 bg-transparent"
                      />
                      <input
                        type="text"
                        value={newTenantColor}
                        onChange={(e) => setNewTenantColor(e.target.value)}
                        className="px-3 border border-gray-200 rounded-lg flex-1 text-xs"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#2E1065] hover:bg-[#200A47] text-white text-xs font-bold rounded-xl transition-all shadow"
                  >
                    🚀 Provision & Deploy Tenant Node
                  </button>
                </form>
              </div>

              {/* Security Audit details */}
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
                <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  SaaS Tenant Security Isolation
                </h3>
                <p className="text-xs text-gray-500">
                  Security rules guarantee that all listings, applications, profiles, and chat messages carry unique <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-purple-600">tenantId</code> scopes, completely eliminating cross-tenant leakage.
                </p>

                <div className="space-y-2.5 bg-gray-50 p-4 rounded-xl text-[11px] text-gray-600">
                  <div className="flex items-center gap-2 text-indigo-900 font-bold">
                    <ShieldCheck className="w-4.5 h-4.5 text-emerald-600" />
                    Database Security Rules Checked
                  </div>
                  <p>
                    All document updates verify the matching tenant context. Sub-marketplace domains apply CSS configurations based on the tenant settings dynamically.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}

        {activeAdminTab === 'tenants' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm">Active White-Label Tenants Network</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-bold">
                    <th className="py-2.5">Tenant Brand</th>
                    <th>Subdomain</th>
                    <th>Color theme</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-gray-700">
                  {allTenants.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50/50">
                      <td className="py-3 flex items-center gap-2 font-semibold text-gray-950">
                        <span className="text-xl">{t.logo}</span>
                        {t.name}
                      </td>
                      <td className="font-mono text-[11px] text-gray-500">{t.subdomain}</td>
                      <td>
                        <span className="flex items-center gap-1.5 font-medium">
                          <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: t.themeColor }} />
                          {t.themeColor}
                        </span>
                      </td>
                      <td>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                        }`}>
                          {t.isActive ? 'ACTIVE' : 'SUSPENDED'}
                        </span>
                      </td>
                      <td className="text-right">
                        <button
                          onClick={() => onToggleTenantStatus(t.id)}
                          className={`px-2.5 py-1 text-[10px] font-bold rounded-lg border transition-all ${
                            t.isActive
                              ? 'bg-red-50 text-red-700 border-red-100 hover:bg-red-100'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                          }`}
                        >
                          {t.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeAdminTab === 'categories' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
              <h3 className="font-semibold text-gray-900 text-sm">Add New Global Category</h3>
              <form onSubmit={handleCreateCategory} className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. Smart Contract Developer, Electric Bike Repair"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all"
                >
                  Add Category
                </button>
              </form>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
              <h3 className="font-semibold text-gray-900 text-sm">Global System Categories</h3>
              <div className="flex flex-wrap gap-1.5">
                {ALL_CATEGORIES.map((cat) => (
                  <span
                    key={cat}
                    className="bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-xl text-[11px] text-gray-600 font-medium"
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeAdminTab === 'integrations' && (
          <IntegrationsDashboard currentTenantId={currentTenant.id} />
        )}
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // PARTNER ADMIN DASHBOARD
  // ---------------------------------------------------------------------------
  const renderPartnerAdmin = () => {
    const handleSaveBrand = (e: React.FormEvent) => {
      e.preventDefault();
      const updated: Tenant = {
        ...currentTenant,
        logo: brandLogo,
        tagline: brandTagline,
        themeColor: brandColor,
        bannerUrl: brandBanner,
        seoTitle: brandSeoTitle,
        seoDescription: brandSeoDesc,
        contactEmail: brandEmail,
        contactPhone: brandPhone,
        contactAddress: brandAddress,
      };
      onUpdateTenant(updated);
      alert('Successfully customized brand settings! All modifications applied immediately.');
    };

    return (
      <div className="space-y-6">
        {!currentTenant.isActive && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-5 shadow-sm space-y-2 text-xs">
            <h4 className="font-extrabold text-sm flex items-center gap-1.5 text-amber-950">
              ⚠️ Tenant Registration Pending Approval!
            </h4>
            <p className="leading-relaxed">
              Your white-label sub-marketplace node (<span className="font-bold">{currentTenant.name}</span>) is currently queued for Super Admin activation.
            </p>
            <p className="font-semibold text-amber-950 bg-amber-100/50 p-3 rounded-xl inline-block border border-amber-200">
              💡 SaaS Sandbox Testing Tip: Use the "Active Persona" switcher in the top black development rail to switch to the "Super Admin" persona. Then click on the "Manage Tenants" tab to approve and activate this node instantly!
            </p>
          </div>
        )}
        <div className="bg-gradient-to-r from-[#1E293B] to-[#0F172A] text-white rounded-2xl p-6 shadow-md flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{currentTenant.logo}</span>
            <div>
              <h2 className="text-lg font-bold tracking-tight">{currentTenant.name} Portal</h2>
              <p className="text-slate-300 text-xs mt-1">
                Custom brand accent, local directory moderation, and subdomain configurations.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setActivePartnerTab('analytics')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activePartnerTab === 'analytics' ? 'bg-[#38BDF8] text-slate-950 font-bold' : 'hover:bg-white/10 text-white'
              }`}
            >
              📊 Tenant Stats
            </button>
            <button
              onClick={() => setActivePartnerTab('white-label')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activePartnerTab === 'white-label' ? 'bg-[#38BDF8] text-slate-950 font-bold' : 'hover:bg-white/10 text-white'
              }`}
            >
              🎨 Customize Brand
            </button>
            <button
              onClick={() => setActivePartnerTab('moderation')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activePartnerTab === 'moderation' ? 'bg-[#38BDF8] text-slate-950 font-bold' : 'hover:bg-white/10 text-white'
              }`}
            >
              🛠️ Moderate Listings
            </button>
            <button
              onClick={() => setActivePartnerTab('integrations')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activePartnerTab === 'integrations' ? 'bg-[#38BDF8] text-slate-950 font-bold' : 'hover:bg-white/10 text-white'
              }`}
            >
              🔌 Integrations
            </button>
          </div>
        </div>

        {activePartnerTab === 'analytics' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left Column stats details */}
            <div className="md:col-span-1 space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Local Gigs</span>
                <div className="text-2xl font-black text-gray-950">{tenantJobs.length}</div>
                <div className="text-[10px] text-gray-400">Total client jobs posted on node</div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Contractor Listings</span>
                <div className="text-2xl font-black text-gray-950">{tenantListings.length}</div>
                <div className="text-[10px] text-gray-400">Total listings in Directory mode</div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Tenant Registrations</span>
                <div className="text-2xl font-black text-indigo-600">{tenantUsers.length} Users</div>
                <div className="text-[10px] text-emerald-600">Secure isolated data storage</div>
              </div>
            </div>

            {/* Right Column details */}
            <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
              <h3 className="font-semibold text-gray-900 text-sm">Tenant Node Information</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                You are currently administering <span className="font-bold text-gray-900">{currentTenant.name}</span>. Every user, application, review, and chat transaction completed within this visual skin is restricted exclusively to your database tenant workspace.
              </p>

              <div className="bg-gray-50 rounded-xl p-4 space-y-3.5 text-xs text-gray-600">
                <div className="flex justify-between border-b border-gray-200/50 pb-2">
                  <span className="font-semibold text-gray-800">SEO Keyword Status</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Google Crawling Ready
                  </span>
                </div>
                <div className="flex justify-between border-b border-gray-200/50 pb-2">
                  <span className="font-semibold text-gray-800">Subdomain Mapping</span>
                  <span className="font-mono text-indigo-600">{currentTenant.subdomain}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold text-gray-800">Custom Domain</span>
                  <span className="text-gray-400 font-semibold flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5" /> Premium Setup Required
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activePartnerTab === 'white-label' && (
          <form onSubmit={handleSaveBrand} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
            <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              <Palette className="w-5 h-5 text-indigo-600" />
              Customize Marketplace Branding Aesthetics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-1">Logo Icon / Emoji</label>
                <input
                  type="text"
                  value={brandLogo}
                  onChange={(e) => setBrandLogo(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-1">Branding Theme Color (HEX)</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-10 h-8 rounded border cursor-pointer bg-transparent p-0"
                  />
                  <input
                    type="text"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="flex-1 px-3 border border-gray-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-1">Marketplace Hero Tagline</label>
                <input
                  type="text"
                  value={brandTagline}
                  onChange={(e) => setBrandTagline(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-1">Banner Image URL</label>
                <input
                  type="text"
                  value={brandBanner}
                  onChange={(e) => setBrandBanner(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-1">SEO Page Title</label>
                <input
                  type="text"
                  value={brandSeoTitle}
                  onChange={(e) => setBrandSeoTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-1">SEO Description Meta</label>
                <input
                  type="text"
                  value={brandSeoDesc}
                  onChange={(e) => setBrandSeoDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-1">Contact Email Address</label>
                <input
                  type="email"
                  value={brandEmail}
                  onChange={(e) => setBrandEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-1">Contact Phone Number</label>
                <input
                  type="text"
                  value={brandPhone}
                  onChange={(e) => setBrandPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-1">Office / Support Address</label>
                <input
                  type="text"
                  value={brandAddress}
                  onChange={(e) => setBrandAddress(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold rounded-xl transition-all shadow-md"
            >
              💾 Save White-Label Skin Updates
            </button>
          </form>
        )}

        {activePartnerTab === 'moderation' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm">Moderate Local Service Listings & Gigs</h3>
            <div className="overflow-x-auto text-xs">
              {tenantListings.length === 0 ? (
                <p className="text-gray-400 italic">No directory listings posted on this tenant.</p>
              ) : (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-bold">
                      <th className="py-2.5">Title</th>
                      <th>Category</th>
                      <th>Contractor</th>
                      <th>Price</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50 text-gray-700">
                    {tenantListings.map((l) => {
                      const contractor = allProfiles.find((p) => p.id === l.providerId);
                      return (
                        <tr key={l.id} className="hover:bg-gray-50/50">
                          <td className="py-3 font-semibold text-gray-950">{l.title}</td>
                          <td className="font-medium text-gray-500">{l.category}</td>
                          <td>{contractor?.displayName || 'Unknown'}</td>
                          <td className="font-black text-indigo-600">{l.price} Pi / hr</td>
                          <td>
                            <span className="bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded text-[10px]">
                              Approved
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activePartnerTab === 'integrations' && (
          <IntegrationsDashboard currentTenantId={currentTenant.id} />
        )}
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // CLIENT DASHBOARD
  // ---------------------------------------------------------------------------
  const renderClient = () => {
    const handlePostJob = (e: React.FormEvent) => {
      e.preventDefault();
      if (!jobTitle || !jobDesc) return;
      
      const newJob: Job = {
        id: `job-custom-${Date.now()}`,
        tenantId: currentTenant.id,
        clientId: currentUser.id,
        title: jobTitle,
        description: jobDesc,
        category: jobCat,
        serviceType: jobType,
        country: currentUser.location.country,
        state: currentUser.location.state,
        district: currentUser.location.district,
        city: jobCity,
        latitude: currentUser.location.latitude,
        longitude: currentUser.location.longitude,
        visibility: jobVisibility,
        budget: jobBudget,
        status: 'Open',
        createdAt: new Date().toISOString(),
      };
      
      onAddJob(newJob);
      setJobTitle('');
      setJobDesc('');
      setShowPostJob(false);
      alert('Your job requirements have been submitted successfully to the directory node!');
    };

    const handleWriteReview = (e: React.FormEvent) => {
      e.preventDefault();
      if (!activeReviewJobId || !activeReviewProviderId) return;

      const newRev: Review = {
        id: `rev-${Date.now()}`,
        tenantId: currentTenant.id,
        jobId: activeReviewJobId,
        reviewerId: currentUser.id,
        revieweeId: activeReviewProviderId,
        rating: reviewRating,
        comment: reviewComment,
        createdAt: new Date().toISOString(),
      };

      onAddReview(newRev);
      onUpdateJobStatus(activeReviewJobId, 'Completed');
      
      setActiveReviewJobId(null);
      setActiveReviewProviderId(null);
      setReviewComment('');
      alert('Review published successfully! Service provider cumulative ratings updated.');
    };

    const clientJobs = allJobs.filter((j) => j.clientId === currentUser.id && j.tenantId === currentTenant.id);

    return (
      <div className="space-y-6">
        
        {/* Top welcome */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex justify-between items-center flex-wrap gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Client Hub: Manage Active Gigs</h2>
            <p className="text-gray-400 text-xs">
              Post specialized job requirements, evaluate bids, and coordinate contractor delivery securely.
            </p>
          </div>
          <button
            onClick={() => setShowPostJob(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#4F46E5] hover:bg-indigo-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-indigo-600/10 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Post Job Requirement
          </button>
        </div>

        {/* Post Job Modal Simulation */}
        {showPostJob && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-lg w-full p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-500" />
                  Post Specialized Job Post
                </h3>
                <button onClick={() => setShowPostJob(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePostJob} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-500 font-bold mb-1">Requirement Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Install AC Repair Unit in Office, Web Application with Recharts"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-500 font-bold mb-1">Detailed Technical Description</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe milestones, required skill level, and delivery timeline..."
                    value={jobDesc}
                    onChange={(e) => setJobDesc(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-500 font-bold mb-1">Service Type</label>
                    <select
                      value={jobType}
                      onChange={(e) => {
                        setJobType(e.target.value as 'digital' | 'local');
                        setJobCat(e.target.value === 'digital' ? DIGITAL_CATEGORIES[0] : LOCAL_CATEGORIES[0]);
                      }}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none bg-white"
                    >
                      <option value="digital">Digital Freelancing</option>
                      <option value="local">Local Handyman/Service</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-500 font-bold mb-1">Category</label>
                    <select
                      value={jobCat}
                      onChange={(e) => setJobCat(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none bg-white"
                    >
                      {(jobType === 'digital' ? DIGITAL_CATEGORIES : LOCAL_CATEGORIES).map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-gray-500 font-bold mb-1">Target City</label>
                    <input
                      type="text"
                      required
                      value={jobCity}
                      onChange={(e) => setJobCity(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-500 font-bold mb-1">Budget Amount (Pi)</label>
                    <input
                      type="number"
                      required
                      value={jobBudget}
                      onChange={(e) => setJobBudget(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-500 font-bold mb-1">Visibility Scope</label>
                    <select
                      value={jobVisibility}
                      onChange={(e) => setJobVisibility(e.target.value as 'Local' | 'Global')}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none bg-white"
                    >
                      <option value="Global">Global Visible</option>
                      <option value="Local">Local City Only</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow transition-all"
                >
                  Publish Job to Marketplace
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Review Modal Simulation */}
        {activeReviewJobId && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full p-6 space-y-4">
              <h3 className="font-bold text-gray-900 text-sm">Publish Service Quality Review</h3>
              
              <form onSubmit={handleWriteReview} className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-2">Overall Rating (1 to 5 Stars)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className={`p-1 hover:scale-110 transition-transform ${
                          star <= reviewRating ? 'text-yellow-400' : 'text-gray-300'
                        }`}
                      >
                        <Star className="w-8 h-8 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 font-bold uppercase tracking-wider text-[10px] mb-1">Written Feedback Comment</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Describe their communication, speed of delivery, and standards of output..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveReviewJobId(null);
                      setActiveReviewProviderId(null);
                    }}
                    className="flex-1 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#4F46E5] text-white rounded-xl hover:bg-indigo-700 text-xs font-semibold"
                  >
                    Publish Review
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Client Gigs listing */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Active Job list */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm">Your Posted Jobs ({clientJobs.length})</h3>
            
            {clientJobs.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-400">
                <Briefcase className="w-8 h-8 mx-auto mb-2 text-gray-300 stroke-[1.5]" />
                <p className="text-xs">No active requirements posted yet.</p>
                <button
                  onClick={() => setShowPostJob(true)}
                  className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg"
                >
                  Post Your First Requirement
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {clientJobs.map((j) => {
                  const jobApps = allApplications.filter((a) => a.jobId === j.id);
                  return (
                    <div key={j.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
                      <div className="flex justify-between items-start flex-wrap gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase ${
                              j.serviceType === 'digital' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
                            }`}>
                              {j.serviceType}
                            </span>
                            <span className="text-[10px] text-gray-400 font-semibold">• {j.category}</span>
                          </div>
                          <h4 className="font-bold text-gray-950 text-xs mt-1">{j.title}</h4>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black text-indigo-600 block">{j.budget} Pi</span>
                          <span className={`inline-block px-1.5 py-0.2 rounded-full text-[9px] font-extrabold border uppercase mt-1 ${
                            j.status === 'Open'
                              ? 'bg-blue-50 text-blue-700 border-blue-100'
                              : j.status === 'InProgress'
                              ? 'bg-amber-50 text-amber-700 border-amber-100'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          }`}>
                            {j.status}
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-gray-500 leading-relaxed truncate">{j.description}</p>

                      {/* Job-specific Actions based on status */}
                      <div className="pt-2 border-t border-gray-50 flex justify-between items-center flex-wrap gap-2">
                        <span className="text-[10px] text-gray-400 font-medium">
                          Created {new Date(j.createdAt).toLocaleDateString()}
                        </span>

                        {j.status === 'InProgress' && (
                          <button
                            onClick={() => {
                              // Find provider of active job (from accepted applications)
                              const acceptedApp = jobApps.find((a) => a.status === 'Accepted');
                              if (acceptedApp) {
                                setActiveReviewJobId(j.id);
                                setActiveReviewProviderId(acceptedApp.providerId);
                              } else {
                                onUpdateJobStatus(j.id, 'Completed');
                              }
                            }}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg shadow-xs"
                          >
                            Mark Complete & Write Review
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Incoming Job applications */}
          <div className="md:col-span-1 space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm">Review Proposals Received</h3>
            
            {(() => {
              // Filter applications matching client posted jobs
              const clientJobIds = clientJobs.map((j) => j.id);
              const incomingApps = allApplications.filter((a) => clientJobIds.includes(a.jobId) && a.status === 'Pending');

              if (incomingApps.length === 0) {
                return (
                  <p className="text-xs text-gray-400 bg-white rounded-2xl border border-gray-100 p-5 text-center italic">
                    No proposals currently pending review.
                  </p>
                );
              }

              return (
                <div className="space-y-3">
                  {incomingApps.map((app) => {
                    const provider = allProfiles.find((p) => p.id === app.providerId);
                    const job = allJobs.find((j) => j.id === app.jobId);
                    return (
                      <div key={app.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={provider?.photoUrl}
                            alt={provider?.displayName}
                            className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100"
                          />
                          <div>
                            <span className="text-xs font-bold text-gray-900 block">{provider?.displayName}</span>
                            <span className="text-[9px] text-gray-400 font-mono flex items-center gap-1">
                              ⭐ {provider?.providerProfile?.rating || '5.0'} • @{provider?.username}
                            </span>
                          </div>
                        </div>

                        <div className="bg-gray-50 rounded-xl p-2.5 text-[11px] text-gray-600">
                          <span className="font-bold text-[10px] text-indigo-900 block mb-1 truncate">
                            For: {job?.title}
                          </span>
                          <p className="italic leading-relaxed">"{app.coverMessage}"</p>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => onRespondToApplication(app.id, 'Rejected')}
                            className="flex-1 py-1.5 border border-red-200 text-red-700 hover:bg-red-50 text-[10px] font-bold rounded-lg uppercase"
                          >
                            Decline
                          </button>
                          <button
                            onClick={() => {
                              onRespondToApplication(app.id, 'Accepted');
                              if (provider) {
                                // Spawns instant chat negotiation thread!
                                onInitiateChat(provider.id, app.jobId);
                                alert(`Proposal accepted! Secure chat channel established with ${provider.displayName}.`);
                              }
                            }}
                            className="flex-1 py-1.5 bg-[#4F46E5] hover:bg-indigo-700 text-white text-[10px] font-bold rounded-lg uppercase shadow-xs"
                          >
                            Accept & Chat
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>

        </div>
      </div>
    );
  };

  // ---------------------------------------------------------------------------
  // SERVICE PROVIDER DASHBOARD
  // ---------------------------------------------------------------------------
  const renderProvider = () => {
    const handlePostListing = (e: React.FormEvent) => {
      e.preventDefault();
      if (!listTitle || !listDesc) return;

      const newListing: ServiceListing = {
        id: `lst-custom-${Date.now()}`,
        tenantId: currentTenant.id,
        providerId: currentUser.id,
        title: listTitle,
        description: listDesc,
        category: listCat,
        serviceType: listType,
        country: currentUser.location.country,
        state: currentUser.location.state,
        district: currentUser.location.district,
        city: currentUser.location.city,
        latitude: currentUser.location.latitude,
        longitude: currentUser.location.longitude,
        visibility: listVisibility,
        price: listPrice,
        portfolioLinks: [],
        status: 'Active',
        createdAt: new Date().toISOString(),
      };

      onAddListing(newListing);
      setListTitle('');
      setListDesc('');
      setShowPostListing(false);
      alert('Your service directory listing has been published successfully! Clients can now view, Chat, or Direct Call you.');
    };

    const providerListings = allListings.filter((l) => l.providerId === currentUser.id && l.tenantId === currentTenant.id);
    const providerApps = allApplications.filter((a) => a.providerId === currentUser.id && a.tenantId === currentTenant.id);

    return (
      <div className="space-y-6">
        
        {/* Top Header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex justify-between items-center flex-wrap gap-4">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">Provider Gigs & Listings Panel</h2>
            <p className="text-gray-400 text-xs">
              List services in Directory mode or manage active bids in Marketplace mode.
            </p>
          </div>
          <button
            onClick={() => setShowPostListing(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all shadow-md shadow-emerald-600/10 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            Create Directory Listing
          </button>
        </div>

        {/* Create Listing Modal */}
        {showPostListing && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-lg w-full p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-500" />
                  Publish Directory Listing
                </h3>
                <button onClick={() => setShowPostListing(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePostListing} className="space-y-3 text-xs">
                <div>
                  <label className="block text-gray-500 font-bold mb-1">Service Listing Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Master Pipe Replacement, Custom React Dashboards"
                    value={listTitle}
                    onChange={(e) => setListTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-gray-500 font-bold mb-1">Service Description / What's Included</label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your credentials, standard milestones, and diagnostic policies..."
                    value={listDesc}
                    onChange={(e) => setListDesc(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-500 font-bold mb-1">Service Class</label>
                    <select
                      value={listType}
                      onChange={(e) => {
                        setListType(e.target.value as 'digital' | 'local');
                        setListCat(e.target.value === 'digital' ? DIGITAL_CATEGORIES[0] : LOCAL_CATEGORIES[0]);
                      }}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none bg-white"
                    >
                      <option value="digital">Digital Freelancing</option>
                      <option value="local">Local Handyman/Service</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-500 font-bold mb-1">Category</label>
                    <select
                      value={listCat}
                      onChange={(e) => setListCat(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none bg-white"
                    >
                      {(listType === 'digital' ? DIGITAL_CATEGORIES : LOCAL_CATEGORIES).map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-500 font-bold mb-1">Pricing Standard (Pi per hour/project)</label>
                    <input
                      type="number"
                      required
                      value={listPrice}
                      onChange={(e) => setListPrice(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-500 font-bold mb-1">Listing Visibility</label>
                    <select
                      value={listVisibility}
                      onChange={(e) => setListVisibility(e.target.value as 'Local' | 'Global')}
                      className="w-full px-3 py-1.5 border border-gray-200 rounded-lg focus:outline-none bg-white"
                    >
                      <option value="Global">Global Visible</option>
                      <option value="Local">Local City Only</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow transition-all"
                >
                  Publish Service to Directory
                </button>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Active Listings List */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm">Your Directory Listings ({providerListings.length})</h3>
            
            {providerListings.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-200 rounded-2xl p-8 text-center text-gray-400">
                <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300 stroke-[1.5]" />
                <p className="text-xs">No service directory listings published yet.</p>
                <button
                  onClick={() => setShowPostListing(true)}
                  className="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg"
                >
                  Add Your Service Profile
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {providerListings.map((list) => (
                  <div key={list.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700">
                            {list.serviceType}
                          </span>
                          <span className="text-[10px] text-gray-400 font-semibold">• {list.category}</span>
                        </div>
                        <h4 className="font-bold text-gray-950 text-xs mt-1">{list.title}</h4>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-black text-emerald-600 block">{list.price} Pi / hr</span>
                        <span className="text-[9px] bg-blue-50 text-blue-700 font-bold px-1.5 py-0.2 rounded border border-blue-100 block mt-1 uppercase">
                          {list.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-500 leading-relaxed truncate">{list.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submitted applications */}
          <div className="md:col-span-1 space-y-4">
            <h3 className="font-semibold text-gray-900 text-sm">Your Marketplace Bids ({providerApps.length})</h3>
            
            {providerApps.length === 0 ? (
              <p className="text-xs text-gray-400 bg-white rounded-2xl border border-gray-100 p-5 text-center italic">
                You haven't applied to any client job posts yet.
              </p>
            ) : (
              <div className="space-y-3">
                {providerApps.map((app) => {
                  const job = allJobs.find((j) => j.id === app.jobId);
                  return (
                    <div key={app.id} className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-3">
                      <div className="flex justify-between items-start">
                        <h4 className="text-xs font-bold text-gray-950 truncate max-w-[150px]">{job?.title}</h4>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border uppercase ${
                          app.status === 'Accepted'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                            : app.status === 'Rejected'
                            ? 'bg-red-50 text-red-700 border-red-100'
                            : 'bg-blue-50 text-blue-700 border-blue-100'
                        }`}>
                          {app.status}
                        </span>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-2.5 text-[11px] text-gray-600">
                        <span className="font-bold text-[10px] text-gray-400 block mb-1">Your Pitch:</span>
                        <p className="italic">"{app.coverMessage}"</p>
                      </div>

                      {app.status === 'Accepted' && (
                        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-2 text-[10px] rounded-lg font-medium flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          Bid accepted! Go to Chat menu to coordinate.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </div>
    );
  };

  // Switch dashboards based on current user role
  switch (currentUser.role) {
    case 'super_admin':
      return renderSuperAdmin();
    case 'partner_admin':
      return renderPartnerAdmin();
    case 'client':
      return renderClient();
    case 'provider':
      return renderProvider();
    default:
      return (
        <div className="bg-red-50 text-red-950 border border-red-200 p-4 rounded-xl text-xs flex gap-2">
          <ShieldAlert className="w-5 h-5" />
          <span>Unsupported profile role. Reset and select a valid Pi pioneer profile to test the SaaS core.</span>
        </div>
      );
  }
}

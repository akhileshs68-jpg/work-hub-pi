/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { INITIAL_PROFILES } from '../data';
import { LogIn, Key, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { piSdkService, PiUser } from '../services/piSdkService';

interface AuthModalProps {
  onLogin: (user: UserProfile) => void;
  onPiLogin: (piUser: PiUser) => void;
  currentTenantId: string;
  onAddTenant?: (newTenant: any) => void;
}

export default function AuthModal({ onLogin, onPiLogin, currentTenantId, onAddTenant }: AuthModalProps) {
  const [selectedUser, setSelectedUser] = useState<string>('usr-client-tech');
  const [customUsername, setCustomUsername] = useState('');
  const [customRole, setCustomRole] = useState<UserRole>('client');
  const [customDisplayName, setCustomDisplayName] = useState('');
  const [customCity, setCustomCity] = useState('San Francisco');
  const [customPhone, setCustomPhone] = useState('+1 (555) 555-0199');
  const [activeTab, setActiveTab] = useState<'sandbox' | 'custom'>('sandbox');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const handlePiLogin = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      console.log('[AuthModal] Initiating official Pi SDK user authentication...');
      const pUser = await piSdkService.authenticateUser();
      console.log('[AuthModal] Pi SDK authentication success. Pioneer authenticated:', pUser.username);
      onPiLogin(pUser);
    } catch (err: any) {
      console.error('[AuthModal] Native Pi auth failed:', err);
      setAuthError(err?.message || 'Authentication failed. Please make sure you are accessing this application inside the Pi Browser.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Partner admin registration extra states
  const [tenantName, setTenantName] = useState('');
  const [tenantTagline, setTenantTagline] = useState('');
  const [tenantSubdomain, setTenantSubdomain] = useState('');
  const [tenantColor, setTenantColor] = useState('#6366F1');

  // Filter profiles that belong to current tenant or are global/superadmin
  const eligibleProfiles = INITIAL_PROFILES.filter(
    (p) => p.role === 'super_admin' || p.tenantId === currentTenantId || !p.tenantId
  );

  const handleSandboxLogin = () => {
    const found = INITIAL_PROFILES.find((p) => p.id === selectedUser);
    if (found) {
      onLogin(found);
    }
  };

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUsername || !customDisplayName) return;

    const formattedUsername = customUsername.toLowerCase().trim().replace(/\s+/g, '_');
    
    // Auto-provision new Tenant brand if user is a Partner Admin
    let assignedTenantId = currentTenantId;
    if (customRole === 'partner_admin' && onAddTenant) {
      const subdomainSlug = tenantSubdomain.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      assignedTenantId = `tenant-${subdomainSlug || 'custom'}`;
      
      const newTenantObj = {
        id: assignedTenantId,
        name: tenantName || `${customDisplayName} Gigs`,
        subdomain: `${subdomainSlug || 'custom'}.workhubpi.com`,
        logo: '💼',
        tagline: tenantTagline || 'Exclusive partner sub-marketplace network',
        themeColor: tenantColor,
        bannerUrl: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80',
        seoTitle: `${tenantName || customDisplayName} Gigs`,
        seoDescription: `Find and book premium service providers on our secure decentralized sub-portal.`,
        contactEmail: `${formattedUsername}@${subdomainSlug || 'custom'}.com`,
        contactPhone: customPhone,
        contactAddress: `${customCity}, United States`,
        socials: {},
        isActive: false, // Starts as inactive, pending Super Admin approval! (Approval Workflow)
      };
      
      onAddTenant(newTenantObj);
    }

    const newProfile: UserProfile = {
      id: `usr-custom-${Date.now()}`,
      tenantId: customRole === 'super_admin' ? '' : assignedTenantId,
      role: customRole,
      username: formattedUsername,
      displayName: customDisplayName,
      photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${formattedUsername}`,
      bio: `Custom ${customRole.replace('_', ' ')} profile registered via Pi Sandbox.`,
      phone: customPhone,
      email: `${formattedUsername}@pinetwork.mock`,
      location: {
        country: 'United States',
        state: customCity === 'Austin' ? 'Texas' : 'California',
        district: customCity === 'Austin' ? 'Travis County' : 'SF Bay Area',
        city: customCity,
        latitude: customCity === 'Austin' ? 30.2672 : 37.7749,
        longitude: customCity === 'Austin' ? -97.7431 : -122.4194,
      },
      createdAt: new Date().toISOString(),
      ...(customRole === 'provider' && {
        providerProfile: {
          portfolioLinks: [],
          workSamples: [],
          categories: ['Web Development'],
          availability: 'Available',
          rating: 5.0,
          reviewCount: 0,
        },
      }),
      ...(customRole === 'client' && {
        clientProfile: {
          savedProviderIds: [],
        },
      }),
    };

    onLogin(newProfile);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-2xl">
        
        {/* Pi Brand Header */}
        <div className="bg-gradient-to-br from-[#4A1D96] to-[#2E1065] p-8 text-center text-white relative">
          <div className="absolute top-2 right-2 bg-yellow-500 text-yellow-950 font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-full tracking-wider">
            Pi Sandbox Enabled
          </div>
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-yellow-400 text-[#2E1065] text-4xl font-bold mb-3 shadow-md border-2 border-yellow-300">
            π
          </div>
          <h1 className="text-2xl font-bold font-sans tracking-tight">Work Hub Pi</h1>
          <p className="text-[#D8B4FE] text-xs mt-1">Multi-Tenant Decentralized Marketplace</p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-gray-100 bg-gray-50 text-sm">
          <button
            onClick={() => setActiveTab('sandbox')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTab === 'sandbox'
                ? 'bg-white text-[#4A1D96] border-b-2 border-[#4A1D96]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            🔑 Pi Sandbox Profiles
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-3 text-center font-medium transition-colors ${
              activeTab === 'custom'
                ? 'bg-white text-[#4A1D96] border-b-2 border-[#4A1D96]'
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            ✨ Register New Wallet
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'sandbox' ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 text-blue-900 rounded-xl p-3 text-xs flex gap-2.5 items-start">
                <AlertCircle className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
                <div>
                  <span className="font-semibold">SaaS Testing Notice:</span> Select any preset role below to log in instantly. Switch tenants in the top navigation to see custom white-label portals.
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Select Pi Account Profile
                </label>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {eligibleProfiles.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedUser(p.id)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                        selectedUser === p.id
                          ? 'border-[#4A1D96] bg-[#FAF5FF] shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={p.photoUrl}
                          alt={p.displayName}
                          className="w-10 h-10 rounded-full bg-gray-100 border border-gray-100"
                        />
                        <div>
                          <div className="font-semibold text-sm text-gray-950 flex items-center gap-1.5">
                            {p.displayName}
                            {p.role === 'super_admin' && (
                              <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.2 rounded-md font-bold uppercase">
                                Super
                              </span>
                            )}
                            {p.role === 'partner_admin' && (
                              <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.2 rounded-md font-bold uppercase">
                                Partner
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            @{p.username} • {p.role.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-medium text-gray-400 block">
                          {p.location.city}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {authError && (
                <div className="bg-red-50 border border-red-200 text-red-950 rounded-xl p-3 text-xs flex gap-2 items-start animate-fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                  <div>
                    <span className="font-semibold">Pi Browser Required:</span> {authError}
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={handlePiLogin}
                disabled={isAuthenticating}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#4A1D96] hover:bg-[#3B1578] disabled:bg-purple-900/40 text-white rounded-xl font-semibold transition-all shadow-md shadow-[#4a1d96]/15 active:scale-98 text-sm cursor-pointer"
              >
                {isAuthenticating ? (
                  <>
                    <Loader2 className="w-4.5 h-4.5 animate-spin" />
                    Connecting to Pi Wallet...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Authenticate with Pi Network (Official SDK)
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleSandboxLogin}
                disabled={isAuthenticating}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-yellow-400 hover:bg-yellow-500 disabled:opacity-50 text-yellow-950 rounded-xl font-semibold transition-all shadow-xs active:scale-98 text-xs cursor-pointer border border-yellow-300"
              >
                Or Log In with Selected Sandbox Profile
              </button>
            </div>
          ) : (
            <form onSubmit={handleCustomLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Pi Network Username
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 text-gray-400 font-mono text-sm">@</span>
                  <input
                    type="text"
                    required
                    placeholder="pi_pioneer_99"
                    value={customUsername}
                    onChange={(e) => setCustomUsername(e.target.value)}
                    className="w-full pl-8 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#4A1D96] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Full / Brand Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="John Doe Consulting"
                  value={customDisplayName}
                  onChange={(e) => setCustomDisplayName(e.target.value)}
                  className="w-full px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#4A1D96]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    User Role
                  </label>
                  <select
                    value={customRole}
                    onChange={(e) => setCustomRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#4A1D96] bg-white"
                  >
                    <option value="client">Client</option>
                    <option value="provider">Service Provider</option>
                    <option value="partner_admin">Partner Administrator</option>
                    <option value="super_admin">Super Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Local City
                  </label>
                  <select
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#4A1D96] bg-white"
                  >
                    <option value="San Francisco">San Francisco</option>
                    <option value="Austin">Austin</option>
                    <option value="New York">New York</option>
                    <option value="Detroit">Detroit</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  Phone Number (Local Contact Call)
                </label>
                <input
                  type="text"
                  required
                  placeholder="+1 (555) 555-0100"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  className="w-full px-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:border-[#4A1D96]"
                />
              </div>

              {/* Conditional fields for white-label Partner Admins */}
              {customRole === 'partner_admin' && (
                <div className="bg-[#FAF5FF] border border-[#E9D5FF] rounded-2xl p-4 space-y-3.5">
                  <div className="flex items-center gap-1.5 text-[#581C87] font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    White-Label Sub-Marketplace Config
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                      White-Label Marketplace Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pi Electricians, Detroit Freelancers"
                      value={tenantName}
                      onChange={(e) => setTenantName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-purple-200 rounded-xl focus:outline-none focus:border-[#4A1D96] bg-white"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                        Requested Subdomain
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="detroit"
                          value={tenantSubdomain}
                          onChange={(e) => setTenantSubdomain(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs border border-purple-200 rounded-xl focus:outline-none focus:border-[#4A1D96] bg-white font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                        Branding Theme Color
                      </label>
                      <div className="flex gap-1.5">
                        <input
                          type="color"
                          value={tenantColor}
                          onChange={(e) => setTenantColor(e.target.value)}
                          className="w-8 h-7 rounded border border-purple-200 cursor-pointer p-0 bg-transparent"
                        />
                        <input
                          type="text"
                          value={tenantColor}
                          onChange={(e) => setTenantColor(e.target.value)}
                          className="px-1.5 border border-purple-200 rounded-xl w-full text-[10px] font-mono text-center"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">
                      Hero Slogan / Purpose Statement
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Connecting local Detroit handymen"
                      value={tenantTagline}
                      onChange={(e) => setTenantTagline(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-purple-200 rounded-xl focus:outline-none focus:border-[#4A1D96] bg-white"
                    />
                  </div>
                  <p className="text-[10px] text-purple-600 font-medium italic">
                    *Your white-label subdomain node will start as "Pending Approval" by the Super Admin control tower.
                  </p>
                </div>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#4A1D96] hover:bg-[#3B1578] text-white rounded-xl font-medium transition-all shadow-md shadow-[#4a1d96]/10 active:scale-95 text-sm"
              >
                <Key className="w-4 h-4" />
                Generate Sandbox Wallet & Login
              </button>
            </form>
          )}

          {/* Footer details */}
          <div className="mt-6 pt-5 border-t border-gray-100 text-center text-[11px] text-gray-400">
            Work Hub Pi operates as a fully sandboxed preview of the Pi Network application framework. All wallet sign-ins are mocked securely on-device.
          </div>
        </div>
      </div>
    </div>
  );
}

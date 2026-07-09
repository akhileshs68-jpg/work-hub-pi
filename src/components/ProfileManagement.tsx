/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile, Review, UserRole } from '../types';
import { ALL_CATEGORIES } from '../data';
import { Star, Mail, Phone, MapPin, Globe, Award, ShieldAlert, Edit2, Check, CheckCircle2, ListFilter, Plus, Trash2, ShieldCheck, ExternalLink } from 'lucide-react';

interface ProfileManagementProps {
  profile: UserProfile;
  allReviews: Review[];
  allProfiles: UserProfile[];
  onUpdateProfile: (updated: UserProfile) => void;
  isOwnProfile: boolean;
}

export default function ProfileManagement({
  profile,
  allReviews,
  allProfiles,
  onUpdateProfile,
  isOwnProfile,
}: ProfileManagementProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio);
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.email);
  const [city, setCity] = useState(profile.location.city);
  const [state, setState] = useState(profile.location.state);
  
  // Provider specifics
  const [availability, setAvailability] = useState<'Available' | 'Busy' | 'Offline'>(
    profile.providerProfile?.availability || 'Available'
  );
  const [portfolioLinkInput, setPortfolioLinkInput] = useState('');
  const [portfolioLinks, setPortfolioLinks] = useState<string[]>(
    profile.providerProfile?.portfolioLinks || []
  );
  const [workSampleInput, setWorkSampleInput] = useState('');
  const [workSamples, setWorkSamples] = useState<string[]>(
    profile.providerProfile?.workSamples || []
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    profile.providerProfile?.categories || []
  );

  const reviews = allReviews.filter((r) => r.revieweeId === profile.id);

  const handleSave = () => {
    const updated: UserProfile = {
      ...profile,
      displayName,
      bio,
      phone,
      email,
      location: {
        ...profile.location,
        city,
        state,
      },
      ...(profile.role === 'provider' && {
        providerProfile: {
          ...profile.providerProfile!,
          availability,
          portfolioLinks,
          workSamples,
          categories: selectedCategories,
        },
      }),
    };
    onUpdateProfile(updated);
    setIsEditing(false);
  };

  const addPortfolioLink = () => {
    if (portfolioLinkInput.trim() && !portfolioLinks.includes(portfolioLinkInput.trim())) {
      setPortfolioLinks([...portfolioLinks, portfolioLinkInput.trim()]);
      setPortfolioLinkInput('');
    }
  };

  const removePortfolioLink = (index: number) => {
    setPortfolioLinks(portfolioLinks.filter((_, i) => i !== index));
  };

  const addWorkSample = () => {
    if (workSampleInput.trim() && !workSamples.includes(workSampleInput.trim())) {
      setWorkSamples([...workSamples, workSampleInput.trim()]);
      setWorkSampleInput('');
    }
  };

  const removeWorkSample = (index: number) => {
    setWorkSamples(workSamples.filter((_, i) => i !== index));
  };

  const toggleCategory = (cat: string) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  // Rendering star rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= Math.round(rating)
                ? 'text-yellow-400 fill-yellow-400'
                : 'text-gray-200 fill-gray-100'
            }`}
          />
        ))}
        <span className="text-xs font-bold text-gray-700 ml-1.5">{rating.toFixed(1)}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* Banner / Header profile card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden relative">
        <div className="h-32 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 relative">
          {profile.role === 'super_admin' && (
            <div className="absolute top-4 right-4 bg-red-600 text-white font-mono text-[10px] tracking-wider uppercase font-extrabold px-3 py-1 rounded-full shadow">
              🛡️ Super Administrator
            </div>
          )}
          {profile.role === 'partner_admin' && (
            <div className="absolute top-4 right-4 bg-indigo-600 text-white font-mono text-[10px] tracking-wider uppercase font-extrabold px-3 py-1 rounded-full shadow">
              🏢 Partner Administrator
            </div>
          )}
        </div>

        <div className="p-6 pt-0 relative flex flex-col md:flex-row gap-6 items-start">
          
          {/* Photo */}
          <div className="-mt-16 relative">
            <img
              src={profile.photoUrl}
              alt={profile.displayName}
              className="w-28 h-28 rounded-full border-4 border-white shadow-md bg-gray-100"
            />
            {profile.role === 'provider' && (
              <span className={`absolute bottom-2 right-2 w-5 h-5 rounded-full border-2 border-white ${
                availability === 'Available' ? 'bg-emerald-500' : availability === 'Busy' ? 'bg-amber-500' : 'bg-gray-400'
              }`} title={`Availability: ${availability}`} />
            )}
          </div>

          {/* User Information */}
          <div className="flex-1 space-y-2 mt-2 md:mt-0">
            {isEditing ? (
              <div className="space-y-3 max-w-md">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase">Display/Brand Name</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">{profile.displayName}</h2>
                <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full font-semibold font-mono tracking-wide">
                  @{profile.username}
                </span>
                {profile.role === 'provider' && (
                  <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded-full font-semibold">
                    ⭐ Pro Provider
                  </span>
                )}
              </div>
            )}

            {/* Sub-details */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-gray-500 font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-gray-400" />
                {isEditing ? (
                  <span className="flex gap-1">
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="City"
                      className="w-24 px-1.5 py-0.5 border border-gray-200 rounded text-xs"
                    />
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="State"
                      className="w-20 px-1.5 py-0.5 border border-gray-200 rounded text-xs"
                    />
                  </span>
                ) : (
                  `${profile.location.city}, ${profile.location.state}`
                )}
              </span>
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-gray-400" />
                {isEditing ? (
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="px-1.5 py-0.5 border border-gray-200 rounded text-xs w-44"
                  />
                ) : (
                  profile.email
                )}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-gray-400" />
                {isEditing ? (
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="px-1.5 py-0.5 border border-gray-200 rounded text-xs w-36"
                  />
                ) : (
                  profile.phone
                )}
              </span>
            </div>

            {/* Bio info */}
            <div className="text-xs text-gray-600 leading-relaxed pt-2">
              {isEditing ? (
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-500 text-xs h-20"
                />
              ) : (
                <p className="italic">"{profile.bio}"</p>
              )}
            </div>

            {/* Role availability toggler */}
            {profile.role === 'provider' && isEditing && (
              <div className="pt-2">
                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Service Availability</label>
                <div className="flex gap-2">
                  {(['Available', 'Busy', 'Offline'] as const).map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setAvailability(status)}
                      className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-all ${
                        availability === status
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm'
                          : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
          {isOwnProfile && (
            <div className="shrink-0 self-start md:self-auto">
              {isEditing ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1.5 text-xs font-semibold border border-gray-200 rounded-xl hover:bg-gray-50 transition-all text-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow shadow-emerald-600/10"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Save Profile
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 font-semibold text-xs text-gray-700 transition-all bg-white"
                >
                  <Edit2 className="w-3.5 h-3.5 text-indigo-500" />
                  Edit Profile
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bento Grid section for detailed fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Stats & Reviews */}
        <div className="md:col-span-1 space-y-6">
          
          {/* Reviews Summary */}
          {profile.role === 'provider' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
              <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                <Award className="w-4.5 h-4.5 text-yellow-500" />
                Service Quality Rating
              </h3>
              
              <div className="flex items-center gap-4 bg-gray-50 rounded-xl p-3">
                <div className="text-3xl font-extrabold text-gray-900">
                  {profile.providerProfile?.rating.toFixed(1) || '0.0'}
                </div>
                <div className="space-y-1">
                  {renderStars(profile.providerProfile?.rating || 0)}
                  <span className="text-[10px] text-gray-400 font-medium block">
                    Based on {reviews.length} completed jobs
                  </span>
                </div>
              </div>

              {/* Client Review comments */}
              <div className="space-y-3.5 pt-2">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Client Reviews ({reviews.length})</h4>
                {reviews.length === 0 ? (
                  <p className="text-xs text-gray-400 italic">No reviews completed yet on this tenant.</p>
                ) : (
                  reviews.map((r) => {
                    const reviewer = allProfiles.find((p) => p.id === r.reviewerId);
                    return (
                      <div key={r.id} className="border-b border-gray-100 last:border-0 pb-3 last:pb-0 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <img
                              src={reviewer?.photoUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'}
                              alt={reviewer?.displayName}
                              className="w-5 h-5 rounded-full"
                            />
                            <span className="text-xs font-semibold text-gray-800">{reviewer?.displayName}</span>
                          </div>
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-2.5 h-2.5 ${
                                  star <= r.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 fill-gray-100'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-600 italic leading-relaxed">"{r.comment}"</p>
                        <span className="text-[9px] text-gray-300 block">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* Account status details */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-3">
            <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4.5 h-4.5 text-indigo-500" />
              SaaS Credentials
            </h3>
            <ul className="space-y-2 text-xs font-medium text-gray-500">
              <li className="flex justify-between py-1 border-b border-gray-50">
                <span>Tenant Isolation</span>
                <span className="text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Secured
                </span>
              </li>
              <li className="flex justify-between py-1 border-b border-gray-50">
                <span>Pi Mainnet Escrow</span>
                <span className="text-gray-400">Ready</span>
              </li>
              <li className="flex justify-between py-1 border-b border-gray-50">
                <span>Account Created</span>
                <span className="text-gray-800 font-mono">
                  {new Date(profile.createdAt).toLocaleDateString()}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Portfolio & Skill Categories */}
        <div className="md:col-span-2 space-y-6">
          
          {/* Skill/Service Categories selection */}
          {profile.role === 'provider' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
              <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                <ListFilter className="w-4.5 h-4.5 text-indigo-500" />
                Service Specializations
              </h3>

              {isEditing ? (
                <div className="space-y-2">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mb-2">Toggle Offered Services</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ALL_CATEGORIES.map((cat) => {
                      const isSelected = selectedCategories.includes(cat);
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => toggleCategory(cat)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-gray-50 text-gray-400 hover:bg-gray-100 border border-transparent'
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedCategories.length === 0 ? (
                    <p className="text-xs text-gray-400 italic">No service specializations selected.</p>
                  ) : (
                    selectedCategories.map((cat) => (
                      <span
                        key={cat}
                        className="bg-gray-50 text-gray-700 border border-gray-100 px-3 py-1 rounded-xl text-xs font-medium"
                      >
                        {cat}
                      </span>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* Portfolio & Work Samples */}
          {profile.role === 'provider' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-6">
              
              {/* Portfolio websites */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                  <Globe className="w-4.5 h-4.5 text-indigo-500" />
                  Portfolio Links
                </h3>

                {isEditing && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://mywebsite.com"
                      value={portfolioLinkInput}
                      onChange={(e) => setPortfolioLinkInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addPortfolioLink}
                      className="px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all text-xs font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  {portfolioLinks.length === 0 && (
                    <p className="text-xs text-gray-400 italic">No website links added yet.</p>
                  )}
                  {portfolioLinks.map((link, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <a
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-indigo-600 hover:underline flex items-center gap-1 truncate"
                      >
                        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                        {link}
                      </a>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => removePortfolioLink(idx)}
                          className="text-red-500 hover:bg-red-50 p-1 rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Work samples */}
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                  <Award className="w-4.5 h-4.5 text-indigo-500" />
                  Completed Work Samples / Projects
                </h3>

                {isEditing && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="E.g., Pi Escrow API Module"
                      value={workSampleInput}
                      onChange={(e) => setWorkSampleInput(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={addWorkSample}
                      className="px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all text-xs font-semibold flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </button>
                  </div>
                )}

                <div className="space-y-2">
                  {workSamples.length === 0 && (
                    <p className="text-xs text-gray-400 italic">No work projects documented yet.</p>
                  )}
                  {workSamples.map((sample, idx) => (
                    <div key={idx} className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <span className="text-xs text-gray-800 font-medium">{sample}</span>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => removeWorkSample(idx)}
                          className="text-red-500 hover:bg-red-50 p-1 rounded-lg transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Client Specific Profile overview */}
          {profile.role === 'client' && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
              <h3 className="font-semibold text-gray-900 text-sm">Client Engagement Dashboard</h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                As a client on Work Hub Pi, you can post complex job requirements in digital or local categories, receive comprehensive pricing applications, and utilize instant chat to coordinate secure service deliveries.
              </p>
              <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100">
                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Client Protection Rules</h4>
                <p className="text-[11px] text-gray-600">
                  All contracts created under white-label partner networks are structured to enforce milestones. Always keep conversation histories inside the secure Chat workspace to preserve validity.
                </p>
              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
}

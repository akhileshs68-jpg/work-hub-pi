/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, Conversation, UserProfile, Job, ServiceListing } from '../types';
import { Send, CheckCheck, Bot, Sparkles, MessageSquare, Phone, User, ExternalLink, Briefcase } from 'lucide-react';

interface ChatMessengerProps {
  currentUser: UserProfile;
  currentTenantId: string;
  conversations: Conversation[];
  messages: ChatMessage[];
  profiles: UserProfile[];
  onSendMessage: (receiverId: string, text: string, relatedJobId?: string, relatedListingId?: string) => void;
  selectedConversationId?: string;
  onSelectConversation?: (id: string) => void;
  allJobs?: Job[];
  allListings?: ServiceListing[];
}

export default function ChatMessenger({
  currentUser,
  currentTenantId,
  conversations,
  messages,
  profiles,
  onSendMessage,
  selectedConversationId,
  onSelectConversation,
  allJobs = [],
  allListings = [],
}: ChatMessengerProps) {
  const [inputText, setInputText] = useState('');
  const [autopilotEnabled, setAutopilotEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter conversations matching current user and current tenant
  const tenantConversations = conversations.filter(
    (c) => c.tenantId === currentTenantId && (c.clientId === currentUser.id || c.providerId === currentUser.id)
  );

  const activeConv = tenantConversations.find((c) => c.id === selectedConversationId);
  const activePartnerId = activeConv
    ? activeConv.clientId === currentUser.id
      ? activeConv.providerId
      : activeConv.clientId
    : null;

  const activePartnerProfile = activePartnerId ? profiles.find((p) => p.id === activePartnerId) : null;

  // Filter messages belonging to the active conversation
  const activeMessages = selectedConversationId
    ? messages.filter((m) => m.conversationId === selectedConversationId)
    : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activePartnerId || !selectedConversationId) return;

    onSendMessage(
      activePartnerId,
      inputText,
      activeConv?.relatedJobId,
      activeConv?.relatedListingId
    );
    const sentText = inputText;
    setInputText('');

    // If Autopilot is enabled and we are not logged in as the partner,
    // trigger a funny and helpful simulated auto-response after 1.5 seconds!
    if (autopilotEnabled && activePartnerProfile) {
      setTimeout(() => {
        let reply = "Hi there! Thanks for reaching out. I've received your message and will look into the details right away. We can transact securely over the Pi Network!";
        
        const textLower = sentText.toLowerCase();
        if (textLower.includes('price') || textLower.includes('cost') || textLower.includes('budget') || textLower.includes('pi')) {
          reply = `Yes, I am happy to work within your budget of Pi. All transaction records are locked into the database. Let me know when you'd like to initiate the escrow!`;
        } else if (textLower.includes('when') || textLower.includes('available') || textLower.includes('start')) {
          reply = `My availability is currently set to '${activePartnerProfile.providerProfile?.availability || 'Available'}'. I can start as early as tomorrow morning!`;
        } else if (textLower.includes('portfolio') || textLower.includes('github') || textLower.includes('work')) {
          reply = `Absolutely! You can check my portfolio references listed on my profile: ${
            activePartnerProfile.providerProfile?.portfolioLinks?.[0] || 'https://workhubpi.com'
          }`;
        } else if (textLower.includes('call') || textLower.includes('phone') || textLower.includes('contact')) {
          reply = `For local services, you can tap the Call button on my listing card to open your device's dialer at ${activePartnerProfile.phone || 'our listed contact'}!`;
        }

        onSendMessage(
          currentUser.id,
          `[Autopilot Response] ${reply}`,
          activeConv?.relatedJobId,
          activeConv?.relatedListingId
        );
      }, 1500);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-[600px] flex">
      
      {/* Sidebar - Conversations list */}
      <div className="w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/50">
        <div className="p-4 border-b border-gray-100 bg-white">
          <h3 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            Chat Workspace
          </h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Select a thread to negotiate services</p>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {tenantConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 p-4 text-center">
              <MessageSquare className="w-8 h-8 text-gray-300 stroke-[1.5] mb-2" />
              <p className="text-xs text-gray-400 font-medium">No active chats yet</p>
              <p className="text-[10px] text-gray-400 mt-1">
                Go to the Directory or Job board and click 'Send Chat Message' to start negotiating!
              </p>
            </div>
          ) : (
            tenantConversations.map((c) => {
              const partnerId = c.clientId === currentUser.id ? c.providerId : c.clientId;
              const partner = profiles.find((p) => p.id === partnerId);
              const isActive = c.id === selectedConversationId;

              // Check unread messages count
              const unreadCount = messages.filter(
                (m) => m.conversationId === c.id && m.senderId !== currentUser.id && !m.read
              ).length;

              return (
                <button
                  key={c.id}
                  onClick={() => onSelectConversation?.(c.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                    isActive
                      ? 'bg-white shadow-sm border border-gray-200/50 text-indigo-950 font-medium'
                      : 'hover:bg-white/60 border border-transparent text-gray-600'
                  }`}
                >
                  <div className="relative">
                    <img
                      src={partner?.photoUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=fallback'}
                      alt={partner?.displayName}
                      className="w-10 h-10 rounded-full bg-white border border-gray-100"
                    />
                    {partner?.providerProfile?.availability === 'Available' && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold truncate">
                        {partner?.displayName || 'Unknown User'}
                      </span>
                      {unreadCount > 0 && (
                        <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">
                      {c.lastMessageText}
                    </p>
                    <span className="text-[9px] text-gray-300 block mt-0.5">
                      {new Date(c.lastMessageTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main chat window */}
      <div className="flex-1 flex flex-col bg-white">
        {activeConv && activePartnerProfile ? (
          <>
            {/* Active partner bar */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shadow-sm">
              <div className="flex items-center gap-3">
                <img
                  src={activePartnerProfile.photoUrl}
                  alt={activePartnerProfile.displayName}
                  className="w-10 h-10 rounded-full border border-gray-100"
                />
                <div>
                  <div className="font-semibold text-xs text-gray-950 flex items-center gap-1.5">
                    {activePartnerProfile.displayName}
                    <span className="text-[10px] font-mono text-gray-400">@{activePartnerProfile.username}</span>
                  </div>
                  <div className="text-[10px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                    <span className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-medium">
                      {activePartnerProfile.role.replace('_', ' ').toUpperCase()}
                    </span>
                    <span>•</span>
                    <span>{activePartnerProfile.location.city}, {activePartnerProfile.location.state}</span>
                  </div>
                </div>
              </div>

              {/* Autopilot helper indicator */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setAutopilotEnabled(!autopilotEnabled)}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                    autopilotEnabled
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'bg-gray-100 text-gray-400 border border-gray-200'
                  }`}
                  title="Toggles instant simulated reply from the other party to easily test direct chats."
                >
                  <Bot className={`w-3.5 h-3.5 ${autopilotEnabled ? 'animate-bounce' : ''}`} />
                  <span>Autopilot Reply</span>
                </button>

                {activePartnerProfile.phone && (
                  <a
                    href={`tel:${activePartnerProfile.phone}`}
                    onClick={(e) => {
                      e.preventDefault();
                      alert(`Dialing ${activePartnerProfile.displayName} at ${activePartnerProfile.phone}...`);
                    }}
                    className="p-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-full transition-all"
                    title="Direct Mobile Contact"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>

            {/* Chat message listing scroll view */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/20">
              {(() => {
                const matchedJob = activeConv.relatedJobId ? allJobs.find(j => j.id === activeConv.relatedJobId) : null;
                const matchedListing = activeConv.relatedListingId ? allListings.find(l => l.id === activeConv.relatedListingId) : null;
                
                if (!matchedJob && !matchedListing) {
                  return (
                    <div className="text-center py-2">
                      <span className="text-[10px] text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                        Negotiation started • Secure Pi Integration Active
                      </span>
                    </div>
                  );
                }

                return (
                  <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-4 mb-2 space-y-1.5 text-xs text-left">
                    <div className="flex justify-between items-center text-indigo-900 font-bold">
                      <span className="flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                        {matchedJob ? <Briefcase className="w-3.5 h-3.5 text-indigo-600" /> : '🛠️'}
                        {matchedJob ? 'Linked Job Posting' : 'Linked Service Listing'}
                      </span>
                      <span className="text-indigo-700 font-black">
                        {matchedJob ? `${matchedJob.budget} Pi` : `${matchedListing?.price} Pi`}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900">{matchedJob ? matchedJob.title : matchedListing?.title}</h4>
                    <p className="text-gray-500 text-[11px] line-clamp-2 leading-relaxed">
                      {matchedJob ? matchedJob.description : matchedListing?.description}
                    </p>
                    {matchedJob && (
                      <div className="pt-1.5 flex justify-between items-center text-[10px] text-gray-400 border-t border-indigo-100/30">
                        <span>Status: <strong className="text-indigo-600 uppercase">{matchedJob.status}</strong></span>
                        <span>Category: {matchedJob.category}</span>
                      </div>
                    )}
                  </div>
                );
              })()}

              {activeMessages.map((m) => {
                const isMe = m.senderId === currentUser.id;
                const isAutopilot = m.text.startsWith('[Autopilot Response]');
                const displayText = isAutopilot ? m.text.replace('[Autopilot Response] ', '') : m.text;

                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[70%] rounded-2xl p-3.5 text-xs shadow-sm relative ${
                        isMe
                          ? 'bg-[#4F46E5] text-white rounded-tr-none'
                          : isAutopilot
                          ? 'bg-purple-50 border border-purple-100 text-purple-950 rounded-tl-none font-medium'
                          : 'bg-white border border-gray-100 text-gray-900 rounded-tl-none'
                      }`}
                    >
                      {isAutopilot && (
                        <div className="flex items-center gap-1 text-[9px] text-purple-600 font-bold uppercase tracking-wider mb-1">
                          <Bot className="w-3 h-3" />
                          Autopilot Partner
                        </div>
                      )}
                      <p className="leading-relaxed">{displayText}</p>
                      
                      <div className="flex items-center justify-end gap-1 mt-1 text-[9px] opacity-75">
                        <span>
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isMe && <CheckCheck className="w-3.5 h-3.5 text-indigo-200 shrink-0" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input field */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-100 bg-white flex gap-2">
              <input
                type="text"
                placeholder={`Type a negotiation message to ${activePartnerProfile.displayName}...`}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="flex-1 px-4 py-2.5 text-xs border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-[#4F46E5] bg-gray-50/50"
              />
              <button
                type="submit"
                className="bg-[#4F46E5] hover:bg-indigo-700 text-white p-2.5 rounded-xl transition-all shadow-md shadow-indigo-600/10 shrink-0 active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
            <Bot className="w-12 h-12 text-gray-300 stroke-[1.5] mb-3 animate-pulse" />
            <h4 className="font-semibold text-sm text-gray-700">No Thread Selected</h4>
            <p className="text-xs text-gray-400 mt-1 max-w-sm">
              Please choose a contractor or client from the sidebar on the left, or initiate a new chat directly from listing cards.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}

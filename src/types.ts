/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'super_admin' | 'partner_admin' | 'client' | 'provider';

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  logo: string; // SVG or URL string
  tagline: string;
  themeColor: string; // e.g. '#6366F1' Indigo
  bannerUrl: string;
  seoTitle: string;
  seoDescription: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  socials: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
  isActive: boolean;
}

export interface UserProfile {
  id: string;
  tenantId: string; // empty for super_admin
  role: UserRole;
  username: string;
  displayName: string;
  photoUrl: string;
  bio: string;
  phone: string;
  email: string;
  location: {
    country: string;
    state: string;
    district: string;
    city: string;
    latitude: number;
    longitude: number;
  };
  providerProfile?: {
    portfolioLinks: string[];
    workSamples: string[];
    categories: string[]; // service categories
    availability: 'Available' | 'Busy' | 'Offline';
    rating: number;
    reviewCount: number;
  };
  clientProfile?: {
    savedProviderIds: string[];
  };
  createdAt: string;
}

export interface Job {
  id: string;
  tenantId: string;
  clientId: string;
  title: string;
  description: string;
  category: string;
  serviceType: 'digital' | 'local';
  country: string;
  state: string;
  district: string;
  city: string;
  latitude: number;
  longitude: number;
  visibility: 'Local' | 'Global';
  budget: number; // For Pi Network, e.g. 15 Pi
  status: 'Open' | 'InProgress' | 'Completed' | 'Closed';
  createdAt: string;
}

export interface ServiceListing {
  id: string;
  tenantId: string;
  providerId: string;
  title: string;
  description: string;
  category: string;
  serviceType: 'digital' | 'local';
  country: string;
  state: string;
  district: string;
  city: string;
  latitude: number;
  longitude: number;
  visibility: 'Local' | 'Global';
  price: number; // e.g. 5 Pi / hour
  portfolioLinks: string[];
  status: 'Active' | 'Paused' | 'Hidden';
  createdAt: string;
}

export interface JobApplication {
  id: string;
  tenantId: string;
  jobId: string;
  providerId: string;
  coverMessage: string;
  status: 'Pending' | 'Accepted' | 'Rejected';
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  tenantId: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  tenantId: string;
  clientId: string;
  providerId: string;
  relatedJobId?: string; // Optional: can be initiated from Service Listing (Directory Mode)
  relatedListingId?: string;
  lastMessageText: string;
  lastMessageTimestamp: string;
}

export interface Review {
  id: string;
  tenantId: string;
  jobId?: string;
  reviewerId: string;
  revieweeId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  tenantId: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  type: 'message' | 'application' | 'review' | 'system' | 'job_match';
  createdAt: string;
}

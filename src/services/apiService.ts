/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Tenant,
  UserProfile,
  Job,
  ServiceListing,
  JobApplication,
  Review,
  ChatMessage,
  Conversation,
  Notification,
} from '../types';
import {
  INITIAL_TENANTS,
  INITIAL_PROFILES,
  INITIAL_JOBS,
  INITIAL_LISTINGS,
  INITIAL_REVIEWS,
  INITIAL_NOTIFICATIONS,
  ALL_CATEGORIES,
} from '../data';
import { safeStorage } from '../utils/storage';

/**
 * Interface defining the scalable database API operations.
 * Allows easy swapping between LocalStorage (current Sandbox MVP), Firebase Firestore, or relational backends.
 */
export interface IApiService {
  // --- Tenants ---
  getTenants(): Promise<Tenant[]>;
  saveTenant(tenant: Tenant): Promise<Tenant>;
  toggleTenantStatus(tenantId: string): Promise<Tenant>;

  // --- Profiles ---
  getProfiles(): Promise<UserProfile[]>;
  saveProfile(profile: UserProfile): Promise<UserProfile>;
  getProfileById(id: string): Promise<UserProfile | null>;

  // --- Jobs ---
  getJobs(tenantId: string): Promise<Job[]>;
  createJob(job: Job): Promise<Job>;
  updateJobStatus(jobId: string, status: Job['status']): Promise<Job>;

  // --- Listings (Directory Mode) ---
  getListings(tenantId: string): Promise<ServiceListing[]>;
  createListing(listing: ServiceListing): Promise<ServiceListing>;
  updateListingStatus(listingId: string, status: ServiceListing['status']): Promise<ServiceListing>;

  // --- Applications / Bids ---
  getApplications(tenantId: string): Promise<JobApplication[]>;
  submitApplication(application: JobApplication): Promise<JobApplication>;
  respondToApplication(applicationId: string, status: JobApplication['status']): Promise<JobApplication>;

  // --- Messaging ---
  getConversations(tenantId: string, userId: string): Promise<Conversation[]>;
  getMessages(tenantId: string, conversationId: string): Promise<ChatMessage[]>;
  sendMessage(message: ChatMessage): Promise<ChatMessage>;

  // --- Reviews ---
  getReviews(tenantId: string): Promise<Review[]>;
  addReview(review: Review): Promise<Review>;

  // --- Notifications ---
  getNotifications(tenantId: string, userId: string): Promise<Notification[]>;
  addNotification(notification: Notification): Promise<Notification>;
  markNotificationsAsRead(tenantId: string, userId: string): Promise<void>;
}

/**
 * LocalStorage-backed implementation of IApiService.
 * Simulates network asynchronous behavior using async/await patterns.
 */
export class LocalStorageApiService implements IApiService {
  private getStorageItem<T>(key: string, defaultValue: T): T {
    const saved = safeStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  }

  private setStorageItem<T>(key: string, value: T): void {
    safeStorage.setItem(key, JSON.stringify(value));
  }

  // --- Tenants ---
  public async getTenants(): Promise<Tenant[]> {
    return this.getStorageItem<Tenant[]>('whp_tenants', INITIAL_TENANTS);
  }

  public async saveTenant(tenant: Tenant): Promise<Tenant> {
    const tenants = await this.getTenants();
    const index = tenants.findIndex((t) => t.id === tenant.id);
    if (index >= 0) {
      tenants[index] = tenant;
    } else {
      tenants.push(tenant);
    }
    this.setStorageItem('whp_tenants', tenants);
    return tenant;
  }

  public async toggleTenantStatus(tenantId: string): Promise<Tenant> {
    const tenants = await this.getTenants();
    const index = tenants.findIndex((t) => t.id === tenantId);
    if (index < 0) throw new Error(`Tenant ${tenantId} not found`);
    tenants[index].isActive = !tenants[index].isActive;
    this.setStorageItem('whp_tenants', tenants);
    return tenants[index];
  }

  // --- Profiles ---
  public async getProfiles(): Promise<UserProfile[]> {
    return this.getStorageItem<UserProfile[]>('whp_profiles', INITIAL_PROFILES);
  }

  public async saveProfile(profile: UserProfile): Promise<UserProfile> {
    const profiles = await this.getProfiles();
    const index = profiles.findIndex((p) => p.id === profile.id);
    if (index >= 0) {
      profiles[index] = profile;
    } else {
      profiles.push(profile);
    }
    this.setStorageItem('whp_profiles', profiles);
    return profile;
  }

  public async getProfileById(id: string): Promise<UserProfile | null> {
    const profiles = await this.getProfiles();
    return profiles.find((p) => p.id === id) || null;
  }

  // --- Jobs ---
  public async getJobs(tenantId: string): Promise<Job[]> {
    const jobs = this.getStorageItem<Job[]>('whp_jobs', INITIAL_JOBS);
    return jobs.filter((j) => j.tenantId === tenantId);
  }

  public async createJob(job: Job): Promise<Job> {
    const allJobs = this.getStorageItem<Job[]>('whp_jobs', INITIAL_JOBS);
    allJobs.unshift(job);
    this.setStorageItem('whp_jobs', allJobs);
    return job;
  }

  public async updateJobStatus(jobId: string, status: Job['status']): Promise<Job> {
    const allJobs = this.getStorageItem<Job[]>('whp_jobs', INITIAL_JOBS);
    const index = allJobs.findIndex((j) => j.id === jobId);
    if (index < 0) throw new Error(`Job ${jobId} not found`);
    allJobs[index].status = status;
    this.setStorageItem('whp_jobs', allJobs);
    return allJobs[index];
  }

  // --- Listings ---
  public async getListings(tenantId: string): Promise<ServiceListing[]> {
    const listings = this.getStorageItem<ServiceListing[]>('whp_listings', INITIAL_LISTINGS);
    return listings.filter((l) => l.tenantId === tenantId);
  }

  public async createListing(listing: ServiceListing): Promise<ServiceListing> {
    const allListings = this.getStorageItem<ServiceListing[]>('whp_listings', INITIAL_LISTINGS);
    allListings.unshift(listing);
    this.setStorageItem('whp_listings', allListings);
    return listing;
  }

  public async updateListingStatus(
    listingId: string,
    status: ServiceListing['status']
  ): Promise<ServiceListing> {
    const allListings = this.getStorageItem<ServiceListing[]>('whp_listings', INITIAL_LISTINGS);
    const index = allListings.findIndex((l) => l.id === listingId);
    if (index < 0) throw new Error(`Service Listing ${listingId} not found`);
    allListings[index].status = status;
    this.setStorageItem('whp_listings', allListings);
    return allListings[index];
  }

  // --- Applications ---
  public async getApplications(tenantId: string): Promise<JobApplication[]> {
    const apps = this.getStorageItem<JobApplication[]>('whp_applications', []);
    return apps.filter((a) => a.tenantId === tenantId);
  }

  public async submitApplication(application: JobApplication): Promise<JobApplication> {
    const allApps = this.getStorageItem<JobApplication[]>('whp_applications', []);
    allApps.push(application);
    this.setStorageItem('whp_applications', allApps);
    return application;
  }

  public async respondToApplication(
    applicationId: string,
    status: JobApplication['status']
  ): Promise<JobApplication> {
    const allApps = this.getStorageItem<JobApplication[]>('whp_applications', []);
    const index = allApps.findIndex((a) => a.id === applicationId);
    if (index < 0) throw new Error(`Proposal ${applicationId} not found`);
    allApps[index].status = status;
    this.setStorageItem('whp_applications', allApps);
    return allApps[index];
  }

  // --- Messaging ---
  public async getConversations(tenantId: string, userId: string): Promise<Conversation[]> {
    const allConvs = this.getStorageItem<Conversation[]>('whp_conversations', []);
    return allConvs.filter(
      (c) => c.tenantId === tenantId && (c.clientId === userId || c.providerId === userId)
    );
  }

  public async getMessages(tenantId: string, conversationId: string): Promise<ChatMessage[]> {
    const allMsgs = this.getStorageItem<ChatMessage[]>('whp_messages', []);
    return allMsgs.filter((m) => m.tenantId === tenantId && m.conversationId === conversationId);
  }

  public async sendMessage(message: ChatMessage): Promise<ChatMessage> {
    const allMsgs = this.getStorageItem<ChatMessage[]>('whp_messages', []);
    allMsgs.push(message);
    this.setStorageItem('whp_messages', allMsgs);

    // Update conversation last message parameters
    const allConvs = this.getStorageItem<Conversation[]>('whp_conversations', []);
    const index = allConvs.findIndex((c) => c.id === message.conversationId);
    if (index >= 0) {
      allConvs[index].lastMessageText = message.text;
      allConvs[index].lastMessageTimestamp = message.timestamp;
      this.setStorageItem('whp_conversations', allConvs);
    }

    return message;
  }

  // --- Reviews ---
  public async getReviews(tenantId: string): Promise<Review[]> {
    const reviews = this.getStorageItem<Review[]>('whp_reviews', INITIAL_REVIEWS);
    return reviews.filter((r) => r.tenantId === tenantId);
  }

  public async addReview(review: Review): Promise<Review> {
    const allReviews = this.getStorageItem<Review[]>('whp_reviews', INITIAL_REVIEWS);
    allReviews.unshift(review);
    this.setStorageItem('whp_reviews', allReviews);
    return review;
  }

  // --- Notifications ---
  public async getNotifications(tenantId: string, userId: string): Promise<Notification[]> {
    const notifs = this.getStorageItem<Notification[]>('whp_notifications', INITIAL_NOTIFICATIONS);
    return notifs.filter((n) => n.tenantId === tenantId && n.userId === userId);
  }

  public async addNotification(notification: Notification): Promise<Notification> {
    const allNotifs = this.getStorageItem<Notification[]>('whp_notifications', INITIAL_NOTIFICATIONS);
    allNotifs.unshift(notification);
    this.setStorageItem('whp_notifications', allNotifs);
    return notification;
  }

  public async markNotificationsAsRead(tenantId: string, userId: string): Promise<void> {
    const allNotifs = this.getStorageItem<Notification[]>('whp_notifications', INITIAL_NOTIFICATIONS);
    const updated = allNotifs.map((n) =>
      n.tenantId === tenantId && n.userId === userId ? { ...n, read: true } : n
    );
    this.setStorageItem('whp_notifications', updated);
  }
}

/**
 * Single service instance exporting the API handler.
 * To integrate with Firebase or PostgreSQL in the future, simply re-assign `apiService`
 * to a new class implementing the `IApiService` interface.
 */
export const apiService: IApiService = new LocalStorageApiService();

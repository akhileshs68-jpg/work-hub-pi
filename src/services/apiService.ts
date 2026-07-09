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
import { FirebaseApiService } from './firebaseService';

/**
 * Interface defining the scalable database API operations.
 * Swapped from LocalStorage to Firebase Firestore to support multi-tenant SaaS.
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
 * Single service instance exporting the API handler.
 * Swapped from LocalStorage to the production-ready FirebaseApiService.
 */
export const apiService: IApiService = new FirebaseApiService();

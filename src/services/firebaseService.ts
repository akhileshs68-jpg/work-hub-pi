/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IApiService } from './apiService';
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

/**
 * Placeholder Firebase Firestore Implementation.
 * This file demonstrates how to transition from the LocalStorage MVP to Firebase
 * without changing the UI components, state management, or business logic.
 * 
 * To activate:
 * 1. Install firebase dependencies: `npm install firebase`
 * 2. Configure Firebase in a separate config file or directly in this file
 * 3. Export this class as `apiService` inside `apiService.ts`
 */
export class FirebaseApiService implements IApiService {
  // private db = getFirestore(); // Once initialized

  public async getTenants(): Promise<Tenant[]> {
    console.log('[Firebase API] Fetching active white-label SaaS tenants...');
    // Real implementation:
    // const snapshot = await getDocs(collection(this.db, 'tenants'));
    // return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tenant));
    throw new Error('Firebase SDK not loaded. Configure project credentials first.');
  }

  public async saveTenant(tenant: Tenant): Promise<Tenant> {
    console.log('[Firebase API] Saving tenant brand customization:', tenant.id);
    // Real implementation:
    // await setDoc(doc(this.db, 'tenants', tenant.id), tenant);
    return tenant;
  }

  public async toggleTenantStatus(tenantId: string): Promise<Tenant> {
    console.log('[Firebase API] Toggling status for tenant:', tenantId);
    throw new Error('Method not implemented.');
  }

  public async getProfiles(): Promise<UserProfile[]> {
    console.log('[Firebase API] Fetching all user profiles...');
    // Real implementation:
    // const snapshot = await getDocs(collection(this.db, 'profiles'));
    // return snapshot.docs.map(doc => doc.data() as UserProfile);
    throw new Error('Firebase SDK not loaded.');
  }

  public async saveProfile(profile: UserProfile): Promise<UserProfile> {
    console.log('[Firebase API] Saving user account profile:', profile.id);
    // Real implementation:
    // await setDoc(doc(this.db, 'profiles', profile.id), profile);
    return profile;
  }

  public async getProfileById(id: string): Promise<UserProfile | null> {
    console.log('[Firebase API] Fetching user profile by ID:', id);
    return null;
  }

  public async getJobs(tenantId: string): Promise<Job[]> {
    console.log('[Firebase API] Querying jobs for tenant node:', tenantId);
    // Real implementation:
    // const q = query(collection(this.db, 'jobs'), where('tenantId', '==', tenantId));
    // const snapshot = await getDocs(q);
    // return snapshot.docs.map(doc => doc.data() as Job);
    return [];
  }

  public async createJob(job: Job): Promise<Job> {
    console.log('[Firebase API] Creating new job in Firestore:', job.id);
    // Real implementation:
    // await setDoc(doc(this.db, 'jobs', job.id), job);
    return job;
  }

  public async updateJobStatus(jobId: string, status: Job['status']): Promise<Job> {
    console.log('[Firebase API] Updating job status in Firestore:', jobId, status);
    // Real implementation:
    // await updateDoc(doc(this.db, 'jobs', jobId), { status });
    throw new Error('Firebase SDK not loaded.');
  }

  public async getListings(tenantId: string): Promise<ServiceListing[]> {
    console.log('[Firebase API] Fetching service directory listings for tenant:', tenantId);
    return [];
  }

  public async createListing(listing: ServiceListing): Promise<ServiceListing> {
    console.log('[Firebase API] Publishing service listing:', listing.id);
    return listing;
  }

  public async updateListingStatus(
    listingId: string,
    status: ServiceListing['status']
  ): Promise<ServiceListing> {
    console.log('[Firebase API] Updating listing status:', listingId, status);
    throw new Error('Firebase SDK not loaded.');
  }

  public async getApplications(tenantId: string): Promise<JobApplication[]> {
    console.log('[Firebase API] Querying job applications for tenant:', tenantId);
    return [];
  }

  public async submitApplication(application: JobApplication): Promise<JobApplication> {
    console.log('[Firebase API] Submitting proposal application:', application.id);
    return application;
  }

  public async respondToApplication(
    applicationId: string,
    status: JobApplication['status']
  ): Promise<JobApplication> {
    console.log('[Firebase API] Responding to application:', applicationId, status);
    throw new Error('Firebase SDK not loaded.');
  }

  public async getConversations(tenantId: string, userId: string): Promise<Conversation[]> {
    console.log('[Firebase API] Querying active conversations for user:', userId);
    // Real implementation query:
    // const q = query(
    //   collection(this.db, 'conversations'),
    //   where('tenantId', '==', tenantId),
    //   where('users', 'array-contains', userId)
    // );
    return [];
  }

  public async getMessages(tenantId: string, conversationId: string): Promise<ChatMessage[]> {
    console.log('[Firebase API] Fetching conversation thread messages:', conversationId);
    return [];
  }

  public async sendMessage(message: ChatMessage): Promise<ChatMessage> {
    console.log('[Firebase API] Writing chat message to sub-marketplace thread:', message.id);
    return message;
  }

  public async getReviews(tenantId: string): Promise<Review[]> {
    console.log('[Firebase API] Fetching reviews for tenant:', tenantId);
    return [];
  }

  public async addReview(review: Review): Promise<Review> {
    console.log('[Firebase API] Writing quality review:', review.id);
    return review;
  }

  public async getNotifications(tenantId: string, userId: string): Promise<Notification[]> {
    console.log('[Firebase API] Querying unread notifications for:', userId);
    return [];
  }

  public async addNotification(notification: Notification): Promise<Notification> {
    console.log('[Firebase API] Dispatching cloud push notification:', notification.id);
    return notification;
  }

  public async markNotificationsAsRead(tenantId: string, userId: string): Promise<void> {
    console.log('[Firebase API] Bulk marking notifications as read for:', userId);
  }
}

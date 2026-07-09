/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { IApiService } from './apiService';
import { db } from './firebase';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  updateDoc,
} from 'firebase/firestore';
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
} from '../data';

/**
 * Production-ready Firebase Firestore Implementation.
 * Directly communicates with firestore collections to manage multi-tenant white-label workspaces.
 */
export class FirebaseApiService implements IApiService {
  private seeded = false;

  /**
   * Automatically seeds the Firestore database with initial data if it's completely empty.
   */
  private async ensureSeeded(): Promise<void> {
    if (this.seeded) return;
    try {
      const snap = await getDocs(collection(db, 'tenants'));
      if (snap.empty) {
        console.log('[Firebase API] Database is empty. Seeding initial tenants, profiles, jobs, and reviews...');
        
        // 1. Tenants
        for (const tenant of INITIAL_TENANTS) {
          await setDoc(doc(db, 'tenants', tenant.id), tenant);
        }
        
        // 2. Profiles
        for (const profile of INITIAL_PROFILES) {
          await setDoc(doc(db, 'profiles', profile.id), profile);
        }
        
        // 3. Jobs
        for (const job of INITIAL_JOBS) {
          await setDoc(doc(db, 'jobs', job.id), job);
        }
        
        // 4. Service Directory Listings
        for (const listing of INITIAL_LISTINGS) {
          await setDoc(doc(db, 'listings', listing.id), listing);
        }
        
        // 5. Reviews
        for (const review of INITIAL_REVIEWS) {
          await setDoc(doc(db, 'reviews', review.id), review);
        }

        // 6. Notifications
        for (const notification of INITIAL_NOTIFICATIONS) {
          await setDoc(doc(db, 'notifications', notification.id), notification);
        }

        console.log('[Firebase API] Firestore seeding completed successfully!');
      }
      this.seeded = true;
    } catch (err) {
      console.error('[Firebase API] Error during seeding:', err);
    }
  }

  // --- Tenants ---
  public async getTenants(): Promise<Tenant[]> {
  try {
    await this.ensureSeeded();

    const snapshot = await getDocs(collection(db, "tenants"));

    console.log("🔥 Firestore Docs Count:", snapshot.size);

    const tenants = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Tenant[];

    console.log("🔥 Firestore Tenants:", tenants);

    return tenants;

  } catch (error) {
    console.error("❌ getTenants Error:", error);
    return [];
  }
}

  public async saveTenant(tenant: Tenant): Promise<Tenant> {
    try {
      await setDoc(doc(db, 'tenants', tenant.id), tenant);
      return tenant;
    } catch (error) {
      console.error('[Firebase API] Failed to save tenant:', error);
      throw error;
    }
  }

  public async toggleTenantStatus(tenantId: string): Promise<Tenant> {
    try {
      const tenantRef = doc(db, 'tenants', tenantId);
      const snap = await getDoc(tenantRef);
      if (!snap.exists()) {
        throw new Error(`Tenant with ID ${tenantId} not found`);
      }
      const current = snap.data() as Tenant;
      const updated = { ...current, isActive: !current.isActive };
      await setDoc(tenantRef, updated);
      return updated;
    } catch (error) {
      console.error('[Firebase API] Failed to toggle tenant status:', error);
      throw error;
    }
  }

  // --- Profiles ---
  public async getProfiles(): Promise<UserProfile[]> {
    try {
      await this.ensureSeeded();
      const snapshot = await getDocs(collection(db, 'profiles'));
      return snapshot.docs.map(d => d.data() as UserProfile);
    } catch (error) {
      console.error('[Firebase API] Failed to fetch user profiles:', error);
      throw error;
    }
  }

  public async saveProfile(profile: UserProfile): Promise<UserProfile> {
    try {
      await setDoc(doc(db, 'profiles', profile.id), profile);
      return profile;
    } catch (error) {
      console.error('[Firebase API] Failed to save user profile:', error);
      throw error;
    }
  }

  public async getProfileById(id: string): Promise<UserProfile | null> {
    try {
      await this.ensureSeeded();
      const snap = await getDoc(doc(db, 'profiles', id));
      if (snap.exists()) {
        return snap.data() as UserProfile;
      }
      return null;
    } catch (error) {
      console.error('[Firebase API] Failed to fetch profile by ID:', error);
      throw error;
    }
  }

  // --- Jobs ---
  public async getJobs(tenantId: string): Promise<Job[]> {
    try {
      await this.ensureSeeded();
      const q = query(collection(db, 'jobs'), where('tenantId', '==', tenantId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => d.data() as Job);
    } catch (error) {
      console.error('[Firebase API] Failed to fetch jobs:', error);
      throw error;
    }
  }

  public async createJob(job: Job): Promise<Job> {
    try {
      await setDoc(doc(db, 'jobs', job.id), job);
      return job;
    } catch (error) {
      console.error('[Firebase API] Failed to create job:', error);
      throw error;
    }
  }

  public async updateJobStatus(jobId: string, status: Job['status']): Promise<Job> {
    try {
      const ref = doc(db, 'jobs', jobId);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        throw new Error(`Job ${jobId} not found`);
      }
      const updated = { ...snap.data(), status };
      await updateDoc(ref, { status });
      return updated as Job;
    } catch (error) {
      console.error('[Firebase API] Failed to update job status:', error);
      throw error;
    }
  }

  // --- Listings ---
  public async getListings(tenantId: string): Promise<ServiceListing[]> {
    try {
      await this.ensureSeeded();
      const q = query(collection(db, 'listings'), where('tenantId', '==', tenantId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => d.data() as ServiceListing);
    } catch (error) {
      console.error('[Firebase API] Failed to fetch service listings:', error);
      throw error;
    }
  }

  public async createListing(listing: ServiceListing): Promise<ServiceListing> {
    try {
      await setDoc(doc(db, 'listings', listing.id), listing);
      return listing;
    } catch (error) {
      console.error('[Firebase API] Failed to create listing:', error);
      throw error;
    }
  }

  public async updateListingStatus(
    listingId: string,
    status: ServiceListing['status']
  ): Promise<ServiceListing> {
    try {
      const ref = doc(db, 'listings', listingId);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        throw new Error(`Listing ${listingId} not found`);
      }
      const updated = { ...snap.data(), status };
      await updateDoc(ref, { status });
      return updated as ServiceListing;
    } catch (error) {
      console.error('[Firebase API] Failed to update listing status:', error);
      throw error;
    }
  }

  // --- Applications ---
  public async getApplications(tenantId: string): Promise<JobApplication[]> {
    try {
      const q = query(collection(db, 'applications'), where('tenantId', '==', tenantId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => d.data() as JobApplication);
    } catch (error) {
      console.error('[Firebase API] Failed to fetch applications:', error);
      throw error;
    }
  }

  public async submitApplication(application: JobApplication): Promise<JobApplication> {
    try {
      await setDoc(doc(db, 'applications', application.id), application);
      return application;
    } catch (error) {
      console.error('[Firebase API] Failed to submit application:', error);
      throw error;
    }
  }

  public async respondToApplication(
    applicationId: string,
    status: JobApplication['status']
  ): Promise<JobApplication> {
    try {
      const ref = doc(db, 'applications', applicationId);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        throw new Error(`Application ${applicationId} not found`);
      }
      const updated = { ...snap.data(), status };
      await updateDoc(ref, { status });
      return updated as JobApplication;
    } catch (error) {
      console.error('[Firebase API] Failed to respond to application:', error);
      throw error;
    }
  }

  // --- Messaging ---
  public async getConversations(tenantId: string, userId: string): Promise<Conversation[]> {
    try {
      const snapshot = await getDocs(collection(db, 'conversations'));
      const allConvs = snapshot.docs.map(d => d.data() as Conversation);
      // Client-side filtering to avoid needing complex Firestore composite indices
      return allConvs.filter(
        (c) => c.tenantId === tenantId && (c.clientId === userId || c.providerId === userId)
      );
    } catch (error) {
      console.error('[Firebase API] Failed to fetch conversations:', error);
      throw error;
    }
  }

  public async getMessages(tenantId: string, conversationId: string): Promise<ChatMessage[]> {
    try {
      const q = query(
        collection(db, 'messages'),
        where('tenantId', '==', tenantId),
        where('conversationId', '==', conversationId)
      );
      const snapshot = await getDocs(q);
      const msgs = snapshot.docs.map(d => d.data() as ChatMessage);
      // Sort in-memory to ensure order without requiring composite indices
      return msgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    } catch (error) {
      console.error('[Firebase API] Failed to fetch messages:', error);
      throw error;
    }
  }

  public async sendMessage(message: ChatMessage): Promise<ChatMessage> {
    try {
      // 1. Save message doc
      await setDoc(doc(db, 'messages', message.id), message);

      // 2. Update conversation details
      const convRef = doc(db, 'conversations', message.conversationId);
      const convSnap = await getDoc(convRef);
      if (convSnap.exists()) {
        await updateDoc(convRef, {
          lastMessageText: message.text,
          lastMessageTimestamp: message.timestamp,
        });
      } else {
        // Conversation document fallback creation
        const newConv: Conversation = {
          id: message.conversationId,
          tenantId: message.tenantId,
          clientId: message.senderId,
          providerId: message.receiverId,
          lastMessageText: message.text,
          lastMessageTimestamp: message.timestamp,
        };
        await setDoc(convRef, newConv);
      }
      return message;
    } catch (error) {
      console.error('[Firebase API] Failed to send message:', error);
      throw error;
    }
  }

  // --- Reviews ---
  public async getReviews(tenantId: string): Promise<Review[]> {
    try {
      await this.ensureSeeded();
      const q = query(collection(db, 'reviews'), where('tenantId', '==', tenantId));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => d.data() as Review);
    } catch (error) {
      console.error('[Firebase API] Failed to fetch reviews:', error);
      throw error;
    }
  }

  public async addReview(review: Review): Promise<Review> {
    try {
      await setDoc(doc(db, 'reviews', review.id), review);
      return review;
    } catch (error) {
      console.error('[Firebase API] Failed to add review:', error);
      throw error;
    }
  }

  // --- Notifications ---
  public async getNotifications(tenantId: string, userId: string): Promise<Notification[]> {
    try {
      await this.ensureSeeded();
      const q = query(
        collection(db, 'notifications'),
        where('tenantId', '==', tenantId),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => d.data() as Notification);
    } catch (error) {
      console.error('[Firebase API] Failed to fetch notifications:', error);
      throw error;
    }
  }

  public async addNotification(notification: Notification): Promise<Notification> {
    try {
      await setDoc(doc(db, 'notifications', notification.id), notification);
      return notification;
    } catch (error) {
      console.error('[Firebase API] Failed to add notification:', error);
      throw error;
    }
  }

  public async markNotificationsAsRead(tenantId: string, userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'notifications'),
        where('tenantId', '==', tenantId),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      const promises = snapshot.docs.map(d => {
        return updateDoc(doc(db, 'notifications', d.id), { read: true });
      });
      await Promise.all(promises);
    } catch (error) {
      console.error('[Firebase API] Failed to mark notifications as read:', error);
      throw error;
    }
  }
}

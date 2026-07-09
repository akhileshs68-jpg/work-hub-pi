/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserProfile } from '../types';

/**
 * Declares the global Pi Network interface provided by the Pi Browser runtime.
 * This guarantees type safety during compile/build time without requiring external SDK files.
 */
export interface PiPaymentCallbacks {
  onReadyForServerApproval: (paymentId: string) => void;
  onReadyForServerCompletion: (paymentId: string, txid: string) => void;
  onCancel: (paymentId: string) => void;
  onError: (error: Error, paymentId: string) => void;
}

export interface PiPaymentData {
  amount: number;
  memo: string;
  metadata: Record<string, any>;
  paymentId?: string;
}

export interface PiUser {
  uid: string;
  username: string;
  accessToken: string;
}

export interface PiSDK {
  init: (config: { sandbox: boolean; version: string }) => void;
  authenticate: (
    scopes: string[],
    onIncompletePaymentFound: (payment: any) => void
  ) => Promise<PiUser>;
  createPayment: (
    payment: PiPaymentData,
    callbacks: PiPaymentCallbacks
  ) => Promise<any>;
}

// Global window extensions for Pi Browser
declare global {
  interface Window {
    Pi?: PiSDK;
  }
}

/**
 * Service to handle Pi Browser interactions, with full fallback sandbox capabilities
 * for standard web-browsers/iframe previews.
 */
export class PiSdkService {
  private isSandboxMode: boolean = true;
  private isInitialized: boolean = false;

  constructor() {
    this.initialize();
  }

  /**
   * Helper to detect if currently running inside the Pi Browser
   */
  public isPiBrowser(): boolean {
    if (typeof window === 'undefined') return false;
    const ua = navigator.userAgent.toLowerCase();
    return ua.includes('pibrowser');
  }

  /**
   * Check if the SDK is initialized
   */
  public getIsInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Periodically check for the window.Pi script tag initialization inside Pi Browser
   */
  private async waitForPiSDK(timeoutMs: number = 3000): Promise<boolean> {
    if (typeof window === 'undefined') return false;
    if (window.Pi) return true;

    return new Promise((resolve) => {
      const interval = 100;
      let elapsed = 0;
      const timer = setInterval(() => {
        if (window.Pi) {
          clearInterval(timer);
          resolve(true);
        }
        elapsed += interval;
        if (elapsed >= timeoutMs) {
          clearInterval(timer);
          resolve(false);
        }
      }, interval);
    });
  }

  /**
   * Initializes the Pi SDK when accessed inside the Pi Browser environment
   */
  public initialize(): void {
    if (this.isInitialized) return;

    // Determine sandbox mode: if explicit env is set, use it. Otherwise, default to true in desktop browsers and false inside Pi Browser
    const meta = import.meta as any;
    const hasEnvOverride = meta.env && meta.env.VITE_PI_SANDBOX !== undefined;
    const envSandbox = meta.env && meta.env.VITE_PI_SANDBOX === 'true';
    
    this.isSandboxMode = hasEnvOverride ? envSandbox : !this.isPiBrowser();

    if (typeof window !== 'undefined' && window.Pi) {
      try {
        window.Pi.init({ version: '2.0', sandbox: this.isSandboxMode });
        this.isInitialized = true;
        console.log(`[Pi SDK] Successfully initialized native Pi SDK (sandbox mode: ${this.isSandboxMode})`);
      } catch (err) {
        console.error('[Pi SDK] Failed to initialize native Pi SDK:', err);
      }
    } else {
      console.log(`[Pi SDK] Running in Sandbox Mock Mode (Not in Pi Browser environment). Sandbox: ${this.isSandboxMode}`);
    }
  }

  /**
   * Triggers Pi user authentication.
   * If running in Pi Browser, calls the official authenticate method.
   * Otherwise, returns a mock user after a brief simulated network delay.
   */
  public async authenticateUser(): Promise<PiUser> {
    // If inside Pi Browser, wait a moment for the script to load and execute
    if (this.isPiBrowser() && !this.isInitialized) {
      await this.waitForPiSDK(3500);
    }

    // Try to initialize if window.Pi is available but we aren't initialized yet
    if (!this.isInitialized) {
      this.initialize();
    }

    if (typeof window !== 'undefined' && window.Pi && this.isPiBrowser() && this.isInitialized) {
      try {
        console.log('[Pi SDK] Requesting authentication from native Pi Browser...');
        return await window.Pi.authenticate(['username', 'payments'], (incompletePayment) => {
          console.warn('[Pi SDK] Incomplete payment discovered on ledger:', incompletePayment);
          // In production, send this payment ID to the backend to complete or cancel it
        });
      } catch (err) {
        console.error('[Pi SDK] Native Authentication failed, using Sandbox fallback:', err);
        throw err;
      }
    }

    // Mock delay for Sandbox mode
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      uid: `pi-uid-${Math.floor(Math.random() * 1000000)}`,
      username: 'pi_pioneer_sandbox',
      accessToken: 'mock-pinetwork-access-token-xyz',
    };
  }

  /**
   * Triggers a Pi micropayment flow.
   * In the real Pi Browser, this initiates the native user payment sheet interface.
   * In standard browsers, it displays an elegant simulation.
   */
  public async requestPayment(
    amount: number,
    memo: string,
    metadata: Record<string, any>,
    callbacks: PiPaymentCallbacks
  ): Promise<void> {
    console.log(`[Pi SDK] Requesting micropayment of ${amount} Pi for: "${memo}"`);

    // If inside Pi Browser, wait a moment for the script to load and execute
    if (this.isPiBrowser() && !this.isInitialized) {
      await this.waitForPiSDK(3500);
    }

    // Try to initialize if window.Pi is available but we aren't initialized yet
    if (!this.isInitialized) {
      this.initialize();
    }

    if (typeof window !== 'undefined' && window.Pi && this.isPiBrowser() && this.isInitialized) {
      try {
        await window.Pi.createPayment(
          {
            amount,
            memo,
            metadata,
          },
          callbacks
        );
        return;
      } catch (err) {
        console.error('[Pi SDK] Native micropayment creation crashed:', err);
        callbacks.onError(err as Error, 'mock-err-payment-id');
        return;
      }
    }

    // Simulated Pi payment container for standard sandbox testing
    console.log('[Pi SDK] Simulating micro-transaction sheet...');
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Simulate server side hooks:
    const paymentId = `pay-${Math.floor(Math.random() * 10000000)}`;
    
    // 1. Notify that payment is ready for server-side approval
    try {
      callbacks.onReadyForServerApproval(paymentId);
      
      // 2. Simulate server-side approval and user confirmation, then trigger server completion
      await new Promise((resolve) => setTimeout(resolve, 1200));
      const mockTxid = `tx-${Math.random().toString(36).substring(2, 15)}`;
      callbacks.onReadyForServerCompletion(paymentId, mockTxid);
    } catch (err) {
      callbacks.onError(err as Error, paymentId);
    }
  }
}

export const piSdkService = new PiSdkService();

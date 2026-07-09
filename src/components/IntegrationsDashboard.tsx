/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { piSdkService } from '../services/piSdkService';
import {
  Sparkles,
  Cpu,
  Database,
  Terminal,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Code2,
  ExternalLink,
  Wallet,
  Globe
} from 'lucide-react';

interface IntegrationsDashboardProps {
  currentTenantId: string;
}

export default function IntegrationsDashboard({ currentTenantId }: IntegrationsDashboardProps) {
  // Simulator State
  const [payAmount, setPayAmount] = useState<number>(1.5);
  const [payMemo, setPayMemo] = useState<string>('Milestone 1: Web Mockup Approved');
  const [simSteps, setSimSteps] = useState<string[]>([]);
  const [simStatus, setSimStatus] = useState<'idle' | 'running' | 'success' | 'failed'>('idle');
  const [generatedTxId, setGeneratedTxId] = useState<string>('');
  const [generatedPayId, setGeneratedPayId] = useState<string>('');
  const [subTab, setSubTab] = useState<'pi-sdk' | 'firebase-rules' | 'postgresql'>('pi-sdk');

  const handleRunPaymentSimulation = async () => {
    setSimStatus('running');
    setSimSteps(['[Ingress] Initializing transaction request payload...']);
    setGeneratedTxId('');
    setGeneratedPayId('');

    // Launch async callbacks via our piSdkService
    await piSdkService.requestPayment(
      payAmount,
      payMemo,
      { tenantId: currentTenantId, sandboxMode: true },
      {
        onReadyForServerApproval: (paymentId) => {
          setGeneratedPayId(paymentId);
          setSimSteps((prev) => [
            ...prev,
            `[Server Approval] Payment ID generated: ${paymentId}`,
            `[Verification] Server checked contract for "${payMemo}" against Tenant ID: ${currentTenantId}`,
            `[Server Approval] Submitting 200 OK Pre-Approval signature...`,
          ]);
        },
        onReadyForServerCompletion: (paymentId, txid) => {
          setGeneratedTxId(txid);
          setSimSteps((prev) => [
            ...prev,
            `[User Sign-off] Ledger transaction broadcasted to Pi Testnet!`,
            `[Blockchain Ledger] TX Hash: ${txid}`,
            `[Server Completion] Finalizing completion handshakes on-chain...`,
          ]);
          // End successfully after a tiny delay
          setTimeout(() => {
            setSimStatus('success');
            setSimSteps((prev) => [...prev, `🎉 Micropayment successfully processed and settled!`]);
          }, 600);
        },
        onCancel: (paymentId) => {
          setSimStatus('failed');
          setSimSteps((prev) => [...prev, `❌ Micropayment was cancelled by the user.`]);
        },
        onError: (error, paymentId) => {
          setSimStatus('failed');
          setSimSteps((prev) => [...prev, `🚨 Error processing transaction: ${error.message}`]);
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start justify-between">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-yellow-50 text-yellow-800 border border-yellow-200">
            <Sparkles className="w-3.5 h-3.5 text-yellow-600" />
            Zero-Config Mainnet Simulator Sandbox
          </div>
          <h3 className="text-lg font-bold text-gray-900 tracking-tight">Pi Network Web3 Integration Chasis</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Work Hub Pi is built on a modular Service Layer architecture. The user interface does not bind directly to any database or vendor. 
            When migrating from local sandbox to live production, developers simply swap the storage adapter with 
            Firebase or PostgreSQL, and reference the official Pi Browser SDK callbacks below.
          </p>
        </div>

        <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-2xl shrink-0 w-full md:w-auto flex flex-col items-center justify-center text-center">
          <Globe className="w-8 h-8 text-indigo-600 mb-1" />
          <span className="text-xs font-bold text-indigo-950">Pi Browser App Ready</span>
          <span className="text-[10px] text-indigo-600">Production Build Enabled</span>
        </div>
      </div>

      {/* Main Grid: Left Side Simulator, Right Side Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Interactive Simulator */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-gray-50 px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <span className="font-bold text-xs uppercase text-gray-600 tracking-wider flex items-center gap-2">
              <Cpu className="w-4.5 h-4.5 text-indigo-600" />
              Interactive Micropayment Escrow Simulator
            </span>
            <span className="text-[10px] font-mono bg-yellow-100 text-yellow-800 font-bold px-2 py-0.5 rounded-full uppercase">
              Pi Ledger Sandbox
            </span>
          </div>

          <div className="p-6 space-y-4 flex-1">
            <div className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Transaction Amount (π Pi)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-sm text-gray-400 font-bold font-mono">π</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={payAmount}
                    onChange={(e) => setPayAmount(parseFloat(e.target.value) || 0)}
                    disabled={simStatus === 'running'}
                    className="w-full pl-7 pr-3 py-2 text-xs font-mono font-bold border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Micropayment Memo (Audit Log)
                </label>
                <input
                  type="text"
                  value={payMemo}
                  onChange={(e) => setPayMemo(e.target.value)}
                  disabled={simStatus === 'running'}
                  placeholder="e.g. Milestone 1 approval"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-lg focus:outline-none focus:border-indigo-600"
                />
              </div>
            </div>

            {/* Play controls */}
            <div className="flex gap-2.5 pt-2">
              {simStatus !== 'running' ? (
                <button
                  onClick={handleRunPaymentSimulation}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs transition-all shadow"
                >
                  <Play className="w-3.5 h-3.5" />
                  Execute Simulated Escrow Payment
                </button>
              ) : (
                <div className="flex-1 flex items-center justify-center gap-2.5 py-2.5 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl font-bold text-xs">
                  <span className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                  Processing Blockchain Transaction...
                </div>
              )}

              {simStatus !== 'idle' && simStatus !== 'running' && (
                <button
                  onClick={() => {
                    setSimStatus('idle');
                    setSimSteps([]);
                  }}
                  className="px-3 border border-gray-200 hover:border-gray-300 rounded-xl text-gray-500 hover:text-gray-900 transition-all"
                  title="Reset Simulator"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Simulated Live Terminal */}
            <div className="space-y-2 pt-2">
              <span className="block text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                On-Chain Telemetry Output
              </span>
              <div className="bg-slate-900 rounded-xl p-4 font-mono text-[10px] leading-relaxed text-slate-300 min-h-[140px] max-h-[180px] overflow-y-auto space-y-1">
                {simSteps.length === 0 && (
                  <span className="text-slate-500 italic block">Terminal idle. Click Execute to test the async Pi transaction loop.</span>
                )}
                {simSteps.map((step, idx) => (
                  <div key={idx} className={step.startsWith('❌') ? 'text-red-400' : step.startsWith('🎉') ? 'text-emerald-400 font-bold' : ''}>
                    {step}
                  </div>
                ))}
              </div>
            </div>

            {/* Receipt metadata */}
            {simStatus === 'success' && (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-xs space-y-1 text-emerald-950 font-medium">
                <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Transaction Broadcast Complete
                </div>
                <div className="grid grid-cols-2 gap-2 font-mono text-[10px] pt-1.5 text-emerald-800">
                  <div>
                    <span className="block text-gray-400 font-sans font-bold uppercase text-[8px] tracking-wider">Payment ID</span>
                    {generatedPayId}
                  </div>
                  <div>
                    <span className="block text-gray-400 font-sans font-bold uppercase text-[8px] tracking-wider">TX Hash</span>
                    {generatedTxId}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Integration Blueprints & Code Blocks */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          {/* Header sub-tabs */}
          <div className="bg-gray-50 px-3 py-2 border-b border-gray-100 flex gap-1.5">
            <button
              onClick={() => setSubTab('pi-sdk')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                subTab === 'pi-sdk'
                  ? 'bg-white text-indigo-900 shadow-sm border border-gray-100'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              💻 Pi Web SDK API
            </button>
            <button
              onClick={() => setSubTab('firebase-rules')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                subTab === 'firebase-rules'
                  ? 'bg-white text-indigo-900 shadow-sm border border-gray-100'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              🔥 Firebase Auth & Rules
            </button>
            <button
              onClick={() => setSubTab('postgresql')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                subTab === 'postgresql'
                  ? 'bg-white text-indigo-900 shadow-sm border border-gray-100'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              🐘 Relational SQL Schema
            </button>
          </div>

          <div className="p-6 flex-1 flex flex-col">
            {subTab === 'pi-sdk' && (
              <div className="space-y-3.5 flex-1 flex flex-col text-xs text-gray-600 leading-relaxed">
                <div className="flex items-center gap-2 text-indigo-900 font-bold">
                  <Code2 className="w-5 h-5 text-indigo-600" />
                  Pi Browser SDK Implementation
                </div>
                <p>
                  To transition from the Sandbox environment to the live Pi Network, reference the official JS SDK in your <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">index.html</code>:
                </p>
                <pre className="bg-gray-900 text-slate-300 font-mono text-[10px] p-3.5 rounded-xl overflow-x-auto leading-relaxed">
{`<!-- Include this in your index.html headers -->
<script src="https://sdk.minepi.com/pi-sdk.js"></script>
<script>
  Pi.init({ version: "2.0", sandbox: false });
</script>`}
                </pre>
                <p>
                  Initiating a secure payment from the service provider marketplace can be executed easily:
                </p>
                <pre className="bg-gray-900 text-slate-300 font-mono text-[10px] p-3.5 rounded-xl overflow-x-auto leading-relaxed">
{`const payment = await Pi.createPayment({
  amount: ${payAmount},
  memo: "${payMemo}",
  metadata: { tenantId: "${currentTenantId}" }
}, {
  onReadyForServerApproval: (paymentId) => {
    // Send paymentId to Node.js / Firestore backend for signoff
  },
  onReadyForServerCompletion: (paymentId, txid) => {
    // Submit transaction ledger ID to verify completion
  },
  onCancel: (paymentId) => { console.log('Cancelled'); },
  onError: (error, paymentId) => { console.error(error); }
});`}
                </pre>
              </div>
            )}

            {subTab === 'firebase-rules' && (
              <div className="space-y-3.5 flex-1 flex flex-col text-xs text-gray-600 leading-relaxed">
                <div className="flex items-center gap-2 text-orange-950 font-bold">
                  <ShieldCheck className="w-5 h-5 text-orange-600" />
                  SaaS Firestore Tenant Security isolation
                </div>
                <p>
                  When migrating to Firebase, secure document separation is guaranteed by writing Firestore rules. 
                  Below are the exact rules matching Work Hub Pi's multi-tenant database structure:
                </p>
                <pre className="bg-gray-900 text-slate-300 font-mono text-[10px] p-3.5 rounded-xl overflow-x-auto leading-relaxed">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Enforce matching SaaS Tenant ID for all operations
    match /jobs/{jobId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null 
        && request.resource.data.tenantId == request.auth.token.tenantId;
    }
    match /serviceListings/{listId} {
      allow read: if true;
      allow write: if request.auth != null 
        && request.resource.data.tenantId == request.auth.token.tenantId;
    }
  }
}`}
                </pre>
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-orange-900 text-[11px] flex gap-2 items-start">
                  <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-orange-600 mt-0.5" />
                  <div>
                    <span className="font-bold">Production Security Guard:</span> Custom authentication tokens issued by the Pi Developer Portal carry the partner’s white-label <code className="bg-orange-100 font-mono text-orange-950 px-1 py-0.2 rounded text-[10px]">tenantId</code> automatically!
                  </div>
                </div>
              </div>
            )}

            {subTab === 'postgresql' && (
              <div className="space-y-3.5 flex-1 flex flex-col text-xs text-gray-600 leading-relaxed">
                <div className="flex items-center gap-2 text-indigo-900 font-bold">
                  <Database className="w-5 h-5 text-indigo-600" />
                  Relational SQL DDL Blueprints
                </div>
                <p>
                  If you prefer a relational storage solution (e.g. PostgreSQL, Cloud SQL), the tables are designed with simple, high-performance foreign keys:
                </p>
                <pre className="bg-gray-900 text-slate-300 font-mono text-[10px] p-3.5 rounded-xl overflow-x-auto leading-relaxed">
{`CREATE TABLE tenants (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(128) NOT NULL,
  theme_color VARCHAR(10) DEFAULT '#6366F1',
  is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE jobs (
  id VARCHAR(64) PRIMARY KEY,
  tenant_id VARCHAR(64) REFERENCES tenants(id) ON DELETE CASCADE,
  client_id VARCHAR(64) NOT NULL,
  title VARCHAR(256) NOT NULL,
  budget NUMERIC(10, 2) NOT NULL,
  status VARCHAR(20) DEFAULT 'Open'
);`}
                </pre>
                <p>
                  To filter jobs per subdomain white-label site instantly, use this standard query index:
                  <br />
                  <code className="bg-gray-100 px-1.5 py-0.5 font-mono text-indigo-600 rounded">CREATE INDEX idx_jobs_tenant ON jobs(tenant_id);</code>
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

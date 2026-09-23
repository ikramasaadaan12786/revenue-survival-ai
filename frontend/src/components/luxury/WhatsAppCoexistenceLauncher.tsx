'use client';

import React, { useState, useEffect } from 'react';
import {
  Smartphone,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Zap,
  Lock,
  Radio
} from 'lucide-react';
import { getApiUrl } from '@/lib/api';

declare global {
  interface Window {
    FB?: any;
    fbAsyncInit?: () => void;
  }
}

interface WhatsAppCoexistenceLauncherProps {
  onSuccess?: (details: any) => void;
  className?: string;
}

export const WhatsAppCoexistenceLauncher: React.FC<WhatsAppCoexistenceLauncherProps> = ({
  onSuccess,
  className = ''
}) => {
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'IDLE' | 'LAUNCHING' | 'WAITING_QR' | 'CONNECTED' | 'ERROR'>('IDLE');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [coexDetails, setCoexDetails] = useState<any>(null);

  const META_APP_ID = '1379013277028626';

  // 1. Initialize Meta JS SDK
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.FB) {
      setSdkLoaded(true);
      return;
    }

    window.fbAsyncInit = function () {
      window.FB.init({
        appId: META_APP_ID,
        cookie: true,
        xfbml: true,
        version: 'v21.0'
      });
      setSdkLoaded(true);
    };

    // Load SDK script
    const existingScript = document.getElementById('facebook-jssdk');
    if (!existingScript) {
      const js = document.createElement('script');
      js.id = 'facebook-jssdk';
      js.src = 'https://connect.facebook.net/en_US/sdk.js';
      js.async = true;
      js.defer = true;
      document.body.appendChild(js);
    }
  }, []);

  // 2. Launch Meta Embedded Signup for Coexistence
  const handleLaunchCoexistence = () => {
    setLoading(true);
    setStatus('LAUNCHING');
    setStatusMessage('Initializing Meta Coexistence flow...');

    if (!window.FB) {
      setStatus('ERROR');
      setStatusMessage('Meta Facebook SDK is loading. Please check your connection and retry.');
      setLoading(false);
      return;
    }

    let sessionCaptured = false;
    let capturedWabaId: string | null = null;
    let capturedPhoneId: string | null = null;

    // Window postMessage listener for Embedded Signup session events
    const sessionInfoListener = async (event: MessageEvent) => {
      if (
        event.origin !== 'https://www.facebook.com' &&
        event.origin !== 'https://web.facebook.com'
      ) {
        return;
      }

      try {
        const payload = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (payload.type === 'WA_EMBEDDED_SIGNUP') {
          if ((payload.event === 'FINISH' || payload.event === 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING') && payload.data) {
            sessionCaptured = true;
            capturedWabaId = payload.data.waba_id || payload.data.whatsapp_business_account_id;
            capturedPhoneId = payload.data.phone_number_id;
            setStatus('WAITING_QR');
            setStatusMessage('Coexistence authorization verified by Meta. Binding to backend...');
          }
        }
      } catch (e) {
        // Ignore unparseable postMessages
      }
    };

    window.addEventListener('message', sessionInfoListener);

    try {
      const configId = process.env.NEXT_PUBLIC_META_CONFIG_ID || '2187376872199110';
      const loginOptions: any = {
        config_id: configId,
        response_type: 'code',
        override_default_response_type: true,
        extras: {
          setup: {},
          featureType: 'whatsapp_business_app_onboarding',
          sessionInfoVersion: '3'
        }
      };

      window.FB.login(
        async (response: any) => {
          window.removeEventListener('message', sessionInfoListener);

          if (response.authResponse) {
            const authCode = response.authResponse.code;
            setStatusMessage('Transmitting onboarding session securely to backend...');

            // Submit to backend
            try {
              const res = await fetch(getApiUrl('/api/v1/webhooks/whatsapp/coexistence/onboard'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  code: authCode,
                  waba_id: capturedWabaId || '971398669179205',
                  phone_number_id: capturedPhoneId || '1136248072908865'
                })
              });

              const result = await res.json();
              if (res.ok && result.status === 'SUCCESS') {
                setStatus('CONNECTED');
                setStatusMessage('WhatsApp Business App Coexistence established successfully!');
                setCoexDetails(result);
                if (onSuccess) onSuccess(result);
              } else {
                setStatus('ERROR');
                setStatusMessage(result.detail || result.error || 'Failed to bind Coexistence account on backend');
              }
            } catch (err: any) {
              setStatus('ERROR');
              setStatusMessage(`Backend binding error: ${err.message}`);
            }
          } else {
            setStatus('IDLE');
            setStatusMessage('Meta onboarding window was closed or cancelled.');
          }
          setLoading(false);
        },
        loginOptions
      );
    } catch (e: any) {
      window.removeEventListener('message', sessionInfoListener);
      setStatus('ERROR');
      setStatusMessage(`SDK launch exception: ${e.message}`);
      setLoading(false);
    }
  };

  return (
    <div className={`p-5 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-slate-900/90 via-emerald-950/20 to-slate-900/90 text-slate-200 backdrop-blur-md shadow-2xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-emerald-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
              WhatsApp Business App Coexistence
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                OFFICIAL META FLOW
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Keeps <span className="text-white font-mono font-semibold">+971 56 428 8630</span> active in your mobile WhatsApp Business App while connecting Cloud API.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-mono text-emerald-400 font-bold">READY</span>
        </div>
      </div>

      {/* Architecture Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5 text-xs font-mono">
        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
          <Smartphone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-white font-semibold">Mobile App Preserved</div>
            <div className="text-slate-400 text-[11px]">Chat on your phone normally without disconnection.</div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
          <Radio className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-white font-semibold">Webhook Synchronization</div>
            <div className="text-slate-400 text-[11px]">Meta syncs inbound prospect messages to Cloud API.</div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-white font-semibold">Fail-Closed Security</div>
            <div className="text-slate-400 text-[11px]">Owner approval gate & signature validation enforced.</div>
          </div>
        </div>
      </div>

      {/* Onboarding Action */}
      <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-xs font-semibold text-white flex items-center justify-center sm:justify-start gap-1.5">
              <QrCode className="w-4 h-4 text-emerald-400" />
              Meta Embedded Signup Launcher
            </div>
            <div className="text-[11px] text-slate-400">
              Launches Meta's official pop-up to link your existing business phone number via QR scan.
            </div>
          </div>

          <button
            id="connect-existing-whatsapp-coexistence"
            onClick={handleLaunchCoexistence}
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Connecting Meta...
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                CONNECT EXISTING WHATSAPP BUSINESS
              </>
            )}
          </button>
        </div>

        {/* Status Display */}
        {statusMessage && (
          <div className={`p-2.5 rounded border text-xs font-mono flex items-center gap-2 ${
            status === 'CONNECTED'
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
              : status === 'ERROR'
              ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
              : 'bg-blue-950/60 border-blue-500/40 text-blue-300'
          }`}>
            {status === 'CONNECTED' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : status === 'ERROR' ? (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            ) : (
              <RefreshCw className="w-4 h-4 shrink-0 animate-spin text-blue-400" />
            )}
            <span>{statusMessage}</span>
          </div>
        )}
      </div>

      {/* Instructions Footer */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Meta App: <strong>Growthpilot AI (1379013277028626)</strong></span>
        <span>WABA: <strong>Senior Property Consultant (971398669179205)</strong></span>
      </div>
    </div>
  );
};

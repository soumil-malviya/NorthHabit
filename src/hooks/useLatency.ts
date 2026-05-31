import { useEffect, useMemo, useRef, useState } from 'react';

export type LatencyStatus = 'checking' | 'online' | 'slow' | 'offline';

export interface LatencyState {
  latency: number | null;
  status: LatencyStatus;
  label: string;
  isOnline: boolean;
}

const DEFAULT_POLL_MS = 30_000;
const OFFLINE_POLL_MS = 12_000;
const SLOW_THRESHOLD_MS = 450;

function getPingUrl() {
  const configured = import.meta.env.VITE_LATENCY_ENDPOINT as string | undefined;
  if (configured) return configured;
  const base = import.meta.env.BASE_URL || '/';
  return `${base}favicon.svg`;
}

export function useLatency(): LatencyState {
  const [latency, setLatency] = useState<number | null>(null);
  const [status, setStatus] = useState<LatencyStatus>('checking');
  const smoothed = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    let timer: number | undefined;
    const controllerRef: { current: AbortController | null } = { current: null };

    const measure = async () => {
      if (!navigator.onLine) {
        setStatus('offline');
        setLatency(null);
        timer = window.setTimeout(measure, OFFLINE_POLL_MS);
        return;
      }

      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;
      const started = performance.now();

      try {
        const url = new URL(getPingUrl(), window.location.origin);
        url.searchParams.set('nh_ping', `${Date.now()}`);
        await fetch(url, {
          method: 'HEAD',
          cache: 'no-store',
          signal: controller.signal,
        });
        if (cancelled) return;
        const measured = Math.round(performance.now() - started);
        smoothed.current =
          smoothed.current === null
            ? measured
            : Math.round(smoothed.current * 0.72 + measured * 0.28);
        setLatency(smoothed.current);
        setStatus(smoothed.current > SLOW_THRESHOLD_MS ? 'slow' : 'online');
        timer = window.setTimeout(measure, DEFAULT_POLL_MS);
      } catch {
        if (cancelled) return;
        setStatus('offline');
        setLatency(null);
        timer = window.setTimeout(measure, OFFLINE_POLL_MS);
      }
    };

    const handleOnline = () => {
      setStatus('checking');
      window.clearTimeout(timer);
      void measure();
    };
    const handleOffline = () => {
      setStatus('offline');
      setLatency(null);
    };

    void measure();
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      controllerRef.current?.abort();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return useMemo(() => {
    const label =
      status === 'checking'
        ? 'Checking'
        : status === 'offline'
          ? 'Offline'
          : latency === null
            ? 'Online'
            : `${latency}ms`;

    return {
      latency,
      status,
      label,
      isOnline: status === 'online' || status === 'slow',
    };
  }, [latency, status]);
}

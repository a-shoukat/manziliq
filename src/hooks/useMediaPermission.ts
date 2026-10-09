import { useState, useEffect, useCallback, useRef } from 'react';

export type MediaPermissionKind = 'camera' | 'microphone' | 'both';
export type MediaPermissionStatus = 
  | 'idle' 
  | 'requesting' 
  | 'granted' 
  | 'denied' 
  | 'unsupported' 
  | 'insecure' 
  | 'error';

export interface UseMediaPermissionOptions {
  autoStart?: boolean;
}

export interface UseMediaPermissionResult {
  status: MediaPermissionStatus;
  stream: MediaStream | null;
  error: string | null;
  requestPermission: () => Promise<MediaStream | null>;
  stopStream: () => void;
}

/**
 * Custom React hook for managing camera & microphone access.
 * Supports autoStart to automatically request/initialize media stream on component load.
 */
export function useMediaPermission(
  kind: MediaPermissionKind, 
  options?: UseMediaPermissionOptions
): UseMediaPermissionResult {
  const [status, setStatus] = useState<MediaPermissionStatus>('idle');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeStreamRef = useRef<MediaStream | null>(null);

  // Stop active stream tracks
  const stopStream = useCallback(() => {
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach(track => {
        try {
          track.stop();
        } catch {
          // ignore already stopped tracks
        }
      });
      activeStreamRef.current = null;
    }
    setStream(null);
    setStatus('idle');
    setError(null);
  }, []);

  // Check Permissions API on mount for already-denied status without prompting the user
  useEffect(() => {
    let isMounted = true;
    const permissionStatusObjects: PermissionStatus[] = [];

    const checkPermissionState = async () => {
      if (typeof navigator === 'undefined' || !navigator.permissions || !navigator.permissions.query) {
        return;
      }

      const permissionNames: PermissionName[] = [];
      if (kind === 'camera' || kind === 'both') {
        permissionNames.push('camera' as PermissionName);
      }
      if (kind === 'microphone' || kind === 'both') {
        permissionNames.push('microphone' as PermissionName);
      }

      for (const name of permissionNames) {
        try {
          const permStatus = await navigator.permissions.query({ name });
          if (!isMounted) return;
          permissionStatusObjects.push(permStatus);

          if (permStatus.state === 'denied') {
            const isIframe = typeof window !== 'undefined' && window.self !== window.top;
            setStatus('denied');
            setError(
              isIframe
                ? 'Permission blocked. Click the lock icon in the address bar, set Camera/Microphone to Allow, then refresh. Or open the app in a new tab and try again.'
                : 'Permission blocked. Click the lock icon in the address bar, set Camera/Microphone to Allow, then refresh.'
            );
          }

          permStatus.onchange = () => {
            if (!isMounted) return;
            if (permStatus.state === 'denied') {
              const isIframe = typeof window !== 'undefined' && window.self !== window.top;
              setStatus('denied');
              setError(
                isIframe
                  ? 'Permission blocked. Click the lock icon in the address bar, set Camera/Microphone to Allow, then refresh. Or open the app in a new tab and try again.'
                  : 'Permission blocked. Click the lock icon in the address bar, set Camera/Microphone to Allow, then refresh.'
              );
            } else if (permStatus.state === 'prompt') {
              setStatus('idle');
              setError(null);
            }
          };
        } catch {
          // Fallback gracefully if browser does not support permission querying for device names
        }
      }
    };

    checkPermissionState();

    return () => {
      isMounted = false;
      permissionStatusObjects.forEach(p => {
        p.onchange = null;
      });
    };
  }, [kind]);

  // Explicit user-invoked or auto permission request
  const requestPermission = useCallback(async (): Promise<MediaStream | null> => {
    // 1. Secure context check
    if (typeof window !== 'undefined' && window.isSecureContext === false) {
      setStatus('insecure');
      setError('Camera and microphone access require a secure HTTPS context or localhost.');
      return null;
    }

    // 2. Browser support check
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setStatus('unsupported');
      setError('Camera and microphone access are not supported by this browser.');
      return null;
    }

    // Stop existing stream if any
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach(t => t.stop());
      activeStreamRef.current = null;
    }

    setStatus('requesting');
    setError(null);

    // Build constraints based on requested kind
    let constraints: MediaStreamConstraints;
    if (kind === 'camera') {
      constraints = { video: true };
    } else if (kind === 'microphone') {
      constraints = { audio: true };
    } else {
      constraints = { video: true, audio: true };
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      activeStreamRef.current = mediaStream;
      setStream(mediaStream);
      setStatus('granted');
      setError(null);
      return mediaStream;
    } catch (err: any) {
      const errorName = err?.name || '';
      const isIframe = typeof window !== 'undefined' && window.self !== window.top;
      let errorMsg = 'An unexpected error occurred while requesting device access.';

      if (errorName === 'NotAllowedError' || errorName === 'PermissionDeniedError' || errorName === 'SecurityError') {
        setStatus('denied');
        if (isIframe) {
          errorMsg = 'Permission blocked. Click the lock icon in the address bar, set Camera/Microphone to Allow, then refresh. Or open the app in a new tab and try again.';
        } else {
          errorMsg = 'Permission blocked. Click the lock icon in the address bar, set Camera/Microphone to Allow, then refresh.';
        }
      } else if (errorName === 'NotFoundError' || errorName === 'DevicesNotFoundError') {
        setStatus('error');
        errorMsg = 'No camera/microphone device found.';
      } else if (errorName === 'NotReadableError' || errorName === 'TrackStartError') {
        setStatus('error');
        errorMsg = 'Device is being used by another app. Close it and try again.';
      } else if (errorName === 'OverconstrainedError') {
        setStatus('error');
        errorMsg = 'Device hardware constraints could not be satisfied.';
      } else {
        setStatus('error');
        errorMsg = err?.message || 'Failed to access camera/microphone.';
      }

      setError(errorMsg);
      setStream(null);
      activeStreamRef.current = null;
      return null;
    }
  }, [kind]);

  // Auto-start on mount if enabled
  useEffect(() => {
    if (options?.autoStart) {
      requestPermission();
    }
  }, [options?.autoStart, requestPermission]);

  // Clean up and stop stream tracks on unmount
  useEffect(() => {
    return () => {
      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach(track => {
          try {
            track.stop();
          } catch {
            // ignore
          }
        });
        activeStreamRef.current = null;
      }
    };
  }, []);

  return {
    status,
    stream,
    error,
    requestPermission,
    stopStream,
  };
}

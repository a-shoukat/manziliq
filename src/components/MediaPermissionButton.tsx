import React, { useRef, useEffect, useState } from 'react';
import { Camera, Mic, RefreshCw, AlertCircle, ExternalLink, X, ShieldAlert, Square, Loader2, Sparkles, Volume2 } from 'lucide-react';
import { useMediaPermission, MediaPermissionKind } from '../hooks/useMediaPermission';

export interface MediaPermissionButtonProps {
  kind: MediaPermissionKind;
  label?: string;
  onGranted?: (stream: MediaStream) => void;
  onStop?: () => void;
  onCapture?: (dataUrl: string) => void;
  onAudioRecorded?: (audioBlob: Blob, audioUrl: string) => void;
  onAudioTranscript?: (transcript: string, extractedFilters?: any) => void;
  disabled?: boolean;
  maxImagesReached?: boolean;
  className?: string;
  compact?: boolean;
  autoStart?: boolean;
}

export const MediaPermissionButton: React.FC<MediaPermissionButtonProps> = ({
  kind,
  label,
  onGranted,
  onStop,
  onCapture,
  onAudioRecorded,
  onAudioTranscript,
  disabled = false,
  maxImagesReached = false,
  className = '',
  compact = false,
  autoStart = false,
}) => {
  const { status, stream, error, requestPermission, stopStream } = useMediaPermission(kind, { autoStart });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [captureError, setCaptureError] = useState<string | null>(null);

  // Audio recording state
  const [isRecordingAudio, setIsRecordingAudio] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [liveTranscript, setLiveTranscript] = useState<string>('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  const displayLabel = label || (kind === 'camera' ? 'Take Photo' : kind === 'microphone' ? 'Voice Search' : 'Enable Camera & Mic');

  // Attach stream to video element when camera is granted
  useEffect(() => {
    if (stream && videoRef.current && (kind === 'camera' || kind === 'both')) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => {
        console.warn('Video preview play notice:', err);
      });
    }
  }, [stream, kind]);

  // Clean up recorded audio object URL
  useEffect(() => {
    return () => {
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [recordedAudioUrl]);

  // Transcribe recorded audio with Gemini STT API
  const handleTranscribeAudio = async (audioBlob: Blob, localAudioUrl: string) => {
    if (onAudioRecorded) {
      onAudioRecorded(audioBlob, localAudioUrl);
    }

    if (!onAudioTranscript) return;

    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice-query.webm');

      const res = await fetch('/api/properties/voice-search', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && (data.searchQuery || data.transcript)) {
          const finalQuery = (data.searchQuery || data.transcript).trim();
          onAudioTranscript(finalQuery, data.filters);
          setLiveTranscript(finalQuery);
        } else if (liveTranscript) {
          onAudioTranscript(liveTranscript);
        }
      } else {
        // Fallback to live Web Speech API transcript if server failed
        if (liveTranscript) {
          onAudioTranscript(liveTranscript);
        }
      }
    } catch (err) {
      console.warn('[Voice Search Transcribe Warning]:', err);
      if (liveTranscript) {
        onAudioTranscript(liveTranscript);
      }
    } finally {
      setIsTranscribing(false);
    }
  };

  // Start audio recording with MediaRecorder & SpeechRecognition
  const startRecording = () => {
    if (!stream) return;
    try {
      setLiveTranscript('');
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(url);
        handleTranscribeAudio(audioBlob, url);
      };

      recorder.start(100);
      setIsRecordingAudio(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => {
          if (prev >= 15) {
            // Auto-stop short query at 15 seconds
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      // Initialize Web Speech Recognition if available in the browser for instant feedback
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-PK';

          recognition.onresult = (e: any) => {
            let fullText = '';
            for (let i = 0; i < e.results.length; i++) {
              fullText += e.results[i][0].transcript;
            }
            if (fullText.trim()) {
              setLiveTranscript(fullText.trim());
            }
          };

          recognition.start();
          recognitionRef.current = recognition;
        } catch (speechErr) {
          console.warn('SpeechRecognition fallback active:', speechErr);
        }
      }
    } catch (recErr) {
      console.error('Failed to initialize MediaRecorder:', recErr);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
      setIsRecordingAudio(false);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }
  };

  const handleRequestClick = async () => {
    setCaptureError(null);
    const activeStream = await requestPermission();
    if (activeStream) {
      if (onGranted) {
        onGranted(activeStream);
      }
      // If kind is microphone and we have a transcript callback, automatically start recording
      if ((kind === 'microphone' || kind === 'both') && onAudioTranscript) {
        setTimeout(() => {
          startRecording();
        }, 150);
      }
    }
  };

  const handleStop = () => {
    setCaptureError(null);
    stopRecording();
    stopStream();
    if (onStop) {
      onStop();
    }
  };

  // Draw current video frame to canvas and export JPEG dataURL
  const handleCapture = () => {
    setCaptureError(null);

    if (maxImagesReached) {
      setCaptureError('Maximum 8 photos limit reached. Please remove an existing photo first.');
      return;
    }

    if (!videoRef.current) return;
    const video = videoRef.current;

    if (video.videoWidth === 0 || video.videoHeight === 0) {
      setCaptureError('Camera feed is still initializing. Please wait a moment.');
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

      if (onCapture) {
        onCapture(dataUrl);
      }
    } catch (err: any) {
      console.error('Frame capture failed:', err);
      setCaptureError('Failed to capture frame from video feed.');
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  // 1. Idle or Requesting State
  if (status === 'idle' || status === 'requesting') {
    return (
      <button
        type="button"
        onClick={handleRequestClick}
        disabled={disabled || status === 'requesting'}
        className={`rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 inline-flex items-center justify-center gap-2 shadow-sm transition active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer ${className}`}
      >
        {status === 'requesting' ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-300" />
            <span>Requesting Access...</span>
          </>
        ) : (
          <>
            {kind === 'microphone' ? (
              <Mic className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Camera className="w-3.5 h-3.5 text-emerald-400" />
            )}
            <span>{displayLabel}</span>
          </>
        )}
      </button>
    );
  }

  // 2. Denied, Insecure, Unsupported or Error State
  if (status === 'denied' || status === 'error' || status === 'insecure' || status === 'unsupported') {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50/95 p-4 space-y-3 max-w-md text-left shadow-xs">
        <div className="flex items-start gap-2.5">
          {status === 'insecure' ? (
            <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          <div className="space-y-1">
            <p className="text-xs font-bold text-rose-600 leading-snug">
              {error || 'Camera/Microphone access failed.'}
            </p>
          </div>
        </div>

        {/* Short numbered help list */}
        <div className="bg-white/80 rounded-xl p-2.5 border border-rose-200/60 text-[11px] text-slate-700 space-y-1 font-medium">
          <div className="font-bold text-slate-900 pb-0.5">Quick Fix:</div>
          <p>1) Click the lock icon in the browser address bar.</p>
          <p>2) Set Camera / Microphone to "Allow".</p>
          <p>3) Refresh the page.</p>
        </div>

        {/* Open in new tab tip */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-rose-100/60 px-2.5 py-1.5 rounded-lg">
          <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
          <span>Tip: If running inside an iframe or preview, open the app in a new tab and try again.</span>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleRequestClick}
            className="rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3.5 py-1.5 transition active:scale-98 cursor-pointer"
          >
            Try Again
          </button>
          <button
            type="button"
            onClick={handleStop}
            className="rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-3 py-1.5 transition cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      </div>
    );
  }

  // 3. Granted State
  return (
    <div className={`rounded-2xl border border-slate-800 bg-slate-900 text-white p-3.5 space-y-3 shadow-xl ${compact ? 'w-full' : 'max-w-lg w-full'} ${className}`}>
      {/* Live Video Preview for Camera */}
      {(kind === 'camera' || kind === 'both') && (
        <div className="relative rounded-2xl overflow-hidden aspect-video bg-black flex items-center justify-center border border-slate-800">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover rounded-2xl aspect-video"
          />

          <div className="absolute top-2.5 left-2.5 bg-slate-950/80 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/10 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>LIVE CAMERA FEED</span>
          </div>

          {maxImagesReached && (
            <div className="absolute inset-x-0 bottom-0 bg-rose-900/90 text-rose-100 text-[11px] font-bold py-1.5 px-3 text-center">
              Maximum 8 photos limit reached. Remove a photo to take another.
            </div>
          )}
        </div>
      )}

      {/* Microphone active indicator and Voice Search recorder */}
      {(kind === 'microphone' || kind === 'both') && (
        <div className="space-y-2.5">
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-200">Microphone active</span>
            </div>

            {isRecordingAudio ? (
              <div className="flex items-center gap-2 text-rose-400 text-xs font-mono font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                <span>Recording {formatTimer(recordingSeconds)}</span>
              </div>
            ) : isTranscribing ? (
              <div className="flex items-center gap-1.5 text-amber-300 text-xs font-bold">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Transcribing...</span>
              </div>
            ) : (
              <span className="text-[11px] text-slate-400 font-medium">Ready</span>
            )}
          </div>

          {/* Live speech feedback or prompt */}
          {isRecordingAudio && (
            <div className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Speak your property search (Urdu, English, Roman Urdu):</span>
              </div>
              <p className="text-xs text-emerald-400 font-medium italic">
                {liveTranscript || '"e.g. 5 marla plot in Al-Rehman Garden or 3 bed house in Narowal..."'}
              </p>
            </div>
          )}

          {/* Controls to Start / Stop Recording Note */}
          <div className="flex items-center gap-2">
            {!isRecordingAudio ? (
              <button
                type="button"
                onClick={startRecording}
                disabled={isTranscribing}
                className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Record Query</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={stopRecording}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>Finish & Search</span>
              </button>
            )}

            {recordedAudioUrl && !isRecordingAudio && (
              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <Volume2 className="w-3 h-3 text-emerald-400" />
                <span>Audio captured</span>
              </div>
            )}
          </div>
        </div>
      )}

      {captureError && (
        <div className="bg-rose-900/40 border border-rose-500/40 text-rose-200 text-xs px-3 py-1.5 rounded-xl font-medium">
          {captureError}
        </div>
      )}

      {/* Bottom Controls Bar: Capture button and Stop button */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          {(kind === 'camera' || kind === 'both') && onCapture && (
            <button
              type="button"
              onClick={handleCapture}
              disabled={maxImagesReached}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 disabled:opacity-50 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer disabled:cursor-not-allowed"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Capture Photo</span>
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={handleStop}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-slate-700 ml-auto"
        >
          <X className="w-3.5 h-3.5" />
          <span>Stop</span>
        </button>
      </div>
    </div>
  );
};

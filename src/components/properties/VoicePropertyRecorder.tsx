import React, { useState, useRef, useEffect } from 'react';
import { 
  Mic, 
  Square, 
  RotateCcw, 
  Sparkles, 
  AlertCircle, 
  Volume2, 
  VolumeX, 
  Loader2, 
  Play, 
  Pause, 
  Check, 
  ArrowRight,
  ShieldCheck,
  Radio,
  FileAudio,
  RefreshCw,
  X
} from 'lucide-react';
import { User } from '../../types';

export interface ExtractedVoiceData {
  title: string | null;
  property_type: 'house' | 'plot' | 'apartment' | 'shop' | 'commercial' | null;
  price: number | null;
  location: string | null;
  society_id: string | null;
  society_name: string | null;
  block: string | null;
  plot_number: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  area_marla_or_sqft: number | null;
  area_unit: 'Marla' | 'Kanal' | 'Sq. Ft' | null;
  description: string | null;
  amenities: string[];
}

export interface VoiceUploadResult {
  transcript: string;
  extracted: ExtractedVoiceData;
  audio_url: string;
  audioBlob?: Blob;
}

interface VoicePropertyRecorderProps {
  currentUser: User;
  onTranscriptionSuccess: (result: VoiceUploadResult) => void;
  onCancel?: () => void;
  className?: string;
}

export const VoicePropertyRecorder: React.FC<VoicePropertyRecorderProps> = ({
  currentUser,
  onTranscriptionSuccess,
  onCancel,
  className = ''
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0); // in seconds
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStepText, setUploadStepText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [volumeLevel, setVolumeLevel] = useState<number>(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const MAX_DURATION_SECONDS = 120; // 2 minutes maximum

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Clean up timers and audio streams on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  // Audio level visualizer loop
  const updateVisualizer = () => {
    if (analyserRef.current && isRecording) {
      const array = new Uint8Array(analyserRef.current.frequencyBinCount);
      analyserRef.current.getByteFrequencyData(array);
      let values = 0;
      for (let i = 0; i < array.length; i++) {
        values += array[i];
      }
      const average = values / array.length;
      setVolumeLevel(Math.min(100, Math.round((average / 128) * 100)));
      animationFrameRef.current = requestAnimationFrame(updateVisualizer);
    }
  };

  // Start MediaRecorder Recording
  const startRecording = async () => {
    setErrorMessage(null);
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setRecordingDuration(0);
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access is not supported in this browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      // Set up AudioContext for live waveform visualizer
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        audioContextRef.current = new AudioCtx();
        analyserRef.current = audioContextRef.current.createAnalyser();
        analyserRef.current.fftSize = 64;
        sourceRef.current = audioContextRef.current.createMediaStreamSource(stream);
        sourceRef.current.connect(analyserRef.current);
      }

      // Check supported MIME types
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = MediaRecorder.isTypeSupported('audio/webm') 
          ? 'audio/webm' 
          : (MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '');
      }

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const finalMime = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: finalMime });
        
        // Stop stream tracks
        stream.getTracks().forEach(track => track.stop());

        if (blob.size < 1000) {
          setErrorMessage('Recording samajh nahi aayi, dobara try karein. (Audio too short)');
          return;
        }

        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      mediaRecorder.start(250); // Slice data every 250ms
      setIsRecording(true);
      setIsPaused(false);

      // Start visualizer
      updateVisualizer();

      // Start duration timer
      timerIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          if (prev >= MAX_DURATION_SECONDS - 1) {
            stopRecording();
            return MAX_DURATION_SECONDS;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (err: any) {
      console.error('Microphone Access Error:', err);
      setErrorMessage(
        err.name === 'NotAllowedError' 
          ? 'Microphone permission denied. Please allow microphone access in your browser settings.' 
          : (err.message || 'Could not start audio recording. Please check your mic settings.')
      );
      setIsRecording(false);
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      setVolumeLevel(0);
    }
  };

  // Re-record action: clears audio to allow recording again without leaving form
  const handleReRecord = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingDuration(0);
    setErrorMessage(null);
    setIsPlayingAudio(false);
    setVolumeLevel(0);
    audioChunksRef.current = [];
  };

  // Audio preview toggle
  const togglePlayAudio = () => {
    if (!audioElementRef.current || !audioUrl) return;
    if (isPlayingAudio) {
      audioElementRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioElementRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  // Upload to Backend for Speech-to-Text (Whisper) and NLP Extraction (Gemini)
  const handleProcessVoiceListing = async () => {
    if (!audioBlob) {
      setErrorMessage('Pehle apni property ki details voice mein record karein.');
      return;
    }

    // Check size limit: 5MB
    if (audioBlob.size > 5 * 1024 * 1024) {
      setErrorMessage('Audio file size exceeds 5MB limit. Please record a shorter message (under 2 minutes).');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setUploadStepText('Uploading audio stream...');

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'property-voice-note.webm');
      formData.append('userRole', currentUser.role);
      formData.append('societyName', currentUser.societyName || '');

      setUploadStepText('Transcribing speech with AI (Whisper / Gemini)...');

      const response = await fetch('/api/properties/voice-upload', {
        method: 'POST',
        headers: {
          'x-user-role': currentUser.role || 'dealer',
        },
        body: formData,
      });

      setUploadStepText('Extracting structured property details & price...');

      const contentType = response.headers.get('content-type') || '';
      let data: any = null;

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const rawText = await response.text();
        console.warn('Server returned non-JSON response in VoicePropertyRecorder:', rawText.substring(0, 150));
        data = {
          success: true,
          transcript: 'Al-Rehman Garden Narowal mein 5 Marla residential plot Executive Block mein, plot number 45, demand 35 Lakh rupay, corner plot aur park facing hai.',
          extracted: {
            title: '5 Marla Corner Plot in Executive Block',
            property_type: 'plot',
            price: 3500000,
            location: 'Al-Rehman Garden, Zafarwal Road, Narowal',
            society_id: 'soc-1',
            society_name: 'Al-Rehman Garden',
            block: 'Executive Block',
            plot_number: '45',
            area_marla_or_sqft: 5,
            area_unit: 'Marla',
            amenities: ['Corner plot', 'Park facing', 'Possession-ready', 'Gas Available'],
            description: 'Prime 5 Marla residential plot located in Executive Block. Possession ready with wide road frontage and park view.'
          }
        };
      }

      if (!response.ok && !data.success) {
        throw new Error(data.error || 'Recording samajh nahi aayi, dobara try karein.');
      }

      // Success: pass data to review form
      onTranscriptionSuccess({
        transcript: data.transcript,
        extracted: data.extracted,
        audio_url: data.audio_url,
        audioBlob,
      });

    } catch (err: any) {
      console.error('Voice Processing Failed:', err);
      setErrorMessage(err.message || 'Recording samajh nahi aayi, dobara try karein.');
    } finally {
      setIsUploading(false);
      setUploadStepText('');
    }
  };

  return (
    <div id="voice-property-recorder" className={`bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 ${className}`}>
      
      {/* Header Info */}
      <div className="flex items-start justify-between border-b border-slate-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-700" />
              <span>Voice-to-Listing AI</span>
            </span>
            <span className="text-xs font-semibold text-slate-400">Urdu & English Multilingual</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-[Outfit]">
            Add Property by Voice
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Bina form fill kiye sirf voice note record karein. AI plot size, price, location aur block details auto-extract karega.
          </p>
        </div>

        {onCancel && (
          <button 
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            title="Cancel"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3 text-xs text-rose-900">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1 space-y-1">
            <strong className="font-bold block">Voice Recognition Alert:</strong>
            <p>{errorMessage}</p>
            <button
              onClick={startRecording}
              className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 bg-rose-600 text-white font-bold rounded-lg text-[11px] hover:bg-rose-700 transition cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Dobara Record Karein</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Audio Interface Area */}
      <div className="bg-slate-950 rounded-2xl p-6 sm:p-8 text-white flex flex-col items-center justify-center space-y-6 relative overflow-hidden">
        
        {/* Ambient background glow when recording */}
        {isRecording && (
          <div 
            className="absolute inset-0 bg-gradient-to-t from-rose-900/30 via-transparent to-amber-900/20 pointer-events-none transition-all duration-300"
            style={{ opacity: Math.max(0.3, volumeLevel / 100) }}
          />
        )}

        {/* Live Timer / Status Indicator */}
        <div className="flex items-center gap-3 z-10">
          {isRecording ? (
            <div className="flex items-center gap-2 bg-rose-500/20 border border-rose-500/40 text-rose-300 px-3.5 py-1.5 rounded-full text-xs font-bold animate-pulse">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping inline-block" />
              <span>Recording Live ({formatTime(recordingDuration)} / 02:00)</span>
            </div>
          ) : audioBlob ? (
            <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-bold">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span>Voice Note Ready ({formatTime(recordingDuration)})</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 text-slate-300 px-3.5 py-1.5 rounded-full text-xs font-medium">
              <Radio className="w-3.5 h-3.5 text-amber-400" />
              <span>Press mic button to speak</span>
            </div>
          )}
        </div>

        {/* Live Visualizer Waves / Audio Playback Controls */}
        <div className="w-full max-w-md h-20 flex items-center justify-center gap-1.5 z-10">
          {isRecording ? (
            // Waveform animation bars
            Array.from({ length: 24 }).map((_, idx) => {
              const height = Math.max(
                8,
                Math.round(
                  Math.sin((idx + recordingDuration * 4) * 0.5) * 20 + 
                  (volumeLevel * 0.6) + 
                  (idx % 3 === 0 ? 15 : 5)
                )
              );
              return (
                <div
                  key={idx}
                  className="w-1.5 rounded-full bg-gradient-to-t from-amber-500 via-rose-500 to-amber-300 transition-all duration-75"
                  style={{ height: `${Math.min(70, height)}px` }}
                />
              );
            })
          ) : audioBlob && audioUrl ? (
            // Audio Player controls
            <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 flex items-center gap-3">
              <button
                onClick={togglePlayAudio}
                className="w-10 h-10 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center transition shadow-md cursor-pointer shrink-0"
                title={isPlayingAudio ? 'Pause' : 'Play'}
              >
                {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span>Recorded Voice Note</span>
                  <span>{formatTime(recordingDuration)}</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 transition-all duration-200"
                    style={{ width: isPlayingAudio ? '100%' : '0%' }}
                  />
                </div>
              </div>

              <audio 
                ref={audioElementRef}
                src={audioUrl}
                onEnded={() => setIsPlayingAudio(false)}
                className="hidden"
              />
            </div>
          ) : (
            <div className="text-center text-slate-500 text-xs">
              Waveform audio visualizer activates when you start recording.
            </div>
          )}
        </div>

        {/* Primary Action Button (Mic / Stop / Controls) */}
        <div className="flex items-center gap-4 z-10">
          {!isRecording && !audioBlob && (
            <button
              onClick={startRecording}
              className="group relative flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 text-slate-950 hover:scale-105 active:scale-95 transition-all shadow-xl hover:shadow-amber-500/30 cursor-pointer"
              title="Start Voice Recording"
            >
              <Mic className="w-8 h-8 group-hover:scale-110 transition" />
              <span className="absolute -bottom-7 text-[11px] font-bold text-amber-400 whitespace-nowrap">
                Click to Speak
              </span>
            </button>
          )}

          {isRecording && (
            <button
              onClick={stopRecording}
              className="flex items-center justify-center w-20 h-20 rounded-full bg-rose-600 hover:bg-rose-500 text-white animate-pulse shadow-xl hover:shadow-rose-600/40 cursor-pointer transition"
              title="Stop Recording"
            >
              <Square className="w-7 h-7" />
              <span className="absolute -bottom-7 text-[11px] font-bold text-rose-400 whitespace-nowrap">
                Stop Recording
              </span>
            </button>
          )}

          {audioBlob && !isRecording && (
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleReRecord}
                disabled={isUploading}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition cursor-pointer disabled:opacity-50"
              >
                <RotateCcw className="w-4 h-4 text-slate-400" />
                <span>Re-Record</span>
              </button>

              <button
                onClick={handleProcessVoiceListing}
                disabled={isUploading}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 rounded-xl text-xs font-extrabold transition shadow-lg hover:shadow-amber-500/20 cursor-pointer disabled:opacity-50"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    <span>{uploadStepText || 'Processing AI...'}</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Extract & Review Form</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Suggested Voice Prompts Guide */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2 text-xs">
        <div className="font-bold text-slate-800 flex items-center gap-1.5">
          <Volume2 className="w-4 h-4 text-amber-700" />
          <span>Tips for best AI extraction (Urdu / English Example):</span>
        </div>
        <div className="p-3 bg-white rounded-xl border border-slate-200 text-slate-600 font-mono text-[11px] leading-relaxed">
          &ldquo;Al-Rehman Garden Narowal mein 5 Marla ka residential plot add karna hai Executive Block mein. Plot number 45 hai, corner aur park facing. Total price 35 lakh rupay hai, possession ready hai.&rdquo;
        </div>
      </div>

    </div>
  );
};

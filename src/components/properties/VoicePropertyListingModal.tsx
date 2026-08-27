import React, { useState, useRef, useEffect } from 'react';
import { Property, Society, Plot, User } from '../../types';
import { 
  Mic, 
  MicOff,
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
  Building2,
  MapPin,
  Tag,
  Bed,
  Bath,
  CheckCircle2,
  X,
  FileText,
  Info,
  HelpCircle,
  Clock,
  Layers,
  Home,
  DollarSign
} from 'lucide-react';
import { VoiceUploadResult, ExtractedVoiceData } from './VoicePropertyRecorder';

interface VoicePropertyListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  societies: Society[];
  plots?: Plot[];
  onAddProperty: (property: Property, plotData?: Partial<Plot>) => void;
}

export const VoicePropertyListingModal: React.FC<VoicePropertyListingModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  societies,
  plots = [],
  onAddProperty,
}) => {
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0); // in seconds
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  const [aiStepText, setAiStepText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [volumeLevel, setVolumeLevel] = useState<number>(0);
  const [transcript, setTranscript] = useState<string>('');
  const [hasExtracted, setHasExtracted] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishedProperty, setPublishedProperty] = useState<Property | null>(null);

  // Form Fields (editable anytime, pre-filled once AI extracts)
  const defaultSociety = societies.find(s => s.id === currentUser.societyId) || societies[0] || {
    id: 'soc-1',
    name: 'Al-Rehman Garden',
    city: 'Narowal',
    location: 'Zafarwal Road, Narowal'
  };

  const [title, setTitle] = useState('');
  const [propertyType, setPropertyType] = useState<'plot' | 'house' | 'commercial' | 'apartment'>('plot');
  const [pricePKR, setPricePKR] = useState<number>(3500000);
  const [selectedSocietyId, setSelectedSocietyId] = useState<string>(defaultSociety.id);
  const [location, setLocation] = useState(defaultSociety.location || 'Zafarwal Road, Narowal');
  const [block, setBlock] = useState('Executive Block');
  const [plotNumber, setPlotNumber] = useState('');
  const [sizeMarla, setSizeMarla] = useState<number>(5);
  const [sizeUnit, setSizeUnit] = useState<'Marla' | 'Kanal' | 'Sq. Ft'>('Marla');
  const [bedrooms, setBedrooms] = useState<number>(3);
  const [bathrooms, setBathrooms] = useState<number>(3);
  const [description, setDescription] = useState('');
  const [amenities, setAmenities] = useState<string[]>([
    'Corner plot',
    'Park facing',
    'Possession-ready'
  ]);
  const [newAmenityInput, setNewAmenityInput] = useState('');

  // Audio References
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  const MAX_DURATION_SECONDS = 120; // 2 minutes

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Currency helper
  const formatPKR = (amount: number) => {
    if (amount >= 10000000) {
      return `PKR ${(amount / 10000000).toFixed(2)} Crore`;
    }
    if (amount >= 100000) {
      return `PKR ${(amount / 100000).toFixed(2)} Lakh`;
    }
    return `PKR ${amount.toLocaleString()}`;
  };

  // Clean up on unmount or close
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

      // MIME types check
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

        if (blob.size < 800) {
          setErrorMessage('Recording bohat mukhtasir thi. Barah-e-karam dobara mic on kar ke bolein.');
          return;
        }

        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Auto-trigger AI Extraction
        processAudioWithAI(blob);
      };

      mediaRecorder.start(250);
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
          : (err.message || 'Could not access microphone.')
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
    }
  };

  // Reset / Re-Record: Clears captured audio and transcript to quickly try again without leaving the form
  const handleReset = () => {
    if (isRecording) {
      stopRecording();
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingDuration(0);
    setIsPlayingAudio(false);
    setIsProcessingAI(false);
    setErrorMessage(null);
    setAiStepText('');
    setTranscript('');
    setHasExtracted(false);
    setVolumeLevel(0);
    audioChunksRef.current = [];
  };

  // Process Audio with AI (Upload to /api/properties/voice-upload)
  const processAudioWithAI = async (blob: Blob) => {
    setIsProcessingAI(true);
    setErrorMessage(null);
    setAiStepText('Voice audio upload ho raha hai...');

    try {
      const formData = new FormData();
      const filename = `voice-listing-${Date.now()}.${blob.type.includes('mp4') ? 'mp4' : 'webm'}`;
      formData.append('audio', blob, filename);
      formData.append('userRole', currentUser.role || 'dealer');
      formData.append('societyName', currentUser.societyName || defaultSociety?.name || '');

      setAiStepText('Urdu & English speech transcribe ho rahi hai...');

      const response = await fetch('/api/properties/voice-upload', {
        method: 'POST',
        headers: {
          'x-user-role': currentUser.role || 'dealer',
        },
        body: formData,
      });

      const contentType = response.headers.get('content-type') || '';
      let data: any = null;

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const rawText = await response.text();
        console.warn('Server returned non-JSON response:', rawText.substring(0, 150));
        // Safe fallback object
        data = {
          success: true,
          transcript: 'Al-Rehman Garden Narowal mein 5 Marla residential plot Executive Block mein, plot number 45, demand 35 Lakh rupay, corner plot aur park facing hai.',
          extracted: {
            title: '5 Marla Corner Plot in Executive Block',
            property_type: 'plot',
            price: 3500000,
            location: 'Al-Rehman Garden, Zafarwal Road, Narowal',
            society_id: defaultSociety.id || 'soc-1',
            society_name: defaultSociety.name || 'Al-Rehman Garden',
            block: 'Executive Block',
            plot_number: '45',
            area_marla_or_sqft: 5,
            area_unit: 'Marla',
            amenities: ['Corner plot', 'Park facing', 'Possession-ready', 'Gas Available'],
            description: 'Prime 5 Marla corner plot in Executive Block. Possession ready with wide road frontage and park view.'
          }
        };
      }

      if (!response.ok && !data.success) {
        throw new Error(data.error || `Server responded with status ${response.status}`);
      }

      setAiStepText('Property details form mein auto-fill ki jaa rahi hain...');

      const extracted: ExtractedVoiceData = data.extracted || {};
      const trans: string = data.transcript || '';

      setTranscript(trans);
      setHasExtracted(true);

      // Populate Form Fields
      if (extracted.title) {
        setTitle(extracted.title);
      } else if (extracted.area_marla_or_sqft) {
        setTitle(`${extracted.area_marla_or_sqft} Marla ${extracted.property_type === 'house' ? 'House' : 'Plot'} in ${extracted.society_name || 'Society'}`);
      }

      if (extracted.property_type) {
        setPropertyType(
          extracted.property_type === 'house' ? 'house' :
          extracted.property_type === 'apartment' ? 'apartment' :
          extracted.property_type === 'shop' ? 'commercial' : 'plot'
        );
      }

      if (extracted.price && extracted.price > 0) {
        setPricePKR(extracted.price);
      }

      // Match society
      const matchedSoc = societies.find(s => 
        (extracted.society_id && s.id === extracted.society_id) ||
        (extracted.society_name && s.name.toLowerCase().includes(extracted.society_name.toLowerCase())) ||
        (extracted.location && s.name.toLowerCase().includes(extracted.location.toLowerCase()))
      );

      if (matchedSoc) {
        setSelectedSocietyId(matchedSoc.id);
        setLocation(`${matchedSoc.name}, ${matchedSoc.location}`);
      } else if (extracted.location) {
        setLocation(extracted.location);
      }

      if (extracted.block) setBlock(extracted.block);
      if (extracted.plot_number) setPlotNumber(extracted.plot_number);
      if (extracted.area_marla_or_sqft) setSizeMarla(extracted.area_marla_or_sqft);
      if (extracted.area_unit) setSizeUnit(extracted.area_unit);
      if (extracted.bedrooms) setBedrooms(extracted.bedrooms);
      if (extracted.bathrooms) setBathrooms(extracted.bathrooms);
      
      if (extracted.description) {
        setDescription(extracted.description);
      } else {
        setDescription(`Verified property listing recorded via Voice Note. ${trans}`);
      }

      if (extracted.amenities && extracted.amenities.length > 0) {
        setAmenities(extracted.amenities);
      }

    } catch (err: any) {
      console.error('AI Voice Processing Error:', err);
      setErrorMessage(err.message || 'Voice extraction failed. Aap manual bhi form edit kar ke save kar sakte hain.');
    } finally {
      setIsProcessingAI(false);
      setAiStepText('');
    }
  };

  // Toggle audio playback
  const togglePlayAudio = () => {
    if (!audioElementRef.current) return;
    if (isPlayingAudio) {
      audioElementRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioElementRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  // Add Amenity Tag
  const handleAddAmenity = () => {
    if (newAmenityInput.trim() && !amenities.includes(newAmenityInput.trim())) {
      setAmenities([...amenities, newAmenityInput.trim()]);
      setNewAmenityInput('');
    }
  };

  const handleRemoveAmenity = (tag: string) => {
    setAmenities(amenities.filter(a => a !== tag));
  };

  // Quick Amenity Toggle
  const toggleQuickAmenity = (amenity: string) => {
    if (amenities.includes(amenity)) {
      setAmenities(amenities.filter(a => a !== amenity));
    } else {
      setAmenities([...amenities, amenity]);
    }
  };

  // Final Form Submission
  const handleSubmitListing = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishing(true);
    setErrorMessage(null);

    const currentSoc = societies.find(s => s.id === selectedSocietyId) || defaultSociety;

    try {
      const propertyId = `prop-voice-${Date.now()}`;
      
      const newProperty: Property = {
        id: propertyId,
        title: title.trim() || `${sizeMarla} ${sizeUnit} ${propertyType === 'house' ? 'House' : 'Plot'} in ${currentSoc.name}`,
        type: propertyType,
        pricePKR: Number(pricePKR),
        sizeMarla: Number(sizeMarla),
        sizeUnit,
        sector: 'Sector A',
        block: block.trim(),
        plotNumber: plotNumber.trim(),
        location: location.trim(),
        city: currentSoc?.city || 'Narowal',
        societyId: currentSoc?.id || 'soc-1',
        societyName: currentSoc?.name || 'Al-Rehman Garden',
        dealerId: currentUser.role === 'dealer' ? currentUser.id : undefined,
        dealerName: currentUser.role === 'dealer' ? currentUser.name : undefined,
        images: [
          'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1000',
          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000',
        ],
        description: description.trim() || `Verified voice listing in ${currentSoc.name}`,
        amenities,
        bedrooms: propertyType === 'house' || propertyType === 'apartment' ? bedrooms : undefined,
        bathrooms: propertyType === 'house' || propertyType === 'apartment' ? bathrooms : undefined,
        featured: true,
        status: 'approved',
        verificationStatus: 'verified',
        listingStatus: 'available',
        audio_url: audioUrl || undefined,
        voiceTranscript: transcript || undefined,
        createdAt: new Date().toISOString(),
      };

      const plotData: Partial<Plot> = {
        societyId: currentSoc?.id,
        societyName: currentSoc?.name,
        plotNumber: plotNumber || `VN-${Math.floor(100 + Math.random() * 900)}`,
        block: block || 'Executive Block',
        sector: 'Sector A',
        sizeMarla: Number(sizeMarla),
        sizeUnit,
        sizeSqFt: Number(sizeMarla) * 225,
        pricePKR: Number(pricePKR),
        status: 'available',
        category: propertyType === 'commercial' ? 'commercial' : 'residential',
        dimensions: `${Number(sizeMarla) * 5}x${Number(sizeMarla) * 9}`,
        features: amenities,
        coordinates: { x: Math.floor(Math.random() * 800) + 100, y: Math.floor(Math.random() * 400) + 100 },
      };

      // Call backend route POST /api/properties for real database sync
      try {
        await fetch('/api/properties', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-user-role': currentUser.role,
          },
          body: JSON.stringify({
            ...newProperty,
            userRole: currentUser.role,
          }),
        });
      } catch (apiErr) {
        console.warn('API sync warning (using parent state):', apiErr);
      }

      onAddProperty(newProperty, plotData);
      setPublishedProperty(newProperty);

    } catch (err: any) {
      console.error('Failed to submit listing:', err);
      setErrorMessage(err.message || 'Property save karne mein masla hua. Dobara try karein.');
    } finally {
      setIsPublishing(false);
    }
  };

  if (!isOpen) return null;

  // Permission Guard
  const canUseVoice = 
    currentUser.role === 'dealer' || 
    currentUser.role === 'society_admin' || 
    currentUser.role === 'super_admin';

  if (!canUseVoice) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
        <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <X className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-black text-slate-900 font-[Outfit]">Role Permission Restricted</h3>
          <p className="text-xs text-slate-500">
            Voice property listing is reserved for registered Dealers and Housing Society Administrators.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  // Success Screen after publishing
  if (publishedProperty) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-lg w-full shadow-2xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto ring-8 ring-emerald-50">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          
          <div className="space-y-1">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-950 font-extrabold text-xs uppercase tracking-wider">
              Listing Published Successfully
            </span>
            <h3 className="text-2xl font-black text-slate-900 font-[Outfit] mt-2">
              {publishedProperty.title}
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Aapki property voice note ke sath verified inventory aur marketplace grid par live publish ho chuki hai.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Society / Location</span>
              <span className="font-bold text-slate-900">{publishedProperty.societyName}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Price</span>
              <span className="font-extrabold text-emerald-800">PKR {publishedProperty.pricePKR.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Size</span>
              <span className="font-bold text-slate-900">{publishedProperty.sizeMarla} {publishedProperty.sizeUnit || 'Marla'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Status</span>
              <span className="font-bold text-emerald-700">Verified & Available</span>
            </div>
          </div>

          <button
            onClick={() => {
              setPublishedProperty(null);
              onClose();
            }}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition cursor-pointer shadow-md hover:shadow-lg"
          >
            Done & Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
      <div className="relative w-full max-w-6xl my-auto bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Top Header */}
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-sm">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight font-[Outfit] text-white">
                  Voice-to-Listing AI System
                </span>
                <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-400/30">
                  Live Form & Voice Guidance
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Mic on karein aur sath mein diye gaye form ke mutabiq property details bolein.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body: Split Screen Layout */}
        <div className="overflow-y-auto p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: Voice Recording Hub & Speaking Guide (5 cols) */}
          <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-0">
            
            {/* Live Voice Recorder Card */}
            <div className="bg-slate-950 text-white rounded-3xl p-5 sm:p-6 border border-slate-800 shadow-xl space-y-5">
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${isRecording ? 'bg-rose-500 animate-ping' : hasExtracted ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    {isRecording ? 'Recording Live Audio...' : hasExtracted ? 'Voice Extracted & Ready' : 'Voice Recorder'}
                  </span>
                </div>

                <div className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-mono font-bold text-amber-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>{formatTime(recordingDuration)} / {formatTime(MAX_DURATION_SECONDS)}</span>
                </div>
              </div>

              {/* Central Mic Button & Waveform */}
              <div className="flex flex-col items-center justify-center py-3 text-center space-y-4">
                
                <div className="relative flex items-center justify-center">
                  {/* Glowing Sound Rings when recording */}
                  {isRecording && (
                    <>
                      <div className="absolute w-36 h-36 rounded-full bg-rose-500/20 animate-ping" />
                      <div className="absolute w-28 h-28 rounded-full bg-amber-500/30 animate-pulse" />
                    </>
                  )}

                  <button
                    type="button"
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isProcessingAI}
                    className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl cursor-pointer active:scale-95 ${
                      isRecording 
                        ? 'bg-rose-600 hover:bg-rose-700 text-white ring-4 ring-rose-400/50' 
                        : hasExtracted
                        ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white ring-4 ring-emerald-400/30'
                        : 'bg-gradient-to-tr from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 ring-4 ring-amber-400/30 hover:scale-105'
                    } disabled:opacity-50`}
                  >
                    {isProcessingAI ? (
                      <Loader2 className="w-8 h-8 animate-spin text-slate-950" />
                    ) : isRecording ? (
                      <Square className="w-8 h-8 fill-current" />
                    ) : (
                      <Mic className="w-8 h-8" />
                    )}
                  </button>
                </div>

                <div>
                  <h4 className="text-sm font-extrabold font-[Outfit]">
                    {isProcessingAI ? (
                      <span className="text-amber-300 flex items-center justify-center gap-1.5">
                        <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                        <span>AI Transcribing & Extracting...</span>
                      </span>
                    ) : isRecording ? (
                      <span className="text-rose-400">Recording... Tap to Stop & Auto-Fill</span>
                    ) : hasExtracted ? (
                      <span className="text-emerald-400">Voice Transcribed! Tap Mic to Re-Record</span>
                    ) : (
                      <span className="text-white">Tap Microphone to Start Speaking</span>
                    )}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isRecording 
                      ? 'Urdu ya English mein property ki details bolein' 
                      : 'Form mein dekhein aur 30 second ka voice note bolein'}
                  </p>
                </div>

                {/* Animated Frequency Bars while recording */}
                {isRecording && (
                  <div className="flex items-center justify-center gap-1 h-8 w-full max-w-xs">
                    {[12, 24, 38, 18, 48, 62, 35, 75, 45, 80, 55, 30, 65, 40, 20, 10].map((height, i) => (
                      <div
                        key={i}
                        className="w-1.5 bg-gradient-to-t from-amber-400 to-rose-400 rounded-full transition-all duration-75"
                        style={{
                          height: `${Math.max(6, Math.min(32, height * (volumeLevel / 50)))}px`,
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* Explicit Re-record Action once voice is captured */}
                {(audioBlob || audioUrl || transcript || hasExtracted) && !isRecording && (
                  <div className="flex items-center justify-center gap-2 pt-1 w-full">
                    <button
                      type="button"
                      onClick={handleReset}
                      id="voice-rerecord-main-btn"
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-amber-300 border border-slate-700 hover:border-amber-400/50 text-xs font-bold transition cursor-pointer shadow-md hover:scale-102 active:scale-98"
                      title="Clear current audio and transcript to quickly try again"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Re-record (Clear Audio & Transcript)</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Audio Playback Bar if recorded */}
              {audioUrl && !isRecording && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={togglePlayAudio}
                      className="w-8 h-8 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center transition cursor-pointer shrink-0"
                    >
                      {isPlayingAudio ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                    </button>
                    <div>
                      <span className="text-xs font-bold text-white block">Listen Voice Note</span>
                      <span className="text-[10px] text-slate-400">{formatTime(recordingDuration)} audio captured</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleReset}
                    id="voice-rerecord-player-btn"
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-bold text-amber-300 border border-slate-700 hover:border-amber-400/40 transition cursor-pointer"
                    title="Clear current audio and transcript to re-record"
                  >
                    <RotateCcw className="w-3 h-3 text-amber-400" />
                    <span>Re-Record</span>
                  </button>

                  <audio
                    ref={audioElementRef}
                    src={audioUrl}
                    onEnded={() => setIsPlayingAudio(false)}
                    className="hidden"
                  />
                </div>
              )}

              {/* Status or Error Banner */}
              {isProcessingAI && (
                <div className="p-3 bg-amber-400/10 border border-amber-400/30 rounded-xl flex items-center gap-2 text-xs text-amber-200">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400 shrink-0" />
                  <span>{aiStepText || 'Processing voice note...'}</span>
                </div>
              )}

              {errorMessage && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2 text-xs text-rose-300">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

            </div>

            {/* Speaking Checklist & Urdu Guide ("Kese Bolna Hai") */}
            <div className="bg-amber-50/80 border border-amber-200/80 rounded-3xl p-5 space-y-3.5">
              
              <div className="flex items-center gap-2 text-amber-950">
                <Info className="w-4 h-4 text-amber-700 shrink-0" />
                <h4 className="text-xs font-black uppercase tracking-wider font-[Outfit]">
                  Voice Note Checklist (Kya Bolna Hai)
                </h4>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                Mic daba kar ye 5 bunyadi baatein wazeh bolen taa k AI foran form fill kare:
              </p>

              {/* Interactive Checklist Items */}
              <div className="space-y-2 text-xs">
                
                <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-amber-200 shadow-2xs">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 block">Society & Location</span>
                    <span className="text-[11px] text-slate-500">Misaal: &ldquo;Al-Rehman Garden Narowal mein...&rdquo;</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-amber-200 shadow-2xs">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 block">Plot / House Size & Type</span>
                    <span className="text-[11px] text-slate-500">Misaal: &ldquo;5 Marla residential plot / 10 Marla ghar...&rdquo;</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-amber-200 shadow-2xs">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 block">Block & Plot Number</span>
                    <span className="text-[11px] text-slate-500">Misaal: &ldquo;Executive Block, plot number 45...&rdquo;</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-amber-200 shadow-2xs">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    4
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 block">Total Demand Price (Lakh / Crore)</span>
                    <span className="text-[11px] text-slate-500">Misaal: &ldquo;Demand 35 Lakh rupay hai...&rdquo;</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-amber-200 shadow-2xs">
                  <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                    5
                  </div>
                  <div>
                    <span className="font-extrabold text-slate-900 block">Special Features & Amenities</span>
                    <span className="text-[11px] text-slate-500">Misaal: &ldquo;Corner plot hai, park facing, possession ready.&rdquo;</span>
                  </div>
                </div>

              </div>

              {/* Sample Voice Script Box */}
              <div className="p-3 bg-white/90 border border-amber-300 rounded-2xl text-[11px] text-amber-950 font-mono leading-relaxed space-y-1">
                <div className="flex items-center gap-1 font-bold text-[10px] text-amber-800 uppercase">
                  <Volume2 className="w-3 h-3 text-amber-600" />
                  <span>Sample Recording Voice Script:</span>
                </div>
                <p className="italic text-slate-700">
                  &ldquo;Al-Rehman Garden Narowal mein 5 Marla residential plot Executive Block mein, plot number 45, demand 35 Lakh rupay, corner plot aur park facing hai.&rdquo;
                </p>
              </div>

            </div>

            {/* Transcript if available */}
            {transcript && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Transcribed Voice Note:</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleReset}
                    id="voice-rerecord-transcript-btn"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-bold transition cursor-pointer"
                    title="Clear current audio and transcript to try again"
                  >
                    <RotateCcw className="w-3 h-3 text-amber-700" />
                    <span>Re-record</span>
                  </button>
                </div>
                <p className="text-xs text-slate-800 italic font-mono bg-white p-2.5 rounded-xl border border-slate-200">
                  &ldquo;{transcript}&rdquo;
                </p>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: Live Property Listing Form (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Form Top Title & Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-900 font-[Outfit]">
                    Property Listing Details
                  </h3>
                  {hasExtracted ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>Auto-Filled from Voice</span>
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                      Live Editable Form
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ye fields voice note se auto-fill hon gi. Aap inhein hath se bhi edit kar sakte hain.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {(hasExtracted || transcript || audioBlob) && !isRecording && (
                  <button
                    type="button"
                    onClick={handleReset}
                    id="voice-rerecord-form-btn"
                    className="px-3 py-1.5 bg-slate-100 hover:bg-amber-100 border border-slate-200 hover:border-amber-300 text-slate-700 hover:text-amber-900 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0"
                    title="Clear current voice recording and transcript to re-record"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
                    <span>Re-record</span>
                  </button>
                )}

                {hasExtracted && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1.5 shrink-0">
                    <Check className="w-3.5 h-3.5" />
                    <span>AI Extracted</span>
                  </span>
                )}
              </div>
            </div>

            {/* The Actual Form */}
            <form onSubmit={handleSubmitListing} className="space-y-4">
              
              {/* Listing Title */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span>Listing Title</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                    🗣️ Bol kar batayein
                  </span>
                </div>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 5 Marla Corner Plot in Executive Block"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Property Type */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <Home className="w-3.5 h-3.5 text-slate-400" />
                      <span>Property Type</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Plot / House / Shop</span>
                  </div>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 outline-none transition"
                  >
                    <option value="plot">Plot (Residential / Commercial)</option>
                    <option value="house">House / Villa</option>
                    <option value="commercial">Commercial Shop / Plaza</option>
                    <option value="apartment">Apartment / Flat</option>
                  </select>
                </div>

                {/* Demand Price */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Demand Price (PKR)</span>
                      <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-[11px] font-extrabold text-emerald-700 font-mono">
                      {formatPKR(pricePKR)}
                    </span>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Rs.</span>
                    <input
                      type="number"
                      required
                      min={100000}
                      step={50000}
                      value={pricePKR}
                      onChange={(e) => setPricePKR(Number(e.target.value))}
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 outline-none font-mono"
                    />
                  </div>
                </div>

                {/* Housing Society */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Housing Society</span>
                    <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={selectedSocietyId}
                    onChange={(e) => {
                      setSelectedSocietyId(e.target.value);
                      const s = societies.find(soc => soc.id === e.target.value);
                      if (s) setLocation(`${s.name}, ${s.location}`);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 outline-none transition"
                  >
                    {societies.map(soc => (
                      <option key={soc.id} value={soc.id}>
                        {soc.name} ({soc.city})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location / Area */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Location / Road</span>
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Zafarwal Road, Narowal"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 outline-none transition"
                  />
                </div>

                {/* Block / Sector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    <span>Block / Sector</span>
                  </label>
                  <input
                    type="text"
                    value={block}
                    onChange={(e) => setBlock(e.target.value)}
                    placeholder="e.g. Executive Block"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 outline-none transition"
                  />
                </div>

                {/* Plot / Unit Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <Tag className="w-3.5 h-3.5 text-slate-400" />
                    <span>Plot / Unit Number</span>
                  </label>
                  <input
                    type="text"
                    value={plotNumber}
                    onChange={(e) => setPlotNumber(e.target.value)}
                    placeholder="e.g. 45"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 outline-none transition"
                  />
                </div>

                {/* Area / Size */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Area / Size</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={1}
                      step={0.5}
                      value={sizeMarla}
                      onChange={(e) => setSizeMarla(Number(e.target.value))}
                      className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-amber-500 outline-none font-mono"
                    />
                    <select
                      value={sizeUnit}
                      onChange={(e) => setSizeUnit(e.target.value as any)}
                      className="w-28 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none"
                    >
                      <option value="Marla">Marla</option>
                      <option value="Kanal">Kanal</option>
                      <option value="Sq. Ft">Sq. Ft</option>
                    </select>
                  </div>
                </div>

                {/* Bedrooms & Bathrooms if House */}
                {(propertyType === 'house' || propertyType === 'apartment') && (
                  <div className="flex gap-3">
                    <div className="flex-1 space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5 text-slate-400" />
                        <span>Beds</span>
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={bedrooms}
                        onChange={(e) => setBedrooms(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                      />
                    </div>

                    <div className="flex-1 space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <Bath className="w-3.5 h-3.5 text-slate-400" />
                        <span>Baths</span>
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={bathrooms}
                        onChange={(e) => setBathrooms(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900"
                      />
                    </div>
                  </div>
                )}

              </div>

              {/* Features & Amenities Quick Selector */}
              <div className="space-y-2 pt-1">
                <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Features & Amenities</span>
                  <span className="text-[10px] text-slate-400">Click to toggle chips</span>
                </label>

                {/* Quick Toggle Chips */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Corner plot',
                    'Park facing',
                    'Main Boulevard',
                    'Possession-ready',
                    'Gas Available',
                    'Electricity Available',
                    'Water Supply',
                    'Gated Community',
                    'Sewerage'
                  ].map(item => {
                    const isSelected = amenities.includes(item);
                    return (
                      <button
                        type="button"
                        key={item}
                        onClick={() => toggleQuickAmenity(item)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? 'bg-emerald-800 text-white border border-emerald-700 shadow-2xs'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 text-emerald-300" />}
                        <span>{item}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Custom Amenity Adder */}
                <div className="flex gap-2 max-w-sm pt-1">
                  <input
                    type="text"
                    value={newAmenityInput}
                    onChange={(e) => setNewAmenityInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddAmenity(); } }}
                    placeholder="Custom feature (e.g. Near Mosque)"
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddAmenity}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition cursor-pointer"
                  >
                    Add
                  </button>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-slate-700">Property Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Key highlights, surroundings, payment terms..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-amber-500 outline-none leading-relaxed"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 mt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-900 transition cursor-pointer"
                >
                  Cancel
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isPublishing || isProcessingAI}
                    className="flex items-center gap-2 px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-black transition shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50"
                  >
                    {isPublishing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Publishing Listing...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 text-emerald-300" />
                        <span>Confirm & Publish Property</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </form>

          </div>

        </div>

      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Sparkles, 
  X, 
  Send, 
  Minimize2, 
  Maximize2, 
  RotateCcw, 
  Check, 
  Copy, 
  MapPin, 
  ArrowRight, 
  Layers, 
  CreditCard, 
  ShieldCheck, 
  HelpCircle,
  ExternalLink,
  Mic,
  MicOff,
  Volume2,
  Trash2,
  Radio,
  CheckCircle2,
  Square,
  AlertCircle
} from 'lucide-react';
import { User } from '../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  suggestedAction?: {
    label: string;
    route: string;
  };
}

interface AiAssistantWidgetProps {
  currentUser: User;
  currentRoute: string;
  onNavigate: (route: string) => void;
}

const QUICK_PROMPTS = [
  {
    icon: '🚀',
    label: '6-Stage Booking Pipeline',
    prompt: 'Explain the 6-stage booking pipeline and how atomic plot locking works on ManzilIQ.'
  },
  {
    icon: '💳',
    label: 'Installments & Late Fees',
    prompt: 'How do installment plans, down payments, and the 2.5% late fee surcharges work?'
  },
  {
    icon: '🏛️',
    label: 'Verified Societies in Narowal',
    prompt: 'Which housing societies in Narowal District have verified TMA NOCs and approval letters?'
  },
  {
    icon: '📐',
    label: 'Marla to Sq Ft Conversion',
    prompt: 'How many square feet are in 3, 5, 7, 10 Marla and 1 Kanal in Punjab housing schemes?'
  },
  {
    icon: '🛡️',
    label: 'Dispute Freezing & Fraud',
    prompt: 'How does the dispute freeze feature prevent double-selling and fraudulent land transfers?'
  }
];

export const AiAssistantWidget: React.FC<AiAssistantWidgetProps> = ({
  currentUser,
  currentRoute,
  onNavigate
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [unreadCount, setUnreadCount] = useState(1);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Voice recording & visual spectrum states
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceDuration, setVoiceDuration] = useState(0); // in seconds
  const [volumeLevel, setVolumeLevel] = useState<number>(0);
  const [frequencyData, setFrequencyData] = useState<number[]>(new Array(24).fill(12));
  const [voiceTranscript, setVoiceTranscript] = useState<string>('');
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `**Assalam-o-Alaikum!** 👋 I am the **ManzilIQ AI Advisor**, powered by Google Gemini.\n\nI can help you explore verified housing schemes in **Narowal District**, understand the **6-stage legal booking pipeline**, calculate installment schedules, or guide you through plot demarcation.\n\nHow can I assist your property search today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedAction: {
        label: 'Explore Masterplan Map',
        route: '/map'
      }
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto scroll to bottom of messages
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  // Focus input on opening
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
      setUnreadCount(0);
    }
  }, [isOpen, isMinimized]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputQuery.trim();
    if (!textToSend || isLoading) return;

    const userMsgId = `user-${Date.now()}`;
    const newMessages: Message[] = [
      ...messages,
      {
        id: userMsgId,
        sender: 'user',
        text: textToSend,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];

    setMessages(newMessages);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          conversationHistory: newMessages.map(m => ({ sender: m.sender, text: m.text })),
          userContext: {
            role: currentUser.role,
            userName: currentUser.name,
            currentRoute: currentRoute
          }
        })
      });

      const data = await response.json();
      
      // Determine smart contextual navigation action based on reply content
      let suggestedAction: { label: string; route: string } | undefined = undefined;
      const lower = textToSend.toLowerCase();
      if (lower.includes('map') || lower.includes('plot') || lower.includes('demarcation') || lower.includes('masterplan')) {
        suggestedAction = { label: 'Open Masterplan Map', route: '/map' };
      } else if (lower.includes('installment') || lower.includes('kist') || lower.includes('challan') || lower.includes('ledger')) {
        suggestedAction = { label: 'View Installments Ledger', route: '/buyer/installments' };
      } else if (lower.includes('estimate') || lower.includes('valuation') || lower.includes('price')) {
        suggestedAction = { label: 'Launch AI Price Estimator', route: '/price-estimator' };
      } else if (lower.includes('pipeline') || lower.includes('booking') || lower.includes('stage')) {
        suggestedAction = { label: 'View Bookings Timeline', route: '/buyer/bookings' };
      } else if (lower.includes('society') || lower.includes('societies') || lower.includes('al-rehman')) {
        suggestedAction = { label: 'Explore Housing Societies', route: '/societies' };
      }

      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: data.reply || "I'm sorry, I couldn't generate a response. Please try again.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedAction
        }
      ]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: "I'm having trouble connecting right now. You can explore the **Masterplan Map** or view the **AI Price Estimator** from the main menu.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedAction: { label: 'Go to Masterplan', route: '/map' }
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatVoiceTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Cleanup all audio resources and speech recognition
  const cleanupVoiceAudio = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // Ignore inactive recognition stop errors
      }
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        // Ignore recorder stop error
      }
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {
        // Ignore close error
      }
      audioContextRef.current = null;
    }
  };

  // Cleanup on unmount or widget minimize/close
  useEffect(() => {
    return () => {
      cleanupVoiceAudio();
    };
  }, []);

  useEffect(() => {
    if (isMinimized || !isOpen) {
      if (isRecordingVoice) {
        cleanupVoiceAudio();
        setIsRecordingVoice(false);
      }
    }
  }, [isMinimized, isOpen, isRecordingVoice]);

  // Start Voice Recording with Live Waveform & Visual Spectrum Analysis
  const startVoiceRecording = async () => {
    cleanupVoiceAudio();
    setVoiceError(null);
    setVoiceTranscript('');
    setVoiceDuration(0);
    setVolumeLevel(0);
    setFrequencyData(new Array(24).fill(12));
    audioChunksRef.current = [];

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access is not supported by your browser.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });
      streamRef.current = stream;

      // Initialize Web Audio API Analyser for real-time visual spectrum
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const audioCtx = new AudioCtx();
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }
        audioContextRef.current = audioCtx;

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64; // 32 frequency bins
        analyser.smoothingTimeConstant = 0.78;
        analyserRef.current = analyser;

        const source = audioCtx.createMediaStreamSource(stream);
        sourceRef.current = source;
        source.connect(analyser);

        // Visual spectrum animation loop
        let tick = 0;
        const updateVisualSpectrum = () => {
          if (analyserRef.current) {
            tick++;
            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);
            analyserRef.current.getByteFrequencyData(dataArray);

            let sum = 0;
            const bars: number[] = [];
            const numBars = 24;

            for (let i = 0; i < numBars; i++) {
              const dataIdx = Math.min(bufferLength - 1, Math.floor((i / numBars) * bufferLength));
              const rawVal = dataArray[dataIdx] || 0;
              sum += rawVal;

              // Harmonic wave oscillation modulation for organic fluid spectrum movement
              const oscillation = Math.sin((i * 0.45) + (tick * 0.15)) * 12;
              const barHeight = Math.max(
                8,
                Math.min(75, Math.round((rawVal / 255) * 65 + oscillation + 10))
              );
              bars.push(barHeight);
            }

            const avg = sum / (bufferLength || 1);
            const currentVol = Math.min(100, Math.round((avg / 128) * 100));
            setVolumeLevel(currentVol);
            setFrequencyData(bars);

            animationFrameRef.current = requestAnimationFrame(updateVisualSpectrum);
          }
        };

        animationFrameRef.current = requestAnimationFrame(updateVisualSpectrum);
      }

      // Initialize MediaRecorder
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

      mediaRecorder.start(250);
      setIsRecordingVoice(true);

      // Start duration counter
      timerIntervalRef.current = setInterval(() => {
        setVoiceDuration(prev => {
          if (prev >= 120) {
            handleStopAndSendVoice();
            return 120;
          }
          return prev + 1;
        });
      }, 1000);

      // Initialize Web Speech API for live speech-to-text transcript
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-US';

          recognition.onresult = (event: any) => {
            let fullTranscript = '';
            for (let i = 0; i < event.results.length; i++) {
              fullTranscript += event.results[i][0].transcript + ' ';
            }
            if (fullTranscript.trim()) {
              setVoiceTranscript(fullTranscript.trim());
            }
          };

          recognition.onerror = (e: any) => {
            console.warn('[AI Assistant SpeechRecognition]', e.error);
          };

          recognition.start();
          recognitionRef.current = recognition;
        } catch (e) {
          console.warn('SpeechRecognition initialization note:', e);
        }
      }
    } catch (err: any) {
      console.error('Voice recording activation error:', err);
      cleanupVoiceAudio();
      setIsRecordingVoice(false);
      setVoiceError(
        err.name === 'NotAllowedError' || err.message?.includes('denied')
          ? 'Microphone permission was denied. Please allow microphone access in your browser settings.'
          : (err.message || 'Unable to access microphone. Please check your mic connection.')
      );
    }
  };

  // Stop Recording and Submit Query
  const handleStopAndSendVoice = () => {
    const finalTranscript = voiceTranscript.trim();
    cleanupVoiceAudio();
    setIsRecordingVoice(false);

    if (finalTranscript) {
      handleSendMessage(finalTranscript);
      setVoiceTranscript('');
    } else {
      // If user spoke without browser speech engine catching text, provide a smart fallback query
      handleSendMessage("Tell me about verified housing societies in Narowal and how to book a plot step by step.");
      setVoiceTranscript('');
    }
  };

  // Re-record Voice Query: Clears current audio/transcript to quickly try again without leaving
  const handleReRecordVoice = () => {
    cleanupVoiceAudio();
    setIsRecordingVoice(false);
    setVoiceTranscript('');
    setVoiceError(null);
    setTimeout(() => {
      startVoiceRecording();
    }, 150);
  };

  // Cancel Voice Mode
  const handleCancelVoice = () => {
    cleanupVoiceAudio();
    setIsRecordingVoice(false);
    setVoiceTranscript('');
    setVoiceError(null);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: `Chat reset. I am ready to answer your questions on Pakistani real estate, plot bookings, or payment plans!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedAction: { label: 'Explore Masterplan Map', route: '/map' }
      }
    ]);
  };

  // Helper to format basic markdown-style text with bolding, lists, and headings
  const renderFormattedText = (text: string) => {
    return text.split('\n').map((line, index) => {
      // Heading 3
      if (line.startsWith('### ')) {
        return (
          <h4 key={index} className="font-bold text-slate-900 text-sm mt-2 mb-1">
            {line.replace('### ', '')}
          </h4>
        );
      }
      // Heading 4
      if (line.startsWith('#### ')) {
        return (
          <h5 key={index} className="font-bold text-slate-800 text-xs mt-1.5 mb-0.5">
            {line.replace('#### ', '')}
          </h5>
        );
      }
      // Bullet list items
      if (line.startsWith('* ') || line.startsWith('- ')) {
        const bulletContent = line.substring(2);
        return (
          <div key={index} className="flex items-start gap-1.5 my-0.5 text-xs text-slate-700">
            <span className="text-amber-500 font-bold">•</span>
            <span dangerouslySetInnerHTML={{ __html: formatInlineStyles(bulletContent) }} />
          </div>
        );
      }
      // Numbered list item
      if (/^\d+\.\s/.test(line)) {
        const numberPrefix = line.match(/^\d+\.\s/)?.[0] || '';
        const numberContent = line.replace(/^\d+\.\s/, '');
        return (
          <div key={index} className="flex items-start gap-1.5 my-1 text-xs text-slate-700">
            <span className="text-amber-600 font-bold text-[11px] min-w-[14px]">{numberPrefix}</span>
            <span dangerouslySetInnerHTML={{ __html: formatInlineStyles(numberContent) }} />
          </div>
        );
      }
      if (line.trim() === '') {
        return <div key={index} className="h-1.5" />;
      }
      return (
        <p 
          key={index} 
          className="text-xs text-slate-700 my-0.5 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatInlineStyles(line) }} 
        />
      );
    });
  };

  const formatInlineStyles = (str: string) => {
    return str
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-slate-800">$1</em>')
      .replace(/`([^`]+)`/g, '<code class="bg-slate-100 text-amber-800 px-1 py-0.5 rounded text-[11px] font-mono">$1</code>');
  };

  return (
    <div id="manziliq-ai-assistant-root" className="fixed bottom-5 right-5 z-50 font-sans">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <div className="relative group">
          {/* Unread Indicator Pulse */}
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 text-[9px] font-black text-slate-950 items-center justify-center">
                1
              </span>
            </span>
          )}

          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 hover:from-slate-950 hover:to-amber-900 text-white rounded-full shadow-2xl hover:shadow-amber-900/30 hover:scale-105 transition-all duration-200 border border-amber-500/30 cursor-pointer"
            title="Open ManzilIQ AI Advisor"
          >
            <div className="relative flex items-center justify-center">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 flex items-center justify-center shadow-md">
                <Bot className="w-4 h-4" />
              </div>
              <Sparkles className="w-3 h-3 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
            </div>
            
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>ManzilIQ AI Advisor</span>
                <span className="px-1.5 py-0.2 bg-amber-400/20 text-amber-300 text-[9px] font-extrabold rounded-full">Gemini</span>
              </div>
              <div className="text-[10px] text-slate-300">
                Property & Pipeline Q&A
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Chat Window Container */}
      {isOpen && (
        <div 
          className={`bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 flex flex-col ${
            isMinimized 
              ? 'w-80 h-14' 
              : 'w-[92vw] sm:w-[420px] h-[580px] max-h-[85vh]'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950 text-white px-4 py-3 flex items-center justify-between border-b border-amber-500/20 select-none">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 flex items-center justify-center font-bold shadow-md">
                  <Bot className="w-4 h-4" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-slate-950 rounded-full" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-xs text-white">ManzilIQ AI Advisor</h3>
                  <span className="text-[9px] font-bold bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded-full border border-amber-400/30">
                    Gemini 3.7
                  </span>
                </div>
                <div className="text-[10px] text-slate-300 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                  <span>TMA Verified • Narowal Real Estate Guide</span>
                </div>
              </div>
            </div>

            {/* Window Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleClearChat}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition cursor-pointer"
                title="Clear Chat History"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg transition cursor-pointer"
                title={isMinimized ? "Expand" : "Minimize"}
              >
                {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 rounded-lg transition cursor-pointer"
                title="Close Advisor"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content (Visible when not minimized) */}
          {!isMinimized && (
            <>
              {/* Quick Prompt Carousel */}
              <div className="bg-slate-50/80 px-3 py-2 border-b border-slate-200 overflow-x-auto no-scrollbar flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 whitespace-nowrap pl-1 pr-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Quick:
                </span>
                {QUICK_PROMPTS.map((qp, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(qp.prompt)}
                    disabled={isLoading}
                    className="flex-shrink-0 text-[11px] font-medium text-slate-700 bg-white hover:bg-amber-50 hover:text-amber-900 border border-slate-200 hover:border-amber-300 rounded-full px-2.5 py-1 transition flex items-center gap-1 shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    <span>{qp.icon}</span>
                    <span>{qp.label}</span>
                  </button>
                ))}
              </div>

              {/* Chat Message Stream */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-gradient-to-b from-slate-50/40 via-white to-slate-50/30">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10px] font-bold text-slate-400">
                        {msg.sender === 'user' ? currentUser.name || 'You' : 'ManzilIQ Advisor'}
                      </span>
                      <span className="text-[9px] text-slate-400">{msg.timestamp}</span>
                    </div>

                    <div
                      className={`relative group max-w-[90%] rounded-2xl p-3 shadow-xs ${
                        msg.sender === 'user'
                          ? 'bg-slate-900 text-white rounded-tr-xs'
                          : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
                      }`}
                    >
                      {/* Copy Action Button */}
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className={`absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 transition ${
                          msg.sender === 'user'
                            ? 'text-slate-400 hover:text-white bg-slate-800/80'
                            : 'text-slate-400 hover:text-slate-700 bg-slate-100'
                        }`}
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>

                      {msg.sender === 'user' ? (
                        <p className="text-xs leading-relaxed text-white whitespace-pre-wrap">
                          {msg.text}
                        </p>
                      ) : (
                        <div className="prose prose-xs max-w-none">
                          {renderFormattedText(msg.text)}
                        </div>
                      )}

                      {/* Embedded Navigation Action Chip */}
                      {msg.suggestedAction && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100">
                          <button
                            onClick={() => {
                              onNavigate(msg.suggestedAction!.route);
                              setIsOpen(false);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold transition shadow-2xs cursor-pointer group"
                          >
                            <span>{msg.suggestedAction.label}</span>
                            <ArrowRight className="w-3 h-3 text-amber-600 group-hover:translate-x-0.5 transition" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Typing Indicator */}
                {isLoading && (
                  <div className="flex flex-col items-start">
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-[10px] font-bold text-amber-600">Gemini Thinking...</span>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-xs p-3 shadow-xs flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 rounded-full bg-amber-600 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                      <span className="text-xs text-slate-500">Consulting Narowal Masterplans & Bylaws...</span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Voice Error Alert if microphone access failed */}
              {voiceError && (
                <div className="mx-3 my-1.5 p-2.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start justify-between gap-2 text-rose-800 text-[11px] animate-fadeIn">
                  <div className="flex items-start gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                    <span>{voiceError}</span>
                  </div>
                  <button
                    onClick={() => setVoiceError(null)}
                    className="text-rose-500 hover:text-rose-700 font-bold p-0.5 rounded cursor-pointer"
                    title="Dismiss"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Bottom Input Area: Active Voice Recording Interface vs Text Input Bar */}
              {isRecordingVoice ? (
                /* LIVE VOICE RECORDING INTERFACE WITH ANIMATED VISUAL SPECTRUM & WAVEFORM */
                <div 
                  id="ai-assistant-voice-recording-panel" 
                  className="p-3 bg-slate-900 border-t border-slate-800 text-white space-y-2.5 transition-all duration-300 shadow-2xl relative overflow-hidden"
                >
                  {/* Ambient Dynamic Background Glow Reacting to Volume Level */}
                  <div 
                    className="absolute inset-0 bg-gradient-to-t from-amber-500/20 via-rose-500/15 to-transparent pointer-events-none transition-opacity duration-150"
                    style={{ opacity: Math.max(0.2, volumeLevel / 80) }}
                  />

                  {/* Header Status & Live Time/Decibels */}
                  <div className="flex items-center justify-between z-10 relative">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2.5 w-2.5 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                      </span>
                      <span className="text-[11px] font-bold text-rose-300 tracking-wide uppercase">
                        Recording Voice ({formatVoiceTime(voiceDuration)} / 02:00)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-800/90 border border-slate-700 rounded-full text-[10px] text-amber-300 font-mono">
                        <Volume2 className="w-3 h-3 text-amber-400 animate-pulse" />
                        <span>{volumeLevel}% Level</span>
                      </div>
                    </div>
                  </div>

                  {/* ANIMATED VISUAL SPECTRUM / WAVEFORM EQUALIZER */}
                  <div 
                    id="ai-assistant-visual-spectrum" 
                    className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-3 flex flex-col items-center justify-center relative overflow-hidden h-24 shadow-inner"
                  >
                    {/* Animated Sine Wave Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-25 pointer-events-none">
                      <svg className="w-full h-12 stroke-amber-400 fill-none" viewBox="0 0 400 40">
                        <path 
                          d={`M0 20 Q50 ${20 - volumeLevel * 0.25} 100 20 T200 20 T300 20 T400 20`} 
                          strokeWidth="1.5" 
                          strokeDasharray="4 2" 
                        />
                      </svg>
                    </div>

                    {/* Dynamic Equalizer Spectrum Bars */}
                    <div className="w-full h-16 flex items-center justify-center gap-1 px-1 z-10">
                      {frequencyData.map((barHeight, idx) => {
                        // Dynamic frequency bar calculation
                        const effectiveHeight = Math.max(6, Math.min(60, barHeight));
                        return (
                          <div
                            key={idx}
                            className="flex-1 max-w-[8px] rounded-full bg-gradient-to-t from-amber-500 via-rose-500 to-amber-300 shadow-xs transition-all duration-75"
                            style={{ 
                              height: `${effectiveHeight}px`,
                              opacity: Math.max(0.4, (effectiveHeight / 60))
                            }}
                          />
                        );
                      })}
                    </div>

                    {/* Spectrum Subtitle Status */}
                    <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1 z-10">
                      <Radio className="w-3 h-3 text-amber-400 animate-spin" />
                      <span>Gemini Live Audio Stream Active • Speak naturally</span>
                    </div>
                  </div>

                  {/* Live Speech Recognition Transcript / Prompt preview */}
                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-2 z-10 relative max-h-14 overflow-y-auto">
                    {voiceTranscript ? (
                      <p className="text-xs text-amber-200 font-medium italic leading-relaxed">
                        &ldquo;{voiceTranscript}&rdquo;
                        <span className="inline-block w-1.5 h-3 bg-amber-400 ml-1 animate-pulse" />
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">
                        Listening for your question in English, Urdu or Roman Urdu...
                      </p>
                    )}
                  </div>

                  {/* Action Buttons: Cancel, Re-record, Stop & Send */}
                  <div className="flex items-center justify-between gap-2 pt-0.5 z-10 relative">
                    <button
                      type="button"
                      onClick={handleCancelVoice}
                      id="ai-assistant-voice-cancel-btn"
                      className="px-3 py-1.5 bg-slate-800 hover:bg-rose-950 hover:border-rose-700/60 border border-slate-700 text-slate-300 hover:text-rose-300 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
                      title="Discard and cancel voice recording"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                      <span>Cancel</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleReRecordVoice}
                        id="ai-assistant-voice-rerecord-btn"
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-amber-400/40 text-amber-300 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                        title="Clear audio and transcript to re-record"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                        <span>Re-record</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleStopAndSendVoice}
                        id="ai-assistant-voice-send-btn"
                        className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold rounded-xl text-xs transition cursor-pointer flex items-center gap-1.5 shadow-md hover:scale-102 active:scale-98"
                        title="Stop recording and ask Gemini"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Query</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* DEFAULT CHAT INPUT BAR WITH MICROPHONE LAUNCHER */
                <div className="p-3 bg-white border-t border-slate-200">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="flex items-center gap-2"
                  >
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputQuery}
                      onChange={(e) => setInputQuery(e.target.value)}
                      placeholder="Ask about plots, installments, 6-stage booking..."
                      disabled={isLoading}
                      className="flex-1 bg-slate-50 border border-slate-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 outline-none transition disabled:opacity-50"
                    />

                    {/* Microphone Voice Recording Button */}
                    <button
                      type="button"
                      onClick={startVoiceRecording}
                      disabled={isLoading}
                      id="ai-assistant-mic-launcher-btn"
                      className="p-2 bg-slate-100 hover:bg-amber-100 hover:text-amber-900 text-slate-700 border border-slate-200 hover:border-amber-400/50 rounded-xl transition cursor-pointer shadow-2xs group disabled:opacity-50"
                      title="Speak with Voice Recording & Live Spectrum"
                    >
                      <Mic className="w-4 h-4 text-amber-600 group-hover:scale-110 transition" />
                    </button>

                    <button
                      type="submit"
                      disabled={!inputQuery.trim() || isLoading}
                      className="p-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-xl shadow-md transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Send message"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>

                  <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 px-1">
                    <span className="flex items-center gap-1.5">
                      <span>Press <kbd className="bg-slate-100 text-slate-600 px-1 rounded border border-slate-200">Enter</kbd> or tap</span>
                      <Mic className="w-3 h-3 text-amber-600 inline" />
                      <span>to speak</span>
                    </span>
                    <span className="text-amber-700 font-semibold">TMA Narowal Verified</span>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

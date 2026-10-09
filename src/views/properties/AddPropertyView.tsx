import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Property, Society, Plot, User } from '../../types';
import { 
  MapPin, 
  Upload, 
  X, 
  Check, 
  AlertTriangle, 
  Layers, 
  ArrowLeft, 
  Trash2, 
  Info, 
  CheckCircle2, 
  Search, 
  RefreshCw, 
  ShieldCheck, 
  CheckCircle, 
  Plus, 
  Eye, 
  Camera,
  SwitchCamera,
  RotateCcw,
  Grid3X3
} from 'lucide-react';
import { 
  previewNextUniqueId, 
  getCategoryPrefix, 
  deriveSocietyCode
} from '../../utils/idGenerator';
import { MediaPermissionButton } from '../../components/MediaPermissionButton';

interface AddPropertyViewProps {
  currentUser: User;
  societies: Society[];
  plots: Plot[];
  properties?: Property[];
  existingProperty?: Property | null;
  onSaveProperty: (prop: Property, plotData?: Partial<Plot>) => void | Promise<void>;
  onNavigate: (route: string) => void;
  onRoleSwitch?: (role: any) => void;
}

const PRESET_IMAGES = [
  { label: 'Executive Luxury Villa', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000' },
  { label: 'Demarcated Sector Plot', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1000' },
  { label: 'Central Commercial Boulevard', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000' },
  { label: 'Gated Society Avenue', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000' },
  { label: 'Park Facing Corner Plot', url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1000' },
  { label: 'Masterplan Landscape View', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1000' }
];

const DEFAULT_AMENITIES = [
  'Main boulevard approach',
  '24/7 Gated Security & CCTV',
  'Underground Electricity',
  'Water & Sui Gas Connection',
  'Society-approved layout (LDA/TMA)',
  'Possession-ready & Demarcated',
  'Corner Plot',
  'Park Facing',
  'West Open',
  'Wide 40ft Carpeted Road',
  'Commercial Frontage',
  'Mosque & Community Center Nearby'
];

/**
 * Helper to consistently map UI Category string to standard Property 'type'
 */
export const getInferredType = (category: string): 'plot' | 'commercial' | 'house' | 'apartment' => {
  if (category === 'Residential Plot') return 'plot';
  if (category === 'Commercial Plot') return 'commercial';
  if (category === 'House') return 'house';
  if (category === 'Apartment') return 'apartment';
  const cat = (category || '').toLowerCase();
  if (cat.includes('residential plot') || cat.includes('residential_plot') || (cat.includes('plot') && !cat.includes('commercial'))) return 'plot';
  if (cat.includes('commercial plot') || cat.includes('commercial_plot') || cat.includes('commercial')) return 'commercial';
  if (cat.includes('apartment') || cat.includes('flat')) return 'apartment';
  if (cat.includes('house') || cat.includes('villa')) return 'house';
  return 'plot';
};

export const AddPropertyView: React.FC<AddPropertyViewProps> = ({
  currentUser,
  societies: initialSocieties,
  plots: initialPlots = [],
  properties: initialProperties = [],
  existingProperty = null,
  onSaveProperty,
  onNavigate,
  onRoleSwitch
}) => {
  // Role checks
  const isDealer = currentUser.role === 'dealer';
  const isSocietyAdmin = currentUser.role === 'society_admin';
  const isSuperAdmin = currentUser.role === 'super_admin';
  const isCustomer = currentUser.role === 'buyer' || currentUser.role === 'public_buyer';

  // State for dynamic societies & plots
  const [dynamicSocieties, setDynamicSocieties] = useState<Society[]>(initialSocieties);
  const [dynamicPlots, setDynamicPlots] = useState<Plot[]>(initialPlots);
  const [isLoadingDynamicData, setIsLoadingDynamicData] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'fallback'>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<string>('');

  // Default Society Assignment
  const defaultSocietyId = isSocietyAdmin
    ? (currentUser.societyId || initialSocieties[0]?.id || 'soc-1')
    : (initialSocieties[0]?.id || 'soc-1');

  // Form Field States
  const [title, setTitle] = useState('');
  const [societyId, setSocietyId] = useState(defaultSocietyId);
  const [block, setBlock] = useState('Sector A');
  const [plotNumber, setPlotNumber] = useState('');
  const [category, setCategory] = useState<'Residential Plot' | 'Commercial Plot' | 'House' | 'Apartment'>('Residential Plot');

  // Plot Picker & Linking State
  const [linkedPlot, setLinkedPlot] = useState<Plot | null>(null);
  const [showPlotPickerModal, setShowPlotPickerModal] = useState<boolean>(false);
  const [plotSearchQuery, setPlotSearchQuery] = useState<string>('');

  // Size & Pricing States
  const [sizeValue, setSizeValue] = useState<number>(5);
  const [sizeUnit, setSizeUnit] = useState<'Marla' | 'Kanal' | 'Sq. Ft'>('Marla');
  const [basePricePKR, setBasePricePKR] = useState<number>(3500000);
  const [pricePerMarlaOverride, setPricePerMarlaOverride] = useState<boolean>(false);
  const [manualPricePerMarla, setManualPricePerMarla] = useState<number>(700000);

  // Location & Georeferencing
  const [locationAddress, setLocationAddress] = useState('Main Boulevard, Sector A, Narowal');
  const [latitude, setLatitude] = useState<number>(32.1012);
  const [longitude, setLongitude] = useState<number>(74.8732);
  const [selectedSvgZoneId, setSelectedSvgZoneId] = useState<string>('');

  // Media
  const [images, setImages] = useState<string[]>([PRESET_IMAGES[0].url]);
  const [customImageUrl, setCustomImageUrl] = useState('');

  // Device Camera & Real-Time Photography States
  const [showCameraModal, setShowCameraModal] = useState<boolean>(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraStarting, setIsCameraStarting] = useState<boolean>(false);
  const [capturedPhotoPreview, setCapturedPhotoPreview] = useState<string | null>(null);
  const [isCapturingFlash, setIsCapturingFlash] = useState<boolean>(false);
  const [showGridOverlay, setShowGridOverlay] = useState<boolean>(true);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Amenities
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Main boulevard approach',
    '24/7 Gated Security & CCTV',
    'Underground Electricity',
    'Water & Sui Gas Connection',
    'Society-approved layout (LDA/TMA)'
  ]);

  // Description
  const [description, setDescription] = useState(
    'Prime demarcated property with direct approach from main road. Approved layout, ready for immediate possession with all utilities intact.'
  );

  // Status & Payment Plan
  const [status, setStatus] = useState<'available' | 'reserved' | 'sold' | 'disputed'>('available');
  const [installmentsAvailable, setInstallmentsAvailable] = useState<boolean>(true);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [installmentMonths, setInstallmentMonths] = useState<number>(36);

  // Errors & Submitting
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected Society Object
  const currentSocietyObj = useMemo(() => {
    return dynamicSocieties.find(s => s.id === societyId) || initialSocieties.find(s => s.id === societyId) || initialSocieties[0];
  }, [dynamicSocieties, initialSocieties, societyId]);

  // Derived size in Marla with max 1 decimal point precision
  const calculatedSizeMarla = useMemo(() => {
    const val = Number(sizeValue) || 0;
    let marla = val;
    if (sizeUnit === 'Marla') marla = val;
    else if (sizeUnit === 'Kanal') marla = val * 20;
    else if (sizeUnit === 'Sq. Ft') marla = val / 225;
    return Math.round(marla * 10) / 10;
  }, [sizeValue, sizeUnit]);

  // Derived active price per marla
  const activePricePerMarla = useMemo(() => {
    if (pricePerMarlaOverride && manualPricePerMarla > 0) {
      return manualPricePerMarla;
    }
    if (calculatedSizeMarla > 0 && basePricePKR > 0) {
      return Math.round(basePricePKR / calculatedSizeMarla);
    }
    return 600000;
  }, [pricePerMarlaOverride, manualPricePerMarla, calculatedSizeMarla, basePricePKR]);

  // Derived calculated down payment and monthly amount
  const calculatedDownPaymentPKR = useMemo(() => {
    return Math.round(basePricePKR * (downPaymentPercent / 100));
  }, [basePricePKR, downPaymentPercent]);

  const calculatedMonthlyPKR = useMemo(() => {
    const remaining = basePricePKR - calculatedDownPaymentPKR;
    return installmentMonths > 0 ? Math.round(remaining / installmentMonths) : 0;
  }, [basePricePKR, calculatedDownPaymentPKR, installmentMonths]);

  // Auto-derived category prefix
  const categoryPrefix = useMemo(() => {
    const inferredType = getInferredType(category);
    return getCategoryPrefix(category, inferredType);
  }, [category]);

  // Auto-calculated live unique Property ID preview
  const predictedId = useMemo(() => {
    const inferredType = getInferredType(category);
    return previewNextUniqueId(
      currentSocietyObj,
      category,
      inferredType,
      initialProperties,
      dynamicPlots.length > 0 ? dynamicPlots : initialPlots
    );
  }, [currentSocietyObj, category, initialProperties, dynamicPlots, initialPlots]);

  // Filtered society plots
  const availablePlotsInCurrentSociety = useMemo(() => {
    const pool = dynamicPlots.length > 0 ? dynamicPlots : initialPlots;
    return pool.filter(p => p.societyId === societyId);
  }, [dynamicPlots, initialPlots, societyId]);

  // Fetch dynamic societies and plot inventories with AbortController to prevent race conditions
  const fetchDynamicData = async (targetSocId?: string) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;
    const signal = controller.signal;

    setIsLoadingDynamicData(true);
    setSyncStatus('syncing');

    try {
      /*
       * SECURITY NOTE: Role and userId must always be validated and derived server-side from
       * the authenticated session/bearer token. When an auth token exists in localStorage,
       * we send it in the Authorization header, retaining query parameters as fallback.
       */
      const token = typeof window !== 'undefined' ? (localStorage.getItem('token') || localStorage.getItem('auth_token')) : null;
      const headers: Record<string, string> = {
        'x-user-role': currentUser.role || 'dealer'
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const socUrl = `/api/properties/societies?role=${encodeURIComponent(currentUser.role || 'dealer')}&userId=${encodeURIComponent(currentUser.id || 'usr-1')}&societyId=${encodeURIComponent(currentUser.societyId || '')}`;
      const socRes = await fetch(socUrl, { headers, signal });

      if (signal.aborted) return;

      let fetchedSocs: Society[] = initialSocieties;
      if (socRes.ok) {
        const socData = await socRes.json();
        if (!signal.aborted && socData.success && Array.isArray(socData.societies) && socData.societies.length > 0) {
          fetchedSocs = socData.societies;
          setDynamicSocieties(fetchedSocs);
        }
      }

      const activeSocId = targetSocId || (isSocietyAdmin ? (currentUser.societyId || fetchedSocs[0]?.id) : (societyId || fetchedSocs[0]?.id));
      const plotUrl = `/api/properties/plots?role=${encodeURIComponent(currentUser.role || 'dealer')}&userId=${encodeURIComponent(currentUser.id || 'usr-1')}&societyId=${encodeURIComponent(activeSocId || '')}`;
      const plotRes = await fetch(plotUrl, { headers, signal });

      if (signal.aborted) return;

      if (plotRes.ok) {
        const plotData = await plotRes.json();
        if (!signal.aborted && plotData.success && Array.isArray(plotData.plots)) {
          setDynamicPlots(plotData.plots);
          setSyncStatus('synced');
          setLastSyncedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        } else if (!signal.aborted) {
          setDynamicPlots(initialPlots);
          setSyncStatus('fallback');
        }
      } else if (!signal.aborted) {
        setDynamicPlots(initialPlots);
        setSyncStatus('fallback');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.warn('[AddPropertyView Dynamic Fetch Warning]:', err);
      setDynamicSocieties(initialSocieties);
      setDynamicPlots(initialPlots);
      setSyncStatus('fallback');
    } finally {
      if (!controller.signal.aborted) {
        setIsLoadingDynamicData(false);
      }
    }
  };

  // On mount or society change: in edit mode, fetch for existingProperty.societyId first
  useEffect(() => {
    const targetSocId = existingProperty?.societyId || societyId;
    fetchDynamicData(targetSocId);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [existingProperty?.societyId, currentUser.id, currentUser.role]);

  // Load existing property when editing
  useEffect(() => {
    if (existingProperty) {
      setTitle(existingProperty.title || '');
      setSocietyId(existingProperty.societyId || defaultSocietyId);
      setBlock(existingProperty.block || 'Sector A');
      setPlotNumber(existingProperty.plotNumber || '');
      
      const cat = existingProperty.category as any;
      if (cat) setCategory(cat);
      else if (existingProperty.type === 'house') setCategory('House');
      else if (existingProperty.type === 'commercial') setCategory('Commercial Plot');
      else if (existingProperty.type === 'apartment') setCategory('Apartment');
      else setCategory('Residential Plot');

      const size = existingProperty.sizeValue || existingProperty.sizeMarla || 5;
      setSizeValue(size);
      setSizeUnit(existingProperty.sizeUnit || 'Marla');
      setBasePricePKR(existingProperty.pricePKR || 3500000);
      
      // pricePerMarla override check: only enable override if stored value differs by > 1 from Math.round(pricePKR / sizeMarla)
      if (existingProperty.pricePerMarla) {
        const effectiveSize = existingProperty.sizeMarla || existingProperty.sizeValue || 5;
        const computedExpected = effectiveSize > 0 ? Math.round(existingProperty.pricePKR / effectiveSize) : 0;
        const shouldOverride = Math.abs(existingProperty.pricePerMarla - computedExpected) > 1;
        setPricePerMarlaOverride(shouldOverride);
        setManualPricePerMarla(existingProperty.pricePerMarla);
      } else {
        setPricePerMarlaOverride(false);
      }

      setLocationAddress(existingProperty.location || '');
      if (existingProperty.geoCoordinates) {
        setLatitude(existingProperty.geoCoordinates.lat);
        setLongitude(existingProperty.geoCoordinates.lng);
      }
      setSelectedSvgZoneId(existingProperty.svgZoneId || '');
      setImages(existingProperty.images && existingProperty.images.length > 0 ? existingProperty.images : [PRESET_IMAGES[0].url]);
      setSelectedAmenities(existingProperty.amenities || DEFAULT_AMENITIES.slice(0, 5));
      setDescription(existingProperty.description || '');
      setStatus(existingProperty.listingStatus || 'available');

      if (existingProperty.paymentPlan) {
        setInstallmentsAvailable(existingProperty.paymentPlan.installmentsAvailable);
        setDownPaymentPercent(existingProperty.paymentPlan.downPaymentPercent || 20);
        setInstallmentMonths(existingProperty.paymentPlan.installmentMonths || 36);
      }
    }
  }, [existingProperty]);

  // Separate plot linking effect: once plots are loaded, locate matching plot if linkedPlot is still null
  useEffect(() => {
    if (existingProperty && !linkedPlot && dynamicPlots.length > 0) {
      const matchingPlot = dynamicPlots.find(p => 
        p.societyId === existingProperty.societyId && 
        (p.plotNumber || '').trim().toLowerCase() === (existingProperty.plotNumber || '').trim().toLowerCase()
      );
      if (matchingPlot) {
        setLinkedPlot(matchingPlot);
      }
    }
  }, [existingProperty, dynamicPlots, linkedPlot]);

  // Handle society switch
  const handleSocietyChange = (newSocId: string) => {
    setSocietyId(newSocId);
    setLinkedPlot(null);
    if (errors.society) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.society;
        return next;
      });
    }
    fetchDynamicData(newSocId);
  };

  // Link to plot from inventory (only if plot has geoCoordinates update lat/lng)
  const handleSelectPlotFromInventory = (p: Plot) => {
    setLinkedPlot(p);
    setPlotNumber(p.plotNumber);
    if (errors.plotNumber) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.plotNumber;
        return next;
      });
    }
    if (p.sector) setBlock(p.sector);
    if (p.sizeMarla) {
      setSizeValue(p.sizeMarla);
      setSizeUnit('Marla');
      if (errors.size) {
        setErrors(prev => {
          const next = { ...prev };
          delete next.size;
          return next;
        });
      }
    }
    if (p.pricePKR) {
      setBasePricePKR(p.pricePKR);
      if (errors.price) {
        setErrors(prev => {
          const next = { ...prev };
          delete next.price;
          return next;
        });
      }
    }
    if (p.category === 'commercial') {
      setCategory('Commercial Plot');
    } else {
      setCategory('Residential Plot');
    }
    if (p.geoCoordinates) {
      setLatitude(p.geoCoordinates.lat);
      setLongitude(p.geoCoordinates.lng);
    }
    setShowPlotPickerModal(false);
  };

  // Image helpers
  const handleAddCustomImage = () => {
    if (!customImageUrl.trim()) return;
    if (images.length >= 8) {
      setErrors(prev => ({ ...prev, images: 'Maximum 8 images allowed.' }));
      return;
    }
    setImages(prev => [...prev, customImageUrl.trim()]);
    setCustomImageUrl('');
    setErrors(prev => {
      const next = { ...prev };
      delete next.images;
      return next;
    });
  };

  const handleRemoveImage = (indexToRemove: number) => {
    if (images.length <= 1) {
      setErrors(prev => ({ ...prev, images: 'At least 1 photo is required.' }));
      return;
    }
    const updated = images.filter((_, idx) => idx !== indexToRemove);
    setImages(updated);
    if (updated.length > 0 && errors.images) {
      setErrors(prev => {
        const next = { ...prev };
        delete next.images;
        return next;
      });
    }
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    const updated = [...images];
    const item = updated.splice(index, 1)[0];
    updated.unshift(item);
    setImages(updated);
  };

  // Sync stream to video element whenever modal or stream changes
  useEffect(() => {
    if (showCameraModal && cameraStream && videoRef.current) {
      if (videoRef.current.srcObject !== cameraStream) {
        videoRef.current.srcObject = cameraStream;
      }
      videoRef.current.play().catch(e => console.warn('Camera video play issue:', e));
    }
  }, [showCameraModal, cameraStream]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
      }
    };
  }, [cameraStream]);

  // Start device camera
  const startCamera = async (facing: 'environment' | 'user' = cameraFacingMode) => {
    setIsCameraStarting(true);
    setCameraError(null);
    setCapturedPhotoPreview(null);

    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Real-time camera access is not supported by your browser environment. You can upload photos using the device file picker.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn('Camera autoPlay issue:', e));
      }
    } catch (err: any) {
      console.warn('Camera permission or device error:', err);
      let message = 'Unable to access device camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Camera permission was denied. Please allow camera permissions in your browser or select an image from your device.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'No camera sensor was detected on this device. You can select photos from your device storage.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        message = 'Device camera is currently in use by another application or tab.';
      } else if (err.message) {
        message = err.message;
      }
      setCameraError(message);
    } finally {
      setIsCameraStarting(false);
    }
  };

  // Stop device camera and clean up hardware resources
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setShowCameraModal(false);
    setCapturedPhotoPreview(null);
    setCameraError(null);
  };

  // Flip camera between front & rear sensor
  const toggleFacingMode = () => {
    const nextMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(nextMode);
    startCamera(nextMode);
  };

  // Capture photo snapshot from the active video stream
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const width = video.videoWidth || 1280;
    const height = video.videoHeight || 720;

    setIsCapturingFlash(true);
    setTimeout(() => setIsCapturingFlash(false), 200);

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (cameraFacingMode === 'user') {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const photoDataUrl = canvas.toDataURL('image/jpeg', 0.88);
    setCapturedPhotoPreview(photoDataUrl);
  };

  // Use captured photo and close modal
  const handleUseCapturedPhoto = () => {
    if (!capturedPhotoPreview) return;
    if (images.length >= 8) {
      setErrors(prev => ({ ...prev, images: 'Maximum 8 images allowed. Remove an existing photo to add a new one.' }));
      stopCamera();
      return;
    }
    setImages(prev => [...prev, capturedPhotoPreview]);
    setErrors(prev => {
      const next = { ...prev };
      delete next.images;
      return next;
    });
    setCapturedPhotoPreview(null);
    stopCamera();
  };

  // Save captured photo and immediately take another
  const handleSaveAndTakeNext = () => {
    if (!capturedPhotoPreview) return;
    if (images.length >= 8) {
      setErrors(prev => ({ ...prev, images: 'Maximum 8 images allowed.' }));
      stopCamera();
      return;
    }
    setImages(prev => [...prev, capturedPhotoPreview]);
    setErrors(prev => {
      const next = { ...prev };
      delete next.images;
      return next;
    });
    setCapturedPhotoPreview(null);
  };

  // Handle native file upload / direct device camera capture
  const handleDeviceFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    (Array.from(files) as File[]).forEach((file: File) => {
      if (images.length >= 8) {
        setErrors(prev => ({ ...prev, images: 'Maximum 8 images allowed.' }));
        return;
      }
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result;
        if (typeof result === 'string') {
          setImages(prev => {
            if (prev.length >= 8) return prev;
            return [...prev, result];
          });
          setErrors(prev => {
            const next = { ...prev };
            delete next.images;
            return next;
          });
        }
      };
      reader.readAsDataURL(file);
    });

    if (e.target) {
      e.target.value = '';
    }
  };

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  // Description Templates
  const applyTemplate = (type: 'possession' | 'installment' | 'commercial') => {
    const socName = currentSocietyObj?.name || 'Al-Rehman Garden';
    if (type === 'possession') {
      setDescription(`Ready for immediate possession in ${socName}, ${block}. All utilities including underground electricity, gas, and clean water are installed. LDA/TMA approved layout with clear ownership and demarcation.`);
      setTitle(`${sizeValue} ${sizeUnit} Ready for Possession Plot in ${socName}`);
    } else if (type === 'installment') {
      setDescription(`Lucrative investment opportunity in ${socName}. Easy ${installmentMonths}-month flexible installment plan with only ${downPaymentPercent}% initial down payment. Rapidly developing sector with guaranteed capital growth.`);
      setTitle(`${sizeValue} ${sizeUnit} Installment Plot on Easy Payment Plan`);
    } else {
      setDescription(`High footfall commercial plot in ${socName}, ${block}. Ideal for multi-story plaza, corporate offices or retail outlets. High rental yield zone on the central commercial boulevard.`);
      setTitle(`${sizeValue} ${sizeUnit} Prime Commercial Plot in ${socName}`);
      setCategory('Commercial Plot');
    }
  };

  // Async Form submission with validation and scroll to first invalid field
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    const newErrors: Record<string, string> = {};

    // 1. Title validation
    if (!title.trim() || title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters.';
    }

    // 2. Society validation
    if (!societyId) {
      newErrors.society = 'Housing society is required.';
    }

    // 3. Plot Number validation (no random numbers allowed)
    const cleanPlotNumber = plotNumber.trim();
    if (!cleanPlotNumber) {
      newErrors.plotNumber = 'Plot / Unit number is required.';
    } else {
      // Check plot exclusivity: check initialProperties for duplicate listing in same society
      const duplicateListing = initialProperties.find(p => 
        p.societyId === societyId &&
        (p.plotNumber || '').trim().toLowerCase() === cleanPlotNumber.toLowerCase() &&
        (!existingProperty || p.id !== existingProperty.id)
      );
      if (duplicateListing) {
        newErrors.plotNumber = 'This plot already has a listing in this society.';
      }
    }

    // 4. Size validation
    if (!sizeValue || Number(sizeValue) <= 0) {
      newErrors.size = 'Please specify a valid size greater than 0.';
    }

    // 5. Price validation
    if (!basePricePKR || Number(basePricePKR) <= 0) {
      newErrors.price = 'Please specify a valid base price in PKR.';
    }

    // 6. Photos validation
    if (images.length === 0) {
      newErrors.images = 'At least 1 photo is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      // Smooth scroll to first invalid field
      const fieldOrder = ['title', 'society', 'plotNumber', 'size', 'price', 'images'];
      const firstInvalidField = fieldOrder.find(f => newErrors[f]);
      if (firstInvalidField) {
        const el = document.getElementById(`field-${firstInvalidField}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const typeMapping = getInferredType(category);
      const propId = existingProperty ? existingProperty.id : `prop-${Date.now()}`;
      const finalPropertyId = existingProperty?.propertyId || predictedId;

      // Moderation status logic:
      // super_admin or society_admin -> 'approved'; dealer and buyer/customer -> 'pending'.
      // When editing, keep existing status unless user is super_admin.
      let moderationStatus: 'approved' | 'pending' | 'rejected' = 'pending';
      if (isSuperAdmin) {
        moderationStatus = 'approved';
      } else if (existingProperty) {
        moderationStatus = (existingProperty.status as any) || 'pending';
      } else if (isSocietyAdmin) {
        moderationStatus = 'approved';
      } else {
        moderationStatus = 'pending';
      }

      const newProperty: Property = {
        id: propId,
        propertyId: finalPropertyId,
        categoryPrefix: categoryPrefix,
        title: title.trim(),
        type: typeMapping,
        category,
        pricePKR: Number(basePricePKR),
        sizeMarla: calculatedSizeMarla,
        sizeValue: Number(sizeValue),
        sizeUnit,
        pricePerMarla: activePricePerMarla,
        block,
        plotNumber: cleanPlotNumber,
        location: locationAddress || `${block}, ${currentSocietyObj?.name || 'Society'}, Narowal`,
        city: currentSocietyObj?.city || 'Narowal',
        societyId,
        societyName: currentSocietyObj?.name || 'Al-Rehman Garden Narowal',
        dealerId: isDealer ? currentUser.id : (isCustomer ? currentUser.id : existingProperty?.dealerId),
        dealerName: isDealer ? currentUser.name : (isCustomer ? `${currentUser.name} (Direct Owner)` : existingProperty?.dealerName),
        assignedDealerId: isDealer ? currentUser.id : existingProperty?.assignedDealerId,
        images,
        description: description.trim(),
        amenities: selectedAmenities,
        featured: existingProperty?.featured ?? false,
        status: moderationStatus,
        listingStatus: status,
        geoCoordinates: { lat: latitude, lng: longitude },
        svgZoneId: selectedSvgZoneId || `zone-${cleanPlotNumber.replace(/\s+/g, '')}`,
        paymentPlan: installmentsAvailable ? {
          installmentsAvailable: true,
          downPaymentPercent,
          downPaymentPKR: calculatedDownPaymentPKR,
          installmentMonths,
          monthlyAmountPKR: calculatedMonthlyPKR
        } : undefined,
        createdAt: existingProperty ? existingProperty.createdAt : new Date().toISOString()
      };

      // Synchronized Plot Data for Masterplan (no random coordinates or numbers)
      const plotData: Partial<Plot> = {
        id: linkedPlot ? linkedPlot.id : `plot-${propId}`,
        propertyId: linkedPlot?.propertyId || finalPropertyId,
        plotCode: linkedPlot?.plotCode || finalPropertyId,
        societyId,
        societyName: currentSocietyObj?.name || 'Al-Rehman Garden Narowal',
        plotNumber: cleanPlotNumber,
        sector: block,
        block,
        sizeMarla: calculatedSizeMarla,
        sizeSqFt: Math.round(calculatedSizeMarla * 225),
        pricePKR: Number(basePricePKR),
        downPaymentPKR: calculatedDownPaymentPKR,
        monthlyInstallmentPKR: calculatedMonthlyPKR,
        installmentMonths,
        status: status,
        category: typeMapping === 'commercial' ? 'commercial' : 'residential',
        dimensions: calculatedSizeMarla === 5 ? '25x45' : calculatedSizeMarla === 10 ? '35x65' : calculatedSizeMarla === 20 ? '50x90' : '30x50',
        features: selectedAmenities,
        coordinates: linkedPlot?.coordinates || undefined,
        geoCoordinates: { lat: latitude, lng: longitude },
        svgZoneId: selectedSvgZoneId || `zone-${cleanPlotNumber.replace(/\s+/g, '')}`,
        dealerId: isDealer ? currentUser.id : (linkedPlot?.dealerId || existingProperty?.dealerId),
        dealerName: isDealer ? currentUser.name : (linkedPlot?.dealerName || existingProperty?.dealerName),
        isDisputed: status === 'disputed'
      };

      await Promise.resolve(onSaveProperty(newProperty, plotData));

      if (isDealer) onNavigate('/dealer/listings');
      else if (isSocietyAdmin) onNavigate('/society/inventory');
      else if (isSuperAdmin) onNavigate('/admin/moderation');
      else onNavigate('/marketplace');
    } catch (err: any) {
      console.error('Failed to save listing:', err);
      setSubmitError('Could not save listing, please try again.');
      const summaryEl = document.getElementById('form-error-summary');
      if (summaryEl) {
        summaryEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6 pb-20 animate-in fade-in duration-200">
      
      {/* 1. TOP HEADER & PERSONA BANNER */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <button
            type="button"
            onClick={() => {
              if (isDealer) onNavigate('/dealer/listings');
              else if (isSocietyAdmin) onNavigate('/society/inventory');
              else if (isSuperAdmin) onNavigate('/admin/overview');
              else onNavigate('/marketplace');
            }}
            className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl border border-slate-200 text-slate-700 transition cursor-pointer shrink-0"
            title="Return to Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${
                isDealer ? 'bg-teal-50 text-teal-800 border-teal-200' :
                isSocietyAdmin ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                isSuperAdmin ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
                'bg-amber-50 text-amber-900 border-amber-200'
              }`}>
                {isDealer ? '🏢 Licensed Dealer Portal' :
                 isSocietyAdmin ? '🏛️ Society Admin Portal' :
                 isSuperAdmin ? '🛡️ Super Administrator Portal' :
                 '🏡 Verified Owner / Customer Portal'}
              </span>

              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-xl">
                ID Preview: {predictedId}
              </span>

              {syncStatus === 'syncing' ? (
                <span className="text-xs text-amber-600 flex items-center gap-1 font-semibold">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Syncing Inventory...
                </span>
              ) : syncStatus === 'synced' ? (
                <span className="text-xs text-emerald-700 flex items-center gap-1 font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" /> Synced ({lastSyncedAt})
                </span>
              ) : null}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black font-[Outfit] text-slate-900 mt-2">
              {existingProperty ? 'Edit Property Listing' : 'Add New Property Listing'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Publish plot demarcation, pricing, media and synchronized masterplan lot allocation.
            </p>
          </div>
        </div>

        {/* 1-Click Quick Persona Switcher (Displayed ONLY in DEV Mode) */}
        {import.meta.env.DEV && onRoleSwitch && (
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">
              Dev Role Switcher:
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => onRoleSwitch('dealer')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-[11px] ${
                  currentUser.role === 'dealer' 
                    ? 'bg-teal-700 text-white shadow-2xs' 
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                Dealer
              </button>
              <button
                type="button"
                onClick={() => onRoleSwitch('society_admin')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-[11px] ${
                  currentUser.role === 'society_admin' 
                    ? 'bg-emerald-700 text-white shadow-2xs' 
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                Society Admin
              </button>
              <button
                type="button"
                onClick={() => onRoleSwitch('super_admin')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-[11px] ${
                  currentUser.role === 'super_admin' 
                    ? 'bg-indigo-700 text-white shadow-2xs' 
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                Super Admin
              </button>
              <button
                type="button"
                onClick={() => onRoleSwitch('buyer')}
                className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer text-[11px] ${
                  currentUser.role === 'buyer' 
                    ? 'bg-amber-600 text-white shadow-2xs' 
                    : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                Owner/Buyer
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Customer Notice if posting as owner */}
      {isCustomer && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 leading-relaxed">
            <strong>Customer / Owner Direct Resale Listing:</strong> You are adding a listing as a verified property owner. Your listing will appear in the marketplace with a direct owner contact badge. If you are an authorized agency or society representative, switch to Dealer or Society Admin to activate agency commission and masterplan plot allotment rules.
          </div>
        </div>
      )}

      {/* ERROR SUMMARY BANNER */}
      {Object.keys(errors).length > 0 && (
        <div id="form-error-summary" className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-900 shadow-sm animate-in fade-in duration-150">
          <div className="flex items-center gap-2 font-extrabold text-sm mb-1.5 text-rose-700">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Please correct the following errors before saving:</span>
          </div>
          <ul className="list-disc list-inside text-xs space-y-1 font-medium text-rose-700">
            {Object.entries(errors).map(([field, msg]) => (
              <li key={field}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

      {/* SUBMISSION FAILURE BANNER */}
      {submitError && (
        <div className="bg-rose-600 text-white rounded-2xl p-4 shadow-md flex items-center justify-between gap-3 animate-in fade-in duration-150">
          <div className="flex items-center gap-2 font-bold text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-white" />
            <span>{submitError}</span>
          </div>
          <button
            type="button"
            onClick={() => setSubmitError(null)}
            className="p-1 hover:bg-rose-700 rounded-lg text-white/80 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 2. MAIN FORM + LIVE PREVIEW CONTAINER */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT 2 COLS: EDITABLE FORM SECTIONS */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* SECTION A: BASIC PROPERTY INFO & CATEGORY */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  1
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Basic Information & Classification</h2>
                  <p className="text-xs text-slate-500">Property title, society jurisdiction and plot classification</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                Prefix: {categoryPrefix}
              </span>
            </div>

            {/* Category Selector Buttons */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Property Classification Category <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'Residential Plot', label: 'Residential Plot', icon: '🏡' },
                  { id: 'Commercial Plot', label: 'Commercial Plot', icon: '🏢' },
                  { id: 'House', label: 'House / Villa', icon: '🏠' },
                  { id: 'Apartment', label: 'Apartment / Flat', icon: '🏬' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id as any)}
                    className={`p-3 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-1.5 cursor-pointer ${
                      category === cat.id
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Listing Title */}
            <div id="field-title">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Listing Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 5 Marla Demarcated Park Facing Plot on 40ft Carpeted Boulevard"
                value={title}
                onChange={(e) => {
                  const val = e.target.value;
                  setTitle(val);
                  if (errors.title && val.trim().length >= 5) {
                    setErrors(prev => {
                      const next = { ...prev };
                      delete next.title;
                      return next;
                    });
                  }
                }}
                className={`w-full p-3.5 bg-slate-50 border rounded-2xl text-sm font-semibold outline-none transition focus:bg-white focus:ring-2 focus:ring-slate-900 ${
                  errors.title ? 'border-rose-500' : 'border-slate-200'
                }`}
              />
              {errors.title && (
                <p className="text-xs text-rose-500 font-bold mt-1">{errors.title}</p>
              )}
            </div>

            {/* Society, Block & Plot Number */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div id="field-society">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Housing Society <span className="text-rose-500">*</span>
                </label>
                <select
                  value={societyId}
                  onChange={(e) => handleSocietyChange(e.target.value)}
                  disabled={isSocietyAdmin && !!currentUser.societyId}
                  className={`w-full p-3 bg-slate-50 border rounded-xl text-xs font-bold outline-none cursor-pointer focus:bg-white ${
                    errors.society ? 'border-rose-500' : 'border-slate-200'
                  }`}
                >
                  {dynamicSocieties.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.code || 'SOC'})
                    </option>
                  ))}
                </select>
                {errors.society && (
                  <p className="text-xs text-rose-500 font-bold mt-1">{errors.society}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Block / Sector
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sector A / Executive Block"
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white"
                />
              </div>

              <div id="field-plotNumber">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Plot / Unit Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Plot 42 / C-12"
                  value={plotNumber}
                  onChange={(e) => {
                    const val = e.target.value;
                    setPlotNumber(val);
                    if (errors.plotNumber && val.trim()) {
                      setErrors(prev => {
                        const next = { ...prev };
                        delete next.plotNumber;
                        return next;
                      });
                    }
                  }}
                  className={`w-full p-3 bg-slate-50 border rounded-xl text-xs font-bold outline-none focus:bg-white font-mono ${
                    errors.plotNumber ? 'border-rose-500' : 'border-slate-200'
                  }`}
                />
                {errors.plotNumber && (
                  <p className="text-xs text-rose-500 font-bold mt-1">{errors.plotNumber}</p>
                )}
              </div>
            </div>

            {/* Linked Plot Info Banner */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <span>Masterplan Demarcation Sync:</span>
                    {linkedPlot ? (
                      <span className="text-[11px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Linked to Plot #{linkedPlot.plotNumber} ({linkedPlot.sector})
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-slate-500">
                        No specific inventory plot linked
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500">
                    Linking with official plot inventory enables auto-demarcation and 1-plot exclusivity enforcement.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {linkedPlot ? (
                  <button
                    type="button"
                    onClick={() => setLinkedPlot(null)}
                    className="px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition cursor-pointer"
                  >
                    Unlink
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowPlotPickerModal(true)}
                    className="px-3 py-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span>Select From Masterplan ({availablePlotsInCurrentSociety.length})</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* SECTION B: DIMENSIONS, SIZE & PRICING ECONOMICS */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                  2
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Dimensions, Size & Financial Economics</h2>
                  <p className="text-xs text-slate-500">Auto-balanced rates per marla, down payments and installments</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-amber-900 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                PKR {calculatedSizeMarla > 0 ? (basePricePKR / 100000).toFixed(1) + ' Lacs' : '0'}
              </span>
            </div>

            {/* Size Value & Unit */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div id="field-size">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Area Size Value <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={sizeValue}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setSizeValue(val);
                    if (errors.size && val > 0) {
                      setErrors(prev => {
                        const next = { ...prev };
                        delete next.size;
                        return next;
                      });
                    }
                  }}
                  className={`w-full p-3 bg-slate-50 border rounded-xl text-sm font-black outline-none focus:bg-white ${
                    errors.size ? 'border-rose-500' : 'border-slate-200'
                  }`}
                />
                {errors.size && (
                  <p className="text-xs text-rose-500 font-bold mt-1">{errors.size}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Area Unit Measurement
                </label>
                <select
                  value={sizeUnit}
                  onChange={(e) => setSizeUnit(e.target.value as any)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none cursor-pointer focus:bg-white"
                >
                  <option value="Marla">Marla (1 Marla = 225 Sq. Ft)</option>
                  <option value="Kanal">Kanal (1 Kanal = 20 Marla)</option>
                  <option value="Sq. Ft">Square Feet</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Standardized Area
                </label>
                <div className="p-3 bg-slate-100 rounded-xl text-xs font-bold text-slate-800 flex items-center justify-between">
                  <span>{calculatedSizeMarla} Marla</span>
                  <span className="text-slate-500 text-[11px]">({Math.round(calculatedSizeMarla * 225)} Sq. Ft)</span>
                </div>
              </div>
            </div>

            {/* Base Price & Rate Per Marla */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div id="field-price">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Total Base Price (PKR) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-xs font-black text-slate-400">PKR</span>
                  <input
                    type="number"
                    step="50000"
                    min="100000"
                    value={basePricePKR}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setBasePricePKR(val);
                      if (errors.price && val > 0) {
                        setErrors(prev => {
                          const next = { ...prev };
                          delete next.price;
                          return next;
                        });
                      }
                    }}
                    className={`w-full pl-12 pr-3 py-3 bg-slate-50 border rounded-xl text-sm font-black outline-none focus:bg-white font-mono ${
                      errors.price ? 'border-rose-500' : 'border-slate-200'
                    }`}
                  />
                </div>
                {errors.price && (
                  <p className="text-xs text-rose-500 font-bold mt-1">{errors.price}</p>
                )}
                <div className="text-[11px] text-slate-500 font-medium mt-1">
                  Equivalent to: PKR {(basePricePKR / 100000).toLocaleString('en-PK')} Lacs
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">Rate per Marla</label>
                  <button
                    type="button"
                    onClick={() => {
                      setPricePerMarlaOverride(!pricePerMarlaOverride);
                      if (!pricePerMarlaOverride) {
                        setManualPricePerMarla(activePricePerMarla);
                      }
                    }}
                    className="text-[11px] font-bold text-emerald-800 hover:underline cursor-pointer"
                  >
                    {pricePerMarlaOverride ? 'Auto-calculate' : 'Override Rate'}
                  </button>
                </div>

                {pricePerMarlaOverride ? (
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-xs font-black text-slate-400">PKR</span>
                    <input
                      type="number"
                      step="10000"
                      value={manualPricePerMarla}
                      onChange={(e) => setManualPricePerMarla(Number(e.target.value))}
                      className="w-full pl-12 pr-3 py-3 bg-white border-2 border-emerald-600 rounded-xl text-sm font-black outline-none font-mono"
                    />
                  </div>
                ) : (
                  <div className="p-3 bg-slate-100 rounded-xl text-xs font-mono font-bold text-slate-800 flex items-center justify-between">
                    <span>PKR {activePricePerMarla.toLocaleString('en-PK')} / Marla</span>
                    <span className="text-[10px] text-slate-500 uppercase font-sans font-bold">Auto-derived</span>
                  </div>
                )}
              </div>
            </div>

            {/* Installment Plan Toggle */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Flexible Installment Schedule</h4>
                  <p className="text-[11px] text-slate-500">Offer structured booking with monthly down payments</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={installmentsAvailable}
                    onChange={(e) => setInstallmentsAvailable(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-700"></div>
                </label>
              </div>

              {installmentsAvailable && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Down Payment ({downPaymentPercent}%)
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="50"
                      step="5"
                      value={downPaymentPercent}
                      onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                      className="w-full accent-emerald-600 cursor-pointer"
                    />
                    <div className="font-mono font-bold text-emerald-900 mt-1">
                      PKR {calculatedDownPaymentPKR.toLocaleString('en-PK')}
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Tenure (Months)
                    </label>
                    <select
                      value={installmentMonths}
                      onChange={(e) => setInstallmentMonths(Number(e.target.value))}
                      className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-bold text-xs outline-none cursor-pointer"
                    >
                      <option value={12}>12 Months (1 Year)</option>
                      <option value={24}>24 Months (2 Years)</option>
                      <option value={36}>36 Months (3 Years)</option>
                      <option value={48}>48 Months (4 Years)</option>
                      <option value={60}>60 Months (5 Years)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Monthly Installment
                    </label>
                    <div className="p-2.5 bg-white border border-slate-200 rounded-xl font-mono font-bold text-slate-900">
                      PKR {calculatedMonthlyPKR.toLocaleString('en-PK')} / mo
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECTION C: PHOTOS & MEDIA GALLERY */}
          <div id="field-images" className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                  3
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Property Photos & Media Gallery</h2>
                  <p className="text-xs text-slate-500">Capture real-time site photos via device camera, upload files, or pick presets</p>
                </div>
              </div>
              <span className="text-xs font-bold text-slate-500">
                {images.length} / 8 photos
              </span>
            </div>

            {/* REAL-TIME DEVICE CAMERA & UPLOAD ACTION BANNER */}
            <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                    Real-Time On-Site Photography
                  </span>
                </div>
                <p className="text-xs text-slate-300 max-w-lg leading-relaxed">
                  Capture authentic demarcations, plot boundaries, and landscape views instantly using your device camera.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                <MediaPermissionButton
                  kind="camera"
                  label="Take Photo"
                  autoStart={true}
                  onCapture={(dataUrl) => {
                    if (images.length < 8) {
                      setImages(prev => [...prev, dataUrl]);
                      setErrors(prev => {
                        const next = { ...prev };
                        delete next.images;
                        return next;
                      });
                    } else {
                      setErrors(prev => ({
                        ...prev,
                        images: 'Maximum limit of 8 photos reached. Please delete an image before adding another.'
                      }));
                    }
                  }}
                  maxImagesReached={images.length >= 8}
                />

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  onChange={handleDeviceFileUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 sm:flex-none px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-700"
                  title="Upload photos from device gallery"
                >
                  <Upload className="w-3.5 h-3.5 text-slate-400" />
                  <span>Upload Files</span>
                </button>
              </div>
            </div>

            {errors.images && (
              <p className="text-xs text-rose-500 font-bold mt-1">{errors.images}</p>
            )}

            {/* Photo Previews Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((imgUrl, idx) => (
                <div key={idx} className="relative group rounded-2xl overflow-hidden aspect-4/3 border border-slate-200 bg-slate-100 shadow-2xs">
                  <img
                    src={imgUrl}
                    alt={`Property Photo ${idx + 1}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  {idx === 0 && (
                    <span className="absolute top-2 left-2 bg-emerald-700 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-sm">
                      Cover Photo
                    </span>
                  )}
                  {imgUrl.startsWith('data:image') && (
                    <span className="absolute top-2 right-2 bg-slate-900/85 backdrop-blur-xs text-emerald-400 border border-emerald-500/30 text-[9px] font-bold px-1.5 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                      <Camera className="w-2.5 h-2.5" />
                      <span>Live Camera</span>
                    </span>
                  )}
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                    {idx !== 0 && (
                      <button
                        type="button"
                        onClick={() => handleSetCover(idx)}
                        className="p-1.5 bg-white text-slate-900 rounded-lg text-[10px] font-bold shadow-xs hover:bg-slate-100 cursor-pointer"
                        title="Make Cover Photo"
                      >
                        Cover
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="p-1.5 bg-rose-600 text-white rounded-lg text-[10px] font-bold shadow-xs hover:bg-rose-700 cursor-pointer"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Preset Gallery Selectors */}
            <div>
              <div className="text-xs font-bold text-slate-700 mb-2">
                1-Click Preset Gallery Photos:
              </div>
              <div className="flex flex-wrap gap-2">
                {PRESET_IMAGES.map((preset, pIdx) => {
                  const isAdded = images.includes(preset.url);
                  return (
                    <button
                      key={pIdx}
                      type="button"
                      onClick={() => {
                        if (isAdded) {
                          handleRemoveImage(images.indexOf(preset.url));
                        } else if (images.length < 8) {
                          setImages([...images, preset.url]);
                          if (errors.images) {
                            setErrors(prev => {
                              const next = { ...prev };
                              delete next.images;
                              return next;
                            });
                          }
                        }
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer flex items-center gap-1.5 ${
                        isAdded 
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {isAdded ? <Check className="w-3 h-3 text-emerald-700" /> : <Plus className="w-3 h-3 text-slate-400" />}
                      <span>{preset.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom URL Input */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Add Custom Image URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none focus:bg-white"
                />
                <button
                  type="button"
                  onClick={handleAddCustomImage}
                  className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* SECTION D: AMENITIES & DESCRIPTION */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                  4
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Verified Amenities & Description</h2>
                  <p className="text-xs text-slate-500">Highlight regulatory approvals, physical features and description</p>
                </div>
              </div>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                {selectedAmenities.length} Selected
              </span>
            </div>

            {/* Amenities Checklist */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Key Physical Features & TMA Approvals
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DEFAULT_AMENITIES.map((amenity, aIdx) => {
                  const isChecked = selectedAmenities.includes(amenity);
                  return (
                    <button
                      key={aIdx}
                      type="button"
                      onClick={() => toggleAmenity(amenity)}
                      className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between transition cursor-pointer ${
                        isChecked 
                          ? 'bg-purple-50 text-purple-900 border-purple-300 font-bold'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      <span className="text-left">{amenity}</span>
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center border shrink-0 ml-2 ${
                        isChecked ? 'bg-purple-700 border-purple-700 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Templates Quick Apply */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">Detailed Property Description</label>
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="text-slate-400 font-bold">Templates:</span>
                  <button
                    type="button"
                    onClick={() => applyTemplate('possession')}
                    className="text-purple-700 hover:underline font-bold cursor-pointer"
                  >
                    Possession
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => applyTemplate('installment')}
                    className="text-purple-700 hover:underline font-bold cursor-pointer"
                  >
                    Installment
                  </button>
                  <span>•</span>
                  <button
                    type="button"
                    onClick={() => applyTemplate('commercial')}
                    className="text-purple-700 hover:underline font-bold cursor-pointer"
                  >
                    Commercial
                  </button>
                </div>
              </div>
              <textarea
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write comprehensive plot highlights, road width, nearby parks, utilities status..."
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium outline-none focus:bg-white leading-relaxed resize-none"
              />

              {/* Voice Note Recording option using MediaPermissionButton */}
              <div className="pt-1">
                <MediaPermissionButton
                  kind="microphone"
                  label="Record Voice Description Note"
                  onAudioRecorded={(_blob, _url) => {
                    setDescription(prev => {
                      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      const noteText = `[Voice Note Recorded at ${timeStr}: On-site verbal walkthrough recorded by agent.]`;
                      return prev ? `${prev}\n\n${noteText}` : noteText;
                    });
                  }}
                />
              </div>
            </div>
          </div>

          {/* SECTION E: GEOGRAPHIC LOCATION & COORDINATES */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold">
                  5
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900">Geographic Location & Boundary Reference</h2>
                  <p className="text-xs text-slate-500">Physical address, GPS pin and interactive map anchor</p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                {latitude.toFixed(4)}, {longitude.toFixed(4)}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Physical Address / Demarcation Reference
              </label>
              <input
                type="text"
                value={locationAddress}
                onChange={(e) => setLocationAddress(e.target.value)}
                placeholder="e.g. Plot 42, Main Boulevard, Sector A, Narowal"
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={latitude}
                  onChange={(e) => setLatitude(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs outline-none focus:bg-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={longitude}
                  onChange={(e) => setLongitude(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs outline-none focus:bg-white"
                />
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT COL: LIVE MARKETPLACE CARD PREVIEW & PUBLISH ACTIONS */}
        <div className="space-y-6">
          <div className="sticky top-24 space-y-6">
            
            {/* Live Marketplace Card Preview */}
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-md space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5 text-xs font-black text-slate-900 uppercase tracking-wider">
                  <Eye className="w-4 h-4 text-emerald-600" />
                  <span>Marketplace Live Preview</span>
                </div>
                {title.trim().length < 5 ? (
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    Incomplete
                  </span>
                ) : (
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Ready to Publish
                  </span>
                )}
              </div>

              {/* Mock Property Card */}
              <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-xs bg-white">
                <div className="relative aspect-16/10 bg-slate-100">
                  <img
                    src={images[0] || PRESET_IMAGES[0].url}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-900/90 text-white backdrop-blur-xs">
                    {category}
                  </span>
                  <span className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-700 text-white">
                    {calculatedSizeMarla} Marla
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <div className="text-[11px] font-bold text-teal-700 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    <span>{currentSocietyObj?.name || 'Society'}, {block}</span>
                  </div>

                  <h3 className="text-sm font-black text-slate-900 line-clamp-1">
                    {title || '5 Marla Demarcated Prime Plot'}
                  </h3>

                  <div className="flex items-baseline justify-between pt-1 border-t border-slate-100">
                    <div className="text-base font-black font-mono text-slate-900">
                      PKR {basePricePKR.toLocaleString('en-PK')}
                    </div>
                    <div className="text-[10px] font-bold text-slate-500">
                      PKR {(basePricePKR / 100000).toFixed(1)} Lacs
                    </div>
                  </div>

                  {installmentsAvailable && (
                    <div className="p-2 bg-emerald-50 rounded-xl text-[10px] font-bold text-emerald-800 flex items-center justify-between">
                      <span>{downPaymentPercent}% Down Payment</span>
                      <span>PKR {calculatedMonthlyPKR.toLocaleString('en-PK')}/mo</span>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 font-mono">
                    Unique Ref: {predictedId}
                  </div>
                </div>
              </div>

              {/* Action Submit Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-2xl font-black text-sm transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-98"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>Saving Listing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>{existingProperty ? 'Save & Update Listing' : 'Publish Property Listing'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (isDealer) onNavigate('/dealer/listings');
                    else if (isSocietyAdmin) onNavigate('/society/inventory');
                    else if (isSuperAdmin) onNavigate('/admin/overview');
                    else onNavigate('/marketplace');
                  }}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs transition cursor-pointer"
                >
                  Cancel & Return
                </button>
              </div>

              {/* Compliance note */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[10px] text-slate-500 space-y-1">
                <div className="font-bold text-slate-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>LDA/TMA Regulatory Synchronization</span>
                </div>
                <p>
                  Upon publishing, this listing is registered with the unique reference code and demarcated on the society interactive plot matrix.
                </p>
              </div>

            </div>

          </div>
        </div>

      </form>

      {/* 3. INTERACTIVE PLOT PICKER MODAL */}
      {showPlotPickerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-teal-400" />
                <div>
                  <h3 className="text-sm font-black">Select Demarcated Plot from Masterplan</h3>
                  <p className="text-[11px] text-slate-400">{currentSocietyObj?.name} Plot Inventory</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPlotPickerModal(false)}
                className="p-1.5 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search filter inside modal */}
            <div className="p-4 border-b border-slate-100 bg-slate-50">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by plot number, sector or size (e.g. Plot 42, Sector A)..."
                  value={plotSearchQuery}
                  onChange={(e) => setPlotSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold outline-none"
                />
              </div>
            </div>

            {/* Plot List */}
            <div className="p-4 overflow-y-auto divide-y divide-slate-100 space-y-2 flex-1">
              {availablePlotsInCurrentSociety
                .filter(p => {
                  if (!plotSearchQuery) return true;
                  const q = plotSearchQuery.toLowerCase();
                  return (
                    (p.plotNumber || '').toLowerCase().includes(q) ||
                    (p.sector && p.sector.toLowerCase().includes(q)) ||
                    (p.category && p.category.toLowerCase().includes(q))
                  );
                })
                .map(p => {
                  const isAvailable = p.status === 'available';
                  return isAvailable ? (
                    <div
                      key={p.id}
                      onClick={() => handleSelectPlotFromInventory(p)}
                      className="p-3 rounded-2xl hover:bg-slate-50 transition cursor-pointer flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900">
                            Plot #{p.plotNumber}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-emerald-100 text-emerald-800">
                            Available
                          </span>
                          <span className="text-xs font-semibold text-slate-500">
                            {p.sector || p.block}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-3">
                          <span>{p.sizeMarla} Marla ({Math.round(p.sizeSqFt || p.sizeMarla * 225)} Sq. Ft)</span>
                          <span>•</span>
                          <span className="capitalize">{p.category}</span>
                          <span>•</span>
                          <span className="font-mono font-bold text-slate-700">PKR {p.pricePKR.toLocaleString('en-PK')}</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition shadow-2xs shrink-0 cursor-pointer"
                      >
                        Link & Demarcate
                      </button>
                    </div>
                  ) : (
                    <div
                      key={p.id}
                      className="p-3 rounded-2xl bg-slate-50/60 opacity-60 flex items-center justify-between gap-3 cursor-not-allowed"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-500">
                            Plot #{p.plotNumber}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-slate-200 text-slate-600">
                            {p.status}
                          </span>
                          <span className="text-xs font-semibold text-slate-400">
                            {p.sector || p.block}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-3">
                          <span>{p.sizeMarla} Marla ({Math.round(p.sizeSqFt || p.sizeMarla * 225)} Sq. Ft)</span>
                          <span>•</span>
                          <span className="capitalize">{p.category}</span>
                          <span>•</span>
                          <span className="font-mono font-bold text-slate-400">PKR {p.pricePKR.toLocaleString('en-PK')}</span>
                        </div>
                      </div>

                      <span className="px-3 py-1.5 bg-slate-200 text-slate-500 rounded-xl text-xs font-bold shrink-0">
                        Not available
                      </span>
                    </div>
                  );
                })}

              {availablePlotsInCurrentSociety.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs">
                  No plots found in masterplan inventory for this society.
                </div>
              )}
            </div>

            <div className="p-3 bg-slate-50 border-t border-slate-100 text-right">
              <button
                type="button"
                onClick={() => setShowPlotPickerModal(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 4. REAL-TIME DEVICE CAMERA CAPTURE MODAL */}
      {showCameraModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Modal Header */}
            <div className="px-5 py-3.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="relative flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-rose-500 animate-ping absolute"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-2">
                    <Camera className="w-4 h-4 text-emerald-400" />
                    <span>Real-Time Property Camera</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {cameraFacingMode === 'environment' ? 'REAR SENSOR • PROPERTY LANDSCAPE' : 'FRONT SENSOR • USER VIEW'} • {images.length}/8 SAVED
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Rule of thirds grid toggle */}
                <button
                  type="button"
                  onClick={() => setShowGridOverlay(!showGridOverlay)}
                  className={`p-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                    showGridOverlay 
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/40' 
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                  }`}
                  title="Toggle Real Estate Alignment Grid"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>

                {/* Flip camera facing mode */}
                <button
                  type="button"
                  onClick={toggleFacingMode}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                  title="Switch Camera (Front / Rear)"
                >
                  <SwitchCamera className="w-4 h-4" />
                </button>

                {/* Close modal */}
                <button
                  type="button"
                  onClick={stopCamera}
                  className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
                  title="Close Camera"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Viewfinder Area */}
            <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden min-h-[340px] sm:min-h-[420px]">
              
              {/* Shutter flash animation overlay */}
              <div 
                className={`absolute inset-0 bg-white z-40 pointer-events-none transition-opacity duration-150 ${
                  isCapturingFlash ? 'opacity-90' : 'opacity-0'
                }`}
              />

              {/* Error State */}
              {cameraError ? (
                <div className="p-6 text-center max-w-md mx-auto space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-rose-950/80 text-rose-400 border border-rose-800 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-7 h-7" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">Camera Access Notice</h4>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{cameraError}</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => startCamera(cameraFacingMode)}
                      className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Retry Camera</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        stopCamera();
                        fileInputRef.current?.click();
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer border border-slate-700"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload from Device</span>
                    </button>
                  </div>
                </div>
              ) : isCameraStarting ? (
                /* Loading State */
                <div className="text-center space-y-3 p-6">
                  <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
                  <p className="text-xs font-bold text-slate-300">Accessing device camera sensor...</p>
                  <p className="text-[11px] text-slate-500">Please grant camera permissions when prompted by your browser</p>
                </div>
              ) : capturedPhotoPreview ? (
                /* Captured Photo Freeze & Confirmation View */
                <div className="relative w-full h-full flex items-center justify-center bg-black">
                  <img
                    src={capturedPhotoPreview}
                    alt="Captured Property Snapshot"
                    className="max-h-[70vh] w-full object-contain"
                  />
                  <div className="absolute top-4 left-4 bg-emerald-600/90 text-white text-[11px] font-extrabold px-3 py-1 rounded-full shadow-lg backdrop-blur-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Photo Captured Successfully</span>
                  </div>
                </div>
              ) : (
                /* Live Real-time Camera Video Feed */
                <div className="relative w-full h-full flex items-center justify-center bg-black">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover max-h-[68vh]"
                  />

                  {/* Rule-of-Thirds Grid Overlay */}
                  {showGridOverlay && (
                    <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 border border-white/10">
                      <div className="border-r border-b border-white/20"></div>
                      <div className="border-r border-b border-white/20"></div>
                      <div className="border-b border-white/20"></div>
                      <div className="border-r border-b border-white/20"></div>
                      <div className="border-r border-b border-white/20 relative flex items-center justify-center">
                        {/* Center focus indicator */}
                        <div className="w-10 h-10 border border-amber-400/60 rounded-full flex items-center justify-center">
                          <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                        </div>
                      </div>
                      <div className="border-b border-white/20"></div>
                      <div className="border-r border-white/20"></div>
                      <div className="border-r border-white/20"></div>
                      <div></div>
                    </div>
                  )}

                  {/* Live viewfinder HUD */}
                  <div className="absolute top-3 left-3 bg-slate-950/70 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/10 text-[10px] font-mono text-emerald-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>LIVE VIEW • REAL-TIME CAPTURE</span>
                  </div>

                  <div className="absolute top-3 right-3 bg-slate-950/70 backdrop-blur-xs px-2.5 py-1 rounded-lg border border-white/10 text-[10px] font-mono text-slate-300">
                    {cameraFacingMode === 'environment' ? 'REAR' : 'FRONT'}
                  </div>
                </div>
              )}

            </div>

            {/* Bottom Controls Bar */}
            <div className="p-4 bg-slate-950 border-t border-slate-800 shrink-0">
              {capturedPhotoPreview ? (
                /* Controls when previewing captured shot */
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setCapturedPhotoPreview(null)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
                  >
                    <RotateCcw className="w-4 h-4 text-amber-400" />
                    <span>Retake Photo</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {images.length < 7 && (
                      <button
                        type="button"
                        onClick={handleSaveAndTakeNext}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer border border-slate-700"
                      >
                        <Plus className="w-4 h-4 text-emerald-400" />
                        <span>Save & Take Another</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleUseCapturedPhoto}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Use This Photo</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* Controls during live viewfinder */
                <div className="flex items-center justify-between">
                  <div className="w-20">
                    <button
                      type="button"
                      onClick={() => {
                        stopCamera();
                        fileInputRef.current?.click();
                      }}
                      className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-2xl border border-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Upload from device storage"
                    >
                      <Upload className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Main Shutter Trigger Button */}
                  <div className="flex flex-col items-center">
                    <button
                      type="button"
                      onClick={capturePhoto}
                      disabled={isCameraStarting || !!cameraError}
                      className="w-16 h-16 rounded-full border-4 border-white bg-emerald-500 hover:bg-emerald-400 active:scale-90 transition shadow-2xl flex items-center justify-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
                      title="Capture Photo"
                    >
                      <div className="w-11 h-11 rounded-full bg-white group-hover:scale-95 transition"></div>
                    </button>
                    <span className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                      Capture
                    </span>
                  </div>

                  <div className="w-20 flex justify-end">
                    <button
                      type="button"
                      onClick={toggleFacingMode}
                      className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-2xl border border-slate-800 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Switch Camera (Front / Rear)"
                    >
                      <SwitchCamera className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

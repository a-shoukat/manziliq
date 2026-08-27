import React, { useState, useEffect, useMemo } from 'react';
import { Property, Society, Plot, User } from '../../types';
import { 
  Building2, 
  MapPin, 
  Upload, 
  X, 
  Check, 
  AlertTriangle, 
  Image as ImageIcon, 
  Sparkles, 
  DollarSign, 
  Layers, 
  ChevronRight, 
  MoveLeft, 
  MoveRight, 
  Star, 
  Trash2, 
  ShieldAlert, 
  Calendar, 
  Compass, 
  Info,
  Sliders,
  CheckCircle2,
  Lock,
  Search,
  RefreshCw,
  Link2,
  Unlink,
  Briefcase,
  Tag,
  CheckCircle,
  HelpCircle,
  Filter,
  Copy,
  ShieldCheck
} from 'lucide-react';
import { 
  previewNextUniqueId, 
  getCategoryPrefix, 
  formatSocietyCode 
} from '../../utils/idGenerator';

interface AddEditPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  societies: Society[];
  plots?: Plot[];
  existingProperty?: Property | null;
  onSave: (propertyData: Property, plotData?: Partial<Plot>) => void;
}

const DEFAULT_AMENITIES = [
  'Corner plot',
  'Park facing',
  'Main boulevard',
  'Gas connection',
  'Electricity connection',
  'Water/sui gas',
  'Possession-ready',
  'Society-approved layout',
  '24/7 Gated Security',
  'Underground Utilities',
  'West Open',
  'Wide 40ft Carpeted Road'
];

const PRESET_IMAGES = [
  { label: 'Executive Villa', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=1000' },
  { label: 'Demarcated Plot', url: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1000' },
  { label: 'Gated Society Boulevard', url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000' },
  { label: 'Park Facing Corner', url: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&q=80&w=1000' },
  { label: 'Masterplan Landscape', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=1000' },
  { label: 'Commercial Complex', url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=1000' }
];

export const AddEditPropertyModal: React.FC<AddEditPropertyModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  societies: initialSocieties,
  plots: initialPlots = [],
  existingProperty = null,
  onSave
}) => {
  // Role checks
  const isDealer = currentUser.role === 'dealer';
  const isSocietyAdmin = currentUser.role === 'society_admin';
  const isSuperAdmin = currentUser.role === 'super_admin';

  // Dynamic Data State (fetched from API or backed by props)
  const [dynamicSocieties, setDynamicSocieties] = useState<Society[]>(initialSocieties);
  const [dynamicPlots, setDynamicPlots] = useState<Plot[]>(initialPlots);
  const [isLoadingDynamicData, setIsLoadingDynamicData] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'fallback'>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<string>('');

  // Initial user default society ID determination
  const userAssignedSocietyId = isSocietyAdmin
    ? (currentUser.societyId || initialSocieties[0]?.id || 'soc-1')
    : (initialSocieties[0]?.id || 'soc-1');

  // Form States - 1. Basic Info
  const [title, setTitle] = useState('');
  const [societyId, setSocietyId] = useState(userAssignedSocietyId);
  const [block, setBlock] = useState('Block A');
  const [plotNumber, setPlotNumber] = useState('');
  const [category, setCategory] = useState<'Residential Plot' | 'Commercial Plot' | 'House' | 'Apartment'>('Residential Plot');

  // Linked Plot Inventory Demarcation State
  const [linkedPlot, setLinkedPlot] = useState<Plot | null>(null);
  const [showPlotPicker, setShowPlotPicker] = useState<boolean>(!existingProperty);
  const [plotSearchQuery, setPlotSearchQuery] = useState<string>('');
  const [plotTabFilter, setPlotTabFilter] = useState<'all' | 'assigned' | 'available' | 'residential' | 'commercial'>(
    isDealer ? 'assigned' : 'all'
  );

  // 2. Size & Price
  const [sizeValue, setSizeValue] = useState<number>(5);
  const [sizeUnit, setSizeUnit] = useState<'Marla' | 'Kanal' | 'Sq. Ft'>('Marla');
  const [basePricePKR, setBasePricePKR] = useState<number>(3000000);
  const [pricePerMarlaOverride, setPricePerMarlaOverride] = useState<boolean>(false);
  const [manualPricePerMarla, setManualPricePerMarla] = useState<number>(600000);

  // 3. Location
  const [locationAddress, setLocationAddress] = useState('Main Boulevard, Sector A, Narowal');
  const [latitude, setLatitude] = useState<number>(32.1012);
  const [longitude, setLongitude] = useState<number>(74.8732);
  const [selectedSvgZoneId, setSelectedSvgZoneId] = useState<string>('');

  // 4. Media
  const [images, setImages] = useState<string[]>([PRESET_IMAGES[0].url]);
  const [customImageUrl, setCustomImageUrl] = useState('');

  // 5. Amenities / Features
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'Main boulevard',
    'Electricity connection',
    'Water/sui gas',
    '24/7 Gated Security'
  ]);

  // 6. Description
  const [description, setDescription] = useState(
    'Prime residential property with direct approach from main road, approved layout, ready for immediate possession with utilities intact.'
  );

  // 7. Status
  const [status, setStatus] = useState<'available' | 'reserved' | 'sold' | 'disputed'>('available');

  // 8. Payment Plan
  const [installmentsAvailable, setInstallmentsAvailable] = useState<boolean>(true);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20);
  const [installmentMonths, setInstallmentMonths] = useState<number>(36);

  // Validation errors & Submission
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==============================================================================
  // DYNAMIC FETCHING ON INITIALIZATION
  // Fetches authorized societies and plots linked to current dealer or society admin
  // ==============================================================================
  const fetchDynamicData = async (targetSocId?: string) => {
    if (!isOpen) return;
    setIsLoadingDynamicData(true);
    setSyncStatus('syncing');

    try {
      // 1. Fetch filtered societies based on role
      const socUrl = `/api/properties/societies?role=${encodeURIComponent(currentUser.role)}&userId=${encodeURIComponent(currentUser.id)}&societyId=${encodeURIComponent(currentUser.societyId || '')}`;
      const socRes = await fetch(socUrl, {
        headers: {
          'x-user-role': currentUser.role || 'dealer',
        }
      });

      let fetchedSocs: Society[] = initialSocieties;
      if (socRes.ok) {
        const socData = await socRes.json();
        if (socData.success && Array.isArray(socData.societies) && socData.societies.length > 0) {
          fetchedSocs = socData.societies;
          setDynamicSocieties(fetchedSocs);
        }
      }

      // Determine active society to query plots for
      const activeSocId = targetSocId || 
        (isSocietyAdmin ? (currentUser.societyId || fetchedSocs[0]?.id) : (societyId || fetchedSocs[0]?.id));

      // 2. Fetch specific plot inventory for this society & role
      const plotUrl = `/api/properties/plots?role=${encodeURIComponent(currentUser.role)}&userId=${encodeURIComponent(currentUser.id)}&societyId=${encodeURIComponent(activeSocId || '')}`;
      const plotRes = await fetch(plotUrl, {
        headers: {
          'x-user-role': currentUser.role || 'dealer',
        }
      });

      if (plotRes.ok) {
        const plotData = await plotRes.json();
        if (plotData.success && Array.isArray(plotData.plots)) {
          setDynamicPlots(plotData.plots);
          setSyncStatus('synced');
          setLastSyncedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        } else {
          setDynamicPlots(initialPlots);
          setSyncStatus('fallback');
        }
      } else {
        setDynamicPlots(initialPlots);
        setSyncStatus('fallback');
      }
    } catch (err) {
      console.warn('[AddEditPropertyModal Dynamic Fetch Warning]:', err);
      setDynamicSocieties(initialSocieties);
      setDynamicPlots(initialPlots);
      setSyncStatus('fallback');
    } finally {
      setIsLoadingDynamicData(false);
    }
  };

  // Trigger dynamic fetch whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      fetchDynamicData(societyId);
    }
  }, [isOpen, currentUser.id, currentUser.role]);

  // When societyId changes (e.g. for dealer or super admin), reload relevant plots
  const handleSocietyChange = (newSocId: string) => {
    setSocietyId(newSocId);
    setLinkedPlot(null); // reset linked plot if society switches
    fetchDynamicData(newSocId);
  };

  // Populate data if editing, or reset when opening fresh
  useEffect(() => {
    if (existingProperty) {
      setTitle(existingProperty.title || '');
      setSocietyId(existingProperty.societyId || userAssignedSocietyId);
      setBlock(existingProperty.block || 'Block A');
      setPlotNumber(existingProperty.plotNumber || '');
      
      const cat = existingProperty.category as any;
      if (cat) setCategory(cat);
      else if (existingProperty.type === 'house') setCategory('House');
      else if (existingProperty.type === 'commercial') setCategory('Commercial Plot');
      else if (existingProperty.type === 'apartment') setCategory('Apartment');
      else setCategory('Residential Plot');

      setSizeValue(existingProperty.sizeValue || existingProperty.sizeMarla || 5);
      setSizeUnit(existingProperty.sizeUnit || 'Marla');
      setBasePricePKR(existingProperty.pricePKR || 3000000);
      
      if (existingProperty.pricePerMarla) {
        setPricePerMarlaOverride(true);
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
      setSelectedAmenities(existingProperty.amenities || []);
      setDescription(existingProperty.description || '');
      setStatus(existingProperty.listingStatus || 'available');

      if (existingProperty.paymentPlan) {
        setInstallmentsAvailable(existingProperty.paymentPlan.installmentsAvailable);
        setDownPaymentPercent(existingProperty.paymentPlan.downPaymentPercent || 20);
        setInstallmentMonths(existingProperty.paymentPlan.installmentMonths || 36);
      }

      // Check if this matches a known plot in inventory
      const matchingPlot = dynamicPlots.find(p => 
        p.societyId === existingProperty.societyId && 
        p.plotNumber.toLowerCase() === (existingProperty.plotNumber || '').toLowerCase()
      );
      if (matchingPlot) {
        setLinkedPlot(matchingPlot);
      }
      setShowPlotPicker(false);
    } else {
      // Sensible defaults for new listing
      setTitle('');
      setSocietyId(userAssignedSocietyId);
      setBlock('Sector A');
      setPlotNumber('');
      setCategory('Residential Plot');
      setSizeValue(5);
      setSizeUnit('Marla');
      setBasePricePKR(3000000);
      setPricePerMarlaOverride(false);
      setLocationAddress('Main Boulevard, Sector A, Narowal');
      setImages([PRESET_IMAGES[0].url]);
      setSelectedAmenities(['Main boulevard', 'Electricity connection', 'Water/sui gas', '24/7 Gated Security']);
      setDescription('Prime residential property with direct approach from main road, approved layout, ready for immediate possession with utilities intact.');
      setStatus('available');
      setInstallmentsAvailable(true);
      setDownPaymentPercent(20);
      setInstallmentMonths(36);
      setLinkedPlot(null);
      setShowPlotPicker(true);
      setErrors({});
    }
  }, [existingProperty, isOpen, userAssignedSocietyId]);

  // Calculations
  const calculateSizeMarla = (): number => {
    if (sizeUnit === 'Marla') return Number(sizeValue) || 0;
    if (sizeUnit === 'Kanal') return (Number(sizeValue) || 0) * 20;
    if (sizeUnit === 'Sq. Ft') return Math.round(((Number(sizeValue) || 0) / 225) * 100) / 100;
    return Number(sizeValue) || 0;
  };

  const calculatedSizeMarla = calculateSizeMarla();
  const autoPricePerMarla = calculatedSizeMarla > 0 ? Math.round(basePricePKR / calculatedSizeMarla) : 0;
  const activePricePerMarla = pricePerMarlaOverride ? manualPricePerMarla : autoPricePerMarla;
  const calculatedDownPaymentPKR = Math.round((basePricePKR * (downPaymentPercent / 100)));
  const calculatedRemainingPKR = Math.max(0, basePricePKR - calculatedDownPaymentPKR);
  const calculatedMonthlyPKR = installmentMonths > 0 ? Math.round(calculatedRemainingPKR / installmentMonths) : 0;

  // Active Society Object
  const currentSocietyObj = dynamicSocieties.find(s => s.id === societyId) || dynamicSocieties[0];

  // Filtered Plots in currently selected society
  const availablePlotsInCurrentSociety = useMemo(() => {
    return dynamicPlots.filter(p => {
      const matchSoc = p.societyId === societyId || p.societyName?.toLowerCase() === currentSocietyObj?.name?.toLowerCase();
      return matchSoc;
    });
  }, [dynamicPlots, societyId, currentSocietyObj]);

  // Filtered Plot List for the Plot Picker with search and role tabs
  const filteredInventoryPlots = useMemo(() => {
    let result = [...availablePlotsInCurrentSociety];

    // Role tab filter
    if (plotTabFilter === 'assigned') {
      if (isDealer) {
        result = result.filter(p => (p as any).isAssignedToMe || p.dealerId === currentUser.id);
      }
    } else if (plotTabFilter === 'available') {
      result = result.filter(p => p.status === 'available');
    } else if (plotTabFilter === 'residential') {
      result = result.filter(p => p.category === 'residential' || !p.category);
    } else if (plotTabFilter === 'commercial') {
      result = result.filter(p => p.category === 'commercial');
    }

    // Search filter
    if (plotSearchQuery.trim()) {
      const q = plotSearchQuery.toLowerCase();
      result = result.filter(p => 
        p.plotNumber.toLowerCase().includes(q) ||
        (p.block && p.block.toLowerCase().includes(q)) ||
        (p.sector && p.sector.toLowerCase().includes(q)) ||
        `${p.sizeMarla} marla`.toLowerCase().includes(q)
      );
    }

    return result;
  }, [availablePlotsInCurrentSociety, plotTabFilter, plotSearchQuery, isDealer, currentUser.id]);

  // Dealer assigned plots count
  const dealerAssignedPlotsCount = useMemo(() => {
    return availablePlotsInCurrentSociety.filter(p => (p as any).isAssignedToMe || p.dealerId === currentUser.id).length;
  }, [availablePlotsInCurrentSociety, currentUser.id]);

  // Derived Category Prefix & Unique Property ID live preview
  const [copiedId, setCopiedId] = useState(false);
  const typeMapping = category === 'House' ? 'house' : category === 'Commercial Plot' ? 'commercial' : category === 'Apartment' ? 'apartment' : 'plot';
  const categoryPrefix = getCategoryPrefix(category, typeMapping);
  const societyCode = formatSocietyCode(currentSocietyObj?.name || 'ARG');

  const predictedId = useMemo(() => {
    if (existingProperty?.propertyId) return existingProperty.propertyId;
    return previewNextUniqueId(
      currentSocietyObj,
      category,
      typeMapping,
      dynamicPlots
    );
  }, [existingProperty, currentSocietyObj, category, typeMapping, dynamicPlots]);

  const handleCopyGeneratedId = () => {
    navigator.clipboard?.writeText(predictedId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Handle Plot Selection from Inventory (Ensures 100% Data Consistency)
  const handleSelectPlotFromInventory = (plot: Plot) => {
    setLinkedPlot(plot);
    setPlotNumber(plot.plotNumber);
    setBlock(plot.block || plot.sector || 'Block A');
    setSizeValue(plot.sizeMarla);
    setSizeUnit('Marla');
    
    const cat = plot.category === 'commercial' ? 'Commercial Plot' : 'Residential Plot';
    setCategory(cat);
    
    setBasePricePKR(plot.pricePKR);
    setPricePerMarlaOverride(false);
    
    const generatedTitle = `${plot.sizeMarla} Marla ${cat} - Plot #${plot.plotNumber} (${plot.block || plot.sector || 'Executive Block'})`;
    setTitle(generatedTitle);
    
    setLocationAddress(`${plot.block || plot.sector || 'Main Sector'}, ${plot.societyName || currentSocietyObj?.name || 'Society'}, ${currentSocietyObj?.city || 'Narowal'}`);
    
    if (plot.geoCoordinates) {
      setLatitude(plot.geoCoordinates.lat);
      setLongitude(plot.geoCoordinates.lng);
    }
    
    if (plot.svgZoneId) {
      setSelectedSvgZoneId(plot.svgZoneId);
    } else {
      setSelectedSvgZoneId(`zone-${plot.plotNumber.replace(/\s+/g, '')}`);
    }
    
    if (plot.features && plot.features.length > 0) {
      setSelectedAmenities(plot.features);
    }
    
    setStatus(plot.status as any);

    if (plot.monthlyInstallmentPKR && plot.monthlyInstallmentPKR > 0) {
      setInstallmentsAvailable(true);
      setInstallmentMonths(plot.installmentMonths || 36);
      if (plot.downPaymentPKR) {
        setDownPaymentPercent(Math.round((plot.downPaymentPKR / plot.pricePKR) * 100) || 20);
      }
    }

    setDescription(
      `Directly verified inventory plot #${plot.plotNumber} in ${plot.block || plot.sector}, ${plot.societyName}. Features immediate demarcated boundary, approved layout, and ready utility infrastructure.`
    );

    // Clear any previous validation errors for these fields
    setErrors(prev => {
      const next = { ...prev };
      delete next.title;
      delete next.size;
      delete next.price;
      delete next.society;
      return next;
    });
  };

  const handleUnlinkPlot = () => {
    setLinkedPlot(null);
  };

  // Check for duplicate warning against other plots
  const duplicateMatch = useMemo(() => {
    if (!plotNumber.trim()) return null;
    return dynamicPlots.find(existing => {
      const sameSoc = existing.societyId === societyId;
      const samePlotNo = existing.plotNumber.toLowerCase() === plotNumber.toLowerCase().trim();
      const isSelf = linkedPlot && linkedPlot.id === existing.id;
      return sameSoc && samePlotNo && !isSelf && (!existingProperty || existing.id !== existingProperty.id);
    });
  }, [dynamicPlots, societyId, plotNumber, linkedPlot, existingProperty]);

  // Image Upload Handling
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > 8) {
      setErrors(prev => ({ ...prev, images: 'Maximum 8 images allowed per property.' }));
      return;
    }

    Array.from(files).forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setImages(prev => [...prev, uploadEvent.target!.result as string].slice(0, 8));
          setErrors(prev => {
            const next = { ...prev };
            delete next.images;
            return next;
          });
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleAddCustomImageUrl = () => {
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
      setErrors(prev => ({ ...prev, images: 'At least 1 image is required.' }));
      return;
    }
    setImages(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleMoveImage = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    const updated = [...images];
    const item = updated.splice(fromIndex, 1)[0];
    updated.splice(toIndex, 0, item);
    setImages(updated);
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    const updated = [...images];
    const item = updated.splice(index, 1)[0];
    updated.unshift(item);
    setImages(updated);
  };

  const toggleAmenity = (amenity: string) => {
    if (selectedAmenities.includes(amenity)) {
      setSelectedAmenities(selectedAmenities.filter(a => a !== amenity));
    } else {
      setSelectedAmenities([...selectedAmenities, amenity]);
    }
  };

  // Quick Description Templates
  const applyTemplate = (type: 'prime' | 'installment' | 'commercial') => {
    const socName = currentSocietyObj?.name || 'Al-Rehman Garden';
    if (type === 'prime') {
      setDescription(
        `Exceptional ${sizeValue} ${sizeUnit} plot situated in ${block} of ${socName}. Features high footfall location, direct main boulevard connectivity, approved demarcation, and 24/7 security. Ready for immediate construction and transfer.`
      );
    } else if (type === 'installment') {
      setDescription(
        `Affordable ${sizeValue} ${sizeUnit} listing with easy ${installmentMonths}-month installment schedule in ${socName}. Only ${downPaymentPercent}% down payment required (PKR ${calculatedDownPaymentPKR.toLocaleString('en-PK')}) with possession on 60% clearance.`
      );
    } else if (type === 'commercial') {
      setDescription(
        `High-yield commercial opportunity in ${socName}. ${sizeValue} ${sizeUnit} frontage unit on the central 100ft commercial boulevard. Ideal for shopping plazas, corporate offices, or bank branches.`
      );
    }
  };

  // 1-Click Fast Fill Preset
  const handleFastFillPreset = (type: '5marla_plot' | '10marla_villa' | '4marla_commercial') => {
    setErrors({});
    if (type === '5marla_plot') {
      setTitle('5 Marla Executive Residential Plot (Sector A)');
      setCategory('Residential Plot');
      setSizeValue(5);
      setSizeUnit('Marla');
      setBasePricePKR(3200000);
      setBlock('Sector A');
      setPlotNumber(`ARG-${Math.floor(10 + Math.random() * 90)}`);
      setLocationAddress('Main 50ft Boulevard, Sector A, Narowal');
      setImages([PRESET_IMAGES[1].url, PRESET_IMAGES[2].url]);
      setSelectedAmenities(['Corner plot', 'Main boulevard', 'Gas connection', 'Electricity connection', '24/7 Gated Security']);
      setDescription('Prime 5 Marla residential plot with direct road access, ready for immediate possession, TMA/LDA approved layout.');
      setStatus('available');
      setInstallmentsAvailable(true);
      setDownPaymentPercent(20);
      setInstallmentMonths(36);
    } else if (type === '10marla_villa') {
      setTitle('10 Marla Luxury Designer 5-Bed Constructed Villa');
      setCategory('House');
      setSizeValue(10);
      setSizeUnit('Marla');
      setBasePricePKR(18500000);
      setBlock('Executive Block');
      setPlotNumber(`V-${Math.floor(10 + Math.random() * 90)}`);
      setLocationAddress('Executive Block, Al-Rehman Garden, Narowal');
      setImages([PRESET_IMAGES[0].url, PRESET_IMAGES[3].url]);
      setSelectedAmenities(['Park facing', 'Main boulevard', 'Gas connection', 'Electricity connection', '24/7 Gated Security', 'Possession-ready']);
      setDescription('Brand new 5-bedroom double-storey luxury villa with Italian kitchen fittings, servant quarter, and landscaped front lawn.');
      setStatus('available');
      setInstallmentsAvailable(false);
    } else if (type === '4marla_commercial') {
      setTitle('4 Marla Prime Commercial Plaza Plot (100ft Boulevard)');
      setCategory('Commercial Plot');
      setSizeValue(4);
      setSizeUnit('Marla');
      setBasePricePKR(8500000);
      setBlock('Commercial District');
      setPlotNumber(`C-${Math.floor(10 + Math.random() * 90)}`);
      setLocationAddress('100ft Central Commercial Boulevard, Narowal');
      setImages([PRESET_IMAGES[5].url, PRESET_IMAGES[2].url]);
      setSelectedAmenities(['Main boulevard', 'Electricity connection', 'Water/sui gas', '24/7 Gated Security', 'Society-approved layout']);
      setDescription('High footfall 4 Marla commercial plot with direct facing on the central 100ft commercial boulevard. Ideal for shopping complexes, corporate offices, or bank branches.');
      setStatus('available');
      setInstallmentsAvailable(true);
      setDownPaymentPercent(25);
      setInstallmentMonths(24);
    }
  };

  // Validation & Submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!title.trim() || title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters long.';
    }
    if (!societyId) {
      newErrors.society = 'Housing society is required.';
    }
    if (!sizeValue || Number(sizeValue) <= 0) {
      newErrors.size = 'Please enter a valid plot size greater than 0.';
    }
    if (!basePricePKR || Number(basePricePKR) <= 0) {
      newErrors.price = 'Please specify a valid base price in PKR.';
    }
    if (images.length === 0) {
      newErrors.images = 'At least 1 cover photo is required.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);

    const typeMapping = category === 'House' ? 'house' : category === 'Commercial Plot' ? 'commercial' : category === 'Apartment' ? 'apartment' : 'plot';
    const propId = existingProperty ? existingProperty.id : `prop-${Date.now()}`;
    const cleanPlotNumber = plotNumber.trim() || `Plot-${Math.floor(100 + Math.random() * 900)}`;
    const finalPropertyId = existingProperty?.propertyId || predictedId;

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
      dealerId: isDealer ? currentUser.id : existingProperty?.dealerId,
      dealerName: isDealer ? currentUser.name : existingProperty?.dealerName,
      assignedDealerId: isDealer ? currentUser.id : existingProperty?.assignedDealerId,
      images,
      description: description.trim(),
      amenities: selectedAmenities,
      featured: true,
      status: 'approved',
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
      isDuplicateFlagged: !!duplicateMatch,
      createdAt: existingProperty ? existingProperty.createdAt : new Date().toISOString()
    };

    // Plot data for synchronized inventory update
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
      sizeSqFt: calculatedSizeMarla * 225,
      pricePKR: Number(basePricePKR),
      downPaymentPKR: calculatedDownPaymentPKR,
      monthlyInstallmentPKR: calculatedMonthlyPKR,
      installmentMonths,
      status: status,
      category: category === 'Commercial Plot' ? 'commercial' : 'residential',
      dimensions: calculatedSizeMarla === 5 ? '25x45' : calculatedSizeMarla === 10 ? '35x65' : calculatedSizeMarla === 20 ? '50x90' : '30x50',
      features: selectedAmenities,
      coordinates: linkedPlot?.coordinates || { x: Math.floor(Math.random() * 80) + 10, y: Math.floor(Math.random() * 80) + 10 },
      geoCoordinates: { lat: latitude, lng: longitude },
      svgZoneId: selectedSvgZoneId || `zone-${cleanPlotNumber.replace(/\s+/g, '')}`,
      dealerId: isDealer ? currentUser.id : (linkedPlot?.dealerId || existingProperty?.dealerId),
      dealerName: isDealer ? currentUser.name : (linkedPlot?.dealerName || existingProperty?.dealerName),
      isDisputed: status === 'disputed'
    };

    onSave(newProperty, plotData);
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div id="add-edit-property-modal" className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col animate-slide-down">
        
        {/* Modal Header with Role Jurisdiction & Live Sync Indicator */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-black tracking-tight text-white">
                  {existingProperty ? 'Edit Property Listing' : 'Add New Property Listing'}
                </h2>
                
                {/* Role Specific Badge */}
                {isSocietyAdmin && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Society Admin ({currentSocietyObj?.name || 'Exclusive'})
                  </span>
                )}
                {isDealer && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> Certified Realtor (Lic: {currentUser.licenseNo || 'Verified'})
                  </span>
                )}
                {isSuperAdmin && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                    Super Admin (All Societies)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                <span>Direct demarcation sync with marketplace & masterplan database</span>
                {syncStatus === 'syncing' ? (
                  <span className="text-amber-400 flex items-center gap-1 text-[11px]">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Fetching inventory...
                  </span>
                ) : syncStatus === 'synced' ? (
                  <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                    <CheckCircle className="w-3 h-3" /> {availablePlotsInCurrentSociety.length} plots synced ({lastSyncedAt})
                  </span>
                ) : null}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fetchDynamicData(societyId)}
              disabled={isLoadingDynamicData}
              title="Refresh plots inventory from database"
              className="p-2 text-slate-400 hover:text-amber-400 hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${isLoadingDynamicData ? 'animate-spin text-amber-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Linked Demarcation Plot Banner (Data Consistency Assurance) */}
          {linkedPlot ? (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-slide-down">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 mt-0.5">
                  <Link2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs text-emerald-900">
                      🔗 Linked to Inventory Plot #{linkedPlot.plotNumber}
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                      {linkedPlot.sizeMarla} Marla • {linkedPlot.category?.toUpperCase() || 'RESIDENTIAL'}
                    </span>
                    {(linkedPlot as any).isAssignedToMe && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-200 text-amber-900">
                        ⭐ Assigned to You
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Data consistency locked: Sector {linkedPlot.block || linkedPlot.sector}, Base Demand PKR {linkedPlot.pricePKR.toLocaleString('en-PK')}, Society: {linkedPlot.societyName}.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowPlotPicker(!showPlotPicker)}
                  className="px-3 py-1.5 bg-white text-emerald-900 border border-emerald-300 rounded-xl font-bold text-xs hover:bg-emerald-100 transition cursor-pointer"
                >
                  {showPlotPicker ? 'Hide Inventory' : 'Change Plot'}
                </button>
                <button
                  type="button"
                  onClick={handleUnlinkPlot}
                  className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs hover:bg-rose-100 transition flex items-center gap-1 cursor-pointer"
                >
                  <Unlink className="w-3.5 h-3.5" /> Unlink
                </button>
              </div>
            </div>
          ) : null}

          {/* DYNAMIC PLOT PICKER / INVENTORY SELECTOR (Role-Based Filtering) */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                <span className="font-extrabold text-xs text-slate-900">
                  📦 Select from Verified Society Plot Inventory & Demarcation:
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900">
                  {availablePlotsInCurrentSociety.length} in {currentSocietyObj?.name || 'Society'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPlotPicker(!showPlotPicker)}
                  className="text-[11px] font-bold text-indigo-600 hover:underline cursor-pointer"
                >
                  {showPlotPicker ? 'Collapse Inventory Drawer ▲' : 'Browse Inventory Plots ▼'}
                </button>
              </div>
            </div>

            {showPlotPicker && (
              <div className="space-y-3 pt-1">
                {/* Search & Tabs */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={plotSearchQuery}
                      onChange={(e) => setPlotSearchQuery(e.target.value)}
                      placeholder="Search plot number (e.g. ARG-04), block, or size..."
                      className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs outline-none focus:border-indigo-400"
                    />
                  </div>

                  {/* Filter Chips */}
                  <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                    <button
                      type="button"
                      onClick={() => setPlotTabFilter('all')}
                      className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition shrink-0 ${
                        plotTabFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      All ({availablePlotsInCurrentSociety.length})
                    </button>

                    {isDealer && (
                      <button
                        type="button"
                        onClick={() => setPlotTabFilter('assigned')}
                        className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition shrink-0 flex items-center gap-1 ${
                          plotTabFilter === 'assigned' ? 'bg-amber-500 text-slate-950 font-black' : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        ⭐ My Lots ({dealerAssignedPlotsCount})
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => setPlotTabFilter('available')}
                      className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition shrink-0 ${
                        plotTabFilter === 'available' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Available
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlotTabFilter('residential')}
                      className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition shrink-0 ${
                        plotTabFilter === 'residential' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Residential
                    </button>
                    <button
                      type="button"
                      onClick={() => setPlotTabFilter('commercial')}
                      className={`px-2.5 py-1.5 rounded-lg font-bold text-[11px] transition shrink-0 ${
                        plotTabFilter === 'commercial' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      Commercial
                    </button>
                  </div>
                </div>

                {/* Plot Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1 bg-white rounded-xl border border-slate-200">
                  {filteredInventoryPlots.length === 0 ? (
                    <div className="col-span-full py-6 text-center text-slate-400 text-xs">
                      No matching plots found in this category. You can enter plot details manually below.
                    </div>
                  ) : (
                    filteredInventoryPlots.map((p) => {
                      const isSelected = linkedPlot?.id === p.id;
                      const isAssigned = (p as any).isAssignedToMe || p.dealerId === currentUser.id;
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleSelectPlotFromInventory(p)}
                          className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950'
                              : isAssigned
                              ? 'bg-amber-50/70 border-amber-300 hover:border-amber-400 text-slate-900'
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-mono font-black text-xs text-slate-900">
                              #{p.plotNumber}
                            </span>
                            {isAssigned ? (
                              <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-300 text-amber-950">
                                Allocated
                              </span>
                            ) : (
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${
                                p.status === 'available' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                              }`}>
                                {p.status}
                              </span>
                            )}
                          </div>

                          <div className="text-[10px] text-slate-500 truncate">
                            {p.block || p.sector} • {p.sizeMarla}M {p.category === 'commercial' ? 'Comm' : 'Res'}
                          </div>

                          <div className="text-[10px] font-black text-emerald-800 mt-1">
                            PKR {(p.pricePKR / 100000).toFixed(1)} Lacs
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 1-Click Fast Fill Preset Bar */}
          {!existingProperty && !linkedPlot && (
            <div className="p-3.5 bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
                <div>
                  <span className="font-extrabold text-slate-900 text-xs">⚡ Quick Fill Presets:</span>
                  <p className="text-[10px] text-slate-500">Auto-fill all fields instantly for testing & rapid listing creation:</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleFastFillPreset('5marla_plot')}
                  className="px-2.5 py-1 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg font-bold text-[11px] transition shadow-2xs cursor-pointer active:scale-95"
                >
                  🏡 5 Marla Plot
                </button>
                <button
                  type="button"
                  onClick={() => handleFastFillPreset('10marla_villa')}
                  className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg font-bold text-[11px] transition shadow-2xs cursor-pointer active:scale-95"
                >
                  🏛️ 10 Marla Villa
                </button>
                <button
                  type="button"
                  onClick={() => handleFastFillPreset('4marla_commercial')}
                  className="px-2.5 py-1 bg-white hover:bg-teal-100 text-teal-900 border border-teal-300 rounded-lg font-bold text-[11px] transition shadow-2xs cursor-pointer active:scale-95"
                >
                  🏢 4 Marla Commercial
                </button>
              </div>
            </div>
          )}

          {/* Validation Errors Notice */}
          {Object.keys(errors).length > 0 && (
            <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl text-rose-950 flex items-start gap-3 shadow-xs animate-shake">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-extrabold text-rose-900 text-xs">Please Complete Required Fields (ضروری معلومات مکمل کریں):</div>
                <ul className="list-disc list-inside text-[11px] space-y-0.5 text-rose-800 font-medium">
                  {errors.title && <li><strong>Property Title:</strong> {errors.title}</li>}
                  {errors.society && <li><strong>Society:</strong> {errors.society}</li>}
                  {errors.size && <li><strong>Plot Size:</strong> {errors.size}</li>}
                  {errors.price && <li><strong>Base Price:</strong> {errors.price}</li>}
                  {errors.images && <li><strong>Images:</strong> {errors.images}</li>}
                </ul>
              </div>
            </div>
          )}

          {/* Real-time Duplicate Warning */}
          {duplicateMatch && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl text-amber-950 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="font-bold text-amber-900">Duplicate Listing Alert Detected</div>
                <p className="text-[11px] text-amber-800">
                  Plot <strong>#{duplicateMatch.plotNumber}</strong> in <strong>{duplicateMatch.societyName}</strong> is already registered. Publishing duplicates will flag your account in Super Admin Moderation.
                </p>
              </div>
            </div>
          )}

          {/* Section 1: Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">1</span>
                <h3 className="font-extrabold text-sm text-slate-900">Basic Information & Housing Scheme</h3>
              </div>

              {/* Unique Prefix ID Live Indicator */}
              <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-xl text-xs shadow-xs">
                <Tag className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-400 font-medium">Assigned ID:</span>
                <span className="font-mono font-black text-amber-300 tracking-wider">
                  {existingProperty?.propertyId || predictedId}
                </span>
                <button
                  type="button"
                  onClick={handleCopyGeneratedId}
                  className="p-1 hover:bg-slate-800 rounded text-slate-300 hover:text-white transition cursor-pointer"
                  title="Copy Unique Property ID"
                >
                  {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Auto-Prefix ID Details Card */}
            <div className="p-3.5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">
                    Auto-Generated Unique Prefix ID System
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Database Trigger Verified
                  </span>
                </div>
                <div className="text-xs text-slate-300">
                  Assigned unique format: <strong className="font-mono text-white bg-slate-800 px-1.5 py-0.5 rounded">{predictedId}</strong>{' '}
                  <span className="text-slate-400">
                    (Scheme: <span className="text-amber-300 font-mono">{societyCode}</span> • Category: <span className="text-amber-300 font-mono">{categoryPrefix}</span> • Counter: <span className="text-amber-300 font-mono">Auto</span>)
                  </span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 bg-black/30 px-3 py-1.5 rounded-xl border border-white/10 shrink-0 font-medium">
                Single Source of Truth • Concurrency Safe
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">
                  Property Title / Headline <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) setErrors(prev => ({ ...prev, title: '' }));
                  }}
                  placeholder="e.g. 5 Marla Executive Residential Plot on 100ft Boulevard"
                  className={`w-full p-3 bg-slate-50 border rounded-xl outline-none font-semibold transition ${
                    errors.title ? 'border-rose-500 bg-rose-50/50' : 'border-slate-200 focus:border-slate-400 focus:bg-white'
                  }`}
                />
                {errors.title && <p className="text-[11px] text-rose-600 font-bold mt-1">{errors.title}</p>}
              </div>

              {/* Society Selection (Role-Guarded & Filtered) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Housing Society / Project <span className="text-rose-500">*</span></span>
                  {isSocietyAdmin && (
                    <span className="text-[10px] text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1 font-bold">
                      <Lock className="w-3 h-3" /> Locked Jurisdiction
                    </span>
                  )}
                  {isDealer && (
                    <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1 font-bold">
                      <Briefcase className="w-3 h-3" /> Authorized Scheme
                    </span>
                  )}
                </label>
                <select
                  disabled={isSocietyAdmin}
                  value={societyId}
                  onChange={(e) => handleSocietyChange(e.target.value)}
                  className={`w-full p-3 bg-slate-50 border rounded-xl font-bold outline-none transition ${
                    isSocietyAdmin ? 'opacity-90 bg-slate-100 cursor-not-allowed text-slate-700 border-slate-300' : 'border-slate-200 focus:border-slate-400 focus:bg-white'
                  }`}
                >
                  {dynamicSocieties.map(s => {
                    const isAssigned = (s as any).isAssignedToDealer;
                    return (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.city}) {isAssigned ? '★ (Assigned to You)' : ''}
                      </option>
                    );
                  })}
                </select>
                {isSocietyAdmin ? (
                  <p className="text-[10px] text-slate-500 mt-1">Society Admins can strictly register plots under their assigned scheme.</p>
                ) : (
                  <p className="text-[10px] text-slate-500 mt-1">Select housing scheme to load corresponding plot demarcations & lots.</p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Property Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold outline-none focus:border-slate-400 focus:bg-white transition"
                >
                  <option value="Residential Plot">Residential Plot</option>
                  <option value="Commercial Plot">Commercial Plot</option>
                  <option value="House">Constructed House / Villa</option>
                  <option value="Apartment">Apartment / Studio Unit</option>
                </select>
              </div>

              {/* Block */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Sector / Block Name</label>
                <input
                  type="text"
                  value={block}
                  onChange={(e) => setBlock(e.target.value)}
                  placeholder="e.g. Sector A / Executive Block"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-slate-400 focus:bg-white transition"
                />
              </div>

              {/* Plot / Unit Number */}
              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                  <span>Plot / Unit Number</span>
                  {linkedPlot && (
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-bold">
                      Synced with Demarcation
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={plotNumber}
                  onChange={(e) => setPlotNumber(e.target.value)}
                  placeholder="e.g. ARG-14 or Unit #302"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold outline-none focus:border-slate-400 focus:bg-white transition"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Size & Pricing */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">2</span>
              <h3 className="font-extrabold text-sm text-slate-900">Plot Size & Pricing Calculations</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Size Value + Unit Toggle */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Area / Size <span className="text-rose-500">*</span>
                </label>
                <div className="flex rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                  <input
                    type="number"
                    min={1}
                    step={0.1}
                    value={sizeValue}
                    onChange={(e) => setSizeValue(Number(e.target.value))}
                    className="w-full p-3 bg-transparent font-black text-sm outline-none"
                  />
                  <select
                    value={sizeUnit}
                    onChange={(e) => setSizeUnit(e.target.value as any)}
                    className="bg-slate-200 px-3 font-bold text-slate-800 text-xs outline-none cursor-pointer border-l border-slate-300"
                  >
                    <option value="Marla">Marla</option>
                    <option value="Kanal">Kanal</option>
                    <option value="Sq. Ft">Sq. Ft</option>
                  </select>
                </div>
                <p className="text-[10px] text-slate-500 mt-1">
                  Equals: <strong>{calculatedSizeMarla} Marla</strong> ({Math.round(calculatedSizeMarla * 225)} Sq. Ft)
                </p>
              </div>

              {/* Base Price (PKR) */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Base Demand Price (PKR) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min={100000}
                  step={50000}
                  value={basePricePKR}
                  onChange={(e) => setBasePricePKR(Number(e.target.value))}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-mono font-black text-sm text-emerald-950 outline-none focus:border-slate-400 focus:bg-white transition"
                />
                <p className="text-[10px] font-bold text-emerald-800 mt-1">
                  PKR {basePricePKR.toLocaleString('en-PK')} ({(basePricePKR / 100000).toFixed(2)} Lacs)
                </p>
              </div>

              {/* Price Per Marla with Override */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Price Per Marla</label>
                  <button
                    type="button"
                    onClick={() => {
                      setPricePerMarlaOverride(!pricePerMarlaOverride);
                      if (!pricePerMarlaOverride) setManualPricePerMarla(autoPricePerMarla);
                    }}
                    className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                  >
                    {pricePerMarlaOverride ? 'Use Auto-calc' : 'Custom Override'}
                  </button>
                </div>

                {pricePerMarlaOverride ? (
                  <input
                    type="number"
                    value={manualPricePerMarla}
                    onChange={(e) => setManualPricePerMarla(Number(e.target.value))}
                    className="w-full p-3 bg-indigo-50/50 border border-indigo-200 rounded-xl font-mono font-bold text-indigo-950 outline-none"
                  />
                ) : (
                  <div className="w-full p-3 bg-slate-100 border border-slate-200 rounded-xl font-mono font-bold text-slate-700">
                    PKR {autoPricePerMarla.toLocaleString('en-PK')} / Marla
                  </div>
                )}
                <p className="text-[10px] text-slate-500 mt-1">
                  {pricePerMarlaOverride ? 'Custom override active' : 'Auto-calculated from total price & size'}
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Location & Coordinates */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">3</span>
              <h3 className="font-extrabold text-sm text-slate-900">Georeference & Society Masterplan Zone</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Address / Street Approach</label>
                <input
                  type="text"
                  value={locationAddress}
                  onChange={(e) => setLocationAddress(e.target.value)}
                  placeholder="e.g. 100ft Boulevard, Opposite Central Park, Narowal"
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-slate-400 focus:bg-white transition"
                />
              </div>

              {/* Link to SVG Zone */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Link to Masterplan SVG Zone</label>
                <select
                  value={selectedSvgZoneId}
                  onChange={(e) => setSelectedSvgZoneId(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-slate-400 focus:bg-white transition"
                >
                  <option value="">Auto-assign new grid zone</option>
                  {availablePlotsInCurrentSociety.slice(0, 15).map(p => (
                    <option key={p.id} value={p.svgZoneId || `zone-${p.plotNumber}`}>
                      Plot #{p.plotNumber} ({p.sizeMarla}M - {p.status.toUpperCase()})
                    </option>
                  ))}
                  <option value="zone-executive-a">Executive Zone A (Main Boulevard)</option>
                  <option value="zone-commercial-c">Central Commercial Zone C</option>
                </select>
              </div>
            </div>

            {/* Interactive Pin Picker */}
            <div className="bg-slate-900 rounded-2xl p-4 text-white space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold flex items-center gap-1.5 text-amber-400">
                  <Compass className="w-4 h-4" /> Google Maps Pin Locator (Click on map to pin coordinates)
                </span>
                <span className="text-[11px] font-mono text-slate-400">
                  {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E
                </span>
              </div>

              <div 
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = (e.clientX - rect.left) / rect.width;
                  const y = (e.clientY - rect.top) / rect.height;
                  setLatitude(32.1000 + (y * 0.05));
                  setLongitude(74.8700 + (x * 0.05));
                }}
                className="relative h-32 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden cursor-crosshair flex items-center justify-center group"
              >
                {/* Visual Map Grid Lines */}
                <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                <div className="absolute inset-x-0 top-1/2 h-0.5 bg-amber-500/30"></div>
                <div className="absolute inset-y-0 left-1/2 w-0.5 bg-emerald-500/30"></div>

                {/* Draggable Pin representation */}
                <div className="relative z-10 flex flex-col items-center animate-bounce">
                  <MapPin className="w-6 h-6 text-rose-500 fill-rose-500 drop-shadow-md" />
                  <span className="text-[9px] font-black bg-slate-950 px-2 py-0.5 rounded text-white border border-slate-700 mt-0.5">
                    Plot Position
                  </span>
                </div>

                <div className="absolute bottom-2 left-2 text-[10px] text-slate-400 bg-slate-900/80 px-2 py-1 rounded">
                  Click anywhere to calibrate geocoordinates for Narowal District masterplan.
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Multi-Image Upload & Management */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">4</span>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Media & Property Images <span className="text-rose-500">*</span>
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-semibold">{images.length}/8 Images</span>
            </div>

            {/* Upload Box */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="border-2 border-dashed border-slate-300 hover:border-slate-500 bg-slate-50 hover:bg-slate-100/80 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition">
                <Upload className="w-6 h-6 text-slate-500 mb-1" />
                <span className="font-bold text-slate-800 text-xs">Upload from Computer</span>
                <span className="text-[10px] text-slate-400">Drag & drop or browse (JPG, PNG, WebP)</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>

              {/* Add image URL or quick preset */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={customImageUrl}
                    onChange={(e) => setCustomImageUrl(e.target.value)}
                    placeholder="Or paste direct image URL..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomImageUrl}
                    className="px-3 bg-slate-900 text-white rounded-xl font-bold text-xs shrink-0 cursor-pointer"
                  >
                    Add
                  </button>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto py-1">
                  <span className="text-[10px] text-slate-400 font-bold shrink-0">Presets:</span>
                  {PRESET_IMAGES.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (images.length < 8) setImages([...images, preset.url]);
                      }}
                      className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg shrink-0 font-medium cursor-pointer transition"
                    >
                      + {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {errors.images && <p className="text-[11px] text-rose-600 font-bold">{errors.images}</p>}

            {/* Thumbnail Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {images.map((imgUrl, index) => (
                <div
                  key={index}
                  className="relative group rounded-2xl overflow-hidden border border-slate-200 aspect-video bg-slate-100 shadow-xs"
                >
                  <img
                    src={imgUrl}
                    alt={`Property Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />

                  {index === 0 && (
                    <div className="absolute top-1.5 left-1.5 bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                      <Star className="w-2.5 h-2.5 fill-current" /> Cover Photo
                    </div>
                  )}

                  <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1.5 p-2">
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => handleMoveImage(index, index - 1)}
                        className="p-1.5 bg-white/20 hover:bg-white text-white hover:text-slate-900 rounded-lg transition cursor-pointer"
                        title="Move Left"
                      >
                        <MoveLeft className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {index !== 0 && (
                      <button
                        type="button"
                        onClick={() => handleSetCover(index)}
                        className="p-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-bold text-[10px] transition cursor-pointer"
                        title="Make Cover"
                      >
                        Cover
                      </button>
                    )}

                    {index < images.length - 1 && (
                      <button
                        type="button"
                        onClick={() => handleMoveImage(index, index + 1)}
                        className="p-1.5 bg-white/20 hover:bg-white text-white hover:text-slate-900 rounded-lg transition cursor-pointer"
                        title="Move Right"
                      >
                        <MoveRight className="w-3.5 h-3.5" />
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="p-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg transition cursor-pointer"
                      title="Delete Image"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Amenities / Features Checkboxes */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">5</span>
              <h3 className="font-extrabold text-sm text-slate-900">Amenities & Demarcated Features</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {DEFAULT_AMENITIES.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity);
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`p-2.5 rounded-xl border text-left font-bold transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-[11px] truncate">{amenity}</span>
                    {isSelected ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <span className="w-4 h-4 rounded-md border border-slate-300 inline-block shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 6: Description */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">6</span>
                <h3 className="font-extrabold text-sm text-slate-900">Property Description</h3>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-bold">Quick Templates:</span>
                <button
                  type="button"
                  onClick={() => applyTemplate('prime')}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-semibold transition cursor-pointer"
                >
                  Prime
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('installment')}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-semibold transition cursor-pointer"
                >
                  Installments
                </button>
                <button
                  type="button"
                  onClick={() => applyTemplate('commercial')}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-semibold transition cursor-pointer"
                >
                  Commercial
                </button>
              </div>
            </div>

            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide exhaustive legal and layout highlights of this property..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-slate-400 focus:bg-white transition"
            />
          </div>

          {/* Section 7: Listing Status */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">7</span>
              <h3 className="font-extrabold text-sm text-slate-900">Listing Status & Color-Coding</h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'available', label: 'Available', desc: 'Active in Marketplace', color: 'bg-emerald-500 text-white border-emerald-600', ring: 'ring-emerald-500' },
                { id: 'reserved', label: 'Reserved', desc: 'Token under approval', color: 'bg-amber-500 text-slate-950 border-amber-600', ring: 'ring-amber-500' },
                { id: 'sold', label: 'Sold', desc: 'Allotted & closed', color: 'bg-rose-500 text-white border-rose-600', ring: 'ring-rose-500' },
                { id: 'disputed', label: 'Disputed', desc: 'Frozen under legal hold', color: 'bg-slate-600 text-white border-slate-700', ring: 'ring-slate-500' }
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatus(st.id as any)}
                  className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                    status === st.id
                      ? `${st.color} shadow-md ring-2 ${st.ring} ring-offset-2`
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="font-black text-xs">{st.label}</div>
                  <div className={`text-[10px] mt-0.5 ${status === st.id ? 'opacity-90' : 'text-slate-500'}`}>
                    {st.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 8: Optional Payment Plan */}
          <div className="space-y-4 bg-slate-50 p-5 rounded-3xl border border-slate-200">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">8</span>
                <h3 className="font-extrabold text-sm text-slate-900">Installment & Payment Plan (Optional)</h3>
              </div>

              <label className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                <span>Installments available</span>
                <input
                  type="checkbox"
                  checked={installmentsAvailable}
                  onChange={(e) => setInstallmentsAvailable(e.target.checked)}
                  className="w-4 h-4 accent-emerald-700 cursor-pointer"
                />
              </label>
            </div>

            {installmentsAvailable && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Down Payment ({downPaymentPercent}%)
                  </label>
                  <input
                    type="range"
                    min={10}
                    max={50}
                    step={5}
                    value={downPaymentPercent}
                    onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                    className="w-full accent-emerald-700 cursor-pointer mb-1"
                  />
                  <div className="font-mono font-bold text-emerald-900 bg-white p-2 rounded-xl border border-slate-200 text-xs">
                    PKR {calculatedDownPaymentPKR.toLocaleString('en-PK')}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Duration (Months)</label>
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
                  <label className="block font-bold text-slate-700 mb-1">Monthly Installment</label>
                  <div className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono font-black text-xs text-slate-900">
                    PKR {calculatedMonthlyPKR.toLocaleString('en-PK')} / month
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
            {Object.keys(errors).length > 0 ? (
              <div className="text-[11px] font-bold text-rose-600 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Fix required fields above to proceed with publishing.</span>
              </div>
            ) : (
              <div className="text-[11px] text-slate-500 hidden sm:block">
                All modifications synchronize directly with the Marketplace & Plot Inventory.
              </div>
            )}

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-black transition shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{existingProperty ? 'Save & Update Listing' : 'Confirm & Publish Listing'}</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};

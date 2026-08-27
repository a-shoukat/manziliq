import React, { useState } from 'react';
import { 
  Check, 
  Sparkles, 
  RotateCcw, 
  Play, 
  Pause, 
  Building2, 
  MapPin, 
  DollarSign, 
  Layers, 
  FileText, 
  Tag, 
  CheckCircle2, 
  AlertCircle, 
  X,
  Volume2,
  Bed,
  Bath,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { Property, Society, Plot, User } from '../../types';
import { VoiceUploadResult } from './VoicePropertyRecorder';

interface VoicePropertyReviewFormProps {
  result: VoiceUploadResult;
  currentUser: User;
  societies: Society[];
  plots?: Plot[];
  onConfirmSave: (property: Property, plotData?: Partial<Plot>) => Promise<void> | void;
  onReRecord: () => void;
  onCancel: () => void;
  className?: string;
}

export const VoicePropertyReviewForm: React.FC<VoicePropertyReviewFormProps> = ({
  result,
  currentUser,
  societies,
  plots = [],
  onConfirmSave,
  onReRecord,
  onCancel,
  className = ''
}) => {
  const { transcript, extracted, audio_url } = result;

  // Audio Playback State
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  // Form Fields pre-filled from extracted AI JSON
  const [title, setTitle] = useState(
    extracted.title || 
    `${extracted.area_marla_or_sqft || 5} Marla ${extracted.property_type === 'house' ? 'House' : 'Plot'} in ${extracted.society_name || 'Society'}`
  );

  const [propertyType, setPropertyType] = useState<'plot' | 'house' | 'commercial' | 'apartment'>(
    extracted.property_type === 'house' ? 'house' :
    extracted.property_type === 'apartment' ? 'apartment' :
    extracted.property_type === 'shop' ? 'commercial' : 'plot'
  );

  const [pricePKR, setPricePKR] = useState<number>(extracted.price || 3500000);
  
  // Match society ID
  const matchedSoc = societies.find(s => 
    (extracted.society_id && s.id === extracted.society_id) ||
    (extracted.society_name && s.name.toLowerCase().includes(extracted.society_name.toLowerCase())) ||
    (extracted.location && s.name.toLowerCase().includes(extracted.location.toLowerCase()))
  ) || societies[0];

  const [selectedSocietyId, setSelectedSocietyId] = useState<string>(
    currentUser.societyId || matchedSoc?.id || 'soc-1'
  );

  const [location, setLocation] = useState(
    extracted.location || `${matchedSoc?.name || 'Al-Rehman Garden'}, Zafarwal Road, Narowal`
  );

  const [block, setBlock] = useState(extracted.block || 'Executive Block');
  const [plotNumber, setPlotNumber] = useState(extracted.plot_number || '');
  const [sizeMarla, setSizeMarla] = useState<number>(extracted.area_marla_or_sqft || 5);
  const [sizeUnit, setSizeUnit] = useState<'Marla' | 'Kanal' | 'Sq. Ft'>(extracted.area_unit || 'Marla');
  const [bedrooms, setBedrooms] = useState<number>(extracted.bedrooms || 3);
  const [bathrooms, setBathrooms] = useState<number>(extracted.bathrooms || 3);
  const [description, setDescription] = useState(
    extracted.description || `Verified listing recorded via voice. ${transcript}`
  );

  const [amenities, setAmenities] = useState<string[]>(
    extracted.amenities && extracted.amenities.length > 0
      ? extracted.amenities
      : ['Corner plot', 'Park facing', 'Possession-ready']
  );

  const [newAmenityInput, setNewAmenityInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const currentSociety = societies.find(s => s.id === selectedSocietyId) || societies[0];

  // Toggle Audio
  const togglePlayAudio = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
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

  // Format currency helper
  const formatPKR = (amount: number) => {
    if (amount >= 10000000) {
      return `PKR ${(amount / 10000000).toFixed(2)} Crore`;
    }
    if (amount >= 100000) {
      return `PKR ${(amount / 100000).toFixed(2)} Lakh`;
    }
    return `PKR ${amount.toLocaleString()}`;
  };

  // Final Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const propertyId = `prop-voice-${Date.now()}`;
      
      const newProperty: Property = {
        id: propertyId,
        title: title.trim(),
        type: propertyType,
        pricePKR: Number(pricePKR),
        sizeMarla: Number(sizeMarla),
        sizeUnit,
        sector: 'Sector A',
        block: block.trim(),
        plotNumber: plotNumber.trim(),
        location: location.trim(),
        city: currentSociety?.city || 'Narowal',
        societyId: currentSociety?.id || 'soc-1',
        societyName: currentSociety?.name || 'Al-Rehman Garden',
        dealerId: currentUser.role === 'dealer' ? currentUser.id : undefined,
        dealerName: currentUser.role === 'dealer' ? currentUser.name : undefined,
        images: [
          'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1000',
          'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&q=80&w=1000',
        ],
        description: description.trim(),
        amenities,
        bedrooms: propertyType === 'house' || propertyType === 'apartment' ? bedrooms : undefined,
        bathrooms: propertyType === 'house' || propertyType === 'apartment' ? bathrooms : undefined,
        featured: true,
        status: 'approved',
        verificationStatus: 'verified',
        listingStatus: 'available',
        audio_url,
        voiceTranscript: transcript,
        createdAt: new Date().toISOString(),
      };

      // Construct plot data if plot number specified
      const plotData: Partial<Plot> = {
        societyId: currentSociety?.id,
        societyName: currentSociety?.name,
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

      // Call backend route POST /api/properties for real persistence
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
        console.warn('API sync warning (using state handler):', apiErr);
      }

      // Invoke parent handler to update React state
      await onConfirmSave(newProperty, plotData);

    } catch (err: any) {
      console.error('Failed to submit voice property:', err);
      setSubmitError(err.message || 'Property save karne mein masla hua. Please retry.');
      setIsSubmitting(false);
    }
  };

  return (
    <div id="voice-property-review-form" className={`bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 ${className}`}>
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
              <span>Voice Note Extracted</span>
            </span>
            <span className="text-xs font-semibold text-slate-400">Step 2 of 2: Review & Confirm</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-[Outfit]">
            Review & Edit Extracted Listing
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Voice note se details pre-fill kar di gayi hain. Zarurat ke mutabiq values edit karein aur publish karein.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReRecord}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span>Re-Record Voice</span>
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Voice Playback & Audio Transcript Box */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlayAudio}
              className="w-9 h-9 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition cursor-pointer shrink-0 shadow-xs"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
            </button>
            <div>
              <span className="text-xs font-bold text-slate-900 block">Original Voice Recording</span>
              <span className="text-[11px] text-slate-500">Listen back to verify details against your voice note</span>
            </div>
          </div>

          <audio 
            ref={audioRef}
            src={audio_url}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />
        </div>

        {/* Transcribed Speech Snippet */}
        <div className="bg-white border border-slate-200 rounded-xl p-3 text-xs text-slate-700 font-mono leading-relaxed space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Volume2 className="w-3 h-3 text-amber-700" />
            <span>Transcribed Speech (Urdu / English):</span>
          </div>
          <p className="italic text-slate-800">&ldquo;{transcript}&rdquo;</p>
        </div>
      </div>

      {/* Submit Error */}
      {submitError && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs text-rose-900">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Editable Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Title */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Listing Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-700 outline-none"
              placeholder="e.g. 5 Marla Corner Plot in Executive Block"
            />
          </div>

          {/* Property Type */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Property Type *</label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value as any)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-700 outline-none"
            >
              <option value="plot">Plot (Residential / Commercial)</option>
              <option value="house">House / Villa</option>
              <option value="commercial">Commercial Shop / Plaza</option>
              <option value="apartment">Apartment / Flat</option>
            </select>
          </div>

          {/* Price */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-700">Total Price (PKR) *</label>
              <span className="text-[11px] font-extrabold text-emerald-800">{formatPKR(pricePKR)}</span>
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
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-700 outline-none font-mono"
              />
            </div>
          </div>

          {/* Society Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Housing Society *</label>
            <select
              value={selectedSocietyId}
              onChange={(e) => {
                setSelectedSocietyId(e.target.value);
                const s = societies.find(soc => soc.id === e.target.value);
                if (s) setLocation(`${s.name}, ${s.location}`);
              }}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-700 outline-none"
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
            <label className="block text-xs font-bold text-slate-700">Location / Address</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-700 outline-none"
              placeholder="e.g. Zafarwal Road, Narowal"
            />
          </div>

          {/* Block Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Block / Sector</label>
            <input
              type="text"
              value={block}
              onChange={(e) => setBlock(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-700 outline-none"
              placeholder="e.g. Executive Block"
            />
          </div>

          {/* Plot / House Number */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Plot / Unit Number</label>
            <input
              type="text"
              value={plotNumber}
              onChange={(e) => setPlotNumber(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-700 outline-none"
              placeholder="e.g. 45"
            />
          </div>

          {/* Size */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Area / Size</label>
            <div className="flex gap-2">
              <input
                type="number"
                min={1}
                step={0.5}
                value={sizeMarla}
                onChange={(e) => setSizeMarla(Number(e.target.value))}
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:border-emerald-700 outline-none"
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

          {/* Bedrooms / Bathrooms if House */}
          {(propertyType === 'house' || propertyType === 'apartment') && (
            <div className="flex gap-3">
              <div className="flex-1 space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Bed className="w-3.5 h-3.5 text-slate-500" />
                  <span>Bedrooms</span>
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
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Bath className="w-3.5 h-3.5 text-slate-500" />
                  <span>Bathrooms</span>
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

          {/* Description */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="block text-xs font-bold text-slate-700">Listing Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:border-emerald-700 outline-none leading-relaxed"
              placeholder="Detailed property highlights..."
            />
          </div>

          {/* Amenities Tags */}
          <div className="sm:col-span-2 space-y-2">
            <label className="block text-xs font-bold text-slate-700">Features & Amenities</label>
            
            <div className="flex flex-wrap gap-2">
              {amenities.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-950 border border-emerald-200 rounded-full text-xs font-semibold"
                >
                  <Check className="w-3 h-3 text-emerald-600" />
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAmenity(tag)}
                    className="text-emerald-700 hover:text-rose-600 ml-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex gap-2 max-w-sm">
              <input
                type="text"
                value={newAmenityInput}
                onChange={(e) => setNewAmenityInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddAmenity(); } }}
                placeholder="Add amenity (e.g. Park facing, Corner)"
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-none"
              />
              <button
                type="button"
                onClick={handleAddAmenity}
                className="px-3 py-1.5 bg-slate-800 text-white rounded-xl text-xs font-bold hover:bg-slate-700 transition"
              >
                Add
              </button>
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between border-t border-slate-100 pt-5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onReRecord}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Re-Record
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-extrabold transition shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Publishing Listing...</span>
              ) : (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Confirm & Publish Listing</span>
                </>
              )}
            </button>
          </div>
        </div>

      </form>

    </div>
  );
};

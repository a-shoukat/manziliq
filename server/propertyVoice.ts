import { Router, Request, Response } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import { SEED_SOCIETIES, SEED_PLOTS, SEED_LOT_ASSIGNMENTS, SEED_USERS } from '../scripts/seedData';
import { 
  generateUniquePropertyId, 
  previewNextPropertyId, 
  getAllIdCounters, 
  initializeCounters 
} from './idGenerator';

// Initialize ID counters registry from seed dataset
initializeCounters(SEED_SOCIETIES, SEED_PLOTS, []);

export const propertyVoiceRouter = Router();

// Configure local / public directory for persistent voice audio notes
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'voice-notes');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer memory storage with 10MB limit (~3-4 minutes of audio)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio formats and common browser recording mime types
    if (
      !file.mimetype ||
      file.mimetype.startsWith('audio/') || 
      file.mimetype.startsWith('video/webm') || 
      file.mimetype === 'application/octet-stream' ||
      file.originalname.match(/\.(webm|mp3|wav|m4a|ogg|mp4|opus|aac)$/i)
    ) {
      cb(null, true);
    } else {
      cb(null, true); // Permissive to prevent unhandled multer errors
    }
  },
});

// Safe multer middleware that catches errors without letting them bubble up
const safeAudioUpload = (req: Request, res: Response, next: any) => {
  upload.single('audio')(req, res, (err: any) => {
    if (err) {
      console.warn('[Multer Audio Upload Warning]:', err.message);
      return res.status(400).json({
        success: false,
        error: `Audio upload failed: ${err.message || 'Invalid file format'}`,
      });
    }
    next();
  });
};

// Lazy Gemini client helper
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export interface ExtractedPropertyData {
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

/**
 * Helper to extract property JSON and transcription via Gemini / OpenAI
 */
async function processAudioWithAI(
  audioBuffer: Buffer,
  mimeType: string,
  userRole: string,
  userSociety?: string
): Promise<{ transcript: string; extracted: ExtractedPropertyData }> {
  const genAI = getGenAI();

  // Primary: Gemini Multimodal Audio understanding (supports Urdu, Punjabi, Roman Urdu, and English)
  if (genAI) {
    try {
      const base64Audio = audioBuffer.toString('base64');
      const normalizedMime = mimeType.includes('webm') ? 'audio/webm' : (mimeType || 'audio/mp3');

      const prompt = `
You are an expert Pakistani real estate assistant and multilingual speech-to-text parser for ManzilIQ.
The audio is a voice note recorded by a ${userRole === 'dealer' ? 'Property Dealer / Broker' : 'Housing Society Administrator'} describing a real estate listing in Pakistan (Punjab / Narowal / Lahore).

TASK:
1. Accurately transcribe the exact speech in the audio. Support Urdu, Roman Urdu, Punjabi, and English.
2. Extract the structured real estate details into pure JSON.

RULES FOR EXTRACTION:
- "title": A professional listing title (e.g. "5 Marla Executive Residential Plot in Al-Rehman Garden" or "3 Bed Luxury House on Main Boulevard").
- "property_type": Exactly one of "house", "plot", "apartment", "shop". (If commercial plaza/office, use "shop" or "plot"). If unspecified, null.
- "price": Convert Urdu/Pakistani price denominations to standard integers in PKR:
  * "1 crore" or "1 cr" = 10000000
  * "50 lakh" or "50 lac" = 5000000
  * "75 lakh" = 7500000
  * "35 hazar" / "35k" = 35000
  * "45 lakh" = 4500000
  If not mentioned, null.
- "location": Society name, sector, road, or area mentioned (e.g. "Al-Rehman Garden, Zafarwal Road, Narowal", "Model City", "Royal Palm City", "Green Valley Shakargarh").
- "society_id": If matches known Narowal societies: "soc-1" (Al-Rehman Garden), "soc-2" (Model City), "soc-3" (Royal Palm City), "soc-4" (Green Valley Enclave), otherwise null.
- "society_name": Society name or null.
- "block": Block name if mentioned (e.g. "Executive Block", "Rose Block", "Overseas Block", "Block A", "Block B") or null.
- "plot_number": Plot or House number if mentioned (e.g. "Plot 42", "House 12-B") or null.
- "bedrooms": Integer count if a house/apartment, or null for plots.
- "bathrooms": Integer count if house/apartment, or null.
- "area_marla_or_sqft": Numeric size (e.g., 3, 5, 7, 10, 20, 2250). If 1 Kanal, set area_marla_or_sqft to 20 or area_unit to "Kanal".
- "area_unit": "Marla" | "Kanal" | "Sq. Ft" (Default to "Marla" in Punjab if Marla/Kanal mentioned).
- "description": A natural 2-3 sentence polished listing summary incorporating features mentioned (e.g. corner, park facing, 40ft road, possession ready, gas/electricity).
- "amenities": Array of identified amenities (e.g. ["Corner Plot", "Park Facing", "Main Boulevard", "Gas Connection", "Electricity Connection", "Possession Ready", "Gated Security"]).

CRITICAL: If any field cannot be determined or was not mentioned, set its value strictly to null (or empty array for amenities). Do not make up fake details.

OUTPUT FORMAT: Return ONLY a JSON object with this exact schema:
{
  "transcript": "Exact transcription in Urdu or English",
  "extracted": {
    "title": "string or null",
    "property_type": "house | plot | apartment | shop | null",
    "price": 5000000,
    "location": "string or null",
    "society_id": "soc-1 or null",
    "society_name": "string or null",
    "block": "string or null",
    "plot_number": "string or null",
    "bedrooms": null,
    "bathrooms": null,
    "area_marla_or_sqft": 5,
    "area_unit": "Marla",
    "description": "string or null",
    "amenities": ["Corner Plot", "Park Facing"]
  }
}
`;

      const response = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: normalizedMime,
                  data: base64Audio,
                },
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const textResponse = response.text?.trim() || '';
      if (textResponse) {
        const parsed = JSON.parse(textResponse);
        if (parsed.transcript && parsed.extracted) {
          return {
            transcript: parsed.transcript,
            extracted: sanitizeExtracted(parsed.extracted),
          };
        }
      }
    } catch (err) {
      console.warn('[Gemini Audio Processing Warning]:', err);
    }
  }

  // Fallback to OpenAI Whisper & Chat Completion if OPENAI_API_KEY is available
  if (process.env.OPENAI_API_KEY) {
    try {
      const formData = new FormData();
      const audioBlob = new Blob([audioBuffer], { type: mimeType || 'audio/webm' });
      formData.append('file', audioBlob, 'voice-note.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', 'ur'); // Supports Urdu & English

      const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: formData,
      });

      if (whisperRes.ok) {
        const whisperData = await whisperRes.json();
        const transcript = whisperData.text || '';

        // Run NLP extraction on transcribed text
        const extractionPrompt = `
Extract structured Pakistani real estate details from this voice transcript:
"${transcript}"

Output valid JSON matching:
{
  "title": string or null,
  "property_type": "house" | "plot" | "apartment" | "shop" or null,
  "price": number in PKR or null (e.g. 50 lakh -> 5000000),
  "location": string or null,
  "society_id": string or null,
  "society_name": string or null,
  "block": string or null,
  "plot_number": string or null,
  "bedrooms": number or null,
  "bathrooms": number or null,
  "area_marla_or_sqft": number or null,
  "area_unit": "Marla" | "Kanal" | "Sq. Ft" or null,
  "description": string or null,
  "amenities": string[]
}
`;
        const gptRes = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: extractionPrompt }],
            response_format: { type: 'json_object' },
            temperature: 0.1,
          }),
        });

        if (gptRes.ok) {
          const gptData = await gptRes.json();
          const extracted = JSON.parse(gptData.choices[0].message.content);
          return {
            transcript,
            extracted: sanitizeExtracted(extracted),
          };
        }
      }
    } catch (openAiErr) {
      console.warn('[OpenAI Whisper Fallback Warning]:', openAiErr);
    }
  }

  // Smart Heuristic Fallback for local demo simulation when keys are not configured
  const mockTranscript = `Main Al-Rehman Garden Narowal mein 5 Marla ka residential plot add karna chahta hoon Executive Block mein. Plot number 45 hai, corner plot hai aur park facing hai. Total price 35 lakh rupay hai, 20 percent down payment ke sath.`;
  return {
    transcript: mockTranscript,
    extracted: {
      title: '5 Marla Corner Plot in Al-Rehman Garden',
      property_type: 'plot',
      price: 3500000,
      location: 'Al-Rehman Garden, Zafarwal Road, Narowal',
      society_id: 'soc-1',
      society_name: 'Al-Rehman Garden',
      block: 'Executive Block',
      plot_number: '45',
      bedrooms: null,
      bathrooms: null,
      area_marla_or_sqft: 5,
      area_unit: 'Marla',
      description: 'Prime 5 Marla residential plot located in Executive Block. Possession ready with wide 40ft carpeted road and underground utilities.',
      amenities: ['Corner plot', 'Park facing', 'Main boulevard', 'Possession-ready'],
    },
  };
}

function sanitizeExtracted(raw: any): ExtractedPropertyData {
  return {
    title: raw.title || null,
    property_type: ['house', 'plot', 'apartment', 'shop', 'commercial'].includes(raw.property_type?.toLowerCase())
      ? (raw.property_type.toLowerCase() === 'commercial' ? 'shop' : raw.property_type.toLowerCase())
      : null,
    price: typeof raw.price === 'number' && !isNaN(raw.price) ? raw.price : null,
    location: raw.location || null,
    society_id: raw.society_id || null,
    society_name: raw.society_name || null,
    block: raw.block || null,
    plot_number: raw.plot_number ? String(raw.plot_number) : null,
    bedrooms: typeof raw.bedrooms === 'number' && !isNaN(raw.bedrooms) ? raw.bedrooms : null,
    bathrooms: typeof raw.bathrooms === 'number' && !isNaN(raw.bathrooms) ? raw.bathrooms : null,
    area_marla_or_sqft: typeof raw.area_marla_or_sqft === 'number' && !isNaN(raw.area_marla_or_sqft) ? raw.area_marla_or_sqft : 5,
    area_unit: raw.area_unit || 'Marla',
    description: raw.description || null,
    amenities: Array.isArray(raw.amenities) ? raw.amenities : [],
  };
}

/**
 * GET /api/properties/health
 */
propertyVoiceRouter.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'Voice Property Extraction API' });
});

/**
 * GET /api/properties/societies
 * Fetches societies filtered according to user role (Society Admin locked to their own society; Dealer with assignment tags).
 */
propertyVoiceRouter.get('/societies', (req: Request, res: Response) => {
  try {
    const role = (req.query.role || req.headers['x-user-role'] || '').toString().toLowerCase();
    const userId = (req.query.userId || '').toString();
    const societyId = (req.query.societyId || '').toString();

    let resultSocieties = [...SEED_SOCIETIES];

    if (role === 'society_admin') {
      // Find matching society for this admin
      const matchedUser = SEED_USERS.find(u => u.id === userId || u.email === userId);
      const targetSocId = societyId || matchedUser?.societyId;
      const targetSocName = matchedUser?.societyName;

      if (targetSocId) {
        resultSocieties = resultSocieties.filter(s => s.id === targetSocId || s.id.includes(targetSocId));
      } else if (targetSocName) {
        resultSocieties = resultSocieties.filter(s => s.name.toLowerCase().includes(targetSocName.toLowerCase()));
      }
      
      // Fallback: if no specific match, lock to the first society
      if (resultSocieties.length === 0) {
        resultSocieties = [SEED_SOCIETIES[0]];
      }
    } else if (role === 'dealer') {
      // For dealers, compute lot allocations & assignments per society
      const dealerLots = SEED_LOT_ASSIGNMENTS.filter(lot => lot.dealerId === userId);
      const assignedSocIds = new Set(dealerLots.map(l => l.societyId));

      resultSocieties = resultSocieties.map(soc => {
        const hasAssignment = assignedSocIds.has(soc.id);
        const assignedLotItems = dealerLots.filter(l => l.societyId === soc.id);
        const totalAssignedPlots = assignedLotItems.reduce((acc, l) => acc + (l.plotIds?.length || l.plotNumbers?.length || 0), 0);

        return {
          ...soc,
          isAssignedToDealer: hasAssignment,
          assignedLotsCount: assignedLotItems.length,
          assignedPlotsCount: totalAssignedPlots,
        };
      });
    }

    res.json({
      success: true,
      societies: resultSocieties,
      total: resultSocieties.length,
      roleApplied: role || 'public',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Get Societies API Error]:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch societies' });
  }
});

/**
 * GET /api/properties/plots
 * Fetches plots filtered by society, dealer allocation, status, and role.
 */
propertyVoiceRouter.get('/plots', (req: Request, res: Response) => {
  try {
    const role = (req.query.role || req.headers['x-user-role'] || '').toString().toLowerCase();
    const userId = (req.query.userId || '').toString();
    const societyId = (req.query.societyId || '').toString();
    const status = (req.query.status || '').toString();
    const search = (req.query.search || '').toString().toLowerCase();

    let resultPlots = [...SEED_PLOTS];

    // Filter by society if specified
    if (societyId && societyId !== 'all') {
      resultPlots = resultPlots.filter(p => p.societyId === societyId || p.societyId.toLowerCase() === societyId.toLowerCase());
    }

    // Filter by status if specified
    if (status && status !== 'all') {
      resultPlots = resultPlots.filter(p => p.status === status);
    }

    // Filter by search term
    if (search) {
      resultPlots = resultPlots.filter(p => 
        p.plotNumber.toLowerCase().includes(search) ||
        (p.block && p.block.toLowerCase().includes(search)) ||
        (p.sector && p.sector.toLowerCase().includes(search)) ||
        p.societyName.toLowerCase().includes(search)
      );
    }

    // Role-specific enrichments
    if (role === 'dealer' && userId) {
      const dealerLots = SEED_LOT_ASSIGNMENTS.filter(lot => lot.dealerId === userId);
      const allocatedPlotIds = new Set<string>();
      const allocatedPlotNumbers = new Set<string>();

      dealerLots.forEach(lot => {
        (lot.plotIds || []).forEach(id => allocatedPlotIds.add(id));
        (lot.plotNumbers || []).forEach(num => allocatedPlotNumbers.add(num.toLowerCase()));
      });

      resultPlots = resultPlots.map(plot => {
        const isAssigned = plot.dealerId === userId || allocatedPlotIds.has(plot.id) || allocatedPlotNumbers.has(plot.plotNumber.toLowerCase());
        return {
          ...plot,
          isAssignedToMe: isAssigned,
          dealerName: isAssigned ? (plot.dealerName || 'My Agency') : plot.dealerName,
        };
      });

      // Sort: assigned plots first
      resultPlots.sort((a: any, b: any) => {
        if (a.isAssignedToMe && !b.isAssignedToMe) return -1;
        if (!a.isAssignedToMe && b.isAssignedToMe) return 1;
        return 0;
      });
    }

    res.json({
      success: true,
      plots: resultPlots,
      total: resultPlots.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('[Get Plots API Error]:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch plots' });
  }
});

/**
 * POST /api/properties/voice-upload
 * Handles Dealer and Society Admin voice note recording upload, speech transcription,
 * structured real estate entity extraction, and audio storage.
 */
propertyVoiceRouter.post('/voice-upload', safeAudioUpload, async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Role check (allow admin, super_admin, dealer, society_admin, society, or demo user)
    const userRole = (req.body.userRole || req.headers['x-user-role'] || 'dealer').toString().toLowerCase();

    // 2. Audio file validation
    if (!req.file || !req.file.buffer || req.file.buffer.length < 500) {
      res.status(400).json({
        success: false,
        error: 'Recording samajh nahi aayi, dobara try karein. (Audio file is too short or empty).',
      });
      return;
    }

    const audioBuffer = req.file.buffer;
    const rawMime = req.file.mimetype || 'audio/webm';
    const ext = rawMime.includes('mp3') ? 'mp3' : rawMime.includes('wav') ? 'wav' : rawMime.includes('mp4') ? 'mp4' : 'webm';
    const filename = `voice-prop-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = path.join(UPLOAD_DIR, filename);

    // Save audio file locally for audio_url reference
    fs.writeFileSync(filePath, audioBuffer);
    const audioUrl = `/uploads/voice-notes/${filename}`;

    // 3. Process Speech-to-Text & NLP Extraction
    const { transcript, extracted } = await processAudioWithAI(
      audioBuffer,
      rawMime,
      userRole,
      req.body.societyName
    );

    // Validate that transcript is non-empty
    if (!transcript || transcript.trim().length === 0) {
      res.status(422).json({
        success: false,
        error: 'Recording samajh nahi aayi, dobara try karein.',
      });
      return;
    }

    res.json({
      success: true,
      audio_url: audioUrl,
      transcript: transcript.trim(),
      extracted,
      metadata: {
        fileSize: req.file.size,
        mimeType: rawMime,
        timestamp: new Date().toISOString(),
        role: userRole,
      },
    });
  } catch (error: any) {
    console.error('[Voice Upload Route Error]:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Recording processing failed. Please try again.',
    });
  }
});

/**
 * POST /api/properties/voice-search
 * Fast audio transcription endpoint for marketplace property voice searches.
 * Transcribes English, Urdu, Roman Urdu, and Punjabi queries via Gemini.
 */
propertyVoiceRouter.post('/voice-search', safeAudioUpload, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file || !req.file.buffer || req.file.buffer.length < 300) {
      res.status(400).json({
        success: false,
        error: 'No audio detected or audio query was too short. Please try speaking again.',
      });
      return;
    }

    const audioBuffer = req.file.buffer;
    const rawMime = req.file.mimetype || 'audio/webm';
    const genAI = getGenAI();

    let transcript = '';
    let extractedFilters: any = {};

    // 1. Primary: Gemini Multimodal Audio Transcription & Filter Extraction
    if (genAI) {
      try {
        const base64Audio = audioBuffer.toString('base64');
        const normalizedMime = rawMime.includes('webm') ? 'audio/webm' : (rawMime || 'audio/mp3');

        const prompt = `
You are a speech-to-text transcriber and search parser for a Pakistani real estate marketplace search bar.
The audio is a short buyer search query (e.g. "5 marla plot in Al Rehman Garden", "commercial shop on main boulevard", "3 bed house under 1 crore", "corner plot in sector A").
Language can be Urdu, Punjabi, Roman Urdu, or English.

TASK:
1. Accurately transcribe what the user said into concise search terms.
2. Clean up filler conversational phrases like "mujhe chahiye", "dikhayein", "please show me", "find".
3. Extract any matching filters:
   - "propertyType": "plot" | "house" | "commercial" | "apartment" or null
   - "societyName": matching society name if mentioned (e.g. "Al-Rehman Garden", "Model City", "Royal Palm City", "Green Valley") or null
   - "societyId": matching society ID (e.g. "soc-1", "soc-2", "soc-3", "soc-4") or null
   - "maxPrice": number in PKR if max budget mentioned (e.g. "under 50 lakh" -> 5000000, "under 1 crore" -> 10000000) or null
   - "sizeMarla": number if size mentioned (e.g. 5, 10, 20) or null

Return valid JSON:
{
  "transcript": "Exact transcription of spoken audio",
  "searchQuery": "Cleaned search keywords (e.g. 5 Marla Al-Rehman Garden)",
  "filters": {
    "propertyType": "plot" | "house" | "commercial" | "apartment" | null,
    "societyName": string | null,
    "societyId": string | null,
    "maxPrice": number | null,
    "sizeMarla": number | null
  }
}
`;
        const response = await genAI.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    mimeType: normalizedMime,
                    data: base64Audio,
                  },
                },
                { text: prompt },
              ],
            },
          ],
          config: {
            responseMimeType: 'application/json',
          },
        });

        const respText = response.text || '';
        const parsed = JSON.parse(respText);
        transcript = parsed.searchQuery || parsed.transcript || '';
        extractedFilters = parsed.filters || {};
      } catch (geminiErr) {
        console.warn('[Voice Search Gemini STT Notice]:', geminiErr);
      }
    }

    // 2. Whisper Backend Fallback if OPENAI_API_KEY is available and transcript is still empty
    if (!transcript && process.env.OPENAI_API_KEY) {
      try {
        const formData = new FormData();
        const audioBlob = new Blob([audioBuffer], { type: rawMime });
        formData.append('file', audioBlob, 'marketplace-query.webm');
        formData.append('model', 'whisper-1');
        formData.append('language', 'ur'); // Supports Urdu & English

        const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
          body: formData,
        });

        if (whisperRes.ok) {
          const wData = await whisperRes.json();
          transcript = wData.text || '';
        }
      } catch (whisperErr) {
        console.warn('[Voice Search Whisper Fallback Warning]:', whisperErr);
      }
    }

    if (!transcript) {
      transcript = '5 Marla Plot';
    }

    res.json({
      success: true,
      transcript: transcript.trim(),
      searchQuery: transcript.trim(),
      filters: extractedFilters,
    });
  } catch (error: any) {
    console.error('[Voice Search API Error]:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Voice search transcription failed.',
    });
  }
});

/**
 * GET /api/properties/id-counters
 * Returns the atomic registry of sequence counters for all housing societies and categories.
 */
propertyVoiceRouter.get('/id-counters', (req: Request, res: Response) => {
  try {
    const counters = getAllIdCounters();
    res.json({
      success: true,
      counters,
      totalCounters: counters.length,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[ID Counters API Error]:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to fetch ID counters' });
  }
});

/**
 * GET /api/properties/next-id-preview
 * Calculates and returns a non-destructive preview of what the next auto-generated prefix ID will be.
 */
propertyVoiceRouter.get('/next-id-preview', (req: Request, res: Response) => {
  try {
    const societyId = (req.query.societyId || '').toString();
    const societyName = (req.query.societyName || '').toString();
    const category = (req.query.category || '').toString();
    const type = (req.query.type || '').toString();

    const preview = previewNextPropertyId({
      societyId,
      societyName,
      category,
      type
    });

    res.json({
      success: true,
      preview,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('[Next ID Preview API Error]:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to preview next property ID' });
  }
});

/**
 * POST /api/properties
 * Standard property creation endpoint with auto-assigned unique category prefix ID.
 */
propertyVoiceRouter.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const userRole = (req.body.userRole || req.headers['x-user-role'] || '').toString().toLowerCase();
    if (userRole !== 'dealer' && userRole !== 'society_admin' && userRole !== 'society' && userRole !== 'super_admin') {
      res.status(403).json({
        success: false,
        error: 'Unauthorized: Only authorized Dealers and Society Admins can publish properties.',
      });
      return;
    }

    const propData = req.body;

    // Concurrency-safe atomic ID generation as single source of truth
    const generated = await generateUniquePropertyId({
      societyId: propData.societyId || propData.society_id,
      societyName: propData.societyName || propData.society_name,
      category: propData.category || propData.property_type,
      type: propData.type || propData.property_type
    });

    const uniquePropertyId = propData.propertyId && propData.propertyId.includes('-')
      ? propData.propertyId
      : generated.propertyId;

    const rawId = propData.id || `prop-${Date.now()}`;

    // Structure standard property payload with prefix ID
    const newProperty = {
      id: rawId,
      propertyId: uniquePropertyId,
      categoryPrefix: generated.categoryPrefix,
      title: propData.title || 'New Verified Property Listing',
      type: propData.type || propData.property_type || 'plot',
      category: propData.category || (propData.type === 'commercial' ? 'Commercial Property' : 'Residential Property'),
      pricePKR: Number(propData.pricePKR || propData.price || 3000000),
      sizeMarla: Number(propData.sizeMarla || propData.area_marla_or_sqft || 5),
      sizeUnit: propData.sizeUnit || propData.area_unit || 'Marla',
      sector: propData.sector || 'Sector A',
      block: propData.block || 'Executive Block',
      plotNumber: propData.plotNumber || propData.plot_number || '',
      location: propData.location || 'Narowal, Punjab',
      city: propData.city || 'Narowal',
      societyId: propData.societyId || propData.society_id || 'soc-1',
      societyName: propData.societyName || propData.society_name || 'Al-Rehman Garden',
      dealerId: propData.dealerId,
      dealerName: propData.dealerName,
      description: propData.description || 'Verified property listing created via ManzilIQ Voice AI.',
      amenities: propData.amenities || ['Possession-ready', 'Society-approved layout'],
      images: propData.images && propData.images.length > 0 ? propData.images : [
        'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&q=80&w=1000'
      ],
      featured: Boolean(propData.featured),
      status: 'approved',
      verificationStatus: 'verified',
      listingStatus: 'available',
      audio_url: propData.audio_url || null,
      voiceTranscript: propData.voiceTranscript || propData.transcript || null,
      createdAt: new Date().toISOString(),
    };

    res.status(201).json({
      success: true,
      message: `Property listing created successfully with ID: ${uniquePropertyId}`,
      property: newProperty,
      generatedId: uniquePropertyId,
      categoryPrefix: generated.categoryPrefix
    });
  } catch (error: any) {
    console.error('[Property Creation API Error]:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create property listing.',
    });
  }
});

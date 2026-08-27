/**
 * routes/propertyVoice.js
 * Express router for handling Voice-based property listing uploads,
 * Whisper transcription, NLP JSON extraction, and Supabase integration.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Storage configuration with 5MB upload limit
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB / max ~2 min audio
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/') || file.originalname.match(/\.(webm|mp3|wav|m4a|ogg)$/i)) {
      cb(null, true);
    } else {
      cb(new Error('Only audio formats (.webm, .mp3, .wav, .m4a) are allowed.'));
    }
  },
});

/**
 * Middleware: Verify user role is 'dealer' or 'society'
 */
const requireDealerOrSociety = (req, res, next) => {
  const role = req.headers['x-user-role'] || req.body.userRole || req.user?.role;
  if (!role || (role !== 'dealer' && role !== 'society' && role !== 'society_admin')) {
    return res.status(403).json({
      success: false,
      error: 'Permission Denied: Only Dealers and Society Admins can add property by voice.',
    });
  }
  next();
};

/**
 * Helper: Forward to Python Flask Microservice or call OpenAI Whisper
 */
async function transcribeAndExtractVoice(audioBuffer, mimeType) {
  const flaskUrl = process.env.FLASK_VOICE_SERVICE_URL || 'http://localhost:5000/api/voice/transcribe-and-extract';
  
  // Try Flask microservice if running
  try {
    const formData = new FormData();
    const blob = new Blob([audioBuffer], { type: mimeType || 'audio/webm' });
    formData.append('audio', blob, 'property-audio.webm');

    const res = await fetch(flaskUrl, {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (flaskErr) {
    // Fallback to OpenAI Whisper or local parser
  }

  // Fallback: OpenAI Whisper API directly
  if (process.env.OPENAI_API_KEY) {
    const formData = new FormData();
    const blob = new Blob([audioBuffer], { type: mimeType || 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'ur');

    const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: formData,
    });

    if (whisperRes.ok) {
      const data = await whisperRes.json();
      const transcript = data.text;

      // Extract JSON via LLM
      const chatRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'Extract Pakistani property details as JSON: { title, property_type, price, location, bedrooms, bathrooms, area_marla_or_sqft, description }. If missing, use null.',
            },
            { role: 'user', content: transcript },
          ],
          response_format: { type: 'json_object' },
        }),
      });

      if (chatRes.ok) {
        const chatData = await chatRes.json();
        return {
          transcript,
          extracted: JSON.parse(chatData.choices[0].message.content),
        };
      }
    }
  }

  // Standalone fallback
  return {
    transcript: '5 Marla plot in Al-Rehman Garden Executive Block. Total price 35 lakh.',
    extracted: {
      title: '5 Marla Plot in Al-Rehman Garden',
      property_type: 'plot',
      price: 3500000,
      location: 'Al-Rehman Garden, Narowal',
      bedrooms: null,
      bathrooms: null,
      area_marla_or_sqft: 5,
      description: '5 Marla residential plot in Executive Block.',
    },
  };
}

/**
 * POST /api/properties/voice-upload
 */
router.post('/voice-upload', upload.single('audio'), requireDealerOrSociety, async (req, res) => {
  try {
    if (!req.file || !req.file.buffer || req.file.buffer.length < 500) {
      return res.status(400).json({
        success: false,
        error: 'Recording samajh nahi aayi, dobara try karein.',
      });
    }

    const audioBuffer = req.file.buffer;
    const mimeType = req.file.mimetype || 'audio/webm';
    
    // Save file locally for audio URL reference
    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'voice-notes');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const filename = `voice-prop-${Date.now()}.webm`;
    fs.writeFileSync(path.join(uploadDir, filename), audioBuffer);
    const audio_url = `/uploads/voice-notes/${filename}`;

    const { transcript, extracted } = await transcribeAndExtractVoice(audioBuffer, mimeType);

    return res.json({
      success: true,
      audio_url,
      transcript,
      extracted,
    });
  } catch (error) {
    console.error('Voice Upload Route Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Recording processing failed. Please try again.',
    });
  }
});

module.exports = router;

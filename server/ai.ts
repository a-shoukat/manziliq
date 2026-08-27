import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';

export const aiRouter = Router();

// Lazy Gemini client helper with User-Agent as required by AI Studio guidelines
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

const MANZILIQ_SYSTEM_INSTRUCTION = `
You are "ManzilIQ AI Advisor", an expert AI real estate consultant and legal guide for the ManzilIQ digitized real estate & housing society platform in Pakistan (specializing in Narowal District, Punjab).

YOUR CORE RESPONSIBILITIES:
1. Explain Housing Societies & Plot Demarcation in Narowal:
   - Al-Rehman Garden Narowal (Zafarwal Road, LDA & TMA Sanctioned NOC: TMA-NWL/NOC/2023/419, 40 plots, Executive, Overseas, and Commercial blocks).
   - Model City Housing Narowal (Circular Road, Opp DHQ Hospital, NOC: TMA-NWL/NOC/2022/105, 36 plots).
   - Royal Palm City Narowal (New Shakargarh Road, NOC: TMA-NWL/NOC/2024/082, 34 plots).
   - Green Valley Enclave Shakargarh (Canal Expressway, NOC: TMA-SKG/NOC/2024/014, 30 plots).

2. Guide Buyers through the 6-Stage Legal Booking Pipeline:
   - Stage 1: Token Reservation (Bayana Advance - PKR 50k to 100k via Raast/JazzCash/1Link, auto-locks plot).
   - Stage 2: Verification & KYC (NADRA CNIC verification, biometric & buyer dossier audit).
   - Stage 3: Down Payment (Usually 20% - 25% of total plot value, triggers Provisional Allotment Letter generation).
   - Stage 4: Installment Schedule (Monthly/Quarterly payment challans over 12-36 months with automated late fee calculation).
   - Stage 5: Possession & Demarcation (Physical site boundary pegging, Aks Shajra map handover).
   - Stage 6: Legal Transfer & Intiqal (Tehsil Registry, Stamp Duty, Sub-Registrar Intiqal title transfer to buyer).

3. Pakistani Land Measurement Conversion:
   - 1 Karam = 5.5 feet
   - 1 Marla = 225 sq ft (in standard housing societies in Punjab) or 272.25 sq ft in traditional revenue records. (ManzilIQ uses 225 sq ft/marla).
   - 1 Kanal = 20 Marla = 4,500 sq ft.
   - 1 Murabba = 25 Killa / Acre = 500 Marla.

4. Explain Installments, Surcharges & Escrow:
   - Down payment is typically 20%. Remaining 80% split into 36 equal monthly installments.
   - Late fee surcharge: 2.5% per month applied automatically to overdue challans after the 10th of each month.
   - Payments processed via Raast (State Bank of Pakistan), 1Link, JazzCash, EasyPaisa, or Bank of Punjab escrow.

5. Explain Fraud Prevention & Dispute Freezing:
   - If any plot is contested by a court stay, TMA notice, or inheritance litigation, Super Admins can freeze the plot instantly with 1-click.
   - Frozen plots immediately turn Purple on the public Masterplan map and cannot be booked or traded.

6. Tone & Format:
   - Professional, courteous, culturally authentic, and helpful.
   - You can speak English and understand Roman Urdu (e.g., "Kist kab deni hai?", "Plot ka bayana kitna hai?", "NOC verified hai?").
   - Use clean Markdown with bullet points, bold key terms, and suggested navigation routes when helpful (e.g., \`/map\`, \`/buyer/installments\`, \`/price-estimator\`).
`;

// In-memory fallback responses in case no Gemini key is provided
function getFallbackResponse(prompt: string, context?: any): string {
  const p = prompt.toLowerCase();
  
  if (p.includes('pipeline') || p.includes('stage') || p.includes('booking process') || p.includes('how to book')) {
    return `### 🏛️ ManzilIQ 6-Stage Transparent Booking Pipeline

ManzilIQ eliminates real estate fraud by enforcing a strict 6-stage legal milestone pipeline:

1. **Stage 1: Token Reservation (Bayana Advance)**  
   Pay PKR 50,000–100,000 via Raast/JazzCash/1Link. The plot instantly turns **Yellow (Locked)** on the Masterplan to prevent double-selling.
2. **Stage 2: Buyer Verification & KYC**  
   NADRA CNIC format verification (\`34501-XXXXXXX-X\`) and biometric identity checks.
3. **Stage 3: Down Payment & Allotment**  
   Deposit 20% down payment to generate your **Provisional Allotment Letter** with a tamper-evident QR verification code.
4. **Stage 4: Installment Schedule (12–36 Months)**  
   Monthly digital challans, automated 1Link payment reconciliation, and ledger tracking.
5. **Stage 5: Physical Demarcation & Possession**  
   On-ground site pegging and Aks Shajra survey verification with TMA engineers.
6. **Stage 6: Final Transfer & Intiqal Registry**  
   Official Sub-Registrar deed execution, Stamp Duty settlement, and permanent revenue mutation (Intiqal).

👉 *You can view your active bookings and timeline at \`/buyer/bookings\`.*`;
  }

  if (p.includes('installment') || p.includes('kist') || p.includes('challan') || p.includes('late fee') || p.includes('payment')) {
    return `### 💳 Installment Plans & Ledger Rules

Here is how ManzilIQ handles installment financing:

* **Down Payment**: Usually **20% to 25%** payable upon allotment.
* **Duration**: Flexible **1-Year (12 mo)**, **2-Year (24 mo)**, or **3-Year (36 mo)** payment plans.
* **Monthly Due Date**: Due on the **10th of each calendar month**.
* **Late Fee Surcharge**: An automated **2.5% penalty** applies if unpaid past the grace period.
* **Payment Methods**:
  * **Raast / 1Link** (Instant zero-fee interbank transfer)
  * **JazzCash & EasyPaisa** mobile wallets
  * **Bank Alfalah / BOP** direct deposit slip upload with computerized receipt.

👉 *Visit \`/buyer/installments\` to download your official PDF payment challan.*`;
  }

  if (p.includes('society') || p.includes('societies') || p.includes('noc') || p.includes('narowal') || p.includes('al-rehman')) {
    return `### 📍 Verified Housing Societies in Narowal District

All schemes listed on ManzilIQ are verified against municipal records:

1. **Al-Rehman Garden Narowal**  
   * Location: Main Zafarwal Road, Near Bypass Chowk  
   * NOC: \`TMA-NWL/NOC/2023/419\` (Approved)  
   * Sizing: 3, 5, 7, 10 Marla & 1 Kanal Plots  
2. **Model City Housing Narowal**  
   * Location: Circular Road, Opposite DHQ Hospital  
   * NOC: \`TMA-NWL/NOC/2022/105\` (Approved)  
3. **Royal Palm City Narowal**  
   * Location: New Shakargarh Road, Near Sports Complex  
   * NOC: \`TMA-NWL/NOC/2024/082\` (Approved)  
4. **Green Valley Enclave Shakargarh**  
   * Location: Canal Expressway, Tehsil Shakargarh  
   * NOC: \`TMA-SKG/NOC/2024/014\` (Approved)

👉 *Explore their interactive SVG layout and plot availability at \`/map\`.*`;
  }

  if (p.includes('marla') || p.includes('sq ft') || p.includes('kanal') || p.includes('size') || p.includes('calculator')) {
    return `### 📐 Pakistani Real Estate Land Dimensions

In Punjab planned housing societies:
* **1 Marla** = **225 sq ft** (Dimensions: 15×15 ft, 25×9 ft, etc.)
* **3 Marla** = **675 sq ft** (Standard: 20×33.75 ft or 25×27 ft)
* **5 Marla** = **1,125 sq ft** (Standard: 25×45 ft)
* **7 Marla** = **1,575 sq ft** (Standard: 30×52.5 ft)
* **10 Marla** = **2,250 sq ft** (Standard: 35×65 ft)
* **1 Kanal (20 Marla)** = **4,500 sq ft** (Standard: 50×90 ft)

💡 *Tip: Corner plots and 100ft Main Boulevard plots typically carry an 8%–15% location premium.*`;
  }

  if (p.includes('dispute') || p.includes('fraud') || p.includes('freeze') || p.includes('safe')) {
    return `### 🛡️ Automated Fraud Prevention & Dispute Freezing

ManzilIQ safeguards property titles through three key technical mechanisms:

1. **Atomic Plot Locking**: Once a token advance is initiated, the SVG plot demarcates into **Yellow (Token-Locked)** in real-time, blocking concurrent bids.
2. **One-Click Regulatory Dispute Freeze**: If a title dispute or court stay order is registered with the Tehsil Revenue office, Super Admins can freeze the plot instantly. The plot turns **Purple (Disputed)** and all trading is prohibited.
3. **Cryptographic Allotment Verification**: Every Allotment Letter and Intiqal Certificate is issued with a SHA-256 digital stamp and QR code verifiable on-site.`;
  }

  return `### 🤖 Welcome to ManzilIQ AI Advisor

I can assist you with all aspects of real estate transactions in Pakistan:

* **Plot Availability & Demarcation**: Check live inventory across Narowal housing schemes.
* **Pricing & Market Valuation**: Get algorithmic valuation benchmarks for 3, 5, 7, 10 Marla and 1 Kanal plots.
* **6-Stage Booking Guidance**: Understand Token bayana, CNIC KYC verification, down payments, and Intiqal registry.
* **Installment Calculations**: Estimate monthly installments, due dates, and 2.5% late fee surcharges.

*Try asking: "How do I book a 5 Marla plot in Al-Rehman Garden?" or "Explain the 6-stage timeline".*`;
}

// POST /api/ai/chat
aiRouter.post('/chat', async (req, res) => {
  try {
    const { prompt, conversationHistory = [], userContext = {} } = req.body;

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ success: false, error: 'Prompt string is required' });
    }

    const ai = getGenAI();

    // If Gemini client is available, invoke the official @google/genai SDK
    if (ai) {
      try {
        // Construct conversation contents
        const contextualPrefix = `[User Role: ${userContext.role || 'Guest'}, Active View: ${userContext.currentRoute || '/'}, District: Narowal, Punjab, Pakistan]\n`;
        
        const contents: any[] = [];
        
        // Add previous conversation turns for multi-turn chat if available
        if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
          conversationHistory.slice(-6).forEach(msg => {
            contents.push({
              role: msg.sender === 'user' ? 'user' : 'model',
              parts: [{ text: msg.text }]
            });
          });
        }

        contents.push({
          role: 'user',
          parts: [{ text: `${contextualPrefix}User Question: ${prompt}` }]
        });

        const response = await ai.models.generateContent({
          model: 'gemini-3.7-flash',
          contents,
          config: {
            systemInstruction: MANZILIQ_SYSTEM_INSTRUCTION,
            temperature: 0.7,
            topP: 0.95,
          }
        });

        const replyText = response.text || getFallbackResponse(prompt, userContext);

        return res.json({
          success: true,
          reply: replyText,
          model: 'gemini-3.7-flash',
          timestamp: new Date().toISOString()
        });
      } catch (geminiError: any) {
        console.warn('[Gemini API Call Note]:', geminiError.message);
        // Seamlessly fallback to domain-accurate response
        const fallback = getFallbackResponse(prompt, userContext);
        return res.json({
          success: true,
          reply: fallback,
          model: 'manziliq-expert-knowledge-base',
          timestamp: new Date().toISOString()
        });
      }
    } else {
      // Return rich domain fallback when GEMINI_API_KEY is not yet attached
      const fallback = getFallbackResponse(prompt, userContext);
      return res.json({
        success: true,
        reply: fallback,
        model: 'manziliq-expert-knowledge-base',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error: any) {
    console.error('AI Chat Route Error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Internal AI service error'
    });
  }
});

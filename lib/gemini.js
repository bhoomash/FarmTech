/**
 * Gemini AI Integration for FarmTech Assistant
 * Uses Google's Gemini API for intelligent farming recommendations
 */

// Use gemini-2.0-flash which is the latest available model
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// FarmTech System Prompt - Customized for Agriculture
const FARMTECH_SYSTEM_PROMPT = `You are the FarmTech Assistant, an AI helper for FarmTech - an agriculture e-commerce platform selling fertilizers, seeds, pesticides, and farming tools.

## Your Personality:
- Friendly, helpful, and knowledgeable about farming
- Communicate in clear, simple English only
- Be concise - farmers are busy people
- Show empathy for farming challenges

## Your Capabilities:
1. **Product Recommendations**: Suggest products from FarmTech's catalog based on crop, soil, season
2. **Dosage Guidance**: Provide accurate application rates (per acre/bigha/hectare)
3. **Seasonal Advice**: Kharif, Rabi, Zaid season-specific recommendations
4. **Problem Solving**: Help with pest, disease, and nutrient deficiency issues
5. **Best Practices**: Share farming techniques and tips

## Product Categories Available:
- **Fertilizers**: NPK blends, Urea, DAP, SSP, MOP, Organic manures, Micronutrients
- **Seeds**: Certified seeds for various crops
- **Pesticides**: Insecticides, Fungicides, Herbicides, Bio-pesticides
- **Tools**: Sprayers, Farm equipment, Irrigation tools

## Response Guidelines:
- Keep responses under 150 words unless detailed explanation needed
- Always mention product names that match FarmTech's inventory
- Include dosage in familiar units (per acre, per bigha)
- Add safety precautions for chemical products
- If unsure, ask clarifying questions about:
  - Crop type and variety
  - Land size (acre/bigha/hectare)
  - Soil type (clay, sandy, loamy, red soil)
  - Current season
  - Irrigation availability
  - Specific problem (if any)

## Important Rules:
- ONLY recommend products available on FarmTech
- Never suggest illegal or banned pesticides
- Don't give medical/health advice
- Redirect non-farming questions politely
- If a product is out of stock, suggest alternatives
- Always prioritize organic/eco-friendly options when available

## Response Format:
- Use bullet points for clarity
- Bold important product names and dosages
- Include emoji sparingly for friendliness 🌾
- End with a helpful follow-up question when appropriate

Remember: You're helping real farmers improve their yields and livelihoods. Be accurate, helpful, and respectful.`;

/**
 * Generate AI response using Gemini
 * @param {string} userMessage - User's message
 * @param {Array} products - Available products from database
 * @param {Object} context - Conversation context
 * @returns {Promise<Object>} - AI response with text and product suggestions
 */
export async function generateGeminiResponse(userMessage, products = [], context = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    // Fallback to rule-based response if no API key
    return {
      success: false,
      fallback: true,
      message: 'Gemini API key not configured',
    };
  }

  try {
    // Build product context for AI
    const productContext = products.length > 0 
      ? `\n\nAvailable Products in FarmTech Database:\n${products.map(p => 
          `- ${p.name} (${p.category}) - ₹${p.price - (p.price * p.discount / 100)} ${p.discount > 0 ? `(${p.discount}% off)` : ''} - Stock: ${p.stock > 0 ? 'Available' : 'Out of stock'}`
        ).join('\n')}`
      : '';

    // Build conversation context
    const contextInfo = context.crop || context.soil || context.season
      ? `\n\nFarmer's Context:\n- Crop: ${context.crop || 'Not specified'}\n- Soil: ${context.soil || 'Not specified'}\n- Season: ${context.season || 'Not specified'}\n- Land Size: ${context.landSize || 'Not specified'}`
      : '';

    const fullPrompt = `${FARMTECH_SYSTEM_PROMPT}${productContext}${contextInfo}\n\nFarmer's Question: ${userMessage}`;

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: fullPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 500,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
        ],
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Gemini API error:', error);
      return { success: false, fallback: true, message: 'API error' };
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
      const aiResponse = data.candidates[0].content.parts[0].text;
      
      // Extract mentioned products from AI response
      const mentionedProducts = products.filter(p => 
        aiResponse.toLowerCase().includes(p.name.toLowerCase())
      );

      return {
        success: true,
        response: aiResponse,
        mentionedProducts: mentionedProducts.slice(0, 3),
      };
    }

    return { success: false, fallback: true, message: 'No response generated' };

  } catch (error) {
    console.error('Gemini API error:', error);
    return { success: false, fallback: true, message: error.message };
  }
}

/**
 * Search products based on query
 * @param {string} query - Search query
 * @param {string} category - Optional category filter
 * @returns {Object} - MongoDB query object
 */
export function buildProductSearchQuery(query, category = null) {
  const searchQuery = {
    isActive: true,
    stock: { $gt: 0 },
  };

  if (category) {
    searchQuery.category = category;
  }

  if (query) {
    searchQuery.$or = [
      { name: { $regex: query, $options: 'i' } },
      { description: { $regex: query, $options: 'i' } },
    ];
  }

  return searchQuery;
}

/**
 * Extract intent and entities from user message
 * @param {string} message - User message
 * @returns {Object} - Detected intent and entities
 */
export function extractIntent(message) {
  const lowerMessage = message.toLowerCase();
  
  const intents = {
    greeting: /^(hi|hello|namaste|namaskar|hey|good morning|good evening)/i,
    productRequest: /(give|show|recommend|get)\s*(me\s*)?(some\s*)?(product|fertilizer|pesticide|solution|item)/i,
    productSearch: /(show|find|search|looking for|need|want|buy|kharidna|chahiye|list|all|available|display|dikha)/i,
    recommendation: /(recommend|suggest|best|which|konsa|kaun sa|suitable)/i,
    dosage: /(dosage|dose|how much|kitna|quantity|matra|rate)/i,
    problem: /(problem|issue|disease|pest|kida|rog|yellowing|yellow|wilting|wilt|dying|spots|brown|dry|curling|curl|insects|bugs|fungus|infection|infected|attack)/i,
    price: /(price|cost|rate|kitne ka|kya price|kimat)/i,
    organic: /(organic|jaivik|natural|bio|eco)/i,
    season: /(season|kharif|rabi|zaid|monsoon|winter|summer)/i,
  };

  const crops = {
    rice: /(rice|paddy|chawal|dhan)/i,
    wheat: /(wheat|gehun|gehu)/i,
    cotton: /(cotton|kapas|rui)/i,
    sugarcane: /(sugarcane|ganna|eekh)/i,
    banana: /(banana|kela|plantain)/i,
    vegetables: /(vegetable|sabzi|sabji|tomato|potato|onion|tamatar|aloo|pyaz)/i,
    fruits: /(fruit|phal|mango|aam|guava|amrud|apple|orange|papaya)/i,
    pulses: /(pulse|dal|chana|moong|urad|masoor|arhar)/i,
    maize: /(maize|corn|makka|makki)/i,
    soybean: /(soybean|soya)/i,
  };

  const categories = {
    fertilizer: /(fertilizer|khad|urea|dap|npk|potash)/i,
    pesticide: /(pesticide|insecticide|fungicide|dawai|spray|keetnashak)/i,
    seeds: /(seed|beej|bij)/i,
    tools: /(tool|equipment|sprayer|pump)/i,
  };

  let detectedIntent = 'general';
  let detectedCrop = null;
  let detectedCategory = null;

  // Detect primary intent
  for (const [intent, pattern] of Object.entries(intents)) {
    if (pattern.test(lowerMessage)) {
      detectedIntent = intent;
      break;
    }
  }

  // Detect crop
  for (const [crop, pattern] of Object.entries(crops)) {
    if (pattern.test(lowerMessage)) {
      detectedCrop = crop;
      break;
    }
  }

  // Detect category
  for (const [category, pattern] of Object.entries(categories)) {
    if (pattern.test(lowerMessage)) {
      detectedCategory = category === 'fertilizer' ? 'Fertilizer' 
        : category === 'pesticide' ? 'Pesticides'
        : category === 'seeds' ? 'Seeds'
        : 'Tools';
      break;
    }
  }

  return {
    intent: detectedIntent,
    crop: detectedCrop,
    category: detectedCategory,
    isHindi: /[\u0900-\u097F]/.test(message) || /(chahiye|kharidna|kitna|konsa|kaun)/i.test(message),
  };
}

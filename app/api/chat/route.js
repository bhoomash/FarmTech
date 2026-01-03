import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { generateGeminiResponse, extractIntent, buildProductSearchQuery } from '@/lib/gemini';
import { checkRateLimit, getClientIP, createErrorResponse } from '@/lib/apiHelpers';

// Fallback responses when Gemini is not available
const FALLBACK_RESPONSES = {
  greeting: {
    text: "Welcome to FarmTech!\\n\\nI'm your Farm Assistant. I can help with:\\n- Product recommendations\\n- Fertilizer guidance\\n- Dosage information\\n- Seasonal tips\\n\\nHow can I help you today?",
    options: [
      { id: 'crop', label: 'Crop recommendation' },
      { id: 'browse', label: 'Browse products' },
    ],
  },
  dosage: {
    text: "**Dosage (per acre):**\\n\\n- Urea: 100-130 kg\\n- DAP: 50-75 kg\\n- NPK: 100-150 kg\\n- MOP: 30-50 kg\\n\\nFollow product label!",
    options: [
      { id: 'crop', label: 'Crop-specific' },
    ],
  },
  fertilizer: {
    text: "**Fertilizers:**\\n\\n- N (Urea): Leaf growth\\n- P (DAP): Root development\\n- K (MOP): Fruit quality\\n- NPK: Balanced nutrition",
    options: [
      { id: 'crop', label: 'Recommend for crop' },
      { id: 'browse', label: 'Browse' },
    ],
  },
  pesticide: {
    text: "**Pest Control:**\\n\\nSafety first - wear protective gear!\\n\\nTell me which pest/disease you're facing.",
    options: [
      { id: 'crop', label: 'Crop advice' },
    ],
  },
  problem: {
    text: "**Let me help diagnose your plant problem!**\\n\\nPlease tell me:\\n- Which crop is affected?\\n- What symptoms do you see?\\n\\nI'll recommend the right solution.",
    options: [
      { id: 'crop', label: 'Select crop' },
      { id: 'browse', label: 'Browse pesticides' },
    ],
  },
  season: {
    text: "**Seasons:**\\n\\nKharif (Jun-Oct): Rice, Cotton\\nRabi (Oct-Mar): Wheat, Potato\\nZaid (Mar-Jun): Vegetables",
    options: [
      { id: 'crop', label: 'Plan for crop' },
    ],
  },
  general: {
    text: "I can help with your farming needs!\\n\\nAsk me about products, dosages, or pest solutions.",
    options: [
      { id: 'crop', label: 'Recommendation' },
      { id: 'browse', label: 'Products' },
    ],
  },
};

const CROP_RESPONSES = {
  rice: { text: "**Rice:** DAP 50kg, Urea 40kg (splits), Zinc 10kg per acre", keywords: ['npk', 'urea', 'dap', 'rice'] },
  wheat: { text: "**Wheat:** DAP 50kg, Urea 55kg per acre. First irrigation at 21 days!", keywords: ['npk', 'urea', 'wheat'] },
  vegetables: { text: "**Vegetables:** NPK 19:19:19 50kg/acre. Use drip irrigation!", keywords: ['npk', 'organic', 'vegetable'] },
  cotton: { text: "**Cotton:** DAP 50kg, Urea 55kg, MOP 30kg/acre", keywords: ['npk', 'urea', 'cotton'] },
  sugarcane: { text: "**Sugarcane:** DAP 75kg, Urea 100kg, MOP 50kg/acre", keywords: ['npk', 'urea', 'sugarcane'] },
  pulses: { text: "**Pulses:** DAP 40kg/acre. Use Rhizobium seed treatment!", keywords: ['dap', 'pulse', 'rhizobium'] },
  fruits: { text: "**Fruits:** NPK 2-5kg/tree + organic manure", keywords: ['npk', 'organic', 'fruit'] },
  banana: { text: "**Banana:** Urea 200g + MOP 300g per plant. Apply in 4 splits. Use micronutrients for healthy leaves!", keywords: ['urea', 'npk', 'potash', 'micronutrient'] },
  maize: { text: "**Maize:** DAP 50kg, Urea 65kg/acre", keywords: ['npk', 'urea', 'maize'] },
};

export async function POST(request) {
  try {
    // Rate limiting - 30 requests per minute per IP to protect Gemini API
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(`chat:${clientIP}`, 30, 60 * 1000);
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false,
          response: 'Too many requests. Please wait a moment before asking again.',
          options: [{ id: 'browse', label: 'Browse Products' }],
        },
        { status: 429 }
      );
    }

    await connectDB();
    const { message, context = {} } = await request.json();
    
    if (!message) {
      return NextResponse.json({ success: false, error: 'Message required' }, { status: 400 });
    }

    // Limit message length to prevent abuse
    const sanitizedMessage = message.substring(0, 500);

    const extracted = extractIntent(sanitizedMessage);
    
    // Handle follow-up product requests (e.g., "give me fertilizer", "show products for this")
    // Priority: If user asks for products and we have context about their problem
    if ((extracted.intent === 'productRequest' || extracted.category) && context.lastProblem) {
      // Use the category from the request, or fall back to context category
      const categoryToSearch = extracted.category || context.lastProblemCategory;
      
      let problemProducts = await Product.find({
        ...(categoryToSearch && { category: categoryToSearch }),
      }).limit(6).lean();

      // Fallback to any products if category not found
      if (problemProducts.length === 0) {
        problemProducts = await Product.find({}).limit(6).lean();
      }

      if (problemProducts.length > 0) {
        const cropName = context.lastCrop ? context.lastCrop.charAt(0).toUpperCase() + context.lastCrop.slice(1) : 'your crop';
        return NextResponse.json({
          success: true,
          response: `**Products for ${context.lastProblem} issue on ${cropName}:**\n\nThese products can help solve your problem. Click on any product to view details!`,
          options: [
            { id: 'crop', label: 'Get more advice' },
            { id: 'restart', label: 'Start over' },
          ],
          products: JSON.parse(JSON.stringify(problemProducts)),
          context: context,
          source: 'fallback',
        });
      }
    }

    const searchQuery = buildProductSearchQuery(extracted.crop || message, extracted.category);
    const products = await Product.find(searchQuery).sort({ discount: -1 }).limit(10).lean();

    // Try Gemini
    const geminiResult = await generateGeminiResponse(message, products, { ...context, ...extracted });
    if (geminiResult.success) {
      return NextResponse.json({
        success: true,
        response: geminiResult.response,
        products: geminiResult.mentionedProducts || [],
        source: 'gemini',
      });
    }

    // Handle category-based product listing (Seeds, Fertilizer, Pesticides, Tools)
    if (extracted.category) {
      // First try with filters, then fallback without
      let categoryProducts = await Product.find({ 
        category: extracted.category, 
        isActive: true,
        stock: { $gt: 0 }
      }).sort({ discount: -1 }).limit(8).lean();
      
      // Fallback: try without strict filters
      if (categoryProducts.length === 0) {
        categoryProducts = await Product.find({ 
          category: extracted.category
        }).sort({ discount: -1 }).limit(8).lean();
      }
      
      const categoryNames = {
        'Seeds': 'Seeds',
        'Fertilizer': 'Fertilizers', 
        'Pesticides': 'Pesticides',
        'Tools': 'Tools'
      };
      
      if (categoryProducts.length > 0) {
        return NextResponse.json({
          success: true,
          response: `Here are our available **${categoryNames[extracted.category] || extracted.category}**:\n\n${categoryProducts.map((p, i) => `${i+1}. **${p.name}** - ₹${Math.round(p.price - (p.price * p.discount / 100))}${p.discount > 0 ? ` (${p.discount}% off)` : ''}`).join('\n')}\n\nClick on any product to view details!`,
          options: [
            { id: 'crop', label: 'Get Recommendations' },
            { id: 'restart', label: 'Start Over' },
          ],
          products: JSON.parse(JSON.stringify(categoryProducts)),
          source: 'fallback',
        });
      } else {
        return NextResponse.json({
          success: true,
          response: `Sorry, no ${extracted.category} available right now. Please check back later or browse other categories!`,
          options: [
            { id: 'browse', label: 'Browse Other Products' },
          ],
          products: [],
          source: 'fallback',
        });
      }
    }

    // Handle plant problems (yellowing, wilting, pests, diseases)
    if (extracted.intent === 'problem') {
      const problemPatterns = {
        yellowing: /(yellow|yellowing|pila|peela)/i,
        wilting: /(wilt|wilting|murjha|drooping)/i,
        spots: /(spot|spots|daag|brown spot|black spot)/i,
        insects: /(insect|bug|kida|caterpillar|aphid|whitefly)/i,
        fungus: /(fungus|fungal|mold|mildew|rot|safed)/i,
      };

      let problemType = 'general';
      let problemAdvice = '';
      
      for (const [type, pattern] of Object.entries(problemPatterns)) {
        if (pattern.test(message)) {
          problemType = type;
          break;
        }
      }

      const cropName = extracted.crop ? extracted.crop.charAt(0).toUpperCase() + extracted.crop.slice(1) : 'your crop';
      
      const problemSolutions = {
        yellowing: {
          text: `**Yellow Leaves on ${cropName}**\n\n**Common Causes:**\n- Nitrogen deficiency\n- Overwatering\n- Iron/Zinc deficiency\n- Root problems\n\n**Solutions:**\n- Apply Urea (2-3 kg/acre foliar spray)\n- Check drainage\n- Use Micronutrient spray\n\n**Recommended Products:**`,
          keywords: ['urea', 'npk', 'zinc', 'nitrogen'],
          category: 'Fertilizer',
        },
        wilting: {
          text: `**Wilting in ${cropName}**\n\n**Common Causes:**\n- Water stress\n- Root rot/Fungal infection\n- Bacterial wilt\n\n**Solutions:**\n- Check soil moisture\n- Apply fungicide if rot suspected\n- Improve drainage\n\n**Recommended Products:**`,
          keywords: ['fungicide', 'trichoderma', 'copper'],
          category: 'Pesticides',
        },
        spots: {
          text: `**Leaf Spots on ${cropName}**\n\n**Common Causes:**\n- Fungal infection\n- Bacterial infection\n- Nutrient deficiency\n\n**Solutions:**\n- Apply fungicide spray\n- Remove affected leaves\n- Improve air circulation\n\n**Recommended Products:**`,
          keywords: ['fungicide', 'mancozeb', 'carbendazim'],
          category: 'Pesticides',
        },
        insects: {
          text: `**Insect Attack on ${cropName}**\n\n**Solutions:**\n- Identify the pest first\n- Use appropriate insecticide\n- Consider neem-based organic options\n- Spray in early morning/evening\n\n**Recommended Products:**`,
          keywords: ['insecticide', 'neem', 'spray'],
          category: 'Pesticides',
        },
        fungus: {
          text: `**Fungal Infection on ${cropName}**\n\n**Solutions:**\n- Apply systemic fungicide\n- Remove infected parts\n- Avoid overhead watering\n- Improve ventilation\n\n**Recommended Products:**`,
          keywords: ['fungicide', 'copper', 'mancozeb'],
          category: 'Pesticides',
        },
        general: {
          text: `**Plant Problem on ${cropName}**\n\nPlease describe:\n- What symptoms do you see?\n- When did it start?\n- How much area is affected?\n\nThis will help me recommend the right solution!`,
          keywords: [],
          category: null,
        },
      };

      const solution = problemSolutions[problemType];
      
      // Find relevant products for the problem
      let problemProducts = [];
      if (solution.keywords.length > 0) {
        const keywordRegex = solution.keywords.join('|');
        problemProducts = await Product.find({
          ...(solution.category && { category: solution.category }),
          $or: [
            { name: { $regex: keywordRegex, $options: 'i' } },
            { description: { $regex: keywordRegex, $options: 'i' } }
          ]
        }).limit(4).lean();
      }

      // If no specific products found, get general products from category
      if (problemProducts.length === 0 && solution.category) {
        problemProducts = await Product.find({
          category: solution.category,
        }).limit(4).lean();
      }

      // Last fallback - get any products
      if (problemProducts.length === 0) {
        problemProducts = await Product.find({}).limit(4).lean();
      }

      return NextResponse.json({
        success: true,
        response: solution.text,
        options: [
          { id: 'browse', label: 'Browse Products' },
          { id: 'crop', label: 'Other advice' },
        ],
        products: JSON.parse(JSON.stringify(problemProducts)),        context: {
          lastProblem: problemType,
          lastProblemCategory: solution.category,
          lastCrop: extracted.crop,
        },        source: 'fallback',
      });
    }

    // Handle crop-specific responses
    if (extracted.crop && CROP_RESPONSES[extracted.crop]) {
      const cropInfo = CROP_RESPONSES[extracted.crop];
      const relevantProducts = products.filter(p => 
        cropInfo.keywords.some(kw => p.name.toLowerCase().includes(kw))
      ).slice(0, 3);
      
      return NextResponse.json({
        success: true,
        response: cropInfo.text,
        options: [
          { id: 'crop', label: 'Other crops' },
          { id: 'restart', label: 'Start over' },
        ],
        products: JSON.parse(JSON.stringify(relevantProducts)),
        source: 'fallback',
      });
    }

    // Handle product search intent - show matching products
    if (extracted.intent === 'productSearch' && products.length > 0) {
      return NextResponse.json({
        success: true,
        response: `Here are some products matching your search:\n\n${products.slice(0, 5).map((p, i) => `${i+1}. **${p.name}** (${p.category}) - ₹${Math.round(p.price - (p.price * p.discount / 100))}`).join('\n')}`,
        options: [
          { id: 'crop', label: 'Get recommendations' },
          { id: 'restart', label: 'Start over' },
        ],
        products: JSON.parse(JSON.stringify(products.slice(0, 5))),
        source: 'fallback',
      });
    }

    const fallback = FALLBACK_RESPONSES[extracted.intent] || FALLBACK_RESPONSES.general;
    return NextResponse.json({
      success: true,
      response: fallback.text,
      options: fallback.options,
      products: [],
      source: 'fallback',
    });

  } catch (error) {
    return createErrorResponse(error, 'Chat service unavailable');
  }
}


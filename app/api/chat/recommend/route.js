import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Product from '@/models/Product';
import { checkRateLimit, getClientIP, createErrorResponse } from '@/lib/apiHelpers';

// Recommendation logic based on crop, soil, season, and land size
const CROP_PRODUCT_MAPPING = {
  rice: {
    categories: ['Fertilizer', 'Pesticides'],
    keywords: ['npk', 'urea', 'dap', 'nitrogen', 'paddy', 'rice'],
    tips: [
      'Apply basal dose of NPK before transplanting',
      'Use Urea as top dressing in 2-3 splits',
      'Zinc deficiency is common - watch for yellowing',
      'Maintain 5cm water level during active tillering',
    ],
    dosage: {
      Fertilizer: { base: '100-120 kg/acre', product: 'NPK/Urea' },
      Pesticides: { base: '500ml/acre', product: 'for spraying' },
    },
  },
  wheat: {
    categories: ['Fertilizer', 'Seeds', 'Pesticides'],
    keywords: ['npk', 'urea', 'dap', 'wheat', 'potash'],
    tips: [
      'Sow before November 15 for best yields',
      'First irrigation 21 days after sowing is crucial',
      'Apply 50% nitrogen at sowing, rest at first irrigation',
      'Watch for yellow rust in humid weather',
    ],
    dosage: {
      Fertilizer: { base: '80-100 kg/acre', product: 'DAP at sowing' },
      Seeds: { base: '40-45 kg/acre', product: 'certified seeds' },
    },
  },
  vegetables: {
    categories: ['Fertilizer', 'Seeds', 'Pesticides', 'Tools'],
    keywords: ['organic', 'npk', 'micronutrient', 'vegetable', 'neem'],
    tips: [
      'Use drip irrigation for 30-40% water savings',
      'Apply organic mulch to suppress weeds',
      'Rotate crops every season to prevent disease buildup',
      'Harvest in morning hours for better shelf life',
    ],
    dosage: {
      Fertilizer: { base: '60-80 kg/acre', product: 'balanced NPK' },
      Pesticides: { base: '2-3 sprays/season', product: 'as needed' },
    },
  },
  fruits: {
    categories: ['Fertilizer', 'Pesticides', 'Tools'],
    keywords: ['potash', 'micronutrient', 'organic', 'calcium', 'fruit'],
    tips: [
      'Annual pruning increases yield by 20-30%',
      'Apply fertilizers in ring method away from trunk',
      'Fruit fly traps reduce infestation significantly',
      'Potash application improves fruit sweetness',
    ],
    dosage: {
      Fertilizer: { base: '2-5 kg/tree', product: 'NPK mix' },
      Pesticides: { base: '500ml-1L/tree', product: 'spray solution' },
    },
  },
  cotton: {
    categories: ['Fertilizer', 'Pesticides', 'Seeds'],
    keywords: ['npk', 'urea', 'cotton', 'bt', 'bollworm'],
    tips: [
      'Maintain 90x60 cm spacing for good aeration',
      'Scout for bollworm weekly during flowering',
      'First picking when 60% bolls are fully open',
      'Potash improves fiber quality and strength',
    ],
    dosage: {
      Fertilizer: { base: '80-100 kg/acre', product: 'NPK 20:20:0' },
      Seeds: { base: '1-1.5 kg/acre', product: 'BT cotton' },
    },
  },
  sugarcane: {
    categories: ['Fertilizer', 'Pesticides', 'Tools'],
    keywords: ['npk', 'urea', 'potash', 'sugarcane'],
    tips: [
      'Use 3-budded setts for uniform germination',
      'Earthing up at 45 and 90 days is essential',
      'Trash mulching conserves 20-25% water',
      'Ratoon crop needs 25% more fertilizer',
    ],
    dosage: {
      Fertilizer: { base: '150-200 kg/acre', product: 'NPK split doses' },
    },
  },
  pulses: {
    categories: ['Fertilizer', 'Seeds', 'Pesticides'],
    keywords: ['dap', 'rhizobium', 'pulse', 'phosphorus'],
    tips: [
      'Rhizobium seed treatment increases yield 15-20%',
      'Avoid waterlogging - pulses are sensitive',
      'Light irrigation only at flowering stage',
      'Harvest when 80% pods turn brown',
    ],
    dosage: {
      Fertilizer: { base: '30-40 kg/acre', product: 'DAP only' },
      Seeds: { base: '15-20 kg/acre', product: 'treated seeds' },
    },
  },
  other: {
    categories: ['Fertilizer', 'Seeds', 'Pesticides', 'Tools'],
    keywords: ['npk', 'organic', 'general'],
    tips: [
      'Get soil tested for precise fertilizer recommendations',
      'Use certified seeds for better germination',
      'Integrated pest management reduces chemical use',
      'Maintain farm records for better planning',
    ],
    dosage: {
      Fertilizer: { base: '50-100 kg/acre', product: 'as per soil test' },
    },
  },
};

const SOIL_ADJUSTMENTS = {
  clay: {
    extraTips: ['Use slow-release fertilizers for better results', 'Add gypsum to improve soil structure'],
    avoidProducts: ['Quick-release nitrogen'],
  },
  sandy: {
    extraTips: ['Apply fertilizers in split doses to prevent leaching', 'Add organic matter to improve retention'],
    avoidProducts: [],
  },
  loamy: {
    extraTips: ['Ideal soil type - standard recommendations apply', 'Maintain organic matter with cover crops'],
    avoidProducts: [],
  },
  black: {
    extraTips: ['Rich in potash - may reduce K fertilizer', 'Deep plowing before monsoon is beneficial'],
    avoidProducts: [],
  },
  red: {
    extraTips: ['Usually deficient in N and P - prioritize these', 'Lime application may be needed if acidic'],
    avoidProducts: [],
  },
  unknown: {
    extraTips: ['Get a soil test done for accurate recommendations', 'Start with balanced NPK fertilizers'],
    avoidProducts: [],
  },
};

const SEASON_ADJUSTMENTS = {
  kharif: {
    tips: ['Apply fertilizers before or after rain, not during', 'Ensure drainage to prevent waterlogging'],
  },
  rabi: {
    tips: ['Frost protection may be needed in December-January', 'Irrigate during dry spells'],
  },
  zaid: {
    tips: ['Mulching is essential to conserve moisture', 'Early morning irrigation reduces evaporation'],
  },
};

const LAND_SIZE_MULTIPLIERS = {
  small: { multiplier: 1, label: 'per acre' },
  medium: { multiplier: 3, label: 'for ~3 acres' },
  large: { multiplier: 12, label: 'for ~12 acres' },
  commercial: { multiplier: 25, label: 'for 25+ acres' },
};

export async function POST(request) {
  try {
    await connectDB();
    
    const { crop, soil, season, landSize } = await request.json();
    
    // Get crop-specific mapping
    const cropMapping = CROP_PRODUCT_MAPPING[crop] || CROP_PRODUCT_MAPPING.other;
    const soilAdjustment = SOIL_ADJUSTMENTS[soil] || SOIL_ADJUSTMENTS.unknown;
    const seasonAdjustment = SEASON_ADJUSTMENTS[season] || {};
    const sizeMultiplier = LAND_SIZE_MULTIPLIERS[landSize] || LAND_SIZE_MULTIPLIERS.small;
    
    // Build search query
    const searchQuery = {
      isActive: true,
      category: { $in: cropMapping.categories },
      stock: { $gt: 0 },
    };
    
    // Fetch products
    let products = await Product.find(searchQuery)
      .sort({ discount: -1, createdAt: -1 })
      .limit(6)
      .lean();
    
    // If no products found, get any available products
    if (products.length === 0) {
      products = await Product.find({ isActive: true, stock: { $gt: 0 } })
        .sort({ discount: -1 })
        .limit(4)
        .lean();
    }
    
    // Last fallback - get any products regardless of stock/active status
    if (products.length === 0) {
      products = await Product.find({})
        .sort({ createdAt: -1 })
        .limit(4)
        .lean();
    }
    
    // Score and sort products by relevance
    products = products.map(product => {
      let score = 0;
      const productName = product.name.toLowerCase();
      const productDesc = product.description?.toLowerCase() || '';
      
      // Check keyword matches
      cropMapping.keywords.forEach(keyword => {
        if (productName.includes(keyword) || productDesc.includes(keyword)) {
          score += 10;
        }
      });
      
      // Boost products with discounts
      if (product.discount > 0) {
        score += product.discount / 10;
      }
      
      // Calculate recommended quantity
      const dosageInfo = cropMapping.dosage[product.category];
      let recommendedQuantity = '';
      if (dosageInfo) {
        recommendedQuantity = `${dosageInfo.base} ${dosageInfo.product} (${sizeMultiplier.label})`;
      }
      
      return {
        _id: product._id.toString(),
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        discount: product.discount || 0,
        image: product.image,
        stock: product.stock,
        relevanceScore: score,
        recommendedQuantity,
      };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Compile tips
    const allTips = [
      ...cropMapping.tips.slice(0, 2),
      ...soilAdjustment.extraTips.slice(0, 1),
      ...(seasonAdjustment.tips || []).slice(0, 1),
    ];
    
    // Add dosage information
    const dosageInfo = {
      landSize: sizeMultiplier.label,
      multiplier: sizeMultiplier.multiplier,
      note: `Quantities shown are ${sizeMultiplier.label}. Adjust based on soil test results.`,
    };
    
    return NextResponse.json({
      success: true,
      recommendations: products.slice(0, 4),
      tips: allTips,
      dosageInfo,
      farmProfile: {
        crop,
        soil,
        season,
        landSize,
      },
    });
    
  } catch (error) {
    return createErrorResponse(error, 'Failed to generate recommendations');
  }
}

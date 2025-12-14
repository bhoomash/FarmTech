const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

// Define Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true, enum: ['Fertilizer', 'Seeds', 'Pesticides', 'Tools'] },
  stock: { type: Number, required: true, default: 0 },
  discount: { type: Number, default: 0 },
  image: { type: String }
}, { timestamps: true });

// Define User Schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' }
}, { timestamps: true });

// Create models
const Product = mongoose.models.Product || mongoose.model('Product', productSchema);
const User = mongoose.models.User || mongoose.model('User', userSchema);

const products = [
  // Fertilizers
  {
    name: 'Organic NPK Fertilizer 19-19-19',
    description: 'Premium organic NPK fertilizer with balanced nutrients for all crops. Promotes healthy plant growth and increases yield.',
    price: 850,
    category: 'Fertilizer',
    stock: 150,
    discount: 15,
    image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop'
  },
  {
    name: 'Urea Fertilizer - 50kg',
    description: 'High-quality urea fertilizer with 46% nitrogen content. Ideal for rapid plant growth and green foliage.',
    price: 1200,
    category: 'Fertilizer',
    stock: 200,
    discount: 10,
    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&h=300&fit=crop'
  },
  {
    name: 'DAP Fertilizer - 50kg',
    description: 'Di-Ammonium Phosphate fertilizer perfect for root development and early plant growth.',
    price: 1450,
    category: 'Fertilizer',
    stock: 180,
    discount: 12,
    image: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=400&h=300&fit=crop'
  },
  {
    name: 'Potash Fertilizer - MOP',
    description: 'Muriate of Potash fertilizer for improved fruit quality and disease resistance.',
    price: 980,
    category: 'Fertilizer',
    stock: 120,
    discount: 8,
    image: 'https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?w=400&h=300&fit=crop'
  },
  {
    name: 'Vermicompost Organic Manure',
    description: '100% organic vermicompost enriched with beneficial microorganisms for soil health.',
    price: 450,
    category: 'Fertilizer',
    stock: 300,
    discount: 20,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop'
  },

  // Seeds
  {
    name: 'Hybrid Tomato Seeds - 100g',
    description: 'High-yielding hybrid tomato seeds with disease resistance. Perfect for commercial farming.',
    price: 350,
    category: 'Seeds',
    stock: 250,
    discount: 15,
    image: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=400&h=300&fit=crop'
  },
  {
    name: 'Wheat Seeds - HI-1544',
    description: 'Premium wheat variety with high yield potential and drought tolerance.',
    price: 2800,
    category: 'Seeds',
    stock: 100,
    discount: 5,
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=300&fit=crop'
  },
  {
    name: 'Corn/Maize Hybrid Seeds',
    description: 'High-quality hybrid maize seeds with excellent germination rate and yield.',
    price: 1200,
    category: 'Seeds',
    stock: 180,
    discount: 10,
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=300&fit=crop'
  },
  {
    name: 'Chilli Seeds - Hot Variety',
    description: 'Premium hot chilli seeds with high spice content and excellent market value.',
    price: 280,
    category: 'Seeds',
    stock: 200,
    discount: 12,
    image: 'https://images.unsplash.com/photo-1583663848850-46af76e88513?w=400&h=300&fit=crop'
  },
  {
    name: 'Sunflower Seeds - Hybrid',
    description: 'High oil content sunflower seeds perfect for commercial oil production.',
    price: 850,
    category: 'Seeds',
    stock: 150,
    discount: 8,
    image: 'https://images.unsplash.com/photo-1597848212624-e530d05f5d4d?w=400&h=300&fit=crop'
  },

  // Pesticides
  {
    name: 'Cypermethrin Insecticide - 1L',
    description: 'Effective broad-spectrum insecticide for controlling various pests on crops.',
    price: 650,
    category: 'Pesticides',
    stock: 140,
    discount: 10,
    image: 'https://images.unsplash.com/photo-1601002094377-cdb8b8c6c522?w=400&h=300&fit=crop'
  },
  {
    name: 'Neem Oil Organic Pesticide',
    description: '100% natural neem oil pesticide. Safe for organic farming and environment-friendly.',
    price: 420,
    category: 'Pesticides',
    stock: 220,
    discount: 15,
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400&h=300&fit=crop'
  },
  {
    name: 'Mancozeb Fungicide - 500g',
    description: 'Powerful fungicide for controlling fungal diseases in various crops.',
    price: 380,
    category: 'Pesticides',
    stock: 180,
    discount: 8,
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=400&h=300&fit=crop'
  },
  {
    name: 'Glyphosate Herbicide - 1L',
    description: 'Non-selective herbicide for effective weed control in agricultural fields.',
    price: 550,
    category: 'Pesticides',
    stock: 160,
    discount: 12,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop'
  },
  {
    name: 'Bio Larvicide - Organic',
    description: 'Biological larvicide for mosquito and pest larvae control. Safe and eco-friendly.',
    price: 320,
    category: 'Pesticides',
    stock: 200,
    discount: 10,
    image: 'https://images.unsplash.com/photo-1416339442236-8ceb164046f8?w=400&h=300&fit=crop'
  },

  // Tools
  {
    name: 'Garden Spade - Heavy Duty',
    description: 'Professional-grade garden spade with steel blade and ergonomic wooden handle.',
    price: 450,
    category: 'Tools',
    stock: 85,
    discount: 15,
    image: 'https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?w=400&h=300&fit=crop'
  },
  {
    name: 'Agricultural Sprayer - 16L',
    description: '16-liter manual sprayer with adjustable nozzle for pesticide and fertilizer application.',
    price: 1250,
    category: 'Tools',
    stock: 60,
    discount: 10,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop'
  },
  {
    name: 'Hand Cultivator - 3 Prong',
    description: 'Durable 3-prong hand cultivator for soil preparation and weeding.',
    price: 280,
    category: 'Tools',
    stock: 120,
    discount: 8,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop'
  },
  {
    name: 'Pruning Shears - Professional',
    description: 'Sharp stainless steel pruning shears for clean cuts on plants and branches.',
    price: 680,
    category: 'Tools',
    stock: 95,
    discount: 12,
    image: 'https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?w=400&h=300&fit=crop'
  },
  {
    name: 'Garden Rake - Steel',
    description: 'Heavy-duty steel garden rake with 14 teeth for efficient soil leveling.',
    price: 520,
    category: 'Tools',
    stock: 75,
    discount: 10,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop'
  },
  {
    name: 'Watering Can - 10L',
    description: 'Large capacity watering can with long spout for easy plant watering.',
    price: 350,
    category: 'Tools',
    stock: 110,
    discount: 5,
    image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=400&h=300&fit=crop'
  },
  {
    name: 'Garden Hoe - Traditional',
    description: 'Traditional garden hoe with sharp blade for weeding and soil cultivation.',
    price: 380,
    category: 'Tools',
    stock: 100,
    discount: 8,
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop'
  },
  {
    name: 'Soil pH Meter - Digital',
    description: 'Digital soil pH meter for accurate soil testing. Essential for optimal crop growth.',
    price: 890,
    category: 'Tools',
    stock: 50,
    discount: 15,
    image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop'
  },
  {
    name: 'Garden Gloves - Leather',
    description: 'Premium leather garden gloves for hand protection during farming activities.',
    price: 220,
    category: 'Tools',
    stock: 150,
    discount: 10,
    image: 'https://images.unsplash.com/photo-1588093815462-d0f07d255c1b?w=400&h=300&fit=crop'
  },
  {
    name: 'Wheelbarrow - Heavy Duty',
    description: 'Industrial-grade wheelbarrow with 100kg capacity for farm material transport.',
    price: 2850,
    category: 'Tools',
    stock: 35,
    discount: 12,
    image: 'https://images.unsplash.com/photo-1617576683096-00fc8eecb3af?w=400&h=300&fit=crop'
  }
];

const seedUsers = [
  {
    name: 'Admin User',
    email: 'admin@farmtech.com',
    role: 'admin'
  },
  {
    name: 'Test User',
    email: 'test@farmtech.com',
    role: 'user'
  }
];

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...\n');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB\n');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await Product.deleteMany({});
    await User.deleteMany({});
    console.log('✅ Existing data cleared\n');

    // Seed Products
    console.log('📦 Seeding products...');
    const createdProducts = await Product.insertMany(products);
    console.log(`✅ Created ${createdProducts.length} products\n`);

    // Display products by category
    const categories = ['Fertilizer', 'Seeds', 'Pesticides', 'Tools'];
    categories.forEach(category => {
      const count = createdProducts.filter(p => p.category === category).length;
      console.log(`   - ${category}: ${count} products`);
    });

    // Seed Users
    console.log('\n👥 Seeding users...');
    const createdUsers = await User.insertMany(seedUsers);
    console.log(`✅ Created ${createdUsers.length} users\n`);

    createdUsers.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - Role: ${user.role}`);
    });

    console.log('\n✨ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   Total Products: ${createdProducts.length}`);
    console.log(`   Total Users: ${createdUsers.length}`);
    console.log('\n💡 Test Credentials:');
    console.log(`   Admin: admin@farmtech.com`);
    console.log(`   User: test@farmtech.com`);
    console.log('\n   Note: Use OTP authentication to login\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seedDatabase();

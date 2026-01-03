'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { FaTimes, FaSeedling, FaCloudSun, FaLeaf } from 'react-icons/fa';
import { GiFarmTractor, GiChemicalDrop, GiWheat, GiPlantSeed } from 'react-icons/gi';
import { IoSend } from 'react-icons/io5';
import { RiRestartLine, RiPlantLine } from 'react-icons/ri';
import Link from 'next/link';

// Unique ID generator
let messageIdCounter = 0;
const generateUniqueId = () => {
  messageIdCounter += 1;
  return `msg_${Date.now()}_${messageIdCounter}_${Math.random().toString(36).substr(2, 9)}`;
};

const INITIAL_MESSAGE = {
  id: 'initial_welcome',
  type: 'bot',
  text: "Hello! I'm your FarmTech AI Assistant.\n\nI can help you with:\n• Product recommendations for your crop\n• Fertilizer & pesticide dosage\n• Pest & disease solutions\n• Seasonal farming tips\n\nHow can I assist you today?",
  options: [
    { id: 'crop', label: 'Crop recommendation', icon: FaSeedling },
    { id: 'problem', label: 'Pest/Disease help', icon: GiChemicalDrop },
    { id: 'season', label: 'Seasonal advice', icon: FaCloudSun },
    { id: 'browse', label: 'Browse products', icon: GiFarmTractor },
  ],
};

const CROP_TYPES = [
  { id: 'rice', label: 'Rice/Paddy' },
  { id: 'wheat', label: 'Wheat' },
  { id: 'vegetables', label: 'Vegetables' },
  { id: 'fruits', label: 'Fruits' },
  { id: 'cotton', label: 'Cotton' },
  { id: 'sugarcane', label: 'Sugarcane' },
  { id: 'pulses', label: 'Pulses/Lentils' },
  { id: 'other', label: 'Other crops' },
];

const SOIL_TYPES = [
  { id: 'clay', label: 'Clay soil' },
  { id: 'sandy', label: 'Sandy soil' },
  { id: 'loamy', label: 'Loamy soil' },
  { id: 'black', label: 'Black soil' },
  { id: 'red', label: 'Red soil' },
  { id: 'unknown', label: 'Not sure' },
];

const SEASONS = [
  { id: 'kharif', label: 'Kharif (Monsoon - Jun-Oct)' },
  { id: 'rabi', label: 'Rabi (Winter - Oct-Mar)' },
  { id: 'zaid', label: 'Zaid (Summer - Mar-Jun)' },
];

const LAND_SIZES = [
  { id: 'small', label: 'Small (< 1 acre)' },
  { id: 'medium', label: 'Medium (1-5 acres)' },
  { id: 'large', label: 'Large (5-20 acres)' },
  { id: 'commercial', label: 'Commercial (> 20 acres)' },
];

export default function FarmAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationState, setConversationState] = useState({
    step: 'initial',
    crop: null,
    soil: null,
    season: null,
    landSize: null,
    location: null,
  });
  const [recommendations, setRecommendations] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const addBotMessage = useCallback((text, options = null, products = null) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: generateUniqueId(),
          type: 'bot',
          text,
          options,
          products,
        },
      ]);
      setIsTyping(false);
    }, 800);
  }, []);

  const addUserMessage = useCallback((text) => {
    setMessages((prev) => [
      ...prev,
      {
        id: generateUniqueId(),
        type: 'user',
        text,
      },
    ]);
  }, []);

  const handleOptionClick = async (optionId, optionLabel) => {
    addUserMessage(optionLabel);

    switch (conversationState.step) {
      case 'initial':
        handleInitialChoice(optionId);
        break;
      case 'crop_selection':
        handleCropSelection(optionId, optionLabel);
        break;
      case 'dosage_crop_selection':
        handleDosageCropSelection(optionId, optionLabel);
        break;
      case 'soil_selection':
        handleSoilSelection(optionId, optionLabel);
        break;
      case 'season_selection':
        handleSeasonSelection(optionId, optionLabel);
        break;
      case 'land_size':
        handleLandSizeSelection(optionId, optionLabel);
        break;
      default:
        break;
    }
  };

  const handleInitialChoice = (choice) => {
    switch (choice) {
      case 'crop':
        setConversationState((prev) => ({ ...prev, step: 'crop_selection' }));
        addBotMessage(
          "Great choice! Which crop do you need help with?\n\nSelect your crop:",
          CROP_TYPES
        );
        break;
      case 'soil':
        setConversationState((prev) => ({ ...prev, step: 'soil_selection' }));
        addBotMessage(
          "Knowing your soil helps me recommend the right products!\n\nWhat type of soil do you have?",
          SOIL_TYPES
        );
        break;
      case 'problem':
        addBotMessage(
          "I'll help you solve it!\n\nPlease tell me:\n1. Which crop is affected?\n2. What symptoms are you seeing?\n   - Yellowing leaves?\n   - Spots on leaves?\n   - Visible insects?\n   - Wilting plants?\n\nDescribe your problem:",
          null
        );
        break;
      case 'season':
        setConversationState((prev) => ({ ...prev, step: 'season_selection' }));
        addBotMessage(
          "Smart planning! Which season are you preparing for?",
          SEASONS
        );
        break;
      case 'browse':
        addBotMessage(
          "Explore our product categories:\n\n**Fertilizers** - Boost crop growth\n**Seeds** - Certified quality seeds\n**Pesticides** - Protect your crops\n**Tools** - Farming equipment\n\nWhat would you like to explore?",
          [
            { id: 'list_seeds', label: 'Seeds' },
            { id: 'list_fertilizers', label: 'Fertilizers' },
            { id: 'list_pesticides', label: 'Pesticides' },
            { id: 'list_tools', label: 'Tools' },
            { id: 'products', label: 'View All Products' },
          ]
        );
        break;
      case 'products':
        window.location.href = '/products';
        break;
      case 'restart':
        resetConversation();
        break;
      case 'dosage':
        setConversationState((prev) => ({ ...prev, step: 'dosage_crop_selection' }));
        addBotMessage(
          "**Dosage Guidelines (per acre):**\n\n- **Urea**: 100-130 kg\n- **DAP**: 50-75 kg\n- **NPK**: 100-150 kg\n- **MOP**: 30-50 kg\n\nNote: Adjust based on soil test results!\n\nWhich crop's dosage do you need?",
          CROP_TYPES
        );
        break;
      case 'list_seeds':
      case 'list_fertilizers':
      case 'list_pesticides':
      case 'list_tools':
        handleCategoryList(choice);
        break;
    }
  };

  const handleCategoryList = async (categoryChoice) => {
    const categoryMap = {
      'list_seeds': 'Seeds',
      'list_fertilizers': 'Fertilizer',
      'list_pesticides': 'Pesticides',
      'list_tools': 'Tools',
    };
    const category = categoryMap[categoryChoice];
    
    setIsTyping(true);
    try {
      // Fetch products directly from products API
      const response = await fetch(`/api/products?category=${category}`);
      const data = await response.json();
      setIsTyping(false);
      
      if (data.success && data.data && data.data.length > 0) {
        const products = data.data.slice(0, 6);
        const categoryEmoji = {
          'Seeds': '',
          'Fertilizer': '',
          'Pesticides': '',
          'Tools': ''
        };
        
        addBotMessage(
          `**${category} Products:**\n\nHere are our available ${category.toLowerCase()}. Click on any product to view details!`,
          [
            { id: 'crop', label: 'Get Recommendations' },
            { id: 'restart', label: 'Start Over' },
          ],
          products
        );
      } else {
        addBotMessage(
          `Sorry, no ${category} available right now. Please check back later!`,
          [
            { id: 'browse', label: 'Browse Other Products' },
            { id: 'restart', label: 'Start Over' },
          ]
        );
      }
    } catch (error) {
      setIsTyping(false);
      addBotMessage("Sorry, couldn't load products. Please try again.", [
        { id: 'browse', label: 'Browse Products' },
      ]);
    }
  };

  const handleCropSelection = (cropId, cropLabel) => {
    setConversationState((prev) => ({ ...prev, crop: cropId, step: 'soil_selection' }));
    addBotMessage(
      `Excellent! ${cropLabel} is a great choice!\n\nNow, what type of soil do you have? This helps me recommend the right fertilizers.`,
      SOIL_TYPES
    );
  };

  const handleDosageCropSelection = (cropId, cropLabel) => {
    const dosageInfo = {
      rice: "**Rice/Paddy Dosage (per acre):**\n\n- **Urea**: 40-50 kg (in 2-3 splits)\n- **DAP**: 50 kg (at transplanting)\n- **MOP**: 25-30 kg\n- **Zinc Sulphate**: 10 kg\n\n**Application Schedule:**\n- Basal: DAP + half MOP\n- 21 days: 1/3 Urea\n- 42 days: 1/3 Urea\n- Panicle stage: 1/3 Urea + half MOP",
      wheat: "**Wheat Dosage (per acre):**\n\n- **Urea**: 55 kg (in 2 splits)\n- **DAP**: 50 kg (at sowing)\n- **MOP**: 20 kg\n\n**Application Schedule:**\n- Basal: All DAP + MOP\n- 21 days (1st irrigation): Half Urea\n- 45 days: Half Urea",
      vegetables: "**Vegetable Dosage (per acre):**\n\n- **NPK 19:19:19**: 50 kg\n- **Urea**: 30-40 kg\n- **DAP**: 30 kg\n- **Organic manure**: 2-3 tonnes\n\n**Tip:** Use drip fertigation for best results!",
      fruits: "**Fruit Tree Dosage (per tree/year):**\n\n- **NPK**: 2-5 kg (based on tree age)\n- **Organic manure**: 20-40 kg\n- **Micronutrients**: As per deficiency\n\nApply in 2 splits: Before flowering & after fruit set",
      banana: "**Banana Dosage (per plant):**\n\n- **Urea**: 200g (in 4 splits)\n- **MOP**: 300g (in 4 splits)\n- **DAP**: 100g\n\n**Application Schedule:**\n- Planting: DAP\n- 2, 4, 6, 8 months: Urea + MOP splits",
      cotton: "**Cotton Dosage (per acre):**\n\n- **Urea**: 55 kg (in 3 splits)\n- **DAP**: 50 kg\n- **MOP**: 30 kg\n\nSplit Urea at sowing, 30 days, and 60 days",
      sugarcane: "**Sugarcane Dosage (per acre):**\n\n- **Urea**: 100-130 kg (in 3-4 splits)\n- **DAP**: 75 kg\n- **MOP**: 50 kg\n\nApply Urea after each irrigation",
      pulses: "**Pulses Dosage (per acre):**\n\n- **DAP**: 40 kg (at sowing)\n- **Urea**: 10 kg (if needed)\n\n**Tip:** Use Rhizobium seed treatment - reduces fertilizer need!",
      maize: "**Maize Dosage (per acre):**\n\n- **Urea**: 65 kg (in 2 splits)\n- **DAP**: 50 kg\n- **MOP**: 20 kg\n\nApply at sowing and knee-high stage",
      other: "**General Dosage (per acre):**\n\n- **NPK 10:26:26**: 50 kg (basal)\n- **Urea**: 40-50 kg (top dressing)\n\nGet a soil test for precise recommendations!"
    };

    const info = dosageInfo[cropId] || dosageInfo.other;
    setConversationState((prev) => ({ ...prev, step: 'initial' }));
    
    addBotMessage(
      info,
      [
        { id: 'browse', label: 'Buy Fertilizers' },
        { id: 'crop', label: 'Crop Recommendation' },
        { id: 'restart', label: 'Start Over' },
      ]
    );
  };

  const handleSoilSelection = (soilId, soilLabel) => {
    setConversationState((prev) => ({ ...prev, soil: soilId, step: 'season_selection' }));
    addBotMessage(
      `Got it! ${soilLabel} noted.\n\nWhich growing season are you preparing for?`,
      SEASONS
    );
  };

  const handleSeasonSelection = (seasonId, seasonLabel) => {
    setConversationState((prev) => ({ ...prev, season: seasonId, step: 'land_size' }));
    addBotMessage(
      `${seasonLabel} - perfect timing!\n\nLastly, what's the size of your farmland? This helps me suggest the right quantities.`,
      LAND_SIZES
    );
  };

  const handleLandSizeSelection = async (sizeId, sizeLabel) => {
    const newState = { ...conversationState, landSize: sizeId, step: 'recommendations' };
    setConversationState(newState);

    addUserMessage(sizeLabel);
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop: newState.crop,
          soil: newState.soil,
          season: newState.season,
          landSize: sizeId,
        }),
      });

      const data = await response.json();
      setIsTyping(false);

      if (data.success) {
        const recommendations = data.recommendations || [];
        setRecommendations(recommendations);
        
        const recommendationText = generateRecommendationText(newState, data, recommendations.length);
        
        setMessages((prev) => [
          ...prev,
          {
            id: generateUniqueId(),
            type: 'bot',
            text: recommendationText,
            products: recommendations,
            tips: data.tips,
          },
        ]);

        setTimeout(() => {
          addBotMessage(
            "Would you like me to help with anything else?",
            [
              { id: 'crop', label: 'Different crop' },
              { id: 'dosage', label: 'Dosage info' },
              { id: 'browse', label: 'Browse all products' },
              { id: 'restart', label: 'Start over' },
            ]
          );
          setConversationState((prev) => ({ ...prev, step: 'initial' }));
        }, 1500);
      }
    } catch (error) {
      setIsTyping(false);
      addBotMessage(
        "I apologize, but I couldn't fetch recommendations at the moment. Please try browsing our products directly or try again later.",
        [
          { id: 'browse', label: 'Browse Products' },
          { id: 'restart', label: 'Start Over' },
        ]
      );
    }
  };

  const generateRecommendationText = (state, data, productCount = 0) => {
    const cropNames = {
      rice: 'Rice/Paddy', wheat: 'Wheat', vegetables: 'Vegetables',
      fruits: 'Fruits', cotton: 'Cotton', sugarcane: 'Sugarcane',
      pulses: 'Pulses', other: 'your crops'
    };
    
    const seasonNames = {
      kharif: 'Kharif (Monsoon)', rabi: 'Rabi (Winter)', zaid: 'Zaid (Summer)'
    };

    const productSection = productCount > 0 
      ? 'Based on your needs, I recommend the following products:'
      : 'No specific products found in stock for your requirements, but here are some general tips:';

    return `**Perfect! Here are my recommendations for you:**

**Your Farm Profile:**
- Crop: ${cropNames[state.crop] || state.crop}
- Season: ${seasonNames[state.season] || state.season}
- Land Size: ${state.landSize}

${productSection}`;
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    addUserMessage(userMessage);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context: conversationState,
        }),
      });

      const data = await response.json();
      setIsTyping(false);

      if (data.success) {
        addBotMessage(data.response, data.options || null, data.products || null);
        
        // Update context with returned context (for follow-up questions)
        if (data.context) {
          setConversationState((prev) => ({ ...prev, ...data.context }));
        }
      } else {
        addBotMessage(
          "I'm not sure I understood that. Let me help you with some options:",
          INITIAL_MESSAGE.options
        );
      }
    } catch (error) {
      setIsTyping(false);
      addBotMessage(
        "Sorry, I'm having trouble connecting. Please try again or choose an option below:",
        INITIAL_MESSAGE.options
      );
    }
  };

  const resetConversation = () => {
    setMessages([INITIAL_MESSAGE]);
    setConversationState({
      step: 'initial',
      crop: null,
      soil: null,
      season: null,
      landSize: null,
      location: null,
    });
    setRecommendations([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button - Farm Style */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-xl ${
          isOpen 
            ? 'bg-neutral-700 hover:bg-neutral-600' 
            : 'bg-green-600 hover:bg-green-500'
        }`}
        aria-label={isOpen ? 'Close chat' : 'Open Farm Assistant'}
      >
        {isOpen ? (
          <FaTimes className="text-white text-xl" />
        ) : (
          <GiWheat className="text-white text-2xl" />
        )}
      </button>

      {/* Chat Window - Clean Design */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[580px] max-h-[calc(100vh-8rem)] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-neutral-200 animate-slideUp">
          {/* Header - Clean White Style */}
          <div className="bg-white border-b border-neutral-100 px-5 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                  <GiWheat className="text-xl text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-base text-neutral-800 tracking-tight">FarmTech Assistant</h3>
                  <p className="text-neutral-400 text-xs flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Online
                  </p>
                </div>
              </div>
              <button
                onClick={resetConversation}
                className="p-2 hover:bg-neutral-100 rounded-xl transition-colors"
                title="Reset conversation"
              >
                <RiRestartLine className="text-lg text-neutral-400 hover:text-neutral-600" />
              </button>
            </div>
          </div>

          {/* Messages Container - Clean Background */}
          <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 bg-neutral-50">
            {messages.map((message) => (
              <div key={message.id}>
                {/* Message Bubble */}
                <div
                  className={`flex gap-2.5 ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {/* Bot Avatar */}
                  {message.type === 'bot' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center">
                      <FaLeaf className="text-green-600 text-sm" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] px-4 py-3 ${
                      message.type === 'user'
                        ? 'bg-green-600 text-white rounded-2xl rounded-br-md shadow-sm'
                        : 'bg-white text-neutral-700 shadow-sm border border-neutral-100 rounded-2xl rounded-tl-md'
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-[13px] leading-relaxed font-normal">
                      {message.text}
                    </p>
                  </div>
                  
                  {/* User Avatar */}
                  {message.type === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-neutral-200 flex items-center justify-center">
                      <span className="text-neutral-600 text-xs font-semibold">You</span>
                    </div>
                  )}
                </div>

                {/* Product Cards - Modern Style */}
                {message.products && message.products.length > 0 && (
                  <div className="mt-3 ml-10 space-y-2">
                    {message.products.map((product) => (
                      <Link
                        key={product._id || product.id}
                        href={`/products/${product._id || product.id}`}
                        className="block bg-white rounded-2xl p-3 border border-neutral-100 hover:border-green-200 hover:shadow-md transition-all group"
                      >
                        <div className="flex gap-3">
                          <img
                            src={product.image || '/placeholder-product.jpg'}
                            alt={product.name}
                            className="w-14 h-14 object-cover rounded-xl"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-neutral-800 text-sm truncate group-hover:text-green-600 transition-colors">
                              {product.name}
                            </h4>
                            <p className="text-xs text-neutral-400 mt-0.5">
                              {product.category}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="font-semibold text-green-600 text-sm">
                                ₹{Math.round((product.price || 0) - ((product.price || 0) * (product.discount || 0)) / 100)}
                              </span>
                              {(product.discount || 0) > 0 && (
                                <span className="text-xs text-neutral-300 line-through">
                                  ₹{product.price}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Farming Tips - Modern Card */}
                {message.tips && (
                  <div className="mt-3 ml-10 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-100">
                    <h4 className="font-medium text-emerald-800 text-sm flex items-center gap-2">
                      <FaSeedling className="text-emerald-600" /> Pro Tips
                    </h4>
                    <ul className="mt-2 space-y-1.5">
                      {message.tips.map((tip, index) => (
                        <li key={index} className="text-xs text-emerald-700 flex items-start gap-2">
                          <span className="text-emerald-400">→</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Quick Options - Pill Buttons */}
                {message.options && (
                  <div className="mt-3 ml-10 flex flex-wrap gap-2">
                    {message.options.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleOptionClick(option.id, option.label)}
                        className="px-4 py-2 bg-white border border-neutral-200 text-neutral-600 rounded-full text-xs font-medium hover:bg-green-50 hover:border-green-300 hover:text-green-700 transition-all shadow-sm"
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex gap-2.5 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-green-100 flex items-center justify-center">
                  <FaLeaf className="text-green-600 text-sm" />
                </div>
                <div className="bg-white px-4 py-3 rounded-2xl rounded-tl-md shadow-sm border border-neutral-100">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area - Clean Style */}
          <div className="p-4 bg-white border-t border-neutral-100">
            <div className="flex gap-2 items-center bg-neutral-50 rounded-2xl px-4 py-2 border border-neutral-100 focus-within:border-green-300 focus-within:ring-2 focus-within:ring-green-100 transition-all">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 bg-transparent py-2 focus:outline-none text-sm text-neutral-700 placeholder:text-neutral-400"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isTyping}
                className="p-2.5 bg-green-600 text-white rounded-xl hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md disabled:hover:shadow-sm"
              >
                <IoSend className="text-sm" />
              </button>
            </div>
            <p className="text-[10px] text-neutral-300 mt-2 text-center tracking-wide">
              Powered by FarmTech
            </p>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-slideUp {
          animation: slideUp 0.25s ease-out;
        }
      `}</style>
    </>
  );
}

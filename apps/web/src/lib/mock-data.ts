export interface Agent {
  id: string;
  name: string;
  emoji: string;
  category: string;
  description: string;
  pricePerCall: number;
  rating: number;
  totalCalls: number;
  verified: boolean;
  developer: string;
}

export interface Transaction {
  id: string;
  agentName: string;
  agentEmoji: string;
  amount: number;
  timestamp: string;
  caller: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
  quote: string;
  image: string;
}

export const MOCK_AGENTS: Agent[] = [
  {
    id: "chest-xray",
    name: "Chest X-Ray Analyzer",
    emoji: "🫁",
    category: "Medical AI",
    description: "AI-powered chest X-ray analysis for rapid screening of pulmonary conditions with 96% accuracy.",
    pricePerCall: 0.05,
    rating: 4.8,
    totalCalls: 3420,
    verified: true,
    developer: "MedVision Labs",
  },
  {
    id: "deepfake-detector",
    name: "Deepfake Detector",
    emoji: "🔍",
    category: "Security",
    description: "Detect manipulated images and videos with state-of-the-art forgery detection models.",
    pricePerCall: 0.03,
    rating: 4.6,
    totalCalls: 1890,
    verified: true,
    developer: "TrustAI",
  },
  {
    id: "plant-disease",
    name: "Plant Disease ID",
    emoji: "🌿",
    category: "Agriculture",
    description: "Identify plant diseases from leaf images. Supports 50+ crop types and 200+ conditions.",
    pricePerCall: 0.02,
    rating: 4.9,
    totalCalls: 5670,
    verified: true,
    developer: "AgriSense",
  },
  {
    id: "sentiment-analyzer",
    name: "Sentiment Analyzer",
    emoji: "💬",
    category: "NLP",
    description: "Multi-language sentiment analysis with emotion detection and confidence scoring.",
    pricePerCall: 0.01,
    rating: 4.7,
    totalCalls: 12400,
    verified: true,
    developer: "LangFlow",
  },
  {
    id: "image-captioner",
    name: "Image Captioner",
    emoji: "🖼️",
    category: "Vision",
    description: "Generate detailed, contextually accurate captions for any image. Supports 12 languages.",
    pricePerCall: 0.04,
    rating: 4.5,
    totalCalls: 2100,
    verified: false,
    developer: "PixelMind",
  },
  {
    id: "text-summarizer",
    name: "Text Summarizer",
    emoji: "📝",
    category: "NLP",
    description: "Summarize long documents into concise, actionable briefs. Handles up to 100k tokens.",
    pricePerCall: 0.02,
    rating: 4.8,
    totalCalls: 8900,
    verified: true,
    developer: "BrevityAI",
  },
];

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "tx1", agentName: "Chest X-Ray", agentEmoji: "🫁", amount: 0.05, timestamp: "2 min ago", caller: "0x7a3f...e92d" },
  { id: "tx2", agentName: "Sentiment", agentEmoji: "💬", amount: 0.01, timestamp: "5 min ago", caller: "0x1b2c...f4a1" },
  { id: "tx3", agentName: "Plant ID", agentEmoji: "🌿", amount: 0.02, timestamp: "8 min ago", caller: "0x9d4e...b7c3" },
  { id: "tx4", agentName: "Deepfake", agentEmoji: "🔍", amount: 0.03, timestamp: "12 min ago", caller: "0x5f6a...d2e8" },
  { id: "tx5", agentName: "Summarizer", agentEmoji: "📝", amount: 0.02, timestamp: "15 min ago", caller: "0x3c7b...a1f9" },
  { id: "tx6", agentName: "Captioner", agentEmoji: "🖼️", amount: 0.04, timestamp: "18 min ago", caller: "0x8e2d...c5b4" },
  { id: "tx7", agentName: "Chest X-Ray", agentEmoji: "🫁", amount: 0.05, timestamp: "22 min ago", caller: "0x4a1f...e7d6" },
  { id: "tx8", agentName: "Sentiment", agentEmoji: "💬", amount: 0.01, timestamp: "25 min ago", caller: "0x6b3c...f8a2" },
  { id: "tx9", agentName: "Plant ID", agentEmoji: "🌿", amount: 0.02, timestamp: "30 min ago", caller: "0x2d5e...b9c1" },
  { id: "tx10", agentName: "Deepfake", agentEmoji: "🔍", amount: 0.03, timestamp: "35 min ago", caller: "0x7f8a...d3e5" },
];

export const MOCK_TESTIMONIALS: Testimonial[] = [
  {
    id: "t1",
    name: "Sarah Chen",
    role: "ML Engineer",
    company: "DeepMind",
    avatar: "SC",
    quote: "Stoa made it trivial to monetize our medical imaging model. Five lines of code and we were live.",
    image: "https://randomuser.me/api/portraits/women/1.jpg",
  },
  {
    id: "t2",
    name: "Marcus Rivera",
    role: "CTO",
    company: "AgriTech Solutions",
    avatar: "MR",
    quote: "We switched from a subscription model to pay-per-call on Stoa. Revenue went up 3x because the barrier to entry disappeared.",
    image: "https://randomuser.me/api/portraits/men/2.jpg",
  },
  {
    id: "t3",
    name: "Priya Patel",
    role: "Product Designer",
    company: "Freelance",
    avatar: "PP",
    quote: "I'm not a developer, but I added 3 AI agents to my workflow in under a minute using the Claude integration. Magic.",
    image: "https://randomuser.me/api/portraits/women/3.jpg",
  },
  {
    id: "t4",
    name: "James O'Brien",
    role: "Security Researcher",
    company: "CyberGuard",
    avatar: "JO",
    quote: "The x402 payment protocol is genuinely innovative. Micropayments per API call without any payment infrastructure headaches.",
    image: "https://randomuser.me/api/portraits/men/4.jpg",
  },
  {
    id: "t5",
    name: "Aiko Tanaka",
    role: "Full Stack Developer",
    company: "Startup",
    avatar: "AT",
    quote: "Built and deployed an agent in an afternoon. The SDK is clean, the docs are great, and the marketplace handles everything else.",
    image: "https://randomuser.me/api/portraits/women/5.jpg",
  },
  {
    id: "t6",
    name: "David Kim",
    role: "Data Scientist",
    company: "Research Lab",
    avatar: "DK",
    quote: "Finally a marketplace that treats AI models as first-class API citizens. The developer experience is unmatched.",
    image: "https://randomuser.me/api/portraits/men/6.jpg",
  },
];

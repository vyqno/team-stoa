import { config } from "dotenv";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
config({ path: resolve(__dirname, "../.env") });

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// HuggingFace Space URLs — set these after deploying your services
// Format: https://<your-username>-<space-name>.hf.space
const CHEST_XRAY_URL =
  process.env.CHEST_XRAY_SERVICE_URL ||
  "https://hiteshx33-chest-xray-service.hf.space";

const DIGITAL_TWIN_URL =
  process.env.DIGITAL_TWIN_SERVICE_URL ||
  "https://hiteshx33-digital-twin-agent.hf.space";

// HuggingFace Inference API base (works directly for text models)
const HF_API = "https://api-inference.huggingface.co/models";

// Wallet addresses for service ownership
const WALLET_A = "0x814a3D96C36C45e92159Ce119a82b3250Aa79E5b";
const WALLET_B = "0x1ceC5F57eC0A6f782F736549eBd391ddF3233D8e";

interface ServiceSeed {
  ownerAddress: string;
  name: string;
  description: string;
  capabilities: string[];
  category: string;
  serviceType: string;
  priceUsdcPerCall: number;
  endpointUrl: string;
  inputSchema: Record<string, unknown>;
  outputSchema: Record<string, unknown>;
  webhookUrl?: string;
}

const SERVICES: ServiceSeed[] = [
  // ─── IMAGE MODELS (deployed via FastAPI wrapper on HF Spaces) ───

  // 1. Chest X-Ray Analyzer — deployed as HF Space
  {
    ownerAddress: WALLET_A,
    name: "Chest X-Ray Analyzer",
    description:
      "Detects pneumonia from chest X-ray images using a ViT-based deep learning model trained on the NIH Chest X-ray dataset. Returns diagnosis with confidence scores. Deployed as a real-time inference service.",
    capabilities: [
      "pneumonia detection",
      "chest x-ray analysis",
      "medical imaging",
      "radiology AI",
    ],
    category: "medical",
    serviceType: "ml-model",
    priceUsdcPerCall: 0.05,
    endpointUrl: `${CHEST_XRAY_URL}/predict`,
    inputSchema: {
      type: "object",
      properties: {
        image: {
          type: "string",
          description: "Base64-encoded chest X-ray image (JPEG or PNG)",
        },
      },
      required: ["image"],
    },
    outputSchema: {
      type: "object",
      properties: {
        diagnosis: { type: "string", description: "NORMAL or PNEUMONIA" },
        confidence: { type: "number", description: "Confidence score 0-1" },
        predictions: {
          type: "array",
          items: {
            type: "object",
            properties: {
              label: { type: "string" },
              score: { type: "number" },
            },
          },
        },
        model: { type: "string" },
        latency_ms: { type: "number" },
      },
    },
  },

  // 2. Deepfake Detector
  {
    ownerAddress: WALLET_A,
    name: "Deepfake Detector",
    description:
      "Detects AI-generated or manipulated face images using a fine-tuned deep learning model. Classifies images as real or deepfake with confidence scores.",
    capabilities: [
      "deepfake detection",
      "face analysis",
      "image forensics",
      "AI detection",
    ],
    category: "security",
    serviceType: "ml-model",
    priceUsdcPerCall: 0.03,
    endpointUrl: `${HF_API}/dima806/deepfake_vs_real_image_detection`,
    inputSchema: {
      type: "object",
      properties: {
        image: { type: "string", description: "Base64-encoded face image" },
      },
      required: ["image"],
    },
    outputSchema: {
      type: "object",
      properties: {
        classification: { type: "string", enum: ["real", "deepfake"] },
        confidence: { type: "number" },
      },
    },
  },

  // 3. Plant Disease Identifier
  {
    ownerAddress: WALLET_B,
    name: "Plant Disease Identifier",
    description:
      "Identifies diseases in crop plants from leaf images using MobileNetV2 trained on 50k+ labeled plant disease images. Supports 38+ disease classes.",
    capabilities: [
      "plant disease detection",
      "crop analysis",
      "agriculture AI",
      "leaf disease identification",
    ],
    category: "agriculture",
    serviceType: "ml-model",
    priceUsdcPerCall: 0.02,
    endpointUrl: `${HF_API}/linkanjarad/mobilenet_v2_1.0_224-plant-disease-identification`,
    inputSchema: {
      type: "object",
      properties: {
        image: {
          type: "string",
          description: "Base64-encoded plant/leaf image",
        },
      },
      required: ["image"],
    },
    outputSchema: {
      type: "object",
      properties: {
        disease: { type: "string" },
        plant: { type: "string" },
        confidence: { type: "number" },
      },
    },
  },

  // ─── TEXT MODELS (HuggingFace Inference API — accepts JSON directly) ───

  // 4. Sentiment Analyzer
  {
    ownerAddress: WALLET_B,
    name: "Sentiment Analyzer",
    description:
      "Analyzes text sentiment in multiple languages using XLM-RoBERTa. Returns positive, negative, or neutral classification with scores.",
    capabilities: [
      "sentiment analysis",
      "text classification",
      "multilingual NLP",
      "opinion mining",
    ],
    category: "data",
    serviceType: "ml-model",
    priceUsdcPerCall: 0.005,
    endpointUrl: `${HF_API}/cardiffnlp/twitter-xlm-roberta-base-sentiment-multilingual`,
    inputSchema: {
      type: "object",
      properties: {
        inputs: { type: "string", description: "Text to analyze (any language)" },
      },
      required: ["inputs"],
    },
    outputSchema: {
      type: "object",
      properties: {
        sentiment: {
          type: "string",
          enum: ["positive", "negative", "neutral"],
        },
        scores: { type: "object" },
      },
    },
  },

  // 5. Text Summarizer
  {
    ownerAddress: WALLET_A,
    name: "Text Summarizer",
    description:
      "Generates concise summaries of long text using Facebook's BART-Large-CNN model. Trained on CNN/DailyMail articles for high-quality abstractive summarization.",
    capabilities: [
      "text summarization",
      "abstractive summarization",
      "document condensation",
      "NLP",
    ],
    category: "data",
    serviceType: "ml-model",
    priceUsdcPerCall: 0.008,
    endpointUrl: `${HF_API}/facebook/bart-large-cnn`,
    inputSchema: {
      type: "object",
      properties: {
        inputs: { type: "string", description: "Text to summarize" },
        parameters: {
          type: "object",
          properties: {
            max_length: {
              type: "number",
              description: "Maximum summary length",
            },
            min_length: {
              type: "number",
              description: "Minimum summary length",
            },
          },
        },
      },
      required: ["inputs"],
    },
    outputSchema: {
      type: "object",
      properties: {
        summary_text: { type: "string" },
      },
    },
  },

  // 6. Object Detector
  {
    ownerAddress: WALLET_B,
    name: "Object Detector",
    description:
      "Detects and localizes objects in images using Facebook's DETR (Detection Transformer) with ResNet-50 backbone. Returns bounding boxes with labels and confidence scores for 91 COCO object categories.",
    capabilities: [
      "object detection",
      "image analysis",
      "bounding box prediction",
      "computer vision",
    ],
    category: "research",
    serviceType: "ml-model",
    priceUsdcPerCall: 0.01,
    endpointUrl: `${HF_API}/facebook/detr-resnet-50`,
    inputSchema: {
      type: "object",
      properties: {
        image: { type: "string", description: "Base64-encoded image" },
      },
      required: ["image"],
    },
    outputSchema: {
      type: "object",
      properties: {
        detections: {
          type: "array",
          items: {
            type: "object",
            properties: {
              label: { type: "string" },
              confidence: { type: "number" },
              box: { type: "object" },
            },
          },
        },
      },
    },
  },

  // 7. Zero-Shot Classifier
  {
    ownerAddress: WALLET_A,
    name: "Zero-Shot Classifier",
    description:
      "Classifies text into any set of user-defined categories without training. Uses Facebook's BART-Large-MNLI for natural language inference. Perfect for content moderation, topic tagging, and intent detection.",
    capabilities: [
      "zero-shot classification",
      "text classification",
      "intent detection",
      "content categorization",
    ],
    category: "data",
    serviceType: "api-tool",
    priceUsdcPerCall: 0.005,
    endpointUrl: `${HF_API}/facebook/bart-large-mnli`,
    inputSchema: {
      type: "object",
      properties: {
        inputs: { type: "string", description: "Text to classify" },
        parameters: {
          type: "object",
          properties: {
            candidate_labels: {
              type: "array",
              items: { type: "string" },
              description: "Labels to classify against",
            },
            multi_label: {
              type: "boolean",
              description: "Allow multiple labels",
            },
          },
          required: ["candidate_labels"],
        },
      },
      required: ["inputs", "parameters"],
    },
    outputSchema: {
      type: "object",
      properties: {
        sequence: { type: "string" },
        labels: { type: "array", items: { type: "string" } },
        scores: { type: "array", items: { type: "number" } },
      },
    },
  },

  // 8. Digital Twin Agent — deployed as HF Space
  {
    ownerAddress: WALLET_A,
    name: "Hitesh's Digital Twin",
    description:
      "An AI agent that represents Hitesh — a builder, hackathon enthusiast, and full-stack developer. Ask questions about web3 development, AI agents, hackathon tips, career advice, and startup building. Powered by Llama 3.3 70B via Groq.",
    capabilities: [
      "personalized advice",
      "career guidance",
      "web3 expertise",
      "hackathon tips",
      "AI agent development",
    ],
    category: "creative",
    serviceType: "ai-agent",
    priceUsdcPerCall: 0.05,
    endpointUrl: `${DIGITAL_TWIN_URL}/ask`,
    inputSchema: {
      type: "object",
      properties: {
        question: {
          type: "string",
          description: "Question to ask the digital twin",
        },
        context: {
          type: "string",
          description: "Optional context about yourself",
        },
      },
      required: ["question"],
    },
    outputSchema: {
      type: "object",
      properties: {
        answer: { type: "string" },
        confidence: { type: "number" },
        topics: { type: "array", items: { type: "string" } },
        twin_name: { type: "string" },
      },
    },
  },
];

async function seed() {
  console.log(`\nSeeding ${SERVICES.length} services to ${API_URL}...\n`);
  console.log(`Wallet A: ${WALLET_A}`);
  console.log(`Wallet B: ${WALLET_B}`);
  console.log(`Chest X-Ray URL: ${CHEST_XRAY_URL}`);
  console.log(`Digital Twin URL: ${DIGITAL_TWIN_URL}\n`);

  let ok = 0;
  let fail = 0;

  for (const service of SERVICES) {
    try {
      const res = await fetch(`${API_URL}/api/services`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(service),
      });

      if (!res.ok) {
        const error = await res.text();
        console.error(
          `  FAIL: ${service.name} [${service.serviceType}] — ${res.status}: ${error}`,
        );
        fail++;
        continue;
      }

      const data = (await res.json()) as { service: { id: string } };
      console.log(
        `  OK: ${service.name} [${service.serviceType}] — ID: ${data.service.id}`,
      );
      ok++;
    } catch (err) {
      console.error(`  ERROR: ${service.name} — ${err}`);
      fail++;
    }
  }

  console.log(`\nSeed complete: ${ok} succeeded, ${fail} failed.\n`);
}

seed().catch(console.error);

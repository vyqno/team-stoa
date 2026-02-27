const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Real, verified-working endpoints
const CHEST_XRAY_URL = "https://hiteshx33-chest-xray-service.hf.space";
const HF_ROUTER = "https://router.huggingface.co/hf-inference/models";

const WALLET_A = "0x814a3D96C36C45e92159Ce119a82b3250Aa79E5b";

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
}

const SERVICES: ServiceSeed[] = [
  // 1. Chest X-Ray Analyzer — runs locally on HF Spaces (verified working)
  {
    ownerAddress: WALLET_A,
    name: "Chest X-Ray Analyzer",
    description:
      "Detects pneumonia from chest X-ray images using a ViT-based deep learning model. Returns diagnosis (NORMAL/PNEUMONIA) with confidence scores. Model runs on HuggingFace Spaces.",
    capabilities: [
      "pneumonia detection",
      "chest x-ray analysis",
      "medical imaging",
      "radiology AI",
    ],
    category: "medical",
    serviceType: "ml-model",
    priceUsdcPerCall: 0,
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
        confidence: { type: "number" },
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

  // 2. Sentiment Analyzer — HF Router
  {
    ownerAddress: WALLET_A,
    name: "Sentiment Analyzer",
    description:
      "Analyzes text sentiment in multiple languages using XLM-RoBERTa. Returns positive, negative, or neutral classification with confidence scores. Supports 100+ languages.",
    capabilities: [
      "sentiment analysis",
      "text classification",
      "multilingual NLP",
      "opinion mining",
    ],
    category: "data",
    serviceType: "ml-model",
    priceUsdcPerCall: 0,
    endpointUrl: `${HF_ROUTER}/cardiffnlp/twitter-xlm-roberta-base-sentiment-multilingual`,
    inputSchema: {
      type: "object",
      properties: {
        inputs: { type: "string", description: "Text to analyze (any language)" },
      },
      required: ["inputs"],
    },
    outputSchema: {
      type: "array",
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            label: { type: "string", enum: ["positive", "negative", "neutral"] },
            score: { type: "number" },
          },
        },
      },
    },
  },

  // 3. Text Summarizer — HF Router
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
    priceUsdcPerCall: 0,
    endpointUrl: `${HF_ROUTER}/facebook/bart-large-cnn`,
    inputSchema: {
      type: "object",
      properties: {
        inputs: { type: "string", description: "Text to summarize" },
        parameters: {
          type: "object",
          properties: {
            max_length: { type: "number", description: "Maximum summary length" },
            min_length: { type: "number", description: "Minimum summary length" },
          },
        },
      },
      required: ["inputs"],
    },
    outputSchema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          summary_text: { type: "string" },
        },
      },
    },
  },

  // 4. Emotion Detector — detects 7 emotions in text
  {
    ownerAddress: WALLET_A,
    name: "Emotion Detector",
    description:
      "Detects emotions in English text using a fine-tuned DistilRoBERTa model. Classifies into 7 emotions: anger, disgust, fear, joy, neutral, sadness, surprise. Useful for customer feedback analysis and social media monitoring.",
    capabilities: [
      "emotion detection",
      "text classification",
      "affective computing",
      "customer feedback analysis",
    ],
    category: "data",
    serviceType: "ml-model",
    priceUsdcPerCall: 0,
    endpointUrl: `${HF_ROUTER}/j-hartmann/emotion-english-distilroberta-base`,
    inputSchema: {
      type: "object",
      properties: {
        inputs: { type: "string", description: "English text to analyze for emotions" },
      },
      required: ["inputs"],
    },
    outputSchema: {
      type: "array",
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            label: { type: "string", enum: ["anger", "disgust", "fear", "joy", "neutral", "sadness", "surprise"] },
            score: { type: "number" },
          },
        },
      },
    },
  },

  // 5. Named Entity Recognizer — extracts people, orgs, locations from text
  {
    ownerAddress: WALLET_A,
    name: "Named Entity Recognizer",
    description:
      "Extracts named entities (people, organizations, locations, miscellaneous) from English text using BERT-base-NER. Essential for information extraction, document processing, and knowledge graph construction.",
    capabilities: [
      "named entity recognition",
      "information extraction",
      "NER",
      "text analysis",
    ],
    category: "data",
    serviceType: "ml-model",
    priceUsdcPerCall: 0,
    endpointUrl: `${HF_ROUTER}/dslim/bert-base-NER`,
    inputSchema: {
      type: "object",
      properties: {
        inputs: { type: "string", description: "Text to extract entities from (e.g. 'John works at Google in New York')" },
      },
      required: ["inputs"],
    },
    outputSchema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          entity_group: { type: "string", description: "PER (person), ORG (organization), LOC (location), MISC" },
          word: { type: "string" },
          score: { type: "number" },
          start: { type: "number" },
          end: { type: "number" },
        },
      },
    },
  },

  // 6. Zero-Shot Text Classifier — classify text into ANY categories
  {
    ownerAddress: WALLET_A,
    name: "Zero-Shot Text Classifier",
    description:
      "Classifies text into arbitrary categories without training data using Facebook's BART-Large-MNLI. Provide any set of labels and it scores how well the text matches each. Perfect for dynamic categorization, intent detection, and topic routing.",
    capabilities: [
      "zero-shot classification",
      "text categorization",
      "intent detection",
      "topic classification",
    ],
    category: "data",
    serviceType: "ml-model",
    priceUsdcPerCall: 0,
    endpointUrl: `${HF_ROUTER}/facebook/bart-large-mnli`,
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
              description: "Labels to classify against (e.g. ['urgent', 'billing', 'technical support'])",
            },
            multi_label: { type: "boolean", description: "Allow multiple labels to be true (default false)" },
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

  // 7. Question Answering Engine — extractive QA from context
  {
    ownerAddress: WALLET_A,
    name: "Question Answering Engine",
    description:
      "Answers questions based on a given context paragraph using RoBERTa fine-tuned on SQuAD2. Extracts the exact answer span from the provided text. Ideal for document search, FAQ systems, and knowledge base querying.",
    capabilities: [
      "question answering",
      "reading comprehension",
      "extractive QA",
      "document search",
    ],
    category: "research",
    serviceType: "ml-model",
    priceUsdcPerCall: 0,
    endpointUrl: `${HF_ROUTER}/deepset/roberta-base-squad2`,
    inputSchema: {
      type: "object",
      properties: {
        inputs: {
          type: "object",
          properties: {
            question: { type: "string", description: "The question to answer" },
            context: { type: "string", description: "The text paragraph containing the answer" },
          },
          required: ["question", "context"],
        },
      },
      required: ["inputs"],
    },
    outputSchema: {
      type: "object",
      properties: {
        answer: { type: "string" },
        score: { type: "number" },
        start: { type: "number" },
        end: { type: "number" },
      },
    },
  },

  // 8. English to French Translator
  {
    ownerAddress: WALLET_A,
    name: "English to French Translator",
    description:
      "Translates English text to French using Helsinki-NLP's OPUS-MT model trained on parallel corpora. Production-grade neural machine translation with high fluency.",
    capabilities: [
      "machine translation",
      "English to French",
      "NLP",
      "language translation",
    ],
    category: "creative",
    serviceType: "ml-model",
    priceUsdcPerCall: 0,
    endpointUrl: `${HF_ROUTER}/Helsinki-NLP/opus-mt-en-fr`,
    inputSchema: {
      type: "object",
      properties: {
        inputs: { type: "string", description: "English text to translate to French" },
      },
      required: ["inputs"],
    },
    outputSchema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          translation_text: { type: "string", description: "Translated French text" },
        },
      },
    },
  },

  // 9. Toxicity Detector — content moderation
  {
    ownerAddress: WALLET_A,
    name: "Toxicity Detector",
    description:
      "Detects toxic, obscene, threatening, and insulting content in text using a fine-tuned BERT model. Essential for content moderation, comment filtering, and community safety. Returns toxicity scores across multiple categories.",
    capabilities: [
      "toxicity detection",
      "content moderation",
      "hate speech detection",
      "online safety",
    ],
    category: "security",
    serviceType: "ml-model",
    priceUsdcPerCall: 0,
    endpointUrl: `${HF_ROUTER}/unitary/toxic-bert`,
    inputSchema: {
      type: "object",
      properties: {
        inputs: { type: "string", description: "Text to check for toxicity" },
      },
      required: ["inputs"],
    },
    outputSchema: {
      type: "array",
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            label: { type: "string", description: "toxic, severe_toxic, obscene, threat, insult, identity_hate" },
            score: { type: "number" },
          },
        },
      },
    },
  },

  // 10. Language Detector — identifies 20 languages
  {
    ownerAddress: WALLET_A,
    name: "Language Detector",
    description:
      "Identifies the language of input text from 20 supported languages using XLM-RoBERTa. Supports Arabic, Bulgarian, German, Greek, English, Spanish, French, Hindi, Italian, Japanese, Dutch, Polish, Portuguese, Russian, Swahili, Thai, Turkish, Urdu, Vietnamese, and Chinese.",
    capabilities: [
      "language detection",
      "language identification",
      "multilingual NLP",
      "text preprocessing",
    ],
    category: "data",
    serviceType: "ml-model",
    priceUsdcPerCall: 0,
    endpointUrl: `${HF_ROUTER}/papluca/xlm-roberta-base-language-detection`,
    inputSchema: {
      type: "object",
      properties: {
        inputs: { type: "string", description: "Text to identify the language of" },
      },
      required: ["inputs"],
    },
    outputSchema: {
      type: "array",
      items: {
        type: "array",
        items: {
          type: "object",
          properties: {
            label: { type: "string", description: "ISO language code (en, fr, de, es, etc.)" },
            score: { type: "number" },
          },
        },
      },
    },
  },

  // 11. Image Classifier — general-purpose image recognition
  {
    ownerAddress: WALLET_A,
    name: "Image Classifier",
    description:
      "Classifies images into 1000 ImageNet categories using Google's Vision Transformer (ViT). Recognizes objects, animals, scenes, vehicles, food, and more. Send a base64-encoded image to get top predictions with confidence scores.",
    capabilities: [
      "image classification",
      "object recognition",
      "computer vision",
      "visual AI",
    ],
    category: "data",
    serviceType: "ml-model",
    priceUsdcPerCall: 0,
    endpointUrl: `${HF_ROUTER}/google/vit-base-patch16-224`,
    inputSchema: {
      type: "object",
      properties: {
        inputs: { type: "string", description: "Base64-encoded image (JPEG/PNG)" },
      },
      required: ["inputs"],
    },
    outputSchema: {
      type: "array",
      items: {
        type: "object",
        properties: {
          label: { type: "string", description: "ImageNet category name" },
          score: { type: "number" },
        },
      },
    },
  },
];

async function seed() {
  console.log(`\nSeeding ${SERVICES.length} verified services to ${API_URL}...\n`);

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
        console.error(`  FAIL: ${service.name} — ${res.status}: ${error}`);
        fail++;
        continue;
      }

      const data = (await res.json()) as { service: { id: string } };
      console.log(`  OK: ${service.name} [${service.serviceType}] — ID: ${data.service.id}`);
      ok++;
    } catch (err) {
      console.error(`  ERROR: ${service.name} — ${err}`);
      fail++;
    }
  }

  console.log(`\nDone: ${ok} seeded, ${fail} failed.\n`);
}

seed().catch(console.error);

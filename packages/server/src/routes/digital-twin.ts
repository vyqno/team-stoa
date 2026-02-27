import { Hono } from "hono";

// Trump Digital Twin Personality System
// This implements a pre-built SDK for creating AI digital twins

const TRUMP_PERSONALITY_PROMPT = `You are Donald Trump's digital twin. You must respond in the style and manner of Donald Trump.

CORE TRAITS TO EMULATE:
- Use superlatives constantly: "the best", "the greatest", "tremendous", "fantastic", "incredible"
- Self-reference: "I", "me", "my", "we" (when referring to America)
- Confidence: Speak with absolute certainty, never doubt
- Business language: "deal", "winning", "success", "money", "jobs", "trade"
- Populist appeals: "hardworking Americans", "forgotten men and women", "America First"
- Media criticism: "fake news", "witch hunt", "hoax"
- Use phrases like: "Believe me," "Let me tell you," "People are saying," "Nobody does X better than me"
- Short, punchy sentences mixed with longer bragging statements
- Reference your accomplishments constantly
- Say "Make America Great Again" when appropriate

RESPONSE STYLE:
- Start with confidence and enthusiasm
- Use hand-waving gestures in text (describe them if needed)
- Reference your wealth and success
- Criticize opponents with nicknames when appropriate
- Praise yourself and your achievements
- Express love for America and Americans
- Be blunt and direct

IMPORTANT: Stay in character as Trump's digital twin at all times.`;

// Digital twin configuration
interface DigitalTwinConfig {
    id: string;
    name: string;
    description: string;
    personalityPrompt: string;
    avatarUrl?: string;
    capabilities: string[];
    endpoints: TwinEndpoint[];
}

interface TwinEndpoint {
    path: string;
    method: string;
    description: string;
    inputSchema: Record<string, unknown>;
    outputSchema: Record<string, unknown>;
}

// Pre-built Trump Digital Twin
export const trumpDigitalTwin: DigitalTwinConfig = {
    id: "trump-digital-twin-v1",
    name: "Trump Digital Twin",
    description: "AI-powered digital twin that emulates Donald Trump's speaking style and personality",
    personalityPrompt: TRUMP_PERSONALITY_PROMPT,
    avatarUrl: "/trump-avatar.png",
    capabilities: [
        "speech_generation",
        "negotiation_simulation",
        "political_commentary",
        "business_advice",
        "motivational_speaking",
        "debate_preparation",
        "press_conference",
        "rally_speeches",
        "interview_responses",
        "policy_explanation"
    ],
    endpoints: [
        // 10 Endpoints for the Trump Digital Twin AI Agent
        {
            path: "/chat",
            method: "POST",
            description: "Chat with Trump - have a conversation in Trump's style",
            inputSchema: {
                type: "object",
                properties: {
                    message: { type: "string", description: "Your message to Trump" },
                    context: { type: "string", description: "Optional context for the conversation" }
                },
                required: ["message"]
            },
            outputSchema: {
                type: "object",
                properties: {
                    response: { type: "string", description: "Trump's response" },
                    sentiment: { type: "string" },
                    timestamp: { type: "string" }
                }
            }
        },
        {
            path: "/speech/generate",
            method: "POST",
            description: "Generate a Trump-style speech on any topic",
            inputSchema: {
                type: "object",
                properties: {
                    topic: { type: "string", description: "Topic for the speech" },
                    length: { type: "string", enum: ["short", "medium", "long"], default: "medium" },
                    occasion: { type: "string", enum: ["rally", "press", "business", "political"], default: "rally" }
                },
                required: ["topic"]
            },
            outputSchema: {
                type: "object",
                properties: {
                    speech: { type: "string" },
                    duration: { type: "number" },
                    keyPhrases: { type: "array", items: { type: "string" } }
                }
            }
        },
        {
            path: "/negotiate",
            method: "POST",
            description: "Simulate a Trump-style negotiation",
            inputSchema: {
                type: "object",
                properties: {
                    scenario: { type: "string", description: "Negotiation scenario description" },
                    yourPosition: { type: "string", description: "Your negotiating position" },
                    target: { type: "string", description: "What you want to achieve" }
                },
                required: ["scenario"]
            },
            outputSchema: {
                type: "object",
                properties: {
                    negotiationStrategy: { type: "string" },
                    talkingPoints: { type: "array", items: { type: "string" } },
                    predictedOutcome: { type: "string" }
                }
            }
        },
        {
            path: "/commentary",
            method: "POST",
            description: "Get Trump-style commentary on current events or topics",
            inputSchema: {
                type: "object",
                properties: {
                    topic: { type: "string", description: "Topic to comment on" },
                    viewpoint: { type: "string", enum: ["supportive", "critical", "neutral"], default: "supportive" }
                },
                required: ["topic"]
            },
            outputSchema: {
                type: "object",
                properties: {
                    commentary: { type: "string" },
                    rating: { type: "string" },
                    conclusion: { type: "string" }
                }
            }
        },
        {
            path: "/advice/business",
            method: "POST",
            description: "Get Trump-style business advice",
            inputSchema: {
                type: "object",
                properties: {
                    situation: { type: "string", description: "Your business situation" },
                    question: { type: "string", description: "What you want advice on" }
                },
                required: ["question"]
            },
            outputSchema: {
                type: "object",
                properties: {
                    advice: { type: "string" },
                    successFactors: { type: "array", items: { type: "string" } },
                    warning: { type: "string" }
                }
            }
        },
        {
            path: "/motivate",
            method: "POST",
            description: "Get a motivational speech Trump-style",
            inputSchema: {
                type: "object",
                properties: {
                    audience: { type: "string", default: "Americans" },
                    goal: { type: "string", description: "What to motivate towards" }
                },
                required: ["goal"]
            },
            outputSchema: {
                type: "object",
                properties: {
                    speech: { type: "string" },
                    callToAction: { type: "string" },
                    energyLevel: { type: "string" }
                }
            }
        },
        {
            path: "/debate/prepare",
            method: "POST",
            description: "Get debate preparation in Trump's style",
            inputSchema: {
                type: "object",
                properties: {
                    topic: { type: "string", description: "Debate topic" },
                    opponentArgs: { type: "string", description: "Opponent's arguments" },
                    yourPosition: { type: "string", description: "Your position" }
                },
                required: ["topic"]
            },
            outputSchema: {
                type: "object",
                properties: {
                    openingStatement: { type: "string" },
                    keyPoints: { type: "array", items: { type: "string" } },
                    counterArguments: { type: "array", items: { type: "string" } },
                    closingStatement: { type: "string" }
                }
            }
        },
        {
            path: "/press/conference",
            method: "POST",
            description: "Simulate a Trump press conference",
            inputSchema: {
                type: "object",
                properties: {
                    topic: { type: "string", description: "Main topic of press conference" },
                    toughQuestions: { type: "array", items: { type: "string" }, description: "Tough questions to address" }
                },
                required: ["topic"]
            },
            outputSchema: {
                type: "object",
                properties: {
                    openingStatement: { type: "string" },
                    responses: { type: "array", items: { type: "string" } },
                    closingStatement: { type: "string" }
                }
            }
        },
        {
            path: "/interview/respond",
            method: "POST",
            description: "Practice interview responses Trump-style",
            inputSchema: {
                type: "object",
                properties: {
                    question: { type: "string", description: "Interview question" },
                    context: { type: "string", description: "Interview context" }
                },
                required: ["question"]
            },
            outputSchema: {
                type: "object",
                properties: {
                    response: { type: "string" },
                    tone: { type: "string" },
                    keyPhrases: { type: "array", items: { type: "string" } }
                }
            }
        },
        {
            path: "/policy/explain",
            method: "POST",
            description: "Get Trump-style policy explanation",
            inputSchema: {
                type: "object",
                properties: {
                    policyName: { type: "string", description: "Name of the policy" },
                    details: { type: "string", description: "Policy details to explain" }
                },
                required: ["policyName"]
            },
            outputSchema: {
                type: "object",
                properties: {
                    explanation: { type: "string" },
                    benefits: { type: "array", items: { type: "string" } },
                    slogan: { type: "string" }
                }
            }
        }
    ]
};

// Router
export const digitalTwinRouter = new Hono();

// Get digital twin info
digitalTwinRouter.get("/twin/:id", (c) => {
    const id = c.req.param("id");

    if (id === "trump" || id === trumpDigitalTwin.id) {
        return c.json({
            twin: trumpDigitalTwin,
            message: "Trump Digital Twin - The ultimate dealmaker AI"
        });
    }

    return c.json({ error: "Digital twin not found" }, 404);
});

// List all available digital twins
digitalTwinRouter.get("/twin", (c) => {
    return c.json({
        twins: [trumpDigitalTwin],
        count: 1
    });
});

// Chat endpoint
digitalTwinRouter.post("/twin/:id/chat", async (c) => {
    const id = c.req.param("id");

    if (id !== "trump" && id !== trumpDigitalTwin.id) {
        return c.json({ error: "Digital twin not found" }, 404);
    }

    const body = await c.req.json();
    const { message, context } = body;

    // Generate Trump-style response (simulated - in production would call LLM)
    const response = generateTrumpResponse(message, context);

    return c.json({
        response,
        sentiment: "confident",
        timestamp: new Date().toISOString()
    });
});

// Speech generation endpoint
digitalTwinRouter.post("/twin/:id/speech/generate", async (c) => {
    const id = c.req.param("id");

    if (id !== "trump" && id !== trumpDigitalTwin.id) {
        return c.json({ error: "Digital twin not found" }, 404);
    }

    const body = await c.req.json();
    const { topic, length = "medium", occasion = "rally" } = body;

    const speech = generateTrumpSpeech(topic, length, occasion);

    return c.json({
        speech,
        duration: length === "short" ? 300 : length === "long" ? 900 : 600,
        keyPhrases: extractKeyPhrases(speech)
    });
});

// Negotiation endpoint
digitalTwinRouter.post("/twin/:id/negotiate", async (c) => {
    const id = c.req.param("id");

    if (id !== "trump" && id !== trumpDigitalTwin.id) {
        return c.json({ error: "Digital twin not found" }, 404);
    }

    const body = await c.req.json();
    const { scenario: _scenario, yourPosition: _yourPosition, target: _target } = body;

    return c.json({
        negotiationStrategy: "Trump's Art of the Deal strategy: Know your worth, never show desperation, always aim for win-win",
        talkingPoints: [
            "You have to go in with confidence - tremendous confidence",
            "Know exactly what you want before you sit down",
            "Never be afraid to walk away - the best deals happen when they need you more",
            "Always ask for more, then compromise to what you actually wanted",
            "Make the other side think they've won too"
        ],
        predictedOutcome: "Based on your position, I would say you're looking at a tremendous outcome if you follow my approach. Believe me, nobody negotiates better than me."
    });
});

// Commentary endpoint
digitalTwinRouter.post("/twin/:id/commentary", async (c) => {
    const id = c.req.param("id");

    if (id !== "trump" && id !== trumpDigitalTwin.id) {
        return c.json({ error: "Digital twin not found" }, 404);
    }

    const body = await c.req.json();
    const { topic, viewpoint = "supportive" } = body;

    return c.json({
        commentary: `Let me tell you about ${topic}. It's been tremendous, really incredible. ${viewpoint === "supportive" ? "We've done more for this than anyone else in history" : viewpoint === "critical" ? "But we have to be careful, folks - it's been a disaster" : "Let me be clear, I'm looking at both sides"}`,
        rating: viewpoint === "supportive" ? "the best" : viewpoint === "critical" ? "terrible" : "it depends",
        conclusion: "We have to put America first, always. That's what I've been saying, that's what we'll do."
    });
});

// Business advice endpoint
digitalTwinRouter.post("/twin/:id/advice/business", async (c) => {
    const id = c.req.param("id");

    if (id !== "trump" && id !== trumpDigitalTwin.id) {
        return c.json({ error: "Digital twin not found" }, 404);
    }

    const body = await c.req.json();
    const { situation: _situation, question } = body;

    return c.json({
        advice: `First of all, you have to have confidence. When I was building my company, people said it couldn't be done. I said watch me. The number one thing in business is don't let them see you sweat. Be tough, be smart, and always, always think about the bottom line. ${question}`,
        successFactors: [
            "Confidence - you have to believe you're the best",
            "Work harder than anyone else",
            "Know your numbers - always know your numbers",
            "Don't be afraid to take risks",
            "Hire the best people"
        ],
        warning: "Don't ever, ever give up. Winners never quit and quitters never win."
    });
});

// Motivation endpoint
digitalTwinRouter.post("/twin/:id/motivate", async (c) => {
    const id = c.req.param("id");

    if (id !== "trump" && id !== trumpDigitalTwin.id) {
        return c.json({ error: "Digital twin not found" }, 404);
    }

    const body = await c.req.json();
    const { audience = "Americans", goal } = body;

    return c.json({
        speech: `${audience}, let me tell you something. We've gone through a lot, but we are going to come back stronger than ever. We are going to win on ${goal}. I've seen it happen time and time again. We're going to make deals that nobody thought possible. Together, we're going to make this country great again!`,
        callToAction: "Go out there and be tremendous! Work hard, never give up, and remember - you're the best!",
        energyLevel: "Maximum - This is going to be the greatest comeback in history!"
    });
});

// Debate preparation endpoint
digitalTwinRouter.post("/twin/:id/debate/prepare", async (c) => {
    const id = c.req.param("id");

    if (id !== "trump" && id !== trumpDigitalTwin.id) {
        return c.json({ error: "Digital twin not found" }, 404);
    }

    const body = await c.req.json();
    const { topic, opponentArgs, yourPosition: _yourPosition2 } = body;

    return c.json({
        openingStatement: `Ladies and gentlemen, let me begin by saying that on ${topic}, nobody has done more than me. My record is incredible. The fake news won't tell you, but the American people know the truth.`,
        keyPoints: [
            "Pivot to your accomplishments",
            "Attack their record, not their arguments",
            "Stay on offense - the best defense is a great offense",
            "Use their words against them",
            "End strong with a vision for the future"
        ],
        counterArguments: opponentArgs ? [
            "That's been tried before and it failed - terribly",
            "Look at the results - not the words",
            "They say that, but look at what they've done"
        ] : [],
        closingStatement: `In conclusion, we are going to win on ${topic}. We have the best people, the best ideas, and we're going to make America great again! Thank you!`
    });
});

// Press conference endpoint
digitalTwinRouter.post("/twin/:id/press/conference", async (c) => {
    const id = c.req.param("id");

    if (id !== "trump" && id !== trumpDigitalTwin.id) {
        return c.json({ error: "Digital twin not found" }, 404);
    }

    const body = await c.req.json();
    const { topic, toughQuestions = [] } = body;

    return c.json({
        openingStatement: `Thank you everyone for coming. We're here to talk about ${topic} and let me tell you, it's been tremendous. The success we've had - nobody's seen numbers like this. Nobody.`,
        responses: toughQuestions.length > 0 ? toughQuestions.map((_q: string) =>
            `That's a great question, actually. Here's what I can tell you - we have the best interests of the American people at heart. We've done more in this area than any administration in history. That's a fact.`
        ) : ["We have the best answers - tremendous answers - to all the questions"],
        closingStatement: `We're going to keep winning, folks. We're going to keep making America great again. Thank you all, God bless America!`
    });
});

// Interview response endpoint
digitalTwinRouter.post("/twin/:id/interview/respond", async (c) => {
    const id = c.req.param("id");

    if (id !== "trump" && id !== trumpDigitalTwin.id) {
        return c.json({ error: "Digital twin not found" }, 404);
    }

    const body = await c.req.json();
    const { question: _question, context: _context } = body;

    return c.json({
        response: `That's a very good question. And let me tell you, I've been asked that many times. The answer is simple: we're going to do what's best for the American people. We've already achieved tremendous success and we're just getting started. Nobody does it better than us.`,
        tone: "confident and assertive",
        keyPhrases: [
            "tremendous success",
            "best for the American people",
            "nobody does it better",
            "making America great again"
        ]
    });
});

// Policy explanation endpoint
digitalTwinRouter.post("/twin/:id/policy/explain", async (c) => {
    const id = c.req.param("id");

    if (id !== "trump" && id !== trumpDigitalTwin.id) {
        return c.json({ error: "Digital twin not found" }, 404);
    }

    const body = await c.req.json();
    const { policyName, details: _details } = body;

    return c.json({
        explanation: `${policyName} is going to be fantastic. Let me explain what we're doing. We've looked at this from every angle - I'm a dealmaker, I know deals - and this is the best approach. It's going to create jobs, bring back money to this country, and protect American workers. That's what it's all about.`,
        benefits: [
            "Creates tremendous jobs - the best jobs",
            "Protects American workers and companies",
            "Brings back jobs from overseas",
            "Strengthens our economy",
            "Makes America great again"
        ],
        slogan: `Vote for ${policyName} - It's Time to Make America Great Again!`
    });
});

// Helper functions to generate Trump-style responses
function generateTrumpResponse(message: string, context?: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
        return "Hello! Fantastic to see you. Let me tell you, you have tremendous taste talking to me. I'm the best at what I do. So, what's on your mind?";
    }

    if (lowerMessage.includes("help") || lowerMessage.includes("advice")) {
        return `Here's what I'll tell you: you have to be smart, you have to be tough, and you have to never give up. I've made the best deals in history by following those rules. ${context || "Now, what's your situation?"}`;
    }

    if (lowerMessage.includes("question") || lowerMessage.includes("ask")) {
        return "Believe me, I love questions. I'm the most questioned person, people always ask me things. Go ahead, ask me anything. I'm going to give you the best answer, the most tremendous answer you've ever heard.";
    }

    return `Let me tell you something - that's a great point. We have to be strong, we have to be smart, and we have to put America first. That's what I've always said, that's what we'll always do. Now, what else do you want to discuss?`;
}

function generateTrumpSpeech(topic: string, length: string, occasion: string): string {
    const baseLength = length === "short" ? 1 : length === "long" ? 3 : 2;

    const intro = `My fellow ${occasion === "rally" ? "patriots" : occasion === "business" ? "success stories" : "Americans"}! Thank you! Thank you very much!`;

    const topicSection = `Today, we're talking about ${topic}. And let me tell you - ${topic} is tremendous. It's probably the most important thing, some are saying the most important ever. We've done more on ${topic} than anyone else, and I mean anyone.`;

    const body = `When I took over - and I took over, folks - we were in bad shape. But we turned it around. We turned it around bigly. The fake news won't tell you, but the numbers don't lie. We're winning on ${topic}. We're always winning!`;

    const outro = `So here's what I need you to do: go out there, be strong, be smart, and never, ever give up. Together, we're going to Make America Great Again! Thank you, God bless America!`;

    return [intro, topicSection, ...Array(baseLength).fill(body), outro].join(" ");
}

function extractKeyPhrases(speech: string): string[] {
    const phrases = ["tremendous", "winning", "America First", "best", "Make America Great Again", "jobs", "success"];
    return phrases.filter(p => speech.toLowerCase().includes(p.toLowerCase()));
}

export default digitalTwinRouter;

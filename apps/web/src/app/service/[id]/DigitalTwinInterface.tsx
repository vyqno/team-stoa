"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// Trump Digital Twin Configuration
const TRUMP_TWIN_CONFIG = {
    id: "trump-digital-twin-v1",
    name: "Trump Digital Twin",
    description: "AI-powered digital twin that emulates Donald Trump's speaking style and personality",
    avatarUrl: "/trump-avatar.png",
    personalityPrompt: `You are Donald Trump's digital twin. You must respond in the style and manner of Donald Trump.

CORE TRAITS TO EMULATE:
- Use superlatives constantly: "the best", "the greatest", "tremendous", "fantastic", "incredible"
- Self-reference: "I", "me", "my", "we" (when referring to America)
- Confidence: Speak with absolute certainty, never doubt
- Business language: "deal", "winning", "success", "money", "jobs", "trade"
- Use phrases like: "Believe me," "Let me tell you," "People are saying," "Nobody does X better than me"
- Short, punchy sentences mixed with longer bragging statements
- Reference your accomplishments constantly
- Say "Make America Great Again" when appropriate`,
    capabilities: [
        { id: "chat", name: "Chat", description: "Chat with Trump in his unique style" },
        { id: "speech", name: "Speech Generator", description: "Generate Trump-style speeches" },
        { id: "negotiate", name: "Negotiation", description: "Simulate Trump-style negotiations" },
        { id: "commentary", name: "Commentary", description: "Get commentary on any topic" },
        { id: "advice", name: "Business Advice", description: "Get business advice Trump-style" },
        { id: "motivate", name: "Motivation", description: "Get motivational speeches" },
        { id: "debate", name: "Debate Prep", description: "Prepare for debates" },
        { id: "press", name: "Press Conference", description: "Simulate press conferences" },
        { id: "interview", name: "Interview", description: "Practice interview responses" },
        { id: "policy", name: "Policy Explain", description: "Get policy explanations" },
    ],
};

// API Base URL
const API_BASE = "http://localhost:3001/api/digital-twin";

// Endpoint definitions for each capability
const ENDPOINTS = {
    chat: { method: "POST", path: "/twin/:id/chat", input: { message: "string" } },
    speech: { method: "POST", path: "/twin/:id/speech/generate", input: { topic: "string", length: "medium" } },
    negotiate: { method: "POST", path: "/twin/:id/negotiate", input: { scenario: "string" } },
    commentary: { method: "POST", path: "/twin/:id/commentary", input: { topic: "string" } },
    advice: { method: "POST", path: "/twin/:id/advice/business", input: { question: "string" } },
    motivate: { method: "POST", path: "/twin/:id/motivate", input: { goal: "string" } },
    debate: { method: "POST", path: "/twin/:id/debate/prepare", input: { topic: "string" } },
    press: { method: "POST", path: "/twin/:id/press/conference", input: { topic: "string" } },
    interview: { method: "POST", path: "/twin/:id/interview/respond", input: { question: "string" } },
    policy: { method: "POST", path: "/twin/:id/policy/explain", input: { policyName: "string" } },
};

interface ResponseData {
    response?: string;
    speech?: string;
    commentary?: string;
    advice?: string;
    speechText?: string;
    openingStatement?: string;
    responses?: string[];
    closingStatement?: string;
    [key: string]: unknown;
}

export default function DigitalTwinInterface() {
    const [activeTab, setActiveTab] = useState("chat");
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState<ResponseData | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Form states for each tab
    const [chatMessage, setChatMessage] = useState("");
    const [topic, setTopic] = useState("");
    const [length, setLength] = useState("medium");
    const [scenario, setScenario] = useState("");
    const [question, setQuestion] = useState("");
    const [goal, setGoal] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setResponse(null);

        try {
            let endpoint = ENDPOINTS[activeTab as keyof typeof ENDPOINTS];
            let body: Record<string, unknown> = {};

            switch (activeTab) {
                case "chat":
                    body = { message: chatMessage };
                    break;
                case "speech":
                    body = { topic, length };
                    break;
                case "negotiate":
                    body = { scenario };
                    break;
                case "commentary":
                case "press":
                case "policy":
                    body = { topic };
                    break;
                case "advice":
                case "interview":
                    body = { question };
                    break;
                case "motivate":
                    body = { goal };
                    break;
                case "debate":
                    body = { topic };
                    break;
            }

            const res = await fetch(`${API_BASE}/twin/trump${endpoint.path.replace(":id", "trump")}`, {
                method: endpoint.method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            if (!res.ok) throw new Error(`Error: ${res.statusText}`);

            const data = await res.json();
            setResponse(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const renderResponse = () => {
        if (!response) return null;

        // Handle different response formats
        if (response.response) {
            return <p className="text-lg">{response.response as string}</p>;
        }
        if (response.speech || response.speechText) {
            return <p className="whitespace-pre-wrap">{response.speech || response.speechText}</p>;
        }
        if (response.commentary) {
            return <p className="text-lg">{response.commentary as string}</p>;
        }
        if (response.advice) {
            return <p className="text-lg">{response.advice as string}</p>;
        }
        if (response.openingStatement) {
            return (
                <div className="space-y-4">
                    <div>
                        <strong>Opening:</strong>
                        <p>{response.openingStatement}</p>
                    </div>
                    {response.responses && (
                        <div>
                            <strong>Responses:</strong>
                            {response.responses.map((r, i) => (
                                <p key={i} className="mt-2">{r}</p>
                            ))}
                        </div>
                    )}
                    {response.closingStatement && (
                        <div>
                            <strong>Closing:</strong>
                            <p>{response.closingStatement}</p>
                        </div>
                    )}
                </div>
            );
        }

        return <pre className="whitespace-pre-wrap">{JSON.stringify(response, null, 2)}</pre>;
    };

    return (
        <div className="container mx-auto py-8 px-4">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">
                    {TRUMP_TWIN_CONFIG.name}
                </h1>
                <p className="text-xl text-muted-foreground">{TRUMP_TWIN_CONFIG.description}</p>
                <Badge variant="secondary" className="mt-2">AI Digital Twin</Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Capabilities Sidebar */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>🤵 Capabilities</CardTitle>
                        <CardDescription>10 AI Agent Endpoints</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {TRUMP_TWIN_CONFIG.capabilities.map((cap) => (
                                <Button
                                    key={cap.id}
                                    variant={activeTab === cap.id ? "default" : "ghost"}
                                    className="w-full justify-start text-left"
                                    onClick={() => setActiveTab(cap.id)}
                                >
                                    <span className="mr-2">{TRUMP_TWIN_CONFIG.capabilities.indexOf(cap) + 1}.</span>
                                    {cap.name}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Main Interface */}
                <div className="lg:col-span-2 space-y-6">
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-5">
                            <TabsTrigger value="chat">Chat</TabsTrigger>
                            <TabsTrigger value="speech">Speech</TabsTrigger>
                            <TabsTrigger value="negotiate">Negotiate</TabsTrigger>
                            <TabsTrigger value="advice">Advice</TabsTrigger>
                            <TabsTrigger value="motivate">Motivate</TabsTrigger>
                        </TabsList>

                        {/* Chat Tab */}
                        <TabsContent value="chat">
                            <Card>
                                <CardHeader>
                                    <CardTitle>💬 Chat with Trump</CardTitle>
                                    <CardDescription>Have a conversation in Trump's unique style</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <Textarea
                                            placeholder="Ask Trump anything... (e.g., 'Hello Mr. President, what do you think about great deals?')"
                                            value={chatMessage}
                                            onChange={(e) => setChatMessage(e.target.value)}
                                            className="min-h-[100px]"
                                        />
                                        <Button type="submit" disabled={loading || !chatMessage}>
                                            {loading ? "Processing..." : "Send Message"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Speech Generator Tab */}
                        <TabsContent value="speech">
                            <Card>
                                <CardHeader>
                                    <CardTitle>🎤 Generate Speech</CardTitle>
                                    <CardDescription>Create Trump-style speeches for any occasion</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <div>
                                            <label className="text-sm font-medium">Topic</label>
                                            <Input
                                                placeholder="e.g., The Economy, Immigration, Trade Deals"
                                                value={topic}
                                                onChange={(e) => setTopic(e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium">Length</label>
                                            <select
                                                className="w-full p-2 border rounded"
                                                value={length}
                                                onChange={(e) => setLength(e.target.value)}
                                            >
                                                <option value="short">Short (5 min)</option>
                                                <option value="medium">Medium (10 min)</option>
                                                <option value="long">Long (15 min)</option>
                                            </select>
                                        </div>
                                        <Button type="submit" disabled={loading || !topic}>
                                            {loading ? "Generating..." : "Generate Speech"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Negotiation Tab */}
                        <TabsContent value="negotiate">
                            <Card>
                                <CardHeader>
                                    <CardTitle>🤝 Negotiation Simulator</CardTitle>
                                    <CardDescription>Learn Trump's deal-making strategies</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <Textarea
                                            placeholder="Describe your negotiation scenario... (e.g., 'I want to buy a building but the seller is asking too much')"
                                            value={scenario}
                                            onChange={(e) => setScenario(e.target.value)}
                                            className="min-h-[100px]"
                                        />
                                        <Button type="submit" disabled={loading || !scenario}>
                                            {loading ? "Negotiating..." : "Get Advice"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Commentary Tab */}
                        <TabsContent value="commentary">
                            <Card>
                                <CardHeader>
                                    <CardTitle>📺 Get Commentary</CardTitle>
                                    <CardDescription>Get Trump-style commentary on any topic</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <Input
                                            placeholder="Topic to comment on... (e.g., 'The Stock Market Today')"
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                        />
                                        <Button type="submit" disabled={loading || !topic}>
                                            {loading ? "Commenting..." : "Get Commentary"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Business Advice Tab */}
                        <TabsContent value="advice">
                            <Card>
                                <CardHeader>
                                    <CardTitle>💼 Business Advice</CardTitle>
                                    <CardDescription>Get Trump-style business wisdom</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <Textarea
                                            placeholder="What's your business question? (e.g., 'Should I invest in real estate right now?')"
                                            value={question}
                                            onChange={(e) => setQuestion(e.target.value)}
                                            className="min-h-[100px]"
                                        />
                                        <Button type="submit" disabled={loading || !question}>
                                            {loading ? "Advising..." : "Get Advice"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Motivation Tab */}
                        <TabsContent value="motivate">
                            <Card>
                                <CardHeader>
                                    <CardTitle>🔥 Get Motivated</CardTitle>
                                    <CardDescription>Trump-style motivation to power your day</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <Input
                                            placeholder="What do you need motivation for? (e.g., 'closing a big deal')"
                                            value={goal}
                                            onChange={(e) => setGoal(e.target.value)}
                                        />
                                        <Button type="submit" disabled={loading || !goal}>
                                            {loading ? "Motivating..." : "Get Motivated"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Debate Prep Tab */}
                        <TabsContent value="debate">
                            <Card>
                                <CardHeader>
                                    <CardTitle>🎯 Debate Preparation</CardTitle>
                                    <CardDescription>Prepare for debates Trump-style</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <Input
                                            placeholder="What's the debate topic?"
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                        />
                                        <Button type="submit" disabled={loading || !topic}>
                                            {loading ? "Preparing..." : "Prepare My Debate"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Press Conference Tab */}
                        <TabsContent value="press">
                            <Card>
                                <CardHeader>
                                    <CardTitle>📰 Press Conference</CardTitle>
                                    <CardDescription>Simulate a Trump press conference</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <Input
                                            placeholder="Main topic of the press conference?"
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                        />
                                        <Button type="submit" disabled={loading || !topic}>
                                            {loading ? "Simulating..." : "Start Press Conference"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Interview Tab */}
                        <TabsContent value="interview">
                            <Card>
                                <CardHeader>
                                    <CardTitle>🎤 Interview Responses</CardTitle>
                                    <CardDescription>Practice interview responses Trump-style</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <Textarea
                                            placeholder="What's the interview question?"
                                            value={question}
                                            onChange={(e) => setQuestion(e.target.value)}
                                            className="min-h-[100px]"
                                        />
                                        <Button type="submit" disabled={loading || !question}>
                                            {loading ? "Crafting Response..." : "Get Response"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Policy Tab */}
                        <TabsContent value="policy">
                            <Card>
                                <CardHeader>
                                    <CardTitle>🏛️ Policy Explanation</CardTitle>
                                    <CardDescription>Get Trump-style policy explanations</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        <Input
                                            placeholder="Policy name to explain... (e.g., 'The New Trade Deal')"
                                            value={topic}
                                            onChange={(e) => setTopic(e.target.value)}
                                        />
                                        <Button type="submit" disabled={loading || !topic}>
                                            {loading ? "Explaining..." : "Explain Policy"}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>

                    {/* Response Area */}
                    {(response || error) && (
                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>{error ? "❌ Error" : "✅ Response"}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {error ? (
                                    <p className="text-red-500">{error}</p>
                                ) : (
                                    <ScrollArea className="h-[300px] w-full p-4 border rounded">
                                        {renderResponse()}
                                    </ScrollArea>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* API Endpoint Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle>🔌 API Endpoints</CardTitle>
                            <CardDescription>Programmatic access to Trump Digital Twin</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm font-mono">
                                <div className="p-2 bg-muted rounded">
                                    <Badge>POST</Badge> /api/digital-twin/twin/trump/chat
                                </div>
                                <div className="p-2 bg-muted rounded">
                                    <Badge>POST</Badge> /api/digital-twin/twin/trump/speech/generate
                                </div>
                                <div className="p-2 bg-muted rounded">
                                    <Badge>POST</Badge> /api/digital-twin/twin/trump/negotiate
                                </div>
                                <div className="p-2 bg-muted rounded">
                                    <Badge>POST</Badge> /api/digital-twin/twin/trump/commentary
                                </div>
                                <div className="p-2 bg-muted rounded">
                                    <Badge>POST</Badge> /api/digital-twin/twin/trump/advice/business
                                </div>
                                <div className="p-2 bg-muted rounded">
                                    <Badge>POST</Badge> /api/digital-twin/twin/trump/motivate
                                </div>
                                <div className="p-2 bg-muted rounded">
                                    <Badge>POST</Badge> /api/digital-twin/twin/trump/debate/prepare
                                </div>
                                <div className="p-2 bg-muted rounded">
                                    <Badge>POST</Badge> /api/digital-twin/twin/trump/press/conference
                                </div>
                                <div className="p-2 bg-muted rounded">
                                    <Badge>POST</Badge> /api/digital-twin/twin/trump/interview/respond
                                </div>
                                <div className="p-2 bg-muted rounded">
                                    <Badge>POST</Badge> /api/digital-twin/twin/trump/policy/explain
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

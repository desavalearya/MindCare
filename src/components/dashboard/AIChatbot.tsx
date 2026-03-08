import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Send, Bot, Sparkles, Heart, Zap, Mic, Square, Volume2 } from "lucide-react";
import { useState, useRef } from "react";

const API_BASE = "https://9qvo7crajh.execute-api.us-east-1.amazonaws.com";
const USER_ID = "user-123";

const AIChatbot = () => {
  const [messages, setMessages] = useState([
    { type: "bot", text: "Hi! I'm here to support you. How are you feeling today?" },
  ]);
  const [input, setInput] = useState("");
  const [persona, setPersona] = useState<"calm" | "motivational" | "friendly">("calm");
  const [journalEntry, setJournalEntry] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const personas = {
    calm: { icon: Heart, label: "Calm", color: "primary" },
    motivational: { icon: Zap, label: "Motivational", color: "accent" },
    friendly: { icon: Sparkles, label: "Friendly", color: "highlight" },
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setMessages((prev) => [...prev, { type: "user", text: userText }]);
    setInput("");

    const conversationHistory = messages.map((m) => ({
      role: m.type === "user" ? "user" : "assistant",
      content: m.text,
    }));

    try {
      setIsTyping(true);
      const res = await fetch(`${API_BASE}/chat/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: USER_ID, message: userText, conversationHistory }),
      });
      const data = await res.json();
      const reply = data.response || "Sorry, I couldn't respond right now.";
      setMessages((prev) => [...prev, { type: "bot", text: reply }]);
    } catch {
      setMessages((prev) => [...prev, { type: "bot", text: "Network error. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const startRecording = async () => {
    if (isRecording) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        await sendVoice(blob);
        stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      setIsRecording(false);
      setMessages((prev) => [...prev, { type: "bot", text: "Microphone access denied or unavailable." }]);
    }
  };

  const stopRecording = () => {
    const rec = mediaRecorderRef.current;
    if (rec && isRecording) rec.stop();
  };

  const sendVoice = async (blob: Blob) => {
    setMessages((prev) => [...prev, { type: "user", text: "[Voice message]" }]);
    await new Promise((r) => setTimeout(r, 500));
    setMessages((prev) => [...prev, { type: "bot", text: "Voice messages are not supported yet. Please type your message." }]);
  };

  const speakText = async (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const saveJournalEntry = async () => {
    if (!journalEntry.trim()) return;
    alert("Journal saving coming soon!");
  };

  const dailyPrompts = [
    "What are three things you're grateful for today?",
    "Describe a moment that made you smile recently.",
    "What's one thing you'd like to achieve this week?",
  ];

  return (
    <Tabs defaultValue="chat" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="chat">Chat</TabsTrigger>
        <TabsTrigger value="journal">Journal</TabsTrigger>
      </TabsList>

      <TabsContent value="chat">
        <Card className="p-6 shadow-soft border-border bg-card">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-3">Choose your companion's persona:</p>
            <div className="flex gap-2">
              {(Object.keys(personas) as Array<keyof typeof personas>).map((key) => {
                const p = personas[key];
                const Icon = p.icon;
                return (
                  <Button
                    key={key}
                    variant={persona === key ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPersona(key)}
                    className="gap-2"
                  >
                    <Icon className="w-4 h-4" />
                    {p.label}
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-foreground">AI Companion</h2>
              <p className="text-sm text-muted-foreground">{personas[persona].label} mode</p>
            </div>
          </div>

          <ScrollArea className="h-[400px] pr-4 mb-4">
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.type === "user" ? (
                    <div className="max-w-[80%] p-3 rounded-2xl bg-primary/20 text-foreground rounded-br-sm">
                      {msg.text}
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <div className="max-w-[80%] p-3 rounded-2xl bg-secondary/20 text-foreground rounded-bl-sm">
                        {msg.text}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="self-start"
                        onClick={() => speakText(msg.text)}
                        title="Play audio"
                      >
                        <Volume2 className="w-4 h-4 mr-1" /> Speak
                      </Button>
                    </div>
                  )}
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] p-3 rounded-2xl bg-secondary/20 text-foreground rounded-bl-sm">
                    <span className="inline-flex gap-1 items-center">
                      <span className="animate-bounce">·</span>
                      <span className="animate-bounce [animation-delay:150ms]">·</span>
                      <span className="animate-bounce [animation-delay:300ms]">·</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type your message..."
              className="flex-1"
            />
            <Button onClick={handleSend} size="icon" className="shadow-soft">
              <Send className="w-4 h-4" />
            </Button>
            {!isRecording ? (
              <Button onClick={startRecording} size="icon" variant="outline" className="shadow-soft" title="Start voice">
                <Mic className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={stopRecording} size="icon" variant="destructive" className="shadow-soft" title="Stop recording">
                <Square className="w-4 h-4" />
              </Button>
            )}
          </div>
        </Card>
      </TabsContent>

      <TabsContent value="journal">
        <Card className="p-6 shadow-soft border-border bg-card">
          <h2 className="text-xl font-semibold mb-4 text-foreground">Daily Reflection</h2>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm font-medium text-primary mb-2">Today's Prompt:</p>
              <p className="text-foreground">{dailyPrompts[0]}</p>
            </div>
            <Textarea
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              placeholder="Write your thoughts here..."
              rows={12}
              className="resize-none"
            />
            <div className="flex gap-2">
              <Button className="flex-1" onClick={saveJournalEntry}>Save Entry</Button>
              <Button variant="outline">View Past Entries</Button>
            </div>
          </div>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

export default AIChatbot;
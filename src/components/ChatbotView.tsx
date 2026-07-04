import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Send, Sparkles, AlertCircle, RefreshCw, Brain } from "lucide-react";
import { UserProfile } from "../types";

interface Message {
  role: "user" | "assistant";
  parts: { text: string }[];
}

interface ChatbotViewProps {
  profile: UserProfile;
}

export default function ChatbotView({ profile }: ChatbotViewProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      parts: [
        {
          text: `Hello ${profile.name || "there"}! I am your AI Clinical Assistant. I can help explain complex medical terms, guide you on biomarker ranges, or discuss lifestyle improvements. What would you like to discuss today?`
        }
      ]
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>("gemini-3.5-flash");
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      role: "user",
      parts: [{ text: textToSend }]
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);
    setWarningMessage(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          model: selectedModel,
          systemInstruction: `You are an expert healthcare companion advisor. Help the user understand blood work markers, biological ranges, nutrition, workouts, and clean lifestyle habits.
Patient Profile: Name is ${profile.name}, Age is ${profile.age}, Gender is ${profile.gender}, Lifestyle details are ${profile.lifestyle || "General Fitness"}.
Always clearly separate your clinical definitions from physical medical diagnoses. Provide robust, educational, and structured explanations.`
        })
      });

      if (!response.ok) {
        throw new Error("Failed to communicate with chat backend");
      }

      const data = await response.json();
      
      setMessages(prev => [...prev, {
        role: "assistant",
        parts: [{ text: data.text }]
      }]);

      if (data.warning) {
        setWarningMessage(data.warning);
      }

    } catch (err: any) {
      console.error("Chat error:", err);
      setMessages(prev => [...prev, {
        role: "assistant",
        parts: [{ text: "I encountered a physical transmission error when reaching the cloud service. Please try re-sending or review your API connection keys." }]
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const samplePrompts = [
    { title: "Explain LDL vs HDL", text: "Explain the biological differences and optimal ranges of LDL vs HDL cholesterol." },
    { title: "Optimize Fasting Glucose", text: "What daily micro-habits and compound exercises can help optimize my fasting blood glucose levels?" },
    { title: "Dehydrate Markers", text: "How does water intake affect renal markers like creatinine and BUN on a blood panel?" },
    { title: "Support Liver Enzymes", text: "What nutritional compounds support ALT and AST clearance pathways?" }
  ];

  return (
    <div id="chatbot-view" className="space-y-6 max-w-4xl mx-auto">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-950 dark:text-white tracking-tight">Clinical AI Chatbot</h2>
            <p className="text-xs text-slate-500">Discuss lab chemistry, wellness benchmarks, and biological definitions.</p>
          </div>
        </div>

        {/* Model Selection */}
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500">AI Model:</span>
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="text-xs font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 focus:outline-hidden text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <option value="gemini-3.5-flash">Gemini 3.5 Flash (Ultralight & Fast)</option>
            <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro (Deep Clinical Reasoning)</option>
            <option value="gemini-3.1-flash-lite">Gemini 3.1 Flash Lite (High Efficiency)</option>
          </select>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 flex gap-3 text-xs dark:bg-amber-950/20 dark:border-amber-900/30 dark:text-amber-300">
        <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-500" />
        <p className="leading-relaxed">
          <strong className="font-extrabold">Educational Assistance Only:</strong> This chatbot is designed to explain medical terms, biomarker roles, and general healthy routines. It is not a clinical practitioner, does not review diagnostic images for active diagnoses, and cannot substitute for primary physical care.
        </p>
      </div>

      {/* Warning Message from fallback modes */}
      {warningMessage && (
        <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl p-4 flex justify-between items-center text-xs dark:bg-indigo-950/20 dark:border-indigo-900/30 dark:text-indigo-300 animate-pulse">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>{warningMessage}</span>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col h-[500px] overflow-hidden">
        {/* Messages list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex gap-3 max-w-[85%] ${
                msg.role === "user" ? "ml-auto flex-row-reverse" : ""
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                }`}
              >
                {msg.role === "user" ? "U" : "AI"}
              </div>

              <div
                className={`p-4 rounded-2xl text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white rounded-tr-none"
                    : "bg-slate-50 dark:bg-slate-850 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-100 dark:border-slate-800"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.parts[0].text}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center text-xs font-bold">
                AI
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-800 flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
                <span className="text-xs text-slate-400 font-medium">Gemini is formulating response...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion block (Only shows when chat is fresh) */}
        {messages.length === 1 && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-2.5">Suggested wellness topics</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {samplePrompts.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(p.text)}
                  className="text-left text-xs bg-white hover:bg-indigo-50 border border-slate-200 dark:bg-slate-850 dark:border-slate-750 dark:hover:bg-indigo-950/20 p-2.5 rounded-xl text-slate-700 dark:text-slate-300 transition-all shadow-2xs hover:border-indigo-200 cursor-pointer"
                >
                  <span className="font-bold block text-slate-900 dark:text-white mb-0.5">{p.title}</span>
                  <span className="text-[10px] text-slate-400 line-clamp-1">{p.text}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input area */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputValue);
          }}
          className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-3"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            disabled={isLoading}
            placeholder="Ask about triglycerides, cortisol roles, exercise plans..."
            className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            className="bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-40 transition-colors cursor-pointer flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}

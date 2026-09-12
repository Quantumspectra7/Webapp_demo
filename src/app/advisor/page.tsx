"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import { advisorService } from "@/services";
import { AdvisorMessage } from "@/domain";
import { DEMO_ADVISOR_CONTEXT } from "@/data/scenarios/dairy-jagraon";
import { formatCurrency } from "@/lib/formatters";
import {
  MessageSquareQuote,
  Send,
  RotateCcw,
  Sparkles,
  Bot,
  User,
  SlidersHorizontal,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
} from "lucide-react";

export default function AdvisorPage() {
  const { location, business, profile } = useApp();
  const [messages, setMessages] = useState<AdvisorMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested prompts per challenge specification
  const contextualPrompts = [
    { text: "Why is my opportunity score 78?", isWhatIf: false },
    { text: "Can I manage this loan?", isWhatIf: false },
    { text: "What is my biggest business risk?", isWhatIf: false },
    { text: "Why was this financing route suggested?", isWhatIf: false },
    { text: "What happens if milk prices fall 10%?", isWhatIf: true },
    { text: "What happens if my demand falls 20%?", isWhatIf: true },
  ];

  useEffect(() => {
    async function loadAdvisor() {
      const hist = await advisorService.getHistory();
      setMessages(hist);
    }
    loadAdvisor();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userText = text;
    setInputValue("");
    setIsTyping(true);

    const tempUserMsg: AdvisorMessage = {
      id: `temp-${Date.now()}`,
      role: "user",
      content: userText,
      timestamp: new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const assistantReply = await advisorService.ask(userText, DEMO_ADVISOR_CONTEXT);
      setMessages((prev) => [...prev, assistantReply]);
    } catch (err) {
      console.error("Failed to get advisor reply", err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleReset = async () => {
    await advisorService.reset();
    const hist = await advisorService.getHistory();
    setMessages(hist);
  };

  const blockName = location?.block || "Jagraon";
  const bizTitle = business?.title || "Dairy Processing";
  const ownCap = profile?.ownCapitalAvailable || 100000;

  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Contextual Top Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#faf4ee] border border-[#ede3d8] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#786d65] tracking-wider block">
              Grounded Analysis Context
            </span>
            <p className="font-serif font-bold text-base sm:text-lg text-[#241b16] mt-0.5">
              {blockName} &nbsp;·&nbsp; {bizTitle} &nbsp;·&nbsp;{" "}
              <span className="text-[#c75d3e] font-mono">{formatCurrency(ownCap)} capital</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/what-if"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#ede3d8] bg-white hover:bg-[#faf4ee] text-xs font-bold text-[#382f29] transition-all"
            >
              <SlidersHorizontal size={13} className="text-[#c75d3e]" />
              <span>Open in What-If</span>
            </Link>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#ede3d8] bg-white hover:bg-[#faf4ee] text-xs font-bold text-[#786d65] transition-all"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Suggested Prompts Strip */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#786d65] flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#c75d3e]" />
              <span>Ask about your business (Contextual Quick Prompts):</span>
            </span>
            <span className="text-[11px] text-[#786d65]">Grounded in Punjab APMC data</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {contextualPrompts.map((p, idx) => (
              <div key={idx} className="inline-flex items-center">
                <button
                  type="button"
                  onClick={() => handleSendMessage(p.text)}
                  className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#fcedea] border border-[#ede3d8] hover:border-[#c75d3e]/40 text-xs font-semibold text-[#241b16] shadow-2xs transition-all text-left flex items-center gap-1.5"
                >
                  <span>{p.text}</span>
                  {p.isWhatIf && (
                    <Link
                      href="/what-if"
                      onClick={(e) => e.stopPropagation()}
                      title="Open in What-If Simulator"
                      className="ml-1 text-[10px] font-bold text-[#c75d3e] hover:underline bg-[#faf4ee] px-1.5 py-0.5 rounded border border-[#ede3d8]"
                    >
                      → What-If
                    </Link>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Main Chat Interface */}
        <div className="bg-white rounded-3xl border border-[#ede3d8] shadow-warm-sm overflow-hidden flex flex-col h-[520px]">
          {/* Messages Container */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4 bg-[#faf4ee]/30">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      isUser
                        ? "bg-[#c75d3e] text-white shadow-xs"
                        : "bg-white text-[#3a6b4c] border border-[#ede3d8] shadow-xs"
                    }`}
                  >
                    {isUser ? <User size={15} /> : <Bot size={16} />}
                  </div>

                  <div
                    className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? "bg-[#c75d3e] text-white shadow-warm-sm"
                        : "bg-white text-[#241b16] border border-[#ede3d8] shadow-xs space-y-2"
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>

                    {/* Citations if assistant */}
                    {!isUser && msg.citations && msg.citations.length > 0 && (
                      <div className="pt-2 mt-2 border-t border-[#ede3d8] flex flex-wrap gap-1.5">
                        <span className="text-[10px] uppercase font-bold text-[#786d65]">Sources:</span>
                        {msg.citations.map((c, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-medium bg-[#faf4ee] text-[#786d65] px-2 py-0.5 rounded border border-[#ede3d8]"
                          >
                            {c.title}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Integrated What-If Action Link if scenario question */}
                    {!isUser &&
                      (msg.content.includes("fall") ||
                        msg.content.includes("drop") ||
                        msg.content.includes("price") ||
                        msg.content.includes("demand")) && (
                        <div className="pt-2 border-t border-[#ede3d8]">
                          <Link
                            href="/what-if"
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#c75d3e] hover:underline"
                          >
                            <SlidersHorizontal size={12} />
                            <span>Simulate this scenario live in What-If →</span>
                          </Link>
                        </div>
                      )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-[#786d65] bg-white p-3 rounded-xl border border-[#ede3d8] w-fit">
                <div className="w-2 h-2 rounded-full bg-[#c75d3e] animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-[#c75d3e] animate-bounce delay-100"></div>
                <div className="w-2 h-2 rounded-full bg-[#c75d3e] animate-bounce delay-200"></div>
                <span>Checking Punjab agricultural benchmarks...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-4 border-t border-[#ede3d8] bg-white flex items-center gap-2">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(inputValue);
                }
              }}
              placeholder="Ask anything about milk collection, PMEGP subsidy, feeder power, or cash flow..."
              className="flex-1 px-4 py-2.5 rounded-xl border border-[#ede3d8] text-xs sm:text-sm font-medium text-[#241b16] focus:border-[#c75d3e] focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim() || isTyping}
              className="p-2.5 px-4 rounded-xl bg-[#c75d3e] hover:bg-[#bd5537] text-white font-bold text-xs disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-warm-sm"
            >
              <span>Send</span>
              <Send size={14} />
            </button>
          </div>
        </div>

        {/* Bottom Navigation Bridges */}
        <div className="flex items-center justify-between pt-4 border-t border-[#ede3d8]">
          <Link
            href="/financing"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#ede3d8] bg-white text-[#382f29] font-bold text-xs hover:bg-[#faf4ee] transition-colors"
          >
            <span>← Back to Financing Routes</span>
          </Link>

          <Link
            href="/what-if"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#c75d3e] hover:bg-[#bd5537] text-white font-bold text-xs shadow-warm-md transition-all transform hover:-translate-y-0.5"
          >
            <span>Proceed to What-If Simulator</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </AppShell>
  );
}

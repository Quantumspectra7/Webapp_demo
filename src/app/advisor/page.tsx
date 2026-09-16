"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { AppShell } from "@/components/layout/AppShell";
import { useApp } from "@/context/AppContext";
import { advisorService, marketService } from "@/services";
import { AdvisorMessage, ViabilityScore } from "@/domain";
import { formatCurrency } from "@/lib/formatters";
import {
  createSpeechRecognizer,
  isSpeechRecognitionSupported,
  speechSynthesizer,
  isSpeechSynthesisSupported,
} from "@/lib/voiceService";
import {
  Send,
  RotateCcw,
  Sparkles,
  Bot,
  User,
  SlidersHorizontal,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Coins,
  ShieldAlert,
  FileText,
  MapPin,
  Building,
  Scale,
  Award,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Square,
  Pause,
  Play,
} from "lucide-react";

export default function AdvisorPage() {
  const { location, business, profile, financialScenario, language } = useApp();
  const [messages, setMessages] = useState<AdvisorMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [viability, setViability] = useState<ViabilityScore | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Voice Interaction States
  const [voiceState, setVoiceState] = useState<"idle" | "listening" | "processing" | "speaking">("idle");
  const [liveTranscript, setLiveTranscript] = useState("");
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Contextual suggested questions strictly relevant to current business & decisions
  const contextualPrompts = React.useMemo(() => [
    { text: `What is my viability score and what affects it?`, isWhatIf: false },
    { text: "Can I afford this venture with my available capital?", isWhatIf: false },
    { text: "Which government scheme best fits my business?", isWhatIf: false },
    { text: "What is my biggest financial risk?", isWhatIf: false },
    { text: "What happens if my revenue falls 20%?", isWhatIf: true },
    { text: `Compare ${business?.title || "my business"} to other options.`, isWhatIf: false },
  ], [business?.title]);

  useEffect(() => {
    async function loadInitialData() {
      const history = await advisorService.getHistory();
      setMessages(history);
      try {
        const v = await marketService.getViabilityScore();
        setViability(v);
      } catch (err) {
        console.warn("Could not load viability", err);
      }
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Stop TTS Audio
  const stopTts = () => {
    speechSynthesizer.stop();
    setSpeakingMessageId(null);
    setVoiceState("idle");
    setIsPaused(false);
  };

  const pauseTts = () => {
    speechSynthesizer.pause();
    setIsPaused(true);
  };

  const resumeTts = () => {
    speechSynthesizer.resume();
    setIsPaused(false);
  };

  // Play TTS Audio for a specific message
  const playTtsForMessage = (messageId: string, content: string) => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }

    speechSynthesizer.stop();
    setSpeakingMessageId(messageId);
    setVoiceState("speaking");
    setIsPaused(false);

    speechSynthesizer.speak(content, language, {
      onStart: () => {
        setSpeakingMessageId(messageId);
        setVoiceState("speaking");
        setIsPaused(false);
      },
      onEnd: () => {
        setSpeakingMessageId(null);
        setVoiceState("idle");
        setIsPaused(false);
      },
      onError: (err) => {
        console.warn("TTS playback error", err);
        setSpeakingMessageId(null);
        setVoiceState("idle");
        setIsPaused(false);
      },
    });
  };

  // Cancel voice recognition
  const cancelVoiceListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }
    setVoiceState("idle");
    setLiveTranscript("");
    setVoiceError(null);
  };

  // Finish voice recognition and submit
  const finishVoiceListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    if (liveTranscript.trim()) {
      handleSendMessage(liveTranscript.trim(), true);
    } else {
      setVoiceState("idle");
    }
  };

  // Toggle voice recognition
  const handleToggleVoice = () => {
    // If speaking, interrupt TTS immediately and start listening
    if (speechSynthesizer.isSpeaking() || voiceState === "speaking") {
      stopTts();
    }

    if (voiceState === "listening") {
      finishVoiceListening();
      return;
    }

    setVoiceError(null);
    setLiveTranscript("");

    if (!isSpeechRecognitionSupported()) {
      setVoiceError("Speech recognition is not supported in this browser. You can continue typing.");
      return;
    }

    let latest = "";

    const recognizer = createSpeechRecognizer(language, {
      onStart: () => {
        setVoiceState("listening");
      },
      onResult: (transcript, isFinal) => {
        latest = transcript;
        setLiveTranscript(transcript);
        if (isFinal) {
          handleSendMessage(transcript.trim(), true);
        }
      },
      onError: (errMessage) => {
        setVoiceState("idle");
        setVoiceError(errMessage);
      },
      onEnd: () => {
        setVoiceState((prev) => {
          if (prev === "listening") {
            if (latest.trim()) {
              handleSendMessage(latest.trim(), true);
              return "processing";
            }
            return "idle";
          }
          return prev;
        });
      },
    });

    if (recognizer) {
      recognitionRef.current = recognizer;
      try {
        recognizer.start();
      } catch (err) {
        console.warn("Could not start speech recognition", err);
      }
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      speechSynthesizer.stop();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
    };
  }, []);

  const handleSendMessage = async (text: string, isFromVoice = false) => {
    if (!text.trim()) return;

    // Interrupt any ongoing speech playback
    speechSynthesizer.stop();
    setSpeakingMessageId(null);

    setInputValue("");
    setLiveTranscript("");
    setIsTyping(true);
    if (isFromVoice) {
      setVoiceState("processing");
    } else {
      setVoiceState("idle");
    }

    try {
      const context = {
        business,
        location,
        financial: financialScenario,
        language,
        isVoiceQuery: isFromVoice,
      };

      const assistantReply = await advisorService.ask(text, context);
      const history = await advisorService.getHistory();
      setMessages(history);

      // If requested via voice, play spoken response
      if (isFromVoice && assistantReply && assistantReply.content) {
        playTtsForMessage(assistantReply.id, assistantReply.content);
      } else {
        setVoiceState("idle");
      }
    } catch (err) {
      console.error("Failed to get advisor reply", err);
      setVoiceState("idle");
    } finally {
      setIsTyping(false);
    }
  };

  const handleReset = async () => {
    stopTts();
    await advisorService.reset();
    const history = await advisorService.getHistory();
    setMessages(history);
  };

  const blockName = location?.block || "";
  const villageName = location?.villageOrTown || "";
  const bizTitle = business?.title || "Your Business";
  const ownCap = profile?.ownCapitalAvailable || 0;
  const projectCost = financialScenario?.totalProjectCost || 0;
  const dscrValue = financialScenario?.projections?.annualDSCR;
  const dscr = dscrValue ? `${dscrValue.toFixed(2)}x` : "—";
  return (
    <AppShell>
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Header & Current Context */}
        <div className="p-5 sm:p-6 rounded-3xl bg-[#faf4ee] border border-[#ede3d8] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider font-extrabold text-[#c75d3e] bg-white px-2.5 py-0.5 rounded-full border border-[#ede3d8]">
                Decision Engine
              </span>
              <span className="text-xs font-semibold text-[#786d65]">
                GramVest Advisor
              </span>
            </div>
            <h1 className="font-serif font-black text-2xl sm:text-3xl text-[#241b16] tracking-tight">
              GRAMVEST ADVISOR
            </h1>
            <p className="text-xs sm:text-sm text-[#786d65] font-medium">
              Your business decision partner — grounded in verified local market and financial data.
            </p>
            {/* Context Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-[#ede3d8] text-xs font-bold text-[#241b16] shadow-2xs">
                <MapPin size={13} className="text-[#c75d3e]" />
                <span>
                  {[villageName, blockName].filter(Boolean).join(", ") || "Location not set"}
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-[#ede3d8] text-xs font-bold text-[#241b16] shadow-2xs">
                <Building size={13} className="text-[#c75d3e]" />
                <span>{bizTitle}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white border border-[#ede3d8] text-xs font-bold text-[#241b16] shadow-2xs">
                <Coins size={13} className="text-[#c75d3e]" />
                {ownCap > 0 ? (
                  <span>Own Capital: <strong className="text-[#c75d3e] font-mono">{formatCurrency(ownCap)}</strong></span>
                ) : (
                  <span className="text-[#9e8e84]">Capital not set</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <Link
              href="/what-if"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#ede3d8] bg-white hover:bg-[#faf4ee] text-xs font-bold text-[#382f29] transition-all shadow-2xs"
            >
              <SlidersHorizontal size={14} className="text-[#c75d3e]" />
              <span>What-If Simulator</span>
            </Link>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#ede3d8] bg-white hover:bg-[#faf4ee] text-xs font-bold text-[#786d65] transition-all shadow-2xs"
            >
              <RotateCcw size={13} />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Compact Advisor Brief (Shown as first screen overview) */}
        <div className="bg-white rounded-3xl border border-[#ede3d8] p-5 sm:p-6 shadow-warm-sm space-y-4">
          <div className="flex items-center justify-between border-b border-[#ede3d8] pb-3">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-[#c75d3e]" />
              <span className="text-xs uppercase font-extrabold tracking-wider text-[#786d65]">
                Advisor Brief
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f2f8f4] border border-[#d5eadb] text-xs font-bold text-[#2d5c3f]">
              <span className="w-2 h-2 rounded-full bg-[#3a6b4c]"></span>
              <span>Verdict: {viability?.verdict || "Viable with Caution"} ({viability?.overallScore || 78}/100)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="p-3.5 rounded-2xl bg-[#faf4ee] border border-[#ede3d8]">
              <span className="text-[10px] uppercase font-bold text-[#786d65] tracking-wider block">
                Market
              </span>
              <p className="text-xs font-bold text-[#241b16] mt-1">
                {viability?.statusPills?.[0]?.status ? `${viability.statusPills[0].status} Catchment` : "Catchment Data"}
              </p>
              <p className="text-[11px] text-[#786d65] mt-0.5">
                {viability?.components?.[0]?.driver
                  ? viability.components[0].driver.slice(0, 60) + "..."
                  : "Market analysis loading..."}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#faf4ee] border border-[#ede3d8]">
              <span className="text-[10px] uppercase font-bold text-[#786d65] tracking-wider block">
                Financial Fit
              </span>
              <p className="text-xs font-bold text-[#241b16] mt-1">
                {projectCost > 0 ? formatCurrency(projectCost) : "—"} Outlay
              </p>
              <p className="text-[11px] text-[#786d65] mt-0.5">
                {ownCap > 0 ? `${formatCurrency(ownCap)} equity` : "Capital not set"} · {dscr} DSCR
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#faf4ee] border border-[#ede3d8]">
              <span className="text-[10px] uppercase font-bold text-[#786d65] tracking-wider block">
                Risk
              </span>
              <p className="text-xs font-bold text-[#b54a2f] mt-1">
                {viability?.statusPills?.[4]?.status || "Moderate"} Risk Profile
              </p>
              <p className="text-[11px] text-[#786d65] mt-0.5">
                {viability?.components?.[4]?.driver
                  ? viability.components[4].driver.slice(0, 55) + "..."
                  : "Input cost & operational risks."}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#faf4ee] border border-[#ede3d8]">
              <span className="text-[10px] uppercase font-bold text-[#786d65] tracking-wider block">
                Top Concern
              </span>
              <p className="text-xs font-bold text-[#241b16] mt-1">
                Working Capital Buffer
              </p>
              <p className="text-[11px] text-[#786d65] mt-0.5">
                Maintain adequate seasonal procurement reserves.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#f2f8f4] border border-[#d5eadb]">
              <span className="text-[10px] uppercase font-bold text-[#2d5c3f] tracking-wider block">
                Recommended Next Step
              </span>
              <p className="text-xs font-bold text-[#284f36] mt-1">
                {viability?.components?.[2]?.improvementAction
                  ? viability.components[2].improvementAction.slice(0, 50) + "..."
                  : "Review scheme eligibility"}
              </p>
              <p className="text-[11px] text-[#306143] mt-0.5">
                Secure buyer commitments before loan application.
              </p>
            </div>
          </div>
        </div>

        {/* Suggested Quick Prompts */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#786d65] flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#c75d3e]" />
              <span>Contextual Decision Prompts:</span>
            </span>
            <span className="text-[11px] text-[#786d65]">Grounded in deterministic calculations</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {contextualPrompts.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(p.text)}
                className="px-3.5 py-1.5 rounded-xl bg-white hover:bg-[#fcedea] border border-[#ede3d8] hover:border-[#c75d3e]/40 text-xs font-semibold text-[#241b16] shadow-2xs transition-all text-left flex items-center gap-1.5"
              >
                <span>{p.text}</span>
                {p.isWhatIf && (
                  <span className="text-[10px] font-bold text-[#c75d3e] bg-[#faf4ee] px-1.5 py-0.5 rounded border border-[#ede3d8]">
                    What-If
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Main Chat Interface */}
        <div className="bg-white rounded-3xl border border-[#ede3d8] shadow-warm-sm overflow-hidden flex flex-col h-[560px]">
          {/* Messages Container */}
          <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4 bg-[#faf4ee]/30">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              const structured = msg.structuredData;

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
                        : "bg-white text-[#241b16] border border-[#ede3d8] shadow-xs space-y-3"
                    }`}
                  >
                    {/* Verdict & Confidence Badge for Assistant */}
                    {!isUser && structured?.verdict && (
                      <div className="flex items-center justify-between pb-2 border-b border-[#ede3d8]">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#faf4ee] text-[#c75d3e] border border-[#ede3d8]">
                          Verdict: {structured.verdict}
                        </span>
                        {structured.confidence && (
                          <span className="text-[10px] font-bold uppercase text-[#786d65]">
                            Confidence: {structured.confidence}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Conversational Answer */}
                    <div className="flex items-start justify-between gap-2">
                      <p className={`whitespace-pre-line flex-1 ${isUser ? "text-white" : "text-[#241b16]"}`}>
                        {msg.content}
                      </p>
                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => {
                            if (speakingMessageId === msg.id) {
                              stopTts();
                            } else {
                              playTtsForMessage(msg.id, msg.content);
                            }
                          }}
                          title={speakingMessageId === msg.id ? "Stop voice playback" : "Read response aloud (Text-to-Speech)"}
                          aria-label={speakingMessageId === msg.id ? "Stop voice playback" : "Read response aloud"}
                          className={`p-1.5 px-2 rounded-lg text-[11px] font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1 ${
                            speakingMessageId === msg.id
                              ? "bg-red-500 text-white animate-pulse"
                              : "bg-[#faf4ee] hover:bg-[#ede3d8] text-[#786d65] hover:text-[#241b16]"
                          }`}
                        >
                          {speakingMessageId === msg.id ? (
                            <>
                              <VolumeX size={13} />
                              <span className="text-[10px]">Stop</span>
                            </>
                          ) : (
                            <>
                              <Volume2 size={13} className="text-[#c75d3e]" />
                              <span className="text-[10px]">Listen</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Render Structured Decision Cards if available */}
                    {!isUser && structured && (
                      <div className="space-y-3 pt-2 border-t border-[#ede3d8]">

                        {/* Financial Snapshot Card */}
                        {structured.financial_snapshot && structured.financial_snapshot.length > 0 && (
                          <div className="bg-[#f7f5f2] rounded-xl p-3 border border-[#e8e2d9]">
                            <div className="flex items-center gap-1.5 mb-2 text-[#786d65] font-bold text-[10px] uppercase tracking-wider">
                              <Coins size={12} className="text-[#c75d3e]" />
                              <span>Financial Snapshot</span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {structured.financial_snapshot.map((item, idx) => (
                                <div key={idx} className="bg-white p-2 rounded-lg border border-[#ede3d8]">
                                  <span className="text-[10px] text-[#786d65] block">{item.label}</span>
                                  <span className="text-xs font-bold text-[#241b16] font-mono">{item.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Market Evidence Card */}
                        {structured.market_evidence && structured.market_evidence.length > 0 && (
                          <div className="bg-[#f9f8f5] rounded-xl p-3 border border-[#ebe5dc]">
                            <div className="flex items-center gap-1.5 mb-1.5 text-[#54483e] font-bold text-[10px] uppercase tracking-wider">
                              <TrendingUp size={12} className="text-[#c75d3e]" />
                              <span>Market Evidence</span>
                            </div>
                            <ul className="list-disc pl-4 space-y-1 text-[#382f29] text-xs">
                              {structured.market_evidence.map((ev, i) => (
                                <li key={i}>{ev}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Key Findings Card */}
                        {structured.key_findings && structured.key_findings.length > 0 && (
                          <div className="bg-[#f0f4f8] rounded-xl p-3 border border-[#d0e1f0]">
                            <div className="flex items-center gap-1.5 mb-1 text-[#2b5c8f] font-bold text-[10px] uppercase tracking-wider">
                              <Sparkles size={12} />
                              <span>Key Findings</span>
                            </div>
                            <ul className="list-disc pl-4 space-y-1 text-[#30485f] text-xs">
                              {structured.key_findings.map((f, i) => (
                                <li key={i}>{f}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Top Risks Card */}
                        {structured.risks && structured.risks.length > 0 && (
                          <div className="bg-[#fdf3f1] rounded-xl p-3 border border-[#f5d9d4]">
                            <div className="flex items-center gap-1.5 mb-1 text-[#b54a2f] font-bold text-[10px] uppercase tracking-wider">
                              <ShieldAlert size={12} />
                              <span>Risks & Watchouts</span>
                            </div>
                            <ul className="list-disc pl-4 space-y-1 text-[#7a321f] text-xs">
                              {structured.risks.map((r, i) => (
                                <li key={i}>{r}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Government Scheme Matches Card */}
                        {structured.scheme_matches && structured.scheme_matches.length > 0 && (
                          <div className="bg-[#f5f2f9] rounded-xl p-3 border border-[#e2d8f0]">
                            <div className="flex items-center gap-1.5 mb-1 text-[#6b429c] font-bold text-[10px] uppercase tracking-wider">
                              <FileText size={12} />
                              <span>Scheme Matches</span>
                            </div>
                            <div className="space-y-1.5">
                              {structured.scheme_matches.map((sch, i) => (
                                <div key={i} className="text-xs text-[#4d2f70]">
                                  <strong>{sch.name}</strong> &nbsp;·&nbsp; {sch.subsidy}
                                  <p className="text-[11px] text-[#6b429c]/80 mt-0.5">{sch.note}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Recommendations Card */}
                        {structured.recommendations && structured.recommendations.length > 0 && (
                          <div className="bg-[#f2f8f4] rounded-xl p-3 border border-[#d5eadb]">
                            <div className="flex items-center gap-1.5 mb-1 text-[#2d5c3f] font-bold text-[10px] uppercase tracking-wider">
                              <CheckCircle2 size={12} />
                              <span>Actionable Recommendations</span>
                            </div>
                            <ul className="list-disc pl-4 space-y-1 text-[#284f36] text-xs">
                              {structured.recommendations.map((r, i) => (
                                <li key={i}>{r}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Next Actions */}
                        {structured.next_actions && structured.next_actions.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {structured.next_actions.map((action, i) => (
                              <Link
                                key={i}
                                href={action.route || "#"}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#c75d3e] text-white text-xs font-bold shadow-xs hover:bg-[#bd5537] transition-all"
                              >
                                {action.label} <ArrowRight size={12} />
                              </Link>
                            ))}
                          </div>
                        )}
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
                <span>Synthesizing verified GramVest calculations...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 sm:p-4 border-t border-[#ede3d8] bg-white flex flex-col gap-2.5">
            {/* Live Voice Listening Overlay */}
            {voiceState === "listening" && (
              <div className="p-3 rounded-2xl bg-[#fff2ee] border border-[#c75d3e]/30 flex items-center justify-between gap-3 text-xs animate-in fade-in">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <span className="flex h-2.5 w-2.5 relative shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                  </span>
                  <span className="font-bold text-[#c75d3e] shrink-0">Listening...</span>
                  <span className="text-[#382f29] italic truncate">
                    {liveTranscript ? `“${liveTranscript}”` : "Speak your query (e.g. 'Can I afford this business?' or 'Biggest financial risk?')..."}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={finishVoiceListening}
                    className="px-3 py-1.5 rounded-lg bg-[#c75d3e] text-white text-[11px] font-bold hover:bg-[#b34f32] cursor-pointer shadow-2xs"
                  >
                    Send
                  </button>
                  <button
                    type="button"
                    onClick={cancelVoiceListening}
                    className="px-2.5 py-1.5 rounded-lg border border-[#ede3d8] bg-white text-[#786d65] text-[11px] font-medium hover:bg-[#faf4ee] cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Speaking Audio Bar */}
            {voiceState === "speaking" && (
              <div className="p-2.5 sm:p-3 rounded-2xl bg-[#faf4ee] border border-[#ede3d8] flex items-center justify-between gap-3 text-xs animate-in fade-in">
                <div className="flex items-center gap-2 text-[#241b16]">
                  <span className="p-1 rounded-md bg-[#fcedea] text-[#c75d3e]">
                    <Volume2 size={15} className="animate-pulse" />
                  </span>
                  <span className="font-bold">Speaking Advisor Response</span>
                  {isPaused && <span className="text-[11px] text-[#786d65] font-normal">(Paused)</span>}
                </div>
                <div className="flex items-center gap-2">
                  {isPaused ? (
                    <button
                      type="button"
                      onClick={resumeTts}
                      className="px-2.5 py-1 rounded-lg border border-[#ede3d8] bg-white text-xs font-semibold text-[#241b16] hover:bg-[#faf4ee] cursor-pointer"
                    >
                      Resume
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={pauseTts}
                      className="px-2.5 py-1 rounded-lg border border-[#ede3d8] bg-white text-xs font-semibold text-[#241b16] hover:bg-[#faf4ee] cursor-pointer"
                    >
                      Pause
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={stopTts}
                    className="px-2.5 py-1 rounded-lg bg-[#c75d3e] text-white text-xs font-bold hover:bg-[#bd5537] cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <Square size={12} />
                    <span>Stop</span>
                  </button>
                </div>
              </div>
            )}

            {voiceError && (
              <div className="p-2.5 rounded-xl bg-[#fdf3f1] border border-[#f5d9d4] flex items-center justify-between text-xs text-[#b54a2f] animate-in fade-in">
                <span>{voiceError}</span>
                <button
                  type="button"
                  onClick={() => setVoiceError(null)}
                  className="text-[11px] font-bold underline hover:no-underline ml-2 cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Input Row */}
            <div className="flex items-center gap-2">
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
                placeholder="Type question or tap mic to speak..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-[#ede3d8] text-xs sm:text-sm font-medium text-[#241b16] focus:border-[#c75d3e] focus:outline-none shadow-2xs"
              />

              {/* Native Push-to-Talk Mic Button */}
              <button
                type="button"
                onClick={handleToggleVoice}
                title={voiceState === "listening" ? "Stop listening" : "Speak query (English, Hindi, Punjabi)"}
                aria-label={voiceState === "listening" ? "Stop listening" : "Speak query to AI Advisor"}
                className={`p-2.5 px-3 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-2xs ${
                  voiceState === "listening"
                    ? "bg-red-500 text-white animate-pulse ring-2 ring-red-400/50"
                    : "border border-[#ede3d8] bg-white text-[#786d65] hover:text-[#c75d3e] hover:bg-[#fcedea]"
                }`}
              >
                {voiceState === "listening" ? (
                  <>
                    <MicOff size={16} />
                    <span className="hidden sm:inline">Listening</span>
                  </>
                ) : (
                  <>
                    <Mic size={16} className="text-[#c75d3e]" />
                    <span className="hidden sm:inline">Voice</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleSendMessage(inputValue)}
                disabled={!inputValue.trim() || isTyping}
                className="p-2.5 px-4 rounded-xl bg-[#c75d3e] hover:bg-[#bd5537] text-white font-bold text-xs disabled:opacity-50 transition-all flex items-center gap-1.5 shadow-warm-sm cursor-pointer"
              >
                <span>Send</span>
                <Send size={14} />
              </button>
            </div>
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

import { useState, type FormEvent } from "react";
import { MessageCircle, Plus, Send, X } from "lucide-react";
import { useStore } from "../context/StoreContext.tsx";
import { api } from "../lib/api.ts";
import type { ChatMessage } from "../types/fashion.ts";
import { SafeFashionImage } from "./SafeFashionImage.tsx";

const QUICK_PROMPTS = [
  "Suggest an outfit under ₹1500",
  "What shoes match my black dress?",
  "Which watch goes with formal clothes?",
  "I have white sneakers. What clothes should I buy?",
  "Find a complete birthday outfit under ₹2500",
];

export function FashionChatbot() {
  const { isChatOpen, setIsChatOpen, openProductModal, addToCart } = useStore();
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your StyleMate personal stylist. Ask me for outfit ideas under any budget, colour pairings, or occasion recommendations.",
      timestamp: new Date().toISOString(),
    },
  ]);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    const userMsg: ChatMessage = {
      id: `u_${Date.now()}`,
      role: "user",
      content: trimmed,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setSending(true);

    try {
      const res = await api.sendChatMessage(trimmed);
      const botMsg: ChatMessage = {
        id: `a_${Date.now()}`,
        role: "assistant",
        content: res.reply,
        recommendedProducts: res.recommendedProducts,
        totalBundlePrice: res.totalBundlePrice,
        engineSource: res.engineSource,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: "assistant",
          content: "I had trouble reaching the styling server. Please try again in a moment.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {!isChatOpen && (
        <button
          type="button"
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2.5 px-5 py-3 rounded-full bg-[#B83B67] text-white text-sm font-semibold shadow-lg hover:bg-[#9B2D54] transition-transform hover:-translate-y-0.5 cursor-pointer"
          aria-label="Open TIVANA Chatbot"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Ask Stylist</span>
        </button>
      )}

      {isChatOpen && (
        <div
          className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] sm:w-[400px] h-[560px] max-h-[82vh] bg-white border border-rose-900/15 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          role="dialog"
          aria-label="StyleMate AI Fashion Assistant"
        >
          {/* Chat Header */}
          <div className="px-5 py-3.5 bg-[#FAF3F5] border-b border-rose-900/10 flex items-center justify-between">
            <div>
              <h3 className="font-display text-lg font-semibold text-[#1D1518]">
                StyleMate Stylist Chat
              </h3>
              <p className="text-[11px] text-[#6C5D63]">
                Instant outfit &amp; colour pairing advice
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsChatOpen(false)}
              aria-label="Close stylist chat"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-[#6C5D63] hover:text-[#1D1518] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FDFBFA]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-[88%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-[#B83B67] text-white"
                      : "bg-white border border-rose-900/10 text-[#1D1518]"
                  }`}
                >
                  <p>{msg.content}</p>
                  {msg.engineSource && (
                    <p className="mt-1.5 text-[10px] uppercase tracking-wider text-[#6C5D63]">
                      {msg.engineSource === "live-ai" ? "Live Gemini AI" : "Smart Catalog Engine"}
                    </p>
                  )}
                </div>

                {/* Shoppable Product Recommendations inside chat */}
                {msg.recommendedProducts && msg.recommendedProducts.length > 0 && (
                  <div className="mt-2 w-[92%] space-y-2">
                    {msg.recommendedProducts.map((prod) => (
                      <div
                        key={prod.id}
                        className="flex items-center justify-between gap-2.5 p-2 rounded-xl bg-white border border-rose-900/10"
                      >
                        <button
                          type="button"
                          onClick={() => openProductModal(prod)}
                          className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer"
                        >
                          <div className="w-10 h-12 rounded-lg overflow-hidden bg-[#FAF3F5] shrink-0">
                            <SafeFashionImage
                              imageKey={prod.imageKey}
                              alt={prod.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-[#1D1518] truncate">
                              {prod.name}
                            </p>
                            <p className="text-[11px] text-[#6C5D63] tabular-nums">
                              ₹{prod.price.toLocaleString("en-IN")} · {prod.primaryColor}
                            </p>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => addToCart(prod)}
                          aria-label={`Add ${prod.name} to bag`}
                          className="w-8 h-8 rounded-lg bg-[#FAF3F5] hover:bg-[#B83B67] text-[#1D1518] hover:text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                    {msg.totalBundlePrice !== undefined && msg.totalBundlePrice > 0 && (
                      <p className="text-[11px] font-semibold text-[#B83B67] tabular-nums px-1">
                        Combined Bundle Total: ₹{msg.totalBundlePrice.toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
            {sending && (
              <div className="text-xs text-[#6C5D63] px-2">Styling recommendations...</div>
            )}
          </div>

          {/* Starter Prompts */}
          <div className="px-3 py-2 border-t border-rose-900/10 bg-white flex gap-1.5 overflow-x-auto">
            {QUICK_PROMPTS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => sendMessage(q)}
                className="px-2.5 py-1 rounded-lg bg-[#FAF3F5] hover:bg-[#FAEBF0] text-[11px] font-medium text-[#1D1518] whitespace-nowrap shrink-0 cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSubmit}
            className="p-3 border-t border-rose-900/10 bg-white flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for outfits, budgets, or colours..."
              className="flex-1 px-3 py-2 rounded-xl border border-rose-900/15 text-sm focus:outline-none focus:border-[#B83B67]"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              aria-label="Send message"
              className="w-10 h-10 rounded-xl bg-[#B83B67] text-white flex items-center justify-center hover:bg-[#9B2D54] disabled:opacity-50 cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}

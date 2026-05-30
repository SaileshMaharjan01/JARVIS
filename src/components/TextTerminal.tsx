import React, { useState, useRef, useEffect } from "react";
import { JarvisState, ChatMessage } from "../types";
import { Send, Terminal, HelpCircle, ExternalLink } from "lucide-react";

interface TextTerminalProps {
  state: JarvisState;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onStartListening: () => void;
  isSpeechSupported: boolean;
}

export const TextTerminal: React.FC<TextTerminalProps> = ({
  state,
  messages,
  onSendMessage,
  onStartListening,
  isSpeechSupported,
}) => {
  const [inputText, setInputText] = useState<string>("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll terminal chat to bottom when messages list updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || state === JarvisState.THINKING) return;
    onSendMessage(inputText.trim());
    setInputText("");
  };

  return (
    <div className="flex flex-col rounded-lg border border-[#00f0ff]/10 bg-slate-950/20 h-full relative overflow-hidden backdrop-blur-sm">
      {/* Decorative top header line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00f0ff]/20 to-transparent" />
      
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between bg-slate-950/40 p-3 border-b border-[#00f0ff]/10 select-none">
        <div className="flex items-center gap-1.5 font-display text-xs text-slate-300 font-semibold uppercase tracking-wider">
          <Terminal className="w-3.5 h-3.5 text-[#00f0ff]" /> COGNITIVE FEED
        </div>
        <div className="flex items-center gap-2 font-mono text-[9px] text-[#00f0ff]/50">
          <span>PACKETS_RECV: {messages.length}</span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">STATE: {state}</span>
        </div>
      </div>

      {/* Terminal chat messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 select-none">
            <div className="w-12 h-12 rounded-full border border-dashed border-[#00f0ff]/30 flex items-center justify-center animate-pulse">
              <Terminal className="w-5 h-5 text-[#00f0ff]" />
            </div>
            <div className="space-y-1">
              <p className="font-display text-xs text-[#00f0ff] uppercase tracking-widest glow-text-primary">
                Awaiting Connection
              </p>
              <p className="font-mono text-[10px] text-slate-400 max-w-xs leading-relaxed">
                Enter a question or trigger the microphone above to speak with J.A.R.V.I.S.
              </p>
            </div>
            
            <div className="bg-[#00f0ff]/5 rounded-md border border-[#00f0ff]/10 p-2.5 max-w-sm">
              <p className="font-mono text-[8px] text-[#00f0ff] tracking-wider text-left leading-relaxed">
                &gt;&gt; STARK_SYS_TIP: Click the central reactor to begin vocal commands, or select the prompt input below to transmit manually.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                className={`flex flex-col max-w-[85%] ${
                  isUser ? "ml-auto items-end" : "mr-auto items-start animate-fade-in"
                }`}
              >
                {/* Meta details */}
                <div className="flex items-center gap-2 font-mono text-[8px] text-slate-500 mb-1 select-none">
                  <span>{isUser ? "USER" : "J.A.R.V.I.S."}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                </div>

                {/* Message Bubble text */}
                <div
                  className={`rounded-lg p-3 text-xs leading-relaxed border ${
                    isUser
                      ? "bg-slate-900/40 border-[#00f0ff]/15 text-slate-100 shadow-[0_0_10px_rgba(0,240,255,0.05)]"
                      : "bg-[#00f0ff]/5 border-[#00f0ff]/20 text-[#00f0ff] shadow-[0_0_15px_rgba(0,240,255,0.08)]"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input panel prompt box */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-[#00f0ff]/10 bg-slate-950/40">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={state === JarvisState.THINKING}
            placeholder={
              state === JarvisState.THINKING
                ? "Jarvis is analyzing..."
                : "Transmit question to J.A.R.V.I.S. console..."
            }
            className="flex-1 bg-slate-950 border border-[#00f0ff]/15 rounded py-2 px-3 text-xs text-[#00f0ff]/90 placeholder-slate-600 focus:outline-none focus:border-[#00f0ff] focus:ring-1 focus:ring-[#00f0ff] font-mono transition-all"
            maxLength={1000}
          />
          <button
            type="submit"
            disabled={state === JarvisState.THINKING || !inputText.trim()}
            className="flex items-center justify-center p-2 rounded bg-[#00f0ff]/10 border border-[#00f0ff]/30 text-[#00f0ff] hover:bg-[#00f0ff]/20 active:bg-[#00f0ff]/30 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer"
            title="Transmit manually"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Responsive warning for iframe limitations */}
        {!isSpeechSupported && (
          <div className="mt-2 flex items-center justify-between text-[8px] font-mono text-[#ffaa00]/80">
            <span className="flex items-center gap-1">
              <HelpCircle className="w-2.5 h-2.5" /> IFRAME DETECTED: Mic speech recognition may fail unless opened directly.
            </span>
            <a
              href={window.location.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-0.5 text-[#00f0ff] hover:underline"
            >
              Open New Tab <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        )}
      </form>
    </div>
  );
};

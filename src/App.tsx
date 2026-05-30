import { useState, useEffect, useRef } from "react";
import { JarvisState, ChatMessage } from "./types";
import { HeaderHUD } from "./components/HeaderHUD";
import { JarvisCore } from "./components/JarvisCore";
import { AcousticWave } from "./components/AcousticWave";
import { DiagnosticsPanel } from "./components/DiagnosticsPanel";
import { TextTerminal } from "./components/TextTerminal";
import { Mic, MicOff, AlertCircle, HelpCircle, Power, Volume2 } from "lucide-react";

export default function App() {
  const [state, setState] = useState<JarvisState>(JarvisState.IDLE);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [voiceAccent, setVoiceAccent] = useState<string>("UK Male");
  const [logs, setLogs] = useState<string[]>([]);
  const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(true);
  const [micWarning, setMicWarning] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Helper to append diagnostic console logs
  const addLog = (text: string) => {
    const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false });
    setLogs((prev) => [`[${timestamp}] ${text}`, ...prev.slice(0, 49)]);
  };

  // 1. Initialize Browser APIs (Speech Recognition & Synthesis)
  useEffect(() => {
    addLog("[SYSTEM_SYS] Booting J.A.R.V.I.S. neural pathways...");
    addLog("[SYSTEM_SYS] Initializing local holographic grids...");

    // Setup speech synthesis
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      synthRef.current = window.speechSynthesis;
      addLog("[SYSTEM_SYS] Audio synthesis engine connected successfully.");
    } else {
      addLog("[MALFUNCTION] Audio synthesis is unsupported in this browser container.");
    }

    // Setup speech recognition
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setState(JarvisState.LISTENING);
        addLog("[SYSTEM_SYS] Acoustic capture active... Awaiting user speech.");
      };

      rec.onresult = (event: any) => {
        const resultText = event.results[0][0].transcript;
        addLog(`[SYSTEM_SYS] Incoming vocal text caught: "${resultText}"`);
        handleSendMessage(resultText);
      };

      rec.onerror = (event: any) => {
        addLog(`[MALFUNCTION] Vocal capture error: ${event.error}`);
        setState(JarvisState.IDLE);
        if (event.error === "not-allowed") {
          setMicWarning(
            "Microphone access blocked or restricted! If you are viewing the app in the AI Studio preview pane, your browser restricts microphone voice recognition inside sandboxed frames. Please open the app in a 'New Tab' using the button at the bottom right to grant permission directly, or use the manual text console below."
          );
        }
      };

      rec.onend = () => {
        addLog("[SYSTEM_SYS] Audio transmission stream closed.");
        // Only return to IDLE if we didn't update to THINKING first on success
        setState((current) => (current === JarvisState.LISTENING ? JarvisState.IDLE : current));
      };

      recognitionRef.current = rec;
    } else {
      setIsSpeechSupported(false);
      addLog("[SYSTEM_SYS] Speech recognition not supported or blocked in iframe sandbox.");
    }

    addLog("[SYSTEM_SYS] J.A.R.V.I.S. mainframe initially active. Ready, Sir.");

    // Greet the user automatically on start after a tiny timeout
    const welcomeTimer = setTimeout(() => {
      speakText("At your service, Sir. J.A.R.V.I.S. is fully initialised. What diagnostics or queries shall we address today?");
      // Add first assistant message
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          text: "At your service, Sir. J.A.R.V.I.S. is fully initialised. What diagnostics or queries shall we address today?",
          timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
        }
      ]);
    }, 1200);

    return () => {
      clearTimeout(welcomeTimer);
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // 2. Play vocal synthesis back to user
  const speakText = (text: string) => {
    if (!synthRef.current || isMuted) {
      addLog(`[SYSTEM_SYS] Vocal synthesis bypassed (Muted or Unsupported).`);
      return;
    }

    // Cancel any ongoing vocal emissions
    synthRef.current.cancel();

    const cleanText = text.replace(/[*#`_\[\]()]/g, ""); // strip common markdown syntax
    const utterance = new SpeechSynthesisUtterance(cleanText);
    currentUtteranceRef.current = utterance;

    // Search for a suitable British male assistant voice representing J.A.R.V.I.S.
    const voices = synthRef.current.getVoices();
    let selectedVoice = null;

    if (voiceAccent === "UK Male") {
      selectedVoice =
        voices.find((v) => v.lang.includes("en-GB") && v.name.toLowerCase().includes("male")) ||
        voices.find((v) => v.lang.includes("en-GB")) ||
        voices.find((v) => v.lang.includes("en-IN") && v.name.toLowerCase().includes("male")) ||
        voices.find((v) => v.lang.includes("en-US") && v.name.toLowerCase().includes("male")) ||
        voices[0];
    } else {
      // Custom generic clear voice
      selectedVoice =
        voices.find((v) => v.lang.includes("en-US") && v.name.toLowerCase().includes("male")) ||
        voices.find((v) => v.lang.includes("en")) ||
        voices[0];
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.pitch = 0.98; // sleek slightly deeper elegant British tone
    utterance.rate = 1.02; // crisp pacing

    utterance.onstart = () => {
      setState(JarvisState.SPEAKING);
      addLog("[JARVIS] Vocal transmission initiated.");
    };

    utterance.onend = () => {
      setState(JarvisState.IDLE);
      addLog("[JARVIS] Vocal transmission complete.");
    };

    utterance.onerror = (e) => {
      console.warn("Speech synthesis error", e);
      setState(JarvisState.IDLE);
      addLog("[MALFUNCTION] Audio synthesis stream interrupted.");
    };

    synthRef.current.speak(utterance);
  };

  // 3. Initiate vocal speech recognition interface
  const handleStartListening = async () => {
    // Dismiss any existing warning
    setMicWarning(null);

    // Stop speaking if speaking to allow user to interject
    if (synthRef.current) {
      synthRef.current.cancel();
    }

    if (!recognitionRef.current) {
      addLog("[MALFUNCTION] Speech recognition is unsupported or restricted in this browser environment.");
      setMicWarning(
        "Vocal speech recognition is not supported or was blocked on this browser configuration. Please click 'Open New Tab' at the bottom to grant microphone access, or use the manual text console below."
      );
      return;
    }

    try {
      addLog("[SYSTEM_SYS] Triggering voice capturer...");
      recognitionRef.current.start();
    } catch (err: any) {
      if (err.name === "InvalidStateError") {
        // Speech recognition is already running, toggle it off to restart clean
        addLog("[SYSTEM_SYS] Recalibrating active vocal listening stream.");
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      } else {
        addLog(`[MALFUNCTION] Web Speech start error: ${err.message}`);
        
        // Secondary fallback: explicitly query microphone permissions
        try {
          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            addLog("[SYSTEM_SYS] Requesting primary media stream access as fallback...");
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach((track) => track.stop());
            recognitionRef.current.start();
          }
        } catch (mediaErr: any) {
          addLog(`[MALFUNCTION] Hardware access permission denied: ${mediaErr.message}`);
          setMicWarning(
            "Microphone access was denied or is blocked in this container sandbox. Please click 'Open New Tab' at the bottom to grant permissions directly, or type your query in the manual text box."
          );
        }
      }
    }
  };

  // 4. Send Message event handler (orchestrates Server-Side API call)
  const handleSendMessage = async (rawText: string) => {
    if (!rawText.trim() || state === JarvisState.THINKING) return;

    // If currently speaking, stop speech on new input
    if (synthRef.current) {
      synthRef.current.cancel();
    }

    setState(JarvisState.THINKING);
    addLog(`[SYSTEM_SYS] Route packet dispatching to neural core.`);

    const timestamp = new Date().toLocaleTimeString("en-US", { hour12: false });
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      text: rawText,
      timestamp,
    };

    // Append to messages interface
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    try {
      // Establish query connection with fullstack express server /api/chat
      addLog("[SYSTEM_SYS] Connecting to secure server terminal...");
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: rawText,
          history: updatedMessages.map((m) => ({
            role: m.role,
            text: m.text,
          })),
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || "Internal response code mismatch");
      }

      const data = await response.json();
      addLog("[JARVIS] Server-side AI response compiled successfully.");

      const assistantMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: data.text,
        timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      speakText(data.text);
    } catch (err: any) {
      addLog(`[MALFUNCTION] Failed to parse neural response: ${err.message}`);
      setState(JarvisState.IDLE);

      const errorMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        text: "Apologies, Sir. An optical alignment fluctuation has disconnected my server gateway. Please verify that your system is online or that the Gemini API Key is configured in the AI Studio environment.",
        timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
      };
      setMessages((prev) => [...prev, errorMsg]);
      speakText(errorMsg.text);
    }
  };

  // Helper actions
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (!isMuted && synthRef.current) {
      synthRef.current.cancel();
    }
    addLog(`[SYSTEM_SYS] Speech playback toggled to: ${!isMuted ? "MUTED" : "UNMUTED"}`);
  };

  const clearLogs = () => {
    setLogs([]);
    addLog("[SYSTEM_SYS] Terminal diagnostic console log cleared.");
  };

  const toggleAccent = () => {
    const nextAccent = voiceAccent === "UK Male" ? "US Male" : "UK Male";
    setVoiceAccent(nextAccent);
    addLog(`[SYSTEM_SYS] Vocal synthesis dialect updated to: ${nextAccent}`);
  };

  return (
    <div className="min-h-screen bg-[#020617] text-cyan-400 flex flex-col font-sans scanlines relative overflow-hidden">
      {/* Background HUD Elements */}
      <div className="absolute inset-x-0 inset-y-0 pointer-events-none opacity-20 z-0 select-none">
        <div className="absolute top-10 left-10 w-48 h-48 border-t-2 border-l-2 border-cyan-500/30"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 border-b-2 border-r-2 border-cyan-500/30"></div>
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-cyan-900/30"></div>
        <div className="absolute top-0 left-1/2 w-[1px] h-full bg-cyan-900/30"></div>
      </div>

      {/* Atmospheric Glow circles */}
      <div className="absolute w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none top-1/2 left-1/4 -translate-y-1/2 select-none z-0" />
      <div className="absolute w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none bottom-10 right-1/4 select-none z-0" />

      {/* UI Corner Accents from mockup */}
      <div className="absolute top-0 left-0 w-24 h-24 border-t border-l border-cyan-500/40 pointer-events-none z-10" />
      <div className="absolute top-0 right-0 w-24 h-24 border-t border-r border-cyan-500/40 pointer-events-none z-10" />
      <div className="absolute bottom-0 left-0 w-24 h-24 border-b border-l border-cyan-500/40 pointer-events-none z-10" />
      <div className="absolute bottom-0 right-0 w-24 h-24 border-b border-r border-cyan-500/40 pointer-events-none z-10" />

      {/* Scrolling Data Streams */}
      <div className="absolute right-6 top-1/3 -translate-y-1/2 flex flex-col gap-2 opacity-30 pointer-events-none hidden xl:flex z-0 select-none">
        <div className="w-16 h-[2px] bg-cyan-700"></div>
        <div className="w-12 h-[2px] bg-cyan-700"></div>
        <div className="w-20 h-[2px] bg-cyan-400"></div>
        <div className="w-8 h-[2px] bg-cyan-700"></div>
        <div className="w-14 h-[2px] bg-cyan-700"></div>
      </div>
      <div className="absolute left-6 top-2/3 -translate-y-1/2 flex flex-col gap-2 opacity-30 pointer-events-none hidden xl:flex z-0 select-none">
        <div className="w-10 h-[2px] bg-cyan-700"></div>
        <div className="w-24 h-[2px] bg-cyan-400"></div>
        <div className="w-16 h-[2px] bg-cyan-700"></div>
        <div className="w-6 h-[2px] bg-cyan-700"></div>
      </div>

      {/* HUD background grid aesthetics */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00f0ff03_1px,transparent_1px),linear-gradient(to_bottom,#00f0ff05_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0 select-none" />
      
      {/* Core Header */}
      <div className="z-10">
        <HeaderHUD
          state={state}
          isMuted={isMuted}
          onToggleMute={toggleMute}
          onClearLogs={clearLogs}
          voiceAccent={voiceAccent}
          onToggleAccent={toggleAccent}
        />
      </div>

      {/* Main Grid Workspace */}
      <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch overflow-hidden z-10">
        
        {/* Left Section: Jarvis Hologram Core Viewport */}
        <section className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex-grow flex flex-col justify-center items-center rounded-lg border border-[#00f0ff]/10 bg-slate-950/45 p-6 relative overflow-hidden backdrop-blur-md min-h-[350px]">
            {/* Ambient sci-fi details */}
            <div className="absolute top-3 left-3 font-mono text-[8px] text-[#00f0ff]/30 tracking-widest uppercase">
              COGNITIVE_INTERFACE_PLANE
            </div>
            <div className="absolute top-3 right-3 flex items-center gap-1.5 font-mono text-[8px] text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              HUD_ACTIVE
            </div>

            {/* Glowing morphing liquefying Jarvis core inside */}
            <div className="w-full max-w-[320px] h-full max-h-[320px] flex items-center justify-center animate-hud-pulse relative py-4">
              
              {/* Floating Data Tags around Ring - Mockup style */}
              <div className="absolute -left-12 top-6 border-r border-[#00f0ff]/40 pr-3 text-right hidden sm:block pointer-events-none select-none">
                <div className="text-[8px] text-slate-500 tracking-[0.2em] font-mono uppercase">NEURAL SYNC</div>
                <div className="text-[10px] text-cyan-400 font-mono font-bold">ACTIVE_VER_8.5</div>
              </div>

              <div className="absolute -right-12 bottom-6 border-l border-[#00f0ff]/40 pl-3 text-left hidden sm:block pointer-events-none select-none">
                <div className="text-[8px] text-slate-500 tracking-[0.2em] font-mono uppercase">VOICE RECOG</div>
                <div className="text-[10px] text-cyan-400 font-mono font-bold">AUTHORIZED_SIR</div>
              </div>

              <JarvisCore state={state} isMuted={isMuted} />
            </div>

            {/* Tap to Talk Main Button UI panel */}
            <div className="mt-4 w-full flex flex-col items-center gap-2">
              <button
                onClick={handleStartListening}
                disabled={state === JarvisState.THINKING}
                className={`relative flex items-center justify-center gap-2 px-6 py-3.5 rounded-full border font-display text-xs tracking-widest font-bold font-semibold uppercase cursor-pointer select-none overflow-hidden group transition-all duration-300 w-full max-w-xs ${
                  state === JarvisState.LISTENING
                    ? "bg-[#ffaa00]/10 border-[#ffaa00] text-[#ffaa00]/90 shadow-[0_0_20px_rgba(255,170,0,0.25)] scale-[0.98]"
                    : state === JarvisState.SPEAKING
                      ? "bg-[#00f0ff]/15 border-[#00f0ff] text-white shadow-[0_0_25px_rgba(0,240,255,0.35)] animate-pulse"
                      : "bg-cyan-500/10 border-cyan-400 text-cyan-200 hover:bg-cyan-500/20 hover:border-cyan-300 hover:shadow-[0_0_20px_rgba(0,240,255,0.25)] active:scale-95"
                }`}
              >
                {/* Glowing moving highlights */}
                <div className="absolute -inset-x-20 top-0 h-[1px] bg-gradient-to-r from-transparent via-[#00f0ff]/40 to-transparent translate-y-[-1px] group-hover:animate-pulse" />
                
                {state === JarvisState.LISTENING ? (
                  <>
                    <MicOff className="w-4 h-4 animate-bounce text-[#ffaa00]" />
                    LISTENING FOR VOICE...
                  </>
                ) : state === JarvisState.THINKING ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-[#ffaa00] border-t-transparent rounded-full animate-spin" />
                    DECODING COMMAND...
                  </>
                ) : state === JarvisState.SPEAKING ? (
                  <>
                    <Volume2 className="w-4 h-4 text-[#00f0ff]" />
                    JARVIS TRANSMITTING
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 text-[#00f0ff] group-hover:scale-110 duration-200" />
                    TAP TO START TALKING
                  </>
                )}
              </button>
              
              <p className="font-mono text-[9px] text-[#00f0ff]/40 text-center tracking-wider max-w-xs pointer-events-none uppercase">
                {state === JarvisState.LISTENING 
                  ? "Speak into your system mic, click button to submit." 
                  : "Activates standard voice speech translation grid."
                }
              </p>
            </div>
          </div>
        </section>

        {/* Right Section: Bento Dashboard (Chat terminal feed + Live diagnostics logs) */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Top of Bento: Scrollable diagnostics console logs */}
          <div className="flex-1 min-h-[300px]">
            <TextTerminal
              state={state}
              messages={messages}
              onSendMessage={handleSendMessage}
              onStartListening={handleStartListening}
              isSpeechSupported={isSpeechSupported}
            />
          </div>

          {/* Bottom of Bento: Grid Stats diagnostics */}
          <div className="h-shrink select-none">
            <DiagnosticsPanel state={state} logs={logs} />
          </div>

        </section>

      </main>

      {/* Futuristic bottom visualizer line waveform */}
      <footer className="w-full mt-auto z-10">
        <AcousticWave state={state} />
      </footer>

      {/* Mic Warning Dialog */}
      {micWarning && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="border border-red-500/40 bg-[#090e16] w-full max-w-md p-6 rounded-lg relative overflow-hidden shadow-[0_0_30px_rgba(239,68,68,0.15)]">
            {/* Top red warning line */}
            <div className="absolute top-0 inset-x-0 h-[3px] bg-red-500 shadow-[0_0_10px_#ef4444]" />
            <div className="absolute top-3 left-3 font-mono text-[8px] text-red-400 font-bold tracking-widest">
              HARDWARE_INTERFACE_ALERT
            </div>

            <div className="flex gap-4 mt-4 items-start">
              <div className="rounded-full bg-red-500/10 p-2.5 border border-red-500/30 text-red-500 shrink-0">
                <AlertCircle className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h3 className="font-display text-sm font-bold tracking-wider text-red-400 uppercase">
                  Sensory Grid Obstructed
                </h3>
                <p className="font-mono text-[10px] text-slate-300 leading-relaxed">
                  {micWarning}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2.5 justify-end font-mono text-xs">
              <button
                onClick={() => setMicWarning(null)}
                className="px-4 py-2 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white rounded transition-all cursor-pointer"
              >
                DISMISS_ALERT
              </button>
              <a
                href={window.location.href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/40 text-red-400 hover:text-red-300 rounded transition-all flex items-center gap-1.5 cursor-pointer"
              >
                OPEN_NEW_TAB
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

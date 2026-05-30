import React, { useState, useEffect } from "react";
import { JarvisState } from "../types";
import { Clock, Volume2, VolumeX, ShieldAlert, Wifi, Sliders } from "lucide-react";

interface HeaderHUDProps {
  state: JarvisState;
  isMuted: boolean;
  onToggleMute: () => void;
  onClearLogs: () => void;
  voiceAccent: string;
  onToggleAccent: () => void;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  state,
  isMuted,
  onToggleMute,
  onClearLogs,
  voiceAccent,
  onToggleAccent,
}) => {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour12: false }));
    };
    
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="w-full border-b border-[#00f0ff]/10 bg-slate-950/45 backdrop-blur-md py-3 px-4 md:px-6 flex flex-wrap gap-4 items-center justify-between relative overflow-hidden select-none">
      {/* Decorative top cyan bar */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#00f0ff] to-transparent shadow-[0_0_10px_#00f0ff]" />

      {/* Brand title block */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-8 h-8 rounded border border-[#00f0ff]/30 bg-[#00f0ff]/5 overflow-hidden">
          {/* Animated small HUD ring inside branding */}
          <div className="absolute inset-0.5 rounded-full border border-dashed border-[#00f0ff]/30 animate-spin-slow" />
          <span className="font-display text-xs text-[#00f0ff] font-bold glow-text-primary">Jv</span>
        </div>
        
        <div className="flex flex-col">
          <h1 className="font-display font-black text-sm tracking-widest text-[#00f0ff] glow-text-primary">
            J.A.R.V.I.S.
          </h1>
          <span className="font-mono text-[8px] tracking-wider text-slate-400">
            SECURE VIRTUAL INTELLIGENCE CONSOLE // VER 85.2
          </span>
        </div>
      </div>

      {/* Center live network status */}
      <div className="hidden lg:flex items-center gap-6 font-mono text-[10px]">
        <div className="flex items-center gap-1.5">
          <Wifi className="w-3.5 h-3.5 text-[#00f0ff] animate-pulse" />
          <span className="text-[#00f0ff]/80">COGNITIVE_GRID: <strong className="text-[#00f0ff]">CONNECTED</strong></span>
        </div>

        <div className="flex items-center gap-1.5 border-l border-white/5 pl-6">
          <Clock className="w-3.5 h-3.5 text-[#00f0ff]" />
          <span className="text-[#00f0ff]/80">LOCAL TIME: <strong className="text-white tracking-widest">{time}</strong></span>
        </div>

        <div className="flex items-center gap-1.5 border-l border-white/5 pl-6">
          <ShieldAlert className="w-3.5 h-3.5 text-[#ffaa00]" />
          <span className="text-[#ffaa00]/90">SECURITY: <strong className="text-[#ffaa00]">LEVEL_S1</strong></span>
        </div>
      </div>

      {/* Responsive custom control inputs */}
      <div className="flex items-center gap-2">
        {/* Accent Toggle */}
        <button
          onClick={onToggleAccent}
          className="flex items-center gap-1 px-2 py-1.5 rounded border border-[#00f0ff]/15 bg-slate-900/30 hover:bg-[#00f0ff]/10 active:bg-[#00f0ff]/20 font-mono text-[9px] text-[#00f0ff] tracking-wider transition-all"
          title="Toggle UK (British) vs Generic voice styles"
        >
          <Sliders className="w-3 h-3 text-[#00f0ff]" />
          VOICE: {voiceAccent}
        </button>

        {/* Clear log history */}
        <button
          onClick={onClearLogs}
          className="px-2 py-1.5 rounded border border-neutral-800 bg-slate-950 hover:bg-neutral-900 active:bg-neutral-800 font-mono text-[9px] text-[#00f0ff]/50 hover:text-white tracking-wider transition-all"
        >
          CLEAR_LOGS
        </button>

        {/* Audio Output speaker mute/unmute control */}
        <button
          onClick={onToggleMute}
          className={`flex items-center justify-center p-2 rounded transition-all cursor-pointer ${
            isMuted
              ? "border border-red-500/30 bg-red-950/20 text-red-500 hover:bg-red-900/15"
              : "border border-[#00f0ff]/30 bg-[#00f0ff]/5 text-[#00f0ff] hover:bg-[#00f0ff]/10"
          }`}
          title={isMuted ? "Unmute Jarvis replies" : "Mute Jarvis replies"}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};

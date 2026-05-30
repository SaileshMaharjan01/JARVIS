import React from "react";
import { JarvisState } from "../types";

interface AcousticWaveProps {
  state: JarvisState;
}

export const AcousticWave: React.FC<AcousticWaveProps> = ({ state }) => {
  // Generate an array of heights and animation delays to make the wave feel highly organic and realistic
  const totalBars = 36;
  const barIndices = Array.from({ length: totalBars });

  const isActive = state === JarvisState.LISTENING || state === JarvisState.THINKING;

  return (
    <div className="w-full flex flex-col items-center justify-center py-4 px-6 border-t border-[#00f0ff]/10 bg-slate-950/20 backdrop-blur-sm relative overflow-hidden">
      {/* HUD Accent lines styling */}
      <div className="absolute top-0 left-0 w-8 h-1 border-t-2 border-l-2 border-[#00f0ff]/40" />
      <div className="absolute top-0 right-0 w-8 h-1 border-t-2 border-r-2 border-[#00f0ff]/40" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-[1px] bg-gradient-to-r from-transparent via-[#00f0ff]/30 to-transparent" />

      <div className="flex items-end justify-center gap-[4px] h-12 w-full max-w-lg px-8">
        {barIndices.map((_, idx) => {
          // Calculate a centered bell curve for wave height profile
          const distanceToCenter = Math.abs(idx - totalBars / 2);
          const centerFactor = Math.max(0.15, 1 - distanceToCenter / (totalBars / 2));
          // Max height based on center factor
          const heightPercent = centerFactor * 100;

          // Introduce some variation in animation durations and delays
          const duration = 0.6 + Math.sin(idx * 0.4) * 0.3;
          const delay = (idx % 4) * 0.15;

          return (
            <div
              key={idx}
              id={`acoustic-bar-${idx}`}
              className={`w-[4px] rounded-full transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-t from-[#005577] via-[#00f0ff] to-[#ffffff] shadow-[0_0_10px_#00f0ff]"
                  : "bg-neutral-800"
              }`}
              style={{
                height: isActive ? `${heightPercent}%` : "5px",
                animation: isActive ? `wave-bounce ${duration}s ease-in-out infinite alternate` : "none",
                animationDelay: isActive ? `${delay}s` : "0s",
              }}
            />
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-between w-full max-w-lg font-mono text-[9px] text-[#00f0ff]/40 px-2 select-none">
        <span className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${state === JarvisState.LISTENING ? "bg-[#00f0ff] animate-ping" : "bg-neutral-600"}`} />
          SENSORY_EAR_CH_L: {state === JarvisState.LISTENING ? "CAPTURING" : "STDBY"}
        </span>
        <span className="tracking-widest">
          {state === JarvisState.LISTENING && "AUDIO CAPTURE ACTIVE // WAITING FOR SIR"}
          {state === JarvisState.THINKING && "PROCESSING SPECTRAL ENCODING..."}
          {state === JarvisState.SPEAKING && "VOCAL EMITTER SYNCED"}
          {state === JarvisState.IDLE && "MICROPHONE STANDBY // READY"}
        </span>
        <span>
          RMS_VOL: {state === JarvisState.LISTENING ? "89.4 dB" : "0.0 dB"}
        </span>
      </div>
    </div>
  );
};

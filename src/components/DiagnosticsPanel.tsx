import React, { useState, useEffect } from "react";
import { JarvisState, DiagnosticMetrics } from "../types";
import { Cpu, Shield, Zap, RefreshCw, BarChart2, Radio } from "lucide-react";

interface DiagnosticsPanelProps {
  state: JarvisState;
  logs: string[];
}

export const DiagnosticsPanel: React.FC<DiagnosticsPanelProps> = ({ state, logs }) => {
  const [metrics, setMetrics] = useState<DiagnosticMetrics>({
    arcReactorPower: 100.0,
    armorIntegrity: 100.0,
    serverPing: 34,
    systemInferenceSpeed: 0.88,
    thrusterTemperature: 24,
    markModel: "MARK LXXXV",
    isOnline: true,
  });

  // Introduce subtle, premium variations in diagnostic variables to create high realism
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => {
        const driftReactor = (Math.random() - 0.5) * 0.1;
        const driftPing = Math.floor((Math.random() - 0.5) * 4);
        const driftThruster = (Math.random() - 0.5) * 0.4;
        
        return {
          ...prev,
          arcReactorPower: Math.max(99.4, Math.min(100.0, prev.arcReactorPower + driftReactor)),
          serverPing: Math.max(22, Math.min(65, prev.serverPing + driftPing)),
          thrusterTemperature: Math.max(22.0, Math.min(31.5, prev.thrusterTemperature + driftThruster)),
          systemInferenceSpeed: state === JarvisState.THINKING 
            ? 0.4 + Math.random() * 0.2 // faster when thinking
            : 0.8 + Math.random() * 0.1,
        };
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [state]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
      {/* Dynamic Telemetry Stats Grid */}
      <div className="flex flex-col gap-3 rounded-lg border border-[#00f0ff]/10 bg-slate-950/20 p-4 relative overflow-hidden">
        {/* HUD corners corner layout */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[#00f0ff]/30" />
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[#00f0ff]/30" />
        
        <div className="flex items-center justify-between border-b border-[#00f0ff]/15 pb-2 mb-1">
          <h3 className="font-display text-xs font-semibold tracking-wider text-[#00f0ff] flex items-center gap-1.5 glow-text-primary">
            <Radio className="w-3.5 h-3.5" /> STARK INTELLIGENCE SYSTEM
          </h3>
          <span className="font-mono text-[9px] text-[#00f0ff]/50">
            SYSTEM_UPTIME: 100%
          </span>
        </div>

        {/* Primary Metric 1: Arc Reactor Grid */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between font-mono text-[11px]">
            <span className="text-[#00f0ff]/70 flex items-center gap-1">
              <Zap className="w-3 h-3 text-[#ffaa00]" /> ARC_ENERGY_COUPLING
            </span>
            <span className="text-[#ffaa00] font-bold">
              {metrics.arcReactorPower.toFixed(2)} %
            </span>
          </div>
          <div className="w-full bg-[#1e293b]/50 rounded-full h-1.5 overflow-hidden border border-[#00f0ff]/10">
            <div 
              className="bg-gradient-to-r from-[#ffaa00] to-[#ffff66] h-full duration-1000 transition-all shadow-[0_0_8px_#ffaa00]"
              style={{ width: `${metrics.arcReactorPower}%` }}
            />
          </div>
        </div>

        {/* Primary Metric 2: Core Armor Suit integrity */}
        <div className="flex flex-col gap-1.5 mt-1">
          <div className="flex justify-between font-mono text-[11px]">
            <span className="text-[#00f0ff]/70 flex items-center gap-1">
              <Shield className="w-3 h-3" /> MARK_ARMOR_GRID
            </span>
            <span className="text-[#00f0ff] font-bold">
              {metrics.armorIntegrity.toFixed(1)} %
            </span>
          </div>
          <div className="w-full bg-[#1e293b]/50 rounded-full h-1.5 overflow-hidden border border-[#00f0ff]/10">
            <div 
              className="bg-gradient-to-r from-[#005577] to-[#00f0ff] h-full duration-1000 transition-all shadow-[0_0_8px_#00f0ff]"
              style={{ width: `${metrics.armorIntegrity}%` }}
            />
          </div>
        </div>

        {/* Auxiliary Metrics Grid */}
        <div className="grid grid-cols-2 gap-2.5 mt-2 pt-2 border-t border-[#00f0ff]/5">
          {/* Item 1 */}
          <div className="bg-slate-900/40 p-2 rounded border border-[#00f0ff]/5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-mono text-[8px] text-[#00f0ff]/40">NEURAL_PING</span>
              <span className="font-mono text-xs text-[#00f0ff] font-medium">{metrics.serverPing} ms</span>
            </div>
            <RefreshCw className="w-3.5 h-3.5 text-[#00f0ff]/30 animate-spin-slow" />
          </div>

          {/* Item 2 */}
          <div className="bg-slate-900/40 p-2 rounded border border-[#00f0ff]/5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-mono text-[8px] text-[#00f0ff]/40">INFERENCE_LATENCY</span>
              <span className="font-mono text-xs text-[#00f0ff] font-medium">{metrics.systemInferenceSpeed.toFixed(2)} s</span>
            </div>
            <Cpu className="w-3.5 h-3.5 text-[#00f0ff]/30" />
          </div>

          {/* Item 3 */}
          <div className="bg-slate-900/40 p-2 rounded border border-[#00f0ff]/5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-mono text-[8px] text-[#00f0ff]/40">CHASSIS_THRUSTERS</span>
              <span className="font-mono text-xs text-[#ffaa00] font-medium">{metrics.thrusterTemperature.toFixed(1)} °C</span>
            </div>
            <Zap className="w-3.5 h-3.5 text-[#ffaa00]/30" />
          </div>

          {/* Item 4 */}
          <div className="bg-slate-900/40 p-2 rounded border border-[#00f0ff]/5 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-mono text-[8px] text-[#00f0ff]/40">ACTIVE_REACTION_MODEL</span>
              <span className="font-mono text-xs text-white font-medium">{metrics.markModel}</span>
            </div>
            <BarChart2 className="w-3.5 h-3.5 text-neutral-400" />
          </div>
        </div>
      </div>

      {/* Futuristic Scrollable Logs console */}
      <div className="flex flex-col gap-2 rounded-lg border border-[#00f0ff]/10 bg-slate-950/20 p-4 relative overflow-hidden h-[185px]">
        {/* HUD borders corner layout */}
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[#00f0ff]/30" />
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[#00f0ff]/30" />

        <div className="flex items-center justify-between border-b border-[#00f0ff]/15 pb-2 mb-1">
          <h3 className="font-display text-xs font-semibold tracking-wider text-[#00f0ff] flex items-center gap-1.5 glow-text-primary">
            <Cpu className="w-3.5 h-3.5" /> MAIN_TERMINAL_LOG
          </h3>
          <span className="bg-[#00f0ff]/10 text-[#00f0ff] px-1.5 py-0.5 rounded text-[8px] font-mono tracking-widest uppercase">
            {state}
          </span>
        </div>

        <div 
          id="terminal-logs-scroll"
          className="flex-1 overflow-y-auto font-mono text-[10px] text-[#00f0ff]/70 space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-slate-800"
        >
          {logs.map((log, index) => {
            const hasSystem = log.includes("[SYSTEM_SYS]");
            const hasJarvis = log.includes("[JARVIS]");
            const hasError = log.includes("[MALFUNCTION]") || log.includes("[ERROR]");
            
            let colorClass = "text-[#00f0ff]/70";
            if (hasSystem) colorClass = "text-[#00c0ff]";
            if (hasJarvis) colorClass = "text-[#ffaa00]";
            if (hasError) colorClass = "text-red-500 font-bold animate-pulse";

            return (
              <div key={index} className={`leading-relaxed break-words hover:text-[#00f0ff] ${colorClass}`}>
                <span className="text-neutral-500 mr-1.5 select-none">&gt;&gt;</span>
                {log}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

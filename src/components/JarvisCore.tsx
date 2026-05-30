import React, { useEffect, useRef } from "react";
import { JarvisState } from "../types";

interface JarvisCoreProps {
  state: JarvisState;
  isMuted: boolean;
}

export const JarvisCore: React.FC<JarvisCoreProps> = ({ state, isMuted }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  // Keep track of parameters for smoothly transition waves
  const waveParams = useRef({
    phase: 0,
    amplitude: 15,
    frequency: 5,
    targetAmplitude: 15,
    pulseSpeed: 0.05,
    noiseFactor: 0,
    rotation: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      canvas.width = rect?.width || 320;
      canvas.height = rect?.height || 320;
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Main animation loop
    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const originX = width / 2;
      const originY = height / 2;
      const baseRadius = Math.min(width, height) * 0.28;

      ctx.clearRect(0, 0, width, height);

      // Adjust target wave properties based on JarvisState
      let speed = 0.04;
      switch (state) {
        case JarvisState.SPEAKING:
          waveParams.current.targetAmplitude = 25;
          waveParams.current.frequency = 6;
          speed = 0.08;
          waveParams.current.noiseFactor = 0.15;
          break;
        case JarvisState.THINKING:
          waveParams.current.targetAmplitude = 18;
          waveParams.current.frequency = 12;
          speed = 0.15;
          waveParams.current.noiseFactor = 0.08;
          break;
        case JarvisState.LISTENING:
          waveParams.current.targetAmplitude = 8;
          waveParams.current.frequency = 3;
          speed = 0.03;
          waveParams.current.noiseFactor = 0.02;
          break;
        case JarvisState.IDLE:
        default:
          waveParams.current.targetAmplitude = 10;
          waveParams.current.frequency = 4;
          speed = 0.02;
          waveParams.current.noiseFactor = 0.01;
          break;
      }

      // Smooth interpolation for fluid dynamics
      waveParams.current.amplitude += (waveParams.current.targetAmplitude - waveParams.current.amplitude) * 0.1;
      waveParams.current.phase += speed;
      waveParams.current.rotation += 0.003;

      // DRAWING LAYER 1: Core Glow / Shadow Layer
      ctx.shadowBlur = 25;
      ctx.shadowColor = state === JarvisState.THINKING 
        ? "rgba(255, 170, 0, 0.4)" 
        : state === JarvisState.SPEAKING 
          ? "rgba(0, 240, 255, 0.5)" 
          : "rgba(0, 240, 255, 0.2)";

      // DRAWING LAYER 2: Concentric Tech Rings (Static/Rotating Background)
      ctx.lineWidth = 1;
      ctx.strokeStyle = "rgba(0, 240, 255, 0.15)";
      
      // Ring A
      ctx.beginPath();
      ctx.arc(originX, originY, baseRadius * 1.5, 0, Math.PI * 2);
      ctx.stroke();

      // Ring B (Dashed Tech Ring)
      ctx.save();
      ctx.translate(originX, originY);
      ctx.rotate(waveParams.current.rotation);
      ctx.beginPath();
      ctx.setLineDash([4, 15, 8, 12]);
      ctx.arc(0, 0, baseRadius * 1.35, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Ring C (Outer Tick Ring)
      ctx.save();
      ctx.translate(originX, originY);
      ctx.rotate(-waveParams.current.rotation * 1.5);
      ctx.beginPath();
      ctx.setLineDash([20, 40, 2, 40]);
      ctx.strokeStyle = "rgba(0, 240, 255, 0.25)";
      ctx.arc(0, 0, baseRadius * 1.6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      // Core target reticle arcs
      ctx.strokeStyle = "rgba(0, 240, 255, 0.35)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const offsetAngle = (i * Math.PI) / 2 + waveParams.current.rotation * 0.5;
        ctx.beginPath();
        ctx.arc(originX, originY, baseRadius * 1.15, offsetAngle, offsetAngle + 0.3);
        ctx.stroke();
      }

      // DRAWING LAYER 3: The Liquefied Fluid Core (Drawn as a morphing polygon)
      const numPoints = 120;
      const points: { x: number; y: number }[] = [];

      for (let i = 0; i < numPoints; i++) {
        const angle = (i * Math.PI * 2) / numPoints;
        
        // Generate multi-octave sines for realistic fluid ripple
        const sineWave1 = Math.sin(angle * waveParams.current.frequency + waveParams.current.phase);
        const sineWave2 = Math.cos(angle * (waveParams.current.frequency / 2) - waveParams.current.phase * 1.5);
        const noise = (Math.random() - 0.5) * waveParams.current.noiseFactor * waveParams.current.amplitude;

        const deltaRadius = (sineWave1 + sineWave2 * 0.5) * waveParams.current.amplitude + noise;
        const currentRadius = baseRadius + deltaRadius;

        const x = originX + Math.cos(angle) * currentRadius;
        const y = originY + Math.sin(angle) * currentRadius;
        points.push({ x, y });
      }

      // Draw Fluid Inner Area
      ctx.shadowBlur = 30;
      if (state === JarvisState.THINKING) {
        ctx.fillStyle = "rgba(255, 170, 0, 0.12)";
        ctx.strokeStyle = "rgba(255, 170, 0, 0.85)";
        ctx.shadowColor = "rgba(255, 170, 0, 0.6)";
      } else if (state === JarvisState.LISTENING) {
        ctx.fillStyle = "rgba(0, 240, 255, 0.05)";
        ctx.strokeStyle = "rgba(0, 240, 255, 0.5)";
        ctx.shadowColor = "rgba(0, 240, 255, 0.3)";
      } else {
        ctx.fillStyle = "rgba(0, 240, 255, 0.16)";
        ctx.strokeStyle = "rgba(0, 240, 255, 0.9)";
        ctx.shadowColor = "rgba(0, 240, 255, 0.7)";
      }

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        // Curve to for smooth corners
        const xc = (points[i].x + points[i - 1].x) / 2;
        const yc = (points[i].y + points[i - 1].y) / 2;
        ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
      }
      ctx.quadraticCurveTo(
        points[points.length - 1].x,
        points[points.length - 1].y,
        points[0].x,
        points[0].y
      );
      ctx.closePath();
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.stroke();

      // Secondary Concentric Liquefied Core (Offset Phase)
      ctx.shadowBlur = 0; // Disable shadow for inner lines for clean visuals
      ctx.strokeStyle = state === JarvisState.THINKING 
        ? "rgba(255, 170, 0, 0.4)" 
        : "rgba(0, 240, 255, 0.4)";
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      const innerRatio = 0.72;
      for (let i = 0; i < numPoints; i++) {
        const angle = (i * Math.PI * 2) / numPoints;
        const sineWave1 = Math.sin(angle * (waveParams.current.frequency - 1) - waveParams.current.phase * 1.2);
        const wave = sineWave1 * (waveParams.current.amplitude * 0.6);
        const currentRadius = (baseRadius * innerRatio) + wave;

        const x = originX + Math.cos(angle) * currentRadius;
        const y = originY + Math.sin(angle) * currentRadius;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      // Tiny center core with high glow
      ctx.beginPath();
      ctx.shadowBlur = 20;
      ctx.shadowColor = state === JarvisState.THINKING ? "#ffaa00" : "#00f0ff";
      ctx.fillStyle = state === JarvisState.THINKING ? "#ffdd66" : "#e6ffff";
      ctx.arc(originX, originY, baseRadius * 0.15 + (state === JarvisState.SPEAKING ? Math.sin(waveParams.current.phase * 2) * 2 : 0), 0, Math.PI * 2);
      ctx.fill();

      // Crosshairs in the center surrounding the core
      ctx.shadowBlur = 0;
      ctx.strokeStyle = "rgba(0, 240, 255, 0.4)";
      ctx.lineWidth = 1;
      
      // Horizontal Line Ticks
      ctx.beginPath();
      ctx.moveTo(originX - baseRadius * 1.8, originY);
      ctx.lineTo(originX - baseRadius * 1.65, originY);
      ctx.moveTo(originX + baseRadius * 1.65, originY);
      ctx.lineTo(originX + baseRadius * 1.8, originY);
      
      // Vertical Line Ticks
      ctx.moveTo(originX, originY - baseRadius * 1.8);
      ctx.lineTo(originX, originY - baseRadius * 1.65);
      ctx.moveTo(originX, originY + baseRadius * 1.65);
      ctx.lineTo(originX, originY + baseRadius * 1.8);
      ctx.stroke();

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [state]);

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4 select-none">
      <canvas
        id="jarvis-core-canvas"
        ref={canvasRef}
        className="w-full h-full max-w-[340px] max-h-[340px]"
      />
      {/* Decorative absolute metric lines */}
      <div className="absolute top-1/2 left-2 right-2 border-t border-dashed border-[#00f0ff]/10 pointer-events-none" />
      <div className="absolute left-1/2 top-2 bottom-2 border-l border-dashed border-[#00f0ff]/10 pointer-events-none" />
      
      {state === JarvisState.SPEAKING && (
        <div className="absolute bottom-6 font-mono text-xs text-[#00f0ff]/80 font-semibold tracking-widest glow-text-primary">
          {!isMuted ? "VOCAL TRANSMISSION ACTIVE" : "SPEECH GENERATED (MUTED)"}
        </div>
      )}
      {state === JarvisState.THINKING && (
        <div className="absolute bottom-6 font-mono text-xs text-[#ffaa00] font-semibold tracking-widest animate-pulse">
          DIAGNOSING QUANTUM NODES
        </div>
      )}
      {state === JarvisState.LISTENING && (
        <div className="absolute bottom-6 font-mono text-xs text-[#00f0ff] animate-pulse tracking-widest font-semibold text-center h-5">
          CAPTURING USER VOCAL INPUT...
        </div>
      )}
    </div>
  );
};

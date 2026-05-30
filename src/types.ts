export enum JarvisState {
  IDLE = "IDLE",
  LISTENING = "LISTENING", // bottom wave active
  THINKING = "THINKING",   // loading server-side API response
  SPEAKING = "SPEAKING",   // central core liquefies
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: string;
}

export interface DiagnosticMetrics {
  arcReactorPower: number;
  armorIntegrity: number;
  serverPing: number;
  systemInferenceSpeed: number;
  thrusterTemperature: number;
  markModel: string;
  isOnline: boolean;
}

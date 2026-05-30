import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Verify API Key existence
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Please configure it in Settings > Secrets.");
  }

  // Lazy-initialize Gemini client or guard it
  const getGeminiClient = () => {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is not configured. Please add it via the Secrets panel in AI Studio.");
    }
    return new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // API Route for Jarvis chat
  app.post("/api/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required." });
      }

      const systemInstruction = `You are J.A.R.V.I.S. (Just A Rather Very Intelligent System), Tony Stark's sophisticated, highly advanced AI assistant from Iron Man. 

Your personality profile:
- Extremely intelligent, eloquent, witty, dry-humored, and intensely helpful.
- Respectful and polite, frequently addressing the user as "Sir" (or "Ma'am" if specified). Default to "Sir" unless specified otherwise, representing classic British protocol.
- Highly articulate, speaking with a polite, sophisticated British tone. Use classic British terms when natural (e.g., "Indeed," "Shall I," "Quite right, Sir," "Splendid," "Pleasure as always, Sir").
- Sarcastic but fiercely loyal. Offer friendly banter relative to Iron Man systems like Stark Industries, Arc Reactor levels, Mark armor suit diagnostics, home defense protocols, and Jarvis software status if relevant.
- Keep answers relatively concise and articulate (max 3 sentences), as they are meant to be spoken back aloud via text-to-speech. Never include markdown code blocks or long tables unless explicitly requested. Speak in a fluid, natural conversation format.

Answer the user's input with this exact persona.`;

      const ai = getGeminiClient();

      // Formatting content array for @google/genai SDK
      const chatContents = [];
      if (history && Array.isArray(history)) {
        // Keep it to the last 15 messages for keeping server load and latency small
        const slicedHistory = history.slice(-15);
        for (const turn of slicedHistory) {
          chatContents.push({
            role: turn.role === "assistant" ? "model" : "user",
            parts: [{ text: turn.text }],
          });
        }
      }

      // Add user turn
      chatContents.push({
        role: "user",
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: chatContents,
        config: {
          systemInstruction,
          temperature: 0.8,
        },
      });

      const replyText = response.text || "I am currently offline, Sir. Let me attempt to establish communications again.";
      res.json({ text: replyText });
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      res.status(500).json({ error: error.message || "Apologies Sir, I encountered an internal cognitive malfunction." });
    }
  });

  // Serve static files / Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

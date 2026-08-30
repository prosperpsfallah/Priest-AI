import express from "express";
import cors from "cors";
import OpenAI from "openai";
import serverless from "serverless-http";

const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Test route
app.get("/api/health", (req, res) => {
  res.json({
    status: "PRIEST AI Backend is Online ✅",
    hasKey:!!process.env.OPENAI_API_KEY
  });
});

// Main Chat Route
app.post("/api/chat", async (req, res) => {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({ error: "OPENAI_API_KEY is missing in Vercel" });
    }

    const { message, image } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    let messages = [
      {
        role: "system",
        content: "You are PRIEST AI, a helpful assistant for NAI GARMAI SCHOOL. Be clear, friendly, and helpful."
      }
    ];

    if (image) {
      messages.push({
        role: "user",
        content: [
          { type: "text", text: message },
          { type: "image_url", image_url: { url: image } }
        ]
      });
    } else {
      messages.push({ role: "user", content: message });
    }

    const completion = await openai.chat.completions.create({
      model: image? "gpt-4o" : "gpt-4o-mini",
      messages: messages
    });

    const answer = completion.choices[0].message.content;
    res.json({ answer: answer });

  } catch (error) {
    console.error("OpenAI Error:", error);
    res.status(500).json({ error: error.message });
  }
}); // <- THIS CLOSING BRACKET WAS MISSING

export default serverless(app); // <- AND THIS LINE
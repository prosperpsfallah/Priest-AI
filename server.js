import express from "express";
import cors from "cors";
import OpenAI from "openai";
import serverless from "serverless-http";

const app = express();

// Allow frontend to talk to backend
app.use(cors());
app.use(express.json());

// Connect to OpenAI using env variable
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Test route to check if backend is alive
app.get("/api/health", (req, res) => {
  res.json({ status: "PRIEST AI Backend is Online ✅" });
});

// Main Chat Route
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    console
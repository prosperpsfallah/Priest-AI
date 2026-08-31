const Groq = require("groq-sdk");
module.exports = async function handler(req, res) {
    // Only allow POST requests
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }
    try {
        // Check API key
        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({
                error: "GROQ_API_KEY is not configured in Vercel."
            });
        }
        // Get user's message
        const { message } = req.body || {};
        if (!message || typeof message !== "string") {
            return res.status(400).json({
                error: "Please enter a message."
            });
        }
        // Create Groq client
        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });
        // Send message to Groq
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content:
                        "You are PRIEST AI, a helpful, intelligent, friendly AI assistant. Answer the user's questions clearly and accurately. Be conversational and helpful. If you are unsure about something, say so instead of making up information."
                },
                {
                    role: "user",
                    content: message
                }
            ],
            temperature: 0.7,
            max_tokens: 2048
        });
        // Get AI response
        const reply =
            completion.choices?.[0]?.message?.content;
        if (!reply) {
            return res.status(500).json({
                error: "PRIEST AI did not return an answer."
            });
        }
        // Send answer back to frontend
        return res.status(200).json({
            success: true,
            reply: reply
        });
    } catch (error) {
        console.error("PRIEST AI BACKEND ERROR:", error);
        return res.status(500).json({
            error:
                error?.message ||
                "Something went wrong while contacting PRIEST AI."
        });
    }
};
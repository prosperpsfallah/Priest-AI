const Groq = require("groq-sdk");
module.exports = async (req, res) => {
    // Only accept POST requests
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            error: "Method not allowed. Use POST."
        });
    }
    try {
        // Check Groq API key
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return res.status(500).json({
                success: false,
                error: "GROQ_API_KEY is not configured in Vercel."
            });
        }
        // Read request body
        const body = req.body || {};
        const message = body.message;
        // Validate message
        if (!message || typeof message !== "string") {
            return res.status(400).json({
                success: false,
                error: "Message is required."
            });
        }
        // Create Groq client
        const groq = new Groq({
            apiKey: apiKey
        });
        // Ask the AI
        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content:
                        "You are PRIEST AI, a helpful, intelligent and friendly AI assistant. Answer questions clearly and accurately. Be conversational, useful and honest. If you do not know something, say so instead of inventing an answer."
                },
                {
                    role: "user",
                    content: message.trim()
                }
            ],
            temperature: 0.7,
            max_tokens: 2048
        });
        // Get AI answer
        const reply =
            completion.choices &&
            completion.choices[0] &&
            completion.choices[0].message &&
            completion.choices[0].message.content;
        if (!reply) {
            return res.status(500).json({
                success: false,
                error: "PRIEST AI returned an empty response."
            });
        }
        // Send answer to frontend
        return res.status(200).json({
            success: true,
            reply: reply
        });
    } catch (error) {
        console.error("PRIEST AI ERROR:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "AI backend error."
        });
    }
};
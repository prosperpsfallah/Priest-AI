const Groq = require("groq-sdk");
module.exports = async (req, res) => {
    // =========================
    // ONLY ALLOW POST REQUESTS
    // =========================
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            error: "Method not allowed. Use POST."
        });
    }
    try {
        // =========================
        // CHECK API KEY
        // =========================
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return res.status(500).json({
                success: false,
                error: "GROQ_API_KEY is not configured in Vercel."
            });
        }
        // =========================
        // GET USER MESSAGE
        // =========================
        const body = req.body || {};
        const message = body.message;
        if (!message || typeof message !== "string") {
            return res.status(400).json({
                success: false,
                error: "Message is required."
            });
        }
        const cleanMessage = message.trim();
        if (!cleanMessage) {
            return res.status(400).json({
                success: false,
                error: "Please enter a message."
            });
        }
        // =========================
        // CREATE GROQ CLIENT
        // =========================
        const groq = new Groq({
            apiKey: apiKey
        });
        // =========================
        // ASK PRIEST AI
        // =========================
        const completion =
            await groq.chat.completions.create({
                /*
                 * CURRENT GROQ MODEL
                 */
                model: "llama-3.1-8b-instant",
                messages: [
                    {
                        role: "system",
                        content:
                            "You are PRIEST AI, a helpful, intelligent, friendly and knowledgeable AI assistant. " +
                            "Answer the user's questions clearly and accurately. " +
                            "Be conversational and helpful. " +
                            "Explain difficult things in simple language when appropriate. " +
                            "Help with education, coding, writing, brainstorming, technology and general questions. " +
                            "If you are unsure about something, say so instead of making up information."
                    },
                    {
                        role: "user",
                        content: cleanMessage
                    }
                ],
                temperature: 0.7,
                max_tokens: 2048
            });
        // =========================
        // GET AI RESPONSE
        // =========================
        const reply =
            completion &&
            completion.choices &&
            completion.choices[0] &&
            completion.choices[0].message &&
            completion.choices[0].message.content;
        // =========================
        // CHECK RESPONSE
        // =========================
        if (!reply) {
            return res.status(500).json({
                success: false,
                error: "PRIEST AI returned an empty response."
            });
        }
        // =========================
        // SEND RESPONSE
        // =========================
        return res.status(200).json({
            success: true,
            reply: reply.trim()
        });
    } catch (error) {
        // =========================
        // BACKEND ERROR
        // =========================
        console.error(
            "PRIEST AI BACKEND ERROR:",
            error
        );
        return res.status(500).json({
            success: false,
            error:
                error &&
                error.message
                    ? error.message
                    : "Something went wrong while contacting PRIEST AI."
        });
    }
};
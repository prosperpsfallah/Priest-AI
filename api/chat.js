const Groq = require("groq-sdk");

module.exports = async function handler(req, res) {

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({
                error: "GROQ_API_KEY is not configured in Vercel."
            });
        }

        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });

        const message = req.body?.message;

        if (!message) {
            return res.status(400).json({
                error: "Please enter a message."
            });
        }

        console.log("PRIEST AI received:", message);

        const completion =
            await groq.chat.completions.create({

                model: "openai/gpt-oss-20b",

                messages: [
                    {
                        role: "system",
                        content:
                            "You are PRIEST AI. " +
                            "You are a helpful, intelligent and friendly AI assistant. " +
                            "Answer questions clearly and accurately. " +
                            "Help with education, mathematics, science, programming, " +
                            "technology, business, writing and general knowledge. " +
                            "Explain difficult topics step by step. " +
                            "Use simple language that people can understand. " +
                            "If you do not know something, say so instead of making up information."
                    },

                    {
                        role: "user",
                        content: message.trim()
                    }
                ],

                temperature: 0.7,

                max_completion_tokens: 2048,

                include_reasoning: false
            });

        const answer =
            completion.choices?.[0]?.message?.content;

        if (!answer) {
            return res.status(500).json({
                error: "AI returned an empty response."
            });
        }

        console.log("PRIEST AI answered successfully.");

        return res.status(200).json({
            success: true,
            answer: answer
        });

    } catch (error) {

        console.error(
            "PRIEST AI ERROR:",
            error
        );

        return res.status(500).json({
            error:
                error?.message ||
                "Failed to connect to PRIEST AI."
        });
    }
};
const Groq = require("groq-sdk");

module.exports = async function handler(req, res) {

    // Only accept POST requests
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed. Use POST."
        });
    }

    try {

        // Check API key
        if (!process.env.GROQ_API_KEY) {

            console.error("GROQ_API_KEY is missing");

            return res.status(500).json({
                error: "GROQ_API_KEY is not configured in Vercel."
            });
        }

        // Create Groq client
        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY
        });

        // Get message
        const body = req.body || {};
        const message = body.message;

        // Check message
        if (!message || typeof message !== "string") {

            return res.status(400).json({
                error: "No message was provided."
            });
        }

        console.log("PRIEST AI received:", message);

        // Ask Groq
        const completion = await groq.chat.completions.create({

            model: "openai/gpt-oss-20b",

            messages: [

                {
                    role: "system",
                    content:
                        "You are PRIEST AI, a helpful, intelligent and friendly AI assistant. " +
                        "Help users with questions, coding, education, mathematics, science, " +
                        "technology, business, writing and creative tasks. " +
                        "Give clear and useful answers. " +
                        "Your name is PRIEST AI."
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

        console.log("Groq response received");

        const answer =
            completion.choices?.[0]?.message?.content;

        if (!answer) {

            console.error("Groq returned no answer");

            return res.status(500).json({
                error: "Groq returned an empty response."
            });
        }

        // Send answer back to the website
        return res.status(200).json({
            answer: answer
        });

    } catch (error) {

        console.error(
            "PRIEST AI BACKEND ERROR:",
            error
        );

        return res.status(500).json({
            error:
                error?.message ||
                "PRIEST AI backend failed to connect to Groq."
        });
    }
};
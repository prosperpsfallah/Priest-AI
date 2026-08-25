const OpenAI = require("openai");

module.exports = async (req, res) => {
    try {
        if (req.method !== "POST") {
            return res.status(405).json({
                error: "Method not allowed"
            });
        }

        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "OPENAI_API_KEY is missing."
            });
        }

        const body =
            typeof req.body === "string"
                ? JSON.parse(req.body)
                : req.body;

        const message =
            String(body?.message || "").trim();

        if (!message) {
            return res.status(400).json({
                error: "Message is required."
            });
        }

        const openai = new OpenAI({
            apiKey: apiKey
        });

        const response = await openai.responses.create({
            model: "gpt-4o-mini",
            instructions:
                "You are PRIEST AI, a helpful and intelligent AI assistant. Give clear, useful and friendly answers.",
            input: message
        });

        return res.status(200).json({
            answer:
                response.output_text ||
                "I couldn't generate a response."
        });

    } catch (error) {

        console.error("PRIEST AI ERROR:", error);

        return res.status(500).json({
            error:
                error?.message ||
                "PRIEST AI request failed."
        });
    }
};
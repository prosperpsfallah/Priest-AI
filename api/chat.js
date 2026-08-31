const Groq = require("groq-sdk");
module.exports = async function handler(req, res) {
    // Only accept POST requests
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            error: "Method not allowed. Use POST."
        });
    }
    try {
        // Get API key
        const apiKey = process.env.GROQ_API_KEY;
        if (!apiKey) {
            return res.status(500).json({
                success: false,
                error: "GROQ_API_KEY is not configured in Vercel."
            });
        }
        // Get user's message
        const message = req.body?.message;
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
        // Get models available to this API key
        const modelResponse = await groq.models.list();
        const models = modelResponse.data || [];
        console.log(
            "AVAILABLE MODELS:",
            models.map(model => model.id)
        );
        // Models we prefer
        const preferredModels = [
            "openai/gpt-oss-120b",
            "openai/gpt-oss-20b",
            "llama-3.3-70b-versatile",
            "llama-3.1-8b-instant",
            "qwen/qwen3-32b"
        ];
        // Find an available preferred model
        let selectedModel = null;
        for (const preferredModel of preferredModels) {
            if (
                models.some(
                    model => model.id === preferredModel
                )
            ) {
                selectedModel = preferredModel;
                break;
            }
        }
        // If none of the preferred models are available,
        // find another likely text-generation model.
        if (!selectedModel) {
            const fallback = models.find(model => {
                const id = String(model.id || "").toLowerCase();
                return (
                    !id.includes("whisper") &&
                    !id.includes("tts") &&
                    !id.includes("guard") &&
                    !id.includes("safeguard") &&
                    !id.includes("embedding")
                );
            });
            if (fallback) {
                selectedModel = fallback.id;
            }
        }
        // No usable model
        if (!selectedModel) {
            return res.status(500).json({
                success: false,
                error: "No usable Groq chat model is available.",
                availableModels: models.map(model => model.id)
            });
        }
        console.log(
            "PRIEST AI SELECTED MODEL:",
            selectedModel
        );
        // Send message to Groq
        const completion =
            await groq.chat.completions.create({
                model: selectedModel,
                messages: [
                    {
                        role: "system",
                        content:
                            "You are PRIEST AI, a helpful, intelligent and friendly AI assistant. " +
                            "Answer questions clearly and accurately. " +
                            "Help with education, coding, writing, technology, business and general questions. " +
                            "Explain difficult topics simply when appropriate. " +
                            "Be conversational and helpful. " +
                            "If you do not know something, say so instead of making up information."
                    },
                    {
                        role: "user",
                        content: message.trim()
                    }
                ],
                temperature: 0.7,
                max_tokens: 2048
            });
        // Extract answer
        const reply =
            completion?.choices?.[0]?.message?.content;
        if (!reply) {
            return res.status(500).json({
                success: false,
                error: "PRIEST AI returned an empty response.",
                model: selectedModel
            });
        }
        // Return answer
        return res.status(200).json({
            success: true,
            model: selectedModel,
            reply: reply.trim()
        });
    } catch (error) {
        console.error(
            "PRIEST AI BACKEND ERROR:",
            error
        );
        return res.status(500).json({
            success: false,
            error:
                error?.message ||
                "Something went wrong with the Groq API."
        });
    }
};
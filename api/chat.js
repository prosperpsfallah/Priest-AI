const Groq = require("groq-sdk");

module.exports = async function handler(req, res) {

    // ==============================
    // ONLY ALLOW POST REQUESTS
    // ==============================

    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            error: "Method not allowed. Use POST."
        });
    }


    try {

        // ==============================
        // GET GROQ API KEY
        // ==============================

        const apiKey = process.env.GROQ_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                success: false,
                error: "GROQ_API_KEY is not configured in Vercel."
            });
        }


        // ==============================
        // GET USER MESSAGE
        // ==============================

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


        // ==============================
        // CREATE GROQ CLIENT
        // ==============================

        const groq = new Groq({
            apiKey: apiKey
        });


        // ==============================
        // GET AVAILABLE MODELS
        // ==============================

        const modelList = await groq.models.list();

        const models = modelList.data || [];

        console.log(
            "GROQ AVAILABLE MODELS:",
            models.map(model => model.id)
        );


        // ==============================
        // FIND A CHAT MODEL
        // ==============================

        const preferredModels = [
            "openai/gpt-oss-120b",
            "openai/gpt-oss-20b",
            "llama-3.3-70b-versatile",
            "llama-3.1-8b-instant",
            "qwen/qwen3-32b"
        ];


        let selectedModel = null;


        for (const preferred of preferredModels) {

            const found = models.find(
                model => model.id === preferred
            );

            if (found) {
                selectedModel = found.id;
                break;
            }

        }


        // ==============================
        // FALLBACK MODEL
        // ==============================

        if (!selectedModel) {

            const chatModel = models.find(model => {

                const id = (model.id || "").toLowerCase();

                return (
                    !id.includes("whisper") &&
                    !id.includes("tts") &&
                    !id.includes("guard") &&
                    !id.includes("safeguard") &&
                    !id.includes("embedding")
                );

            });


            if (chatModel) {
                selectedModel = chatModel.id;
            }

        }


        // ==============================
        // NO MODEL AVAILABLE
        // ==============================

        if (!selectedModel) {

            return res.status(500).json({

                success: false,

                error:
                    "No usable Groq chat model is available for this API key.",

                availableModels:
                    models.map(model => model.id)

            });

        }


        console.log(
            "PRIEST AI MODEL:",
            selectedModel
        );


        // ==============================
        // SEND MESSAGE TO GROQ
        // ==============================

        const completion =
            await groq.chat.completions.create({

                model: selectedModel,

                messages: [

                    {
                        role: "system",

                        content:
                            "You are PRIEST AI, a powerful, helpful, friendly and intelligent AI assistant. " +
                            "Answer the user's questions clearly and accurately. " +
                            "Help with education, programming, writing, technology, business, creativity and general questions. " +
                            "Explain complicated subjects in simple language when useful. " +
                            "Be conversational and respectful. " +
                            "Never pretend to know something you do not know."
                    },

                    {
                        role: "user",

                        content: cleanMessage
                    }

                ],

                temperature: 0.7,

                max_tokens: 2048

            });


        // ==============================
        // GET AI RESPONSE
        // ==============================

        const reply =
            completion &&
            completion.choices &&
            completion.choices[0] &&
            completion.choices[0].message &&
            completion.choices[0].message.content;


        // ==============================
        // CHECK AI RESPONSE
        // ==============================

        if (!reply) {

            return res.status(500).json({

                success: false,

                error:
                    "Groq connected successfully, but PRIEST AI returned no response.",

                model: selectedModel

            });

        }


        // ==============================
        // RETURN RESPONSE
        // ==============================

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


        // ==============================
        // RETURN REAL ERROR
        // ==============================

        return res.status(500).json({

            success: false,

            error:
                error && error.message
                    ? error.message
                    : "Something went wrong with the Groq API."

        });

    }

};
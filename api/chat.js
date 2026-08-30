const OpenAI = require("openai");
module.exports = async (req, res) => {
    /* =========================
       METHOD CHECK
    ========================= */
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }
    /* =========================
       API KEY CHECK
    ========================= */
    const apiKey =
        process.env.OPENAI_API_KEY;
    if (
        !apiKey ||
        typeof apiKey !== "string" ||
        !apiKey.trim()
    ) {
        console.error(
            "PRIEST AI: OPENAI_API_KEY is not available."
        );
        return res.status(500).json({
            error:
                "OPENAI_API_KEY is not available to this Vercel deployment. Check the Environment Variables for this project and redeploy."
        });
    }
    try {
        /* =========================
           REQUEST BODY
        ========================= */
        let body = req.body;
        if (
            typeof body === "string"
        ) {
            try {
                body =
                    JSON.parse(body);
            } catch {
                return res.status(400).json({
                    error:
                        "Invalid request data."
                });
            }
        }
        const message =
            String(
                body?.message || ""
            ).trim();
        if (!message) {
            return res.status(400).json({
                error:
                    "Please enter a message."
            });
        }
        /* =========================
           OPENAI CLIENT
        ========================= */
        const client =
            new OpenAI({
                apiKey:
                    apiKey.trim()
            });
        /* =========================
           PRIEST AI
        ========================= */
        const response =
            await client.responses.create({
                model:
                    process.env.OPENAI_MODEL ||
                    "gpt-5.6",
                instructions: `
You are PRIEST AI.
You are a helpful, intelligent,
friendly and practical AI assistant.
Help users with:
• General questions
• Education
• Mathematics
• Programming
• HTML
• CSS
• JavaScript
• Web development
• System Administration
• Technology
• Business ideas
• Writing
• Creativity
• Problem solving
• AI education
Give accurate and useful answers.
When explaining difficult topics,
teach them step by step.
When providing programming help:
• Give complete code when requested.
• Clearly explain where files belong.
• Do not expose API keys.
• Keep backend secrets on the server.
• Do not unnecessarily destroy working code.
For cybersecurity questions,
provide legal and ethical educational
information and do not help users
steal accounts, passwords or credentials.
For the PRIEST AI project:
• The frontend communicates with
  backend API endpoints.
• API keys must remain on the server.
• Never place OPENAI_API_KEY inside
  browser JavaScript.
Be honest when you are uncertain.
Keep simple answers concise.
Give detailed explanations when needed.
Be friendly and professional.
                `,
                input:
                    message
            });
        /* =========================
           RESPONSE
        ========================= */
        const answer =
            response?.output_text;
        if (!answer) {
            return res.status(500).json({
                error:
                    "The AI provider returned no text response."
            });
        }
        return res.status(200).json({
            answer:
                answer
        });
    } catch (error) {
        console.error(
            "PRIEST AI CHAT ERROR:",
            error
        );
        /* =========================
           API ERROR
        ========================= */
        return res.status(500).json({
            error:
                error?.message ||
                "PRIEST AI could not process your request."
        });
    }
};
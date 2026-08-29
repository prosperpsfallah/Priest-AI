const OpenAI = require("openai");

module.exports = async (req, res) => {
    // Only allow POST requests
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        // Get API key from Vercel environment variables
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "OPENAI_API_KEY is not configured in Vercel."
            });
        }

        // Get model from Vercel environment variable
        // If OPENAI_MODEL is not set, use gpt-5.6
        const model =
            process.env.OPENAI_MODEL || "gpt-5.6";

        // Read request body
        let body = req.body;

        if (typeof body === "string") {
            try {
                body = JSON.parse(body);
            } catch (error) {
                return res.status(400).json({
                    error: "Invalid JSON request."
                });
            }
        }

        // Get user's message
        const message =
            String(body?.message || "").trim();

        if (!message) {
            return res.status(400).json({
                error: "Please enter a message."
            });
        }

        // Create OpenAI client
        const client = new OpenAI({
            apiKey: apiKey
        });

        // Send message to OpenAI
        const response =
            await client.responses.create({
                model: model,

                instructions: `
You are PRIEST AI, a helpful, intelligent and friendly AI assistant.

Your job is to help users with:

- General questions
- Education and learning
- Mathematics
- Programming
- System Administration
- Web development
- HTML
- CSS
- JavaScript
- Node.js
- Business ideas
- Writing and creativity
- Technology
- Problem solving
- Artificial intelligence

Answer clearly and accurately.

When teaching something difficult:
- Explain it step by step.
- Use simple language when appropriate.
- Give examples when helpful.

When helping with programming:
- Give complete working code when requested.
- Clearly explain which file the code belongs in.
- Do not unnecessarily change working parts of a project.
- Never expose API keys.
- Keep private credentials on the server.

When helping with the PRIEST AI project:
- The frontend communicates with backend API endpoints.
- API keys must remain on the server.
- Give practical step-by-step instructions.
- Preserve working parts of the project whenever possible.

If you are uncertain about something:
- Say that you are uncertain.
- Do not invent information.

Be concise for simple questions and detailed when the user needs a full explanation.

You are PRIEST AI.
`,

                input: message
            });

        // Get the generated answer
        const answer =
            response.output_text ||
            "I couldn't generate a response.";

        // Send answer back to frontend
        return res.status(200).json({
            answer: answer
        });

    } catch (error) {

        console.error(
            "PRIEST AI CHAT ERROR:",
            error
        );

        // Return useful error information
        return res.status(500).json({
            error:
                error?.message ||
                "PRIEST AI could not process your request."
        });
    }
};
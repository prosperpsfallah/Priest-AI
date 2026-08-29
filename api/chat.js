const OpenAI = require("openai");

module.exports = async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {
        const apiKey = process.env.OPENAI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "OPENAI_API_KEY is missing in Vercel."
            });
        }

        const client = new OpenAI({
            apiKey: apiKey
        });

        let body = req.body;

        if (typeof body === "string") {
            body = JSON.parse(body);
        }

        const message =
            String(body?.message || "").trim();

        if (!message) {
            return res.status(400).json({
                error: "Please enter a message."
            });
        }

        const model =
            process.env.OPENAI_MODEL || "gpt-5.6";

        const response =
            await client.responses.create({
                model: model,

                instructions: `
You are PRIEST AI.

You are a helpful, intelligent and friendly AI assistant.

Help users with:

• General questions
• Education
• Mathematics
• Programming
• HTML
• CSS
• JavaScript
• Node.js
• System Administration
• Web development
• Business
• Technology
• Artificial Intelligence
• Writing
• Creativity
• Problem solving

Answer accurately and clearly.

When explaining difficult topics,
use simple step-by-step explanations.

When providing programming help:
• Give complete working code when requested.
• Clearly identify which file the code belongs in.
• Do not expose API keys or secrets.
• Do not unnecessarily destroy working code.
• Explain important changes.

For the PRIEST AI project:
• Keep API keys on the server.
• Never place secret keys in browser JavaScript.
• Use practical instructions.
• Preserve working functionality.

If you don't know something,
say so instead of inventing information.

Be concise for simple questions
and detailed when the user needs it.

You are PRIEST AI.
`,

                input: message
            });

        const answer =
            response.output_text ||
            "PRIEST AI could not generate a response.";

        return res.status(200).json({
            answer: answer
        });

    } catch (error) {

        console.error(
            "PRIEST AI CHAT ERROR:",
            error
        );

        return res.status(500).json({
            error:
                error?.message ||
                "PRIEST AI chat failed."
        });
    }
};
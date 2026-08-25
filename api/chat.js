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
                error: "OPENAI_API_KEY is not configured in Vercel."
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
                error: "Please enter a message."
            });
        }

        const client = new OpenAI({
            apiKey
        });

        const response = await client.responses.create({
            model: "gpt-5.6",

            instructions: `
You are PRIEST AI, a helpful, intelligent and friendly AI assistant.

Your job is to help users with:
- General questions
- Education and learning
- Mathematics
- Programming
- System Administration
- Web development
- HTML, CSS and JavaScript
- Business ideas
- Writing and creativity
- Technology
- Problem solving

Answer clearly and accurately.

When teaching something difficult, explain it step by step.

When helping with programming:
- Give complete working code when requested.
- Explain where each file belongs.
- Do not unnecessarily change working parts of a project.
- Be careful about security and API keys.

When helping with the user's PRIEST AI project:
- Remember that the frontend communicates with backend API endpoints.
- Keep API keys on the server and never expose them in browser code.
- Give practical step-by-step instructions.

If you are uncertain about something, say so rather than inventing information.

Be concise when the question is simple and detailed when the user needs a full explanation.
`,

            input: message
        });

        return res.status(200).json({
            answer:
                response.output_text ||
                "I couldn't generate a response."
        });

    } catch (error) {

        console.error(
            "PRIEST AI ERROR:",
            error
        );

        return res.status(500).json({
            error:
                error?.message ||
                "PRIEST AI could not process your request."
        });
    }
};
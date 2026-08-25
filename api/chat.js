const OpenAI = require("openai");

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

module.exports = async (req, res) => {

    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        const message =
            String(req.body?.message || "").trim();

        if (!message) {
            return res.status(400).json({
                error: "Message is required."
            });
        }

        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({
                error: "OPENAI_API_KEY is missing in Vercel."
            });
        }

        const response =
            await client.responses.create({

                model: "gpt-4o-mini",

                instructions: `
You are PRIEST AI, a helpful AI assistant.

Help users with:
- Questions
- Education
- Programming
- System Administration
- Web development
- Business ideas
- Writing
- Mathematics
- Science
- Technology
- Creativity
- Problem solving

Give clear and useful answers.
Explain difficult topics step by step.
For programming questions, provide practical examples.
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
                "OpenAI request failed."

        });
    }
};
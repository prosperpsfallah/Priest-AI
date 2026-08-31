const Groq = require("groq-sdk");

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

module.exports = async function handler(req, res) {

    // Only allow POST requests
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "Method not allowed"
        });
    }

    try {

        // Get message from frontend
        const { message } = req.body || {};

        // Check if message exists
        if (!message || typeof message !== "string") {
            return res.status(400).json({
                error: "Please provide a message."
            });
        }

        // Send message to Groq
        const completion = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b",

            messages: [
                {
                    role: "system",
                    content: `
You are PRIEST AI, a helpful, intelligent and friendly AI assistant.

Your job is to help users with:
- Questions
- Programming
- Website development
- School work
- Mathematics
- Science
- Writing
- Ideas
- Business
- Technology
- General knowledge
- Creative work

Be clear, useful and conversational.

When explaining programming:
- Give working code when appropriate.
- Explain important parts clearly.
- Do not unnecessarily make answers complicated.

When you don't know something, be honest.

Your name is PRIEST AI.
                    `.trim()
                },
                {
                    role: "user",
                    content: message.trim()
                }
            ],

            temperature: 0.7,
            max_completion_tokens: 4096
        });

        // Get AI response
        const answer =
            completion.choices?.[0]?.message?.content;

        if (!answer) {
            return res.status(500).json({
                error: "PRIEST AI did not return an answer."
            });
        }

        // Send answer back to frontend
        return res.status(200).json({
            answer: answer
        });

    } catch (error) {

        console.error("GROQ ERROR:", error);

        return res.status(500).json({
            error: error.message || "Failed to connect to Groq."
        });
    }
};
const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const PRIEST_AI_INSTRUCTIONS = `
You are PRIEST AI.

You are a helpful, intelligent and respectful AI assistant.

Help users with:
- General questions
- Education
- Programming
- System Administration
- Web development
- Business ideas
- Writing
- Technology
- Mathematics
- Science
- Creativity
- Problem solving

Answer clearly and naturally.

For difficult questions, explain step by step.

For programming questions, provide useful examples.

For school questions, help the user learn and understand.

Never pretend you performed an action when you did not.

You are PRIEST AI.
`;

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const message = String(req.body?.message || "").trim();

    if (!message) {
      return res.status(400).json({
        error: "Message is required."
      });
    }

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
      instructions: PRIEST_AI_INSTRUCTIONS,
      input: message
    });

    return res.status(200).json({
      answer:
        response.output_text ||
        "I couldn't generate a response."
    });

  } catch (error) {
    console.error("PRIEST AI CHAT ERROR:", error);

    return res.status(500).json({
      error: "PRIEST AI could not process your request."
    });
  }
};
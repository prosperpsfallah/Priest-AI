const express = require("express");
const path = require("path");
const OpenAI = require("openai");
const app = express();
const PORT = process.env.PORT || 3000;
/* =========================================================
   MIDDLEWARE
========================================================= */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({
    extended: true,
    limit: "10mb"
}));
app.use(express.static(__dirname));
/* =========================================================
   OPENAI
========================================================= */
const apiKey =
    process.env.OPENAI_API_KEY;
if (!apiKey) {
    console.error(
        "OPENAI_API_KEY is missing."
    );
} else {
    console.log(
        "OPENAI_API_KEY detected."
    );
}
const openai = apiKey
    ? new OpenAI({
        apiKey: apiKey
    })
    : null;
/* =========================================================
   HOME
========================================================= */
app.get("/", (req, res) => {
    res.sendFile(
        path.join(
            __dirname,
            "index.html"
        )
    );
});
/* =========================================================
   API STATUS
========================================================= */
app.get("/api/status", (req, res) => {
    res.json({
        success: true,
        service: "PRIEST AI",
        apiKeyAvailable:
            Boolean(
                process.env.OPENAI_API_KEY
            )
    });
});
/* =========================================================
   CHAT API
========================================================= */
app.post("/api/chat", async (req, res) => {
    try {
        console.log(
            "Received /api/chat request"
        );
        /* -------------------------------------------------
           Check API key
        ------------------------------------------------- */
        if (!process.env.OPENAI_API_KEY) {
            return res.status(500).json({
                error:
                    "OPENAI_API_KEY is not available to this Vercel deployment. Check the Environment Variables for this project and redeploy."
            });
        }
        /* -------------------------------------------------
           Check OpenAI client
        ------------------------------------------------- */
        if (!openai) {
            return res.status(500).json({
                error:
                    "OpenAI client could not be initialized."
            });
        }
        /* -------------------------------------------------
           Get message
        ------------------------------------------------- */
        const message =
            req.body &&
            req.body.message
                ? String(
                    req.body.message
                ).trim()
                : "";
        if (!message) {
            return res.status(400).json({
                error:
                    "Please enter a message."
            });
        }
        console.log(
            "User message:",
            message
        );
        /* -------------------------------------------------
           MODEL
        ------------------------------------------------- */
        const model =
            process.env.OPENAI_MODEL ||
            "gpt-5.6-luna";
        /* -------------------------------------------------
           OPENAI REQUEST
        ------------------------------------------------- */
        const completion =
            await openai.chat.completions.create({
                model: model,
                messages: [
                    {
                        role: "system",
                        content:
                            "You are PRIEST AI, a helpful, intelligent and friendly AI assistant. Give clear, useful and accurate answers. Help with coding, learning, writing, ideas and general questions."
                    },
                    {
                        role: "user",
                        content: message
                    }
                ]
            });
        /* -------------------------------------------------
           GET ANSWER
        ------------------------------------------------- */
        const answer =
            completion
                .choices?.[0]
                ?.message
                ?.content ||
            "PRIEST AI could not generate a response.";
        console.log(
            "AI response generated successfully."
        );
        /* -------------------------------------------------
           SEND RESPONSE
        ------------------------------------------------- */
        return res.json({
            success: true,
            answer: answer
        });
    } catch (error) {
        console.error(
            "PRIEST AI API ERROR:",
            error
        );
        return res.status(500).json({
            error:
                error?.message ||
                "PRIEST AI encountered a server error."
        });
    }
});
/* =========================================================
   START SERVER
========================================================= */
app.listen(
    PORT,
    () => {
        console.log(
            `PRIEST AI running on port ${PORT}`
        );
    }
);
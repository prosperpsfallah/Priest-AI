require("dotenv").config();

const express = require("express");
const multer = require("multer");
const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "..")));

const upload = multer({
    dest: "/tmp/",
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

const openai = new OpenAI({
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

For school questions, help the user understand and learn.

Never pretend you performed an action when you did not.

You are PRIEST AI.
`;

app.post("/api/chat", async (req, res) => {
    try {
        const message = String(req.body.message || "").trim();

        if (!message) {
            return res.status(400).json({
                error: "Message is required."
            });
        }

        const response = await openai.responses.create({
            model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
            instructions: PRIEST_AI_INSTRUCTIONS,
            input: message
        });

        return res.json({
            answer:
                response.output_text ||
                "I couldn't generate a response."
        });

    } catch (error) {
        console.error("CHAT ERROR:", error);

        return res.status(500).json({
            error:
                "PRIEST AI could not process your request."
        });
    }
});

app.post(
    "/api/edit-image",
    upload.single("image"),
    async (req, res) => {

        let uploadedFile = null;

        try {
            if (!req.file) {
                return res.status(400).json({
                    error: "Please upload an image."
                });
            }

            uploadedFile = req.file.path;

            const userPrompt =
                String(req.body.prompt || "").trim();

            const addWatermark =
                req.body.watermark === "true";

            if (!userPrompt) {
                return res.status(400).json({
                    error: "Please describe the edit."
                });
            }

            let finalPrompt = `
Edit the uploaded image according to the user's request.

Preserve the person's facial identity and important
facial characteristics as closely as the image model allows.

Do not unnecessarily change:
- face shape
- eyes
- nose
- mouth
- skin tone
- hairstyle
- facial proportions
- recognizable facial characteristics

Only make the changes requested by the user.

User's request:
${userPrompt}
`;

            if (addWatermark) {
                finalPrompt += `
Add a clearly visible but tasteful "PRIEST AI"
watermark to the final image.
`;
            }

            const imageResult =
                await openai.images.edit({
                    model:
                        process.env.OPENAI_IMAGE_MODEL ||
                        "gpt-image-2",

                    image:
                        fs.createReadStream(
                            uploadedFile
                        ),

                    prompt: finalPrompt
                });

            const base64 =
                imageResult.data?.[0]?.b64_json;

            if (!base64) {
                throw new Error(
                    "No image returned by API."
                );
            }

            return res.json({
                image:
                    `data:image/png;base64,${base64}`
            });

        } catch (error) {
            console.error(
                "IMAGE ERROR:",
                error
            );

            return res.status(500).json({
                error:
                    "PRIEST AI could not edit this image."
            });

        } finally {
            if (
                uploadedFile &&
                fs.existsSync(uploadedFile)
            ) {
                try {
                    fs.unlinkSync(uploadedFile);
                } catch (cleanupError) {
                    console.error(
                        "CLEANUP ERROR:",
                        cleanupError
                    );
                }
            }
        }
    }
);

module.exports = app;
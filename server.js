require("dotenv").config();

const express = require("express");
const multer = require("multer");
const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");

const app = express();

const PORT =
    process.env.PORT || 3000;


const openai =
    new OpenAI({
        apiKey:
            process.env.OPENAI_API_KEY
    });


/* =========================
   MIDDLEWARE
========================= */

app.use(
    express.json({
        limit: "10mb"
    })
);


app.use(
    express.urlencoded({
        extended: true
    })
);


app.use(
    express.static(
        path.join(__dirname)
    )
);


/* =========================
   IMAGE UPLOAD
========================= */

const upload =
    multer({
        dest: "uploads/",
        limits: {
            fileSize:
                10 * 1024 * 1024
        }
    });


/* =========================
   PRIEST AI INSTRUCTIONS
========================= */

const PRIEST_AI_INSTRUCTIONS = `

You are PRIEST AI.

You are a helpful, intelligent and respectful
AI assistant.

Your job is to help users with:

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

If a question is difficult, explain it
step by step.

If the user asks something harmful,
dangerous, illegal or that could seriously
hurt someone, do not provide instructions
that enable the harm. Instead, provide a
safe alternative or general educational
information.

Never pretend that you performed an action
when you did not.

For programming questions, provide useful
examples and explain important parts.

For school questions, help the user learn
rather than simply confusing them.

Be concise when the question is simple and
detailed when the user needs explanation.

You are PRIEST AI.
`;


/* =========================
   CHAT API
========================= */

app.post(
    "/api/chat",
    async (req, res) => {

        try {

            const message =
                String(
                    req.body.message || ""
                ).trim();


            if (!message) {

                return res.status(400).json({
                    error:
                        "Message is required."
                });
            }


            const response =
                await openai.responses.create({

                    model:
                        process.env.OPENAI_MODEL ||
                        "gpt-5.6-luna",

                    instructions:
                        PRIEST_AI_INSTRUCTIONS,

                    input:
                        message
                });


            res.json({

                answer:
                    response.output_text ||
                    "I couldn't generate a response."

            });


        } catch (error) {

            console.error(
                "CHAT ERROR:",
                error
            );


            res.status(500).json({

                error:
                    "PRIEST AI could not process your request."

            });
        }
    }
);


/* =========================
   IMAGE EDIT API
========================= */

app.post(
    "/api/edit-image",
    upload.single("image"),

    async (req, res) => {

        let uploadedFile = null;


        try {

            if (!req.file) {

                return res.status(400).json({
                    error:
                        "Please upload an image."
                });
            }


            uploadedFile =
                req.file.path;


            const userPrompt =
                String(
                    req.body.prompt || ""
                ).trim();


            const addWatermark =
                req.body.watermark === "true";


            if (!userPrompt) {

                return res.status(400).json({
                    error:
                        "Please describe the edit."
                });
            }


            /*
             IMPORTANT:

             Keep the person's facial identity
             and important facial characteristics
             as unchanged as possible.

             Only change what the user requests.
            */

            let finalPrompt = `

Edit the uploaded image according to
the user's request.

PRESERVE THE PERSON'S FACIAL IDENTITY
AND IMPORTANT FACIAL FEATURES AS CLOSELY
AS THE IMAGE EDITING MODEL ALLOWS.

Do not unnecessarily change:

- face shape
- eyes
- nose
- mouth
- skin tone
- hairstyle
- facial proportions
- recognizable facial characteristics

Only make changes requested by the user.

User's editing request:

${userPrompt}

`;


            if (addWatermark) {

                finalPrompt += `

Add a clearly visible but tasteful
"PRIEST AI" watermark to the final image.

The watermark should be readable and
remain part of the final image.
`;
            }


            /*
             IMAGE EDITING

             This section is intentionally isolated
             so the image provider/model can be
             changed without rebuilding the website.
            */

            const imageResult =
                await openai.images.edit({

                    model:
                        process.env.OPENAI_IMAGE_MODEL ||
                        "gpt-image-2",

                    image:
                        fs.createReadStream(
                            uploadedFile
                        ),

                    prompt:
                        finalPrompt
                });


            const base64 =
                imageResult.data?.[0]?.b64_json;


            if (!base64) {

                throw new Error(
                    "No image returned by API."
                );
            }


            const imageData =
                `data:image/png;base64,${base64}`;


            res.json({

                image:
                    imageData

            });


        } catch (error) {

            console.error(
                "IMAGE ERROR:",
                error
            );


            res.status(500).json({

                error:
                    "PRIEST AI could not edit this image. Check your API configuration and image model access."

            });

        } finally {

            if (
                uploadedFile &&
                fs.existsSync(uploadedFile)
            ) {

                fs.unlinkSync(
                    uploadedFile
                );
            }
        }
    }
);


/* =========================
   START SERVER
========================= */

app.listen(
    PORT,
    () => {

        console.log(
            `PRIEST AI running on port ${PORT}`
        );

    }
);
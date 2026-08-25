const OpenAI = require("openai");
const multer = require("multer");
const fs = require("fs");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const upload = multer({
  dest: "/tmp/",
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

function runUpload(req, res) {
  return new Promise((resolve, reject) => {
    upload.single("image")(req, res, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  let uploadedFile = null;

  try {
    await runUpload(req, res);

    if (!req.file) {
      return res.status(400).json({
        error: "Please upload an image."
      });
    }

    uploadedFile = req.file.path;

    const prompt = String(req.body?.prompt || "").trim();

    const watermark =
      req.body?.watermark === "true";

    if (!prompt) {
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
${prompt}
`;

    if (watermark) {
      finalPrompt += `
Add a tasteful, clearly visible "PRIEST AI" watermark.
`;
    }

    const result = await openai.images.edit({
      model:
        process.env.OPENAI_IMAGE_MODEL ||
        "gpt-image-2",

      image:
        fs.createReadStream(uploadedFile),

      prompt: finalPrompt
    });

    const base64 =
      result.data?.[0]?.b64_json;

    if (!base64) {
      throw new Error("No image returned by API.");
    }

    return res.status(200).json({
      image: `data:image/png;base64,${base64}`
    });

  } catch (error) {
    console.error(
      "PRIEST AI IMAGE ERROR:",
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
      } catch (error) {
        console.error(
          "Temporary file cleanup failed:",
          error
        );
      }
    }
  }
};
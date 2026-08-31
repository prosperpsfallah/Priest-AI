// ============================================
// PRIEST AI - IMAGE EDITOR
// edit-image.js
// ============================================

console.log("PRIEST AI IMAGE EDITOR LOADED");

// -----------------------------
// ELEMENTS
// -----------------------------

const imageInput = document.getElementById("imageInput");
const imagePreview = document.getElementById("imagePreview");
const previewContainer = document.getElementById("previewContainer");
const promptInput = document.getElementById("editPrompt");
const editButton = document.getElementById("editImageBtn");
const generateButton = document.getElementById("generateImageBtn");
const resultImage = document.getElementById("resultImage");
const resultContainer = document.getElementById("resultContainer");
const loadingMessage = document.getElementById("imageLoading");
const errorMessage = document.getElementById("imageError");

// -----------------------------
// VARIABLES
// -----------------------------

let selectedImage = null;

// -----------------------------
// HELPER FUNCTIONS
// -----------------------------

function showLoading(show) {
    if (!loadingMessage) return;

    loadingMessage.style.display = show ? "block" : "none";
}

function showError(message) {
    if (!errorMessage) return;

    errorMessage.textContent = message;
    errorMessage.style.display = "block";
}

function hideError() {
    if (!errorMessage) return;

    errorMessage.textContent = "";
    errorMessage.style.display = "none";
}

function showResult(imageUrl) {
    if (!resultContainer || !resultImage) return;

    resultImage.src = imageUrl;
    resultContainer.style.display = "block";
}

// -----------------------------
// IMAGE UPLOAD
// -----------------------------

if (imageInput) {
    imageInput.addEventListener("change", function (event) {

        hideError();

        const file = event.target.files[0];

        if (!file) {
            selectedImage = null;
            return;
        }

        // Make sure it is an image
        if (!file.type.startsWith("image/")) {
            showError("Please select a valid image.");
            imageInput.value = "";
            selectedImage = null;
            return;
        }

        selectedImage = file;

        const reader = new FileReader();

        reader.onload = function (e) {

            if (imagePreview) {
                imagePreview.src = e.target.result;
                imagePreview.style.display = "block";
            }

            if (previewContainer) {
                previewContainer.style.display = "block";
            }
        };

        reader.readAsDataURL(file);
    });
}

// -----------------------------
// GENERATE NEW IMAGE
// -----------------------------

async function generateImage() {

    hideError();

    const prompt = promptInput ? promptInput.value.trim() : "";

    if (!prompt) {
        showError("Please describe the image you want to generate.");
        return;
    }

    showLoading(true);

    try {

        const response = await fetch("/api/generate-image", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                prompt: prompt
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Image generation failed."
            );
        }

        if (!data.image) {
            throw new Error("The server did not return an image.");
        }

        showResult(data.image);

    } catch (error) {

        console.error("Image generation error:", error);

        showError(
            error.message || "Unable to generate image."
        );

    } finally {

        showLoading(false);
    }
}

// -----------------------------
// EDIT EXISTING IMAGE
// -----------------------------

async function editImage() {

    hideError();

    if (!selectedImage) {
        showError("Please select an image first.");
        return;
    }

    const prompt = promptInput ? promptInput.value.trim() : "";

    if (!prompt) {
        showError("Please describe how you want to edit the image.");
        return;
    }

    showLoading(true);

    try {

        const formData = new FormData();

        formData.append("image", selectedImage);
        formData.append("prompt", prompt);

        const response = await fetch("/api/edit-image", {
            method: "POST",
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error || "Image editing failed."
            );
        }

        if (!data.image) {
            throw new Error("The server did not return an edited image.");
        }

        showResult(data.image);

    } catch (error) {

        console.error("Image editing error:", error);

        showError(
            error.message || "Unable to edit image."
        );

    } finally {

        showLoading(false);
    }
}

// -----------------------------
// BUTTON EVENTS
// -----------------------------

if (generateButton) {
    generateButton.addEventListener(
        "click",
        generateImage
    );
}

if (editButton) {
    editButton.addEventListener(
        "click",
        editImage
    );
}

// -----------------------------
// ENTER KEY
// -----------------------------

if (promptInput) {

    promptInput.addEventListener("keydown", function (event) {

        if (event.key === "Enter" && !event.shiftKey) {

            event.preventDefault();

            if (selectedImage) {
                editImage();
            } else {
                generateImage();
            }
        }

    });
}

// -----------------------------
// DOWNLOAD RESULT
// -----------------------------

const downloadButton =
    document.getElementById("downloadImageBtn");

if (downloadButton) {

    downloadButton.addEventListener("click", function () {

        if (!resultImage || !resultImage.src) {
            showError("There is no generated image to download.");
            return;
        }

        const link = document.createElement("a");

        link.href = resultImage.src;
        link.download = "priest-ai-image.png";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    });
}

console.log("PRIEST AI IMAGE EDITOR READY");
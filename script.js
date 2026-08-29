alert("PRIEST AI JavaScript is working!");

/* =========================
   ELEMENTS
========================= */

const chat = document.getElementById("chat");
const input = document.getElementById("message");

const imageEditor = document.getElementById("imageEditor");
const imageInput = document.getElementById("imageInput");
const imagePreview = document.getElementById("imagePreview");
const previewContainer = document.getElementById("previewContainer");

const resultContainer = document.getElementById("resultContainer");
const resultImage = document.getElementById("resultImage");
const downloadButton = document.getElementById("downloadButton");


/* =========================
   CHAT
========================= */

async function sendMessage() {

    if (!input) {
        console.error("Message input was not found.");
        return;
    }

    const text = input.value.trim();

    if (!text) {
        return;
    }

    removeWelcome();

    addMessage("You", text, "user");

    input.value = "";

    showTyping();

    try {

        const response = await fetch("/api/chat", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: text
            })
        });

        const raw = await response.text();

        let data;

        try {
            data = raw
                ? JSON.parse(raw)
                : {};
        } catch (error) {

            data = {
                error: raw || "Invalid server response."
            };
        }

        removeTyping();

        if (!response.ok) {

            console.error(
                "Chat API error:",
                response.status,
                data
            );

            addMessage(
                "PRIEST AI",
                `Server error (${response.status}): ${
                    data.error || "Unknown server error."
                }`,
                "ai"
            );

            return;
        }

        const answer =
            data.answer ||
            "PRIEST AI did not return an answer.";

        addMessage(
            "PRIEST AI",
            answer,
            "ai"
        );

    } catch (error) {

        removeTyping();

        console.error(
            "Connection error:",
            error
        );

        addMessage(
            "PRIEST AI",
            `Connection error: ${error.message}`,
            "ai"
        );
    }
}


/* =========================
   ADD MESSAGE
========================= */

function addMessage(name, text, type) {

    if (!chat) {
        console.error("Chat container was not found.");
        return;
    }

    const message =
        document.createElement("div");

    message.className = "message";


    /* AVATAR */

    const avatar =
        document.createElement("div");

    avatar.className =
        "avatar " +
        (
            type === "ai"
                ? "ai-avatar"
                : "user-avatar"
        );

    avatar.textContent =
        type === "ai"
            ? "P"
            : "U";


    /* CONTENT */

    const content =
        document.createElement("div");

    content.className =
        "message-content";


    /* NAME */

    const nameElement =
        document.createElement("div");

    nameElement.className =
        "message-name";

    nameElement.textContent =
        name;


    /* TEXT */

    const textElement =
        document.createElement("div");

    textElement.innerHTML =
        formatText(text);


    content.appendChild(
        nameElement
    );

    content.appendChild(
        textElement
    );

    message.appendChild(
        avatar
    );

    message.appendChild(
        content
    );

    chat.appendChild(
        message
    );

    scrollChat();
}


/* =========================
   FORMAT TEXT
========================= */

function formatText(text) {

    return String(text)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /\n/g,
            "<br>"
        )

        .replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );
}


/* =========================
   TYPING INDICATOR
========================= */

function showTyping() {

    if (!chat) return;

    removeTyping();

    const typing =
        document.createElement("div");

    typing.id = "typing";

    typing.className =
        "message";

    typing.innerHTML = `

        <div class="avatar ai-avatar">
            P
        </div>

        <div class="message-content">

            <div class="message-name">
                PRIEST AI
            </div>

            <div>
                Thinking... 🤔
            </div>

        </div>

    `;

    chat.appendChild(
        typing
    );

    scrollChat();
}


function removeTyping() {

    const typing =
        document.getElementById(
            "typing"
        );

    if (typing) {
        typing.remove();
    }
}


/* =========================
   SUGGESTIONS
========================= */

function sendSuggestion(text) {

    if (!input) return;

    input.value = text;

    sendMessage();
}


/* =========================
   NEW CHAT
========================= */

function newChat() {

    if (!chat) return;

    chat.innerHTML = "";

    showHome();

    focusInput();
}


function clearChat() {

    if (!chat) return;

    chat.innerHTML = "";

    showHome();

    focusInput();
}


/* =========================
   HOME
========================= */

function showHome() {

    if (!chat) return;

    chat.innerHTML = `

        <div class="welcome">

            <div class="big-logo">
                P
            </div>

            <h2>
                Welcome to PRIEST AI 👋
            </h2>

            <p>
                Your AI assistant for questions,
                coding, learning, writing,
                ideas and image editing.
            </p>

            <div class="suggestions">

                <button
                    type="button"
                    onclick="sendSuggestion('Teach me programming from beginner level')"
                >
                    💻 Learn Programming
                </button>

                <button
                    type="button"
                    onclick="sendSuggestion('Help me build a professional website')"
                >
                    🌐 Build a Website
                </button>

                <button
                    type="button"
                    onclick="sendSuggestion('Explain artificial intelligence simply')"
                >
                    🤖 Explain AI
                </button>

                <button
                    type="button"
                    onclick="sendSuggestion('Give me a business idea')"
                >
                    💡 Business Idea
                </button>

            </div>

        </div>

    `;
}


/* =========================
   INPUT
========================= */

function focusInput() {

    if (input) {
        input.focus();
    }
}


function handleKey(event) {

    if (!event) return;

    if (
        event.key === "Enter" &&
        !event.shiftKey
    ) {

        event.preventDefault();

        sendMessage();
    }
}


/* =========================
   IMAGE EDITOR
========================= */

function openImageEditor() {

    if (!imageEditor) {
        console.error(
            "Image editor element was not found."
        );
        return;
    }

    imageEditor.style.display =
        "block";
}


function closeImageEditor() {

    if (!imageEditor) return;

    imageEditor.style.display =
        "none";
}


function previewImage(event) {

    if (
        !event ||
        !event.target ||
        !event.target.files
    ) {
        return;
    }

    const file =
        event.target.files[0];

    if (!file) return;


    /* Check image */

    if (!file.type.startsWith("image/")) {

        alert(
            "Please select a valid image."
        );

        return;
    }


    const reader =
        new FileReader();

    reader.onload =
        function(e) {

            if (imagePreview) {

                imagePreview.src =
                    e.target.result;
            }

            if (previewContainer) {

                previewContainer.style.display =
                    "block";
            }
        };

    reader.onerror =
        function() {

            alert(
                "Could not read the selected image."
            );
        };

    reader.readAsDataURL(file);
}


/* =========================
   EDIT IMAGE
========================= */

async function editImage() {

    if (!imageInput) {

        alert(
            "Image input was not found."
        );

        return;
    }


    const file =
        imageInput.files[0];


    const promptElement =
        document.getElementById(
            "editPrompt"
        );


    const prompt =
        promptElement
            ? promptElement.value.trim()
            : "";


    if (!file) {

        alert(
            "Please choose an image first."
        );

        return;
    }


    if (!prompt) {

        alert(
            "Tell PRIEST AI what you want changed."
        );

        return;
    }


    const watermarkElement =
        document.getElementById(
            "watermark"
        );


    const watermark =
        watermarkElement
            ? watermarkElement.checked
            : false;


    const formData =
        new FormData();


    formData.append(
        "image",
        file
    );


    formData.append(
        "prompt",
        prompt
    );


    formData.append(
        "watermark",
        String(watermark)
    );


    const button =
        document.querySelector(
            ".edit-button"
        );


    if (button) {

        button.disabled = true;

        button.textContent =
            "Creating image...";
    }


    try {

        const response =
            await fetch(
                "/api/edit-image",
                {
                    method: "POST",
                    body: formData
                }
            );


        const raw =
            await response.text();


        let data;


        try {

            data =
                raw
                    ? JSON.parse(raw)
                    : {};

        } catch (error) {

            data = {
                error:
                    raw ||
                    "Invalid server response."
            };
        }


        if (!response.ok) {

            console.error(
                "Image API error:",
                response.status,
                data
            );

            alert(
                data.error ||
                `Image editing failed (${response.status}).`
            );

            return;
        }


        if (!data.image) {

            alert(
                "The image editor did not return an image."
            );

            return;
        }


        if (resultImage) {

            resultImage.src =
                data.image;
        }


        if (resultContainer) {

            resultContainer.style.display =
                "block";
        }


        if (downloadButton) {

            downloadButton.href =
                data.image;

            downloadButton.download =
                "priest-ai-edited-image.png";
        }


    } catch (error) {

        console.error(
            "Image editor connection error:",
            error
        );

        alert(
            "Could not connect to the image editor: " +
            error.message
        );


    } finally {

        if (button) {

            button.disabled = false;

            button.textContent =
                "✨ Edit Image";
        }
    }
}


/* =========================
   UTILITIES
========================= */

function removeWelcome() {

    const welcome =
        document.querySelector(
            ".welcome"
        );

    if (welcome) {
        welcome.remove();
    }
}


function scrollChat() {

    if (chat) {

        chat.scrollTop =
            chat.scrollHeight;
    }
}


function toggleSidebar() {

    const sidebar =
        document.querySelector(
            ".sidebar"
        );

    if (sidebar) {

        sidebar.classList.toggle(
            "show"
        );
    }
}


/* =========================
   MAKE FUNCTIONS AVAILABLE
   TO HTML ONCLICK
========================= */

window.sendMessage =
    sendMessage;

window.sendSuggestion =
    sendSuggestion;

window.newChat =
    newChat;

window.clearChat =
    clearChat;

window.handleKey =
    handleKey;

window.openImageEditor =
    openImageEditor;

window.closeImageEditor =
    closeImageEditor;

window.previewImage =
    previewImage;

window.editImage =
    editImage;

window.toggleSidebar =
    toggleSidebar;

window.focusInput =
    focusInput;


/* =========================
   START
========================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        console.log(
            "PRIEST AI JavaScript loaded successfully."
        );

        if (chat && !chat.innerHTML.trim()) {
            showHome();
        }

    }
);
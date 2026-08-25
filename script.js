alert("PRIEST AI JavaScript is working!");

const chat = document.getElementById("chat");
const input = document.getElementById("message");

const imageEditor =
    document.getElementById("imageEditor");

const imageInput =
    document.getElementById("imageInput");

const imagePreview =
    document.getElementById("imagePreview");

const previewContainer =
    document.getElementById("previewContainer");

const resultContainer =
    document.getElementById("resultContainer");

const resultImage =
    document.getElementById("resultImage");

const downloadButton =
    document.getElementById("downloadButton");


/* =========================
   CHAT
========================= */

async function sendMessage() {

    const text = input.value.trim();

    if (!text) return;

    removeWelcome();

    addMessage(
        "You",
        text,
        "user"
    );

    input.value = "";

    showTyping();

    try {

        const response =
            await fetch(
                "/api/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        message: text
                    })
                }
            );

        const raw =
            await response.text();

        let data;

        try {

            data =
                JSON.parse(raw);

        } catch {

            data = {
                error:
                    raw ||
                    "The server returned an unknown error."
            };
        }

        removeTyping();

        if (!response.ok) {

            addMessage(
                "PRIEST AI",
                `Server error (${response.status}): ${
                    data.error ||
                    "Unknown error"
                }`,
                "ai"
            );

            return;
        }

        addMessage(
            "PRIEST AI",
            data.answer ||
                "No answer was returned.",
            "ai"
        );

    } catch (error) {

        removeTyping();

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

function addMessage(
    name,
    text,
    type
) {

    const message =
        document.createElement("div");

    message.className =
        "message";

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

    const content =
        document.createElement("div");

    content.className =
        "message-content";

    const nameElement =
        document.createElement("div");

    nameElement.className =
        "message-name";

    nameElement.textContent =
        name;

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
   TYPING
========================= */

function showTyping() {

    const typing =
        document.createElement("div");

    typing.id =
        "typing";

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

            Thinking... 🤔

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

    input.value =
        text;

    sendMessage();
}


/* =========================
   NEW CHAT
========================= */

function newChat() {

    chat.innerHTML =
        "";

    showHome();

    focusInput();
}


function clearChat() {

    chat.innerHTML =
        "";

    showHome();
}


/* =========================
   HOME
========================= */

function showHome() {

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
                    onclick="sendSuggestion(
                        'Teach me programming from beginner level'
                    )"
                >
                    💻 Learn Programming
                </button>

                <button
                    type="button"
                    onclick="sendSuggestion(
                        'Help me build a professional website'
                    )"
                >
                    🌐 Build a Website
                </button>

                <button
                    type="button"
                    onclick="sendSuggestion(
                        'Explain artificial intelligence simply'
                    )"
                >
                    🤖 Explain AI
                </button>

                <button
                    type="button"
                    onclick="sendSuggestion(
                        'Give me a business idea'
                    )"
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

    if (imageEditor) {

        imageEditor.style.display =
            "block";
    }
}


function closeImageEditor() {

    if (imageEditor) {

        imageEditor.style.display =
            "none";
    }
}


function previewImage(event) {

    const file =
        event.target.files[0];

    if (!file) return;

    const reader =
        new FileReader();

    reader.onload =
        function(e) {

            imagePreview.src =
                e.target.result;

            previewContainer.style.display =
                "block";
        };

    reader.readAsDataURL(file);
}


/* =========================
   EDIT IMAGE
========================= */

async function editImage() {

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
        watermark
    );

    const button =
        document.querySelector(
            ".edit-button"
        );

    if (button) {

        button.disabled =
            true;

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
                JSON.parse(raw);

        } catch {

            data = {
                error:
                    raw ||
                    "The server returned an unknown error."
            };
        }

        if (!response.ok) {

            alert(
                data.error ||
                "Image editing failed."
            );

            return;
        }

        resultImage.src =
            data.image;

        resultContainer.style.display =
            "block";

        downloadButton.href =
            data.image;

        window.scrollTo({
            top:
                document.body.scrollHeight,
            behavior:
                "smooth"
        });

    } catch (error) {

        alert(
            "Could not connect to the image editor: " +
            error.message
        );

    } finally {

        if (button) {

            button.disabled =
                false;

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
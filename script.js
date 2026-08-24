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

        const response = await fetch(
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


        const data =
            await response.json();


        removeTyping();


        if (!response.ok) {

            addMessage(
                "PRIEST AI",
                data.error ||
                "Something went wrong.",
                "ai"
            );

            return;
        }


        addMessage(
            "PRIEST AI",
            data.answer,
            "ai"
        );

    } catch (error) {

        removeTyping();

        addMessage(
            "PRIEST AI",
            "I couldn't connect to the AI server. Check that the server is running and your API configuration is correct.",
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
   FORMAT
========================= */

function formatText(text) {

    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br>")
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

    input.value = text;

    sendMessage();
}


/* =========================
   NEW CHAT
========================= */

function newChat() {

    chat.innerHTML = "";

    showHome();

    input.focus();
}


function clearChat() {

    chat.innerHTML = "";

    showHome();
}


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
                    onclick="sendSuggestion(
                    'Teach me programming from beginner level'
                    )"
                >
                    💻 Learn Programming
                </button>

                <button
                    onclick="sendSuggestion(
                    'Help me build a professional website'
                    )"
                >
                    🌐 Build a Website
                </button>

                <button
                    onclick="sendSuggestion(
                    'Explain artificial intelligence simply'
                    )"
                >
                    🤖 Explain AI
                </button>

                <button
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

    input.focus();
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

    imageEditor.style.display =
        "block";
}


function closeImageEditor() {

    imageEditor.style.display =
        "none";
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

    const prompt =
        document
        .getElementById("editPrompt")
        .value
        .trim();


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


    const watermark =
        document.getElementById(
            "watermark"
        ).checked;


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


    button.disabled =
        true;

    button.textContent =
        "Creating image...";


    try {

        const response =
            await fetch(
                "/api/edit-image",
                {
                    method: "POST",
                    body: formData
                }
            );


        const data =
            await response.json();


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
            top: document.body.scrollHeight,
            behavior: "smooth"
        });


    } catch (error) {

        alert(
            "Could not connect to the image editor."
        );

    } finally {

        button.disabled =
            false;

        button.textContent =
            "✨ Edit Image";
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

    chat.scrollTop =
        chat.scrollHeight;
}


function toggleSidebar() {

    const sidebar =
        document.querySelector(
            ".sidebar"
        );

    sidebar.classList.toggle(
        "show"
    );
}
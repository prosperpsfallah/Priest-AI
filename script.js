/* =========================================================
   PRIEST AI — FRONTEND APPLICATION
========================================================= */
/* =========================================================
   ELEMENTS
========================================================= */
let chat;
let input;
let imageEditor;
let imageInput;
let imagePreview;
let previewContainer;
let resultContainer;
let resultImage;
let downloadButton;
/* =========================================================
   INITIALIZE APP
========================================================= */
function initializeApp() {
    chat =
        document.getElementById("chat");
    input =
        document.getElementById("message");
    imageEditor =
        document.getElementById("imageEditor");
    imageInput =
        document.getElementById("imageInput");
    imagePreview =
        document.getElementById("imagePreview");
    previewContainer =
        document.getElementById("previewContainer");
    resultContainer =
        document.getElementById("resultContainer");
    resultImage =
        document.getElementById("resultImage");
    downloadButton =
        document.getElementById("downloadButton");
    console.log(
        "PRIEST AI frontend loaded."
    );
    /*
     * Make sure the home screen exists.
     */
    if (
        chat &&
        !chat.innerHTML.trim()
    ) {
        showHome();
    }
}
/* =========================================================
   CHAT
========================================================= */
async function sendMessage() {
    if (!input) {
        console.error(
            "PRIEST AI: message input not found."
        );
        return;
    }
    const text =
        input.value.trim();
    if (!text) {
        return;
    }
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
                    body:
                        JSON.stringify({
                            message: text
                        })
                }
            );
        const raw =
            await response.text();
        let data = {};
        try {
            data =
                raw
                    ? JSON.parse(raw)
                    : {};
        } catch {
            data = {
                error:
                    raw ||
                    "Invalid server response."
            };
        }
        removeTyping();
        if (!response.ok) {
            console.error(
                "PRIEST AI chat error:",
                response.status,
                data
            );
            addMessage(
                "PRIEST AI",
                `Server error (${response.status}): ${
                    data.error ||
                    "The AI server returned an error."
                }`,
                "ai"
            );
            return;
        }
        addMessage(
            "PRIEST AI",
            data.answer ||
                "PRIEST AI did not return an answer.",
            "ai"
        );
    } catch (error) {
        removeTyping();
        console.error(
            "PRIEST AI connection error:",
            error
        );
        addMessage(
            "PRIEST AI",
            "Connection error. Please check your internet connection and try again.",
            "ai"
        );
    }
}
/* =========================================================
   ADD MESSAGE
========================================================= */
function addMessage(
    name,
    text,
    type
) {
    if (!chat) {
        return;
    }
    const message =
        document.createElement(
            "div"
        );
    message.className =
        "message";
    const avatar =
        document.createElement(
            "div"
        );
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
        document.createElement(
            "div"
        );
    content.className =
        "message-content";
    const nameElement =
        document.createElement(
            "div"
        );
    nameElement.className =
        "message-name";
    nameElement.textContent =
        name;
    const textElement =
        document.createElement(
            "div"
        );
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
/* =========================================================
   FORMAT AI TEXT
========================================================= */
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
/* =========================================================
   TYPING INDICATOR
========================================================= */
function showTyping() {
    if (!chat) {
        return;
    }
    removeTyping();
    const typing =
        document.createElement(
            "div"
        );
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
/* =========================================================
   SUGGESTIONS
========================================================= */
function sendSuggestion(text) {
    if (!input) {
        return;
    }
    input.value =
        String(text);
    sendMessage();
}
/* =========================================================
   NEW CHAT
========================================================= */
function newChat() {
    if (!chat) {
        return;
    }
    removeTyping();
    chat.innerHTML = "";
    showHome();
    focusInput();
}
/* =========================================================
   CLEAR CHAT
========================================================= */
function clearChat() {
    if (!chat) {
        return;
    }
    removeTyping();
    chat.innerHTML = "";
    showHome();
    focusInput();
}
/* =========================================================
   HOME
========================================================= */
function showHome() {
    if (!chat) {
        return;
    }
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
                        'Give me a legal and ethical cybersecurity learning idea'
                    )"
                >
                    🔐 Cybersecurity
                </button>
            </div>
        </div>
    `;
}
/* =========================================================
   INPUT
========================================================= */
function focusInput() {
    if (input) {
        input.focus();
    }
}
function handleKey(event) {
    if (!event) {
        return;
    }
    if (
        event.key === "Enter" &&
        !event.shiftKey
    ) {
        event.preventDefault();
        sendMessage();
    }
}
/* =========================================================
   IMAGE EDITOR
========================================================= */
function openImageEditor() {
    if (!imageEditor) {
        console.error(
            "PRIEST AI: image editor not found."
        );
        return;
    }
    imageEditor.style.display =
        "block";
    document.body.style.overflow =
        "hidden";
}
function closeImageEditor() {
    if (!imageEditor) {
        return;
    }
    imageEditor.style.display =
        "none";
    document.body.style.overflow =
        "";
}
/* =========================================================
   IMAGE PREVIEW
========================================================= */
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
    if (!file) {
        return;
    }
    if (
        !file.type.startsWith(
            "image/"
        )
    ) {
        alert(
            "Please select a valid image."
        );
        return;
    }
    const reader =
        new FileReader();
    reader.onload =
        function(e) {
            if (
                imagePreview &&
                e.target
            ) {
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
    reader.readAsDataURL(
        file
    );
}
/* =========================================================
   IMAGE EDITING
========================================================= */
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
        let data = {};
        try {
            data =
                raw
                    ? JSON.parse(raw)
                    : {};
        } catch {
            data = {
                error:
                    raw ||
                    "Invalid image server response."
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
            "Image editor error:",
            error
        );
        alert(
            "Could not connect to the image editor. Please try again."
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
/* =========================================================
   UTILITIES
========================================================= */
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
/* =========================================================
   MOBILE SIDEBAR
========================================================= */
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
/* =========================================================
   EXPOSE FUNCTIONS
========================================================= */
window.sendMessage =
    sendMessage;
window.sendSuggestion =
    sendSuggestion;
window.newChat =
    newChat;
window.clearChat =
    clearChat;
window.showHome =
    showHome;
window.focusInput =
    focusInput;
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
/* =========================================================
   START APPLICATION
========================================================= */
if (
    document.readyState ===
    "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        initializeApp
    );
} else {
    initializeApp();
}
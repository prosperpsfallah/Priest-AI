/* =========================================================
   PRIEST AI — FRONTEND APPLICATION
   ========================================================= */


/* =========================================================
   ELEMENTS
   ========================================================= */

let chat = null;
let input = null;
let imageInput = null;
let imagePreview = null;
let previewContainer = null;
let resultContainer = null;
let resultImage = null;
let downloadButton = null;


/* =========================================================
   INITIALIZE
   ========================================================= */

function initializeApp() {

    chat = document.getElementById("chat");

    /*
     * IMPORTANT:
     * index.html uses messageInput.
     */
    input = document.getElementById("messageInput");

    imageInput = document.getElementById("imageInput");

    imagePreview = document.getElementById("imagePreview");

    previewContainer =
        document.getElementById("previewContainer");

    resultContainer =
        document.getElementById("resultContainer");

    resultImage =
        document.getElementById("resultImage");

    downloadButton =
        document.getElementById("downloadButton");


    console.log("PRIEST AI frontend loaded.");


    /* =====================================================
       CHAT FORM
       ===================================================== */

    const chatForm =
        document.getElementById("chatForm");

    if (chatForm) {

        chatForm.addEventListener(
            "submit",
            function(event) {

                event.preventDefault();

                sendMessage();
            }
        );
    }


    /* =====================================================
       ENTER KEY
       ===================================================== */

    if (input) {

        input.addEventListener(
            "keydown",
            function(event) {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    sendMessage();
                }
            }
        );
    }


    /* =====================================================
       NEW CHAT
       ===================================================== */

    const newChatButton =
        document.getElementById("newChat");

    if (newChatButton) {

        newChatButton.addEventListener(
            "click",
            newChat
        );
    }


    /* =====================================================
       MOBILE MENU
       ===================================================== */

    const menuButton =
        document.getElementById("menuButton");

    if (menuButton) {

        menuButton.addEventListener(
            "click",
            toggleSidebar
        );
    }


    /* =====================================================
       SUGGESTION BUTTONS
       ===================================================== */

    document
        .querySelectorAll(".suggestion")
        .forEach(function(button) {

            button.addEventListener(
                "click",
                function() {

                    const prompt =
                        button.dataset.prompt;

                    if (prompt) {

                        sendSuggestion(prompt);
                    }
                }
            );
        });


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
   SEND MESSAGE
   ========================================================= */

async function sendMessage() {

    if (!input) {

        console.error(
            "PRIEST AI: messageInput was not found."
        );

        return;
    }


    const text =
        input.value.trim();


    if (!text) {

        return;
    }


    /*
     * Remove welcome screen.
     */

    removeWelcome();


    /*
     * Show user's message.
     */

    addMessage(
        "You",
        text,
        "user"
    );


    /*
     * Clear input.
     */

    input.value = "";


    /*
     * Show typing.
     */

    showTyping();


    try {

        console.log(
            "Sending message to /api/chat:",
            text
        );


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


        console.log(
            "Server response:",
            raw
        );


        let data = {};


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


        /*
         * Remove typing indicator.
         */

        removeTyping();


        /*
         * Server error.
         */

        if (!response.ok) {

            console.error(
                "PRIEST AI server error:",
                response.status,
                data
            );


            addMessage(
                "PRIEST AI",
                "Server error (" +
                    response.status +
                    "): " +
                    (
                        data.error ||
                        "The AI server returned an error."
                    ),
                "ai"
            );

            return;
        }


        /*
         * Successful response.
         */

        const answer =
            data.answer ||
            data.message ||
            data.response ||
            "PRIEST AI did not return an answer.";


        addMessage(
            "PRIEST AI",
            answer,
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
            "Connection error. Please check that the PRIEST AI server is running.",
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
        document.createElement("div");


    message.className =
        "message " +
        type;


    /*
     * Avatar
     */

    const avatar =
        document.createElement("div");


    avatar.className =
        "message-avatar";


    avatar.textContent =
        type === "ai"
            ? "P"
            : "U";


    /*
     * Content
     */

    const content =
        document.createElement("div");


    content.className =
        "message-content";


    /*
     * Name
     */

    const nameElement =
        document.createElement("div");


    nameElement.style.fontWeight =
        "700";


    nameElement.style.marginBottom =
        "5px";


    nameElement.style.fontSize =
        "12px";


    nameElement.style.opacity =
        "0.7";


    nameElement.textContent =
        name;


    /*
     * Text
     */

    const textElement =
        document.createElement("div");


    textElement.innerHTML =
        formatText(text);


    /*
     * Assemble
     */

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
   FORMAT TEXT
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
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        )

        .replace(
            /\n/g,
            "<br>"
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
        document.createElement("div");


    typing.id =
        "typing";


    typing.className =
        "message ai";


    typing.innerHTML = `
        <div class="message-avatar">
            P
        </div>

        <div class="message-content">

            <div
                style="
                    font-weight:700;
                    margin-bottom:5px;
                    font-size:12px;
                    opacity:.7;
                "
            >
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


    chat.innerHTML =
        "";


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


    chat.innerHTML =
        "";


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

            <div class="welcome-logo">
                P
            </div>

            <h1>
                PRIEST AI
            </h1>

            <p>
                Your AI assistant for questions,
                coding, learning, writing,
                ideas and image editing.
            </p>

            <div class="suggestions">

                <button
                    type="button"
                    class="suggestion"
                    data-prompt="Teach me programming from beginner level"
                >
                    💻 Learn Programming
                </button>

                <button
                    type="button"
                    class="suggestion"
                    data-prompt="Help me build a professional website"
                >
                    🌐 Build a Website
                </button>

                <button
                    type="button"
                    class="suggestion"
                    data-prompt="Explain artificial intelligence simply"
                >
                    🤖 Explain AI
                </button>

                <button
                    type="button"
                    class="suggestion"
                    data-prompt="Give me a legal and ethical cybersecurity learning idea"
                >
                    🔐 Cybersecurity
                </button>

            </div>

        </div>
    `;


    /*
     * Reconnect suggestion buttons
     */

    document
        .querySelectorAll(".suggestion")
        .forEach(function(button) {

            button.addEventListener(
                "click",
                function() {

                    sendSuggestion(
                        button.dataset.prompt
                    );
                }
            );
        });
}


/* =========================================================
   INPUT FOCUS
   ========================================================= */

function focusInput() {

    if (input) {

        input.focus();
    }
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
        !file.type.startsWith("image/")
    ) {

        alert(
            "Please select a valid image."
        );

        return;
    }


    const reader =
        new FileReader();


    reader.onload =
        function(event) {

            if (
                imagePreview &&
                event.target
            ) {

                imagePreview.src =
                    event.target.result;
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
   IMAGE EDITOR
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

            alert(
                data.error ||
                "Image editing failed."
            );

            return;
        }


        if (
            !data.image
        ) {

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
            "Could not connect to the image editor."
        );
    }
}


/* =========================================================
   MOBILE SIDEBAR
   ========================================================= */

function toggleSidebar() {

    const sidebar =
        document.getElementById(
            "sidebar"
        );


    if (!sidebar) {

        return;
    }


    sidebar.classList.toggle(
        "open"
    );
}


/* =========================================================
   SCROLL CHAT
   ========================================================= */

function scrollChat() {

    if (chat) {

        chat.scrollTop =
            chat.scrollHeight;
    }
}


/* =========================================================
   REMOVE WELCOME
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


/* =========================================================
   GLOBAL FUNCTIONS
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

window.previewImage =
    previewImage;

window.editImage =
    editImage;

window.toggleSidebar =
    toggleSidebar;


/* =========================================================
   START
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
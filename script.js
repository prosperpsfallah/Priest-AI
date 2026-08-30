/* =========================================================
   PRIEST AI — FINAL FRONTEND
========================================================= */
let chat;
let input;
let chatForm;
let sendButton;
/* =========================================================
   INITIALIZE
========================================================= */
function initializeApp() {
    chat = document.getElementById("chat");
    input = document.getElementById("messageInput");
    chatForm = document.getElementById("chatForm");
    sendButton = document.getElementById("sendButton");
    console.log("PRIEST AI frontend loaded.");
    console.log("Chat:", !!chat);
    console.log("Input:", !!input);
    console.log("Form:", !!chatForm);
    console.log("Send button:", !!sendButton);
    /* FORM SUBMIT */
    if (chatForm) {
        chatForm.addEventListener(
            "submit",
            function(event) {
                event.preventDefault();
                sendMessage();
            }
        );
    }
    /* SUGGESTION BUTTONS */
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
    /* NEW CHAT */
    const newChatButton =
        document.getElementById("newChat");
    if (newChatButton) {
        newChatButton.addEventListener(
            "click",
            newChat
        );
    }
    /* MOBILE MENU */
    const menuButton =
        document.getElementById("menuButton");
    if (menuButton) {
        menuButton.addEventListener(
            "click",
            toggleSidebar
        );
    }
}
/* =========================================================
   SEND MESSAGE
========================================================= */
async function sendMessage() {
    console.log("sendMessage() started");
    if (!input) {
        console.error(
            "PRIEST AI: messageInput was not found."
        );
        alert(
            "PRIEST AI: Message box was not found."
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
        console.log(
            "Sending message to /api/chat..."
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
        console.log(
            "Server status:",
            response.status
        );
        const raw =
            await response.text();
        console.log(
            "Server response:",
            raw
        );
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
        removeTyping();
        if (!response.ok) {
            addMessage(
                "PRIEST AI",
                data.error ||
                    `Server error ${response.status}`,
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
        console.error(
            "PRIEST AI connection error:",
            error
        );
        removeTyping();
        addMessage(
            "PRIEST AI",
            "Connection error: " +
                error.message,
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
    const avatar =
        document.createElement("div");
    avatar.className =
        "message-avatar";
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
            /\n/g,
            "<br>"
        )
        .replace(
            /\*\*(.*?)\*\*/g,
            "<strong>$1</strong>"
        );
}
/* =========================================================
   TYPING
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
    chat.innerHTML = "";
    showHome();
    if (input) {
        input.focus();
    }
}
/* =========================================================
   HOME
========================================================= */
function showHome() {
    if (!chat) {
        return;
    }
    chat.innerHTML = `
        <div
            class="welcome"
            id="welcome"
        >
            <div class="welcome-logo">
                P
            </div>
            <h1>
                PRIEST AI
            </h1>
            <p>
                Your AI assistant for questions,
                ideas, coding, learning and creative work.
            </p>
            <div class="suggestions">
                <button
                    class="suggestion"
                    type="button"
                    data-prompt="What can you help me with?"
                >
                    What can you help me with?
                </button>
                <button
                    class="suggestion"
                    type="button"
                    data-prompt="Help me write some code"
                >
                    Help me write some code
                </button>
                <button
                    class="suggestion"
                    type="button"
                    data-prompt="Explain something to me"
                >
                    Explain something
                </button>
            </div>
        </div>
    `;
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
   SCROLL
========================================================= */
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
        document.getElementById(
            "sidebar"
        );
    if (sidebar) {
        sidebar.classList.toggle(
            "open"
        );
    }
}
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
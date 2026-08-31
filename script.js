const chatContainer = document.getElementById("chatContainer");
const welcomeScreen = document.getElementById("welcomeScreen");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const newChatBtn = document.getElementById("newChatBtn");
const clearChatBtn = document.getElementById("clearChatBtn");
const chatMenuBtn = document.getElementById("chatMenuBtn");
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const sidebar = document.querySelector(".sidebar");
let isSending = false;
/* =========================
   ADD MESSAGE
========================= */
function addMessage(text, sender) {
    if (welcomeScreen) {
        welcomeScreen.style.display = "none";
    }
    const message = document.createElement("div");
    message.className = `message ${sender}`;
    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = sender === "user" ? "U" : "P";
    const content = document.createElement("div");
    content.className = "message-content";
    const name = document.createElement("div");
    name.className = "message-name";
    name.textContent = sender === "user" ? "You" : "PRIEST AI";
    const messageText = document.createElement("div");
    messageText.className = "message-text";
    // textContent keeps user/AI messages from being treated as HTML
    messageText.textContent = text;
    content.appendChild(name);
    content.appendChild(messageText);
    if (sender === "user") {
        message.appendChild(content);
        message.appendChild(avatar);
    } else {
        message.appendChild(avatar);
        message.appendChild(content);
    }
    chatContainer.appendChild(message);
    scrollToBottom();
}
/* =========================
   TYPING INDICATOR
========================= */
function showTyping() {
    const typing = document.createElement("div");
    typing.className = "message ai";
    typing.id = "typingIndicator";
    typing.innerHTML = `
        <div class="message-avatar">P</div>
        <div class="message-content">
            <div class="message-name">
                PRIEST AI
            </div>
            <div class="message-text typing">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    chatContainer.appendChild(typing);
    scrollToBottom();
}
/* =========================
   REMOVE TYPING
========================= */
function removeTyping() {
    const typing = document.getElementById("typingIndicator");
    if (typing) {
        typing.remove();
    }
}
/* =========================
   SCROLL
========================= */
function scrollToBottom() {
    setTimeout(() => {
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 50);
}
/* =========================
   SEND MESSAGE
========================= */
async function sendMessage() {
    if (isSending) {
        return;
    }
    const message = messageInput.value.trim();
    if (!message) {
        return;
    }
    isSending = true;
    sendBtn.disabled = true;
    addMessage(message, "user");
    messageInput.value = "";
    messageInput.style.height = "auto";
    showTyping();
    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: message
            })
        });
        let data;
        try {
            data = await response.json();
        } catch (jsonError) {
            throw new Error(
                "The server returned an invalid response."
            );
        }
        removeTyping();
        if (!response.ok) {
            throw new Error(
                data.error ||
                data.message ||
                `Server error: ${response.status}`
            );
        }
        if (!data.reply) {
            throw new Error(
                "PRIEST AI returned no answer."
            );
        }
        addMessage(data.reply, "ai");
    } catch (error) {
        removeTyping();
        console.error("PRIEST AI ERROR:", error);
        addMessage(
            "Sorry, I couldn't connect to PRIEST AI right now. Please try again.",
            "ai"
        );
    } finally {
        isSending = false;
        sendBtn.disabled = false;
        messageInput.focus();
    }
}
/* =========================
   SEND BUTTON
========================= */
sendBtn.addEventListener("click", () => {
    sendMessage();
});
/* =========================
   ENTER TO SEND
========================= */
messageInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
});
/* =========================
   AUTO RESIZE TEXTAREA
========================= */
messageInput.addEventListener("input", () => {
    messageInput.style.height = "auto";
    messageInput.style.height =
        Math.min(messageInput.scrollHeight, 140) + "px";
});
/* =========================
   SUGGESTION BUTTONS
========================= */
document.querySelectorAll(".suggestion-btn").forEach((button) => {
    button.addEventListener("click", () => {
        messageInput.value = button.textContent.trim();
        messageInput.dispatchEvent(
            new Event("input")
        );
        messageInput.focus();
    });
});
/* =========================
   NEW CHAT
========================= */
newChatBtn.addEventListener("click", () => {
    chatContainer
        .querySelectorAll(".message")
        .forEach((message) => message.remove());
    if (welcomeScreen) {
        welcomeScreen.style.display = "block";
    }
    messageInput.value = "";
    messageInput.style.height = "auto";
    messageInput.focus();
});
/* =========================
   CLEAR CHAT
========================= */
clearChatBtn.addEventListener("click", () => {
    chatContainer
        .querySelectorAll(".message")
        .forEach((message) => message.remove());
    if (welcomeScreen) {
        welcomeScreen.style.display = "block";
    }
});
/* =========================
   CHAT MENU
========================= */
chatMenuBtn.addEventListener("click", () => {
    document
        .querySelectorAll(".side-btn")
        .forEach((button) => {
            button.classList.remove("active");
        });
    chatMenuBtn.classList.add("active");
});
/* =========================
   MOBILE SIDEBAR
========================= */
mobileMenuBtn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
});
/* =========================
   CLOSE MOBILE SIDEBAR
========================= */
document.addEventListener("click", (event) => {
    if (window.innerWidth > 700) {
        return;
    }
    if (
        sidebar.classList.contains("open") &&
        !sidebar.contains(event.target) &&
        !mobileMenuBtn.contains(event.target)
    ) {
        sidebar.classList.remove("open");
    }
});
/* =========================
   STARTUP
========================= */
console.log("PRIEST AI frontend loaded successfully.");
messageInput.focus();
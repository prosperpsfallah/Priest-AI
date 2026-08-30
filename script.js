console.log("PRIEST AI SCRIPT LOADED");

const chat = document.getElementById("chat");
const input = document.getElementById("messageInput");
const form = document.getElementById("chatForm");
const sendButton = document.getElementById("sendButton");

/* ================= THEME TOGGLE ================= */
const themeToggle = document.getElementById("themeToggle");
if (themeToggle) {
    themeToggle.addEventListener("click", function() {
        document.body.classList.toggle("light");
        this.textContent = document.body.classList.contains("light") ? "🌙" : "☀️";
        localStorage.setItem("theme", document.body.classList.contains("light") ? "light" : "dark");
    });

    /* Load saved theme */
    if (localStorage.getItem("theme") === "light") {
        document.body.classList.add("light");
        themeToggle.textContent = "🌙";
    }
}

/* ================= SEND MESSAGE ================= */
async function sendMessage() {
    console.log("SEND BUTTON WORKING");
    const text = input.value.trim();
    if (!text) return;

    const welcome = document.getElementById("welcome");
    if (welcome) welcome.remove();

    addMessage("You", text, "user");
    input.value = "";

    const thinking = document.createElement("div");
    thinking.id = "thinking";
    thinking.className = "message ai";
    thinking.innerHTML = `
        <div class="message-avatar">P</div>
        <div class="message-content">
            <strong>PRIEST AI</strong><br>
            Thinking... 🤔
        </div>
    `;
    chat.appendChild(thinking);
    chat.scrollTop = chat.scrollHeight;

    try {
        console.log("Calling /api/chat...");
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text })
        });

        console.log("API STATUS:", response.status);
        const raw = await response.text();
        console.log("API RESPONSE:", raw);

        if (thinking) thinking.remove();

        let data = {};
        try { 
            data = JSON.parse(raw); 
        } catch { 
            data = { error: raw || "The server returned an invalid response." }; 
        }

        if (!response.ok) {
            addMessage("PRIEST AI", "Server error: " + (data.error || "Unknown error"), "ai");
            return;
        }

        addMessage("PRIEST AI", data.answer || "PRIEST AI did not return an answer.", "ai");

    } catch (error) {
        console.error("CHAT ERROR:", error);
        if (thinking) thinking.remove();
        addMessage("PRIEST AI", "Connection error: " + error.message, "ai");
    }
}

/* ================= ADD MESSAGE ================= */
function addMessage(name, text, type) {
    const message = document.createElement("div");
    message.className = "message " + type;

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = type === "ai" ? "P" : "U";

    const content = document.createElement("div");
    content.className = "message-content";

    const nameElement = document.createElement("strong");
    nameElement.textContent = name;

    const textElement = document.createElement("div");
    textElement.style.marginTop = "4px";
    textElement.textContent = text;

    content.appendChild(nameElement);
    content.appendChild(textElement);
    message.appendChild(avatar);
    message.appendChild(content);
    chat.appendChild(message);
    chat.scrollTop = chat.scrollHeight;
}

/* ================= FORM SUBMIT ================= */
if (form) {
    form.addEventListener("submit", function(event) {
        event.preventDefault();
        sendMessage();
    });
}

/* ================= SUGGESTIONS ================= */
document.querySelectorAll(".suggestion").forEach(function(button) {
    button.addEventListener("click", function() {
        input.value = button.dataset.prompt;
        sendMessage();
    });
});

/* ================= NEW CHAT ================= */
const newChatBtn = document.getElementById("newChat");
if (newChatBtn) {
    newChatBtn.addEventListener("click", function() {
        chat.innerHTML = `
            <div class="welcome" id="welcome">
                <div class="welcome-logo">P</div>
                <h1>PRIEST AI</h1>
                <p>Your AI assistant for questions, ideas, coding, learning and creative work.</p>
                <div class="suggestions">
                    <button class="suggestion" type="button" data-prompt="What can you help me with?">What can you help me with?</button>
                    <button class="suggestion" type="button" data-prompt="Help me write some code">Help me write some code</button>
                    <button class="suggestion" type="button" data-prompt="Explain something to me">Explain something</button>
                </div>
            </div>
        `;
        attachSuggestionListeners();
    });
}

/* Re-attach listeners after new chat reset */
function attachSuggestionListeners() {
    document.querySelectorAll(".suggestion").forEach(function(button) {
        button.addEventListener("click", function() {
            input.value = button.dataset.prompt;
            sendMessage();
        });
    });
}

/* ================= MOBILE MENU ================= */
const menuButton = document.getElementById("menuButton");
if (menuButton) {
    menuButton.addEventListener("click", function() {
        document.getElementById("sidebar").classList.toggle("open");
    });
}
console.log("PRIEST AI CHAT.JS LOADED");

// DOM Elements
const chat = document.getElementById("chat");
const input = document.getElementById("messageInput");
const form = document.getElementById("chatForm");

// ================= THEME TOGGLE =================
const themeToggle = document.getElementById("themeToggle");
if (themeToggle) {
    themeToggle.addEventListener("click", function() {
        document.body.classList.toggle("light");
        this.textContent = document.body.classList.contains("light") ? "🌙" : "☀️";
        localStorage.setItem("theme", document.body.classList.contains("light") ? "light" : "dark");
    });

    // Load saved theme
    if (localStorage.getItem("theme") === "light") {
        document.body.classList.add("light");
        themeToggle.textContent = "🌙";
    }
}

// ================= SEND MESSAGE =================
async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    // Remove welcome screen
    const welcome = document.getElementById("welcome");
    if (welcome) welcome.remove();

    // Show user message
    addMessage("You", text, "user");
    input.value = "";

    // Show thinking
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
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message: text })
        });

        const raw = await response.text();
        if (thinking) thinking
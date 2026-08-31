document.addEventListener("DOMContentLoaded", function () {

    const chatContainer = document.getElementById("chatContainer");
    const welcomeScreen = document.getElementById("welcomeScreen");
    const messageInput = document.getElementById("messageInput");
    const sendBtn = document.getElementById("sendBtn");

    const newChatBtn = document.getElementById("newChatBtn");
    const clearChatBtn = document.getElementById("clearChatBtn");
    const chatMenuBtn = document.getElementById("chatMenuBtn");
    const mobileMenuBtn = document.getElementById("mobileMenuBtn");
    const sidebar = document.querySelector(".sidebar");

    console.log("PRIEST AI SCRIPT LOADED");

    // =========================
    // ADD MESSAGE
    // =========================

    function addMessage(text, sender) {

        if (welcomeScreen) {
            welcomeScreen.style.display = "none";
        }

        const message = document.createElement("div");
        message.className = "message " + sender;

        const avatar = document.createElement("div");
        avatar.className = "message-avatar";
        avatar.textContent = sender === "user" ? "U" : "P";

        const content = document.createElement("div");
        content.className = "message-content";

        const name = document.createElement("div");
        name.className = "message-name";
        name.textContent = sender === "user" ? "You" : "PRIEST AI";

        const textElement = document.createElement("div");
        textElement.className = "message-text";
        textElement.textContent = text;

        content.appendChild(name);
        content.appendChild(textElement);

        if (sender === "user") {
            message.appendChild(content);
            message.appendChild(avatar);
        } else {
            message.appendChild(avatar);
            message.appendChild(content);
        }

        chatContainer.appendChild(message);

        chatContainer.scrollTop = chatContainer.scrollHeight;
    }


    // =========================
    // SEND MESSAGE
    // =========================

    async function sendMessage() {

        const message = messageInput.value.trim();

        if (!message) {
            return;
        }

        console.log("Sending:", message);

        addMessage(message, "user");

        messageInput.value = "";

        sendBtn.disabled = true;

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

            const data = await response.json();

            console.log("Backend response:", data);

            if (!response.ok) {

                throw new Error(
                    data.error || "Server error: " + response.status
                );

            }

            if (!data.reply) {

                throw new Error(
                    "The AI did not return a reply."
                );

            }

            addMessage(data.reply, "ai");

        } catch (error) {

            console.error("PRIEST AI ERROR:", error);

            addMessage(
                "PRIEST AI ERROR: " + error.message,
                "ai"
            );

        } finally {

            sendBtn.disabled = false;
            messageInput.focus();

        }
    }


    // =========================
    // SEND BUTTON
    // =========================

    if (sendBtn) {

        sendBtn.addEventListener("click", function () {

            console.log("SEND BUTTON CLICKED");

            sendMessage();

        });

    } else {

        console.error("Send button not found.");

    }


    // =========================
    // ENTER KEY
    // =========================

    if (messageInput) {

        messageInput.addEventListener("keydown", function (event) {

            if (event.key === "Enter" && !event.shiftKey) {

                event.preventDefault();

                sendMessage();

            }

        });

    }


    // =========================
    // SUGGESTION BUTTONS
    // =========================

    document
        .querySelectorAll(".suggestion-btn")
        .forEach(function (button) {

            button.addEventListener("click", function () {

                messageInput.value =
                    button.textContent.trim();

                messageInput.focus();

            });

        });


    // =========================
    // NEW CHAT
    // =========================

    if (newChatBtn) {

        newChatBtn.addEventListener("click", function () {

            document
                .querySelectorAll(".message")
                .forEach(function (message) {
                    message.remove();
                });

            if (welcomeScreen) {
                welcomeScreen.style.display = "block";
            }

            messageInput.value = "";
            messageInput.focus();

        });

    }


    // =========================
    // CLEAR CHAT
    // =========================

    if (clearChatBtn) {

        clearChatBtn.addEventListener("click", function () {

            document
                .querySelectorAll(".message")
                .forEach(function (message) {
                    message.remove();
                });

            if (welcomeScreen) {
                welcomeScreen.style.display = "block";
            }

        });

    }


    // =========================
    // CHAT MENU
    // =========================

    if (chatMenuBtn) {

        chatMenuBtn.addEventListener("click", function () {

            document
                .querySelectorAll(".side-btn")
                .forEach(function (button) {
                    button.classList.remove("active");
                });

            chatMenuBtn.classList.add("active");

        });

    }


    // =========================
    // MOBILE MENU
    // =========================

    if (mobileMenuBtn && sidebar) {

        mobileMenuBtn.addEventListener("click", function () {

            sidebar.classList.toggle("open");

        });

    }

});
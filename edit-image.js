console.log("PRIEST AI EDIT-IMAGE.JS LOADED");

const imageInput = document.getElementById("imageInput");
const imageUploadBtn = document.querySelector(".image-upload");
let uploadedImageBase64 = null;

// ================= HANDLE IMAGE UPLOAD =================
if (imageInput) {
    imageInput.addEventListener("change", function(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Check file type
        if (!file.type.startsWith("image/")) {
            alert("Please upload an image file");
            return;
        }

        // Check file size - max 5MB
        if (file.size > 5 * 1024 * 1024) {
            alert("Image is too large. Max 5MB");
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            uploadedImageBase64 = event.target.result;

            // Show preview in chat
            addImagePreview(uploadedImageBase64, file.name);

            // Auto-focus input so user can type prompt
            document.getElementById("messageInput").focus();
            document.getElementById("messageInput").placeholder = "Ask about this image...";
        };
        reader.readAsDataURL(file);
    });
}

// ================= ADD IMAGE PREVIEW =================
function addImagePreview(base64, filename) {
    const chat = document.getElementById("chat");
    const welcome = document.getElementById("welcome");
    if (welcome) welcome.remove();

    const message = document.createElement("div");
    message.className = "message user";

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = "U";

    const content = document.createElement("div");
    content.className = "message-content";
    content.innerHTML = `
        <strong>You</strong>
        <div style="margin-top: 8px;">
            <img src="${base64}" style="max-width: 300px; max-height: 300px; border-radius: 12px; border: 1px solid var(--border2);" />
            <div style="font-size: 12px; color: var(--text3); margin-top: 4px;">${filename}</div>
        </div>
    `;

    message.appendChild(avatar);
    message.appendChild(content);
    chat.appendChild(message);
    chat.scrollTop = chat.scrollHeight;
}

// ================= MODIFY SENDMESSAGE TO INCLUDE IMAGE =================
// This overrides the sendMessage in chat.js if image is attached
window.sendMessageWithImage = async function(text) {
    const chat = document.getElementById("chat");

    // Show thinking
    const thinking = document.createElement("div");
    thinking.id = "thinking";
    thinking.className = "message ai";
    thinking.innerHTML = `
        <div class="message-avatar">P</div>
        <div class="message-content">
            <strong>PRIEST AI</strong><br>
            Analyzing image... 👀
        </div>
    `;
    chat.appendChild(thinking);
    chat.scrollTop = chat.scrollHeight;

    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: text,
                image: uploadedImageBase64 // Send base64 to backend
            })
        });

        const raw = await response.text();
        if (thinking) thinking.remove();

        let data = {};
        try {
            data = JSON.parse(raw);
        } catch {
            data = { error: raw || "Invalid server response" };
        }

        if (!response.ok) {
            addMessage("PRIEST AI", "Server error: " + (data.error || "Unknown error"), "ai");
            return;
        }

        addMessage("PRIEST AI", data.answer || "PRIEST AI did not return an answer.", "ai");

        // Clear uploaded image after sending
        uploadedImageBase64 = null;
        imageInput.value = "";
        document.getElementById("messageInput").placeholder = "Message PRIEST AI...";

    } catch (error) {
        console.error("IMAGE CHAT ERROR:", error);
        if (thinking) thinking.remove();
        addMessage("PRIEST AI", "Connection error: " + error.message, "ai");
    }
}

// Helper to add text messages - same as in chat.js
function addMessage(name, text, type) {
    const chat = document.getElementById("chat");
    const message = document.createElement("div");
    message.className = "message " + type;

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = type === "ai"? "P" : "U";

    const content = document.createElement("div");
    content.className = "message-content";

    const nameElement = document.createElement("strong");
    nameElement.textContent = name;

    const textElement = document.createElement("div");
    textElement.style.marginTop = "4px";
    textElement.style.whiteSpace = "pre-wrap";
    textElement.textContent = text;

    content.appendChild(nameElement);
    content.appendChild(textElement);
    message.appendChild(avatar);
    message.appendChild(content);
    chat.appendChild(message);
    chat.scrollTop = chat.scrollHeight;
}
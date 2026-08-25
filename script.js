async function sendMessage() {
    const text = input.value.trim();

    if (!text) return;

    removeWelcome();

    addMessage("You", text, "user");

    input.value = "";

    showTyping();

    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: text
            })
        });

        const raw = await response.text();

        let data;

        try {
            data = JSON.parse(raw);
        } catch {
            data = {
                error: raw || "The server returned an unknown error."
            };
        }

        removeTyping();

        if (!response.ok) {
            addMessage(
                "PRIEST AI",
                `Server error (${response.status}): ${
                    data.error || "Unknown error"
                }`,
                "ai"
            );
            return;
        }

        addMessage(
            "PRIEST AI",
            data.answer || "No answer was returned.",
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
} catch (error) {
    removeTyping();
    console.error("PRIEST AI ERROR:", error);
    addMessage(
        "PRIEST AI ERROR: " + error.message,
        "ai"
    );
}
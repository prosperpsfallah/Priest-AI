/* =========================================================
   PRIEST AI — CHAT FRONTEND
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    console.log("PRIEST AI SCRIPT LOADED");

    const chat = document.getElementById("chat");
    const input = document.getElementById("messageInput");
    const form = document.getElementById("chatForm");
    const newChat = document.getElementById("newChat");
    const menuButton = document.getElementById("menuButton");
    const sidebar = document.getElementById("sidebar");

    /* -----------------------------------------------------
       CHECK ELEMENTS
    ----------------------------------------------------- */

    console.log("Chat:", chat);
    console.log("Input:", input);
    console.log("Form:", form);


    /* -----------------------------------------------------
       SEND MESSAGE
    ----------------------------------------------------- */

    async function sendMessage() {

        const text = input.value.trim();

        if (!text) {
            return;
        }

        console.log("MESSAGE:", text);

        /* Remove welcome */
        const welcome =
            document.getElementById("welcome");

        if (welcome) {
            welcome.remove();
        }

        /* Show user message */
        addMessage(
            "You",
            text,
            "user"
        );

        /* Clear input */
        input.value = "";

        /* Show thinking */
        addTyping();

        try {

            console.log(
                "Sending request to /api/chat..."
            );

            const response = await fetch(
                "/api/chat",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        message: text
                    })
                }
            );

            console.log(
                "HTTP STATUS:",
                response.status
            );

            const raw =
                await response.text();

            console.log(
                "SERVER RESPONSE:",
                raw
            );

            removeTyping();

            let data;

            try {

                data =
                    JSON.parse(raw);

            } catch {

                data = {
                    error: raw
                };

            }

            if (!response.ok) {

                addMessage(
                    "PRIEST AI",
                    data.error ||
                    `Server error: ${response.status}`,
                    "ai"
                );

                return;
            }

            const answer =
                data.answer ||
                data.response ||
                data.message ||
                "PRIEST AI did not return an answer.";

            addMessage(
                "PRIEST AI",
                answer,
                "ai"
            );

        } catch (error) {

            console.error(
                "FETCH ERROR:",
                error
            );

            removeTyping();

            addMessage(
                "PRIEST AI",
                "Unable to connect to the PRIEST AI server.",
                "ai"
            );
        }
    }


    /* -----------------------------------------------------
       FORM SUBMIT
    ----------------------------------------------------- */

    if (form) {

        form.addEventListener(
            "submit",
            (event) => {

                event.preventDefault();

                sendMessage();

            }
        );

    }


    /* -----------------------------------------------------
       ENTER KEY
    ----------------------------------------------------- */

    if (input) {

        input.addEventListener(
            "keydown",
            (event) => {

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


    /* -----------------------------------------------------
       SUGGESTION BUTTONS
    ----------------------------------------------------- */

    function setupSuggestions() {

        document
            .querySelectorAll(".suggestion")
            .forEach((button) => {

                button.onclick = () => {

                    const text =
                        button.dataset.prompt;

                    console.log(
                        "SUGGESTION:",
                        text
                    );

                    input.value = text;

                    sendMessage();

                };

            });

    }

    setupSuggestions();


    /* -----------------------------------------------------
       NEW CHAT
    ----------------------------------------------------- */

    if (newChat) {

        newChat.addEventListener(
            "click",
            () => {

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

                setupSuggestions();

                input.focus();

            }
        );

    }


    /* -----------------------------------------------------
       MOBILE MENU
    ----------------------------------------------------- */

    if (menuButton) {

        menuButton.addEventListener(
            "click",
            () => {

                sidebar.classList.toggle(
                    "open"
                );

            }
        );

    }


    /* -----------------------------------------------------
       ADD MESSAGE
    ----------------------------------------------------- */

    function addMessage(
        name,
        text,
        type
    ) {

        const message =
            document.createElement("div");

        message.className =
            `message ${type}`;


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

        nameElement.textContent =
            name;

        nameElement.style.fontWeight =
            "bold";

        nameElement.style.marginBottom =
            "6px";


        const textElement =
            document.createElement("div");

        textElement.textContent =
            text;


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


        scrollToBottom();

    }


    /* -----------------------------------------------------
       TYPING
    ----------------------------------------------------- */

    function addTyping() {

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

                <strong>
                    PRIEST AI
                </strong>

                <div>
                    Thinking... 🤔
                </div>

            </div>
        `;

        chat.appendChild(
            typing
        );

        scrollToBottom();

    }


    /* -----------------------------------------------------
       REMOVE TYPING
    ----------------------------------------------------- */

    function removeTyping() {

        const typing =
            document.getElementById(
                "typing"
            );

        if (typing) {
            typing.remove();
        }

    }


    /* -----------------------------------------------------
       SCROLL
    ----------------------------------------------------- */

    function scrollToBottom() {

        const container =
            document.getElementById(
                "chatContainer"
            );

        if (container) {

            container.scrollTop =
                container.scrollHeight;

        }

    }


    /* -----------------------------------------------------
       MAKE AVAILABLE TO HTML
    ----------------------------------------------------- */

    window.sendMessage =
        sendMessage;

});
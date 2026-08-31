console.log("PRIEST AI SCRIPT LOADED");

const chat = document.getElementById("chat");
const input = document.getElementById("messageInput");
const form = document.getElementById("chatForm");
const sendButton = document.getElementById("sendButton");


/* =====================================================
   THEME TOGGLE
===================================================== */

const themeToggle = document.getElementById("themeToggle");

if (themeToggle) {

    themeToggle.addEventListener("click", function () {

        document.body.classList.toggle("light");

        if (document.body.classList.contains("light")) {
            this.textContent = "🌙";
            localStorage.setItem("theme", "light");
        } else {
            this.textContent = "☀️";
            localStorage.setItem("theme", "dark");
        }

    });


    /* Load saved theme */

    if (localStorage.getItem("theme") === "light") {

        document.body.classList.add("light");

        themeToggle.textContent = "🌙";
    }
}


/* =====================================================
   CHECK IF USER WANTS AN IMAGE
===================================================== */

function isImageRequest(text) {

    const message = text.toLowerCase();

    const imageWords = [
        "generate an image",
        "generate image",
        "create an image",
        "create image",
        "make an image",
        "make image",
        "draw an image",
        "draw image",
        "generate a picture",
        "create a picture",
        "make a picture",
        "draw a picture",
        "create artwork",
        "generate artwork",
        "make artwork",
        "image of",
        "picture of"
    ];

    return imageWords.some(function(word) {
        return message.includes(word);
    });
}


/* =====================================================
   SEND MESSAGE
===================================================== */

async function sendMessage() {

    console.log("SEND BUTTON WORKING");

    const text = input.value.trim();

    if (!text) {
        return;
    }


    /* Remove welcome screen */

    const welcome = document.getElementById("welcome");

    if (welcome) {
        welcome.remove();
    }


    /* Show user's message */

    addMessage("You", text, "user");

    input.value = "";


    /* Show thinking message */

    const thinking = document.createElement("div");

    thinking.id = "thinking";

    thinking.className = "message ai";

    thinking.innerHTML = `
        <div class="message-avatar">P</div>

        <div class="message-content">

            <strong>PRIEST AI</strong>

            <div style="margin-top:4px;">
                Thinking... 🤔
            </div>

        </div>
    `;

    chat.appendChild(thinking);

    chat.scrollTop = chat.scrollHeight;


    try {

        /* =================================================
           IMAGE REQUEST
        ================================================= */

        if (isImageRequest(text)) {

            console.log("IMAGE REQUEST DETECTED");

            thinking.querySelector(".message-content").innerHTML = `
                <strong>PRIEST AI</strong>

                <div style="margin-top:4px;">
                    Creating your image... 🎨
                </div>
            `;


            console.log("Calling /api/generate-image...");


            const response = await fetch("/api/generate-image", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    prompt: text
                })

            });


            console.log(
                "IMAGE API STATUS:",
                response.status
            );


            const raw = await response.text();


            console.log(
                "IMAGE API RESPONSE:",
                raw
            );


            thinking.remove();


            let data = {};

            try {

                data = JSON.parse(raw);

            } catch {

                data = {
                    error:
                        raw ||
                        "The image server returned an invalid response."
                };

            }


            if (!response.ok) {

                addMessage(
                    "PRIEST AI",
                    "Image generation error: " +
                    (data.error || "Unknown error"),
                    "ai"
                );

                return;
            }


            /*
             * The backend should return:
             *
             * {
             *     "image": "IMAGE_URL"
             * }
             */

            if (!data.image) {

                addMessage(
                    "PRIEST AI",
                    "The image server did not return an image.",
                    "ai"
                );

                return;
            }


            /* Display generated image */

            addImageMessage(
                "PRIEST AI",
                data.image
            );


            return;
        }


        /* =================================================
           NORMAL TEXT QUESTION
        ================================================= */

        console.log("Calling /api/chat...");


        const response = await fetch("/api/chat", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: text
            })

        });


        console.log(
            "API STATUS:",
            response.status
        );


        const raw = await response.text();


        console.log(
            "API RESPONSE:",
            raw
        );


        thinking.remove();


        let data = {};

        try {

            data = JSON.parse(raw);

        } catch {

            data = {
                error:
                    raw ||
                    "The server returned an invalid response."
            };

        }


        if (!response.ok) {

            addMessage(
                "PRIEST AI",
                "Server error: " +
                (data.error || "Unknown error"),
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
            "PRIEST AI ERROR:",
            error
        );


        if (thinking) {
            thinking.remove();
        }


        addMessage(
            "PRIEST AI",
            "Connection error: " +
            error.message,
            "ai"
        );
    }
}


/* =====================================================
   ADD NORMAL MESSAGE
===================================================== */

function addMessage(name, text, type) {

    const message =
        document.createElement("div");

    message.className =
        "message " + type;


    const avatar =
        document.createElement("div");

    avatar.className =
        "message-avatar";

    avatar.textContent =
        type === "ai" ? "P" : "U";


    const content =
        document.createElement("div");

    content.className =
        "message-content";


    const nameElement =
        document.createElement("strong");

    nameElement.textContent =
        name;


    const textElement =
        document.createElement("div");

    textElement.style.marginTop =
        "4px";

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


    chat.scrollTop =
        chat.scrollHeight;
}


/* =====================================================
   ADD GENERATED IMAGE TO CHAT
===================================================== */

function addImageMessage(name, imageUrl) {

    const message =
        document.createElement("div");

    message.className =
        "message ai";


    const avatar =
        document.createElement("div");

    avatar.className =
        "message-avatar";

    avatar.textContent =
        "P";


    const content =
        document.createElement("div");

    content.className =
        "message-content";


    const nameElement =
        document.createElement("strong");

    nameElement.textContent =
        name;


    const image =
        document.createElement("img");

    image.src =
        imageUrl;

    image.alt =
        "Generated by PRIEST AI";


    image.style.display =
        "block";

    image.style.width =
        "100%";

    image.style.maxWidth =
        "600px";

    image.style.marginTop =
        "10px";

    image.style.borderRadius =
        "12px";


    image.onerror =
        function() {

            console.error(
                "Generated image could not be loaded."
            );

            image.replaceWith(
                document.createTextNode(
                    "The generated image could not be displayed."
                )
            );
        };


    content.appendChild(
        nameElement
    );

    content.appendChild(
        image
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


    chat.scrollTop =
        chat.scrollHeight;
}


/* =====================================================
   FORM SUBMIT
===================================================== */

if (form) {

    form.addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            sendMessage();
        }
    );
}


/* =====================================================
   SUGGESTIONS
===================================================== */

document
    .querySelectorAll(".suggestion")
    .forEach(function(button) {

        button.addEventListener(
            "click",
            function() {

                input.value =
                    button.dataset.prompt;

                sendMessage();
            }
        );
    });


/* =====================================================
   NEW CHAT
===================================================== */

const newChatBtn =
    document.getElementById("newChat");


if (newChatBtn) {

    newChatBtn.addEventListener(
        "click",
        function() {

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
                        ideas, coding, learning and
                        creative work.
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
                            data-prompt="Create an image of a beautiful Liberian city at sunset"
                        >
                            Create an image
                        </button>

                    </div>

                </div>
            `;


            attachSuggestionListeners();
        }
    );
}


/* =====================================================
   RE-ATTACH SUGGESTION BUTTONS
===================================================== */

function attachSuggestionListeners() {

    document
        .querySelectorAll(".suggestion")
        .forEach(function(button) {

            button.addEventListener(
                "click",
                function() {

                    input.value =
                        button.dataset.prompt;

                    sendMessage();
                }
            );
        });
}


/* =====================================================
   MOBILE MENU
===================================================== */

const menuButton =
    document.getElementById("menuButton");


if (menuButton) {

    menuButton.addEventListener(
        "click",
        function() {

            const sidebar =
                document.getElementById("sidebar");

            if (sidebar) {

                sidebar.classList.toggle(
                    "open"
                );
            }
        }
    );
}


console.log(
    "PRIEST AI READY"
);
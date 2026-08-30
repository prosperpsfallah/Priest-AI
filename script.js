/* =========================================================
   PRIEST AI — FRONTEND APPLICATION
   ========================================================= */


/* =========================================================
   ELEMENTS
   ========================================================= */

let chat = null;
let input = null;
let imageInput = null;
let imagePreview = null;
let chatForm = null;
let sendButton = null;
let newChatButton = null;
let menuButton = null;
let sidebar = null;


/* =========================================================
   INITIALIZE APP
   ========================================================= */

function initializeApp() {

    chat = document.getElementById("chat");

    /*
     * IMPORTANT:
     * The new index.html uses messageInput.
     */
    input = document.getElementById("messageInput");

    imageInput = document.getElementById("imageInput");

    imagePreview = document.getElementById("imagePreview");

    chatForm = document.getElementById("chatForm");

    sendButton = document.getElementById("sendButton");

    newChatButton = document.getElementById("newChat");

    menuButton = document.getElementById("menuButton");

    sidebar = document.getElementById("sidebar");


    console.log("PRIEST AI frontend loaded successfully.");

    /*
     * Chat form
     */
    if (chatForm) {

        chatForm.addEventListener(
            "submit",
            function (event) {

                event.preventDefault();

                sendMessage();

            }
        );

    }


    /*
     * Enter key
     */
    if (input) {

        input.addEventListener(
            "keydown",
            handleKey
        );

        /*
         * Automatically grow textarea
         */
        input.addEventListener(
            "input",
            autoResizeInput
        );

    }


    /*
     * New chat
     */
    if (newChatButton) {

        newChatButton.addEventListener(
            "click",
            newChat
        );

    }


    /*
     * Mobile menu
     */
    if (menuButton) {

        menuButton.addEventListener(
            "click",
            toggleSidebar
        );

    }


    /*
     * Image input
     */
    if (imageInput) {

        imageInput.addEventListener(
            "change",
            previewImage
        );

    }


    /*
     * Suggestion buttons
     */
    document
        .querySelectorAll(".suggestion")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const prompt =
                        button.dataset.prompt;

                    if (prompt) {
                        sendSuggestion(prompt);
                    }

                }
            );

        });
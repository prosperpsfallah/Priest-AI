// ==========================================
// PRIEST AI - IMAGE BUTTON
// ==========================================

// Find the Image button
const imageButton = document.getElementById("imageButton");

// Check if the button exists
if (imageButton) {

    // When the user clicks the Image button
    imageButton.addEventListener("click", function () {

        // Tell us in the browser console
        console.log("Image button clicked!");

        // Open the image editor
        window.location.href = "edit-image.html";

    });

} else {

    // This means the button was not found
    console.log("Image button was not found!");

}
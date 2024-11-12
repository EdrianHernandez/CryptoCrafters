document.addEventListener("DOMContentLoaded", function() {
    // Select the elements that will be observed for visibility changes
    const targets = document.querySelectorAll("#how-cryptography-works, .cipher-section, .vs-container, .term-container, .types-container, #type-headings, .application-container, .goals-container");

    // Create an IntersectionObserver to observe when elements become visible in the viewport
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // If the target element is in the viewport, add the "in-view" class and remove "out-view"
            if (entry.isIntersecting) {
                entry.target.classList.add("in-view");
                entry.target.classList.remove("out-view");
            } else {
                // If the target element is out of the viewport, remove "in-view" and add "out-view"
                entry.target.classList.remove("in-view");
                entry.target.classList.add("out-view");
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the element is in the viewport
    });

    // Begin observing each of the selected target elements
    targets.forEach(target => observer.observe(target));

    // Select the elements specifically related to terms for a separate observation
    const termTargets = document.querySelectorAll(".term-container");

    // Create another IntersectionObserver for term-related elements, with a left/right visibility distinction
    const termObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // If the target element is visible in the viewport, check its position
            if (entry.isIntersecting) {
                // If the element is on the left half of the screen, add the "in-view-left" class
                if (entry.boundingClientRect.left < window.innerWidth / 2) {
                    entry.target.classList.add("in-view-left");
                } else {
                    // Otherwise, add the "in-view-right" class
                    entry.target.classList.add("in-view-right");
                }
            } else {
                // If the element is not visible, remove both "in-view-left" and "in-view-right"
                entry.target.classList.remove("in-view-left", "in-view-right");
            }
        });
    }, {
        threshold: 0.5 // Trigger when 50% of the element is in the viewport
    });

    // Begin observing the term-related elements
    termTargets.forEach(target => termObserver.observe(target));

    // Select the encrypt button and add an event listener for the "click" event
    const encryptBtn = document.getElementById("encryptBtn");
    encryptBtn.addEventListener("click", encrypt); // Call the encrypt function when the button is clicked
});

// Function that performs a Caesar cipher encryption
function encrypt() {
    // Get the shift value and plaintext from input fields
    const shift = parseInt(document.getElementById("shift").value);
    const plaintext = document.getElementById("plaintext").value;
    let encryptedText = "";

    // Check if shift or plaintext are invalid
    if (isNaN(shift) || plaintext === "") {
        document.getElementById("encryptedText").textContent = "Please enter a valid shift and plaintext.";
        return; // Exit the function if input is invalid
    }

    // Perform Caesar cipher encryption
    for (let i = 0; i < plaintext.length; i++) {
        const charCode = plaintext.charCodeAt(i);

        if (charCode >= 65 && charCode <= 90) {
            // Encrypt uppercase letters
            encryptedText += String.fromCharCode(((charCode - 65 + shift) % 26 + 26) % 26 + 65);
        }
        else if (charCode >= 97 && charCode <= 122) {
            // Encrypt lowercase letters
            encryptedText += String.fromCharCode(((charCode - 97 + shift) % 26 + 26) % 26 + 97);
        }
        else {
            // Keep non-alphabetic characters unchanged
            encryptedText += plaintext[i];
        }
    }

    // Display the encrypted text
    document.getElementById("encryptedText").textContent = encryptedText;
}

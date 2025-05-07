// Initialize DOM content and animations
document.addEventListener("DOMContentLoaded", function() {
    // Select elements to be observed for scroll-based animations
    const targets = document.querySelectorAll("#how-cryptography-works, #cipher-section, .vs-container, .term-container, .types-container, #type-headings, .application-container, .goals-container");

    // Create IntersectionObserver for general scroll animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // Add or remove animation classes based on visibility
            if (entry.isIntersecting) {
                entry.target.classList.add("in-view");
                entry.target.classList.remove("out-view");
            } else {
                entry.target.classList.remove("in-view");
                entry.target.classList.add("out-view");
            }
        });
    }, {
        threshold: 0.5 // Trigger animation when element is 50% visible
    });

    // Start observing all target elements
    targets.forEach(target => observer.observe(target));

    // Select term-specific elements for special animations
    const termTargets = document.querySelectorAll(".term-container");

    // Create separate observer for term animations with position-based classes
    const termObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Add different animation classes based on screen position
                if (entry.boundingClientRect.left < window.innerWidth / 2) {
                    entry.target.classList.add("in-view-left");
                } else {
                    entry.target.classList.add("in-view-right");
                }
            } else {
                // Remove animation classes when not visible
                entry.target.classList.remove("in-view-left", "in-view-right");
            }
        });
    }, {
        threshold: 0.5
    });

    // Start observing term elements
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
    document.getElementById("encryptedText").textContent = encryptedText.toUpperCase();
}

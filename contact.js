// Import Firebase services for database operations
import { db, collection, addDoc } from './firebase.js';

// Get the contact form element from the DOM
const contactForm = document.querySelector(".contact-form");

// Add submit event listener to handle form submission
contactForm.addEventListener("submit", async function(event) {
    event.preventDefault();  // Prevent default form submission behavior

    // Get form field values
    const firstName = document.getElementById("first-name").value;
    const lastName = document.getElementById("last-name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;

    // Validate that all fields are filled
    if (firstName && lastName && email && message) {
        try {
            // Get reference to the messages collection in Firestore
            const messagesRef = collection(db, "contactMessages");

            // Add new message document to Firestore
            await addDoc(messagesRef, {
                firstName: firstName,
                lastName: lastName,
                email: email,
                message: message,
                timestamp: new Date().toISOString(),  // Add timestamp
            });

            // Show success message and reset form
            alert("Thank you for your message! We'll get back to you soon.");
            contactForm.reset();  // Reset form after submission

        } catch (error) {
            console.error("Error submitting message: ", error.message);  // Log detailed error
            alert("There was an error submitting your message. Please try again.");
        }
    } else {
        alert("Please fill in all fields.");
    }
});
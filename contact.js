import { db, collection, addDoc } from './firebase.js';

const contactForm = document.querySelector(".contact-form");
contactForm.addEventListener("submit", async function(event) {
    event.preventDefault();  // Prevent default form submission behavior

    const firstName = document.getElementById("first-name").value;
    const lastName = document.getElementById("last-name").value;
    const email = document.getElementById("email").value;
    const message = document.getElementById("message").value;

    if (firstName && lastName && email && message) {
        try {
            const messagesRef = collection(db, "contactMessages");

            // Adding document to Firestore
            await addDoc(messagesRef, {
                firstName: firstName,
                lastName: lastName,
                email: email,
                message: message,
                timestamp: new Date().toISOString(),  // Add timestamp
            });

            // Success message
            alert("Thank you for your message! We'll get back to you soon.");
            contactForm.reset();  // Reset form after submission

        } catch (error) {
            console.error("Error submitting message: ", error.message);  // More detailed error logging
            alert("There was an error submitting your message. Please try again.");
        }
    } else {
        alert("Please fill in all fields.");
    }
});
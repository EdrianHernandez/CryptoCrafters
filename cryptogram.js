const quotes = [
    { quote: "Love is composed of a single soul inhabiting two bodies.", author: "Aristotle" },
    { quote: "The best thing to hold onto in life is each other.", author: "Audrey Hepburn" },
    { quote: "We are most alive when we’re in love.", author: "John Updike" },
    { quote: "Love all, trust a few, do wrong to none.", author: "William Shakespeare" },
    { quote: "Where there is love there is life.", author: "Mahatma Gandhi" },
    { quote: "You know you’re in love when you can’t fall asleep because reality is finally better than your dreams.", author: "Dr. Seuss" },
    { quote: "Love is not about possession. Love is about appreciation.", author: "Osho" },
    { quote: "The greatest thing you’ll ever learn is just to love and be loved in return.", author: "Eden Ahbez" },
    { quote: "Love is friendship that has caught fire.", author: "Anne Lindbergh" },
    { quote: "In the end, we only regret the chances we didn’t take.", author: "Lewis Carroll" },
    { quote: "Love does not dominate; it cultivates.", author: "Johann Wolfgang von Goethe" },
    { quote: "The best love is the kind that awakens the soul.", author: "Nicholas Sparks" },
    { quote: "You are my sun, my moon, and all my stars.", author: "E.E. Cummings" },
    { quote: "Love is when the other person’s happiness is more important than your own.", author: "H. Jackson Brown Jr." },
    { quote: "A successful relationship requires falling in love multiple times, but always with the same person.", author: "Mignon McLaughlin" },
];

let shift = 3; 
let currentQuote = {};
let hintIndex = 0;
let focusedInputField = null; // Track the current input field in focus
let hintsUsed = 0; // Track the number of hints used
const maxHints = 2;
let timerInterval;
let timeLeft = 300; // Timer set for 5 minutes (300 seconds)

// Load sound files
const correctSound = new Audio('sounds/correct.mp3');
const incorrectSound = new Audio('sounds/incorrect.mp3');
const hintSound = new Audio('sounds/hint.mp3');

// Function to encode quote
// Function to encode quote
function encodeQuote(quote) {
    return quote.split('').map(char => {
        if (char.match(/[a-z]/i)) {
            let code = char.charCodeAt();
            let base = char.toLowerCase() === char ? 97 : 65;
            return String.fromCharCode(((code - base + shift) % 26) + base).toUpperCase(); // Convert to uppercase
        }
        return char; // Return punctuation as is
    }).join('');
}

// Function to display new encoded quote
function displayNewQuote() {
    currentQuote = quotes[Math.floor(Math.random() * quotes.length)];
    const encoded = encodeQuote(currentQuote.quote);
    document.getElementById('clue').innerHTML = `<strong>Quote:</strong> ${currentQuote.author}`;
    document.getElementById('result').innerText = '';
    hintIndex = 0;

    const encodedContainer = document.getElementById('encoded-quote');
    encodedContainer.innerHTML = '';

    const inputFieldsMap = {}; // Tracks input fields for each encrypted letter

    // Split the encoded quote into words
    const encodedWords = encoded.split(' ');

    for (let word of encodedWords) {
        const wordContainer = document.createElement('div');
        wordContainer.classList.add('encoded-word');

        for (let char of word) {
            const letterContainer = document.createElement('div');
            letterContainer.classList.add('letter-box');

            if (char.match(/[a-z]/i)) { // Only add input for letters
                const input = document.createElement('input');
                input.type = 'text';
                input.maxLength = 1;

                const charSpan = document.createElement('span');
                charSpan.innerText = char;

                letterContainer.appendChild(input);
                letterContainer.appendChild(charSpan);

                if (!inputFieldsMap[char]) {
                    inputFieldsMap[char] = [];
                }
                inputFieldsMap[char].push(input);

                // Add event listener for uppercase input and synchronize letters
                input.addEventListener("input", function () {
                    const enteredValue = this.value.toUpperCase(); // Convert to uppercase
                    inputFieldsMap[char].forEach(field => field.value = enteredValue);
                });

                // Add hover effect event listeners for all fields of the same letter
                input.addEventListener("mouseenter", function () {
                    inputFieldsMap[char].forEach(field => field.classList.add('hover-effect'));
                });

                input.addEventListener("mouseleave", function () {
                    inputFieldsMap[char].forEach(field => field.classList.remove('hover-effect'));
                });

            } else {
                const punctuationSpan = document.createElement('span');
                punctuationSpan.innerText = char;
                punctuationSpan.style.margin = '0 5px';
                letterContainer.appendChild(punctuationSpan);
            }

            wordContainer.appendChild(letterContainer);
        }

        encodedContainer.appendChild(wordContainer);
    }
    encodedContainer.classList.add('fade-in');

    // Reset timer
    resetTimer();
}


// Check if user input matches the original quote
function checkAnswer() {
    const userInputs = document.querySelectorAll('#encoded-quote input');
    const userInput = Array.from(userInputs).map(input => input.value.trim().toLowerCase()).join('');
    const originalQuote = currentQuote.quote.toLowerCase().replace(/[^a-z]/g, '');

    if (userInput === originalQuote) {
        clearInterval(timerInterval); // Stop the timer
        document.getElementById('result').innerText = 'Correct! 🎉';
        correctSound.play();

        // Show the new quote after a brief delay
        setTimeout(() => {
            displayNewQuote();
        }, 5000); // Adjust delay time as desired
    } else {
        document.getElementById('result').innerText = 'Try again!';
        incorrectSound.play();
        userInputs.forEach(input => {
            input.classList.add('shake');
            setTimeout(() => input.classList.remove('shake'), 500);
        });
    }
}


// Provide hint by revealing a letter
function provideHint() {
    // Check if the hint limit has been reached
    if (hintsUsed >= maxHints) {
        alert("Hint limit reached!");
        return;
    }

    // Ensure a field is in focus for the hint to work
    if (!focusedInputField) {
        alert("Please place the cursor in a letter input field to receive a hint.");
        return;
    }

    // Get all inputs in the encoded quote section, focusing only on letters
    const inputs = Array.from(document.querySelectorAll('#encoded-quote input[type="text"]'));
    const originalLetters = currentQuote.quote.toUpperCase().split('').filter(char => /[A-Z]/.test(char)); // Only alphabetic chars
    const encodedLetters = encodeQuote(currentQuote.quote).split('').filter(char => /[A-Z]/.test(char)); // Only alphabetic chars

    // Find the index of the focused input field in the alphabetic-only array
    const inputIndex = inputs.indexOf(focusedInputField);
    const letterToReveal = originalLetters[inputIndex];

    // Check if the focused input corresponds to a letter in the quote
    if (letterToReveal) { // Only proceed if there’s a valid letter to reveal
        // Reveal all matching letters across the puzzle
        inputs.forEach((input, index) => {
            if (originalLetters[index] === letterToReveal && input.value === "") { // Only reveal if it's empty
                input.value = letterToReveal; // Reveal the letter
                input.style.color = '#090979'; // Style the revealed letter
                input.parentElement.classList.add('fade-in'); // Add animation
            }
        });

        hintSound.play(); // Play hint sound
        hintsUsed++; // Increment hint usage
    } else {
        alert("Please focus on a letter input field.");
    }
}


function revealAnswer() {
    clearInterval(timerInterval);
    
    const inputs = document.querySelectorAll('#encoded-quote input'); // Get all input fields
    const originalLetters = currentQuote.quote.toUpperCase().split(''); // Split the original quote into letters

    let letterIndex = 0; // Initialize a letter index to track position in the originalLetters array

    // Loop through each input and set its value to the corresponding letter, ignoring spaces and punctuation
    inputs.forEach(input => {
        // Only reveal letters
        while (letterIndex < originalLetters.length && !originalLetters[letterIndex].match(/[A-Z]/i)) {
            letterIndex++; // Skip non-letter characters
        }

        if (letterIndex < originalLetters.length) { // Check if the letter index is still valid
            input.value = originalLetters[letterIndex]; // Set the input value to the letter
            input.style.color = '#090979'; // Change the color to indicate it's revealed

            // Add fade-in class to the input field
            input.parentElement.classList.add('fade-in'); // Assuming input's parent is the one to fade in

            hintSound.play();
            letterIndex++; // Move to the next letter
        }
    });
}

// Timer functions
function startTimer() {
    timerInterval = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            document.getElementById('timer').innerHTML = "<strong>Timer:</strong> Time's up!";
            alert("Time's up! You can no longer enter answers.");
            revealAnswer();

            // Delay the call to displayNewQuote by a few seconds (e.g., 3 seconds)
            setTimeout(() => {
                displayNewQuote();
            }, 10000); // 10000 milliseconds = 10 seconds
        } else {
            const minutes = Math.floor(timeLeft / 60);
            const seconds = timeLeft % 60;
            document.getElementById('timer').innerHTML = `<strong>Timer:</strong> ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
            timeLeft--;
        }
    }, 1000);
}


function resetTimer() {
    clearInterval(timerInterval);
    timeLeft = 300; // Reset time left to 5 minutes
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer').innerHTML = `<strong>Timer:</strong> ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`; // Initialize timer display
    startTimer(); // Start the timer when a new quote is displayed
}

document.getElementById('submit-btn').addEventListener('click', checkAnswer);
document.getElementById('new-quote-btn').addEventListener('click', displayNewQuote);
document.getElementById('hint-btn').addEventListener('click', provideHint);
document.getElementById('reveal-answer-btn').addEventListener('click', revealAnswer);

window.onload = displayNewQuote;

// Show and hide instructions
document.getElementById('help-btn').addEventListener('click', () => {
    document.getElementById('instructions-popup').style.display = 'block';
});

document.getElementById('close-instructions').addEventListener('click', () => {
    document.getElementById('instructions-popup').style.display = 'none';
});

document.addEventListener('focusin', (event) => {
    if (event.target.tagName === 'INPUT') {
        focusedInputField = event.target;
    }
});

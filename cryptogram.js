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

// Load sound files
const correctSound = new Audio('sounds/correct.mp3');
const incorrectSound = new Audio('sounds/incorrect.mp3');
const hintSound = new Audio('sounds/hint.mp3');

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
    document.getElementById('clue').innerText = `Quote: ${currentQuote.author}`;
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
}


// Check if user input matches the original quote
function checkAnswer() {
    const userInputs = document.querySelectorAll('#encoded-quote input');
    const userInput = Array.from(userInputs).map(input => input.value.trim().toLowerCase()).join('');
    const originalQuote = currentQuote.quote.toLowerCase().replace(/[^a-z]/g, '');

    if (userInput === originalQuote) {
        document.getElementById('result').innerText = 'Correct! 🎉';
        correctSound.play();
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

    const inputs = document.querySelectorAll('#encoded-quote input');
    const inputIndex = Array.from(inputs).indexOf(focusedInputField);
    const originalLetters = currentQuote.quote.toUpperCase().split('');
    const letterToReveal = originalLetters[inputIndex];

    // Check if the focused input corresponds to a letter in the quote
    if (letterToReveal.match(/[A-Z]/i)) {
        focusedInputField.value = letterToReveal; // Reveal the letter
        focusedInputField.style.color = 'green'; // Color the revealed letter
        hintSound.play(); // Play hint sound
        focusedInputField.parentElement.classList.add('fade-in'); // Add animation for reveal
        hintsUsed++; // Increment hint usage
    } else {
        alert("Please focus on a letter input field.");
    }
}


document.getElementById('submit-btn').addEventListener('click', checkAnswer);
document.getElementById('new-quote-btn').addEventListener('click', displayNewQuote);
document.getElementById('hint-btn').addEventListener('click', provideHint);

window.onload = displayNewQuote;

// Show and hide instructions
document.getElementById('help-btn').addEventListener('click', () => {
    document.getElementById('instructions-popup').style.display = 'block';
});

document.getElementById('close-instructions').addEventListener('click', () => {
    document.getElementById('instructions-popup').style.display = 'none';
});

document.getElementById('hint-btn').addEventListener('click', provideHint);

document.addEventListener('focusin', (event) => {
    if (event.target.tagName === 'INPUT') {
        focusedInputField = event.target;
    }
});

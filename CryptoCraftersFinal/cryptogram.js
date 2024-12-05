// Collection of inspirational quotes and their authors
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

// Game state tracking variables
let currentQuote = {};
let currentShift;
let hintIndex = 0;
let focusedInputField = null; // Track the current input field in focus
let hintsUsed = 0; // Track the number of hints used
const maxHints = 8;
let timerInterval;
let timeLeft = 480; // Timer set for 8 minutes (480 seconds)
let elapsedSeconds = 0; // Track elapsed time
let streakCount = 0;
let lastSolveTime = null;
let isGameEnded = false;

// Session statistics tracking
let sessionScore = 0;
let puzzlesSolved = 0;
let bestSingleScore = 0;

// Game sound effects
const correctSound = new Audio('sounds/correct.mp3');
const incorrectSound = new Audio('sounds/incorrect.mp3');
const hintSound = new Audio('sounds/hint.mp3');

// Import Firebase services for database operations
import { 
    db, 
    collection, 
    getDocs,
    query,
    orderBy,
    limit,
    doc,
    getDoc,
    setDoc,
    auth,
    serverTimestamp
} from './firebase.js';

// Encode quote using Caesar cipher with specified shift
function encodeQuote(quote, shift) {
    // Encode quote by shifting each letter by the specified amount
    return quote.split('').map(char => {
        if (char.match(/[a-z]/i)) {
            let code = char.charCodeAt();
            let base = char.toLowerCase() === char ? 97 : 65;
            return String.fromCharCode(((code - base + shift) % 26) + base).toUpperCase(); // Convert to uppercase
        }
        return char; // Return punctuation as is
    }).join('');
}

// Generate and display a new random quote puzzle
function displayNewQuote() {
    // Reset game state
    currentQuote = quotes[Math.floor(Math.random() * quotes.length)];
    currentShift = Math.floor(Math.random() * 25) + 1; // Generate a fixed random shift between 1 and 25
    const encoded = encodeQuote(currentQuote.quote, currentShift); // Encode using the fixed shift

    document.getElementById('clue').innerHTML = '<strong>Quote:</strong> ' + currentQuote.author;
    document.getElementById('result').innerText = '';
    hintsUsed = 0; // Reset hints counter
    hintIndex = 0;
    
    // Reset hint button text to show full 8 hints available
    document.getElementById('hint-btn').textContent = `Hint (${maxHints})`;

    const encodedContainer = document.getElementById('encoded-quote');
    encodedContainer.innerHTML = '';

    const inputFieldsMap = {}; // Tracks input fields for each encrypted letter

    const encodedWords = encoded.split(' '); // Split encoded quote into words

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

                // Add focus and blur event listeners to track the focused input field
                input.addEventListener("focus", function() {
                    console.log('Input focused');  // Debug log
                    focusedInputField = this;
                });

                input.addEventListener("click", function() {
                    console.log('Input clicked');  // Debug log
                    focusedInputField = this;
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
    resetTimer(); // Reset and start timer for new quote
}

// Check if the user's solution is correct
async function checkAnswer() {
    // Get all letter boxes that contain inputs
    const letterBoxes = Array.from(document.querySelectorAll('.letter-box')).filter(box => box.querySelector('input'));
    const inputs = letterBoxes.map(box => box.querySelector('input'));
    
    // Get user's answer and original quote
    const userAnswer = inputs.map(input => input.value.trim().toUpperCase() || ' ').join('');
    const correctAnswer = currentQuote.quote.toUpperCase();

    // Compare answers (only letters)
    const isCorrect = userAnswer.replace(/[^A-Z]/g, '') === correctAnswer.replace(/[^A-Z]/g, '');

    if (isCorrect) {
        correctSound.play();
        streakCount++;
        elapsedSeconds = 480 - timeLeft; // Calculate elapsed time

        // Calculate score components
        const baseScore = 100;
        const timeBonus = Math.max(0, 300 - elapsedSeconds) * 0.5;
        const difficultyMultiplier = currentQuote.quote.length / 20;
        const streakBonus = Math.min(0.5, streakCount * 0.1);
        const hintPenalty = hintsUsed * 10;

        // Calculate final score
        const score = Math.max(0, (baseScore + timeBonus) * (1 + streakBonus) * difficultyMultiplier - hintPenalty);
        sessionScore += score;

        // Update the score display
        document.getElementById('score').innerText = Math.round(sessionScore);

        // Disable inputs and change color
        inputs.forEach(input => {
            input.style.color = '#090979';
            input.disabled = true;
        });

        // Format scores for display
        const formattedScore = Math.round(score);

        // Display simple success message with score
        document.getElementById('result').innerHTML = `
            <div style="text-align: center; margin: 10px auto; padding: 8px 15px; background-color: transparent; border-radius: 5px; color: #C2FFC7; font-weight: bold; max-width: 200px;">
                CORRECT!<br>
                Score: ${formattedScore}
            </div>`;

        // Update leaderboard if user is logged in
        const user = auth.currentUser;
        if (user) {
            try {
                // Get user data
                const userRef = doc(db, 'users', user.uid);
                const userDoc = await getDoc(userRef);
                const userData = userDoc.data();

                // Update leaderboard entry
                const leaderboardRef = doc(db, 'cryptogramLeaderboards', user.uid);
                
                const newEntry = {
                    name: userData.firstName || 'Anonymous',
                    score: Math.round(sessionScore),
                    lastUpdated: serverTimestamp()
                };

                await setDoc(leaderboardRef, newEntry);
                
                // Update leaderboard display
                populateLeaderboard();
            } catch (error) {
                console.error('Error updating leaderboard:', error);
            }
        }

        // Load new quote after delay
        setTimeout(() => {
            displayNewQuote();
        }, 3000);
    } else {
        incorrectSound.play();
        streakCount = 0; // Reset streak on wrong answer

        // Show simple error message
        document.getElementById('result').innerHTML = `
            <div style="text-align: center; margin: 10px auto; padding: 8px 15px; background-color: transparent; border-radius: 5px; color: #FF2929; font-weight: bold; max-width: 200px;">
                TRY AGAIN!
            </div>`;

        // Add shake animation to incorrect answers
        inputs.forEach(input => {
            input.classList.add('shake');
            setTimeout(() => input.classList.remove('shake'), 500);
        });
    }
}

// Provide a hint by revealing one correct letter
function provideHint() {
    // Check if the hint limit has been reached
    if (hintsUsed >= maxHints) {
        document.getElementById('result').innerHTML = `
            <div class="error-message" style="margin: 20px 0; padding: 15px; background-color: #ffebee; border-radius: 5px; color: #c62828;">
                <p>Hint limit reached!</p>
            </div>`;
        return;
    }

    // Ensure a field is in focus for the hint to work
    if (!focusedInputField) {
        document.getElementById('result').innerHTML = `
            <div class="info-message" style="margin: 20px 0; padding: 15px; background-color: #e3f2fd; border-radius: 5px; color: #1565c0;">
                <p>Please click an empty letter box to place the cursor, then click Hint again.</p>
            </div>`;
        return;
    }

    // Don't provide hint if the field already has a value
    if (focusedInputField.value.trim() !== "") {
        document.getElementById('result').innerHTML = `
            <div class="info-message" style="margin: 20px 0; padding: 15px; background-color: #e3f2fd; border-radius: 5px; color: #1565c0;">
                <p>Please click an empty letter box to get a hint.</p>
            </div>`;
        return;
    }

    // Get all letter boxes that contain inputs
    const letterBoxes = Array.from(document.querySelectorAll('.letter-box')).filter(box => box.querySelector('input'));
    
    // Get the encoded letter for the focused input
    const focusedLetterBox = focusedInputField.parentElement;
    const focusedEncodedLetter = focusedLetterBox.querySelector('span').textContent.toUpperCase();
    
    // Create mapping of encoded to original letters
    const letterMap = new Map();
    const originalQuote = currentQuote.quote.toUpperCase();
    const encodedQuote = encodeQuote(currentQuote.quote, currentShift).toUpperCase();
    
    // Build the mapping of encoded to original letters
    for (let i = 0; i < encodedQuote.length; i++) {
        if (/[A-Z]/.test(encodedQuote[i])) {
            letterMap.set(encodedQuote[i], originalQuote[i]);
        }
    }
    
    // Get the correct letter for the focused input
    const correctLetter = letterMap.get(focusedEncodedLetter);
    
    if (correctLetter) {
        // Reveal all matching letters across the puzzle
        letterBoxes.forEach(box => {
            const input = box.querySelector('input');
            const encodedLetter = box.querySelector('span').textContent.toUpperCase();
            
            if (encodedLetter === focusedEncodedLetter) {
                input.value = correctLetter;
                input.style.color = '#090979';
                input.classList.add('revealed');
                box.classList.add('fade-in');
                input.setAttribute('readonly', true); // Make the revealed letter readonly
            }
        });

        try {
            hintSound.play(); // Play hint sound
        } catch (error) {
            console.log('Hint sound could not be played');
        }
        
        hintsUsed++; // Increment hint usage
        
        // Update hint count display on the button
        document.getElementById('hint-btn').textContent = `Hint (${maxHints - hintsUsed})`;
    }
}

// Start the game timer countdown
function startTimer() {
    // Clear any existing interval first
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    // Display initial time immediately
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft < 0) {
            clearInterval(timerInterval);
            isGameEnded = true;
            document.getElementById('timer').innerHTML = "<strong>Timer:</strong> Time's up!";
            alert("Time's up! You can no longer enter answers.");
            revealAnswer();

            setTimeout(() => {
                isGameEnded = false;
                displayNewQuote();
            }, 10000);
        } else {
            updateTimerDisplay();
        }
    }, 1000);
}

// Update the timer display with current time
function updateTimerDisplay() {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    document.getElementById('timer').innerHTML = "<strong>Timer:</strong> " + String(minutes).padStart(2, '0') + ":" + String(seconds).padStart(2, '0');
}

// Reset the timer to initial state
function resetTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    isGameEnded = false;
    timeLeft = 480; // Reset to 10 seconds for testing
    startTimer();
}

// Event listeners
document.getElementById('submit-btn').addEventListener('click', checkAnswer);
document.getElementById('new-quote-btn').addEventListener('click', displayNewQuote);
document.getElementById('hint-btn').addEventListener('click', provideHint);

// Page load
window.onload = function () {
    displayNewQuote();
    startTimer();
};

// Function to toggle the Help popup
function toggleHelp() {
    const helpPopup = document.getElementById('instructions-popup');
    helpPopup.style.display = helpPopup.style.display === 'none' ? 'block' : 'none';
}

// Close button functionality for Help popup
document.getElementById('close-instructions').addEventListener('click', toggleHelp);

// Add event listener for the Help button
document.getElementById('help-btn').addEventListener('click', toggleHelp);

// Leaderboard functionality
const leaderboardBtn = document.querySelector('#leaderboard-btn');
const leaderboardPopup = document.querySelector('#leaderboard-popup');
const closeLeaderboardBtn = document.querySelector('#close-leaderboard-btn');

leaderboardBtn.addEventListener('click', () => {
    leaderboardPopup.style.display = 'block';
    populateLeaderboard();
});

closeLeaderboardBtn.addEventListener('click', () => {
    leaderboardPopup.style.display = 'none';
});

// Function to toggle the Leaderboard popup
function toggleLeaderboard() {
    const leaderboardPopup = document.getElementById('leaderboard');
    const isHidden = leaderboardPopup.style.display === 'none';
    leaderboardPopup.style.display = isHidden ? 'block' : 'none';
    
    if (isHidden) {
        populateLeaderboard(); // Refresh leaderboard data when showing
    }
}

// Function to populate leaderboard with real Firestore data
async function populateLeaderboard() {
    const leaderboardEntries = document.getElementById('leaderboard-entries');
    leaderboardEntries.innerHTML = '<div class="loading">Loading scores...</div>';

    try {
        // Query cryptogramLeaderboards collection
        const leaderboardRef = collection(db, 'cryptogramLeaderboards');
        const q = query(leaderboardRef, 
            orderBy('score', 'desc'), 
            limit(10)
        );
        
        const querySnapshot = await getDocs(q);
        leaderboardEntries.innerHTML = '';

        if (querySnapshot.empty) {
            leaderboardEntries.innerHTML = '<div class="no-scores">No scores available yet</div>';
            return;
        }

        // Create header
        const headerDiv = document.createElement('div');
        headerDiv.classList.add('leaderboard-header');
        headerDiv.innerHTML = `
            <span class="rank">Rank</span>
            <span class="name">Player</span>
            <span class="score">Score</span>
        `;
        leaderboardEntries.appendChild(headerDiv);

        // Add each player's score
        let rank = 1;
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const entryDiv = document.createElement('div');
            entryDiv.classList.add('leaderboard-entry');
            
            // Highlight current user's score
            if (auth.currentUser && doc.id === auth.currentUser.uid) {
                entryDiv.classList.add('current-user');
            }

            // Format score to show decimals only if they exist (up to 2 places)
            const formattedScore = Number(data.score).toFixed(2).replace(/\.?0+$/, '');

            entryDiv.innerHTML = `
                <span class="rank">${rank}</span>
                <span class="name">${data.name}</span>
                <span class="score">${formattedScore}</span>
            `;
            leaderboardEntries.appendChild(entryDiv);
            rank++;
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        leaderboardEntries.innerHTML = '<div class="error">Error loading leaderboard</div>';
    }
}

// Add event listener for the Leaderboard button
document.getElementById('leaderboard-btn').addEventListener('click', toggleLeaderboard);

function revealAnswer() {
    const letterBoxes = Array.from(document.querySelectorAll('.letter-box')).filter(box => box.querySelector('input'));
    
    // Create a mapping of encoded to decoded letters
    const letterMap = new Map();
    const originalQuote = currentQuote.quote.toUpperCase();
    const encodedQuote = encodeQuote(currentQuote.quote, currentShift);
    
    // Build the mapping of encoded to original letters
    for (let i = 0; i < encodedQuote.length; i++) {
        if (/[A-Z]/.test(encodedQuote[i])) {
            letterMap.set(encodedQuote[i], originalQuote[i]);
        }
    }
    
    // Fill in all inputs with correct letters
    letterBoxes.forEach(box => {
        const input = box.querySelector('input');
        const encodedLetter = box.querySelector('span').textContent;
        const correctLetter = letterMap.get(encodedLetter);
        
        if (correctLetter) {
            input.value = correctLetter;
            input.style.color = '#ffcc00';
            input.disabled = true;
            input.classList.add('revealed');
        }
    });

    // Create a modal container
    const modalContainer = document.createElement('div');
    modalContainer.id = 'answer-modal';
    modalContainer.style.position = 'fixed';
    modalContainer.style.top = '50%';
    modalContainer.style.left = '50%';
    modalContainer.style.transform = 'translate(-50%, -50%)';
    modalContainer.style.zIndex = '1000';
    modalContainer.style.backgroundColor = '#777775ad';
    modalContainer.style.color = '#ffffff'; // Updated text color
    modalContainer.style.padding = '20px';
    modalContainer.style.borderRadius = '8px';
    modalContainer.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    modalContainer.style.textAlign = 'center';
    modalContainer.style.width = '80%';
    modalContainer.style.maxWidth = '500px';

    // Add the revealed answer content
    modalContainer.innerHTML = `
        <h3 style="font-size: 24px; margin-bottom: 10px; color: #f5e835;">Revealed Answer</h3>
        <p style="font-size: 18px; line-height: 1.5; color: #ffffff;">
            <strong>Original Quote:</strong><br>
            "${currentQuote.quote}"<br>
            <em>- ${currentQuote.author}</em>
        </p>
        <button id="close-answer-modal" 
                style="margin-top: 15px; padding: 8px 12px; background-color: #f44336; color: #fff; border: none; border-radius: 5px; cursor: pointer;">
            Close
        </button>
    `;

    // Add close functionality
    const overlay = document.createElement('div');
    overlay.id = 'modal-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '999';

    document.body.appendChild(overlay);
    document.body.appendChild(modalContainer);

    // Add close functionality to button and overlay
    document.getElementById('close-answer-modal').addEventListener('click', () => {
        modalContainer.remove();
        overlay.remove();
    });

    overlay.addEventListener('click', () => {
        modalContainer.remove();
        overlay.remove();
    });

    // Disable the game controls
    document.getElementById('submit-btn').disabled = true;
    document.getElementById('hint-btn').disabled = true;

    // Reset game stats
    streakCount = 0;
    hintsUsed = 0;

    // Stop the timer if it's running
    clearInterval(timerInterval);
}

// Add event listener for the reveal button with correct ID
document.getElementById('reveal-answer-btn').addEventListener('click', revealAnswer);

import { auth, onAuthStateChanged } from './firebase.js';

// Check if the user is logged in
document.addEventListener('DOMContentLoaded', function() {
    onAuthStateChanged(auth, (user) => {
        if (!user) {
            // Redirect to login if not authenticated
            window.location.href = '/registerlogin.html';
        } else {
            // Show the menu if authenticated
            showMenu();
        }
    });
});

// Display the main menu
function showMenu() {
    document.querySelector('.container h1').innerText = 'Welcome to CryptoCrafters';
    document.getElementById('game-area').innerHTML = '';
    displayGameButtons(true);
}

// Toggle the visibility of game buttons
function displayGameButtons(shouldDisplay) {
    document.querySelectorAll('#cryptogram-game, #crossword-game').forEach(button => { 
        button.style.display = shouldDisplay ? 'block' : 'none'; 
    });
}

// Start the selected game
function startGame(title, startFunction) {
    document.querySelector('.container h1').innerText = title;
    displayGameButtons(false); 
    startFunction(); 
}

// Launch the Cryptogram game
function startCryptogramGame() {
    startGame('Cryptogram Game', startCryptogram); 
}

// Launch the Crossword game
function startCrosswordGame() {
    startGame('Crossword Game', startDecoding); 
}

// Highlight active navigation link
document.querySelectorAll('.nav-links li a').forEach(link => {
    link.addEventListener('click', function() {
        document.querySelectorAll('.nav-links li').forEach(item => item.classList.remove('active'));
        this.classList.add('active');
    });
});

// Game button click handlers
document.getElementById('cryptogram-game').addEventListener('click', startCryptogramGame);
document.getElementById('crossword-game').addEventListener('click', startCrosswordGame);

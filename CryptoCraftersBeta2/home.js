import { auth } from './firebase.js';
import { signOut } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';




function redirectToGame(selectedGame) {
    if (auth.currentUser) {
        if (selectedGame === 'cryptogram') {
            window.location.href = 'cryptogram.html';
        } else if (selectedGame === 'crossword') {
            window.location.href = 'crossword.html';
        }
    } else {
        window.location.href = 'login.html';
    }
}

document.getElementById('cryptogram-game').addEventListener('click', function () {
    localStorage.setItem('selectedGame', 'cryptogram');
    redirectToGame('cryptogram');
});

document.getElementById('crossword-game').addEventListener('click', function () {
    localStorage.setItem('selectedGame', 'crossword');
    redirectToGame('crossword');
});

document.addEventListener('DOMContentLoaded', function () {
    const logoutButton = document.getElementById('logout-btn');
    const goodbyeMessage = document.getElementById('goodbye-message');

    if (logoutButton) {
        logoutButton.addEventListener('click', function () {
            goodbyeMessage.classList.add('show');
            setTimeout(() => {
                signOut(auth)
                    .then(() => {
                        window.location.href = 'home.html';
                    })
                    .catch((error) => {
                        console.error('Error logging out:', error.message);
                    });
            }, 2000);
        });
    }
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
    // Redirect to login page before starting the game
    window.location.href = "login.html"; // Ensure this is the correct path to your login page
}

// Launch the Cryptogram game
function startCryptogramGame(event) {
    event.preventDefault(); // Prevent default behavior (like form submission)
    startGame('Cryptogram Game', startCryptogram); 
}

// Launch the Crossword game
function startCrosswordGame(event) {
    event.preventDefault(); // Prevent default behavior (like form submission)
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

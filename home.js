// Show main menu
function showMenu() {
    document.querySelector('.container h1').innerText = 'CryptoCrafters';
    document.getElementById('game-area').innerHTML = '';
    displayGameButtons(true);
}

// Display/hide game buttons
function displayGameButtons(shouldDisplay) {
    document.querySelectorAll('#cryptogram-game, #crossword-game').forEach(button => { 
        button.style.display = shouldDisplay ? 'block' : 'none'; 
    });
}

// Start specific game with title and function
function startGame(title, startFunction) {
    document.querySelector('.container h1').innerText = title;
    displayGameButtons(false); 
    startFunction(); 
}

// Assign start functions to specific games
function startCryptogramGame() {
    startGame('Cryptogram Game', startCryptogram); 
}

function startCrosswordGame() {
    startGame('Crossword Game', startDecoding); 
}

// Handle active state for nav links
document.querySelectorAll('.nav-links li a').forEach(link => {
    link.addEventListener('click', function() {
        // Remove active class from all links
        document.querySelectorAll('.nav-links li').forEach(item => item.classList.remove('active'));

        // Set active class on clicked link
        this.classList.add('active');
    });
});

// Show initial menu after DOM load
document.addEventListener('DOMContentLoaded', function() {
    showMenu();
});

// Event listeners for game buttons
document.getElementById('cryptogram-game').addEventListener('click', startCryptogramGame);
document.getElementById('crossword-game').addEventListener('click', startCrosswordGame);

// Initial menu display
showMenu();

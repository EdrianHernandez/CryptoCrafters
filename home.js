function showMenu() {
    document.querySelector('.container h1').innerText = 'CryptoCrafters';
    document.getElementById('game-area').innerHTML = '';
    displayGameButtons(true);
}

function displayGameButtons(shouldDisplay) {
    document.querySelectorAll('#cryptogram-game, #crossword-game').forEach(button => { 
        button.style.display = shouldDisplay ? 'block' : 'none'; 
    });
}

function startGame(title, startFunction) {
    document.querySelector('.container h1').innerText = title;
    displayGameButtons(false); 
    startFunction(); 
}

function startCryptogramGame() {
    startGame('Cryptogram Game', startCryptogram); 
}

function startCrosswordGame() {
    startGame('Crossword Game', startDecoding); 
}

document.getElementById('cryptogram-game').addEventListener('click', startCryptogramGame);
document.getElementById('crossword-game').addEventListener('click', startCrosswordGame); 

showMenu();

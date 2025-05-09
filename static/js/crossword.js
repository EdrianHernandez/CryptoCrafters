// Import Firebase services
import { 
    auth, 
    db, 
    collection, 
    doc, 
    getDoc,
    getDocs,
    query,
    orderBy,
    limit,
    setDoc,
    serverTimestamp
} from './firebase.js';

// 20x20 blank grid data (null = empty, 'B' = black cell)
const gridData = Array.from({ length: 20 }, () => Array(20).fill(null));

// Words and clues with position and orientation
const wordsAndClues = [
    { word: 'ALGORITHM', clue: 'Step-by-step problem-solving method', row: 9, col: 6, direction: 'across' },
    { word: 'DATABASE', clue: 'Organized collection of data', row: 4, col: 6, direction: 'down' },
    { word: 'ARRAY', clue: 'Collection of items in memory', row: 3, col: 3, direction: 'down' },
    { word: 'CLOUD', clue: 'Networked storage and computing service', row: 13, col: 13, direction: 'down' },
    { word: 'SECURE', clue: 'Protected from unauthorized access', row: 4, col: 13, direction: 'across' },
    { word: 'NETWORK', clue: 'Interconnected system of computers', row: 7, col: 12, direction: 'across' },
    { word: 'VARIABLE', clue: 'Named data storage in programming', row: 12, col: 7, direction: 'down' },
    { word: 'INHERIT', clue: 'Passing properties in object-oriented programming', row: 1, col: 14, direction: 'down' },
    { word: 'FUNCTION', clue: 'Block of code that performs a task', row: 5, col: 12, direction: 'down' },
    { word: 'BINARY', clue: 'Base-2 number system', row: 19, col: 0, direction: 'across' },
    { word: 'COMPILE', clue: 'Convert code into executable form', row: 6, col: 16, direction: 'down' },
    { word: 'OPERATOR', clue: 'Symbol that performs operations in code', row: 12, col: 4, direction: 'down' },
    { word: 'RECURSION', clue: 'Function that calls itself', row: 14, col: 3, direction: 'across' },
    { word: 'VIRTUAL', clue: 'Exists in software rather than physically', row: 5, col: 1, direction: 'across' },
    { word: 'ENCRYPTION', clue: 'Process of securing data', row: 6, col: 10, direction: 'down' },
    { word: 'BACKEND', clue: 'Part of an app that handles data and logic', row: 17, col: 7, direction: 'across' }
];

// Timer functionality
let timerInterval;
let totalTime = 0;

const hintSound = new Audio('sounds/hint.mp3');

function startTimer() {
    timerInterval = setInterval(() => {
        totalTime++;
        const minutes = Math.floor(totalTime / 60);
        const seconds = totalTime % 60;
        document.getElementById("timer").innerHTML = 
            `<strong>Timer:</strong> ${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }, 1000);
}

// Optional: stop and reset functions if needed
function stopTimer() {
    clearInterval(timerInterval);
}

function resetTimer() {
    clearInterval(timerInterval);
    totalTime = 0;
    document.getElementById("timer").innerHTML = "<strong>Timer:</strong> 00:00";
}

// Function to encrypt a word using a random Caesar cipher shift
function encryptWithRandomShift(word) {
    const shift = Math.floor(Math.random() * 25) + 1; // Random shift between 1 and 25
    const encryptedWord = word.split('').map(char => {
        const charCode = char.charCodeAt(0);
        // Check if character is uppercase
        if (charCode >= 65 && charCode <= 90) {
            return String.fromCharCode(((charCode - 65 + shift) % 26) + 65);
        }
        // Check if character is lowercase
        else if (charCode >= 97 && charCode <= 122) {
            return String.fromCharCode(((charCode - 97 + shift) % 26) + 97);
        }
        return char; // Non-alphabetic characters remain the same
    }).join('');
    return { encryptedWord, shift };
}

// Encrypt clues and apply styling for encrypted words in yellow bold
wordsAndClues.forEach(item => {
    const { encryptedWord, shift } = encryptWithRandomShift(item.word);
    item.clue = `<span style="color: #1f1e51; font-weight: bold;">${encryptedWord}</span> - ${item.clue}`;
});

// Function to place words in the grid
function placeWordsInGrid() {
    wordsAndClues.forEach(({ word, row, col, direction }) => {
        for (let i = 0; i < word.length; i++) {
            if (direction === 'across') {
                gridData[row][col + i] = word[i];
            } else if (direction === 'down') {
                gridData[row + i][col] = word[i];
            }
        }
    });
}

// Place words in the grid
placeWordsInGrid();

// Generate crossword grid
const crosswordGrid = document.getElementById('crossword-grid');
gridData.forEach((row, rowIndex) => {
    const tr = document.createElement('tr');
    row.forEach((cell, colIndex) => {
        const td = document.createElement('td');
        if (cell) {
            // Editable input cell for letters
            const input = document.createElement('input');
            input.className = 'white-cell';
            input.maxLength = 1;
            input.dataset.row = rowIndex;
            input.dataset.col = colIndex;
            input.value = ''; // Empty input cell

            // Ensure inputted letters are uppercase
            input.addEventListener('input', function() {
                input.value = input.value.toUpperCase();
            });

            td.appendChild(input);
        } else {
            // Black cell
            td.className = 'black-cell';
        }
        tr.appendChild(td);
    });
    crosswordGrid.appendChild(tr);
});

// Check answers only when the "Check Answer" button is clicked
function checkAnswers() {
    const inputs = document.querySelectorAll('#crossword-grid input');
    let allCorrect = true;
    let totalInputs = 0;
    let correctInputs = 0;

    inputs.forEach(input => {
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);

        const wordObj = findWordAtPosition(row, col);
        if (wordObj) {
            totalInputs++;
            const { word, startCol, startRow, direction } = wordObj;
            let index;
            if (direction === 'across') {
                index = col - startCol;
            } else {
                index = row - startRow;
            }

            const correctLetter = word[index];
            const userInput = input.value.toUpperCase();

            if (userInput === correctLetter) {
                input.style.backgroundColor = '#21f821';
                input.style.color = '#181818';
                correctInputs++;
            } else {
                input.style.backgroundColor = '#e02020';
                input.style.color = 'white';
                allCorrect = false;
            }
        }
    });

    // If all answers are correct, stop timer and update leaderboard
    if (allCorrect && totalInputs === correctInputs && totalInputs > 0) {
        stopTimer();
        const user = auth.currentUser;
        if (user) {
            updateLeaderboard(user, totalTime);
        }
        // Show success message
        alert('Congratulations! You completed the crossword!');
    }
}

// Function to update the leaderboard
async function updateLeaderboard(user, timeInSeconds) {
    try {
        // Get user data
        const userRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userRef);
        const userData = userDoc.data();

        // Create leaderboard entry
        const leaderboardRef = doc(db, 'crosswordLeaderboards', user.uid);
        const newEntry = {
            playerName: userData?.firstName || 'Anonymous',
            timeInSeconds: timeInSeconds,
            completedAt: serverTimestamp(),
            userId: user.uid
        };

        // Update leaderboard
        await setDoc(leaderboardRef, newEntry);
        
        // Refresh leaderboard display
        await populateLeaderboard();
        
        // Show leaderboard
        document.getElementById('leaderboard-popup').style.display = 'block';
    } catch (error) {
        console.error('Error updating leaderboard:', error);
        alert('Error updating leaderboard. Your score may not have been saved.');
    }
}

function clearGrid() {
    const inputs = document.querySelectorAll('#crossword-grid input');
    inputs.forEach(input => {
        input.value = '';
        input.style.backgroundColor = '';
        input.style.borderColor = '';
        input.classList.remove('correct', 'incorrect');
    });
}

// Reveal answers function, which also stops the timer
function revealAnswers() {
    const inputs = document.querySelectorAll('#crossword-grid input');

    inputs.forEach(input => {
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);
        const correctLetter = gridData[row][col];

        // Only fill the cell if there's a letter in the original data
        if (correctLetter) {
            input.value = correctLetter;
            input.style.backgroundColor = 'white';
            input.style.color = '#181818';
            hintSound.play();
        }
    });

    // Stop the timer when the answer is revealed
    stopTimer();
}

// Find the correct word based on the cell's position
function findWordAtPosition(row, col) {
    for (const { word, row: startRow, col: startCol, direction } of wordsAndClues) {
        if (direction === 'across' && row === startRow && col >= startCol && col < startCol + word.length) {
            return { word, startCol, startRow, direction };
        } else if (direction === 'down' && col === startCol && row >= startRow && row < startRow + word.length) {
            return { word, startCol, startRow, direction };
        }
    }
    return null;
}

// Display clues (across and down)
const acrossList = document.getElementById('across-list');
const downList = document.getElementById('down-list');
wordsAndClues.forEach((item, index) => {
    const listItem = document.createElement('li');
    listItem.innerHTML = `${index + 1}. ${item.clue}`;
    if (item.direction === 'across') {
        acrossList.appendChild(listItem);
    } else {
        downList.appendChild(listItem);
    }
});

// Add a cell number indicator for the first letter of each word
function addCellNumberIndicators() {
    wordsAndClues.forEach(({ word, row, col, direction }, index) => {
        const td = crosswordGrid.rows[row].cells[col];
        if (td && !td.classList.contains('black-cell')) {
            const label = document.createElement('div');
            label.className = 'crossword-grid-cell-number';
            label.textContent = (index + 1).toString();
            td.appendChild(label);
        }
    });
}

// Function to toggle the Leaderboard popup
function toggleLeaderboard() {
    const leaderboardPopup = document.getElementById('leaderboard-popup');
    if (leaderboardPopup.style.display === 'none' || !leaderboardPopup.style.display) {
        leaderboardPopup.style.display = 'block';
        populateLeaderboard(); // Populate when showing
    } else {
        leaderboardPopup.style.display = 'none';
    }
}

// Function to format time in MM:SS format
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

// Function to populate leaderboard with real Firestore data
async function populateLeaderboard() {
    const leaderboardEntries = document.getElementById('leaderboard-entries');
    try {
        // Show loading state
        leaderboardEntries.innerHTML = '<tr><td colspan="3" style="text-align: center;">Loading scores...</td></tr>';

        const leaderboardRef = collection(db, 'crosswordLeaderboards');
        const q = query(leaderboardRef, orderBy('timeInSeconds', 'asc'), limit(10));
        const querySnapshot = await getDocs(q);
        
        leaderboardEntries.innerHTML = ''; // Clear loading message
        
        let rank = 1;
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const row = document.createElement('tr');
            
            const rankCell = document.createElement('td');
            rankCell.textContent = rank;
            
            const playerCell = document.createElement('td');
            playerCell.textContent = data.playerName || 'Anonymous';
            
            const timeCell = document.createElement('td');
            timeCell.textContent = formatTime(data.timeInSeconds);
            
            row.appendChild(rankCell);
            row.appendChild(playerCell);
            row.appendChild(timeCell);
            
            leaderboardEntries.appendChild(row);
            rank++;
        });
        
        if (rank === 1) {
            // No entries found
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.colSpan = 3;
            cell.textContent = 'No scores yet. Be the first to complete the puzzle!';
            cell.style.textAlign = 'center';
            row.appendChild(cell);
            leaderboardEntries.appendChild(row);
        }
    } catch (error) {
        console.error('Error populating leaderboard:', error);
        leaderboardEntries.innerHTML = '<tr><td colspan="3" style="text-align: center; color: red;">Error loading leaderboard. Please try again later.</td></tr>';
    }
}

// Initialize all event listeners when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Game control buttons
    document.getElementById('check-answer-button').addEventListener('click', checkAnswers);
    document.getElementById('clear-grid-button').addEventListener('click', clearGrid);
    document.getElementById('reveal-answer-button').addEventListener('click', revealAnswers);
    
    // UI control buttons
    document.getElementById('help-btn').addEventListener('click', function() {
        document.getElementById('instruction-container').style.display = 'block';
    });
    
    document.getElementById('close-instruction-btn').addEventListener('click', function() {
        document.getElementById('instruction-container').style.display = 'none';
    });
    
    // Leaderboard buttons
    document.getElementById('leaderboard-btn').addEventListener('click', toggleLeaderboard);
    document.getElementById('close-leaderboard-btn').addEventListener('click', toggleLeaderboard);
    
    // Initialize grid numbers
    addCellNumberIndicators();
    
    // Start the timer
    startTimer();
});
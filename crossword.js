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

// Encrypt clues and apply styling for encrypted words in blue bold
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
document.getElementById('check-answer-button').addEventListener('click', checkAnswers);

function checkAnswers() {
    const inputs = document.querySelectorAll('#crossword-grid input');
    inputs.forEach(input => {
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);

        const wordObj = findWordAtPosition(row, col);
        if (wordObj) {
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
            } else {
                input.style.backgroundColor = '#e02020';
                input.style.color = 'white';
            }
        }
    });
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

// Function to reveal all correct answers in the grid
function revealAnswers() {
    const inputs = document.querySelectorAll('#crossword-grid input');
    
    inputs.forEach(input => {
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);
        const correctLetter = gridData[row][col];

        // Only fill the cell if there's a letter in the original data
        if (correctLetter) {
            input.value = correctLetter;
            input.style.backgroundColor = '#21f821';
                input.style.color = '#181818';
        }
    });
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

placeWordsInGrid();
addCellNumberIndicators();

// Help button functionality to show and hide the instruction container
const helpButton = document.getElementById('help-btn');
const instructionContainer = document.getElementById('instruction-container');
const closeInstructionButton = document.getElementById('close-instruction-btn');

helpButton.addEventListener('click', () => {
    instructionContainer.style.display = 'block';
});

closeInstructionButton.addEventListener('click', () => {
    instructionContainer.style.display = 'none';
});

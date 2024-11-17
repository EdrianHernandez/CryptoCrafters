// 15x15 blank grid data (null = empty, 'B' = black cell)
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
                input.style.backgroundColor = 'green';
                input.style.color = 'white';
            } else {
                input.style.backgroundColor = 'red';
                input.style.color = 'white';
            }
        }
    });
}

function clearGrid() {
    // Select all input elements within the crossword grid
    const inputs = document.querySelectorAll('#crossword-grid input');
    
    // Loop through each input element and reset their values and styles
    inputs.forEach(input => {
        input.value = ''; // Clear the value
        input.style.backgroundColor = ''; // Reset background color
        input.style.borderColor = '';
		input.style.color = ''; // Reset border color (if applicable)
        input.classList.remove('correct', 'incorrect'); // Remove any classes used to mark answers
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
    listItem.textContent = `${index + 1}. ${item.clue}`;
    if (item.direction === 'across') {
        acrossList.appendChild(listItem);
    } else {
        downList.appendChild(listItem);
    }
});

// Add a cell number indicator for the first letter of each word
function addCellNumberIndicators() {
    wordsAndClues.forEach(({ word, row, col, direction }, index) => {
        // Find the corresponding table cell (td) where the word starts
        const td = crosswordGrid.rows[row].cells[col];
        if (td && !td.classList.contains('black-cell')) {
            // Create a number label to place in the top-left corner
            const label = document.createElement('div');
            label.className = 'crossword-grid-cell-number';
            label.textContent = (index + 1).toString(); // Use clue number
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

// Show the instruction container when the help button is clicked
helpButton.addEventListener('click', () => {
    instructionContainer.style.display = 'block';  // Show the instructions
});

// Close the instruction container when the close button is clicked
closeInstructionButton.addEventListener('click', () => {
    instructionContainer.style.display = 'none';  // Hide the instructions
});

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
            input.style.backgroundColor = 'green'; // Optional styling to indicate correct answer
            input.style.color = 'white';
        }
    });
}
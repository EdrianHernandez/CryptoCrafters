import { auth, signOut } from './firebase.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js';
import { doc, getDoc, getFirestore } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';

const db = getFirestore();

// Function to update UI based on authentication state
async function updateAuthUI(user) {
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const userNameSpan = document.getElementById('user-name');

    if (!loginBtn || !logoutBtn || !userNameSpan) {
        console.error('Auth elements not found');
        return;
    }

    if (user) {
        try {
            // Get user data from Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
            if (userDoc.exists()) {
                const userData = userDoc.data();
                userNameSpan.textContent = userData.firstName;
                userNameSpan.style.display = 'inline-block';
                loginBtn.style.display = 'none';
                logoutBtn.style.display = 'inline-block';
            } else {
                console.error('User document not found in Firestore');
            }
        } catch (error) {
            console.error('Error getting user data:', error);
        }
    } else {
        userNameSpan.style.display = 'none';
        loginBtn.style.display = 'inline-block';
        logoutBtn.style.display = 'none';
    }
}

// Initialize auth state listener
onAuthStateChanged(auth, updateAuthUI);

// Handle logout
const logoutBtn = document.getElementById('logout-btn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async function() {
        try {
            const goodbyeMessage = document.getElementById('goodbye-message');
            if (goodbyeMessage) {
                goodbyeMessage.classList.add('show');
            }
            
            await signOut(auth);
            await new Promise(resolve => setTimeout(resolve, 1000));
            window.location.reload();
        } catch (error) {
            console.error('Error signing out:', error);
            alert('Error signing out: ' + error.message);
        }
    });
}

// Game selection handlers
const cryptogramButton = document.getElementById('cryptogram-game');
const crosswordButton = document.getElementById('crossword-game');

function redirectToGame(game) {
    const currentUser = auth.currentUser;
    if (currentUser) {
        // User is logged in, redirect directly to game
        window.location.href = game + '.html';
    } else {
        // User is not logged in, store game selection and redirect to login
        localStorage.setItem('selectedGame', game);
        window.location.href = 'login.html';
    }
}

if (cryptogramButton) {
    cryptogramButton.addEventListener('click', () => redirectToGame('cryptogram'));
}

if (crosswordButton) {
    crosswordButton.addEventListener('click', () => redirectToGame('crossword'));
}

document.addEventListener('DOMContentLoaded', function() {
    const loginButton = document.querySelector('.auth-buttons button:first-child');
    const logoutButton = document.getElementById('logout-btn');

    if (!loginButton || !logoutButton) {
        console.error('Auth buttons not found');
        return;
    }

    // Display the main menu
    function showMenu() {
        const titleElement = document.querySelector('.container h1');
        const gameArea = document.getElementById('game-area');
        if (titleElement) titleElement.innerText = 'Welcome to CryptoCrafters';
        if (gameArea) gameArea.innerHTML = '';
        displayGameButtons(true);
    }

    // Toggle the visibility of game buttons
    function displayGameButtons(shouldDisplay) {
        document.querySelectorAll('#cryptogram-game, #crossword-game').forEach(button => { 
            if (button) button.style.display = shouldDisplay ? 'block' : 'none'; 
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
});

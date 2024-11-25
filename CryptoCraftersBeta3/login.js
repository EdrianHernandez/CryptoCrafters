// Import necessary Firebase modules
import { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from './firebase.js';
import { doc, setDoc } from 'https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js';

// Input field animations
$('.form').find('input, textarea').on('keyup blur focus', function (e) {
    var $this = $(this),
        label = $this.prev('label');

    if (e.type === 'keyup') {
        if ($this.val() === '') {
            label.removeClass('active highlight');
        } else {
            label.addClass('active highlight');
        }
    } else if (e.type === 'blur') {
        if ($this.val() === '') {
            label.removeClass('active highlight');
        } else {
            label.removeClass('highlight');
        }
    } else if (e.type === 'focus') {
        if ($this.val() === '') {
            label.removeClass('highlight');
        } else if ($this.val() !== '') {
            label.addClass('highlight');
        }
    }
});

// Tab navigation logic
$('.tab a').on('click', function (e) {
    e.preventDefault();

    $(this).parent().addClass('active');
    $(this).parent().siblings().removeClass('active');

    const target = $(this).attr('href');
    $('.tab-content > div').not(target).hide();
    $(target).fadeIn(600);
});

// Forgot Password functionality
$('#forgot-password').on('click', async function(e) {
    e.preventDefault();
    const email = $('#login-email').val();
    
    if (!email) {
        alert('Please enter your email address first.');
        return;
    }

    try {
        await sendPasswordResetEmail(auth, email);
        alert('Password reset email sent! Please check your inbox.');
    } catch (error) {
        console.error('Error sending password reset email:', error);
        alert('Error: ' + error.message);
    }
});

// Switching Between Login and Sign-Up Forms
function switchToSignup() {
    $('#login').hide();
    $('#signup').fadeIn(600);
}

function switchToLogin() {
    $('#signup').hide();
    $('#login').fadeIn(600);
}

// Add click events to the switch links
$(document).on('click', 'a[href="#signup"]', function (e) {
    e.preventDefault();
    switchToSignup();
});

$(document).on('click', 'a[href="#login"]', function (e) {
    e.preventDefault();
    switchToLogin();
});

$(document).ready(function() {
    // Handle sign-up functionality
    $('#signup-btn').click(function () {
        const firstName = $('#first-name').val();
        const lastName = $('#last-name').val();
        const email = $('#email').val();
        const password = $('#password').val();

        // Validate inputs
        if (!firstName || !lastName || !email || !password) {
            alert('Please fill in all fields.');
            return;
        }

        // Get selected game from localStorage (if available)
        const selectedGame = localStorage.getItem('selectedGame');

        // Call Firebase Auth method
        createUserWithEmailAndPassword(auth, email, password)
            .then(async (userCredential) => {
                const user = userCredential.user;
                console.log('User registered:', user);

                // Save user data to Firestore
                await setDoc(doc(db, "users", user.uid), {
                    firstName: firstName,
                    lastName: lastName,
                    email: email
                });

                alert('Registration successful!');

                // Redirect based on game selection
                if (selectedGame === 'cryptogram') {
                    window.location.href = 'cryptogram.html';
                } else if (selectedGame === 'crossword') {
                    window.location.href = 'crossword.html';
                } else {
                    window.location.href = 'home.html';
                }

                // Clear the selected game from localStorage after redirection
                localStorage.removeItem('selectedGame');
            })
            .catch((error) => {
                console.error('Error registering user:', error);
                alert('Error during registration: ' + error.message);
            });
    });

    // Handle login functionality
    $('#login-btn').click(function () {
        const email = $('#login-email').val();
        const password = $('#login-password').val();

        // Validate inputs
        if (!email || !password) {
            alert('Please fill in all fields.');
            return;
        }

        // Get selected game from localStorage
        const selectedGame = localStorage.getItem('selectedGame');

        // Call Firebase Auth method
        signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                const user = userCredential.user;
                console.log('User logged in:', user);
                
                // Clear the selected game from localStorage
                const gameToRedirect = selectedGame;
                localStorage.removeItem('selectedGame');

                // Redirect based on game selection
                if (gameToRedirect === 'cryptogram') {
                    window.location.href = 'cryptogram.html';
                } else if (gameToRedirect === 'crossword') {
                    window.location.href = 'crossword.html';
                } else {
                    window.location.href = 'home.html';
                }
            })
            .catch((error) => {
                console.error('Login error:', error);
                alert('Login failed: ' + error.message);
            });
    });
});

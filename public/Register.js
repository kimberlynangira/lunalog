document.addEventListener('DOMContentLoaded', function() {
    // Check if redirected with clear parameter
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('clear')) {
        // Clear any existing tokens
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        // Remove the parameter from URL
        window.history.replaceState({}, document.title, 'registerpage.html');
    }
    
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
        // Add a button to allow logout instead of automatic redirect
        const container = document.querySelector('.container');
        
        if (container) {
            // Create logout message and button
            const logoutDiv = document.createElement('div');
            logoutDiv.className = 'logout-message';
            logoutDiv.innerHTML = `
                <div class="alert alert-warning" style="display: block;">
                    You are already logged in. Would you like to logout?
                </div>
                <button id="logoutBtn" class="btn btn-warning" style="margin-bottom: 20px;">Logout</button>
                <button id="dashboardBtn" class="btn" style="margin-bottom: 20px;">Go to Dashboard</button>
            `;
            
            // Insert at the beginning of the container
            container.insertBefore(logoutDiv, container.firstChild);
            
            // Add logout functionality
            document.getElementById('logoutBtn').addEventListener('click', function() {
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                window.location.reload();
            });
            
            // Add dashboard redirect
            document.getElementById('dashboardBtn').addEventListener('click', function() {
                window.location.href = 'dashboard.html';
            });
            
            // Hide the registration form
            const registerCard = document.querySelector('.register-card');
            if (registerCard) {
                registerCard.style.display = 'none';
            }
        }
        
        return;
    }

    // Set up registration form validation and submission
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegistration);

        // Add password confirmation validation
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirmPassword');

        confirmPasswordInput.addEventListener('input', function() {
            if (passwordInput.value !== confirmPasswordInput.value) {
                confirmPasswordInput.setCustomValidity('Passwords do not match');
            } else {
                confirmPasswordInput.setCustomValidity('');
            }
        });

        passwordInput.addEventListener('input', function() {
            if (confirmPasswordInput.value && passwordInput.value !== confirmPasswordInput.value) {
                confirmPasswordInput.setCustomValidity('Passwords do not match');
            } else {
                confirmPasswordInput.setCustomValidity('');
            }
        });
    }
});

function handleRegistration(event) {
    event.preventDefault();

    // Get form data
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const termsAgree = document.getElementById('termsAgree').checked;

    // Validate inputs
    if (!name || !email || !password) {
        showAlert('Please fill out all required fields.');
        return;
    }

    if (password !== confirmPassword) {
        showAlert('Passwords do not match.');
        return;
    }

    if (password.length < 8) {
        showAlert('Password must be at least 8 characters long.');
        return;
    }

    if (!termsAgree) {
        showAlert('You must agree to the Terms of Service and Privacy Policy.');
        return;
    }

    // Hide any previous alerts
    hideAlert();

    // Show loading state
    const submitButton = document.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Creating account...';

    // Send registration request to API
    fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: name,
            email: email,
            password: password
        })
    })
    .then(async response => {
        const data = await response.json().catch(() => ({}));
        
        if (!response.ok) {
            if (response.status === 409 || (data.message && data.message.includes('already exists'))) {
                throw new Error('Email address already in use. Please use a different email or login to your existing account.');
            }
            throw new Error(data.message || 'Registration failed. Please try again later.');
        }
        
        return data;
    })
    .then(data => {
        console.log('Registration successful:', data);
        
        // Do NOT save token after registration
        // We want the user to explicitly log in
        
        showAlert('Registration successful! Redirecting to login...', 'success');
        setTimeout(() => {
            window.location.href = 'loginpage.html'; // Make sure this matches your login page filename
        }, 1500);
    })
    .catch(error => {
        console.error('Registration error:', error);
        showAlert(error.message || 'Registration failed. Please try again later.');
    })
    .finally(() => {
        // Re-enable button and reset text
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    });
}

function showAlert(message, type = 'danger') {
    const alertElement = document.getElementById('registerAlert');
    if (!alertElement) return;
    
    alertElement.textContent = message;
    alertElement.style.display = 'block';
    
    // Update alert styling based on type
    alertElement.className = 'alert';
    alertElement.classList.add(`alert-${type}`);
    
    if (type === 'success') {
        alertElement.style.backgroundColor = '#d4edda';
        alertElement.style.color = '#155724';
        alertElement.style.borderColor = '#c3e6cb';
    } else if (type === 'warning') {
        alertElement.style.backgroundColor = '#fff3cd';
        alertElement.style.color = '#856404';
        alertElement.style.borderColor = '#ffeeba';
    } else {
        alertElement.style.backgroundColor = '#f8d7da';
        alertElement.style.color = '#721c24';
        alertElement.style.borderColor = '#f5c6cb';
    }
}

function hideAlert() {
    const alertElement = document.getElementById('registerAlert');
    if (alertElement) {
        alertElement.style.display = 'none';
    }
}

function isValidEmail(email) {
    // Basic email validation regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
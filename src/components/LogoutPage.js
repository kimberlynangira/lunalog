/ Add this JavaScript to handle the logout functionality
// This could be in a separate logout.js file or added to your existing JS file

document.addEventListener('DOMContentLoaded', function() {
  const logoutBtn = document.getElementById('logoutBtn');
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      // Clear localStorage token
      localStorage.removeItem('token');
      
      // Clear any other user-related data you might be storing
      localStorage.removeItem('userData');
      
      // Redirect to login page
      window.location.href = '/login.html';
      
      // You might also want to call your backend logout endpoint if needed
      // fetch('/api/logout', {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${token}`,
      //     'Content-Type': 'application/json'
      //   }
      // });
    });
  }
});
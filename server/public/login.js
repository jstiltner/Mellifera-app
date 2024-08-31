const { redirect } = require('react-router-dom');

document.getElementById('google-login').addEventListener('click', () => {
  window.location.href = '/auth/google';
});

document.getElementById('facebook-login').addEventListener('click', () => {
  window.location.href = '/auth/facebook';
});

document.getElementById('github-login').addEventListener('click', () => {
  window.location.href = '/auth/github';
});

document.getElementById('direct-login-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        window.location.href = '/';
      } else {
        alert('Login failed');
      }
    })
    .catch((error) => console.error('Error:', error));
});

document.getElementById('register').addEventListener('click', (event) => {
  event.preventDefault();
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  fetch('/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.success) {
        window.location.href = '/';
      } else {
        alert('Registration failed');
      }
    })
    .then(redirect('/dashboard'))
    .catch((error) => console.error('Error:', error));
});

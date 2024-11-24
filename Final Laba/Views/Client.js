const authUrl = 'http://localhost:3000/api';
const apiUrl = 'http://localhost:3000/api/posts';
const authContainer = document.getElementById('auth');
const appContainer = document.getElementById('app');
const authForm = document.getElementById('authForm');
const registerForm = document.getElementById('registerForm');

function showRegister() {
    authForm.style.display = 'none';
    registerForm.style.display = 'block';
}

function showLogin() {
    authForm.style.display = 'block';
    registerForm.style.display = 'none';
}

function checkAuth() {
    const token = localStorage.getItem('token');
    if (token) {
        appContainer.style.display = 'block';
        authContainer.style.display = 'none';
        fetchPosts();
    } else {
        appContainer.style.display = 'none';
        authContainer.style.display = 'block';
    }
}

async function register() {
    const username = document.getElementById('regUsername').value;
    const password = document.getElementById('regPassword').value;
    const email = document.getElementById('regEmail').value;

    const response = await fetch(`${authUrl}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, email }),
    });

    if (response.ok) {
        alert('Registration successful! Please log in.');
        showLogin();
    } else {
        const error = await response.json();
        alert(error.message || 'Registration failed');
    }
}

async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch(`${authUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
        const { token } = await response.json();
        localStorage.setItem('token', token);
        checkAuth();
    } else {
        alert('Invalid username or password');
    }
}

function logout() {
    localStorage.removeItem('token');
    checkAuth();
}

async function fetchPosts() {
    const response = await fetchWithAuth(apiUrl);
    if (response.ok) {
        const posts = await response.json();
        const postsContainer = document.getElementById('posts');
        postsContainer.innerHTML = posts.map(post => `
            <li>
                <h3>${post.title}</h3>
                <p>${post.description}</p>
                <p><strong>Author:</strong> ${post.author}</p>
                <button onclick="editPost('${post.id}')">Edit</button>  
                <button onclick="deletePost('${post.id}')">Delete</button>  
            </li>
        `).join('');
    } else if (response.status === 401) {
        logout();
    }
}

async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');
    const headers = { ...options.headers, Authorization: `Bearer ${token}` };
    return fetch(url, { ...options, headers });
}

document.addEventListener('DOMContentLoaded', checkAuth);

postForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('postId').value;
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const author = document.getElementById('author').value;

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${apiUrl}/${id}` : apiUrl;

    await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, author })
    });

    postForm.reset();
    fetchPosts();
});

async function editPost(id) {
    const response = await fetch(`${apiUrl}/${id}`);
    const post = await response.json();

    document.getElementById('postId').value = post.id;
    document.getElementById('title').value = post.title;
    document.getElementById('description').value = post.description;
    document.getElementById('author').value = post.author;
}

async function deletePost(id) {
    await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
    fetchPosts();
}

fetchPosts();

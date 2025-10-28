const API_BASE = "http://127.0.0.1:8000/api";

// ---------- SIGNUP ----------
async function handleSignup(event) {
  event.preventDefault();

  const username = document.getElementById("signup-username").value.trim();
  const password = document.getElementById("signup-password").value.trim();
  const messageEl = document.getElementById("signup-message");

  messageEl.textContent = "Signing...";
  messageEl.style.color = "orange";

  if (!username || !password) {
    messageEl.textContent = "Username and password required.";
    messageEl.style.color = "red";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      messageEl.textContent = data.detail || "Signup failed!";
      messageEl.style.color = "red";
      return;
    }

    messageEl.textContent = "Signup successful! 🎉";
    messageEl.style.color = "green";
    document.getElementById("signup-form").reset();
  } catch (err) {
    console.error(err);
    messageEl.textContent = "Server error.";
    messageEl.style.color = "red";
  }
}

// ---------- LOGIN ----------
async function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value.trim();
  const messageEl = document.getElementById("login-message");

  messageEl.textContent = "Logging in...";
  messageEl.style.color = "orange";

  if (!username || !password) {
    messageEl.textContent = "Username and password required.";
    messageEl.style.color = "red";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      messageEl.textContent = data.detail || "Login failed!";
      messageEl.style.color = "red";
      return;
    }

    messageEl.textContent = `Welcome, ${data.user.username}! ✅`;
    messageEl.style.color = "green";

    // store token if backend returns it
    if (data.access_token) {
      localStorage.setItem("token", data.access_token);
    }
  } catch (err) {
    console.error(err);
    messageEl.textContent = "Server error.";
    messageEl.style.color = "red";
  }
}

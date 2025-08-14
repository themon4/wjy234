// --- Admins list ---
const ADMINS = [
  "TheChosenOne",
  "TheTanertantan",
  "thegramcracker",
  "TheUnc"
];

// --- One-time username popup and user tracking ---
let username = localStorage.getItem("interstellar_username");
if (!username) {
  username = prompt("Enter your username (one-time):");
  if (!username || !username.trim()) {
    username = "guest";
  }
  localStorage.setItem("interstellar_username", username.trim());
}
username = username.trim();

// Track all users who have entered their name
function getAllUsers() {
  let users = JSON.parse(localStorage.getItem("interstellar_all_users") || "[]");
  if (!users.includes(username)) {
    users.push(username);
    localStorage.setItem("interstellar_all_users", JSON.stringify(users));
  }
  return users;
}
getAllUsers();

// --- Blocked logic with custom message ---
function getBlockedUsers() {
  return JSON.parse(localStorage.getItem("interstellar_blocked_users") || "[]");
}
function setBlockedUsers(list) {
  localStorage.setItem("interstellar_blocked_users", JSON.stringify(list));
}
function isBlocked(username) {
  return getBlockedUsers().includes(username);
}
function blockUser(username, message) {
  const list = getBlockedUsers();
  if (!list.includes(username)) {
    list.push(username);
    setBlockedUsers(list);
  }
  if (message) {
    setBlockMessage(username, message);
  }
}
function unblockUser(username) {
  let list = getBlockedUsers();
  list = list.filter(u => u !== username);
  setBlockedUsers(list);
  removeBlockMessage(username);
}
function setBlockMessage(username, message) {
  let messages = JSON.parse(localStorage.getItem("interstellar_blocked_messages") || "{}");
  messages[username] = message;
  localStorage.setItem("interstellar_blocked_messages", JSON.stringify(messages));
}
function getBlockMessage(username) {
  let messages = JSON.parse(localStorage.getItem("interstellar_blocked_messages") || "{}");
  return messages[username] || "Access denied.";
}
function removeBlockMessage(username) {
  let messages = JSON.parse(localStorage.getItem("interstellar_blocked_messages") || "{}");
  delete messages[username];
  localStorage.setItem("interstellar_blocked_messages", JSON.stringify(messages));
}

// --- White screen for blocked users ---
if (isBlocked(username)) {
  document.body.innerHTML = ""; // Remove all content
  document.body.style.background = "#fff";
  const msg = document.createElement("div");
  msg.id = "blocked-message";
  msg.innerHTML = `<h2>You have been blocked.</h2><p id="blocked-custom-message">${getBlockMessage(username)}</p>`;
  document.body.appendChild(msg);
  msg.style.display = "block";
  throw new Error("Blocked"); // Stop further JS
}

// --- Admin Dot and Panel (visible to all, but only loads for admins) ---
document.getElementById('admin-dot').onclick = function() {
  const adminName = prompt("Enter admin name to verify:");
  if (ADMINS.includes(adminName)) {
    document.getElementById('admin-panel').style.display = 'block';
    document.getElementById('admin-name').textContent = adminName;
    document.getElementById('open-chosenone').style.display = 'block';
    document.getElementById('close-admin-panel').onclick = function() {
      document.getElementById('admin-panel').style.display = 'none';
    };
    // User management panel logic (for all admins)
    document.getElementById('open-chosenone').onclick = function() {
      document.getElementById('chosenone-panel').style.display = 'block';
      renderUserList();
    };
    document.getElementById('close-chosenone-panel').onclick = function() {
      document.getElementById('chosenone-panel').style.display = 'none';
    };
    document.getElementById('incorrect-admin').style.display = 'none';
  } else {
    document.getElementById('incorrect-admin').style.display = 'block';
    setTimeout(() => {
      document.getElementById('incorrect-admin').style.display = 'none';
    }, 2000);
  }
};

// --- Render user list for blocking/unblocking and messaging ---
function renderUserList() {
  const users = JSON.parse(localStorage.getItem("interstellar_all_users") || "[]");
  const blocked = getBlockedUsers();
  const messages = JSON.parse(localStorage.getItem("interstellar_blocked_messages") || "{}");
  const userListDiv = document.getElementById('user-list');
  userListDiv.innerHTML = "";
  if (!users.length) {
    userListDiv.innerHTML = "<p>No users found.</p>";
    return;
  }
  users.forEach(user => {
    const row = document.createElement("div");
    row.className = "user-row";
    row.innerHTML = `
      <span class="username">${user}</span>
      <input type="text" placeholder="Block message" value="${messages[user] ? messages[user] : ""}" id="msg-${user}">
      <button class="block" ${blocked.includes(user) ? 'style="display:none;"' : ''}>Block</button>
      <button class="unblock" ${blocked.includes(user) ? '' : 'style="display:none;"'}>Unblock</button>
    `;
    // Block button
    row.querySelector(".block").onclick = () => {
      const msg = row.querySelector(`#msg-${user}`).value || "Access denied.";
      blockUser(user, msg);
      renderUserList();
    };
    // Unblock button
    row.querySelector(".unblock").onclick = () => {
      unblockUser(user);
      renderUserList();
    };
    userListDiv.appendChild(row);
  });
}

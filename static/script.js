// --- Admins list ---
const ADMINS = [
  "TheChosenOne",
  "TheTanertantan",
  "thegramcracker",
  "TheUnc"
];

// --- Name prompt overlay logic ---
function showNameOverlay() {
  document.getElementById("name-overlay").style.display = "flex";
  document.getElementById("user-name-input").focus();
}
function hideNameOverlay() {
  document.getElementById("name-overlay").style.display = "none";
}
function getAllUsers() {
  return JSON.parse(localStorage.getItem("admin_all_users") || "[]");
}
function addUser(name) {
  let users = getAllUsers();
  if (!users.includes(name)) {
    users.push(name);
    localStorage.setItem("admin_all_users", JSON.stringify(users));
  }
}
function getUserName() {
  return localStorage.getItem("admin_username");
}
function setUserName(name) {
  localStorage.setItem("admin_username", name);
  addUser(name);
}

// --- Blocked logic with custom message ---
function getBlockedUsers() {
  return JSON.parse(localStorage.getItem("admin_blocked_users") || "[]");
}
function setBlockedUsers(list) {
  localStorage.setItem("admin_blocked_users", JSON.stringify(list));
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
  if (message) setBlockMessage(username, message);
}
function unblockUser(username) {
  let list = getBlockedUsers();
  list = list.filter(u => u !== username);
  setBlockedUsers(list);
  removeBlockMessage(username);
}
function setBlockMessage(username, message) {
  let messages = JSON.parse(localStorage.getItem("admin_blocked_messages") || "{}");
  messages[username] = message;
  localStorage.setItem("admin_blocked_messages", JSON.stringify(messages));
}
function getBlockMessage(username) {
  let messages = JSON.parse(localStorage.getItem("admin_blocked_messages") || "{}");
  return messages[username] || "Access denied.";
}
function removeBlockMessage(username) {
  let messages = JSON.parse(localStorage.getItem("admin_blocked_messages") || "{}");
  delete messages[username];
  localStorage.setItem("admin_blocked_messages", JSON.stringify(messages));
}

// --- Message logic ---
function setTrollMessage(username, message) {
  let trolls = JSON.parse(localStorage.getItem("admin_troll_messages") || "{}");
  trolls[username] = message;
  localStorage.setItem("admin_troll_messages", JSON.stringify(trolls));
}
function getTrollMessage(username) {
  let trolls = JSON.parse(localStorage.getItem("admin_troll_messages") || "{}");
  return trolls[username];
}
function removeTrollMessage(username) {
  let trolls = JSON.parse(localStorage.getItem("admin_troll_messages") || "{}");
  delete trolls[username];
  localStorage.setItem("admin_troll_messages", JSON.stringify(trolls));
}

// --- Show overlays if needed ---
function checkBlocked() {
  const username = getUserName();
  if (username && isBlocked(username)) {
    document.getElementById("blocked-message").textContent = getBlockMessage(username);
    document.getElementById("blocked-overlay").style.display = "flex";
    document.body.style.overflow = "hidden";
    throw new Error("Blocked");
  }
}
function checkTroll() {
  const username = getUserName();
  const msg = getTrollMessage(username);
  if (msg) {
    alert(msg);
    removeTrollMessage(username);
  }
}

// --- On page load ---
window.addEventListener("DOMContentLoaded", function () {
  // Name prompt
  let username = getUserName();
  if (!username) {
    showNameOverlay();
  } else {
    addUser(username);
    checkBlocked();
    checkTroll();
  }

  // Name overlay confirm
  document.getElementById("user-name-confirm").onclick = function () {
    const name = document.getElementById("user-name-input").value.trim();
    if (!name) return alert("Please enter your name.");
    setUserName(name);
    hideNameOverlay();
    checkBlocked();
    checkTroll();
  };
  document.getElementById("user-name-input").addEventListener("keydown", function (e) {
    if (e.key === "Enter") document.getElementById("user-name-confirm").click();
  });

  // Admin dot click
  document.getElementById("admin-dot").onclick = function () {
    document.getElementById("admin-verify").style.display = "flex";
    document.getElementById("admin-name-input").focus();
    document.getElementById("admin-verify-log").textContent = "";
  };

  // Admin verify
  document.getElementById("admin-verify-btn").onclick = function () {
    const adminName = document.getElementById("admin-name-input").value.trim();
    if (ADMINS.includes(adminName)) {
      document.getElementById("admin-verify").style.display = "none";
      openAdminPanel(adminName);
    } else {
      document.getElementById("admin-verify-log").textContent = "Incorrect admin name.";
    }
  };
  document.getElementById("admin-name-input").addEventListener("keydown", function (e) {
    if (e.key === "Enter") document.getElementById("admin-verify-btn").click();
  });
  document.getElementById("close-admin-verify").onclick = function () {
    document.getElementById("admin-verify").style.display = "none";
  };

  // Admin panel close
  document.getElementById("close-admin-btn").onclick = function () {
    document.getElementById("admin-panel").style.display = "none";
  };
});

// --- Admin Panel Logic ---
function openAdminPanel(adminName) {
  document.getElementById("admin-panel").style.display = "flex";
  renderAdminUsersList(adminName);

  // Send message
  document.getElementById("send-troll-btn").onclick = function () {
    const user = document.getElementById("troll-user-input").value.trim();
    const msg = document.getElementById("troll-message-input").value.trim();
    if (!user || !msg) return alert("Enter a user and a message.");
    setTrollMessage(user, msg);
    document.getElementById("admin-panel-log").textContent = `Message sent to ${user}.`;
    setTimeout(() => document.getElementById("admin-panel-log").textContent = "", 2000);
  };
}

// --- Render users for block/unblock ---
function renderAdminUsersList(adminName) {
  const users = getAllUsers();
  const blocked = getBlockedUsers();
  const messages = JSON.parse(localStorage.getItem("admin_blocked_messages") || "{}");
  const listDiv = document.getElementById("admin-users-list");
  listDiv.innerHTML = "";
  if (!users.length) {
    listDiv.innerHTML = "<p>No users found.</p>";
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
      renderAdminUsersList(adminName);
    };
    // Unblock button
    row.querySelector(".unblock").onclick = () => {
      unblockUser(user);
      renderAdminUsersList(adminName);
    };
    listDiv.appendChild(row);
  });
}

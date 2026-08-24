// Frontend logic: keeps the conversation and talks to the backend

const thread = document.getElementById("thread");
const input = document.getElementById("input");
const sendBtn = document.getElementById("send");
const dot = document.getElementById("dot");
const modelEl = document.getElementById("model");
const empty = document.getElementById("empty");

// The whole conversation is stored here and sent with every request
const messages = [];

async function loadHealth() {
  try {
    const res = await fetch("/health");
    const data = await res.json();
    modelEl.textContent = data.model;
    dot.dataset.state = "ready";
  } catch {
    modelEl.textContent = "offline";
    dot.dataset.state = "error";
  }
}

function addMessage(role, text) {
  empty.style.display = "none";
  const el = document.createElement("div");
  el.className = "msg msg--" + role;
  el.textContent = text;
  thread.appendChild(el);
  thread.scrollTop = thread.scrollHeight;
}

async function send() {
  const text = input.value.trim();
  if (!text) return;

  addMessage("user", text);
  messages.push({ role: "user", content: text });
  input.value = "";

  sendBtn.disabled = true;
  dot.dataset.state = "busy";

  try {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: messages }),
    });
    const data = await res.json();

    if (!res.ok) {
      addMessage("error", data.detail || "Request failed.");
      dot.dataset.state = "error";
    } else {
      addMessage("bot", data.reply);
      messages.push({ role: "assistant", content: data.reply });
      dot.dataset.state = "ready";
    }
  } catch {
    addMessage("error", "Network error. Is the server running?");
    dot.dataset.state = "error";
  }

  sendBtn.disabled = false;
  input.focus();
}

// Enter sends the message, Shift+Enter adds a new line
input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    send();
  }
});

sendBtn.addEventListener("click", send);
loadHealth();